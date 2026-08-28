export default function BrandIcon({ size = 22, className = '' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="boss-icon-gradient" x1="8" y1="7" x2="39" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#a5b4fc" />
          <stop offset="0.52" stopColor="#6366f1" />
          <stop offset="1" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      <path d="M24 4l3.4 5.6 6.4-.9-1.2 6.3 5.8 3.1-5.2 4.2 2.4 6-6.5-.2-3.1 5.8-3.1-5.8-6.5.2 2.4-6-5.2-4.2 5.8-3.1-1.2-6.3 6.4.9L24 4z" fill="url(#boss-icon-gradient)" />
      <path d="M16.5 18.5h15v13.3c0 4.1-3.3 7.4-7.5 7.4s-7.5-3.3-7.5-7.4V18.5z" fill="#0f172a" />
      <path d="M21 22.2h4.6c3 0 5 1.4 5 3.6 0 1.7-1.1 2.8-2.6 3.2 1.9.4 3.1 1.7 3.1 3.6 0 2.7-2.4 4.6-6.2 4.6H21V22.2zm3.3 2.8v3h1.3c1.5 0 2.4-.5 2.4-1.5 0-1-.8-1.5-2.3-1.5h-1.4zm0 5.8v3.5h1.5c1.7 0 2.7-.6 2.7-1.8s-1-1.7-2.7-1.7h-1.5z" fill="#fff" />
    </svg>
  );
}
