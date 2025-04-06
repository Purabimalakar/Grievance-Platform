
import React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const Hero: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="relative bg-white py-20 sm:py-24 md:py-28 lg:py-32 mt-16">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4 sm:mb-6 animate-fade-in">
            Your Voice Matters
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-10 leading-relaxed animate-fade-in text-balance px-2">
            Report public grievances efficiently and track their resolution through our transparent platform. We ensure your concerns reach the right authorities.
          </p>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 animate-fade-in">
            <Link to="/submit-grievance">
              <Button size={isMobile ? "default" : "lg"} className="rounded-md group">
                Submit a Grievance
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/track-grievance">
              <Button variant="outline" size={isMobile ? "default" : "lg"} className="rounded-md">
                Track Your Grievance
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="absolute inset-0 bg-grid-pattern -z-10 opacity-[0.02]" />
      
      <div className="mt-16 sm:mt-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4 sm:mb-6">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-900">Secure Submission</h3>
            <p className="text-sm sm:text-base text-gray-600">Your grievances are securely submitted and handled with the utmost confidentiality.</p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4 sm:mb-6">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-900">Transparent Tracking</h3>
            <p className="text-sm sm:text-base text-gray-600">Monitor the status of your grievance in real-time with our transparent tracking system.</p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4 sm:mb-6">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-900">Priority Handling</h3>
            <p className="text-sm sm:text-base text-gray-600">Critical issues are automatically detected and prioritized for faster resolution.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
