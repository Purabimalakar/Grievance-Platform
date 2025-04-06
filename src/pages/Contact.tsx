
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Phone, Mail, Clock, Loader2 } from "lucide-react";

const Contact: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // In a real app, you would make an API call to send the contact form
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
      
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully. We'll get back to you soon.",
      });
      
      // Reset form
      setName("");
      setEmail("");
      setMobile("");
      setSubject("");
      setMessage("");
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to send your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Have questions or need assistance? Reach out to our team through any of the channels below
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="bg-white">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Phone</h3>
                <p className="text-gray-600 mb-2">Call our toll-free helpline</p>
                <a href="tel:+911234567890" className="text-primary font-medium hover:underline">
                  +91 1234 567 890
                </a>
              </CardContent>
            </Card>
            
            <Card className="bg-white">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Email</h3>
                <p className="text-gray-600 mb-2">Send us an email anytime</p>
                <a href="mailto:support@grievanceportal.gov" className="text-primary font-medium hover:underline">
                  support@grievanceportal.gov
                </a>
              </CardContent>
            </Card>
            
            <Card className="bg-white">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Working Hours</h3>
                <p className="text-gray-600 mb-2">Monday to Friday</p>
                <p className="text-gray-800 font-medium">9:00 AM - 5:00 PM</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Send us a Message</CardTitle>
                  <CardDescription>
                    Fill out the form below to send us a message. We'll get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="mobile">Mobile (Optional)</Label>
                        <Input
                          id="mobile"
                          type="tel"
                          placeholder="Enter your mobile number"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                          pattern="[0-9]{10}"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="Enter message subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Enter your message"
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        className="resize-y"
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send Message"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Visit Our Office</CardTitle>
                  <CardDescription>
                    You can also visit our office in person during working hours.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">Main Office</h3>
                      <p className="text-gray-700">
                        123 Government Plaza, Sector 5,<br />
                        New Delhi, 110001
                      </p>
                    </div>
                  </div>
                  
                  <div className="rounded-lg overflow-hidden h-[300px] border border-gray-200">
                    {/* Map would go here - replacing with placeholder */}
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <p className="text-gray-500">Interactive Map</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Department Contact Information</h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">Water Department</span>
                        <a href="tel:+911234567891" className="text-primary hover:underline">+91 1234 567 891</a>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">Sanitation Department</span>
                        <a href="tel:+911234567892" className="text-primary hover:underline">+91 1234 567 892</a>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">Roads Department</span>
                        <a href="tel:+911234567893" className="text-primary hover:underline">+91 1234 567 893</a>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">Electricity Department</span>
                        <a href="tel:+911234567894" className="text-primary hover:underline">+91 1234 567 894</a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* FAQ Section */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">How do I track my grievance?</h3>
                  <p className="text-gray-700">
                    You can track your grievance using the tracking ID provided during submission. Visit the "Track Grievance" page and enter your ID.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">What is the resolution timeframe?</h3>
                  <p className="text-gray-700">
                    Most grievances are resolved within 7-14 days depending on the complexity and department involved.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I submit multiple grievances?</h3>
                  <p className="text-gray-700">
                    Yes, but there's a limit of 3 grievances per month. Additional submissions require approval.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">What if my grievance is urgent?</h3>
                  <p className="text-gray-700">
                    Urgent grievances containing critical keywords are automatically prioritized and handled with expedited care.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
