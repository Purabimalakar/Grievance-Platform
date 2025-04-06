import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Upload, Loader2, PlusCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { detectPriority, getDetectedKeywords } from "@/utils/keywordDetection";
import { ref, push, serverTimestamp } from "firebase/database";
import { rtdb } from "@/config/firebase";

const SubmitGrievance: React.FC = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviewUrls, setFilePreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detectedKeywords, setDetectedKeywords] = useState<string[]>([]);
  const [priority, setPriority] = useState<"normal" | "high" | "urgent">("normal");
  const [creditsRequested, setCreditsRequested] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  
  const { user, isAuthenticated, isLoading, updateUserCredits } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Analyze the text whenever title or description changes
    const combinedText = `${title} ${description}`;
    const detectedPriority = detectPriority(combinedText);
    const keywords = getDetectedKeywords(combinedText);
    
    setPriority(detectedPriority);
    setDetectedKeywords(keywords);
  }, [title, description]);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;
    
    const newFiles = Array.from(selectedFiles);
    
    // Validate file size (limit to 5MB)
    const invalidFiles = newFiles.filter(file => file.size > 5 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      toast({
        title: "File Size Limit Exceeded",
        description: "One or more files exceed the 5MB size limit.",
        variant: "destructive",
      });
      return;
    }
    
    setFiles(prev => [...prev, ...newFiles]);
    
    // Create preview URLs for images
    newFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreviewUrls(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      } else {
        // For non-image files, just add a placeholder
        setFilePreviewUrls(prev => [...prev, 'file']);
      }
    });
  };
  
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setFilePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };
  
  const uploadToCloudinary = async (file: File): Promise<string> => {
    // Create form data for Cloudinary upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'grievance_uploads'); // You'll need to create this preset in Cloudinary dashboard
    
    try {
      setUploadingFile(true);
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dkf25yvzj/auto/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to upload file');
      }
      
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    } finally {
      setUploadingFile(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to submit a grievance.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    
    if (user.grievanceCredits <= 0) {
      toast({
        title: "No Submission Credits",
        description: "You have no grievance submission credits left. Please request more or wait for the automatic credit update.",
        variant: "destructive",
      });
      return;
    }
    
    if (!title.trim() || !description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both a title and description for your grievance.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Upload all files to Cloudinary and collect their URLs
      const attachmentUrls: string[] = [];
      
      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const fileUrl = await uploadToCloudinary(files[i]);
          attachmentUrls.push(fileUrl);
        }
      }
      
      // Create new grievance in Firebase Realtime Database
      const grievancesRef = ref(rtdb, 'grievances');
      const newGrievanceRef = push(grievancesRef);
      
      const grievanceData = {
        userId: user.id,
        title,
        description,
        date: new Date().toISOString(),
        status: "pending",
        priority,
        attachments: attachmentUrls.length > 0 ? attachmentUrls : null,
        createdAt: serverTimestamp(),
      };
      
      await push(grievancesRef, grievanceData);
      
      // Update the user's credits
      updateUserCredits(user.grievanceCredits - 1);
      
      toast({
        title: "Grievance Submitted Successfully",
        description: "Your grievance has been submitted and will be reviewed soon.",
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Error submitting grievance:", error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit your grievance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const requestMoreCredits = async () => {
    if (!user || creditsRequested) return;
    
    try {
      // Push a credit request to Firebase
      const creditRequestsRef = ref(rtdb, 'creditRequests');
      await push(creditRequestsRef, {
        userId: user.id,
        userName: user.name,
        currentCredits: user.grievanceCredits,
        requestDate: new Date().toISOString(),
        status: "pending"
      });
      
      setCreditsRequested(true);
      
      toast({
        title: "Credit Request Submitted",
        description: "Your request for additional submission credits has been sent to the administrators.",
      });
    } catch (error) {
      toast({
        title: "Request Failed",
        description: "Failed to request more credits. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Submit a Grievance</h1>
          <p className="text-gray-600 mb-6">
            Fill in the details of your grievance below. Be as specific as possible.
          </p>
          
          {/* Credits Info */}
          <Card className="mb-6">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-50 p-2 rounded-full">
                  <PlusCircle className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Submission Credits</p>
                  <p className="text-xl font-bold">{user?.grievanceCredits} / 3</p>
                </div>
              </div>
              
              {user?.grievanceCredits === 0 && (
                <Button 
                  variant="outline" 
                  onClick={requestMoreCredits}
                  disabled={creditsRequested}
                >
                  {creditsRequested ? "Request Sent" : "Request More Credits"}
                </Button>
              )}
            </CardContent>
          </Card>
          
          {/* Priority Warning */}
          {priority !== "normal" && detectedKeywords.length > 0 && (
            <div className="mb-6">
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="p-4 flex items-start space-x-4">
                  <div className="pt-1">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-amber-800">
                      {priority === "urgent" ? "Urgent Priority Detected" : "High Priority Detected"}
                    </h3>
                    <p className="text-sm text-amber-600">
                      Your grievance contains keywords that indicate it may be {priority === "urgent" ? "urgent" : "high priority"}.
                      {detectedKeywords.length > 0 && ` Detected terms: ${detectedKeywords.join(", ")}.`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Submission Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter a clear title for your grievance"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={100}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your grievance in detail. Include all relevant information."
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="resize-y"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="files">Attachments (Optional)</Label>
              <div className="flex items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("file-upload")?.click()}
                  className="flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Files</span>
                </Button>
                <Input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  className="hidden"
                />
                {files.length > 0 && !uploadingFile && (
                  <p className="ml-4 text-sm text-gray-500">
                    {files.length} file(s) selected
                  </p>
                )}
                {uploadingFile && (
                  <div className="ml-4 flex items-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span className="text-sm text-gray-500">Uploading...</span>
                  </div>
                )}
              </div>
              
              {filePreviewUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {filePreviewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      {url === 'file' ? (
                        <div className="w-full h-24 bg-gray-100 rounded-md flex items-center justify-center">
                          <span className="text-sm text-gray-500">
                            {files[index].name.slice(0, 15)}
                            {files[index].name.length > 15 ? '...' : ''}
                          </span>
                        </div>
                      ) : (
                        <img 
                          src={url} 
                          alt={`Preview ${index}`} 
                          className="w-full h-24 object-cover rounded-md"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute top-1 right-1 bg-gray-900/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting || user?.grievanceCredits === 0 || uploadingFile} 
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Grievance"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitGrievance;