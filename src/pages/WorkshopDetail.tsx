import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { BackButton } from '@/components/BackButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getWorkshopById, Workshop } from '@/lib/workshopManager';
import { getWorkshopComments, createComment, Comment } from '@/lib/commentManager';
import { getWorkshopCertificate, Certificate } from '@/lib/certificateManager';
import { CertificateComponent } from '@/components/Certificate';
import { Calendar as CalendarIcon, Clock, Users, Video, Send } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function WorkshopDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');
  const { user } = useAuth();
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [certificate, setCertificate] = useState<Certificate | null>(null);

  useEffect(() => {
    if (id) {
      loadWorkshop();
      loadComments();
      if (user) {
        loadCertificate();
      }
    }
  }, [id, user]);

  const loadWorkshop = async () => {
    if (id) {
      const ws = await getWorkshopById(id);
      setWorkshop(ws || null);
    }
  };

  const loadComments = async () => {
    if (id) {
      const workshopComments = await getWorkshopComments(id);
      setComments(workshopComments);
    }
  };

  const loadCertificate = async () => {
    if (id && user) {
      const cert = await getWorkshopCertificate(id, user.id);
      setCertificate(cert || null);
    }
  };

  const handlePostComment = async () => {
    if (!user || !workshop || !newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    await createComment(workshop.id, user.id, user.name, newComment.trim());
    setNewComment('');
    await loadComments();
    toast.success('Comment posted!');
  };


  if (!workshop) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Workshop not found</p>
      </div>
    );
  }

  const currentSession = sessionId 
    ? workshop.sessions.find(s => s.id === sessionId)
    : workshop.sessions.find(s => s.isLive);

  const isEnrolled = user && workshop.enrolledStudents.includes(user.id);

  return (
    <div className="min-h-screen bg-background pb-[calc(5rem+var(--sab))]">
      <div className="w-full px-4 py-6">
        <div className="w-full space-y-4">
          {/* Back Button */}
          <BackButton />
          
          {/* Workshop Header */}
          <div>
            <Badge className="mb-3 text-xs">{workshop.category}</Badge>
            <h1 className="text-2xl font-bold mb-2">{workshop.title}</h1>
            <p className="text-sm text-muted-foreground mb-3">{workshop.description}</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              <span>{workshop.instructorName}</span>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {workshop.enrolledStudents.length}/{workshop.maxStudents}
              </div>
            </div>
          </div>

          {/* Live Video Player */}
          {currentSession?.isLive && currentSession.vimeoLiveUrl && isEnrolled && (
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="destructive" className="animate-pulse text-xs">LIVE</Badge>
                  <span className="text-xs font-medium">
                    {format(new Date(currentSession.date), 'MMM dd')} • {currentSession.startTime}
                  </span>
                </div>
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <iframe
                    src={currentSession.vimeoLiveUrl}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    title="Live Workshop"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Not Enrolled Message */}
          {currentSession?.isLive && !isEnrolled && (
            <Card className="border-primary">
              <CardContent className="p-6 text-center">
                <Video className="h-10 w-10 mx-auto mb-3 text-primary" />
                <h3 className="text-base font-semibold mb-1">This workshop is live now!</h3>
                <p className="text-sm text-muted-foreground">
                  Enroll to join live sessions
                </p>
              </CardContent>
            </Card>
          )}

          {/* Session Schedule */}
          <Card>
            <CardContent className="p-3">
              <h2 className="text-lg font-semibold mb-3">Session Schedule</h2>
              <div className="space-y-2">
                {workshop.sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-3 rounded-lg border ${
                      session.isLive ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-medium">
                          {format(new Date(session.date), 'EEE, MMM dd, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">{session.startTime} - {session.endTime}</span>
                        </div>
                        {session.isLive && (
                          <Badge variant="destructive" className="text-xs">LIVE</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Certificate Section */}
          {certificate && (
            <Card>
              <CardContent className="p-3">
                <CertificateComponent certificate={certificate} />
              </CardContent>
            </Card>
          )}

          {/* About Workshop */}
          <Card>
            <CardContent className="p-3">
              <h2 className="text-lg font-semibold mb-2">About This Workshop</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {workshop.description}
              </p>
            </CardContent>
          </Card>

          {/* Comments Section */}
          {isEnrolled && (
            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-base">Discussion</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-3 pt-0">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Share your thoughts..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={2}
                    className="text-sm"
                  />
                  <Button onClick={handlePostComment} size="icon" className="h-auto">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3 pr-3">
                    {comments.length === 0 ? (
                      <p className="text-center text-muted-foreground py-6 text-sm">
                        No comments yet. Be the first!
                      </p>
                    ) : (
                      comments.map((comment) => (
                        <div key={comment.id} className="p-3 rounded-lg bg-muted/50">
                          <div className="flex items-start justify-between mb-1">
                            <span className="font-semibold text-xs">{comment.userName}</span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(comment.createdAt), 'MMM dd')}
                            </span>
                          </div>
                          <p className="text-xs">{comment.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
