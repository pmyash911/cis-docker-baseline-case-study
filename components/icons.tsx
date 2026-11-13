import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export function IconShieldCheck(props: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" {...stroke} {...props}>
      <path d="M12 3l7 3v5.2c0 4.3-2.9 7.4-7 8.8-4.1-1.4-7-4.5-7-8.8V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function IconFileText(props: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" {...stroke} {...props}>
      <path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7l-4-4z" />
      <path d="M14 3v4h4" />
      <path d="M9 13h6M9 17h6" />
    </svg>
  );
}

export function IconTerminal(props: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" {...stroke} {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 9l3 3-3 3" />
      <path d="M13 15h4" />
    </svg>
  );
}

export function IconWorkflow(props: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" {...stroke} {...props}>
      <rect x="3" y="3" width="6" height="6" rx="1" />
      <rect x="15" y="15" width="6" height="6" rx="1" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
      <path d="M6 9v1.5a2 2 0 0 0 2 2h1M18 15v-1.5a2 2 0 0 0-2-2h-1" />
    </svg>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" {...stroke} {...props}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export function IconArrowLeft(props: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" {...stroke} {...props}>
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );
}
