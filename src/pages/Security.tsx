import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  AlertTriangle, 
  RefreshCw, 
  Clock, 
  Copy,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { securityStats, mockPasswords } from '@/lib/mockData';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Security = () => {
  const navigate = useNavigate();
  const weakPasswords = mockPasswords.filter(p => p.strength === 'weak');
  const mediumPasswords = mockPasswords.filter(p => p.strength === 'medium');

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-success';
    if (score >= 60) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold font-display">Security Health</h1>
          <p className="text-muted-foreground mt-1">Monitor and improve your password security.</p>
        </div>

        {/* Health Score */}
        <Card className="overflow-hidden">
          <div className="p-8 gradient-primary text-primary-foreground">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="12"
                      className="opacity-20"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="12"
                      strokeDasharray={`${(securityStats.healthScore / 100) * 352} 352`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold font-display">{securityStats.healthScore}%</span>
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold font-display mb-2">Password Health Score</h2>
                  <p className="opacity-80">Your passwords are in good shape. Keep it up!</p>
                </div>
              </div>
              <Button variant="glass" size="lg" className="bg-background/20 hover:bg-background/30">
                <RefreshCw className="h-5 w-5 mr-2" />
                Run Full Scan
              </Button>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <p className="text-3xl font-bold font-display">{securityStats.strongPasswords}</p>
              <p className="text-sm text-muted-foreground">Strong</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="h-6 w-6 text-warning" />
              </div>
              <p className="text-3xl font-bold font-display">{securityStats.mediumPasswords}</p>
              <p className="text-sm text-muted-foreground">Medium</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-3">
                <XCircle className="h-6 w-6 text-destructive" />
              </div>
              <p className="text-3xl font-bold font-display">{securityStats.weakPasswords}</p>
              <p className="text-sm text-muted-foreground">Weak</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <p className="text-3xl font-bold font-display">{securityStats.breachedPasswords}</p>
              <p className="text-sm text-muted-foreground">Breached</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Weak Passwords */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Weak Passwords
              </CardTitle>
              <span className="text-sm text-muted-foreground">{weakPasswords.length} found</span>
            </CardHeader>
            <CardContent>
              {weakPasswords.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-3" />
                  <p className="text-muted-foreground">No weak passwords found!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {weakPasswords.map((password) => (
                    <div key={password.id} className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{password.icon}</span>
                        <div>
                          <p className="font-medium">{password.website}</p>
                          <p className="text-xs text-muted-foreground">{password.username}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="text-destructive border-destructive/50 hover:bg-destructive/10" onClick={() => navigate(`/dashboard/vault?editId=${password.id}`)}>
                        Fix Now
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reused & Old Passwords */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Clock className="h-5 w-5 text-warning" />
                Password Hygiene
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Copy className="h-4 w-4 text-warning" />
                      <span className="font-medium">Reused Passwords</span>
                    </div>
                    <span className={cn(
                      "text-lg font-bold",
                      securityStats.reusedPasswords === 0 ? "text-success" : "text-warning"
                    )}>
                      {securityStats.reusedPasswords}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {securityStats.reusedPasswords === 0 
                      ? "Great! You're not reusing any passwords." 
                      : "Using the same password for multiple accounts is risky."}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-warning" />
                      <span className="font-medium">Old Passwords (90+ days)</span>
                    </div>
                    <span className={cn(
                      "text-lg font-bold",
                      securityStats.oldPasswords === 0 ? "text-success" : "text-warning"
                    )}>
                      {securityStats.oldPasswords}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Consider updating passwords that haven't been changed in over 90 days.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-success" />
                      <span className="font-medium">Breach Monitoring</span>
                    </div>
                    <span className="text-lg font-bold text-success">Active</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    We're monitoring the dark web for any leaks of your credentials.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-display">Security Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <h4 className="font-medium mb-2">Enable 2FA</h4>
                <p className="text-sm text-muted-foreground mb-4">Add an extra layer of security to your most important accounts.</p>
                <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/settings')}>Learn More</Button>
              </div>
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <h4 className="font-medium mb-2">Use Unique Passwords</h4>
                <p className="text-sm text-muted-foreground mb-4">Generate unique passwords for each account using our generator.</p>
                <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/generator')}>Generate Now</Button>
              </div>
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <h4 className="font-medium mb-2">Regular Audits</h4>
                <p className="text-sm text-muted-foreground mb-4">Run security audits monthly to catch any weak passwords.</p>
                <Button variant="outline" size="sm" onClick={() => {
                  // simple audit notification
                  const issues = weakPasswords.length;
                  alert(`Audit complete: ${issues} weak passwords found`);
                }}>Run Audit</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Security;
