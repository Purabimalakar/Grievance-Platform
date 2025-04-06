import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  User as FirebaseUser,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  confirmPasswordReset,
  sendEmailVerification,
  applyActionCode,
  PhoneAuthProvider,
  verifyPasswordResetCode,
  linkWithPhoneNumber,
  RecaptchaVerifier
} from "firebase/auth";
import { ref, set, get, child, update } from "firebase/database";
import { auth, googleProvider, rtdb } from "../config/firebase"; 
import { getFirestore } from "firebase/firestore"; 

// Define user type
export interface User {
  id: string;
  name: string;
  mobile: string;
  email: string;
  isAdmin: boolean;
  grievanceCredits: number;
  lastCreditUpdate: string;
  emailVerified: boolean;
  photoURL?: string;
}

// Define context type
interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  register: (name: string, email: string, password: string, mobile: string) => Promise<boolean>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  verifyPasswordResetCode: (code: string) => Promise<string>;
  resetPassword: (code: string, newPassword: string) => Promise<boolean>;
  sendVerificationEmail: () => Promise<boolean>;
  verifyEmail: (code: string) => Promise<boolean>;
  linkPhoneNumber: (phoneNumber: string, recaptchaContainer: string) => Promise<boolean>;
  updateUserProfile: (displayName?: string, photoURL?: string) => Promise<boolean>;
  updateUserCredits: (newCredits: number) => Promise<boolean>;
  requestPhoneOTP: (recaptchaContainer: string) => Promise<any>;
  verifyPhoneOTP: (verificationId: string, otp: string) => Promise<boolean>;
  error: string | null;
  setError: (error: string | null) => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      
      if (firebaseUser) {
        setFirebaseUser(firebaseUser);
        try {
          // Get user data from Realtime Database
          const userRef = ref(rtdb, `users/${firebaseUser.uid}`);
          const snapshot = await get(userRef);
          
          if (snapshot.exists()) {
            // User exists in database
            const userData = snapshot.val();
            setUser({
              id: firebaseUser.uid,
              name: userData.name || firebaseUser.displayName || "",
              email: firebaseUser.email || "",
              mobile: userData.mobile || "",
              isAdmin: userData.isAdmin || false,
              grievanceCredits: userData.grievanceCredits || 3,
              lastCreditUpdate: userData.lastCreditUpdate || new Date().toISOString(),
              emailVerified: firebaseUser.emailVerified,
              photoURL: firebaseUser.photoURL || null // Changed from undefined to null
            });
          } else {
            // Create new user record in database
            const newUser: User = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || "",
              email: firebaseUser.email || "",
              mobile: "",
              isAdmin: false,
              grievanceCredits: 3,
              lastCreditUpdate: new Date().toISOString(),
              emailVerified: firebaseUser.emailVerified,
              photoURL: firebaseUser.photoURL || null // Changed from undefined to null
            };
            
            await set(userRef, newUser);
            setUser(newUser);
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
          setError("Failed to load user data");
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Login with email/password
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Login failed");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Login with Google
  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      await signInWithPopup(auth, googleProvider);
      return true;
    } catch (err: any) {
      console.error("Google login error:", err);
      setError(err.message || "Google login failed");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Register new user
  const register = async (name: string, email: string, password: string, mobile: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update profile with display name
      await updateProfile(firebaseUser, { displayName: name });
      
      // Send verification email
      await sendEmailVerification(firebaseUser);
      
      // Store additional user data in Realtime Database
      const newUser: User = {
        id: firebaseUser.uid,
        name,
        email,
        mobile,
        isAdmin: false,
        grievanceCredits: 3,
        lastCreditUpdate: new Date().toISOString(),
        emailVerified: firebaseUser.emailVerified,
        photoURL: firebaseUser.photoURL || null // Changed from undefined to null
      };
      
      await set(ref(rtdb, `users/${firebaseUser.uid}`), newUser);
      
      return true;
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout user
  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error("Logout error:", err);
      setError(err.message || "Logout failed");
    }
  };

  // Request password reset email
  const requestPasswordReset = async (email: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (err: any) {
      console.error("Password reset request error:", err);
      setError(err.message || "Failed to send password reset email");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Verify password reset code
  const verifyPasswordResetCode = async (code: string): Promise<string> => {
    try {
      return await verifyPasswordResetCode(code);
    } catch (err: any) {
      console.error("Verify reset code error:", err);
      setError(err.message || "Invalid reset code");
      return "";
    }
  };

  // Reset password with code
  const resetPassword = async (code: string, newPassword: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      await confirmPasswordReset(auth, code, newPassword);
      return true;
    } catch (err: any) {
      console.error("Password reset error:", err);
      setError(err.message || "Failed to reset password");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Send verification email
  const sendVerificationEmail = async (): Promise<boolean> => {
    try {
      if (!firebaseUser) return false;
      setError(null);
      await sendEmailVerification(firebaseUser);
      return true;
    } catch (err: any) {
      console.error("Email verification error:", err);
      setError(err.message || "Failed to send verification email");
      return false;
    }
  };

  // Verify email with code
  const verifyEmail = async (code: string): Promise<boolean> => {
    try {
      setError(null);
      await applyActionCode(auth, code);
      
      // Update user state
      if (firebaseUser && user) {
        setUser({
          ...user,
          emailVerified: true
        });
      }
      
      return true;
    } catch (err: any) {
      console.error("Email verification error:", err);
      setError(err.message || "Failed to verify email");
      return false;
    }
  };

  // Create recaptcha verifier for phone auth
  const requestPhoneOTP = async (recaptchaContainer: string): Promise<any> => {
    try {
      if (!firebaseUser) return null;
      
      // Create a new RecaptchaVerifier
      const verifier = new RecaptchaVerifier(auth, recaptchaContainer, {
        size: 'normal',
        callback: () => {
          // reCAPTCHA solved, allow phone auth
        },
        'expired-callback': () => {
          // Reset the reCAPTCHA
          setError("reCAPTCHA expired. Please try again.");
        }
      });
      
      setRecaptchaVerifier(verifier);
      return verifier;
    } catch (err: any) {
      console.error("Phone verification error:", err);
      setError(err.message || "Failed to setup phone verification");
      return null;
    }
  };

  // Link phone number to account
  const linkPhoneNumber = async (phoneNumber: string, recaptchaContainer: string): Promise<boolean> => {
    try {
      if (!firebaseUser) return false;
      setError(null);
      
      const verifier = await requestPhoneOTP(recaptchaContainer);
      if (!verifier) return false;
      
      await linkWithPhoneNumber(firebaseUser, phoneNumber, verifier);
      return true;
    } catch (err: any) {
      console.error("Phone linking error:", err);
      setError(err.message || "Failed to link phone number");
      return false;
    }
  };

  // Verify phone OTP
  const verifyPhoneOTP = async (verificationId: string, otp: string): Promise<boolean> => {
    try {
      if (!firebaseUser || !user) return false;
      setError(null);
      
      // In a real implementation, you would complete the phone verification
      // using the PhoneAuthProvider.credential method and then update the user's profile
      
      // Update user profile in database with verified phone number
      await update(ref(rtdb, `users/${firebaseUser.uid}`), {
        mobile: user.mobile,
        phoneVerified: true
      });
      
      return true;
    } catch (err: any) {
      console.error("OTP verification error:", err);
      setError(err.message || "Failed to verify OTP");
      return false;
    }
  };

  // Update user profile
  const updateUserProfile = async (displayName?: string, photoURL?: string): Promise<boolean> => {
    try {
      if (!firebaseUser) return false;
      setError(null);
      
      const updates: { displayName?: string; photoURL?: string } = {};
      if (displayName !== undefined) updates.displayName = displayName;
      if (photoURL !== undefined) updates.photoURL = photoURL;
      
      await updateProfile(firebaseUser, updates);
      
      // Update user in database
      if (user) {
        const updatedUser = {
          ...user,
          name: displayName || user.name,
          photoURL: photoURL || user.photoURL
        };
        
        await update(ref(rtdb, `users/${firebaseUser.uid}`), {
          name: updatedUser.name,
          photoURL: updatedUser.photoURL || null // Added null fallback
        });
        
        setUser(updatedUser);
      }
      
      return true;
    } catch (err: any) {
      console.error("Profile update error:", err);
      setError(err.message || "Failed to update profile");
      return false;
    }
  };

  // Update user grievance credits
  const updateUserCredits = async (newCredits: number): Promise<boolean> => {
    try {
      if (!firebaseUser || !user) return false;
      setError(null);
      
      const updatedUser = {
        ...user,
        grievanceCredits: newCredits,
        lastCreditUpdate: new Date().toISOString()
      };
      
      await update(ref(rtdb, `users/${firebaseUser.uid}`), {
        grievanceCredits: newCredits,
        lastCreditUpdate: updatedUser.lastCreditUpdate
      });
      
      setUser(updatedUser);
      return true;
    } catch (err: any) {
      console.error("Credits update error:", err);
      setError(err.message || "Failed to update credits");
      return false;
    }
  };

  const isAuthenticated = !!user;

  const contextValue: AuthContextType = {
    user,
    firebaseUser,
    isAuthenticated,
    isLoading,
    login,
    loginWithGoogle,
    register,
    logout,
    requestPasswordReset,
    verifyPasswordResetCode,
    resetPassword,
    sendVerificationEmail,
    verifyEmail,
    linkPhoneNumber,
    updateUserProfile,
    updateUserCredits,
    requestPhoneOTP,
    verifyPhoneOTP,
    error,
    setError
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};