'use client';

import React from 'react';

export const BrandHeroBanner: React.FC = () => {
  return (
    <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-stone-200 shadow-xs select-none">
      {/* SVG Vector Hero Banner matching MD Skincare Haven Official Identity */}
      <div className="w-full flex items-center justify-center py-6 sm:py-10 md:py-12 px-4 sm:px-8 bg-gradient-to-b from-white via-stone-50/40 to-white">
        <svg
          viewBox="0 0 800 360"
          className="w-full max-w-2xl h-auto max-h-48 sm:max-h-60 md:max-h-68"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <style>{`
              @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Montserrat:wght@400;500;600&display=swap');
              .banner-monogram {
                font-family: 'Playfair Display', Didot, 'Bodoni MT', Baskerville, Georgia, serif;
                font-weight: 900;
                font-size: 240px;
                fill: #0a0a0a;
                text-anchor: middle;
                letter-spacing: -10px;
              }
              .banner-subtext {
                font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 20px;
                font-weight: 500;
                fill: #0a0a0a;
                text-anchor: middle;
                letter-spacing: 0.38em;
              }
            `}</style>
          </defs>

          {/* Monogram Top & Bottom Half */}
          <g transform="translate(400, 245)">
            <text className="banner-monogram">MD</text>
          </g>

          {/* Clean Horizontal Cutout Strip */}
          <rect x="70" y="152" width="660" height="54" fill="#FFFFFF" />

          {/* Top Divider Line */}
          <line
            x1="90"
            y1="152"
            x2="710"
            y2="152"
            stroke="#0a0a0a"
            strokeWidth="2.5"
            strokeLinecap="square"
          />

          {/* Center Brand Text */}
          <text className="banner-subtext" x="403" y="187">
            SKINCARE HAVEN
          </text>

          {/* Bottom Divider Line */}
          <line
            x1="90"
            y1="206"
            x2="710"
            y2="206"
            stroke="#0a0a0a"
            strokeWidth="2.5"
            strokeLinecap="square"
          />
        </svg>
      </div>

      {/* Subtle Bottom Trust Bar */}
      <div className="bg-stone-50 border-t border-stone-100 px-4 py-2 flex items-center justify-between text-[10px] sm:text-xs text-stone-500 font-medium">
        <span className="flex items-center gap-1.5 text-emerald-800 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
          Pure &amp; Natural Botanical Science
        </span>
        <span className="hidden sm:inline text-stone-400">
          Formulated for Healthy, Radiant Melanin Skin
        </span>
        <span className="text-stone-600 font-semibold">Direct Bank Transfer</span>
      </div>
    </div>
  );
};
