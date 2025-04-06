
import React from "react";
import Hero from "@/components/Hero";
import GrievanceCard from "@/components/GrievanceCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index: React.FC = () => {
  // Sample recent testimonials
  const recentTestimonials = [
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
      
      {/* Recent Success Stories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Recent Success Stories</h2>
            <p className="text-lg text-gray-600">
              See how we've helped resolve community grievances
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {recentTestimonials.map((testimonial) => (
              <GrievanceCard
                key={testimonial.id}
                {...testimonial}
                showDetails={false}
              />
            ))}
          </div>
          
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
