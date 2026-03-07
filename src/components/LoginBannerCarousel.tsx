import { useEffect, useState, useCallback, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface Banner {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  display_order: number;
}

const AUTO_PLAY_MS = 4000;

export default function LoginBannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
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

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setProgress(0);
    startTimeRef.current = Date.now();
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  // Animated progress + auto-play
  useEffect(() => {
    if (!emblaApi || banners.length <= 1) return;

    const tick = () => {
      if (!isPaused.current) {
        const elapsed = Date.now() - startTimeRef.current;
        const pct = Math.min(elapsed / AUTO_PLAY_MS, 1);
        setProgress(pct);
        if (pct >= 1) {
          emblaApi.scrollNext();
          return;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [emblaApi, banners.length]);

  // Pause/resume resets timing
  const handlePause = useCallback(() => { isPaused.current = true; }, []);
  const handleResume = useCallback(() => {
    isPaused.current = false;
    startTimeRef.current = Date.now() - (progress * AUTO_PLAY_MS);
  }, [progress]);

  if (!banners.length) return null;

  const trackClick = useCallback((bannerId: string) => {
    supabase.from("banner_clicks").insert({
      banner_id: bannerId,
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
    }).then(() => {});
  }, []);

  const Wrapper = ({ href, bannerId, children, className }: { href: string | null; bannerId: string; children: React.ReactNode; className?: string }) =>
    href ? (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} onClick={() => trackClick(bannerId)}>{children}</a>
    ) : (
      <div className={className}>{children}</div>
    );

  const handleSegmentClick = (i: number) => {
    emblaApi?.scrollTo(i);
  };

  return (
    <div
      className="w-full"
      onMouseEnter={handlePause}
      onMouseLeave={handleResume}
    >
      <div ref={emblaRef} className="overflow-hidden rounded-2xl">
        <div className="flex">
          {banners.map((b) => (
            <div key={b.id} className="min-w-0 shrink-0 grow-0 basis-full">
              <Wrapper href={b.link_url}>
                <AspectRatio ratio={1.5}>
                  <img
                    src={b.image_url}
                    alt={b.title}
                    className="h-full w-full object-cover rounded-2xl"
                    loading="lazy"
                  />
                </AspectRatio>
              </Wrapper>
            </div>
          ))}
        </div>
      </div>

      {banners.length > 1 && (
        <div className="relative h-[1.5px] mt-2 mx-12 rounded-full bg-muted-foreground/8">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-primary/50 transition-[left,width] duration-500 ease-out"
            style={{
              width: `${100 / banners.length}%`,
              left: `${(selectedIndex / banners.length) * 100}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}
