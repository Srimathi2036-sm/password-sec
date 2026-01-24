import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input, PasswordInput } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  React.useEffect(() => {
    (async () => {
      try {
        const stored = localStorage.getItem('webauthn_email');
        if (!stored) return;
        // attempt biometric auth
        const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
        const optsRes = await fetch(`${API}/webauthn/assert/options`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: stored }) });
        if (!optsRes.ok) return;
        const opts = await optsRes.json();
        const decode = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
        const publicKey: any = { ...opts, challenge: decode(opts.challenge) };
        if (opts.allowCredentials && Array.isArray(opts.allowCredentials)) {
          publicKey.allowCredentials = opts.allowCredentials.map((c: any) => ({ id: decode(c.id), type: c.type }));
        }
        const cred: any = await (navigator.credentials as any).get({ publicKey });
        if (!cred) return;
        const id = btoa(String.fromCharCode(...new Uint8Array(cred.rawId))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        const verifyRes = await fetch(`${API}/webauthn/assert/verify`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: stored, id }) });
        if (!verifyRes.ok) return;
        const data = await verifyRes.json();
        if (data && data.token && data.user) {
          localStorage.setItem('session', JSON.stringify({ userId: data.user.id, email: data.user.email, token: data.token }));
          localStorage.setItem('user', JSON.stringify({ id: data.user.id, name: data.user.username, email: data.user.email }));
          navigate('/dashboard');
        }
      } catch (e) {
        // ignore biometric failures silently
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login(email, password);
    
    if (success) {
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });
      navigate('/dashboard');
    } else {
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      {/* Back Button */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Home</span>
      </Link>

      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-xl gradient-primary">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
            <span className="text-3xl font-bold font-display">SecurePass</span>
          </div>
          <h1 className="text-4xl font-bold font-display mb-4">
            Welcome Back
          </h1>
          <p className="text-muted-foreground text-lg">
            Your passwords are waiting for you. Log in to access your secure vault.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="glass-card rounded-2xl p-8">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
              <div className="p-2 rounded-lg gradient-primary">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold font-display">SecurePass</span>
            </div>

            <h2 className="text-2xl font-bold font-display mb-2">Login to your account</h2>
            <p className="text-muted-foreground mb-8">Enter your credentials to access your vault</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Master Password</Label>
                <PasswordInput
                  id="password"
                  placeholder="Enter your master password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="remember" className="text-sm cursor-pointer">
                    Remember me
                  </Label>
                </div>
                <a href="#" className="text-sm text-primary hover:underline">
                  Forgot password?
                </a>
              </div>

              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
