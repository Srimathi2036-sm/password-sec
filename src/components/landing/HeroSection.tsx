import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, ArrowRight, Lock, Sparkles } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-in">
            <Sparkles className="h-4 w-4" />
            <span>Trusted by 2M+ users worldwide</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-display mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Secure Your Digital Life with{' '}
            <span className="gradient-text">SecurePass</span>
          </h1>

          {/* Subtext */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Generate, store, and manage strong passwords securely with end-to-end encryption. 
            Never forget a password again.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Button variant="hero" size="xl" asChild>
              <Link to="/signup">
                Get Started Free
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
            <Button variant="hero-outline" size="xl" asChild>
              <a href="#features">Learn More</a>
            </Button>
          </div>

          {/* Hero Visual */}
          <div className="relative animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="glass-card rounded-2xl p-6 md:p-8 max-w-2xl mx-auto hover-lift">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl gradient-primary">
                  <Lock className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Password Vault</h3>
                  <p className="text-sm text-muted-foreground">256-bit AES Encryption</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {['Google Account', 'Instagram', 'LinkedIn'].map((site, i) => (
                  <div key={site} className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-sm">{site}</p>
                        <p className="text-xs text-muted-foreground">••••••••••••</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 text-xs rounded-full bg-success/10 text-success font-medium">Strong</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
