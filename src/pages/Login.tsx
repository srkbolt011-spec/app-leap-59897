import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, Mail, IdCard } from 'lucide-react';

export default function Login() {
  const [loginMode, setLoginMode] = useState<'email' | 'studentId'>('email');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithStudentId, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigateBasedOnRole(user.role);
    }
  }, [user]);

  const navigateBasedOnRole = (role: string) => {
    toast({ title: 'Welcome back!' });
    navigate('/student/dashboard', { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    let error: string | null = null;
    
    if (loginMode === 'email') {
      const result = await login(email, password);
      error = result.error;
    } else {
      const result = await loginWithStudentId(studentId, password);
      error = result.error;
    }
    
    if (error) {
      setIsLoading(false);
      toast({ 
        title: 'Login failed', 
        description: error || 'Invalid credentials',
        variant: 'destructive'
      });
    }
    // Don't set isLoading to false on success - navigation will happen via useEffect
  };

  return (
    <div className="min-h-screen flex flex-col bg-background p-4">
      {/* Header */}
      <div className="text-center pt-8 pb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl educational-gradient shadow-lg mb-4">
          <GraduationCap className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-display font-bold mb-2">Welcome to LearnFlow</h1>
        <p className="text-sm text-muted-foreground">Sign in to continue your learning journey</p>
      </div>

      {/* Login Form */}
      <div className="flex-1 w-full max-w-md mx-auto">
        <Card className="border shadow-lg bg-card">
          <CardContent className="p-5">
            <Tabs value={loginMode} onValueChange={(v) => setLoginMode(v as 'email' | 'studentId')} className="mb-4">
              <TabsList className="grid w-full grid-cols-2 h-12">
                <TabsTrigger value="email" className="flex items-center gap-2 touch-target">
                  <Mail className="h-4 w-4" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="studentId" className="flex items-center gap-2 touch-target">
                  <IdCard className="h-4 w-4" />
                  Student ID
                </TabsTrigger>
              </TabsList>
            
              <TabsContent value="email" className="mt-5">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 text-base touch-target"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 text-base touch-target"
                    />
                  </div>
                  <Button type="submit" variant="glow" size="lg" className="w-full touch-target h-12 text-base" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Continue'}
                  </Button>
                </form>
              </TabsContent>
            
              <TabsContent value="studentId" className="mt-5">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="studentId" className="text-sm font-medium">Student ID</Label>
                    <Input
                      id="studentId"
                      type="text"
                      placeholder="CS001"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                      required
                      className="h-12 text-base touch-target"
                    />
                    <p className="text-xs text-muted-foreground">Enter your Student ID (e.g., CS001, EE042)</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-student" className="text-sm font-medium">Password</Label>
                    <Input
                      id="password-student"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 text-base touch-target"
                    />
                  </div>
                  <Button type="submit" variant="glow" size="lg" className="w-full touch-target h-12 text-base" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Continue'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          
            <div className="mt-5 text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link to="/signup" className="text-primary font-semibold hover:underline touch-target">
                Sign up
              </Link>
            </div>
            
            <div className="mt-5 p-4 bg-muted/30 rounded-xl text-xs text-muted-foreground border">
              <p className="font-semibold mb-2 text-foreground text-sm">Demo Account:</p>
              <div className="space-y-1.5 text-xs">
                <p><span className="font-medium text-foreground">Email:</span> student1@test.com</p>
                <p><span className="font-medium text-foreground">Password:</span> 12345678</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
