import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { rtdb } from "@/config/firebase";
import { ref, get, set, push, update, remove } from "firebase/database";
import GrievanceCard from "@/components/GrievanceCard";
import { MessageCircle, ThumbsUp, Filter, Trash2, Plus, PenLine, AlertCircle, Loader2 } from "lucide-react";

// Mock testimonial data
const MOCK_TESTIMONIALS = [
  {
    id: "GR12345",
    title: "Street Light Repair in Sector 7",
    description: "The street lights in our neighborhood have been repaired promptly after filing a grievance. Thank you for the quick action!",
    date: "June 15, 2023",
    status: "resolved" as const,
    priority: "normal" as const,
    department: "Municipal Corporation",
    resolvedIn: "3 days",
  },
  {
    id: "GR12346",
    title: "Water Supply Issue Resolved",
    description: "After submitting a grievance about irregular water supply, the issue was resolved within 3 days. Appreciate the quick response.",
    date: "July 2, 2023",
    status: "resolved" as const,
    priority: "high" as const,
    department: "Water Department",
    resolvedIn: "3 days",
  },
  {
    id: "GR12347",
    title: "Road Repair Completed",
    description: "The pothole on the main road has been fixed after reporting through this portal. The road is now safe for driving.",
    date: "July 10, 2023",
    status: "resolved" as const,
    priority: "normal" as const,
    department: "Public Works Department",
    resolvedIn: "5 days",
  },
  {
    id: "GR12348",
    title: "Garbage Collection Schedule Fixed",
    description: "The irregular garbage collection issue in our colony has been resolved. The collection is now happening on time as per schedule.",
    date: "July 15, 2023",
    status: "resolved" as const,
    priority: "normal" as const,
    department: "Sanitation Department",
    resolvedIn: "4 days",
  },
  {
    id: "GR12349",
    title: "Public Park Maintenance",
    description: "The public park in our area was cleaned and properly maintained after our grievance. Now it's safe for children to play.",
    date: "July 20, 2023",
    status: "resolved" as const,
    priority: "normal" as const,
    department: "Parks Department",
    resolvedIn: "7 days",
  },
  {
    id: "GR12350",
    title: "Traffic Signal Repair",
    description: "The faulty traffic signal at the main intersection has been fixed promptly. This has improved traffic flow and safety.",
    date: "July 25, 2023",
    status: "resolved" as const,
    priority: "high" as const,
    department: "Traffic Department",
    resolvedIn: "2 days",
  },
];

// Mock official statements
const MOCK_STATEMENTS = [
  {
    id: "ST001",
    title: "Water Supply Improvement Initiative",
    content: "We are pleased to announce that the Water Department has completed upgrades to the water distribution system in Sectors 5-9. Residents should now experience improved water pressure and consistent supply.",
    date: "July 30, 2023",
    department: "Water Department",
  },
  {
    id: "ST002",
    title: "Road Maintenance Update",
    content: "The Public Works Department has completed the annual pre-monsoon road maintenance in the northern sectors of the city. Any remaining issues can be reported through the grievance portal.",
    date: "August 5, 2023",
    department: "Public Works Department",
  },
  {
    id: "ST003",
    title: "New Waste Management System",
    content: "The Sanitation Department is introducing a new segregated waste collection system starting next month. Residents are requested to separate dry and wet waste as per the guidelines provided.",
    date: "August 10, 2023",
    department: "Sanitation Department",
  },
];

// Interfaces for testimonials and statements
interface Testimonial {
  id: string;
  title: string;
  description: string;
  date: string;
  status: "resolved";
  priority: "normal" | "high" | "urgent";
  department: string;
  resolvedIn: string;
}

interface Statement {
  id: string;
  title: string;
  content: string;
  date: string;
  department: string;
  showOnHomepage?: boolean;
}

