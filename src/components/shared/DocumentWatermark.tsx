import Image from "next/image";

type DocumentWatermarkProps = {
  accentColor: string;
  label: string;
  logoDataUrl?: string;
};

export default function DocumentWatermark({
  accentColor,
  label,
  logoDataUrl = "",
}: DocumentWatermarkProps) {
  const hasUploadedLogo = logoDataUrl.trim().length > 0;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden"
      aria-hidden="true"
    >
      {hasUploadedLogo ? (
        <Image
          src={logoDataUrl}
          alt=""
          width={440}
          height={440}
          unoptimized
          className="h-[62%] w-[62%] max-w-[440px] object-contain opacity-[0.085] grayscale"
        />
      ) : (
        <svg
          viewBox="0 0 520 520"
          className="h-[68%] w-[68%] max-w-[460px] opacity-[0.075]"
          role="img"
        >
          <g fill="none" stroke={accentColor} strokeLinecap="round" strokeWidth="18">
            <circle cx="260" cy="260" r="190" />
            <path d="M166 310c42 48 146 48 188 0" />
            <path d="M170 210h180" />
            <path d="M210 170v180" />
            <path d="M310 170v180" />
          </g>
          <text
            x="260"
            y="432"
            fill={accentColor}
            fontFamily="Georgia, serif"
            fontSize="30"
            fontWeight="700"
            letterSpacing="6"
            textAnchor="middle"
          >
            {label}
          </text>
        </svg>
      )}
    </div>
  );
}
