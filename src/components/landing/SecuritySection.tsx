import React from 'react';
import { Shield, Fingerprint, Eye, Globe } from 'lucide-react';

const securityFeatures = [
  {
    icon: Shield,
    title: 'Zero-Knowledge Encryption',
    description: 'Your master password never leaves your device. We can\'t see your data, and neither can hackers.',
  },
  {
    icon: Fingerprint,
    title: 'Multi-Factor Authentication',
    description: 'Add extra layers of security with TOTP, hardware keys, or biometric authentication.',
  },
  {
    icon: Eye,
    title: 'Biometric Login',
    description: 'Unlock your vault instantly with Face ID, Touch ID, or Windows Hello.',
  },
  {
    icon: Globe,
    title: 'Dark Web Monitoring',
    description: 'Continuous scanning of dark web forums and databases to detect exposed credentials.',
  },
];

export function SecuritySection() {
  return (
    <section id="security" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      </div>

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-primary font-medium text-sm uppercase tracking-wider">Security</span>
            <h2 className="text-3xl md:text-5xl font-bold font-display mt-4 mb-6">
              Bank-Level Security for Your Passwords
            </h2>
            <p className="text-muted-foreground mb-8">
              We use the same encryption standards as major banks and governments to keep your data safe. 
              Your passwords are encrypted before they leave your device.
            </p>

            <div className="space-y-4">
              {securityFeatures.map((feature, index) => (
                <div
                  key={feature.title}
                  className="flex gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="p-2 rounded-lg bg-primary/10 h-fit">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="glass-card rounded-2xl p-8 relative z-10">
              <div className="absolute inset-0 gradient-primary rounded-2xl opacity-5" />
              
              <div className="text-center mb-8">
                <div className="inline-flex p-4 rounded-full gradient-primary mb-4 animate-pulse-glow">
                  <Shield className="h-12 w-12 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold font-display">AES-256 Encryption</h3>
                <p className="text-muted-foreground mt-2">Military-grade protection</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <span className="text-sm text-muted-foreground">Encryption Standard</span>
                  <span className="text-sm font-medium text-success">AES-256-GCM</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <span className="text-sm text-muted-foreground">Key Derivation</span>
                  <span className="text-sm font-medium text-success">PBKDF2-SHA256</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <span className="text-sm text-muted-foreground">Zero-Knowledge</span>
                  <span className="text-sm font-medium text-success">Verified ✓</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <span className="text-sm text-muted-foreground">SOC 2 Compliant</span>
                  <span className="text-sm font-medium text-success">Certified ✓</span>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-accent/20 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
