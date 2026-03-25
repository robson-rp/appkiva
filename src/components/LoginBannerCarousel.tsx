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

const FALLBACK_BANNERS: Banner[] = [
  { id: "fb-1", title: "Família", image_url: "/banners/banner-familia.jpg", link_url: null, display_order: 1 },
  { id: "fb-2", title: "Missões", image_url: "/banners/banner-missoes.jpg", link_url: null, display_order: 2 },
  { id: "fb-3", title: "Poupar", image_url: "/banners/banner-poupar.jpg", link_url: null, display_order: 3 },
  { id: "fb-4", title: "Recompensas", image_url: "/banners/banner-recompensas.jpg", link_url: null, display_order: 4 },
  { id: "fb-5", title: "Sonhos", image_url: "/banners/banner-sonhos.jpg", link_url: null, display_order: 5 },
];

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
      .then(({ data, error }) => {
        if (error) {
          console.error("Banner query failed, using fallback:", error.message);
          setBanners(FALLBACK_BANNERS);
          return;
        }
        setBanners(data?.length ? data : FALLBACK_BANNERS);
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
    if (bannerId.startsWith("fb-")) return; // skip fallback banners
    supabase.from("banner_clicks").insert({
      banner_id: bannerId,
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
    }).then(() => {});
  }, []);

  const handleImgError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "/placeholder.svg";
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
                onError={handleImgError}
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

      {banners.length > 1 && (
        <div className="relative h-[1.5px] mt-2 mx-12 rounded-full bg-muted-foreground/8">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-primary/50 transition-[left,width] duration-500 ease-out"
            style={{
              width: `${100 / banners.length}%`,
              left: `${(activeIndex / banners.length) * 100}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}
