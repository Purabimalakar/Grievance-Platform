
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { PlusCircle, Clock, FileCheck, AlertCircle, BarChart3, Bell } from "lucide-react";
import GrievanceCard from "@/components/GrievanceCard";

// Mock grievance data
const MOCK_GRIEVANCES = [
  {
    id: "GR78901",
    title: "Water Shortage in Sector 9",
    description: "There has been no water supply in our area for the past 3 days. This is causing significant inconvenience to residents.",
    date: "July 15, 2023",
    status: "pending" as const,
    priority: "high" as const,
  },
  {
    id: "GR78902",
    title: "Garbage Collection Issue",
    description: "The garbage has not been collected from our street for a week now. This is creating unsanitary conditions.",
    date: "July 20, 2023",
    status: "in-progress" as const,
    priority: "normal" as const,
  },
  {
    id: "GR78903",
    title: "Street Light Repair",
    description: "Several street lights on Main Road, Sector 7 are not working, making it unsafe at night.",
    date: "July 25, 2023",
    status: "resolved" as const,
    priority: "normal" as const,
  },
];

const Dashboard: React.FC = () => {
  const { user, isAuthenticated, isLoading, updateUserCredits } = useAuth();
  const { toast } = useToast();
  const [grievances, setGrievances] = useState(MOCK_GRIEVANCES);
  
  useEffect(() => {
    // Check if user needs credit update (24 hours have passed since last update)
    if (user && user.grievanceCredits < 3) {
      const lastUpdate = new Date(user.lastCreditUpdate);
      const now = new Date();
      const hoursPassed = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
      
      if (hoursPassed >= 24) {
        // Add one credit (up to max of 3)
        const newCredits = Math.min(user.grievanceCredits + 1, 3);
        updateUserCredits(newCredits);
        
        toast({
          title: "Credit Updated",
          description: `You've received a new grievance submission credit. Total credits: ${newCredits}`,
        });
      }
    }
  }, [user]);
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  const pendingGrievances = grievances.filter(g => g.status === "pending");
  const inProgressGrievances = grievances.filter(g => g.status === "in-progress");
  const resolvedGrievances = grievances.filter(g => g.status === "resolved");
  
  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}</h1>
            <p className="text-gray-600">
              Manage and track your grievances
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-4">
            <Card className="sm:w-auto w-full">
              <CardContent className="p-4 flex items-center space-x-4">
                <div className="bg-blue-50 p-2 rounded-full">
                  <PlusCircle className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Submission Credits</p>
                  <p className="text-xl font-bold">{user?.grievanceCredits} / 3</p>
                </div>
              </CardContent>
            </Card>
            
            <Link to="/submit-grievance">
              <Button className="w-full sm:w-auto">
                Submit New Grievance
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div className="space-y-1">
                <CardDescription>Pending</CardDescription>
                <CardTitle className="text-3xl">{pendingGrievances.length}</CardTitle>
              </div>
              <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div className="space-y-1">
                <CardDescription>In Progress</CardDescription>
                <CardTitle className="text-3xl">{inProgressGrievances.length}</CardTitle>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div className="space-y-1">
                <CardDescription>Resolved</CardDescription>
                <CardTitle className="text-3xl">{resolvedGrievances.length}</CardTitle>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                <FileCheck className="w-6 h-6 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Notifications */}
        {grievances.some(g => g.status === "pending" && new Date(g.date) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) && (
          <div className="mb-8">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4 flex items-start space-x-4">
                <div className="pt-1">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="font-medium text-red-800">Attention Required</h3>
                  <p className="text-sm text-red-600">
                    One or more of your grievances has been pending for over a week. You can resubmit or escalate it.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Grievances Tabs */}
        <Tabs defaultValue="all" className="mt-8">
          <TabsList className="w-full sm:w-auto grid grid-cols-4 mb-8">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-6">
            {grievances.length > 0 ? (
              grievances.map(grievance => (
                <GrievanceCard key={grievance.id} {...grievance} />
              ))
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Grievances Found</h3>
                <p className="text-gray-600 mb-4">You haven't submitted any grievances yet.</p>
                <Link to="/submit-grievance">
                  <Button>Submit a Grievance</Button>
                </Link>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="pending" className="space-y-6">
            {pendingGrievances.length > 0 ? (
              pendingGrievances.map(grievance => (
                <GrievanceCard key={grievance.id} {...grievance} />
              ))
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Grievances</h3>
                <p className="text-gray-600">You don't have any grievances in the pending state.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="in-progress" className="space-y-6">
            {inProgressGrievances.length > 0 ? (
              inProgressGrievances.map(grievance => (
                <GrievanceCard key={grievance.id} {...grievance} />
              ))
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No In-Progress Grievances</h3>
                <p className="text-gray-600">You don't have any grievances in the in-progress state.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="resolved" className="space-y-6">
            {resolvedGrievances.length > 0 ? (
              resolvedGrievances.map(grievance => (
                <GrievanceCard key={grievance.id} {...grievance} />
              ))
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Resolved Grievances</h3>
                <p className="text-gray-600">You don't have any resolved grievances yet.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
