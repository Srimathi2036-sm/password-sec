import React from 'react';

export function AboutSection() {
  return (
    <section id="about" className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">About SecurePass</h2>
          <p className="text-muted-foreground">Built with privacy and security in mind.</p>
        </div>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-muted-foreground">SecurePass is a demo password manager focused on secure storage and ease of use.</p>
        </div>
      </div>
    </section>
  );
}
