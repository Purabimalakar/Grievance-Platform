import React, { useState, useEffect } from "react";
import { Navigate, useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Search, ArrowLeft, Loader2, RefreshCw, MessageSquare, FileText, Image } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import { ref, get, child, push, update, serverTimestamp } from "firebase/database";
import { rtdb } from "@/config/firebase";

interface Grievance {
  id: string;
  userId: string;
  title: string;
  description: string;
  date: string;
  status: "pending" | "acknowledged" | "in-progress" | "resolved" | "rejected";
  priority: "normal" | "high" | "urgent";
  timeline: {
    date: string;
    status: string;
    description: string;
  }[];
  department?: string;
  assignedTo?: string;
  expectedResolution?: string;
  attachments?: string[] | null;
}

const TrackGrievance: React.FC = () => {
  const [trackingId, setTrackingId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [grievance, setGrievance] = useState<Grievance | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isResubmitting, setIsResubmitting] = useState(false);
  
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const params = useParams<{ id?: string }>();
  
  useEffect(() => {
    // If an ID is provided in the URL, fetch that grievance
    if (params.id) {
      handleSearch(params.id);
    }
  }, [params.id]);
  
  const handleSearch = async (id: string = trackingId) => {
    if (!id) {
      toast({
        title: "Tracking ID Required",
        description: "Please enter a grievance tracking ID.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSearching(true);
    
    try {
      // Get all grievances from Firebase and find the one with matching ID
      const dbRef = ref(rtdb);
      const snapshot = await get(child(dbRef, 'grievances'));
      
      if (snapshot.exists()) {
        let foundGrievance: Grievance | null = null;
        
        snapshot.forEach((childSnapshot) => {
          const data = childSnapshot.val();
          if (childSnapshot.key === id || data.id === id) {
            // Ensure attachments are properly processed
            let processedAttachments = null;
            if (data.attachments) {
              // If attachments is an array, use it directly
              if (Array.isArray(data.attachments)) {
                processedAttachments = data.attachments;
              } 
              // If attachments is an object (Firebase sometimes converts arrays to objects)
              else if (typeof data.attachments === 'object') {
                processedAttachments = Object.values(data.attachments);
              }
            }
            
            foundGrievance = {
              id: childSnapshot.key || data.id,
              userId: data.userId,
              title: data.title,
              description: data.description,
              date: data.date,
              status: data.status || "pending",
              priority: data.priority || "normal",
              department: data.department,
              assignedTo: data.assignedTo,
              expectedResolution: data.expectedResolution,
              attachments: processedAttachments,
              timeline: data.timeline || [
                {
                  date: new Date(data.date).toLocaleString(),
                  status: "submitted",
                  description: "Grievance submitted successfully."
                }
              ]
            };
          }
        });
        
        if (foundGrievance) {
          setGrievance(foundGrievance);
        } else {
          toast({
            title: "Grievance Not Found",
            description: "No grievance found with the provided ID.",
            variant: "destructive",
          });
          setGrievance(null);
        }
      } else {
        toast({
          title: "No Grievances",
          description: "No grievances exist in the system.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching grievance:", error);
      toast({
        title: "Search Failed",
        description: "Failed to search for the grievance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim() || !grievance) {
      toast({
        title: "Comment Required",
        description: "Please enter a comment.",
        variant: "destructive",
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to add a comment.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmittingComment(true);
    
    try {
      const now = new Date();
      const formattedDate = now.toLocaleString();
      
      let newTimeline = [];
      
      // Handle case where timeline might be an object in Firebase
      if (grievance.timeline) {
        if (Array.isArray(grievance.timeline)) {
          newTimeline = [...grievance.timeline];
        } else if (typeof grievance.timeline === 'object') {
          newTimeline = Object.values(grievance.timeline);
        }
      }
      
      newTimeline.push({
        date: formattedDate,
        status: "comment",
        description: `${user.name || "User"}: ${comment}`
      });
      
      // Update the grievance in Firebase
      const grievanceRef = ref(rtdb, `grievances/${grievance.id}`);
      await update(grievanceRef, {
        timeline: newTimeline,
        lastUpdated: serverTimestamp()
      });
      
      toast({
        title: "Comment Added",
        description: "Your comment has been added successfully.",
      });
      
      // Reset the comment field
      setComment("");
      
      // Update local state
      setGrievance({
        ...grievance,
        timeline: newTimeline
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Comment Failed",
        description: "Failed to add your comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };
  
  const handleResubmit = async () => {
    if (!grievance || !user) return;
    
    setIsResubmitting(true);
    
    try {
      const now = new Date();
      const formattedDate = now.toLocaleString();
      
      let newTimeline = [];
      
      // Handle case where timeline might be an object in Firebase
      if (grievance.timeline) {
        if (Array.isArray(grievance.timeline)) {
          newTimeline = [...grievance.timeline];
        } else if (typeof grievance.timeline === 'object') {
          newTimeline = Object.values(grievance.timeline);
        }
      }
      
      newTimeline.push({
        date: formattedDate,
        status: "resubmitted",
        description: "Grievance resubmitted for urgent attention."
      });
      
      // Update the grievance priority and timeline in Firebase
      const grievanceRef = ref(rtdb, `grievances/${grievance.id}`);
      await update(grievanceRef, {
        priority: "urgent",
        timeline: newTimeline,
        lastUpdated: serverTimestamp()
      });
      
      // Create a notification for admins
      const notificationsRef = ref(rtdb, 'notifications');
      await push(notificationsRef, {
        type: "grievance_resubmitted",
        grievanceId: grievance.id,
        userId: user.id,
        userName: user.name,
        title: grievance.title,
        timestamp: serverTimestamp()
      });
      
      toast({
        title: "Grievance Resubmitted",
        description: "Your grievance has been resubmitted for urgent attention.",
      });
      
      // Update local state
      setGrievance({
        ...grievance,
        priority: "urgent",
        timeline: newTimeline
      });
    } catch (error) {
      console.error("Error resubmitting grievance:", error);
      toast({
        title: "Resubmission Failed",
        description: "Failed to resubmit your grievance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResubmitting(false);
    }
  };
  
  const isImageUrl = (url: string): boolean => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    return imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
  };
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center mb-6">
            {grievance && (
              <Link to="/dashboard" className="mr-4">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {grievance ? `Grievance #${grievance.id}` : "Track Your Grievance"}
              </h1>
              <p className="text-gray-600">
                {grievance 
                  ? "View the current status and updates for your grievance" 
                  : "Enter your grievance tracking ID to see the current status"}
              </p>
            </div>
          </div>
          
          {!grievance && (
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="tracking-id" className="mb-2 block">Tracking ID</Label>
                    <Input
                      id="tracking-id"
                      placeholder="Enter your grievance ID"
                      value={trackingId}
                      onChange={(e) => setTrackingId(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={() => handleSearch()}
                    disabled={isSearching || !trackingId}
                    className="mt-8 sm:mt-0"
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Track
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="mt-4 text-sm text-gray-600">
                  <p>
                    Enter the tracking ID that was provided when you submitted your grievance.
                    If you don't have a tracking ID, please check your dashboard or contact support.
                  </p>
                </div>
                
                <div className="mt-6 text-center border-t border-gray-200 pt-6">
                  <p className="text-gray-600 mb-4">
                    Need to submit a new grievance?
                  </p>
                  <Link to="/submit-grievance">
                    <Button variant="outline">Submit a Grievance</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
          
          {grievance && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                    <div className="flex space-x-2">
                      <StatusBadge status={grievance.status} />
                      <PriorityBadge priority={grievance.priority} />
                    </div>
                    <div className="text-sm text-gray-500">
                      Submitted on {new Date(grievance.date).toLocaleDateString()}
                    </div>
                  </div>
                  <CardTitle>{grievance.title}</CardTitle>
                  <CardDescription className="text-base text-gray-700 mt-2">
                    {grievance.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {grievance.department && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Department</h3>
                        <p className="text-gray-900">{grievance.department}</p>
                      </div>
                    )}
                    
                    {grievance.assignedTo && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Assigned To</h3>
                        <p className="text-gray-900">{grievance.assignedTo}</p>
                      </div>
                    )}
                    
                    {grievance.expectedResolution && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Expected Resolution</h3>
                        <p className="text-gray-900">{grievance.expectedResolution}</p>
                      </div>
                    )}
                    
                    {grievance.status !== "resolved" && grievance.priority !== "urgent" && isAuthenticated && user?.id === grievance.userId && (
                      <div>
                        <Button 
                          variant="outline" 
                          onClick={handleResubmit}
                          disabled={isResubmitting}
                          className="flex items-center gap-2"
                        >
                          {isResubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Resubmitting...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="h-4 w-4" />
                              Resubmit for Urgent Attention
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Attachments Section - Fixed */}
                  {grievance.attachments && Array.isArray(grievance.attachments) && grievance.attachments.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-3">Attachments</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {grievance.attachments.map((url, index) => (
                          <a 
                            key={index} 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block border border-gray-200 rounded-md overflow-hidden hover:border-blue-500 transition-colors"
                          >
                            {isImageUrl(url) ? (
                              <div className="relative h-24">
                                <img 
                                  src={url} 
                                  alt={`Attachment ${index + 1}`} 
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    // If image fails to load, replace with a fallback icon
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                      parent.classList.add('bg-gray-100', 'flex', 'items-center', 'justify-center');
                                      const icon = document.createElement('div');
                                      icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
                                      parent.appendChild(icon);
                                    }
                                  }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                                <div className="absolute bottom-1 left-1 right-1 text-white text-xs font-medium px-1 truncate">
                                  Attachment {index + 1}
                                </div>
                              </div>
                            ) : (
                              <div className="h-24 bg-gray-100 flex flex-col items-center justify-center p-2">
                                <FileText className="h-6 w-6 text-gray-400 mb-1" />
                                <span className="text-xs text-gray-500 text-center truncate w-full">
                                  Document {index + 1}
                                </span>
                              </div>
                            )}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  {grievance.timeline && grievance.timeline.length > 0 ? (
                    <ol className="relative border-l border-gray-200 ml-3">
                      {grievance.timeline.map((event, index) => (
                        <li key={index} className="mb-6 ml-6">
                          <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white">
                            <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                          </span>
                          <h3 className="font-medium text-gray-900">{event.date}</h3>
                          <p className="text-gray-700 mt-1">{event.description}</p>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No timeline events available.</p>
                  )}
                </CardContent>
              </Card>
              
              {(isAuthenticated && (user?.id === grievance.userId || user?.isAdmin)) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Add a Comment</CardTitle>
                    <CardDescription>
                      {user?.isAdmin 
                        ? "Add an official response or request more information." 
                        : "Provide additional information or ask about the status of your grievance."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddComment} className="space-y-4">
                      <Input
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Type your comment here..."
                        className="w-full"
                      />
                      <Button 
                        type="submit" 
                        disabled={isSubmittingComment || !comment.trim()}
                        className="flex items-center gap-2"
                      >
                        {isSubmittingComment ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <MessageSquare className="h-4 w-4" />
                            Add Comment
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackGrievance;