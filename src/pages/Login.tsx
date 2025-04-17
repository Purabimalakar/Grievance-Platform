import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth, getRedirectPath } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Login: React.FC = () => {
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginTab, setLoginTab] = useState("email");
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get auth context
  const { loginWithGoogle, login, isAuthenticated, user } = useAuth();

  // Check if user is already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      // Use the helper function to determine where to redirect
      const redirectPath = getRedirectPath(user);
      const from = location.state?.from?.pathname || redirectPath;
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  // Handle Google login
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    
    try {
      const success = await loginWithGoogle();
      
      if (success) {
        toast({
          title: "Login successful",
          description: "Welcome to the Grievance Portal.",
        });
        // Navigation handled by the useEffect above
      }
    } catch (err) {
      // Error handled by the auth context
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle email/password login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        toast({
          title: "Login successful",
          description: "Welcome to the Grievance Portal.",
        });
        // Navigation handled by the useEffect above
      }
    } catch (err) {
      // Error handled by the auth context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-2">
            <h1 className="text-2xl font-bold">Welcome to the Grievance Portal</h1>
            <p className="text-gray-500 text-sm">Sign in to continue</p>
          </CardHeader>
          <CardContent className="space-y-4">            
            <Tabs value={loginTab} onValueChange={setLoginTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="google">Google</TabsTrigger>
              </TabsList>
              
              <TabsContent value="email" className="space-y-4">
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Button 
                        type="button" 
                        variant="link" 
                        className="p-0 h-auto text-xs text-blue-600"
                        onClick={() => navigate("/forgot-password")}
                      >
                        Forgot password?
                      </Button>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Sign In
                  </Button>
                </form>
                
                <div className="text-center text-sm">
                  <span className="text-gray-500">Don't have an account?</span>{" "}
                  <Button 
                    type="button" 
                    variant="link" 
                    className="p-0 h-auto text-blue-600"
                    onClick={() => navigate("/register")}
                  >
                    Sign up
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="google">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex items-center justify-center"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <svg
                      className="mr-2 h-4 w-4"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"
                        fill="currentColor"
                      />
                    </svg>
                  )}
                  Sign in with Google
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;