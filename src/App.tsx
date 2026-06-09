import type { UserRole } from "@/lib/types";
import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const About = lazy(() => import("./pages/About"));
const Properties = lazy(() => import("./pages/Properties"));
const SignIn = lazy(() => import("./pages/SignIn"));
const SignUp = lazy(() => import("./pages/SignUp"));
const AddProperty = lazy(() => import("./pages/AddProperty"));
const PropertyDetail = lazy(() => import("./pages/PropertyDetail"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ProfileSettings = lazy(() => import("./pages/ProfileSettings"));
const Saved = lazy(() => import("./pages/Saved"));
const Admin = lazy(() => import("./pages/Admin"));
const SemiAdmin = lazy(() => import("./pages/SemiAdmin"));
const CompleteProfile = lazy(() => import("./pages/CompleteProfile"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/complete-profile" element={<ProtectedRoute><CompleteProfile /></ProtectedRoute>} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/add-property" element={<ProtectedRoute allowedRoles={['owner', 'agent']}><AddProperty /></ProtectedRoute>} />
            <Route path="/property/:id" element={<PropertyDetail />} />
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['owner', 'agent', 'hotel_manager']}><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
            <Route path="/saved" element={<ProtectedRoute><Saved /></ProtectedRoute>} />
            <Route path="/admin-panel" element={<ProtectedRoute allowedRoles={['admin' as UserRole]}><Admin /></ProtectedRoute>} />
            <Route path="/semiadmin" element={<ProtectedRoute allowedRoles={['semi_admin' as UserRole, 'admin' as UserRole]}><SemiAdmin /></ProtectedRoute>} />
            {/* HotelProfile routes removed */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
