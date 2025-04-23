import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ADMIN_CREDENTIALS } from "@/hooks/useAdmin";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/config/firebase";
import { ref, get, set } from "firebase/database";
import { rtdb } from "@/config/firebase";

const AdminLogin: React.FC = () => {
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState(ADMIN_CREDENTIALS.email);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Get auth context
  const { login, isAuthenticated, user, logout } = useAuth();

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      if (isAuthenticated) {
        if (user?.isAdmin) {
          // User is already logged in as admin, redirect to admin dashboard
          navigate("/admin", { replace: true });
        } else {
          // User is logged in but not as admin
          // Log them out and show error message
          await logout();
          setLoginError("You are not authorized to access the admin dashboard. Please login with admin credentials.");
        }
      }
    };
    
    checkUser();
  }, [isAuthenticated, user, navigate, logout]);

  // Handle email/password login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError(null);
    
    try {
      // Check if credentials match admin credentials
      if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        try {
          // Try to log in first
          await signInWithEmailAndPassword(auth, email, password);
          
          // If login is successful, check if user is admin and update if needed
          const user = auth.currentUser;
          if (user) {
            const userRef = ref(rtdb, `users/${user.uid}`);
            const snapshot = await get(userRef);
            
            if (snapshot.exists()) {
              const userData = snapshot.val();
              
              // If user exists but is not admin, update to make them admin
              if (!userData.isAdmin) {
                await set(userRef, {
                  ...userData,
                  isAdmin: true,
                  role: 'admin'
                });
              }
            } else {
              // Create user data if it doesn't exist
              await set(userRef, {
                id: user.uid,
                name: "Administrator",
                email: email,
                mobile: "",
                isAdmin: true,
                role: 'admin',
                grievanceCredits: 999,
                lastCreditUpdate: new Date().toISOString(),
                emailVerified: true,
                photoURL: null
              });
            }
            
            toast({
              title: "Admin login successful",
              description: "Welcome to the Admin Dashboard.",
            });
            
            navigate("/admin", { replace: true });
          }
        } catch (loginError) {
          console.log("Login failed, trying to create admin account", loginError);
          
          // If login fails, try to register the admin user
          try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Create admin user in database
            await set(ref(rtdb, `users/${user.uid}`), {
              id: user.uid,
              name: "Administrator",
              email: email,
              mobile: "",
              isAdmin: true,
              role: 'admin',
              grievanceCredits: 999,
              lastCreditUpdate: new Date().toISOString(),
              emailVerified: true,
              photoURL: null
            });
            
            toast({
              title: "Admin account created",
              description: "Admin account has been created and you are now logged in.",
            });
            
            navigate("/admin", { replace: true });
          } catch (registerError: any) {
            console.error("Error registering admin:", registerError);
            setLoginError("Failed to create admin account: " + registerError.message);
          }
        }
      } else {
        setLoginError("Invalid admin credentials. Please use the correct admin email and password.");
      }
    } catch (err: any) {
      console.error("Admin login error:", err);
      setLoginError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-blue-200">
          <CardHeader className="text-center pb-2 flex flex-col items-center">
            <div className="mb-2 p-2 bg-blue-100 rounded-full">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold">Admin Login</h1>
            <p className="text-gray-500 text-sm">Sign in to access the Admin Dashboard</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {loginError && (
              <Alert className="mb-4 bg-red-50 border-red-200 text-red-800">
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
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
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Sign In as Admin
              </Button>
            </form>
            
            <div className="text-center text-sm">
              <Button 
                type="button" 
                variant="link" 
                className="p-0 h-auto text-blue-600"
                onClick={() => navigate("/")}
              >
                Return to Homepage
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;