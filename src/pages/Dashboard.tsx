import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Key, 
  Shield, 
  AlertTriangle, 
  TrendingUp,
  Lock,
  RefreshCw
} from 'lucide-react';
import { securityStats, mockPasswords } from '@/lib/mockData';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const statsCards = [
  {
    title: 'Total Passwords',
    value: securityStats.totalPasswords,
    icon: Key,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    title: 'Security Score',
    value: `${securityStats.healthScore}%`,
    icon: Shield,
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
  {
    title: 'Weak Passwords',
    value: securityStats.weakPasswords,
    icon: AlertTriangle,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
  },
  {
    title: 'Strong Passwords',
    value: securityStats.strongPasswords,
    icon: TrendingUp,
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const recentPasswords = mockPasswords.slice(0, 5);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold font-display">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's your security overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat) => (
            <Card key={stat.title} className="hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold font-display mt-1">{stat.value}</p>
                  </div>
                  <div className={cn("p-3 rounded-xl", stat.bgColor)}>
                    <stat.icon className={cn("h-6 w-6", stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Passwords */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-display">Recent Passwords</CardTitle>
              <Lock className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentPasswords.map((password) => (
                  <div
                    key={password.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center text-xl">
                        {password.icon}
                      </div>
                      <div>
                        <p className="font-medium">{password.website}</p>
                        <p className="text-sm text-muted-foreground">{password.username}</p>
                      </div>
                    </div>
                    <span className={cn(
                      "px-2 py-1 text-xs rounded-full font-medium",
                      password.strength === 'strong' && "bg-success/10 text-success",
                      password.strength === 'medium' && "bg-warning/10 text-warning",
                      password.strength === 'weak' && "bg-destructive/10 text-destructive"
                    )}>
                      {password.strength}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Security Overview */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-display">Security Overview</CardTitle>
              <Shield className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Health Score */}
                <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Password Health</span>
                    <span className="text-2xl font-bold text-success">{securityStats.healthScore}%</span>
                  </div>
                  <div className="h-2 bg-success/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-success rounded-full transition-all duration-500"
                      style={{ width: `${securityStats.healthScore}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground">Reused</p>
                    <p className="text-2xl font-bold">{securityStats.reusedPasswords}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground">Old (90+ days)</p>
                    <p className="text-2xl font-bold">{securityStats.oldPasswords}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground">Breached</p>
                    <p className="text-2xl font-bold text-success">{securityStats.breachedPasswords}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground">Medium</p>
                    <p className="text-2xl font-bold">{securityStats.mediumPasswords}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-display">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button onClick={() => navigate('/dashboard/vault?openAdd=true')} className="p-4 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors text-center group">
                <Key className="h-6 w-6 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Add Password</span>
              </button>
              <button onClick={() => navigate('/dashboard/generator')} className="p-4 rounded-xl bg-accent/10 hover:bg-accent/20 transition-colors text-center group">
                <RefreshCw className="h-6 w-6 mx-auto mb-2 text-accent group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Generate New</span>
              </button>
              <button onClick={() => navigate('/dashboard/security')} className="p-4 rounded-xl bg-success/10 hover:bg-success/20 transition-colors text-center group">
                <Shield className="h-6 w-6 mx-auto mb-2 text-success group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Security Check</span>
              </button>
              <button onClick={() => navigate('/dashboard/security')} className="p-4 rounded-xl bg-warning/10 hover:bg-warning/20 transition-colors text-center group">
                <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-warning group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Fix Weak</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
