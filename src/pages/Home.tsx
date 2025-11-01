import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, Award, CheckCircle, TrendingUp, Globe, FileText, UserCheck, Rocket, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getAvatarColor } from '@/lib/avatarColors';
import { Course, getCourses } from '@/lib/courseManager';
import { getCourseLessons } from '@/lib/lessonManager';

export default function Home() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    const allCourses = await getCourses();
    setCourses(allCourses);
    setLoading(false);
  };

  const featuredCourses = courses.slice(0, 3);
  return <div className="min-h-screen flex flex-col bg-background">
      {/* Hero Section - Mobile Optimized */}
      <section className="relative py-12 px-4">
        <div className="w-full text-center">
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Rocket className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium">Launch Your Learning Journey</span>
          </div>
          
          <h1 className="text-3xl font-display font-bold mb-4 leading-tight">
            LearnFlow — Your Department's <span className="text-gradient">Learning Hub</span>
          </h1>
          
          <p className="text-base mb-8 text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Empowering departments with structured learning paths, courses, and progress tracking.
          </p>
          
          <div className="flex flex-col gap-3 max-w-sm mx-auto">
            <Button size="lg" variant="glow" onClick={() => navigate('/courses')} className="w-full touch-target h-12">
              Explore Courses
              <BookOpen className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/login')} className="w-full touch-target h-12">
              Login to Your Account
            </Button>
          </div>
          
          {/* Stats */}
          
        </div>
      </section>

      {/* Features - Mobile Optimized */}
      <section className="py-8 px-4">
        <div className="w-full max-w-2xl mx-auto">
          <div className="grid grid-cols-1 gap-4">
            <Card className="text-center border shadow-sm">
              <CardHeader className="pb-3">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl educational-gradient text-white mb-3 mx-auto">
                  <BookOpen className="h-7 w-7" />
                </div>
                <CardTitle className="text-lg mb-2">Departmental Organization</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Courses organized by department with role-based access
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center border shadow-sm">
              <CardHeader className="pb-3">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl secondary-gradient text-white mb-3 mx-auto">
                  <Users className="h-7 w-7" />
                </div>
                <CardTitle className="text-lg mb-2">Workshop Management</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Interactive workshops with scheduling and attendance
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center border shadow-sm">
              <CardHeader className="pb-3">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-accent to-accent/70 text-white mb-3 mx-auto">
                  <Award className="h-7 w-7" />
                </div>
                <CardTitle className="text-lg mb-2">Progress Tracking</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Monitor progress with analytics and certificates
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      

      {/* How to Become an Instructor */}
      


      {/* Featured Courses - Mobile Optimized */}
      <section className="py-8 px-4">
        <div className="w-full max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-display font-bold mb-2">Featured Courses</h2>
            <p className="text-sm text-muted-foreground">Discover popular learning experiences</p>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">Loading courses...</p>
            </div>
          ) : featuredCourses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No courses available yet</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4">
                {featuredCourses.map((course) => {
                  const avatarColor = getAvatarColor(course.instructorName);
                  
                  return (
                    <Card 
                      key={course.id} 
                      className="cursor-pointer border shadow-sm active:scale-[0.98] transition-transform" 
                      onClick={() => navigate(`/course/${course.id}`)}
                    >
                      <div className="relative overflow-hidden rounded-t-lg">
                        <img 
                          src={course.thumbnail} 
                          alt={course.title} 
                          className="w-full h-40 object-cover" 
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar 
                            className="h-8 w-8 border" 
                            style={{ backgroundColor: avatarColor }}
                          >
                            <AvatarFallback className="text-white text-xs font-semibold">
                              {course.instructorName[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <CardDescription className="text-xs truncate">
                            {course.instructorName}
                          </CardDescription>
                        </div>
                        <CardTitle className="line-clamp-2 text-base leading-snug">
                          {course.title}
                        </CardTitle>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {course.category}
                          </Badge>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs capitalize ${
                              course.level === 'beginner' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' :
                              course.level === 'intermediate' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' :
                              'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {course.level}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              <div className="text-center mt-6">
                <Button size="lg" variant="secondary" onClick={() => navigate('/courses')} className="w-full max-w-sm touch-target h-12">
                  View All Courses
                  <BookOpen className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Testimonials */}
      
    </div>;
}