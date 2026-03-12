import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Banner {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  display_order: number;
}

const AUTO_PLAY_MS = 3000;

export default function LoginBannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const isPaused = useRef(false);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    supabase
      .from("login_banners")
      .select("id, title, image_url, link_url, display_order")
      .eq("is_active", true)
      .order("display_order")
      .limit(5)
      .then(({ data }) => {
        if (data?.length) setBanners(data);
      });
  }, []);

  const goTo = useCallback((i: number) => {
    setActiveIndex(i);
    setProgress(0);
    startTimeRef.current = Date.now();
  }, []);

  // Auto-play with animated progress
  useEffect(() => {
    if (banners.length <= 1) return;

    const tick = () => {
      if (!isPaused.current) {
        const elapsed = Date.now() - startTimeRef.current;
        const pct = Math.min(elapsed / AUTO_PLAY_MS, 1);
        setProgress(pct);
        if (pct >= 1) {
          goTo((activeIndex + 1) % banners.length);
          return;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [banners.length, activeIndex, goTo]);

  const handlePause = useCallback(() => { isPaused.current = true; }, []);
  const handleResume = useCallback(() => {
    isPaused.current = false;
    startTimeRef.current = Date.now() - (progress * AUTO_PLAY_MS);
  }, [progress]);

  const trackClick = useCallback((bannerId: string) => {
    supabase.from("banner_clicks").insert({
      banner_id: bannerId,
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
    }).then(() => {});
  }, []);

  if (!banners.length) return (
    <div className="w-full">
      <AspectRatio ratio={1.5}>
        <Skeleton className="h-full w-full rounded-2xl" />
      </AspectRatio>
    </div>
  );

  return (
    <div
      className="w-full"
      onMouseEnter={handlePause}
      onMouseLeave={handleResume}
    >
      {/* Crossfade stack */}
      <div className="relative w-full overflow-hidden rounded-2xl">
        <AspectRatio ratio={1.5}>
          {banners.map((b, idx) => {
            const isActive = idx === activeIndex;
            const content = (
              <img
                src={b.image_url}
                alt={b.title}
                className="h-full w-full object-cover"
                loading={idx === 0 ? "eager" : "lazy"}
                fetchPriority={idx === 0 ? "high" : "auto"}
                decoding={idx === 0 ? "sync" : "async"}
              />
            );

            return (
              <div
                key={b.id}
                className={cn(
                  "absolute inset-0 transition-all duration-600 ease-out",
                  isActive
                    ? "opacity-100 scale-100 z-10"
                    : "opacity-0 scale-[1.03] z-0"
                )}
                style={{ transitionDuration: "600ms" }}
              >
                {b.link_url ? (
                  <a
                    href={b.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-full w-full"
                    onClick={() => trackClick(b.id)}
                  >
                    {content}
                  </a>
                ) : (
                  content
                )}
              </div>
            );
          })}
        </AspectRatio>
      </div>

      {/* Segmented dot indicators */}
      {banners.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="relative h-1.5 rounded-full overflow-hidden bg-muted-foreground/15 transition-all duration-300 cursor-pointer"
              style={{ width: i === activeIndex ? 28 : 10 }}
              aria-label={`Banner ${i + 1}`}
            >
              {i === activeIndex && (
                <span
                  className="absolute inset-y-0 left-0 rounded-full bg-primary/70"
                  style={{ width: `${progress * 100}%` }}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
