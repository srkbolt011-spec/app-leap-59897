import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getUserProgress, formatTimeSpent, CourseProgress, getAchievementDetails } from '@/lib/progressManager';
import { Course } from '@/lib/mockData';
import { BookOpen, Clock, CheckCircle2, TrendingUp, Award, Flame, PlayCircle } from 'lucide-react';

export default function StudentProgress() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState<CourseProgress[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!user || user.role !== 'student') {
        navigate('/');
        return;
      }

      const userProgress = await getUserProgress(user.id);
      setProgress(userProgress);

      const allCourses = JSON.parse(localStorage.getItem('courses') || '[]');
      setCourses(allCourses);
    };

    loadData();
  }, [user, navigate]);

  const getCourseDetails = (courseId: string) => {
    return courses.find(c => c.id === courseId);
  };

  const totalTimeSpent = progress.reduce((acc, p) => acc + p.totalTimeSpent, 0);
  const totalLessonsCompleted = progress.reduce(
    (acc, p) => acc + p.lessons.filter(l => l.completed).length,
    0
  );
  const totalLessons = progress.reduce((acc, p) => acc + p.lessons.length, 0);
  const averageCompletion = progress.length > 0
    ? Math.round(progress.reduce((acc, p) => acc + p.completionPercentage, 0) / progress.length)
    : 0;

  const inProgressCourses = progress.filter(p => p.completionPercentage > 0 && p.completionPercentage < 100);
  const completedCourses = progress.filter(p => p.completionPercentage === 100);
  const notStartedCourses = progress.filter(p => p.completionPercentage === 0);

  const renderCourseCard = (courseProgress: CourseProgress) => {
    const course = getCourseDetails(courseProgress.courseId);
    if (!course) return null;

    const completedLessons = courseProgress.lessons.filter(l => l.completed).length;
    const totalVideoTime = courseProgress.lessons.reduce((acc, l) => acc + l.videoWatchTime, 0);

    return (
      <Card key={courseProgress.courseId} className="active:scale-[0.98] transition-all">
        <CardHeader className="p-3 pb-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <CardTitle className="text-base">{course.title}</CardTitle>
              <CardDescription className="text-xs">{course.category}</CardDescription>
            </div>
            <Badge variant={courseProgress.completionPercentage === 100 ? "default" : "secondary"} className="text-xs">
              {courseProgress.completionPercentage}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-3 pt-0">
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{completedLessons}/{courseProgress.lessons.length} lessons</span>
            </div>
            <Progress value={courseProgress.completionPercentage} className="h-1.5" />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span className="text-xs">Total</span>
              </div>
              <p className="text-xs font-medium">{formatTimeSpent(courseProgress.totalTimeSpent)}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <PlayCircle className="h-3 w-3" />
                <span className="text-xs">Video</span>
              </div>
              <p className="text-xs font-medium">{formatTimeSpent(totalVideoTime)}</p>
            </div>
          </div>

          <Button 
            onClick={() => navigate(`/course/${course.id}`)}
            className="w-full h-10 text-sm"
            variant={courseProgress.completionPercentage === 100 ? "outline" : "default"}
          >
            {courseProgress.completionPercentage === 100 ? 'Review' : 'Continue'}
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="w-full px-4 py-6 pb-[calc(5rem+var(--sab))]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">My Progress</h1>
        <p className="text-sm text-muted-foreground">Track your learning journey</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="active:scale-95 transition-transform overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-2">
            <CardTitle className="text-xs font-medium truncate">Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-500 flex-shrink-0" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl font-bold truncate">{progress[0]?.currentStreak || 0}</div>
            <p className="text-xs text-muted-foreground truncate">days</p>
          </CardContent>
        </Card>

        <Card className="active:scale-95 transition-transform overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-2">
            <CardTitle className="text-xs font-medium truncate">Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl font-bold truncate">{formatTimeSpent(totalTimeSpent)}</div>
            <p className="text-xs text-muted-foreground truncate">learning</p>
          </CardContent>
        </Card>

        <Card className="active:scale-95 transition-transform overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-2">
            <CardTitle className="text-xs font-medium truncate">Lessons</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl font-bold truncate">{totalLessonsCompleted}</div>
            <p className="text-xs text-muted-foreground truncate">of {totalLessons}</p>
          </CardContent>
        </Card>

        <Card className="active:scale-95 transition-transform overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-2">
            <CardTitle className="text-xs font-medium truncate">Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl font-bold truncate">{progress.length}</div>
            <p className="text-xs text-muted-foreground truncate">{completedCourses.length} done</p>
          </CardContent>
        </Card>
      </div>

      {/* Achievements Section */}
      {progress.some(p => p.achievements && p.achievements.length > 0) && (
        <Card className="mb-6">
          <CardHeader className="p-3 pb-2">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Achievements</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="grid grid-cols-3 gap-2">
              {progress.flatMap(p => p.achievements || [])
                .filter((value, index, self) => self.indexOf(value) === index)
                .map(achievementId => {
                  const achievement = getAchievementDetails(achievementId);
                  return (
                    <div key={achievementId} className="text-center p-2 rounded-lg bg-muted/50 border border-border overflow-hidden">
                      <div className="text-2xl mb-1">{achievement.icon}</div>
                      <h4 className="font-semibold text-xs mb-0.5 truncate">{achievement.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">{achievement.description}</p>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course Progress Tabs */}
      <Tabs defaultValue="in-progress" className="space-y-4">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="in-progress" className="text-xs">
            In Progress ({inProgressCourses.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-xs">
            Done ({completedCourses.length})
          </TabsTrigger>
          <TabsTrigger value="not-started" className="text-xs">
            New ({notStartedCourses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="in-progress" className="space-y-3">
          {inProgressCourses.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-50 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No courses in progress</p>
                <Button 
                  variant="outline" 
                  className="mt-3 text-sm touch-target"
                  onClick={() => navigate('/courses')}
                >
                  Browse Courses
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {inProgressCourses.map(renderCourseCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-3">
          {completedCourses.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <Award className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No completed courses yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {completedCourses.map(renderCourseCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="not-started" className="space-y-3">
          {notStartedCourses.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <CheckCircle2 className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">You've started all courses!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {notStartedCourses.map(renderCourseCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}