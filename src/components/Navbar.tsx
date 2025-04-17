import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return "U";
    const names = user.name.split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  // Get the dashboard URL based on user role
  const getDashboardUrl = () => {
    return user?.isAdmin ? "/admin" : "/dashboard";
  };

  // Get logo link destination based on user role
  const getHomeLink = () => {
    return user?.isAdmin ? "/admin" : "/";
  };

  // Handle dashboard click - ensure admins go to admin dashboard
  const handleDashboardClick = () => {
    closeMenu();
    // For regular users, use the normal /dashboard route
    // For admins, redirect to /admin
    if (user?.isAdmin) {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    };
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? "bg-white/90 shadow-sm backdrop-blur-md" : "bg-white/80 backdrop-blur-sm"
    }`}>
      <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
        <Link to={getHomeLink()} className="flex items-center space-x-2" onClick={closeMenu}>
          <span className="text-lg md:text-xl font-semibold text-primary">Raise Voice</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            to="/"
            className={`text-sm font-medium hover:text-primary transition-colors ${
              isActive("/") ? "text-primary" : "text-gray-600"
            }`}
          >
            Home
          </Link>
          
          {/* Always visible links */}
          <Link
            to="/testimonials"
            className={`text-sm font-medium hover:text-primary transition-colors ${
              isActive("/testimonials") ? "text-primary" : "text-gray-600"
            }`}
          >
            Testimonials
          </Link>
          <Link
            to="/contact"
            className={`text-sm font-medium hover:text-primary transition-colors ${
              isActive("/contact") ? "text-primary" : "text-gray-600"
            }`}
          >
            Contact
          </Link>
          <Link
            to="/about"
            className={`text-sm font-medium hover:text-primary transition-colors ${
              isActive("/about") ? "text-primary" : "text-gray-600"
            }`}
          >
            About
          </Link>
          
          {/* Authenticated-only links */}
          {isAuthenticated && !user?.isAdmin && (
            <>
              <Link
                to="/submit-grievance"
                className={`text-sm font-medium hover:text-primary transition-colors ${
                  isActive("/submit-grievance") ? "text-primary" : "text-gray-600"
                }`}
              >
                Submit Grievance
              </Link>
              <Link
                to="/track-grievance"
                className={`text-sm font-medium hover:text-primary transition-colors ${
                  isActive("/track-grievance") ? "text-primary" : "text-gray-600"
                }`}
              >
                Track Grievance
              </Link>
            </>
          )}
          
          {/* Dashboard link - different for admin and normal user */}
          {isAuthenticated && (
            <button
              onClick={handleDashboardClick}
              className={`text-sm font-medium hover:text-primary transition-colors ${
                (isActive("/dashboard") || isActive("/admin")) ? "text-primary" : "text-gray-600"
              }`}
            >
              Dashboard
            </button>
          )}
        </nav>

        {/* Authentication Buttons or User Menu */}
        <div className="hidden md:flex items-center space-x-3">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {user?.name && <p className="font-medium">{user.name}</p>}
                    {user?.email && (
                      <p className="w-full truncate text-sm text-gray-500">{user.email}</p>
                    )}
                  </div>
                </div>
                <DropdownMenuItem 
                  className="cursor-pointer text-red-600 focus:text-red-600" 
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button size="sm" className="font-medium text-sm">
                Login
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-md text-gray-500 hover:text-primary hover:bg-gray-100 focus:outline-none"
          onClick={toggleMenu}
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 animate-fade-in shadow-lg">
          <div className="container mx-auto px-4 py-2">
            <nav className="flex flex-col space-y-3">
              <Link
                to={getHomeLink()}
                className={`text-sm font-medium py-2 hover:text-primary transition-colors ${
                  isActive("/") || (user?.isAdmin && isActive("/admin")) ? "text-primary" : "text-gray-600"
                }`}
                onClick={closeMenu}
              >
                Home
              </Link>
              
              {/* Always visible links */}
              <Link
                to="/testimonials"
                className={`text-sm font-medium py-2 hover:text-primary transition-colors ${
                  isActive("/testimonials") ? "text-primary" : "text-gray-600"
                }`}
                onClick={closeMenu}
              >
                Testimonials
              </Link>
              <Link
                to="/contact"
                className={`text-sm font-medium py-2 hover:text-primary transition-colors ${
                  isActive("/contact") ? "text-primary" : "text-gray-600"
                }`}
                onClick={closeMenu}
              >
                Contact
              </Link>
              <Link
                to="/about"
                className={`text-sm font-medium py-2 hover:text-primary transition-colors ${
                  isActive("/about") ? "text-primary" : "text-gray-600"
                }`}
                onClick={closeMenu}
              >
                About
              </Link>
              
              {/* Authenticated-only links */}
              {isAuthenticated ? (
                <>
                  {!user?.isAdmin && (
                    <>
                      <Link
                        to="/submit-grievance"
                        className={`text-sm font-medium py-2 hover:text-primary transition-colors ${
                          isActive("/submit-grievance") ? "text-primary" : "text-gray-600"
                        }`}
                        onClick={closeMenu}
                      >
                        Submit Grievance
                      </Link>
                      <Link
                        to="/track-grievance"
                        className={`text-sm font-medium py-2 hover:text-primary transition-colors ${
                          isActive("/track-grievance") ? "text-primary" : "text-gray-600"
                        }`}
                        onClick={closeMenu}
                      >
                        Track Grievance
                      </Link>
                    </>
                  )}
                  
                  {/* Dashboard link - different for admin and normal user */}
                  <button
                    onClick={handleDashboardClick}
                    className={`text-sm font-medium py-2 hover:text-primary transition-colors text-left ${
                      (isActive("/dashboard") || isActive("/admin")) ? "text-primary" : "text-gray-600"
                    }`}
                  >
                    Dashboard
                  </button>
                  
                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex items-center space-x-3 mb-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        {user?.name && <p className="font-medium text-sm">{user.name}</p>}
                        {user?.email && (
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">{user.email}</p>
                        )}
                      </div>
                    </div>
                    <Button 
                      variant="destructive" 
                      className="w-full mt-3 justify-center font-medium text-sm"
                      onClick={() => {
                        handleLogout();
                        closeMenu();
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                </>
              ) : (
                <Link to="/login" onClick={closeMenu}>
                  <Button className="w-full justify-center font-medium text-sm">
                    Login
                  </Button>
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;