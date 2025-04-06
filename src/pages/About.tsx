
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Shield, Users, Clock, BarChart3, MessageSquare, FileCheck } from "lucide-react";

const About: React.FC = () => {
  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">About the Grievance Platform</h1>
          <p className="text-lg text-gray-600">
            Our mission is to create a transparent, efficient, and user-friendly platform for citizens to submit and track their grievances. 
            We aim to bridge the gap between the public and government departments to ensure timely resolution of issues.
          </p>
        </div>
        
        {/* Vision & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h2>
              <p className="text-gray-700">
                To create a society where every citizen's voice is heard and every grievance is addressed promptly and effectively, 
                fostering trust between the public and government institutions.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-700">
                To provide a user-friendly platform that streamlines the grievance submission and tracking process, 
                ensures accountability, and leverages technology to prioritize critical issues for faster resolution.
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Key Features */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Key Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Secure Authentication</h3>
              <p className="text-gray-600">
                Mobile OTP-based verification ensures that only genuine citizens can access and submit grievances.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI-Powered Prioritization</h3>
              <p className="text-gray-600">
                Intelligent keyword detection automatically identifies high-priority grievances for faster attention.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Real-time Tracking</h3>
              <p className="text-gray-600">
                Citizens can track the status of their grievances in real-time with a transparent timeline of updates.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <FileCheck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Managed Submission System</h3>
              <p className="text-gray-600">
                A credit-based submission system prevents misuse while ensuring genuine grievances get attention.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Automated Notifications</h3>
              <p className="text-gray-600">
                Users receive timely updates about their grievances through automated notifications and alerts.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Transparent Testimonials</h3>
              <p className="text-gray-600">
                Resolved grievances are showcased as testimonials, creating transparency and building public trust.
              </p>
            </div>
          </div>
        </div>
        
        {/* How It Works */}
        <div className="bg-gray-50 py-16 rounded-2xl mb-16">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-12 text-center">How It Works</h2>
            
            <div className="relative">
              {/* Timeline line */}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 transform -translate-x-1/2"></div>
              
              {/* Step 1 */}
              <div className="relative mb-12 md:mb-0">
                <div className="flex flex-col md:flex-row items-center">
                  <div className="flex-1 md:text-right md:pr-8 mb-4 md:mb-16">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Register & Authenticate</h3>
                    <p className="text-gray-600">
                      Create an account using your mobile number and verify with an OTP. Set up your user profile to get started.
                    </p>
                  </div>
                  
                  <div className="z-10 flex items-center justify-center w-12 h-12 bg-primary rounded-full mb-4 md:mb-16 md:mx-0">
                    <span className="text-white font-bold">1</span>
                  </div>
                  
                  <div className="flex-1 md:text-left md:pl-8 mb-8 md:mb-16 md:hidden">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Register & Authenticate</h3>
                    <p className="text-gray-600">
                      Create an account using your mobile number and verify with an OTP. Set up your user profile to get started.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Step 2 */}
              <div className="relative mb-12 md:mb-0">
                <div className="flex flex-col md:flex-row items-center">
                  <div className="flex-1 md:text-right md:pr-8 mb-4 md:mb-0 hidden md:block">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Submit Your Grievance</h3>
                    <p className="text-gray-600">
                      Fill in the details of your grievance, add supporting documents or images if needed, and submit it.
                    </p>
                  </div>
                  
                  <div className="z-10 flex items-center justify-center w-12 h-12 bg-primary rounded-full mb-4 md:mx-0">
                    <span className="text-white font-bold">2</span>
                  </div>
                  
                  <div className="flex-1 md:text-left md:pl-8 mb-8 md:mb-16">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Submit Your Grievance</h3>
                    <p className="text-gray-600">
                      Fill in the details of your grievance, add supporting documents or images if needed, and submit it.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Step 3 */}
              <div className="relative mb-12 md:mb-0">
                <div className="flex flex-col md:flex-row items-center">
                  <div className="flex-1 md:text-right md:pr-8 mb-4 md:mb-16">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Prioritization</h3>
                    <p className="text-gray-600">
                      Our system automatically detects high-priority grievances based on keywords and assigns them appropriate priority.
                    </p>
                  </div>
                  
                  <div className="z-10 flex items-center justify-center w-12 h-12 bg-primary rounded-full mb-4 md:mb-16 md:mx-0">
                    <span className="text-white font-bold">3</span>
                  </div>
                  
                  <div className="flex-1 md:text-left md:pl-8 mb-8 md:mb-16 md:hidden">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Prioritization</h3>
                    <p className="text-gray-600">
                      Our system automatically detects high-priority grievances based on keywords and assigns them appropriate priority.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Step 4 */}
              <div className="relative mb-12 md:mb-0">
                <div className="flex flex-col md:flex-row items-center">
                  <div className="flex-1 md:text-right md:pr-8 mb-4 md:mb-0 hidden md:block">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Department Processing</h3>
                    <p className="text-gray-600">
                      The relevant department receives your grievance, acknowledges it, and begins working on a resolution.
                    </p>
                  </div>
                  
                  <div className="z-10 flex items-center justify-center w-12 h-12 bg-primary rounded-full mb-4 md:mx-0">
                    <span className="text-white font-bold">4</span>
                  </div>
                  
                  <div className="flex-1 md:text-left md:pl-8 mb-8 md:mb-16">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Department Processing</h3>
                    <p className="text-gray-600">
                      The relevant department receives your grievance, acknowledges it, and begins working on a resolution.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Step 5 */}
              <div className="relative">
                <div className="flex flex-col md:flex-row items-center">
                  <div className="flex-1 md:text-right md:pr-8 mb-4 md:mb-0">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Resolution & Feedback</h3>
                    <p className="text-gray-600">
                      Once resolved, you'll receive a notification. You can view the resolution details and provide feedback.
                    </p>
                  </div>
                  
                  <div className="z-10 flex items-center justify-center w-12 h-12 bg-primary rounded-full mb-4 md:mx-0">
                    <span className="text-white font-bold">5</span>
                  </div>
                  
                  <div className="flex-1 md:text-left md:pl-8 md:hidden">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Resolution & Feedback</h3>
                    <p className="text-gray-600">
                      Once resolved, you'll receive a notification. You can view the resolution details and provide feedback.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Benefits Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Benefits of Our Platform</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">For Citizens</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Easy and secure grievance submission
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Transparent tracking of grievance status
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Faster resolution for critical issues
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Direct communication with relevant departments
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Regular updates on grievance progress
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">For Administration</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Streamlined grievance management
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Automated prioritization of critical issues
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Reduced administrative overhead
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Comprehensive analytics and reporting
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Tools to prevent spam and misuse
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="bg-primary text-white py-16 px-4 rounded-2xl text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl mb-8 text-white/90">
              Join thousands of citizens who are using our platform to resolve their grievances and make their voices heard.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/register">
                <Button size="lg" variant="secondary" className="text-primary">
                  Create an Account
                </Button>
              </Link>
              <Link to="/submit-grievance">
                <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10">
                  Submit a Grievance
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
