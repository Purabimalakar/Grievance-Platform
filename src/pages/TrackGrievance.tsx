
import React, { useState, useEffect } from "react";
import { Navigate, useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Search, ArrowLeft, Loader2, RefreshCw, MessageSquare } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";

// Mock grievance data
const MOCK_GRIEVANCE = {
  id: "GR78901",
  title: "Water Shortage in Sector 9",
  description: "There has been no water supply in our area for the past 3 days. This is causing significant inconvenience to residents.",
  date: "July 15, 2023",
  status: "in-progress" as const,
  priority: "high" as const,
  timeline: [
    {
      date: "July 15, 2023 - 10:30 AM",
      status: "submitted",
      description: "Grievance submitted successfully.",
    },
    {
      date: "July 16, 2023 - 09:15 AM",
      status: "acknowledged",
      description: "Grievance acknowledged by the department.",
    },
    {
      date: "July 18, 2023 - 02:30 PM",
      status: "in-progress",
      description: "Water supply team has been dispatched to investigate the issue.",
    },
  ],
  department: "Water Supply Department",
  assignedTo: "Engineer J. Smith",
  expectedResolution: "July 22, 2023",
};

const TrackGrievance: React.FC = () => {
  const [trackingId, setTrackingId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [grievance, setGrievance] = useState<typeof MOCK_GRIEVANCE | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  
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
      // In a real app, you would make an API call to fetch the grievance
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      // For demo purposes, always return the mock grievance
      if (id === "GR78901" || params.id) {
        setGrievance({ ...MOCK_GRIEVANCE, id });
      } else {
        toast({
          title: "Grievance Not Found",
          description: "No grievance found with the provided ID.",
          variant: "destructive",
        });
        setGrievance(null);
      }
    } catch (error) {
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
    
    if (!comment.trim()) {
      toast({
        title: "Comment Required",
        description: "Please enter a comment.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmittingComment(true);
    
    try {
      // In a real app, you would make an API call to add the comment
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      toast({
        title: "Comment Added",
        description: "Your comment has been added successfully.",
      });
      
      // Reset the comment field
      setComment("");
      
      // Add the comment to the timeline (for demo purposes)
      if (grievance) {
        const now = new Date();
        const formattedDate = `${now.toLocaleDateString()} - ${now.toLocaleTimeString()}`;
        
        setGrievance({
          ...grievance,
          timeline: [
            ...grievance.timeline,
            {
              date: formattedDate,
              status: "comment",
              description: comment,
            },
          ],
        });
      }
    } catch (error) {
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
    if (!grievance) return;
    
    try {
      // In a real app, you would make an API call to resubmit the grievance
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      toast({
        title: "Grievance Resubmitted",
        description: "Your grievance has been resubmitted for urgent attention.",
      });
      
      // Update the grievance timeline (for demo purposes)
      const now = new Date();
      const formattedDate = `${now.toLocaleDateString()} - ${now.toLocaleTimeString()}`;
      
      setGrievance({
        ...grievance,
        timeline: [
          ...grievance.timeline,
          {
            date: formattedDate,
            status: "resubmitted",
            description: "Grievance resubmitted for urgent attention.",
          },
        ],
      });
    } catch (error) {
      toast({
        title: "Resubmission Failed",
        description: "Failed to resubmit your grievance. Please try again.",
        variant: "destructive",
      });
    }
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
                      placeholder="Enter your grievance ID (e.g., GR12345)"
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
                    If you don't have a tracking ID, please contact support.
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
                      Submitted on {grievance.date}
                    </div>
                  </div>
                  <CardTitle>{grievance.title}</CardTitle>
                  <CardDescription className="text-base text-gray-700 mt-2">
                    {grievance.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Department</h3>
                      <p className="text-gray-900">{grievance.department}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Assigned To</h3>
                      <p className="text-gray-900">{grievance.assignedTo}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Expected Resolution</h3>
                      <p className="text-gray-900">{grievance.expectedResolution}</p>
                    </div>
                    
                    {grievance.status === "pending" && (
                      <div>
                        <Button 
                          variant="outline" 
                          onClick={handleResubmit}
                          className="flex items-center gap-2"
                        >
                          <RefreshCw className="h-4 w-4" />
                          Resubmit for Urgent Attention
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Timeline</CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
              
              {isAuthenticated && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Add a Comment</CardTitle>
                    <CardDescription>
                      Provide additional information or ask about the status of your grievance.
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
