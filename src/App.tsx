import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { Navbar } from "./components/Navbar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { SkeletonList } from "./components/SkeletonList";

// Lazy load route components for code splitting
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Courses = lazy(() => import("./pages/Courses"));
const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const Profile = lazy(() => import("./pages/Profile"));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const StudentProgress = lazy(() => import("./pages/StudentProgress"));
const NotFound = lazy(() => import("./pages/NotFound"));
const StudentWorkshops = lazy(() => import("./pages/StudentWorkshops"));
const WorkshopDetail = lazy(() => import("./pages/WorkshopDetail"));
const queryClient = new QueryClient();
const App = () => <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="flex flex-col min-h-screen w-full">
            <Navbar />
            <main className="flex-1 w-full pb-16">
              <Suspense fallback={
                <div className="min-h-screen bg-background p-4">
                  <SkeletonList count={3} />
                </div>
              }>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/courses" element={<Courses />} />
                  <Route path="/course/:id" element={<CourseDetail />} />
                  <Route path="/student/dashboard" element={<ProtectedRoute>
                        <StudentDashboard />
                      </ProtectedRoute>} />
                  <Route path="/student/progress" element={<ProtectedRoute>
                        <StudentProgress />
                      </ProtectedRoute>} />
                  <Route path="/student/workshops" element={<ProtectedRoute>
                        <StudentWorkshops />
                      </ProtectedRoute>} />
                  <Route path="/workshop/:id" element={<ProtectedRoute>
                        <WorkshopDetail />
                      </ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>;
export default App;