import {
  Film,
  Globe,
  Link2,
  Mail,
  Play,
  Sparkles,
} from "lucide-react";
import type { LinkIconType } from "@/data/links";

export function LinkIcon({
  iconType,
  className = "h-5 w-5",
}: {
  iconType: LinkIconType;
  className?: string;
}) {
  switch (iconType) {
    case "play":
      return <Play className={`${className} text-winter`} aria-hidden="true" />;
    case "youtube":
      return (
        <svg
          className={`${className} text-hearth`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
          <path d="m10 15 5-3-5-3v6Z" />
        </svg>
      );
    case "instagram":
      return (
        <svg
          className={`${className} text-winter`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      );
    case "mail":
      return (
        <Mail className={`${className} text-wharf`} aria-hidden="true" />
      );
    case "film":
      return (
        <Film className={`${className} text-hearth`} aria-hidden="true" />
      );
    case "globe":
      return (
        <Globe className={`${className} text-wharf`} aria-hidden="true" />
      );
    case "sparkles":
      return (
        <Sparkles
          className={`${className} text-hearth`}
          aria-hidden="true"
        />
      );
    case "link":
    default:
      return (
        <Link2 className={`${className} text-hearth`} aria-hidden="true" />
      );
  }
}
