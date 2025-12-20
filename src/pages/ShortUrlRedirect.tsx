import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function ShortUrlRedirect() {
  const { shortCode } = useParams<{ shortCode: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchListing() {
      if (!shortCode) {
        navigate("/404", { replace: true });
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from("listings_public_data")
          .select("id")
          .eq("short_code", shortCode.toUpperCase())
          .maybeSingle();

        if (fetchError) {
          console.error("Error fetching listing by short code:", fetchError);
          setError("An error occurred while loading the listing.");
          return;
        }

        if (!data) {
          // Try with original case
          const { data: originalData, error: originalError } = await supabase
            .from("listings_public_data")
            .select("id")
            .eq("short_code", shortCode)
            .maybeSingle();

          if (originalError || !originalData) {
            navigate("/404", { replace: true });
            return;
          }

          navigate(`/listing/${originalData.id}`, { replace: true });
          return;
        }

        navigate(`/listing/${data.id}`, { replace: true });
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred.");
      }
    }

    fetchListing();
  }, [shortCode, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <a href="/browse" className="text-christmas hover:underline">
            Browse all displays
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-christmas mx-auto mb-4" />
        <p className="text-muted-foreground">Loading display...</p>
      </div>
    </div>
  );
}
