import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { mockCourses, mockUsers, Course } from '@/lib/mockData';
import { Users as UsersIcon, Clock, BookOpen } from 'lucide-react';
import { getAvatarColor } from '@/lib/avatarColors';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { initializeCourseProgress, getCourseProgress } from '@/lib/progressManager';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('courses');
    if (saved) {
      setCourses(JSON.parse(saved));
    } else {
      localStorage.setItem('courses', JSON.stringify(mockCourses));
      setCourses(mockCourses);
    }
  }, []);

  useEffect(() => {
    if (user && courses.length > 0) {
      const enrolled = courses.filter(course => 
        course.enrolledStudents.includes(user.id)
      );
      setEnrolledCourses(enrolled);
      
      // Initialize progress tracking for enrolled courses
      enrolled.forEach(course => {
        const existingProgress = getCourseProgress(user.id, course.id);
        if (!existingProgress) {
          const lessonIds = course.lessons.map(l => l.id);
          initializeCourseProgress(user.id, course.id, lessonIds);
        }
      });
    }
  }, [user, courses]);

  return (
    <div className="min-h-screen bg-background pb-[calc(5rem+var(--sab))]">
      <div className="w-full px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold mb-2">My Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome back, {user?.name}!</p>
        </div>

        {/* Enrolled Courses Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">My Courses</h2>
            <Badge variant="secondary" className="text-xs px-2 py-1">
              {enrolledCourses.length}
            </Badge>
          </div>

          {enrolledCourses.length > 0 ? (
            <div className="space-y-3">
              {enrolledCourses.map((course) => {
                const instructor = mockUsers.find(u => u.id === course.instructorId);
                const avatarColor = instructor ? getAvatarColor(instructor.name) : '';
                const totalDuration = course.lessons.reduce((acc, lesson) => {
                  const mins = parseInt(lesson.duration);
                  return acc + (isNaN(mins) ? 0 : mins);
                }, 0);
                
                return (
                  <Card 
                    key={course.id} 
                    className="cursor-pointer border active:scale-[0.98] transition-transform"
                    onClick={() => navigate(`/course/${course.id}`)}
                  >
                    <div className="flex gap-3 p-3">
                      <img 
                        src={course.thumbnail} 
                        alt={course.title}
                        className="w-20 h-20 rounded object-cover flex-shrink-0"
                        loading="lazy"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm line-clamp-2 mb-1">{course.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <Clock className="h-3 w-3" />
                          <span>{course.lessons.length} lessons</span>
                        </div>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs capitalize ${
                            course.difficulty === 'beginner' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' :
                            course.difficulty === 'intermediate' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' :
                            'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {course.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted mb-4">
                  <BookOpen className="h-7 w-7 text-muted-foreground" />
                </div>
                <h3 className="text-base font-semibold mb-1">No Courses Yet</h3>
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  Start learning by browsing courses
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/courses')}
                >
                  Browse Courses
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
