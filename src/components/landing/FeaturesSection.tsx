import React from 'react';
import { 
  Key, 
  Lock, 
  Zap, 
  AlertTriangle, 
  RefreshCw, 
  Users 
} from 'lucide-react';

const features = [
  {
    icon: Key,
    title: 'Strong Password Generator',
    description: 'Create uncrackable passwords with customizable length, symbols, and complexity settings.',
  },
  {
    icon: Lock,
    title: 'Encrypted Password Vault',
    description: 'Military-grade AES-256 encryption keeps your passwords safe from prying eyes.',
  },
  {
    icon: Zap,
    title: 'Auto-Fill & Auto-Save',
    description: 'Seamlessly fill in credentials across websites and apps with one click.',
  },
  {
    icon: AlertTriangle,
    title: 'Breach Monitoring',
    description: 'Get instant alerts if your passwords appear in any known data breaches.',
  },
  {
    icon: RefreshCw,
    title: 'Cross-Platform Sync',
    description: 'Access your vault from any device - desktop, mobile, or browser extension.',
  },
  {
    icon: Users,
    title: 'Emergency Access',
    description: 'Grant trusted contacts secure access to your vault in case of emergencies.',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">Features</span>
          <h2 className="text-3xl md:text-5xl font-bold font-display mt-4 mb-6">
            Everything You Need to Stay Secure
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to protect your digital identity and simplify password management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover-lift animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="p-3 rounded-xl gradient-primary w-fit mb-4 group-hover:shadow-glow transition-shadow duration-300">
                <feature.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold font-display mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