const Testimonials: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("testimonials");
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  
  // States for testimonials and statements
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [statements, setStatements] = useState<Statement[]>([]);
  
  // States for adding/editing
  const [isAddTestimonialOpen, setIsAddTestimonialOpen] = useState(false);
  const [isAddStatementOpen, setIsAddStatementOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Form data states
  const [testimonialForm, setTestimonialForm] = useState({
    id: "",
    title: "",
    description: "",
    department: "",
    resolvedIn: "",
  });
  
  const [statementForm, setStatementForm] = useState({
    id: "",
    title: "",
    content: "",
    department: "",
    showOnHomepage: true
  });

  // Confirmation dialog state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState({ id: "", type: "" });
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Try to fetch testimonials from Firebase
      const testimonialsRef = ref(rtdb, 'testimonials');
      const testimonialsSnapshot = await get(testimonialsRef);
      
      let testimonialsList = [];
      
      if (testimonialsSnapshot.exists()) {
        const testimonialsData = Object.entries(testimonialsSnapshot.val()).map(([id, data]) => ({
          id,
          ...(data as Omit<Testimonial, 'id'>)
        }));
        testimonialsList = testimonialsData;
      }
      
      // If no testimonials in database, fetch from resolved grievances 
      if (testimonialsList.length === 0) {
        const grievancesRef = ref(rtdb, 'grievances');
        const grievancesSnapshot = await get(grievancesRef);
        
        if (grievancesSnapshot.exists()) {
          const resolvedGrievances = Object.entries(grievancesSnapshot.val())
            .filter(([_, data]: [string, any]) => 
              data.status === "resolved" && !data.removeFromHomepage)
            .map(([id, data]: [string, any]) => ({
              id,
              title: data.title,
              description: data.description,
              date: data.date ? new Date(data.date).toLocaleDateString('en-US', { 
                year: 'numeric', month: 'long', day: 'numeric' 
              }) : new Date().toLocaleDateString(),
              status: "resolved" as const,
              priority: data.priority || "normal",
              department: data.department || "Department Not Specified",
              resolvedIn: data.resolvedTime || "N/A"
            }))
            .slice(0, 10); // Limit to 10 items
            
          testimonialsList = resolvedGrievances;
        }
      }
      
      setTestimonials(testimonialsList);
      
      // Try to fetch statements from Firebase
      const statementsRef = ref(rtdb, 'statements');
      const statementsSnapshot = await get(statementsRef);
      
      if (statementsSnapshot.exists()) {
        const statementsData = Object.entries(statementsSnapshot.val()).map(([id, data]) => ({
          id,
          ...(data as Omit<Statement, 'id'>)
        }));
        setStatements(statementsData);
      } else {
        // If no statements, initialize with empty array
        setStatements([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load testimonials and statements. Please try again later.",
        variant: "destructive"
      });
      setTestimonials([]);
      setStatements([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddTestimonial = async () => {
    if (!testimonialForm.title || !testimonialForm.description || !testimonialForm.department || !testimonialForm.resolvedIn) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const newTestimonial: Omit<Testimonial, 'id'> = {
        title: testimonialForm.title,
        description: testimonialForm.description,
        department: testimonialForm.department,
        resolvedIn: testimonialForm.resolvedIn,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        status: "resolved",
        priority: "normal"
      };
      
      if (isEditMode) {
        // Update existing testimonial
        const testimonialRef = ref(rtdb, `testimonials/${testimonialForm.id}`);
        await update(testimonialRef, newTestimonial);
        
        // Update local state
        setTestimonials(prev => prev.map(t => 
          t.id === testimonialForm.id ? { ...newTestimonial, id: testimonialForm.id } : t
        ));
        
        toast({
          title: "Success",
          description: "Testimonial updated successfully."
        });
      } else {
        // Add new testimonial
        const testimonialRef = ref(rtdb, 'testimonials');
        const newRef = push(testimonialRef);
        await set(newRef, newTestimonial);
        
        // Update local state with the new ID
        setTestimonials(prev => [...prev, { ...newTestimonial, id: newRef.key || Date.now().toString() }]);
        
        toast({
          title: "Success",
          description: "New testimonial added successfully."
        });
      }
      
      // Reset form and close dialog
      resetTestimonialForm();
      setIsAddTestimonialOpen(false);
    } catch (error) {
      console.error("Error adding testimonial:", error);
      toast({
        title: "Error",
        description: "Failed to save testimonial. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleAddStatement = async () => {
    if (!statementForm.title || !statementForm.content || !statementForm.department) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const newStatement: Omit<Statement, 'id'> = {
        title: statementForm.title,
        content: statementForm.content,
        department: statementForm.department,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        showOnHomepage: statementForm.showOnHomepage
      };
      
      if (isEditMode) {
        // Update existing statement
        const statementRef = ref(rtdb, `statements/${statementForm.id}`);
        await update(statementRef, newStatement);
        
        // Update local state
        setStatements(prev => prev.map(s => 
          s.id === statementForm.id ? { ...newStatement, id: statementForm.id } : s
        ));
        
        toast({
          title: "Success",
          description: "Statement updated successfully."
        });
      } else {
        // Add new statement
        const statementRef = ref(rtdb, 'statements');
        const newRef = push(statementRef);
        await set(newRef, newStatement);
        
        // Update local state with the new ID
        setStatements(prev => [...prev, { ...newStatement, id: newRef.key || Date.now().toString() }]);
        
        toast({
          title: "Success",
          description: "New statement added successfully."
        });
      }
      
      // Reset form and close dialog
      resetStatementForm();
      setIsAddStatementOpen(false);
    } catch (error) {
      console.error("Error adding statement:", error);
      toast({
        title: "Error",
        description: "Failed to save statement. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteItem = async () => {
    if (!itemToDelete.id || !itemToDelete.type) return;
    
    setIsDeleting(true);
    
    try {
      if (itemToDelete.type === "testimonial") {
        const testimonialRef = ref(rtdb, `testimonials/${itemToDelete.id}`);
        await remove(testimonialRef);
        setTestimonials(prev => prev.filter(t => t.id !== itemToDelete.id));
      } else {
        const statementRef = ref(rtdb, `statements/${itemToDelete.id}`);
        await remove(statementRef);
        setStatements(prev => prev.filter(s => s.id !== itemToDelete.id));
      }
      
      toast({
        title: "Success",
        description: `${itemToDelete.type === "testimonial" ? "Testimonial" : "Statement"} deleted successfully.`
      });
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Error",
        description: "Failed to delete. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };
  
  const openEditTestimonial = (testimonial: Testimonial) => {
    setTestimonialForm({
      id: testimonial.id,
      title: testimonial.title,
      description: testimonial.description,
      department: testimonial.department,
      resolvedIn: testimonial.resolvedIn
    });
    setIsEditMode(true);
    setIsAddTestimonialOpen(true);
  };
  
  const openEditStatement = (statement: Statement) => {
    setStatementForm({
      id: statement.id,
      title: statement.title,
      content: statement.content,
      department: statement.department,
      showOnHomepage: statement.showOnHomepage || false
    });
    setIsEditMode(true);
    setIsAddStatementOpen(true);
  };
  
  const confirmDelete = (id: string, type: string) => {
    setItemToDelete({ id, type });
    setDeleteConfirmOpen(true);
  };
  
  const resetTestimonialForm = () => {
    setTestimonialForm({
      id: "",
      title: "",
      description: "",
      department: "",
      resolvedIn: ""
    });
    setIsEditMode(false);
  };
  
  const resetStatementForm = () => {
    setStatementForm({
      id: "",
      title: "",
      content: "",
      department: "",
      showOnHomepage: true
    });
    setIsEditMode(false);
  };
  
  const departmentOptions = Array.from(
    new Set([
      ...testimonials.map(t => t.department),
      ...statements.map(s => s.department),
      "Municipal Corporation",
      "Water Department",
      "Public Works Department",
      "Sanitation Department",
      "Parks Department",
      "Traffic Department"
    ])
  );
  
  const filteredTestimonials = filter === "all"
    ? testimonials
    : testimonials.filter(t => t.department === filter);
  
  const allDepartments = ["all", ...Array.from(new Set(testimonials.map(t => t.department)))];
  
  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-gray-600">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Success Stories & Updates</h1>
              <p className="text-gray-600">
                Read about successfully resolved grievances and official statements from departments
              </p>
            </div>
            
            {isAuthenticated && user?.isAdmin && (
              <div className="flex gap-2">
                {activeTab === "testimonials" ? (
                  <Button 
                    onClick={() => {
                      resetTestimonialForm();
                      setIsAddTestimonialOpen(true);
                    }}
                    className="flex items-center"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Success Story
                  </Button>
                ) : (
                  <Button 
                    onClick={() => {
                      resetStatementForm();
                      setIsAddStatementOpen(true);
                    }}
                    className="flex items-center"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Statement
                  </Button>
                )}
              </div>
            )}
          </div>
          
          <Tabs 
            defaultValue="testimonials" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="mb-8"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="testimonials" className="flex items-center">
                <ThumbsUp className="mr-2 h-4 w-4" />
                Success Stories
              </TabsTrigger>
              <TabsTrigger value="statements" className="flex items-center">
                <MessageCircle className="mr-2 h-4 w-4" />
                Official Statements
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="testimonials" className="mt-6">
              {/* Department Filter */}
              <div className="mb-6 overflow-x-auto pb-2">
                <div className="flex space-x-2">
                  <div className="bg-gray-100 rounded-full px-3 py-1 flex items-center text-gray-700 text-sm font-medium mr-2">
                    <Filter className="mr-1 h-3 w-3" />
                    Filter:
                  </div>
                  {allDepartments.map((dept) => (
                    <Button
                      key={dept}
                      variant={filter === dept ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilter(dept)}
                      className="rounded-full whitespace-nowrap"
                    >
                      {dept === "all" ? "All Departments" : dept}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-6">
                {filteredTestimonials.map((testimonial) => (
                  <Card key={testimonial.id} className="relative overflow-visible">
                    {isAuthenticated && user?.isAdmin && (
                      <div className="absolute -right-3 -top-3 flex gap-1 z-10">
                        <Button 
                          size="icon" 
                          variant="outline" 
                          className="h-8 w-8 rounded-full bg-white shadow-md"
                          onClick={() => openEditTestimonial(testimonial)}
                        >
                          <PenLine className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="outline" 
                          className="h-8 w-8 rounded-full bg-white shadow-md text-red-500 hover:text-red-600"
                          onClick={() => confirmDelete(testimonial.id, "testimonial")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{testimonial.title}</h3>
                        <span className="text-sm text-gray-500">{testimonial.date}</span>
                      </div>
                      
                      <p className="text-gray-700 mb-4">{testimonial.description}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-900">Department:</span>{" "}
                          <span className="text-gray-700">{testimonial.department}</span>
                        </div>
                        
                        <div>
                          <span className="font-medium text-gray-900">Resolved in:</span>{" "}
                          <span className="text-gray-700">{testimonial.resolvedIn}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {filteredTestimonials.length === 0 && (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Stories Found</h3>
                    <p className="text-gray-600">No success stories found for the selected department.</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="statements" className="mt-6">
              <div className="space-y-6">
                {statements.map((statement) => (
                  <Card key={statement.id} className="relative overflow-visible">
                    {isAuthenticated && user?.isAdmin && (
                      <div className="absolute -right-3 -top-3 flex gap-1 z-10">
                        <Button 
                          size="icon" 
                          variant="outline" 
                          className="h-8 w-8 rounded-full bg-white shadow-md"
                          onClick={() => openEditStatement(statement)}
                        >
                          <PenLine className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="outline" 
                          className="h-8 w-8 rounded-full bg-white shadow-md text-red-500 hover:text-red-600"
                          onClick={() => confirmDelete(statement.id, "statement")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{statement.title}</h3>
                        <span className="text-sm text-gray-500">{statement.date}</span>
                      </div>
                      
                      <p className="text-gray-700 mb-4">{statement.content}</p>
                      
                      <div className="text-sm">
                        <span className="font-medium text-gray-900">Issued by:</span>{" "}
                        <span className="text-gray-700">{statement.department}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {statements.length === 0 && (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Statements Found</h3>
                    <p className="text-gray-600">There are no official statements at the moment.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Call-to-Action */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center mt-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Have an issue that needs resolution?
            </h2>
            <p className="text-gray-700 mb-6">
              Submit your grievance through our platform and join hundreds of citizens who have successfully resolved their issues.
            </p>
            <Button className="mx-auto">Submit a Grievance</Button>
          </div>
        </div>
      </div>
      
      {/* Add Testimonial Dialog */}
      <Dialog open={isAddTestimonialOpen} onOpenChange={setIsAddTestimonialOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Success Story" : "Add New Success Story"}</DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? "Update details of the existing success story" 
                : "Share a new success story with citizens"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="testimonial-title">Title</Label>
              <Input
                id="testimonial-title"
                value={testimonialForm.title}
                onChange={(e) => setTestimonialForm({...testimonialForm, title: e.target.value})}
                placeholder="Enter a descriptive title"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="testimonial-description">Description</Label>
              <Textarea
                id="testimonial-description"
                value={testimonialForm.description}
                onChange={(e) => setTestimonialForm({...testimonialForm, description: e.target.value})}
                placeholder="Describe the success story in detail"
                className="min-h-[120px]"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="testimonial-department">Department</Label>
              <Select
                value={testimonialForm.department}
                onValueChange={(value) => setTestimonialForm({...testimonialForm, department: value})}
              >
                <SelectTrigger id="testimonial-department">
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                  {departmentOptions.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="testimonial-resolved">Resolved In</Label>
              <Input
                id="testimonial-resolved"
                value={testimonialForm.resolvedIn}
                onChange={(e) => setTestimonialForm({...testimonialForm, resolvedIn: e.target.value})}
                placeholder="E.g. 3 days, 1 week"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTestimonialOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTestimonial}>
              {isEditMode ? "Update" : "Add"} Success Story
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Statement Dialog */}
      <Dialog open={isAddStatementOpen} onOpenChange={setIsAddStatementOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Official Statement" : "Add New Official Statement"}</DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? "Update details of the existing statement" 
                : "Publish a new official statement to citizens"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="statement-title">Title</Label>
              <Input
                id="statement-title"
                value={statementForm.title}
                onChange={(e) => setStatementForm({...statementForm, title: e.target.value})}
                placeholder="Enter a descriptive title"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="statement-content">Content</Label>
              <Textarea
                id="statement-content"
                value={statementForm.content}
                onChange={(e) => setStatementForm({...statementForm, content: e.target.value})}
                placeholder="Write the official statement content"
                className="min-h-[150px]"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="statement-department">Department</Label>
              <Select
                value={statementForm.department}
                onValueChange={(value) => setStatementForm({...statementForm, department: value})}
              >
                <SelectTrigger id="statement-department">
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                  {departmentOptions.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="show-on-homepage"
                checked={statementForm.showOnHomepage}
                onChange={(e) => setStatementForm({...statementForm, showOnHomepage: e.target.checked})}
                className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <Label htmlFor="show-on-homepage" className="text-sm font-medium cursor-pointer">
                Show this notice on homepage
              </Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddStatementOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStatement}>
              {isEditMode ? "Update" : "Add"} Statement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {itemToDelete.type}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteItem}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Testimonials;
