type Props = {
  className?: string;
  size?: number;
  title?: string;
};

/**
 * CodeQuest “Hum-AI” mark: refined robot head (vector, theme-aware via currentColor).
 */
export function CodeQuestLogo({ className, size = 40, title = "CodeQuest AI" }: Props) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      {/* Outer capsule */}
      <rect
        x="6"
        y="10"
        width="36"
        height="28"
        rx="10"
        fill="currentColor"
        opacity="0.12"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* Antennae */}
      <path
        d="M18 10 V6 M30 10 V6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.9"
      />
      <circle cx="18" cy="5" r="1.8" fill="currentColor" />
      <circle cx="30" cy="5" r="1.8" fill="currentColor" />
      {/* Side bolts */}
      <circle cx="6" cy="24" r="2.2" fill="currentColor" opacity="0.25" />
      <circle cx="42" cy="24" r="2.2" fill="currentColor" opacity="0.25" />
      {/* Face: sensors + mouth */}
      <circle cx="17" cy="22" r="2" fill="currentColor" opacity="0.85" />
      <circle cx="24" cy="22" r="2" fill="currentColor" opacity="0.85" />
      <circle cx="31" cy="22" r="2" fill="currentColor" opacity="0.85" />
      <path
        d="M18 30 h12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.85"
      />
      {/* Accent glow line */}
      <path
        d="M12 34 h24"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.35"
        strokeLinecap="round"
      />
    </svg>
  );
}
