'use client';

import React, { useEffect, useState } from 'react';

export default function LanternAtmosphere() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-40">
      {/* Soft ambient candlelights */}
      <div className="absolute top-12 left-1/4 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 rounded-full bg-orange-600/5 blur-3xl" />
      <div className="absolute top-1/2 right-10 w-64 h-64 rounded-full bg-yellow-500/5 blur-2xl" />

      {/* Floating subtle ember dots */}
      <div className="absolute top-[15%] left-[10%] w-1.5 h-1.5 rounded-full bg-amber-300/40 animate-float" />
      <div className="absolute top-[35%] left-[85%] w-2 h-2 rounded-full bg-orange-400/30 animate-float [animation-delay:2s]" />
      <div className="absolute top-[65%] left-[20%] w-1 h-1 rounded-full bg-yellow-200/50 animate-float [animation-delay:4s]" />
      <div className="absolute top-[80%] left-[75%] w-1.5 h-1.5 rounded-full bg-amber-400/40 animate-float [animation-delay:1.5s]" />
    </div>
  );
}
