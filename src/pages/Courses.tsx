import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Course, getCourses, getCourseEnrollmentCount } from '@/lib/courseManager';
import { getCourseLessons } from '@/lib/lessonManager';
import { Search, Users as UsersIcon, Clock } from 'lucide-react';
import { getAvatarColor } from '@/lib/avatarColors';
import { Badge } from '@/components/ui/badge';

interface CourseWithStats extends Course {
  enrollmentCount: number;
  lessonCount: number;
  totalDuration: number;
}

export default function Courses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseWithStats[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    const allCourses = await getCourses();
    
    // Load stats for each course
    const coursesWithStats = await Promise.all(
      allCourses.map(async (course) => {
        const enrollmentCount = await getCourseEnrollmentCount(course.id);
        const lessons = await getCourseLessons(course.id);
        const totalDuration = lessons.reduce((acc, lesson) => {
          const mins = parseInt(lesson.duration);
          return acc + (isNaN(mins) ? 0 : mins);
        }, 0);

        return {
          ...course,
          enrollmentCount,
          lessonCount: lessons.length,
          totalDuration,
        };
      })
    );

    setCourses(coursesWithStats);
    setLoading(false);
  };

  const categories = ['all', ...Array.from(new Set(courses.map(c => c.category)))];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <p className="text-xl text-muted-foreground">Loading courses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background pb-[calc(5rem+var(--sab))]">
      <div className="w-full px-4 py-6">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-display font-bold mb-2 text-gradient">Course Catalog</h1>
          <p className="text-sm text-muted-foreground">Browse available courses</p>
        </div>

        <div className="flex flex-col gap-3 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-sm border-2 focus:border-primary"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full h-12 text-sm border-2">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredCourses.map((course) => {
            const avatarColor = getAvatarColor(course.instructorName);
            
            return (
              <Card 
                key={course.id} 
                className="group cursor-pointer border active:scale-[0.98] transition-all overflow-hidden"
                onClick={() => navigate(`/course/${course.id}`)}
              >
                <div className="relative overflow-hidden">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-40 object-cover transition-transform group-active:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-primary text-primary-foreground shadow-lg border-0 text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {course.lessonCount} lessons
                    </Badge>
                  </div>
                </div>
                
                <CardHeader className="space-y-3 p-3 pb-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 border-2 border-background" style={{ backgroundColor: avatarColor }}>
                      <AvatarFallback className="text-black dark:text-white font-semibold text-xs">
                        {course.instructorName[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <CardDescription className="text-xs font-medium truncate">{course.instructorName}</CardDescription>
                  </div>
                  <CardTitle className="line-clamp-2 text-base leading-snug">
                    {course.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-3 p-3 pt-0">
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{course.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-medium">
                      <UsersIcon className="h-3 w-3" />
                      {course.enrollmentCount}
                    </span>
                    {course.totalDuration > 0 && (
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="h-3 w-3" />
                        {course.totalDuration}m
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs font-medium border-primary/30">
                      {course.category}
                    </Badge>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs capitalize font-medium ${
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

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No courses found</h3>
            <p className="text-muted-foreground text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
