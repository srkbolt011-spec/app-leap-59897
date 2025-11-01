import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Navbar } from "./components/Navbar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Profile from "./pages/Profile";
import StudentDashboard from "./pages/StudentDashboard";
import StudentProgress from "./pages/StudentProgress";
import NotFound from "./pages/NotFound";
import StudentWorkshops from "./pages/StudentWorkshops";
import WorkshopDetail from "./pages/WorkshopDetail";
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
            </main>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>;
export default App;