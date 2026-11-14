import React from 'react';

interface StudoraLogoProps {
  size?: number;
  showText?: boolean;
  subtitle?: string;
}

export const StudoraLogo: React.FC<StudoraLogoProps> = ({
  size = 40,
  showText = true,
  subtitle,
}) => {
  return (
    <div className="inline-flex items-center gap-3 select-none shrink-0">
      <div
        className="relative flex items-center justify-center rounded-[12px] border-[2.5px] border-[#171717] bg-[#FFE69A] shadow-[3px_3px_0px_#171717] dark:border-[#2E2E38] dark:shadow-[3px_3px_0px_#000]"
        style={{ width: size, height: size }}
      >
        <svg
          width={size * 0.72}
          height={size * 0.72}
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Open Book Base */}
          <path
            d="M4 9.5C4 8.39543 4.89543 7.5 6 7.5H16.5V27.5H6C4.89543 27.5 4 26.6046 4 25.5V9.5Z"
            fill="#FFFFFF"
            stroke="#171717"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          <path
            d="M19.5 7.5H30C31.1046 7.5 32 8.39543 32 9.5V25.5C32 26.6046 31.1046 27.5 30 27.5H19.5V7.5Z"
            fill="#C4B5FD"
            stroke="#171717"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          {/* Book Spine Pixel Blocks */}
          <rect x="16.5" y="6" width="3" height="3" fill="#B9F5C8" stroke="#171717" strokeWidth="1.6" />
          <rect x="27" y="3.5" width="4" height="4" fill="#B9F5C8" stroke="#171717" strokeWidth="1.6" />
          <rect x="31" y="7" width="3" height="3" fill="#F5A9DD" stroke="#171717" strokeWidth="1.6" />
          {/* Code Bracket Symbol on Left Page */}
          <path
            d="M12.5 14L8.5 17.5L12.5 21"
            stroke="#171717"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Tech Slash & Bracket on Right Page */}
          <path
            d="M23.5 14L27.5 17.5L23.5 21"
            stroke="#171717"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M19.2 13L16.8 22"
            stroke="#171717"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className="font-display text-lg sm:text-xl tracking-wide text-[#171717] dark:text-white whitespace-nowrap">
            STUDORA
          </span>
          {subtitle && (
            <span className="font-body text-[11px] font-medium text-[#171717]/70 dark:text-white/70 mt-0.5 whitespace-nowrap">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
