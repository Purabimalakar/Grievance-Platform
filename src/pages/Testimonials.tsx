
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GrievanceCard from "@/components/GrievanceCard";
import { MessageCircle, ThumbsUp, Filter } from "lucide-react";

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

const Testimonials: React.FC = () => {
  const [activeTab, setActiveTab] = useState("testimonials");
  const [filter, setFilter] = useState("all");
  
  const filteredTestimonials = filter === "all"
    ? MOCK_TESTIMONIALS
    : MOCK_TESTIMONIALS.filter(t => t.department === filter);
  
  const departments = ["all", ...new Set(MOCK_TESTIMONIALS.map(t => t.department))];
  
  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Success Stories & Updates</h1>
          <p className="text-gray-600 mb-6">
            Read about successfully resolved grievances and official statements from departments
          </p>
          
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
                  {departments.map((dept) => (
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
                  <div key={testimonial.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="p-6">
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
                    </div>
                  </div>
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
                {MOCK_STATEMENTS.map((statement) => (
                  <Card key={statement.id}>
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
    </div>
  );
};

export default Testimonials;
