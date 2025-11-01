import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Course, mockCourses } from '@/lib/mockData';
import { BookOpen, Edit, LogOut } from 'lucide-react';
import { getAvatarColor } from '@/lib/avatarColors';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const avatarColor = user ? getAvatarColor(user.name) : '';
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const courses = JSON.parse(localStorage.getItem('courses') || JSON.stringify(mockCourses));
    const enrolled = courses.filter((c: Course) => c.enrolledStudents.includes(user.id));
    setEnrolledCourses(enrolled);
  }, [user, navigate]);

  const handleUpdateProfile = () => {
    updateUser(editForm);
    setShowEditDialog(false);
    toast({ title: 'Profile updated!' });
  };

  if (!user) return null;

  return (
    <div className="w-full px-4 py-6 pb-20">
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <Avatar className="h-20 w-20 mx-auto mb-3" style={{ backgroundColor: avatarColor }}>
            <AvatarFallback className="text-2xl text-white font-bold">
              {user.name[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-xl font-bold mb-1">{user.name}</h1>
          <p className="text-sm text-muted-foreground mb-2">{user.email}</p>
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="touch-target">
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogDescription>Update your profile information</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="h-11 touch-target"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    className="touch-target"
                  />
                </div>
                <Button onClick={handleUpdateProfile} className="w-full touch-target">
                  Save Changes
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          {user.bio && (
            <p className="text-sm text-muted-foreground mt-3">{user.bio}</p>
          )}
        </div>

        {/* Logout Button */}
        <div className="mb-6">
          <Button 
            variant="destructive" 
            size="lg" 
            className="w-full touch-target" 
            onClick={() => {
              logout();
              navigate('/');
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">My Enrolled Courses</CardTitle>
            <CardDescription className="text-sm">Track your learning progress</CardDescription>
          </CardHeader>
          <CardContent>
            {enrolledCourses.length > 0 ? (
              <div className="space-y-3">
                {enrolledCourses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center gap-3 p-3 border rounded-lg active:scale-[0.98] transition-transform cursor-pointer"
                    onClick={() => navigate(`/course/${course.id}`)}
                  >
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-16 h-16 object-cover rounded flex-shrink-0"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm line-clamp-1">{course.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <BookOpen className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {course.lessons.length} lessons
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-4">You haven't enrolled in any courses yet.</p>
                <Button size="sm" onClick={() => navigate('/courses')} className="touch-target">
                  Browse Courses
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}