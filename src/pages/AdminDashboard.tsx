
import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { AlertTriangle, CheckSquare, Clock, UserX, UserCheck, PlusCircle, Search, ExternalLink, BadgeAlert } from "lucide-react";
import GrievanceCard from "@/components/GrievanceCard";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock grievance data
const MOCK_GRIEVANCES = [
  {
    id: "GR78901",
    title: "Water Shortage in Sector 9",
    description: "There has been no water supply in our area for the past 3 days. This is causing significant inconvenience to residents.",
    date: "July 15, 2023",
    status: "pending" as const,
    priority: "high" as const,
    submittedBy: "Rahul Sharma",
  },
  {
    id: "GR78902",
    title: "Garbage Collection Issue",
    description: "The garbage has not been collected from our street for a week now. This is creating unsanitary conditions.",
    date: "July 20, 2023",
    status: "in-progress" as const,
    priority: "normal" as const,
    submittedBy: "Priya Patel",
  },
  {
    id: "GR78903",
    title: "Street Light Repair",
    description: "Several street lights on Main Road, Sector 7 are not working, making it unsafe at night.",
    date: "July 25, 2023",
    status: "resolved" as const,
    priority: "normal" as const,
    submittedBy: "Amit Kumar",
  },
  {
    id: "GR78904",
    title: "Assault Case in Residential Area",
    description: "I was attacked by a group of people near my house. This is a serious matter and I need immediate police protection.",
    date: "July 26, 2023",
    status: "pending" as const,
    priority: "urgent" as const,
    submittedBy: "Vikram Singh",
  },
  {
    id: "GR78905",
    title: "Illegal Construction in Public Space",
    description: "Someone is constructing a building on public property near the park in Sector 12. This needs to be investigated.",
    date: "July 28, 2023",
    status: "in-progress" as const,
    priority: "high" as const,
    submittedBy: "Neha Gupta",
  },
];

// Mock user data for user management
const MOCK_USERS = [
  {
    id: "USR001",
    name: "Rahul Sharma",
    mobile: "9876543210",
    email: "rahul@example.com",
    grievanceCount: 3,
    status: "active",
    lastActivity: "July 26, 2023",
  },
  {
    id: "USR002",
    name: "Priya Patel",
    mobile: "9876543211",
    email: "priya@example.com",
    grievanceCount: 5,
    status: "active",
    lastActivity: "July 25, 2023",
  },
  {
    id: "USR003",
    name: "Amit Kumar",
    mobile: "9876543212",
    email: "amit@example.com",
    grievanceCount: 2,
    status: "warned",
    lastActivity: "July 24, 2023",
  },
  {
    id: "USR004",
    name: "Vikram Singh",
    mobile: "9876543213",
    email: "vikram@example.com",
    grievanceCount: 7,
    status: "active",
    lastActivity: "July 26, 2023",
  },
  {
    id: "USR005",
    name: "Neha Gupta",
    mobile: "9876543214",
    email: "neha@example.com",
    grievanceCount: 1,
    status: "blocked",
    lastActivity: "July 20, 2023",
  },
];

// Mock credit requests
const MOCK_CREDIT_REQUESTS = [
  {
    id: "REQ001",
    userId: "USR001",
    userName: "Rahul Sharma",
    currentCredits: 0,
    requestDate: "July 26, 2023",
    reason: "Need to submit urgent municipal grievance",
    status: "pending",
  },
  {
    id: "REQ002",
    userId: "USR002",
    userName: "Priya Patel",
    currentCredits: 1,
    requestDate: "July 25, 2023",
    reason: "Multiple issues in neighborhood that need attention",
    status: "pending",
  },
];

const AdminDashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [urgentGrievances, setUrgentGrievances] = useState(MOCK_GRIEVANCES.filter(g => g.priority === "urgent"));
  const [pendingGrievances, setPendingGrievances] = useState(MOCK_GRIEVANCES.filter(g => g.status === "pending"));
  const [allGrievances, setAllGrievances] = useState(MOCK_GRIEVANCES);
  const [users, setUsers] = useState(MOCK_USERS);
  const [creditRequests, setCreditRequests] = useState(MOCK_CREDIT_REQUESTS);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [warnDialogOpen, setWarnDialogOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [warningReason, setWarningReason] = useState("");
  const [blockReason, setBlockReason] = useState("");
  
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  
  // Filter users based on search term
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) || 
    u.mobile.includes(userSearchTerm) ||
    u.email.toLowerCase().includes(userSearchTerm.toLowerCase())
  );
  
  // Filter grievances based on search term
  const filteredGrievances = allGrievances.filter(g => 
    g.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    g.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.id.includes(searchTerm) ||
    g.submittedBy.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleUpdateGrievanceStatus = (id: string, newStatus: "pending" | "in-progress" | "resolved") => {
    // Update the grievance status
    const updatedGrievances = allGrievances.map(g => 
      g.id === id ? { ...g, status: newStatus } : g
    );
    
    setAllGrievances(updatedGrievances);
    setPendingGrievances(updatedGrievances.filter(g => g.status === "pending"));
    setUrgentGrievances(updatedGrievances.filter(g => g.priority === "urgent"));
    
    toast({
      title: "Status Updated",
      description: `Grievance ${id} status updated to ${newStatus}.`,
    });
  };
  
  const handleWarnUser = () => {
    if (!selectedUser || !warningReason) return;
    
    // Update the user status
    const updatedUsers = users.map(u => 
      u.id === selectedUser.id ? { ...u, status: "warned" } : u
    );
    
    setUsers(updatedUsers);
    setWarnDialogOpen(false);
    setWarningReason("");
    
    toast({
      title: "User Warned",
      description: `Warning has been sent to ${selectedUser.name}.`,
    });
  };
  
  const handleBlockUser = () => {
    if (!selectedUser || !blockReason) return;
    
    // Update the user status
    const updatedUsers = users.map(u => 
      u.id === selectedUser.id ? { ...u, status: "blocked" } : u
    );
    
    setUsers(updatedUsers);
    setBlockDialogOpen(false);
    setBlockReason("");
    
    toast({
      title: "User Blocked",
      description: `${selectedUser.name} has been blocked from the platform.`,
    });
  };
  
  const handleApproveCredits = (requestId: string) => {
    // Update the credit request status
    const updatedRequests = creditRequests.map(r => 
      r.id === requestId ? { ...r, status: "approved" } : r
    );
    
    setCreditRequests(updatedRequests.filter(r => r.status === "pending"));
    
    toast({
      title: "Credits Approved",
      description: "Additional submission credits have been granted to the user.",
    });
  };
  
  const handleRejectCredits = (requestId: string) => {
    // Update the credit request status
    const updatedRequests = creditRequests.map(r => 
      r.id === requestId ? { ...r, status: "rejected" } : r
    );
    
    setCreditRequests(updatedRequests.filter(r => r.status === "pending"));
    
    toast({
      title: "Request Rejected",
      description: "Credit request has been rejected.",
    });
  };
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated || !user?.isAdmin) {
    return <Navigate to="/login" />;
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
                      <p className="text-sm font-medium text-gray-500">Total Grievances</p>
                      <p className="text-3xl font-bold">{allGrievances.length}</p>
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
              <h2 className="text-xl font-semibold mb-4">Recent Urgent Grievances</h2>
              
              <div className="space-y-4">
                {urgentGrievances.slice(0, 3).map((grievance) => (
                  <GrievanceCard key={grievance.id} {...grievance} />
                ))}
                
                {urgentGrievances.length === 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Urgent Grievances</h3>
                    <p className="text-gray-600">There are no urgent grievances at the moment.</p>
                  </div>
                )}
                
                {urgentGrievances.length > 0 && (
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
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold">{request.userName}</h3>
                          <p className="text-gray-600 text-sm">Requested on {request.requestDate}</p>
                          <p className="text-gray-700 mt-2">
                            <span className="font-medium">Reason:</span> {request.reason}
                          </p>
                          <p className="text-gray-700 mt-1">
                            <span className="font-medium">Current Credits:</span> {request.currentCredits}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleRejectCredits(request.id)}>
                            Reject
                          </Button>
                          <Button size="sm" onClick={() => handleApproveCredits(request.id)}>
                            Approve
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
                          {grievance.status === "pending" && (
                            <span className="px-3 py-1 text-xs font-medium rounded-full border bg-yellow-50 text-yellow-700 border-yellow-200">
                              Pending
                            </span>
                          )}
                          {grievance.status === "in-progress" && (
                            <span className="px-3 py-1 text-xs font-medium rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                              In Progress
                            </span>
                          )}
                          {grievance.status === "resolved" && (
                            <span className="px-3 py-1 text-xs font-medium rounded-full border bg-green-50 text-green-700 border-green-200">
                              Resolved
                            </span>
                          )}
                          <span className="px-3 py-1 text-xs font-medium rounded-full border bg-red-50 text-red-700 border-red-200">
                            Urgent
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <span>{grievance.date}</span>
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
                            <span>By: {grievance.submittedBy}</span>
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
                          
                          <Button variant="outline" size="sm">
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
                  <p className="text-gray-600">There are no urgent grievances matching your search criteria.</p>
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
                        <tr key={grievance.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {grievance.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {grievance.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {grievance.submittedBy}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {grievance.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {grievance.status === "pending" && (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                Pending
                              </span>
                            )}
                            {grievance.status === "in-progress" && (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                In Progress
                              </span>
                            )}
                            {grievance.status === "resolved" && (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Resolved
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {grievance.priority === "normal" && (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                Normal
                              </span>
                            )}
                            {grievance.priority === "high" && (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                                High
                              </span>
                            )}
                            {grievance.priority === "urgent" && (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                Urgent
                              </span>
                            )}
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
                              
                              <Button variant="ghost" size="sm">
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
                          User
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
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-gray-600 font-medium">
                                  {user.name.charAt(0)}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID: {user.id}
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
                            {user.lastActivity}
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
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setWarnDialogOpen(true);
                                    }}
                                  >
                                    Warn
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setBlockDialogOpen(true);
                                    }}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    Block
                                  </Button>
                                </>
                              )}
                              {user.status === "blocked" && (
                                <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-800">
                                  Unblock
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      
                      {filteredUsers.length === 0 && (
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
            
            {/* Warn User Dialog */}
            <Dialog open={warnDialogOpen} onOpenChange={setWarnDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send Warning to User</DialogTitle>
                  <DialogDescription>
                    This will send a warning notification to {selectedUser?.name}. Please provide a reason for the warning.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="warning-reason">Warning Reason</Label>
                    <Input
                      id="warning-reason"
                      placeholder="Enter warning reason..."
                      value={warningReason}
                      onChange={(e) => setWarningReason(e.target.value)}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setWarnDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleWarnUser} disabled={!warningReason.trim()}>
                    Send Warning
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {/* Block User Dialog */}
            <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Block User</DialogTitle>
                  <DialogDescription>
                    This will block {selectedUser?.name} from accessing the platform. This action can be reversed later.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="block-reason">Block Reason</Label>
                    <Input
                      id="block-reason"
                      placeholder="Enter reason for blocking..."
                      value={blockReason}
                      onChange={(e) => setBlockReason(e.target.value)}
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
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold">{request.userName}</h3>
                        <p className="text-gray-600 text-sm">Requested on {request.requestDate}</p>
                        <p className="text-gray-700 mt-2">
                          <span className="font-medium">Reason:</span> {request.reason}
                        </p>
                        <p className="text-gray-700 mt-1">
                          <span className="font-medium">Current Credits:</span> {request.currentCredits}
                        </p>
                        <p className="text-gray-700 mt-1">
                          <span className="font-medium">User ID:</span> {request.userId}
                        </p>
                      </div>
                      
                      <div className="flex flex-col gap-2">
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
                            Approve
                          </Button>
                        </div>
                        
                        <Select defaultValue="1">
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Credits to grant" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Grant 1 Credit</SelectItem>
                            <SelectItem value="2">Grant 2 Credits</SelectItem>
                            <SelectItem value="3">Grant 3 Credits</SelectItem>
                          </SelectContent>
                        </Select>
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
    </div>
  );
};

export default AdminDashboard;
