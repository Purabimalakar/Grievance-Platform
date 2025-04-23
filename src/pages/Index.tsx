import React, { useState, useEffect } from "react";
import Hero from "@/components/Hero";
import GrievanceCard from "@/components/GrievanceCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { rtdb } from "@/config/firebase";
import { ref, get } from "firebase/database";
import { Grievance } from "@/types/grievance";
import { Loader2, Bell } from "lucide-react";

const Index: React.FC = () => {
  const [resolvedGrievances, setResolvedGrievances] = useState<Grievance[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch resolved grievances and notices from Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch resolved grievances
        const grievancesRef = ref(rtdb, 'grievances');
        const grievancesSnapshot = await get(grievancesRef);
        
        if (grievancesSnapshot.exists()) {
          const grievancesData = grievancesSnapshot.val();
          const grievancesArray = Object.keys(grievancesData)
            .map(key => ({
              id: key,
              ...grievancesData[key]
            }))
            .filter(g => g.status === "resolved" && !g.removeFromHomepage); // Only include resolved that aren't flagged to be removed
          
          // Sort by date and get the latest 3
          const resolved = grievancesArray
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 3);
          
          setResolvedGrievances(resolved);
        }

        // Fetch official notices/statements
        const statementsRef = ref(rtdb, 'statements');
        const statementsSnapshot = await get(statementsRef);
        
        if (statementsSnapshot.exists()) {
          const statementsData = statementsSnapshot.val();
          const statementsArray = Object.keys(statementsData)
            .map(key => ({
              id: key,
              ...statementsData[key]
            }))
            .filter(s => s.showOnHomepage !== false); // Only include statements that should be shown on homepage
          
          // Sort by date and get the latest 2
          const recentStatements = statementsArray
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 2);
          
          setNotices(recentStatements);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Sample fallback testimonials (only used if no real resolved grievances exist)
  const fallbackTestimonials = [
    {
      id: "GR12345",
      title: "Street Light Repair in Sector 7",
      description: "The street lights in our neighborhood have been repaired promptly after filing a grievance. Thank you for the quick action!",
      date: "June 15, 2023",
      status: "resolved" as const,
      priority: "normal" as const,
    },
    {
      id: "GR12346",
      title: "Water Supply Issue Resolved",
      description: "After submitting a grievance about irregular water supply, the issue was resolved within 3 days. Appreciate the quick response.",
      date: "July 2, 2023",
      status: "resolved" as const,
      priority: "high" as const,
    },
    {
      id: "GR12347",
      title: "Road Repair Completed",
      description: "The pothole on the main road has been fixed after reporting through this portal. The road is now safe for driving.",
      date: "July 10, 2023",
      status: "resolved" as const,
      priority: "normal" as const,
    },
  ];

  // Use real resolved grievances if available, otherwise use fallbacks
  const testimonialsToShow = resolvedGrievances.length > 0 ? resolvedGrievances : fallbackTestimonials;

  return (
    <div className="animate-fade-in">
      <Hero />
      
      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">
              Follow these simple steps to submit and track your grievances
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="relative flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Register & Login</h3>
              <p className="text-gray-600">
                Create an account using your mobile number and set up your profile to begin.
              </p>
              
              {/* Connector (visible on desktop) */}
              <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gray-200 -z-10 transform -translate-x-8"></div>
            </div>
            
            {/* Step 2 */}
            <div className="relative flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Submit Grievance</h3>
              <p className="text-gray-600">
                Fill in the details of your grievance with as much information as possible.
              </p>
              
              {/* Connector (visible on desktop) */}
              <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gray-200 -z-10 transform -translate-x-8"></div>
            </div>
            
            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Track Resolution</h3>
              <p className="text-gray-600">
                Monitor the status of your grievance and receive updates until resolution.
              </p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Link to="/register">
              <Button size="lg">Get Started Now</Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Official Notices Section - New */}
      {notices.length > 0 && (
        <section className="py-8 bg-blue-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center mb-6">
                <Bell className="h-5 w-5 text-primary mr-2" />
                <h2 className="text-xl font-bold text-gray-900">Official Notices</h2>
              </div>
              
              <div className="space-y-4">
                {notices.map((notice) => (
                  <Card key={notice.id} className="border-l-4 border-l-primary">
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{notice.title}</h3>
                        <span className="text-sm text-gray-500">{notice.date}</span>
                      </div>
                      <p className="text-gray-700 text-sm mb-2">{notice.content.length > 150 
                        ? `${notice.content.substring(0, 150)}...` 
                        : notice.content}
                      </p>
                      <div className="text-sm">
                        <span className="font-medium text-gray-900">Issued by:</span>{" "}
                        <span className="text-gray-700">{notice.department}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                <div className="text-center mt-4">
                  <Link to="/testimonials">
                    <Button variant="outline" size="sm">View All Notices</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
      
      {/* Recent Success Stories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Recent Success Stories</h2>
            <p className="text-lg text-gray-600">
              See how we've helped resolve community grievances
            </p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-gray-600">Loading success stories...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {testimonialsToShow.map((testimonial) => (
                <GrievanceCard
                  key={testimonial.id}
                  {...testimonial}
                  showDetails={false}
                />
              ))}
            </div>
          )}
          
          <div className="mt-12 text-center">
            <Link to="/testimonials">
              <Button variant="outline">View All Testimonials</Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Statistics Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <h3 className="text-4xl font-bold mb-2">2,500+</h3>
              <p className="text-primary-foreground/80">Grievances Resolved</p>
            </div>
            
            <div className="text-center">
              <h3 className="text-4xl font-bold mb-2">85%</h3>
              <p className="text-primary-foreground/80">Resolution Rate</p>
            </div>
            
            <div className="text-center">
              <h3 className="text-4xl font-bold mb-2">48 hrs</h3>
              <p className="text-primary-foreground/80">Avg. Response Time</p>
            </div>
            
            <div className="text-center">
              <h3 className="text-4xl font-bold mb-2">10,000+</h3>
              <p className="text-primary-foreground/80">Registered Users</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Submit Your Grievance?</h2>
            <p className="text-lg text-gray-600 mb-8">
              Join thousands of citizens who have successfully resolved their grievances through our platform.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/submit-grievance">
                <Button size="lg">Submit a Grievance</Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" size="lg">Create an Account</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
