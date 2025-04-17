import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { 
  AlertTriangle, CheckSquare, Clock, UserX, UserCheck, PlusCircle, 
  Search, ExternalLink, BadgeAlert, Loader2
} from "lucide-react";
import GrievanceCard from "@/components/GrievanceCard";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { rtdb } from "@/config/firebase";
import { ref, get, update, remove, set, onValue, off, push } from "firebase/database";
import { Grievance } from "@/types/grievance";
import { useAdmin } from "@/hooks/useAdmin";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";

// Admin credentials
const ADMIN_CREDENTIALS = {
  email: "admin@raisevoice.com",
  password: "Admin@123"
};

const AdminDashboard: React.FC = () => {
  // State variables
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [urgentGrievances, setUrgentGrievances] = useState<Grievance[]>([]);
  const [pendingGrievances, setPendingGrievances] = useState<Grievance[]>([]);
  const [allGrievances, setAllGrievances] = useState<Grievance[]>([]);
  const [overviewGrievances, setOverviewGrievances] = useState<Grievance[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [creditRequests, setCreditRequests] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  const [warnDialogOpen, setWarnDialogOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [viewGrievanceDialogOpen, setViewGrievanceDialogOpen] = useState(false);
  const [warningReason, setWarningReason] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [adminComment, setAdminComment] = useState("");
  const [creditsToGrant, setCreditsToGrant] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Fetch data from Firebase when component mounts
  useEffect(() => {
    if (!isAuthenticated || authLoading) return;
    
    // Fetch all grievances
    const grievancesRef = ref(rtdb, 'grievances');
    const grievanceListener = onValue(grievancesRef, (snapshot) => {
      if (snapshot.exists()) {
        const grievancesData = snapshot.val();
        const grievancesArray = Object.keys(grievancesData).map(key => ({
          id: key,
          ...grievancesData[key]
        }));
        
        setAllGrievances(grievancesArray);
        setUrgentGrievances(grievancesArray.filter(g => g.priority === "urgent" && g.status !== "resolved"));
        setPendingGrievances(grievancesArray.filter(g => g.status === "pending"));
        // Filter out resolved grievances for the Overview section
        const nonResolvedGrievances = grievancesArray.filter(g => g.status !== "resolved");
        setOverviewGrievances(nonResolvedGrievances);
      } else {
        setAllGrievances([]);
        setUrgentGrievances([]);
        setPendingGrievances([]);
        setOverviewGrievances([]);
      }
      setIsLoading(false);
    });
    
    // Fetch all users
    const usersRef = ref(rtdb, 'users');
    const usersListener = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        const usersArray = Object.keys(usersData).map(key => ({
          id: key,
          ...usersData[key],
          grievanceCount: 0 // We'll update this count below
        }));
        
        // Count grievances per user
        if (allGrievances.length > 0) {
          allGrievances.forEach(grievance => {
            const userIndex = usersArray.findIndex(u => u.id === grievance.userId);
            if (userIndex >= 0) {
              usersArray[userIndex].grievanceCount += 1;
            }
          });
        }
        
        setUsers(usersArray);
      } else {
        setUsers([]);
      }
    });
    
    // Fetch credit requests
    const requestsRef = ref(rtdb, 'creditRequests');
    const requestsListener = onValue(requestsRef, (snapshot) => {
      if (snapshot.exists()) {
        const requestsData = snapshot.val();
        const requestsArray = Object.keys(requestsData)
          .filter(key => requestsData[key].status === "pending")
          .map(key => ({
            id: key,
            ...requestsData[key]
          }));
        
        setCreditRequests(requestsArray);
      } else {
        setCreditRequests([]);
      }
    });
    
    return () => {
      // Clean up listeners
      off(grievancesRef, 'value', grievanceListener);
      off(usersRef, 'value', usersListener);
      off(requestsRef, 'value', requestsListener);
    };
  }, [isAuthenticated, authLoading, allGrievances.length]);
  
  // Filter users based on search term
  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) || 
    u.mobile?.includes(userSearchTerm) ||
    u.email?.toLowerCase().includes(userSearchTerm.toLowerCase())
  );
  
  // Filter grievances based on search term and sort by status and date
  const filteredGrievances = allGrievances
    .filter(g => 
      g.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      g.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.id?.includes(searchTerm) ||
      g.submittedByName?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      // First sort by resolution status (unresolved first)
      if (a.status === "resolved" && b.status !== "resolved") return 1;
      if (a.status !== "resolved" && b.status === "resolved") return -1;
      
      // Then sort by date (newest first for each group)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  
  const handleUpdateGrievanceStatus = async (id: string, newStatus: "pending" | "in-progress" | "resolved") => {
    try {
      // Update the grievance status in Firebase
      const grievanceRef = ref(rtdb, `grievances/${id}`);
      
      // Get the grievance first to get the submittedBy field
      const grievanceSnapshot = await get(grievanceRef);
      if (!grievanceSnapshot.exists()) {
        toast({
          title: "Error",
          description: "Grievance not found.",
          variant: "destructive"
        });
        return;
      }
      
      const grievanceData = grievanceSnapshot.val();
      const userId = grievanceData.userId;
      
      // Create notification
      const notificationRef = ref(rtdb, `notifications/${userId}/${Date.now()}`);
      await set(notificationRef, {
        type: "status_update",
        grievanceId: id,
        status: newStatus,
        message: `Your grievance status has been updated to ${newStatus}.`,
        date: new Date().toISOString(),
        read: false
      });
      
      // Add admin comment if provided
      if (adminComment.trim()) {
        const comments = grievanceData.comments || [];
        comments.push({
          id: Date.now().toString(),
          text: adminComment,
          date: new Date().toISOString(),
          userId: user?.id || 'admin',
          userName: user?.name || 'Admin'
        });
        
        await update(grievanceRef, { 
          status: newStatus,
          lastUpdated: new Date().toISOString(),
          comments
        });
        
        setAdminComment(""); // Clear comment field
      } else {
        await update(grievanceRef, { 
          status: newStatus,
          lastUpdated: new Date().toISOString()
        });
      }
      
      toast({
        title: "Status Updated",
        description: `Grievance status updated to ${newStatus}.`,
      });
    } catch (error) {
      console.error("Error updating grievance status:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update grievance status. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleWarnUser = async () => {
    if (!selectedUser || !warningReason) return;
    
    try {
      // Get current warnings count
      const userRef = ref(rtdb, `users/${selectedUser.id}`);
      const userSnapshot = await get(userRef);
      
      if (userSnapshot.exists()) {
        const userData = userSnapshot.val();
        const warnings = userData.warnings || 0;
        
        // Update the user status and warnings count
        await update(userRef, { 
          status: "warned",
          warnings: warnings + 1,
          warningReason,
          lastWarningDate: new Date().toISOString()
        });
        
        // Create a notification for the user
        const notificationRef = ref(rtdb, `notifications/${selectedUser.id}/${Date.now()}`);
        await set(notificationRef, {
          type: "warning",
          message: `Warning: ${warningReason}`,
          date: new Date().toISOString(),
          read: false
        });
        
        setWarnDialogOpen(false);
        setWarningReason("");
        
        toast({
          title: "User Warned",
          description: `Warning has been sent to ${selectedUser.name}.`,
        });
      }
    } catch (error) {
      console.error("Error warning user:", error);
      toast({
        title: "Warning Failed",
        description: "Failed to warn user. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleBlockUser = async () => {
    if (!selectedUser || !blockReason) return;
    
    try {
      // Update the user status
      const userRef = ref(rtdb, `users/${selectedUser.id}`);
      await update(userRef, { 
        status: "blocked",
        blockReason,
        blockDate: new Date().toISOString()
      });
      
      // Create a notification for the user
      const notificationRef = ref(rtdb, `notifications/${selectedUser.id}/${Date.now()}`);
      await set(notificationRef, {
        type: "blocked",
        message: `Your account has been blocked. Reason: ${blockReason}`,
        date: new Date().toISOString(),
        read: false
      });
      
      setBlockDialogOpen(false);
      setBlockReason("");
      
      toast({
        title: "User Blocked",
        description: `${selectedUser.name} has been blocked from the platform.`,
      });
    } catch (error) {
      console.error("Error blocking user:", error);
      toast({
        title: "Block Failed",
        description: "Failed to block user. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleUnblockUser = async (userId: string) => {
    try {
      // Update the user status
      const userRef = ref(rtdb, `users/${userId}`);
      await update(userRef, { 
        status: "active",
        unblockDate: new Date().toISOString()
      });
      
      toast({
        title: "User Unblocked",
        description: "User has been unblocked successfully.",
      });
    } catch (error) {
      console.error("Error unblocking user:", error);
      toast({
        title: "Unblock Failed",
        description: "Failed to unblock user. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleApproveCredits = async (requestId: string) => {
    try {
      // Get request data
      const requestRef = ref(rtdb, `creditRequests/${requestId}`);
      const requestSnapshot = await get(requestRef);
      
      if (requestSnapshot.exists()) {
        const requestData = requestSnapshot.val();
        const userId = requestData.userId;
        
        // Validate that the request has a proper reason
        if (!requestData.reason || requestData.reason.trim().length < 10) {
          toast({
            title: "Invalid Request",
            description: "This request doesn't have a valid reason. Ask the user to provide more details.",
            variant: "destructive"
          });
          return;
        }
        
        // Update request status
        await update(requestRef, { 
          status: "approved",
          approvedAt: new Date().toISOString(),
          creditsGranted: creditsToGrant,
          approvedBy: user?.id || 'admin',
          approvedByName: user?.name || 'Admin'
        });
        
        // Update user credits
        const userRef = ref(rtdb, `users/${userId}`);
        const userSnapshot = await get(userRef);
        
        if (userSnapshot.exists()) {
          const userData = userSnapshot.val();
          const currentCredits = userData.grievanceCredits || 0;
          
          await update(userRef, {
            grievanceCredits: currentCredits + creditsToGrant,
            lastCreditUpdate: new Date().toISOString()
          });
          
          // Create notification for user
          const notificationRef = ref(rtdb, `notifications/${userId}/${Date.now()}`);
          await set(notificationRef, {
            type: "credits",
            message: `Your request for additional credits has been approved. You have been granted ${creditsToGrant} credit(s).`,
            date: new Date().toISOString(),
            read: false
          });
        }
        
        toast({
          title: "Credits Approved",
          description: `${creditsToGrant} credit(s) have been granted to the user.`,
        });
      }
    } catch (error) {
      console.error("Error approving credits:", error);
      toast({
        title: "Approval Failed",
        description: "Failed to approve credit request. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleRejectCredits = async (requestId: string) => {
    try {
      // Get request data
      const requestRef = ref(rtdb, `creditRequests/${requestId}`);
      const requestSnapshot = await get(requestRef);
      
      if (requestSnapshot.exists()) {
        const requestData = requestSnapshot.val();
        const userId = requestData.userId;
        
        // Update request status
        await update(requestRef, { 
          status: "rejected",
          rejectedAt: new Date().toISOString(),
          rejectedBy: user?.id || 'admin',
          rejectedByName: user?.name || 'Admin'
        });
        
        // Create notification for user
        const notificationRef = ref(rtdb, `notifications/${userId}/${Date.now()}`);
        await set(notificationRef, {
          type: "credits-rejected",
          message: "Your request for additional credits has been rejected.",
          date: new Date().toISOString(),
          read: false
        });
        
        toast({
          title: "Request Rejected",
          description: "Credit request has been rejected.",
        });
      }
    } catch (error) {
      console.error("Error rejecting credits:", error);
      toast({
        title: "Rejection Failed",
        description: "Failed to reject credit request. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Function to assign a grievance to an admin
  const handleAssignGrievance = async (grievanceId: string) => {
    if (!user) return;
    
    try {
      // Update grievance to assign it to current admin
      const grievanceRef = ref(rtdb, `grievances/${grievanceId}`);
      await update(grievanceRef, {
        assignedTo: user.id,
        assignedName: user.name,
        status: "in-progress",
        lastUpdated: new Date().toISOString()
      });
      
      toast({
        title: "Grievance Assigned",
        description: `Grievance has been assigned to you.`,
      });
    } catch (error) {
      console.error("Error assigning grievance:", error);
      toast({
        title: "Assignment Failed",
        description: "Failed to assign grievance. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Function to add a comment without changing status
  const handleAddCommentOnly = async (grievanceId: string) => {
    if (!adminComment.trim()) {
      toast({
        title: "Comment Required",
        description: "Please enter a comment before submitting.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Get the current grievance data
      const grievanceRef = ref(rtdb, `grievances/${grievanceId}`);
      const grievanceSnapshot = await get(grievanceRef);
      
      if (grievanceSnapshot.exists()) {
        const grievanceData = grievanceSnapshot.val();
        const comments = grievanceData.comments || [];
        const userId = grievanceData.userId;
        
        // Add the new comment
        comments.push({
          id: Date.now().toString(),
          text: adminComment,
          date: new Date().toISOString(),
          userId: user?.id || 'admin',
          userName: user?.name || 'Admin'
        });
        
        // Update the grievance with the new comment
        await update(grievanceRef, { 
          comments,
          lastUpdated: new Date().toISOString()
        });
        
        // Create notification for the user
        const notificationRef = ref(rtdb, `notifications/${userId}/${Date.now()}`);
        await set(notificationRef, {
          type: "comment",
          grievanceId: grievanceId,
          message: `An admin has commented on your grievance.`,
          date: new Date().toISOString(),
          read: false
        });
        
        setAdminComment(""); // Clear comment field
        
        toast({
          title: "Comment Added",
          description: "Your comment has been added successfully.",
        });
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Comment Failed",
        description: "Failed to add comment. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Function to grant credits directly to a user
  const handleGrantCreditsDirectly = async (userId: string, creditsToAdd: number) => {
    try {
      // Get user data
      const userRef = ref(rtdb, `users/${userId}`);
      const userSnapshot = await get(userRef);
      
      if (userSnapshot.exists()) {
        const userData = userSnapshot.val();
        const currentCredits = userData.grievanceCredits || 0;
        
        // Update user credits
        await update(userRef, {
          grievanceCredits: currentCredits + creditsToAdd,
          lastCreditUpdate: new Date().toISOString()
        });
        
        // Create notification for user
        const notificationRef = ref(rtdb, `notifications/${userId}/${Date.now()}`);
        await set(notificationRef, {
          type: "credits-granted",
          message: `An administrator has granted you ${creditsToAdd} additional grievance credit(s).`,
          date: new Date().toISOString(),
          read: false
        });
        
        toast({
          title: "Credits Granted",
          description: `${creditsToAdd} credit(s) have been granted to the user.`,
        });
      }
    } catch (error) {
      console.error("Error granting credits:", error);
      toast({
        title: "Action Failed",
        description: "Failed to grant credits to user. Please try again.",
        variant: "destructive"
      });
    }
  };

  // View grievance details
  const handleViewGrievance = (grievance: Grievance) => {
    setSelectedGrievance(grievance);
    setAdminComment(""); // Reset comment when opening a new grievance
    setViewGrievanceDialogOpen(true);
  };

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }
  
  // Redirect if not authenticated or not admin
  if (!isAuthenticated || !user?.isAdmin) {
    return <Navigate to="/admin/login" />;
  }
  
  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">
              Manage grievances, users, and platform settings
            </p>
          </div>
        </div>
        
        <Tabs 
          defaultValue="overview" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-8"
        >
          <TabsList className="w-full flex overflow-x-auto p-0 bg-transparent justify-start space-x-2">
            <TabsTrigger value="overview" className="flex items-center">
              Overview
            </TabsTrigger>
            <TabsTrigger value="urgent" className="flex items-center">
              <BadgeAlert className="mr-2 h-4 w-4 text-red-500" />
              Red Alert
            </TabsTrigger>
            <TabsTrigger value="all-grievances" className="flex items-center">
              All Grievances
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center">
              User Management
            </TabsTrigger>
            <TabsTrigger value="credits" className="flex items-center">
              Credit Requests
            </TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Active Grievances</p>
                      <p className="text-3xl font-bold">{overviewGrievances.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                      <ExternalLink className="h-6 w-6 text-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Pending</p>
                      <p className="text-3xl font-bold">{pendingGrievances.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center">
                      <Clock className="h-6 w-6 text-yellow-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Red Alert</p>
                      <p className="text-3xl font-bold">{urgentGrievances.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-red-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Credit Requests</p>
                      <p className="text-3xl font-bold">{creditRequests.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
                      <PlusCircle className="h-6 w-6 text-purple-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Recent Urgent Grievances */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Urgent Grievances</h2>
              
              <div className="space-y-4">
                {urgentGrievances.slice(0, 3).map((grievance) => (
                  <div key={grievance.id} className="bg-white border border-red-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="p-6">
                      <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="px-3 py-1 text-xs font-medium rounded-full border bg-red-50 text-red-700 border-red-200">
                              Urgent
                            </span>
                            <StatusBadge status={grievance.status} />
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <span>{new Date(grievance.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{grievance.title}</h3>
                      
                      <p className="text-gray-700 mb-4 line-clamp-2">{grievance.description}</p>
                      
                      <div className="flex flex-wrap justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <span>ID: {grievance.id.substring(0, 8)}...</span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-500">
                            <span>By: {grievance.submittedByName || "Anonymous"}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-4 sm:mt-0">
                          {grievance.status === "pending" && (
                            <Button 
                              size="sm" 
                              onClick={() => handleUpdateGrievanceStatus(grievance.id, "in-progress")}
                            >
                              Start Processing
                            </Button>
                          )}
                          
                          {grievance.status === "in-progress" && (
                            <Button 
                              size="sm" 
                              onClick={() => handleUpdateGrievanceStatus(grievance.id, "resolved")}
                            >
                              Mark as Resolved
                            </Button>
                          )}
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewGrievance(grievance)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              
                {urgentGrievances.length === 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Urgent Grievances</h3>
                    <p className="text-gray-600">There are no urgent grievances at the moment.</p>
                  </div>
                )}
                
                {urgentGrievances.length > 3 && (
                  <div className="text-center mt-4">
                    <Button variant="outline" onClick={() => setActiveTab("urgent")}>
                      View All Urgent Grievances
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Recent Credit Requests */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Recent Credit Requests</h2>
              
              <div className="space-y-4">
                {creditRequests.slice(0, 3).map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-col gap-2 mb-2">
                          <Label htmlFor="credits-to-grant">Credits to Grant</Label>
                          <Select 
                            value={creditsToGrant.toString()}
                            onValueChange={(value) => setCreditsToGrant(parseInt(value))}
                          >
                            <SelectTrigger className="w-full" id="credits-to-grant">
                              <SelectValue placeholder="Select number of credits" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 Credit</SelectItem>
                              <SelectItem value="2">2 Credits</SelectItem>
                              <SelectItem value="3">3 Credits (Full Refill)</SelectItem>
                              <SelectItem value="5">5 Credits (Special Case)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            onClick={() => handleRejectCredits(request.id)}
                          >
                            Reject
                          </Button>
                          <Button 
                            onClick={() => handleApproveCredits(request.id)}
                          >
                            Approve ({creditsToGrant} {creditsToGrant === 1 ? 'credit' : 'credits'})
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {creditRequests.length === 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Credit Requests</h3>
                    <p className="text-gray-600">There are no pending credit requests at the moment.</p>
                  </div>
                )}
                
                {creditRequests.length > 0 && (
                  <div className="text-center mt-4">
                    <Button variant="outline" onClick={() => setActiveTab("credits")}>
                      View All Credit Requests
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          {/* Urgent Grievances Tab */}
          <TabsContent value="urgent" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Red Alert Grievances</h2>
              
              <div className="relative w-64">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input 
                  placeholder="Search grievances..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              {urgentGrievances
                .filter(g => 
                  g.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  g.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  g.id.includes(searchTerm)
                )
                .map((grievance) => (
                  <div key={grievance.id} className="bg-white border border-red-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="p-6">
                      <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
                        <div className="flex space-x-2">
                          <StatusBadge status={grievance.status} />
                          <span className="px-3 py-1 text-xs font-medium rounded-full border bg-red-50 text-red-700 border-red-200">
                            Urgent
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <span>{new Date(grievance.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{grievance.title}</h3>
                      
                      <p className="text-gray-700 mb-4">{grievance.description}</p>
                      
                      <div className="flex flex-wrap justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <span>ID: {grievance.id}</span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-500">
                            <span>By: {grievance.submittedByName || "Anonymous"}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-4 sm:mt-0">
                          {grievance.status === "pending" && (
                            <Button 
                              size="sm" 
                              onClick={() => handleUpdateGrievanceStatus(grievance.id, "in-progress")}
                            >
                              Start Processing
                            </Button>
                          )}
                          
                          {grievance.status === "in-progress" && (
                            <Button 
                              size="sm" 
                              onClick={() => handleUpdateGrievanceStatus(grievance.id, "resolved")}
                            >
                              Mark as Resolved
                            </Button>
                          )}
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewGrievance(grievance)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              
              {urgentGrievances.filter(g => 
                g.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                g.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                g.id.includes(searchTerm)
              ).length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Urgent Grievances Found</h3>
                  {searchTerm ? (
                    <p className="text-gray-600">No urgent grievances match your search query.</p>
                  ) : (
                    <p className="text-gray-600">There are no urgent grievances at the moment.</p>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* All Grievances Tab */}
          <TabsContent value="all-grievances" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">All Grievances</h2>
              
              <div className="relative w-64">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input 
                  placeholder="Search grievances..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <div className="min-w-full inline-block align-middle">
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Submitted By
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Priority
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredGrievances.map((grievance) => (
                        <tr key={grievance.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {grievance.id.substring(0, 8)}...
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {grievance.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {grievance.submittedByName || "Anonymous"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {new Date(grievance.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={grievance.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <PriorityBadge priority={grievance.priority} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              {grievance.status === "pending" && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleUpdateGrievanceStatus(grievance.id, "in-progress")}
                                >
                                  Process
                                </Button>
                              )}
                              
                              {grievance.status === "in-progress" && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleUpdateGrievanceStatus(grievance.id, "resolved")}
                                >
                                  Resolve
                                </Button>
                              )}
                              
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleViewGrievance(grievance)}
                              >
                                View
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      
                      {filteredGrievances.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                            No grievances found matching your search criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">User Management</h2>
              
              <div className="relative w-64">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input 
                  placeholder="Search users..."
                  className="pl-8"
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <div className="min-w-full inline-block align-middle">
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Grievances
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Activity
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.filter(u => !u.isAdmin).map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-gray-600 font-medium">
                                  {user.name?.charAt(0)}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID: {user.id.substring(0, 8)}...
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700">{user.mobile}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {user.grievanceCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {user.lastActivity ? new Date(user.lastActivity).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.status === "active" && (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Active
                              </span>
                            )}
                            {user.status === "warned" && (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                Warned
                              </span>
                            )}
                            {user.status === "blocked" && (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                Blocked
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              {user.status !== "blocked" && (
                                <>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="outline" size="sm" className="border-green-200 text-green-600 hover:bg-green-50">
                                        Grant Credits
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Grant Credits to {user.name}</DialogTitle>
                                        <DialogDescription>
                                          Current credit balance: {user.grievanceCredits || 0} credits
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="py-4">
                                        <Label htmlFor="credits-amount">Credits to Grant</Label>
                                        <Select 
                                          defaultValue="1"
                                          onValueChange={(value) => setCreditsToGrant(parseInt(value))}
                                        >
                                          <SelectTrigger id="credits-amount" className="mt-2">
                                            <SelectValue placeholder="Select number of credits" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="1">1 Credit</SelectItem>
                                            <SelectItem value="2">2 Credits</SelectItem>
                                            <SelectItem value="3">3 Credits (Full Refill)</SelectItem>
                                            <SelectItem value="5">5 Credits (Special Case)</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <DialogFooter>
                                        <Button 
                                          onClick={() => {
                                            handleGrantCreditsDirectly(user.id, creditsToGrant);
                                            // Close the dialog
                                            const closeButton = document.querySelector('[data-dialog-close]') as HTMLButtonElement;
                                            if (closeButton) closeButton.click();
                                          }}
                                        >
                                          Grant Credits
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setWarnDialogOpen(true);
                                    }}
                                  >
                                    Warn
                                  </Button>
                                </>
                              )}
                              
                              {user.status === "blocked" && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="border-green-200 text-green-600 hover:bg-green-50"
                                  onClick={() => handleUnblockUser(user.id)}
                                >
                                  Unblock
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      
                      {filteredUsers.filter(u => !u.isAdmin).length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                            No users found matching your search criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Credit Requests Tab */}
          <TabsContent value="credits" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Credit Requests</h2>
            </div>
            
            <div className="space-y-4">
              {creditRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col gap-2 mb-2">
                        <Label htmlFor="credits-to-grant">Credits to Grant</Label>
                        <Select 
                          value={creditsToGrant.toString()}
                          onValueChange={(value) => setCreditsToGrant(parseInt(value))}
                        >
                          <SelectTrigger className="w-full" id="credits-to-grant">
                            <SelectValue placeholder="Select number of credits" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Credit</SelectItem>
                            <SelectItem value="2">2 Credits</SelectItem>
                            <SelectItem value="3">3 Credits (Full Refill)</SelectItem>
                            <SelectItem value="5">5 Credits (Special Case)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => handleRejectCredits(request.id)}
                        >
                          Reject
                        </Button>
                        <Button 
                          onClick={() => handleApproveCredits(request.id)}
                        >
                          Approve ({creditsToGrant} {creditsToGrant === 1 ? 'credit' : 'credits'})
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {creditRequests.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Credit Requests</h3>
                  <p className="text-gray-600">There are no pending credit requests at the moment.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Warning Dialog */}
      <Dialog open={warnDialogOpen} onOpenChange={setWarnDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Warning User</DialogTitle>
            <DialogDescription>
              Send a warning to {selectedUser?.name}. This will be recorded in their account history.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="warning-reason">Warning Reason</Label>
              <Textarea
                id="warning-reason"
                placeholder="Enter the reason for this warning..."
                value={warningReason}
                onChange={(e) => setWarningReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setWarnDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="default" 
              onClick={handleWarnUser} 
              disabled={!warningReason.trim()}
            >
              Send Warning
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block Dialog */}
      <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block User</DialogTitle>
            <DialogDescription>
              Block {selectedUser?.name} from using the platform. This will prevent them from logging in or submitting new grievances.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="block-reason">Block Reason</Label>
              <Textarea
                id="block-reason"
                placeholder="Enter the reason for blocking this user..."
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleBlockUser} 
              disabled={!blockReason.trim()}
            >
              Block User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Grievance Dialog */}
      <Dialog open={viewGrievanceDialogOpen} onOpenChange={setViewGrievanceDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Grievance Details</DialogTitle>
            <DialogDescription>
              Viewing detailed information about this grievance
            </DialogDescription>
          </DialogHeader>
          
          {selectedGrievance && (
            <div className="space-y-4 py-4">
              <div className="flex flex-wrap gap-2 mb-2">
                <StatusBadge status={selectedGrievance.status} />
                <PriorityBadge priority={selectedGrievance.priority} />
                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                  ID: {selectedGrievance.id}
                </span>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{selectedGrievance.title}</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedGrievance.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-500">Submitted By</p>
                  <p className="font-medium">{selectedGrievance.submittedByName || "Anonymous"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Submission Date</p>
                  <p className="font-medium">{new Date(selectedGrievance.date).toLocaleString()}</p>
                </div>
                {selectedGrievance.assignedTo && (
                  <>
                    <div>
                      <p className="text-sm text-gray-500">Assigned To</p>
                      <p className="font-medium">{selectedGrievance.assignedName || "Unknown"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Updated</p>
                      <p className="font-medium">{selectedGrievance.lastUpdated ? new Date(selectedGrievance.lastUpdated).toLocaleString() : "N/A"}</p>
                    </div>
                  </>
                )}
              </div>
              
              {selectedGrievance.comments && selectedGrievance.comments.length > 0 && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Comments</h4>
                  <div className="space-y-3">
                    {selectedGrievance.comments.map((comment: any) => (
                      <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-start">
                          <span className="font-medium">{comment.userName || "Unknown"}</span>
                          <span className="text-xs text-gray-500">{new Date(comment.date).toLocaleString()}</span>
                        </div>
                        <p className="text-gray-700 text-sm mt-1">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Action</h4>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-comment">Add Comment</Label>
                    <Textarea
                      id="admin-comment"
                      placeholder="Add a comment for this grievance..."
                      value={adminComment}
                      onChange={(e) => setAdminComment(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    {selectedGrievance.status === "pending" && (
                      <Button 
                        onClick={() => {
                          handleUpdateGrievanceStatus(selectedGrievance.id, "in-progress");
                          setViewGrievanceDialogOpen(false);
                        }}
                      >
                        Start Processing
                      </Button>
                    )}
                    
                    {selectedGrievance.status === "in-progress" && (
                      <Button 
                        onClick={() => {
                          handleUpdateGrievanceStatus(selectedGrievance.id, "resolved");
                          setViewGrievanceDialogOpen(false);
                        }}
                      >
                        Mark as Resolved
                      </Button>
                    )}
                    
                    {adminComment.trim() && (
                      <Button 
                        variant="outline"
                        onClick={() => {
                          handleAddCommentOnly(selectedGrievance.id);
                          setViewGrievanceDialogOpen(false);
                        }}
                      >
                        Add Comment Only
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
