import React from 'react';

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">Pricing</h2>
          <p className="text-muted-foreground">Simple pricing for individuals and teams.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-card border border-border">
            <h3 className="font-semibold">Free</h3>
            <p className="text-muted-foreground">Basic vault for personal use.</p>
          </div>
          <div className="p-6 rounded-2xl bg-card border border-border">
            <h3 className="font-semibold">Pro</h3>
            <p className="text-muted-foreground">Advanced features and sync.</p>
          </div>
          <div className="p-6 rounded-2xl bg-card border border-border">
            <h3 className="font-semibold">Teams</h3>
            <p className="text-muted-foreground">Shared vaults for teams.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
