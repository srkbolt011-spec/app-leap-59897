import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Calendar as CalendarIcon, Clock, Users, Video, BookOpen, Award } from 'lucide-react';
import { format } from 'date-fns';
import { getWorkshops, enrollInWorkshop, getEnrolledWorkshops, Workshop } from '@/lib/workshopManager';
import { getStudentCertificates, Certificate } from '@/lib/certificateManager';
import { CertificateComponent } from '@/components/Certificate';

export default function StudentWorkshops() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [filter, setFilter] = useState<'all' | 'enrolled' | 'certificates'>('all');
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  useEffect(() => {
    loadWorkshops();
    if (user) {
      loadCertificates();
    }
  }, [user]);

  const loadWorkshops = async () => {
    const allWorkshops = await getWorkshops();
    setWorkshops(allWorkshops);
  };

  const loadCertificates = async () => {
    if (user) {
      const certs = await getStudentCertificates(user.id);
      setCertificates(certs);
    }
  };

  const filteredWorkshops = workshops.filter(workshop => {
    if (filter === 'enrolled' && user) {
      return workshop.enrolledStudents.includes(user.id);
    }
    if (filter === 'certificates') {
      return false; // Certificates shown separately
    }
    return true;
  });

  const handleEnroll = async (workshopId: string) => {
    if (!user) return;

    const success = await enrollInWorkshop(workshopId, user.id);
    if (success) {
      await loadWorkshops();
      toast.success('Successfully enrolled in workshop!');
    } else {
      toast.error('Could not enroll. Workshop may be full or you are already enrolled.');
    }
  };

  const isEnrolled = (workshopId: string) => {
    if (!user) return false;
    return workshops.find(w => w.id === workshopId)?.enrolledStudents.includes(user.id) || false;
  };

  const handleJoinLive = (workshop: Workshop, sessionId: string) => {
    navigate(`/workshop/${workshop.id}?session=${sessionId}`);
  };

  const renderWorkshopCard = (workshop: Workshop) => {
    const enrolled = isEnrolled(workshop.id);
    const isFull = workshop.enrolledStudents.length >= workshop.maxStudents;
    const liveSession = workshop.sessions.find(s => s.isLive);
    const nextSession = workshop.sessions[0];

    return (
      <Card key={workshop.id} className="group active:scale-[0.98] transition-all">
        <CardHeader className="p-3 pb-2">
          <div className="flex justify-between items-start mb-2">
            <Badge className="text-xs">{workshop.category}</Badge>
            {enrolled && <Badge variant="secondary" className="text-xs">Enrolled</Badge>}
          </div>
          <CardTitle className="line-clamp-2 text-base">{workshop.title}</CardTitle>
          <CardDescription className="line-clamp-2 text-xs">{workshop.description}</CardDescription>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="truncate">{workshop.instructorName}</span>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Users className="h-3 w-3" />
                {workshop.enrolledStudents.length}/{workshop.maxStudents}
              </div>
            </div>

            {liveSession && enrolled && (
              <Button
                className="w-full gap-2 animate-pulse h-12 text-sm"
                variant="destructive"
                onClick={() => handleJoinLive(workshop, liveSession.id)}
              >
                <Video className="h-4 w-4" />
                JOIN LIVE NOW
              </Button>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarIcon className="h-3 w-3" />
                {nextSession && format(new Date(nextSession.date), 'MMM dd, yyyy')}
                {workshop.sessions.length > 1 && ` +${workshop.sessions.length - 1}`}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {nextSession && `${nextSession.startTime} - ${nextSession.endTime}`}
              </div>
            </div>

            {!enrolled && (
              <Button
                className="w-full h-12 text-sm"
                onClick={() => handleEnroll(workshop.id)}
                disabled={isFull}
              >
                {isFull ? 'Workshop Full' : 'Enroll Now'}
              </Button>
            )}

            {enrolled && !liveSession && (
              <Button
                variant="outline"
                className="w-full h-12 text-sm"
                onClick={() => navigate(`/workshop/${workshop.id}`)}
              >
                View Details
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-[calc(5rem+var(--sab))]">
      <div className="w-full px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Workshops</h1>
          <p className="text-sm text-muted-foreground">Join live workshop sessions</p>
        </div>

        <Tabs defaultValue="all" className="w-full" onValueChange={(v) => setFilter(v as 'all' | 'enrolled' | 'certificates')}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="enrolled" className="text-xs">My Workshops</TabsTrigger>
            <TabsTrigger value="certificates" className="text-xs">Certificates</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <div className="grid gap-4 grid-cols-1">
              {filteredWorkshops.map((workshop) => renderWorkshopCard(workshop))}
            </div>
            {filteredWorkshops.length === 0 && (
              <div className="text-center py-12">
                <Video className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="text-base font-semibold mb-1">No workshops available</h3>
                <p className="text-sm text-muted-foreground">Check back soon!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="enrolled" className="mt-4">
            <div className="grid gap-4 grid-cols-1">
              {filteredWorkshops.map((workshop) => renderWorkshopCard(workshop))}
            </div>
            {filteredWorkshops.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="text-base font-semibold mb-1">No enrolled workshops</h3>
                <p className="text-sm text-muted-foreground">Browse all workshops to find one</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="certificates" className="mt-4 space-y-6">
            {certificates.length === 0 ? (
              <div className="text-center py-12">
                <Award className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="text-base font-semibold mb-1">No certificates yet</h3>
                <p className="text-sm text-muted-foreground">Complete workshops to earn certificates</p>
              </div>
            ) : (
              certificates.map((cert) => (
                <CertificateComponent key={cert.id} certificate={cert} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
