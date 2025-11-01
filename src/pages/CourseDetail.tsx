import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Clock, User as UserIcon, CheckCircle2, Circle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getAvatarColor } from '@/lib/avatarColors';
import { initializeCourseProgress, getCourseProgress, updateLessonProgress, updateVideoProgress } from '@/lib/progressManager';
import { createNotification } from '@/lib/notificationManager';
import { getCourseById, enrollInCourse, isEnrolledInCourse, getCourseEnrollmentCount } from '@/lib/courseManager';
import { Lesson, getCourseLessons } from '@/lib/lessonManager';
import { Course } from '@/lib/courseManager';
import { getWorkshopComments, createComment as createWorkshopComment } from '@/lib/commentManager';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  message: string;
  createdAt: string;
}

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [lessonProgress, setLessonProgress] = useState<{ [key: string]: boolean }>({});
  const [enrollmentCount, setEnrollmentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const sessionStartRef = useRef<number>(Date.now());
  const lastLessonRef = useRef<number>(currentLesson);

  // Track session time for accurate progress
  useEffect(() => {
    if (!user || !course || !isEnrolled || lessons.length === 0) return;

    const startTime = Date.now();
    sessionStartRef.current = startTime;

    // Update time spent every 30 seconds
    const interval = setInterval(() => {
      const timeSpent = Math.floor((Date.now() - sessionStartRef.current) / 1000);
      if (timeSpent >= 30) {
        const currentLessonId = lessons[currentLesson]?.id;
        if (currentLessonId) {
          updateVideoProgress(user.id, course.id, currentLessonId, timeSpent, 0);
          sessionStartRef.current = Date.now();
        }
      }
    }, 30000);

    return () => {
      clearInterval(interval);
      // Save any remaining time when component unmounts
      const finalTime = Math.floor((Date.now() - sessionStartRef.current) / 1000);
      if (finalTime > 0 && course && lessons.length > 0) {
        const currentLessonId = lessons[currentLesson]?.id;
        if (currentLessonId) {
          updateVideoProgress(user.id, course.id, currentLessonId, finalTime, 0);
        }
      }
    };
  }, [user, course, isEnrolled, currentLesson, lessons]);

  // Reset session timer when switching lessons
  useEffect(() => {
    if (lastLessonRef.current !== currentLesson) {
      sessionStartRef.current = Date.now();
      lastLessonRef.current = currentLesson;
    }
  }, [currentLesson]);

  useEffect(() => {
    if (!id) return;
    loadCourseData();
  }, [id, user]);

  const loadCourseData = async () => {
    if (!id) return;
    
    setLoading(true);
    const foundCourse = await getCourseById(id);
    if (foundCourse) {
      setCourse(foundCourse);
      const courseLessons = await getCourseLessons(id);
      setLessons(courseLessons);
      
      const count = await getCourseEnrollmentCount(id);
      setEnrollmentCount(count);
      
      if (user) {
        const enrolled = await isEnrolledInCourse(id, user.id);
        setIsEnrolled(enrolled);
        
        // Load progress for enrolled students
        if (enrolled) {
          const progress = await getCourseProgress(user.id, id);
          if (progress) {
            const progressMap: { [key: string]: boolean } = {};
            progress.lessons.forEach(l => {
              progressMap[l.lessonId] = l.completed;
            });
            setLessonProgress(progressMap);
          }
        }
      }
    }
    setLoading(false);
  };

  const handleEnroll = async () => {
    if (!user) {
      toast({ title: 'Please login to enroll', variant: 'destructive' });
      navigate('/login');
      return;
    }

    if (course) {
      const success = await enrollInCourse(course.id, user.id);
      if (success) {
        // Initialize progress tracking
        const lessonIds = lessons.map(l => l.id);
        await initializeCourseProgress(user.id, course.id, lessonIds);
        
        // Create enrollment notification
        await createNotification(
          user.id,
          course.id,
          course.title,
          'course',
          'enrollment',
          `You've successfully enrolled in ${course.title}!`
        );
        
        setIsEnrolled(true);
        setEnrollmentCount(prev => prev + 1);
        toast({ title: 'Successfully enrolled!' });
      } else {
        toast({ title: 'Failed to enroll', variant: 'destructive' });
      }
    }
  };

  const toggleLessonComplete = async (lessonId: string) => {
    if (!user || !course || !isEnrolled) return;
    
    const newStatus = !lessonProgress[lessonId];
    await updateLessonProgress(user.id, course.id, lessonId, newStatus, 0);
    
    setLessonProgress(prev => ({ ...prev, [lessonId]: newStatus }));
    
    toast({ 
      title: newStatus ? 'Lesson completed!' : 'Lesson marked incomplete',
      description: newStatus ? 'Keep up the great work!' : undefined
    });
  };

  const handleComment = async () => {
    if (!user) {
      toast({ title: 'Please login to comment', variant: 'destructive' });
      return;
    }

    if (comment.trim() && course) {
      // For now, store comments in localStorage as we don't have a course comments table yet
      const newComment: Comment = {
        id: Date.now().toString(),
        userId: user.id,
        userName: user.name,
        message: comment,
        createdAt: new Date().toISOString(),
      };

      const savedComments = localStorage.getItem(`course-comments-${id}`);
      const existingComments = savedComments ? JSON.parse(savedComments) : [];
      const updatedComments = [...existingComments, newComment];
      localStorage.setItem(`course-comments-${id}`, JSON.stringify(updatedComments));
      setComments(updatedComments);
      setComment('');
      toast({ title: 'Comment added!' });
    }
  };

  // Load comments from localStorage
  useEffect(() => {
    if (!id) return;
    const savedComments = localStorage.getItem(`course-comments-${id}`);
    if (savedComments) {
      setComments(JSON.parse(savedComments));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Course not found</p>
      </div>
    );
  }

  const instructorColor = getAvatarColor(course.instructorName);

  return (
    <div className="w-full pb-20">
      <div className="flex flex-col gap-4">
        {/* Video Player */}
        {lessons.length > 0 && (
          <div className="aspect-video bg-black w-full">
            <iframe
              src={`${lessons[currentLesson]?.videoUrl.replace('vimeo.com/', 'player.vimeo.com/video/')}`}
              className="w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        <div className="px-4 space-y-4">

          {/* Enroll Button */}
          {!isEnrolled && (
            <Button className="w-full touch-target" size="lg" onClick={handleEnroll}>
              Enroll Now
            </Button>
          )}

          {/* Course Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{course.title}</CardTitle>
              <CardDescription className="text-sm">{course.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {lessons.length} Lessons
                </span>
                <span className="flex items-center gap-1">
                  <UserIcon className="h-3 w-3" />
                  {enrollmentCount} Students
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Lesson List */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Lessons</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {lessons.map((lesson, index) => (
                <div
                  key={lesson.id}
                  className={`p-2 rounded transition-colors cursor-pointer ${
                    currentLesson === index
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent'
                  }`}
                  onClick={() => setCurrentLesson(index)}
                >
                  <div className="text-sm font-medium flex items-center gap-2">
                    {lessonProgress[lesson.id] ? (
                      <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                    ) : (
                      <Circle className="h-3 w-3 flex-shrink-0" />
                    )}
                    <span className="flex-1 line-clamp-1">{lesson.title}</span>
                  </div>
                  <div className="text-xs opacity-80 flex items-center gap-1 mt-1 ml-5">
                    <Clock className="h-3 w-3" />
                    {lesson.duration}
                  </div>
                  {isEnrolled && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-2 h-8 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLessonComplete(lesson.id);
                      }}
                    >
                      {lessonProgress[lesson.id] ? 'Incomplete' : 'Complete'}
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Instructor Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Instructor</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-2">
                <Avatar className="h-10 w-10" style={{ backgroundColor: instructorColor }}>
                  <AvatarFallback className="text-white font-semibold">
                    {course.instructorName[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="font-semibold text-sm">{course.instructorName}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
