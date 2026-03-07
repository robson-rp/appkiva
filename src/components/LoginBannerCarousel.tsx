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

export default function LoginBannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPaused = useRef(false);

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
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  // Auto-play
  useEffect(() => {
    if (!emblaApi || banners.length <= 1) return;
    const play = () => {
      intervalRef.current = setInterval(() => {
        if (!isPaused.current) emblaApi.scrollNext();
      }, 4000);
    };
    play();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [emblaApi, banners.length]);

  if (!banners.length) return null;

  const Wrapper = ({ href, children, className }: { href: string | null; children: React.ReactNode; className?: string }) =>
    href ? (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>
    ) : (
      <div className={className}>{children}</div>
    );

  return (
    <div
      className="w-full"
      onMouseEnter={() => { isPaused.current = true; }}
      onMouseLeave={() => { isPaused.current = false; }}
    >
      <div ref={emblaRef} className="overflow-hidden rounded-2xl">
        <div className="flex">
          {banners.map((b) => (
            <div key={b.id} className="min-w-0 shrink-0 grow-0 basis-full">
              <Wrapper href={b.link_url}>
                <AspectRatio ratio={1.8}>
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
        <div className="flex justify-center gap-2 mt-3">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={cn(
                "rounded-full transition-all duration-500 ease-out",
                i === selectedIndex
                  ? "h-2 w-5 bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
                  : "h-2 w-2 bg-muted-foreground/20 hover:bg-muted-foreground/40"
              )}
              aria-label={`Banner ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
