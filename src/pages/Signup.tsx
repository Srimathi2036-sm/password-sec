import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input, PasswordInput } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, ArrowLeft, Check, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { calculatePasswordStrength } from '@/lib/mockData';
import { cn } from '@/lib/utils';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();

  const passwordStrength = calculatePasswordStrength(password);

  const passwordRequirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Contains number', met: /[0-9]/.test(password) },
    { label: 'Contains special character', met: /[^A-Za-z0-9]/.test(password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    if (passwordStrength.strength === 'weak') {
      toast({
        title: "Password too weak",
        description: "Please create a stronger password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const success = await signup(name, email, password);
    
    if (success) {
      toast({
        title: "Account created!",
        description: "Please login to continue.",
      });
      navigate('/login');
    } else {
      toast({
        title: "Signup failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      {/* Back Button */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors z-10"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Home</span>
      </Link>

      {/* Left Side - Form */}
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

            <h2 className="text-2xl font-bold font-display mb-2">Create your account</h2>
            <p className="text-muted-foreground mb-8">Start securing your passwords today</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

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
                  placeholder="Create a strong master password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                
                {/* Password Strength Indicator */}
                {password && (
                  <div className="space-y-2 mt-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full transition-all duration-300",
                            passwordStrength.strength === 'weak' && "w-1/3 bg-destructive",
                            passwordStrength.strength === 'medium' && "w-2/3 bg-warning",
                            passwordStrength.strength === 'strong' && "w-full bg-success"
                          )}
                        />
                      </div>
                      <span className={cn(
                        "text-xs font-medium capitalize",
                        passwordStrength.strength === 'weak' && "text-destructive",
                        passwordStrength.strength === 'medium' && "text-warning",
                        passwordStrength.strength === 'strong' && "text-success"
                      )}>
                        {passwordStrength.strength}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {passwordRequirements.map((req) => (
                        <div key={req.label} className="flex items-center gap-1.5 text-xs">
                          {req.met ? (
                            <Check className="h-3 w-3 text-success" />
                          ) : (
                            <X className="h-3 w-3 text-muted-foreground" />
                          )}
                          <span className={req.met ? "text-success" : "text-muted-foreground"}>
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <PasswordInput
                  id="confirmPassword"
                  placeholder="Confirm your master password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-destructive">Passwords don't match</p>
                )}
              </div>

              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-6">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-primary hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>
            </p>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-xl gradient-primary">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
            <span className="text-3xl font-bold font-display">SecurePass</span>
          </div>
          <h1 className="text-4xl font-bold font-display mb-4">
            Your Security Starts Here
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Create your master password - the only password you'll ever need to remember. 
            We'll take care of the rest.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span>End-to-end encryption</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span>Zero-knowledge architecture</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span>Cross-platform sync</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
