import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

interface MediaConsentNoticeProps {
  variant?: "form" | "policy";
  className?: string;
}

export function MediaConsentNotice({ variant = "form", className = "" }: MediaConsentNoticeProps) {
  if (variant === "policy") {
    return (
      <div className={className}>
        <p className="text-muted-foreground leading-relaxed">
          By submitting a picture or video, you confirm you own it or have the copyright holder's permission to share it publicly. You also confirm that any identifiable people shown have consented to being featured online (and that a parent/guardian has consented where a child is identifiable). Please avoid including personal or sensitive details such as children's faces, vehicle number plates, house numbers, security features, or anything else you wouldn't want visible publicly. Lekker Lights may edit or decline submissions, and we will remove content where a legitimate privacy concern is raised in line with our{" "}
          <Link to="/privacy-policy" className="text-christmas hover:underline">Privacy Policy</Link>
          {" "}and{" "}
          <Link to="/terms-of-service" className="text-christmas hover:underline">Terms of Service</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-muted-foreground leading-relaxed">
          <p className="font-medium text-amber-600 dark:text-amber-400 mb-2">Media Consent Notice</p>
          <p>
            By submitting a picture or video, you confirm you own it or have the copyright holder's permission to share it publicly. You also confirm that any identifiable people shown have consented to being featured online (and that a parent/guardian has consented where a child is identifiable). Please avoid including personal or sensitive details such as children's faces, vehicle number plates, house numbers, security features, or anything else you wouldn't want visible publicly. Lekker Lights may edit or decline submissions, and we will remove content where a legitimate privacy concern is raised in line with our{" "}
            <Link to="/privacy-policy" className="text-christmas hover:underline font-medium">Privacy Policy</Link>
            {" "}and{" "}
            <Link to="/terms-of-service" className="text-christmas hover:underline font-medium">Terms of Service</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
