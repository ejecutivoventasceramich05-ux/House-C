import React from 'react';

export function getGradientColors(avatarColor: string) {
  // Extract hex colors based on Tailwind gradient classes
  let stop1 = '#f97316';
  let stop2 = '#dc2626';

  if (avatarColor.includes('emerald') || avatarColor.includes('green')) {
    stop1 = '#10b981';
    stop2 = '#059669';
  } else if (avatarColor.includes('blue') || avatarColor.includes('indigo')) {
    stop1 = '#3b82f6';
    stop2 = '#4f46e5';
  } else if (avatarColor.includes('pink') || avatarColor.includes('purple')) {
    stop1 = '#ec4899';
    stop2 = '#8b5cf6';
  } else if (avatarColor.includes('yellow') || avatarColor.includes('amber')) {
    stop1 = '#f59e0b';
    stop2 = '#d97706';
  } else if (avatarColor.includes('cyan')) {
    stop1 = '#06b6d4';
    stop2 = '#3b82f6';
  } else if (avatarColor.includes('orange') || avatarColor.includes('red')) {
    stop1 = '#f97316';
    stop2 = '#dc2626';
  }

  return { stop1, stop2 };
}

interface RaceCarProps {
  styleName: string; // 'formula' | 'gt' | 'cyber' | 'kart'
  avatarColor: string;
  className?: string;
}

export function RaceCar({ styleName, avatarColor, className = "w-12 h-6" }: RaceCarProps) {
  const { stop1, stop2 } = getGradientColors(avatarColor);
  const gradId = `carGrad-${styleName}-${avatarColor.replace(/\s+/g, '-')}`;

  // Style 1: Retro F1 Formula Car
  if (styleName === 'formula') {
    return (
      <svg viewBox="0 0 64 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={stop1} />
            <stop offset="100%" stopColor={stop2} />
          </linearGradient>
        </defs>
        {/* Rear Wing / Spoiler */}
        <path d="M4 6 H10 V14 H4 Z" fill="#1e293b" />
        <path d="M2 4 H12 V6 H2 Z" fill={`url(#${gradId})`} />
        <path d="M6 10 L8 16" stroke="#64748b" strokeWidth="2" />
        
        {/* Main Body */}
        <path d="M10 16 L16 13 L24 13 L32 11 L42 11 L48 14 L56 18 L58 21 L52 23 L10 23 Z" fill={`url(#${gradId})`} />
        
        {/* Cockpit / Helmet */}
        <path d="M28 13 Q33 9 37 11 Q39 12 40 14 Z" fill="#0f172a" />
        <circle cx="33" cy="13.5" r="2" fill="#ffffff" stroke="#1e293b" strokeWidth="1" /> {/* White helmet */}
        <path d="M34 13.5 H36" stroke="#00d2ff" strokeWidth="1" /> {/* Visor */}
        
        {/* Air Intake Scoop */}
        <path d="M24 13 L27 8 L31 11 Z" fill="#0f172a" />
        
        {/* Front Wing */}
        <path d="M54 21 L61 21 L62 24 L52 24 Z" fill="#1e293b" />
        <path d="M56 20 H60 V22 H56 Z" fill={stop1} />
        
        {/* Wheels with retro yellow/white hubcaps */}
        {/* Rear Wheel */}
        <circle cx="16" cy="22" r="6.5" fill="#090d16" stroke="#475569" strokeWidth="1.5" />
        <circle cx="16" cy="22" r="3" fill="#334155" />
        <circle cx="16" cy="22" r="1.5" fill="#ffd700" />
        {/* Front Wheel */}
        <circle cx="48" cy="22" r="5.5" fill="#090d16" stroke="#475569" strokeWidth="1.5" />
        <circle cx="48" cy="22" r="2.5" fill="#334155" />
        <circle cx="48" cy="22" r="1" fill="#ffd700" />
        
        {/* Aero highlight strip */}
        <path d="M24 15 H44" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
        <path d="M18 18 H38" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
      </svg>
    );
  }

  // Style 2: Arcade Wedge Sportscar GT (OutRun vibe)
  if (styleName === 'gt') {
    return (
      <svg viewBox="0 0 64 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={stop1} />
            <stop offset="100%" stopColor={stop2} />
          </linearGradient>
        </defs>
        {/* Rear wedge spoiler integrated */}
        <path d="M6 11 L10 10 L16 12 Z" fill="#1e293b" />
        
        {/* Sleek wedge chassis */}
        <path d="M8 20 L6 13 L16 11 L32 11 L50 17 L58 19 L60 21 L58 23 L8 23 Z" fill={`url(#${gradId})`} />
        
        {/* Cabin Glass window (retro cyan shade) */}
        <path d="M20 15 L26 12 L38 12 L44 17 Z" fill="#1e293b" />
        <path d="M24 13 L36 13 L42 16.5 Z" fill="#00d2ff" opacity="0.8" />
        
        {/* Side panel intake vent lines */}
        <path d="M14 16 H18" stroke="#0f172a" strokeWidth="1.5" />
        <path d="M13 18 H17" stroke="#0f172a" strokeWidth="1.5" />
        
        {/* Wheels with silver star rims */}
        {/* Rear Wheel */}
        <circle cx="16" cy="22" r="6" fill="#0f172a" stroke="#475569" strokeWidth="1" />
        <circle cx="16" cy="22" r="3" fill="#cbd5e1" />
        <circle cx="16" cy="22" r="1" fill="#1e293b" />
        {/* Front Wheel */}
        <circle cx="48" cy="22" r="6" fill="#0f172a" stroke="#475569" strokeWidth="1" />
        <circle cx="48" cy="22" r="3" fill="#cbd5e1" />
        <circle cx="48" cy="22" r="1" fill="#1e293b" />
        
        {/* Headlight popped down or yellow indicator */}
        <path d="M54 18.5 L57 19.5" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" />
        {/* Tail lights red glow */}
        <path d="M6 14.5 L6 18" stroke="#ef4444" strokeWidth="2" />
      </svg>
    );
  }

  // Style 3: Futuristic Cyber Speedster
  if (styleName === 'cyber') {
    return (
      <svg viewBox="0 0 64 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={stop1} />
            <stop offset="100%" stopColor={stop2} />
          </linearGradient>
        </defs>
        {/* Cyber Neon Glow Lines Underneath */}
        <path d="M12 25 H50" stroke="#00ff87" strokeWidth="2.5" opacity="0.8" className="animate-pulse" />
        
        {/* Swept back geometric frame */}
        <path d="M4 14 L12 8 L24 8 L36 9 L54 15 L61 19 L56 23 L6 23 Z" fill={`url(#${gradId})`} />
        
        {/* High-tech Dark Cockpit Dome */}
        <path d="M22 13 L34 10 L44 15 Z" fill="#0f172a" />
        <path d="M25 12 L33 10.5 L40 14 Z" fill="#9d50bb" opacity="0.7" /> {/* Purple sci-fi glass */}
        
        {/* Double jet exhaust rocket boosters on the rear */}
        <rect x="2" y="11" width="4" height="4" rx="1" fill="#475569" />
        <rect x="2" y="17" width="4" height="4" rx="1" fill="#475569" />
        {/* Exhaust fire */}
        <path d="M0 13 C-4 13 -4 11 -8 13 C-4 15 -4 13 0 13 Z" fill="#00ff87" opacity="0.9" />
        <path d="M0 19 C-4 19 -4 17 -8 19 C-4 21 -4 19 0 19 Z" fill="#00ff87" opacity="0.9" />
        
        {/* Covered wheel wells (Magnetic suspension pods) */}
        {/* Rear Pod */}
        <rect x="11" y="19" width="10" height="5" rx="2" fill="#1e293b" stroke="#00ff87" strokeWidth="1" />
        {/* Front Pod */}
        <rect x="42" y="19" width="10" height="5" rx="2" fill="#1e293b" stroke="#00ff87" strokeWidth="1" />
        
        {/* Hexagonal / Line decals */}
        <path d="M14 11 H20" stroke="#ffffff" strokeWidth="1" opacity="0.5" />
        <path d="M46 17 L50 18" stroke="#ffffff" strokeWidth="1" opacity="0.5" />
      </svg>
    );
  }

  // Style 4: Retro Super Kart
  return (
    <svg viewBox="0 0 64 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={stop1} />
          <stop offset="100%" stopColor={stop2} />
        </linearGradient>
      </defs>
      {/* Exposed Engine block in the back */}
      <rect x="8" y="8" width="8" height="10" rx="1" fill="#475569" stroke="#1e293b" strokeWidth="1" />
      {/* Chrome exhaust pipe pointing up with a puff of smoke */}
      <path d="M6 12 L4 6 L1 6" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
      
      {/* Minimal kart frame */}
      <path d="M14 18 L24 18 L32 16 L48 16 L56 20 L54 23 L14 23 Z" fill={`url(#${gradId})`} />
      
      {/* Spoiler front plate */}
      <rect x="52" y="14" width="6" height="7" rx="1" transform="rotate(15 52 14)" fill="#0f172a" />
      <rect x="53" y="15" width="4" height="5" rx="0.5" transform="rotate(15 53 15)" fill={stop1} />

      {/* Driver high bucket seat */}
      <path d="M18 18 L18 10 L24 10 L24 18 Z" fill="#0f172a" stroke="#1e293b" />
      
      {/* Exposed Chrome Steering Wheel */}
      <path d="M32 16 L35 12" stroke="#94a3b8" strokeWidth="1.5" />
      <circle cx="36" cy="11" r="2" fill="none" stroke="#e2e8f0" strokeWidth="1.5" />
      
      {/* Chunky treaded kart tires (Extremely fat) */}
      {/* Rear fat tire */}
      <rect x="10" y="16" width="10" height="8" rx="2" fill="#090d16" stroke="#334155" strokeWidth="1" />
      <circle cx="15" cy="20" r="2.5" fill="#ffd700" />
      {/* Front fat tire */}
      <rect x="42" y="17" width="8" height="7" rx="2" fill="#090d16" stroke="#334155" strokeWidth="1" />
      <circle cx="46" cy="20.5" r="2" fill="#ffd700" />
    </svg>
  );
}

// Map the old string key to a valid styleName
export function getCarStyle(carImage: string): string {
  if (['🏎️', 'formula', 'Formula'].includes(carImage)) return 'formula';
  if (['⚡', 'gt', 'GT', 'sport', 'Sport'].includes(carImage)) return 'gt';
  if (['🚀', 'cyber', 'Cyber', 'future', 'Future'].includes(carImage)) return 'cyber';
  if (['🛸', 'kart', 'Kart', 'superkart'].includes(carImage)) return 'kart';
  
  // Hash name as fallback to assign a unique car
  const hash = carImage.length % 4;
  if (hash === 0) return 'formula';
  if (hash === 1) return 'gt';
  if (hash === 2) return 'cyber';
  return 'kart';
}
