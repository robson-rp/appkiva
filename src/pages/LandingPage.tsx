import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring, animate, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import kivaraLogo from "@/assets/logo-kivara-full.png";
import kivaraLogoWhite from "@/assets/logo-kivara-white.svg";
import kivoSvg from "@/assets/kivo.svg";
import heroIllustration from "@/assets/landing/hero-illustration.png";
import heroMissions from "@/assets/landing/hero-missions.png";
import heroSavings from "@/assets/landing/hero-savings.png";
import heroFamily from "@/assets/landing/hero-family.png";
import heroSchool from "@/assets/landing/hero-school.png";
import heroSecurity from "@/assets/landing/hero-security.png";
import parentsBenefit from "@/assets/landing/parents-benefit.png";
import schoolBenefit from "@/assets/landing/school-benefit.png";
import gamificationImg from "@/assets/landing/gamification.png";
import gamificationMockup from "@/assets/landing/gamification-mockup.png";
import trustSecurityImg from "@/assets/landing/trust-security.png";
import {
  Coins, Target, TrendingUp, ShieldCheck, Users,
  Trophy, Flame, Medal, Gamepad2, Building2, TreePine,
  BookOpen, Swords, ShoppingBag, BarChart3, ListChecks,
  Heart, Lock, Eye, UserCheck, ChevronRight, Star, Zap, Menu, X,
  AlertTriangle, TrendingDown, Sprout, Check, Mail, Quote,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";

/* ─── animation variants ─── */
const easeOut = [0.22, 1, 0.36, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut as unknown as [number, number, number, number] } },
};
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };
const staggerFast = { visible: { transition: { staggerChildren: 0.06 } } };

/* ─── Animated Icon wrapper ─── */
function AnimatedIcon({ icon: Icon, animation, className = "" }: {
  icon: React.ElementType;
  animation: "spin" | "pulse" | "bounce" | "glow" | "wiggle";
  className?: string;
}) {
  const animVariants: Record<string, any> = {
    spin: { rotate: 360 },
    pulse: { scale: [1, 1.15, 1] },
    bounce: { y: [0, -6, 0] },
    glow: { scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] },
    wiggle: { rotate: [0, -8, 8, -4, 0] },
  };
  const transitions: Record<string, object> = {
    spin: { duration: 8, repeat: Infinity, ease: "linear" },
    pulse: { duration: 2, repeat: Infinity, ease: "easeInOut" },
    bounce: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
    glow: { duration: 3, repeat: Infinity, ease: "easeInOut" },
    wiggle: { duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 },
  };

  return (
    <motion.div
      animate={animVariants[animation]}
      transition={transitions[animation]}
      className="inline-flex"
    >
      <Icon className={className} />
    </motion.div>
  );
}

/* ─── CountUp hook ─── */
function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const count = useMotionValue(0);
  const rounded = useSpring(count, { stiffness: 50, damping: 20 });

  useEffect(() => {
    if (isInView) animate(count, target, { duration: 2, ease: "easeOut" });
  }, [isInView, target, count]);

  useEffect(() => {
    const unsub = rounded.on("change", (v) => {
      if (ref.current) ref.current.textContent = Math.round(v) + suffix;
    });
    return unsub;
  }, [rounded, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

/* ─── Section wrapper — tighter padding ─── */
function Section({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <motion.section
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={stagger}
      className={`px-5 sm:px-8 lg:px-12 py-16 md:py-24 ${className}`}
    >
      <div className="mx-auto max-w-7xl">{children}</div>
    </motion.section>
  );
}

function SectionTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.h2
      variants={fadeUp}
      className={`font-display text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 text-balance leading-[1.1] ${className}`}
    >
      {children}
    </motion.h2>
  );
}

function SectionSubtitle({ children }: { children: React.ReactNode }) {
  return (
    <motion.p variants={fadeUp} className="text-muted-foreground text-lg md:text-xl text-center max-w-3xl mx-auto mb-8 text-balance">
      {children}
    </motion.p>
  );
}

/* ─── Gradient text (cross-browser) ─── */
function GradientText({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={className}
      style={{
        backgroundImage: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
    >
      {children}
    </span>
  );
}

/* ─── SVG Wave Divider ─── */
function WaveDivider({ flip = false, className = "" }: { flip?: boolean; className?: string }) {
  return (
    <div className={`w-full overflow-hidden leading-[0] ${flip ? "rotate-180" : ""} ${className}`}>
      <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" preserveAspectRatio="none">
        <path
          d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,80 L0,80 Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════
   1. NAVBAR — clean, blur on scroll
   ═══════════════════════════════════════════ */
function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navLinks = [
    { label: "Como funciona", href: "#como-funciona" },
    { label: "Universo", href: "#universo" },
    { label: "Famílias", href: "#familias" },
    { label: "Escolas", href: "#escolas" },
  ];

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-2xl border-b border-border/60 shadow-lg shadow-foreground/[0.03]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl flex items-center justify-between px-5 sm:px-8 h-[4.5rem].5rem].5rem].5rem].5rem].5rem].5rem].5rem] md:h-20">
        <Link to="/" className="flex items-center gap-2">
          <img src={kivaraLogo} alt="KIVARA" className="h-10 md:h-12" />
        </Link>

        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative text-base font-semibold text-muted-foreground hover:text-foreground transition-colors tracking-wide
                after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:rounded-full after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link to="/login">Entrar</Link>
          </Button>
          <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shimmer" asChild>
            <Link to="/login">Criar conta</Link>
          </Button>
        </div>

        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-background/95 backdrop-blur-2xl border-b border-border px-5 pb-5 pt-2"
        >
          {navLinks.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center text-lg font-semibold text-foreground/80 hover:text-foreground py-3 transition-colors ${
                i < navLinks.length - 1 ? "border-b border-border/30" : ""
              }`}
            >
              {link.label}
            </a>
          ))}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" size="lg" className="flex-1" asChild>
              <Link to="/login">Entrar</Link>
            </Button>
            <Button size="lg" className="flex-1 bg-secondary text-secondary-foreground" asChild>
              <Link to="/login">Criar conta</Link>
            </Button>
          </div>
        </motion.div>
      )}
    </nav>
  );
}

/* ═══════════════════════════════════════════
   2. HERO — 6-slide carousel with autoplay
   ═══════════════════════════════════════════ */
const HERO_SLIDES = [
  {
    headline: "Pequenos hábitos.",
    headlineGradient: "Grandes futuros.",
    subtitle: "KIVARA transforma educação financeira num jogo interactivo onde crianças aprendem a ganhar, poupar e planear o futuro.",
    image: heroIllustration,
    alt: "Crianças africanas a aprender sobre dinheiro",
    cta: "Criar conta familiar",
    ctaSecondary: "Explorar a plataforma",
  },
  {
    headline: "Aprende através de",
    headlineGradient: "missões.",
    subtitle: "Missões diárias e semanais que ensinam conceitos financeiros de forma prática e divertida.",
    image: heroMissions,
    alt: "Criança a completar missão digital",
    cta: "Começar missões",
    ctaSecondary: "Ver como funciona",
  },
  {
    headline: "Poupa para os teus",
    headlineGradient: "sonhos.",
    subtitle: "Cria metas de poupança, acompanha o progresso e aprende o valor de guardar para o que realmente importa.",
    image: heroSavings,
    alt: "Cofre com moedas e progresso",
    cta: "Começar a poupar",
    ctaSecondary: "Ver cofres",
  },
  {
    headline: "Toda a família aprende",
    headlineGradient: "junta.",
    subtitle: "Pais acompanham, orientam e participam na jornada financeira dos filhos — tudo numa única plataforma.",
    image: heroFamily,
    alt: "Família africana unida com tablet",
    cta: "Criar conta familiar",
    ctaSecondary: "Para famílias",
  },
  {
    headline: "Leva KIVARA para a",
    headlineGradient: "escola.",
    subtitle: "Professores podem integrar desafios financeiros nas aulas e acompanhar a evolução dos estudantes.",
    image: heroSchool,
    alt: "Sala de aula africana",
    cta: "Registar escola",
    ctaSecondary: "Para escolas",
  },
  {
    headline: "Seguro e",
    headlineGradient: "supervisionado.",
    subtitle: "Dados protegidos, controlo parental total e um ambiente educativo concebido para a segurança das crianças.",
    image: heroSecurity,
    alt: "Segurança e proteção digital",
    cta: "Saber mais",
    ctaSecondary: "Segurança",
  },
];

const AUTO_PLAY_MS = 5000;

function Hero() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const isPaused = useRef(false);
  const rafRef = useRef<number | null>(null);
  const { scrollY } = useScroll();
  const heroParallaxY = useTransform(scrollY, [0, 600], [0, -80]);
  const startTimeRef = useRef(Date.now());

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

  // Autoplay + progress
  useEffect(() => {
    if (!emblaApi) return;
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
  }, [emblaApi]);

  const handlePause = useCallback(() => { isPaused.current = true; }, []);
  const handleResume = useCallback(() => {
    isPaused.current = false;
    startTimeRef.current = Date.now() - (progress * AUTO_PLAY_MS);
  }, [progress]);

  return (
    <section
      className="relative pt-20 md:pt-24 overflow-hidden"
      onMouseEnter={handlePause}
      onMouseLeave={handleResume}
    >
      {/* Gradient mesh background */}
      <div className="absolute inset-0 gradient-mesh opacity-60 pointer-events-none" />
      <div className="absolute inset-0 dot-pattern opacity-30 pointer-events-none" />

      <div ref={emblaRef} className="overflow-hidden relative">
        <div className="flex">
          {HERO_SLIDES.map((slide, i) => (
            <div key={i} className="min-w-0 shrink-0 grow-0 basis-full">
             10<div 10lassN10me="r10lativ10 px-510sm:px108 py-8 md:py-16">
                <div className="mx-auto max-w-7xl grid md:grid-cols-2 gap-6 md:gap-10 items-center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={selectedIndex === i ? { opacity: 1, y: 0 } : { opacity: 0.3, y: 10 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h1 className="font-display text-[2rem] sm:text-[2.5rem] md:text-[3.5rem] lg:text-[4rem] font-bold leading-[1.05] tracking-tight text-foreground max-w-[600px]">
                      {slide.headline}
                      <br />
                      <GradientText>{slide.headlineGradient}</GradientText>
                    </h1>
                    <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl">
                      {slide.subtitle}
                    </p>
         col sm:flex-row gap-3 sm:flex-row gap-3 sm:flex-row gap-3 sm:flex-row gap-3 sm:flex-row gap-3 sm:flex-row gap-3p gap-4">
                      <Button
                        size="lg"
                        className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-base px-8 shimmer transition-shadow hover:shadow-lg hover:shadow-secondary/20"
                        asChild
                      >
                        <Link to="/login">
                          {slide.cta} <ChevronRight className="ml-1" />
                        </Link>
                      </Button>
                      <Button size="lg" variant="outline" className="text-base px-8 transition-shadow hover:shadow-lg" asChild>
                        <a href="#como-funciona">{slide.ctaSecondary}</a>
                      </Button>
                    </div>
                  </motion.div>

                  <motion.div
                    className="flex items-center justify-center relative"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={selectedIndex === i ? { opacity: 1, scale: 1 } : { opacity: 0.3, scale: 0.85 }}
                    transition={{ duration: 0.5 }}
                    style={{ y: heroParallaxY }}
                  >
                    <div className="absolute inset-0 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />
                    <img
                      src={slide.ima80px] sm:max-w-sm 80px] sm:max-w-sme80px] sm:max-w-sm 80px] sm:max-w-smm80px] sm:max-w-sm200px] sm:max-w-xs md:max-w-lg lg:max-w-xl relative z-10 drop-shadow-2xl"
                    />
                  </motion.div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slide indicators — sliding line with progress */}
      <div className="relative z-10 pb-2 md:pb-3 px-5 sm:px-8">
        <div className="relative h-[1.5px] mx-12 rounded-full bg-muted-foreground/8">
          {/* Background segment (position indicator) */}
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-primary/20 transition-[left] duration-500 ease-out"
            style={{
              width: `${100 / HERO_SLIDES.length}%`,
              left: `${(selectedIndex / HERO_SLIDES.length) * 100}%`,
            }}
          />
          {/* Progress fill within active segment */}
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-primary/50"
            style={{
              width: `${(progress * 100) / HERO_SLIDES.length}%`,
              left: `${(selectedIndex / HERO_SLIDES.length) * 100}%`,
              transition: progress === 0 ? 'left 0.5s ease-out, width 0.1s' : 'none',
            }}
          />
        </div>
      </div>

      {/* Feature pills below carousel */}
      <div className="relative z-10 px-5 sm:px-8 pb-8 md:pb-14">
        <div className="mx-auto max-w-7xl flex flex-wrap justify-center gap-3">
          {[
            { icon: ShieldCheck, label: "100% seguro", color: "text-secondary" },
            { icon: Users, label: "+500 famílias", color: "text-primary" },
            { icon: Star, label: "Gratuito", color: "text-accent" },
            { icon: Zap, label: "Gamificado", color: "text-accent" },
          ].map((pill, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: i * 0.08 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="flex items-center gap-1.5 bg-card/80 backdrop-blur-sm border border-border/50 rounded-full px-3.5 py-2 cursor-default transition-shadow hover:shadow-md"
            >
              <pill.icon className={`w-4 h-4 ${pill.color}`} />
              <span className="text-sm font-medium text-muted-foreground">{pill.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   3. PROBLEMA — animated icons
   ═══════════════════════════════════════════ */
function ProblemSection() {
  const points = [
    { icon: AlertTriangle, text: "Crescemos sem aprender a gerir dinheiro, definir metas ou planear o futuro financeiro.", color: "text-destructive", bg: "bg-destructive/10", anim: "wiggle" as const },
    { icon: TrendingDown, text: "Sem orientação adequada, as decisões financeiras tornam-se difíceis na vida adulta.", color: "text-accent-foreground", bg: "bg-accent/10", anim: "bounce" as const },
    { icon: Sprout, text: "KIVARA nasceu para mudar isso — começando cedo, através do jogo e da prática.", color: "text-secondary", bg: "bg-secondary/10", anim: "pulse" as const },
  ];
  return (
    <>
      <WaveDivider className="text-muted/40 -mb-1" />
      <Section className="bg-muted/40">
        <SectionTitle>A maioria das pessoas aprende sobre dinheiro tarde demais</SectionTitle>
        <SectionSubtitle>Poucas crianças recebem educação financeira. Queremos mudar isso.</SectionSubtitle>

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-4">
          {points.map((p, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              whileHover={{ y: -6, boxShadow: "0 20px 40px -12px hsl(var(--primary) / 0.12)" }}
              className="bg-card rounded-2xl border border-border p-6 text-center transition-all group"
            >
              <div className={`${p.bg} rounded-2xl p-3 w-fit mx-auto mb-4 transition-transform group-hover:scale-110`}>
                <AnimatedIcon icon={p.icon} animation={p.anim} className={`w-6 h-6 ${p.color}`} />
              </div>
              <p className="text-base text-muted-foreground leading-relaxed">{p.text}</p>
            </motion.div>
          ))}
        </div>
      </Section>
      <WaveDivider flip className="text-muted/40 -mt-1" />
    </>
  );
}

/* ═══════════════════════════════════════════
   4. SOLUÇÃO — split screen with inline icons
   ═══════════════════════════════════════════ */
function SolutionSection() {
  const checks = [
    { icon: Coins, text: "Missões práticas para aprender a ganhar" },
    { icon: Target, text: "Metas de poupança com progresso visual" },
    { icon: ShieldCheck, text: "Decisões financeiras num ambiente seguro" },
    { icon: Eye, text: "Acompanhamento total pelos pais" },
  ];
  return (
    <Section>
      <div className="grid md:grid-cols-2 gap-8 md:gap-10 items-center">
        <div>
          <motion.div variants={fadeUp} className="inline-block bg-secondary/10 text-secondary rounded-full px-4 py-1.5 text-sm font-semibold mb-5">
            A solução
          </motion.div>
          <motion.h2 variants={fadeUp} className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-5 text-balance leading-[1.1]">
            Aprender finanças através da <GradientText>experiência</GradientText>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-muted-foreground mb-8 text-balance">
            Em vez de teoria, KIVARA ensina através da prática. Cada acção transforma-se numa lição que constrói hábitos financeiros positivos.
          </motion.p>
          <motion.div variants={stagger} className="space-y-3">
            {checks.map((item, i) => (
              <motion.div key={i} variants={fadeUp} whileHover={{ x: 4 }} className="flex items-center gap-3 transition-colors">
                <div className="bg-secondary/10 rounded-full p-1.5 shrink-0">
                  <item.icon className="w-4 h-4 text-secondary" />
                </div>
                <span className="text-base text-foreground font-medium">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
        <motion.div variants={fadeUp} className="flex justify-center relative">
          <div className="absolute inset-0 rounded-full bg-primary/8 blur-3xl scale-75 pointer-events-none" />
          <img src={heroIllustration} alt="Crianças a aprender finanças" className="w-full max-w-lg rounded-3xl relative z-10 drop-shadow-xl" />
        </motion.div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════
   5. COMO FUNCIONA — animated icons, gradient border hover, scroll line
   ═══════════════════════════════════════════ */
function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end center"] });

  const steps = [
    { icon: Coins, title: "Ganhar", desc: "Completar missões e tarefas para ganhar moedas virtuais.", color: "bg-accent text-accent-foreground", anim: "spin" as const },
    { icon: Target, title: "Poupar", desc: "Criar metas e aprender a guardar para o que realmente importa.", color: "bg-secondary text-secondary-foreground", anim: "pulse" as const },
    { icon: TrendingUp, title: "Evoluir", desc: "Desbloquear níveis, conquistas e novas aprendizagens financeiras.", color: "bg-primary text-primary-foreground", anim: "bounce" as const },
  ];
  return (
    <>
      <WaveDivider className="text-muted/40 -mb-1" />
      <Section id="como-funciona" className="bg-muted/40">
        <SectionTitle>Como funciona</SectionTitle>
        <SectionSubtitle>Três passos simples para começar a jornada financeira.</SectionSubtitle>
        <div className="relative" ref={sectionRef}>
          {/* Animated scroll progress line — desktop only */}
          <div className="hidden md:block absolute top-[4.5rem] left-[17%] right-[17%] h-[2px] bg-border z-0 overflow-hidden">
            <motion.div
              className="h-full gradient-kivara origin-left"
              style={{ scaleX: scrollYProgress }}
            />
          </div>
          <motion.div variants={staggerFast} className="grid md:grid-cols-3 gap-4 relative z-10">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                className="bg-card rounded-2xl border border-border p-6 text-center flex flex-col items-center gap-4 transition-all hover:shadow-xl hover:shadow-primary/[0.06] group relative overflow-hidden"
              >
                {/* Gradient border on hover */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none gradient-border" />
                <div className="relative">
                  <div className={`rounded-2xl p-4 ${s.color} transition-transform group-hover:scale-110`}>
                    <AnimatedIcon icon={s.icon} animation={s.anim} className="w-7 h-7" />
                  </div>
                  <span className="absolute -top-2 -right-2 bg-foreground text-background text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold">{s.title}</h3>
                <p className="text-base text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>
      <WaveDivider flip className="text-muted/40 -mt-1" />
    </>
  );
}

/* ═══════════════════════════════════════════
   6. UNIVERSO — animated icon grid with central illustration
   ═══════════════════════════════════════════ */
function UniverseSection() {
  const zones = [
    { icon: Building2, label: "Cidade do Dinheiro", desc: "Aprende a ganhar e gerir", bg: "bg-accent/10", color: "text-accent-foreground", anim: "bounce" as const },
    { icon: TreePine, label: "Vale da Poupança", desc: "Guarda e faz crescer", bg: "bg-secondary/10", color: "text-secondary", anim: "pulse" as const },
    { icon: BookOpen, label: "Academia Financeira", desc: "Lições interactivas", bg: "bg-primary/10", color: "text-primary", anim: "glow" as const },
    { icon: Swords, label: "Arena dos Desafios", desc: "Compete e aprende", bg: "bg-destructive/10", color: "text-destructive", anim: "wiggle" as const },
    { icon: ShoppingBag, label: "Mercado dos Sonhos", desc: "Realiza objectivos", bg: "bg-accent/10", color: "text-accent-foreground", anim: "spin" as const },
  ];
  return (
    <Section id="universo">
      <SectionTitle>Um mundo onde aprender sobre dinheiro se torna uma aventura</SectionTitle>
      <SectionSubtitle>Cada zona representa um estágio da aprendizagem financeira.</SectionSubtitle>

      <div className="relative">
        {/* Central illustration behind grid on desktop */}
        <div className="hidden md:flex absolute inset-0 items-center justify-center pointer-events-none">
          <div className="w-64 h-64 rounded-full bg-secondary/5 blur-3xl" />
        </di1 min-[420px]:grid-cols-v>
        <motion1 min-[420px]:grid-cols-.div variants={sta1 min-[420px]:grid-cols-ggerFast} classNam1 min-[420px]:grid-cols-e="grid grid-cols-2 md:grid-cols-5 gap-3">
          {zones.map((z, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              whileHover={{ y: -6, boxShadow: "0 20px 40px -12px hsl(var(--primary) / 0.1)" }}
              className="bg-card rounded-2xl border border-border p-4 text-center flex flex-col items-center gap-2 transition-all group"
            >
              <div className={`${z.bg} rounded-2xl p-3 transition-transform group-hover:scale-110`}>
                <AnimatedIcon icon={z.icon} animation={z.anim} className={`w-6 h-6 ${z.color}`} />
              </div>
              <span className="font-display text-sm font-bold">{z.label}</span>
              <span className="text-xs text-muted-foreground">{z.desc}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════
   7. BENEFÍCIOS PAIS — hover glow cards
   ═══════════════════════════════════════════ */
function ParentBenefits() {
  const items = [
    { icon: BarChart3, text: "Acompanhar o progresso financeiro dos filhos", bg: "bg-primary/10", color: "text-primary" },
    { icon: Heart, text: "Incentivar hábitos saudáveis de poupança", bg: "bg-destructive/10", color: "text-destructive" },
    { icon: ListChecks, text: "Criar tarefas e recompensas educativas", bg: "bg-secondary/10", color: "text-secondary" },
    { icon: UserCheck, text: "Ensinar responsabilidade financeira na prática", bg: "bg-accent/10", color: "text-accent-foreground" },
  ];
  return (
    <Section id="familias">
      <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
        <motion.div variants={fadeUp} className="flex justify-center order-2 md:order-1 relative">
          <div className="absolute inset-0 rounded-full bg-primary/8 blur-3xl scalesm sm:max-w-md md:max-w--75 pointer-events-none" />
          <imgsm sm:max-w-md md:max-w- src={parentsBenefit} alt="Família africasm sm:max-w-md md:max-w-na a usar KIVARA" className="w-full max-w-xl relative z-10 drop-shadow-xl" />
        </motion.div>
        <div className="order-1 md:order-2">
          <motion.div variants={fadeUp} className="inline-block bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-semibold mb-5">
            Para famílias
          </motion.div>
          <motion.h2 variants={fadeUp} className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-balance leading-[1.1]">
            Uma ferramenta poderosa para <GradientText>famílias</GradientText>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-muted-foreground text-lg mb-8 text-balance">
            Com KIVARA os pais podem acompanhar, ensinar e motivar os filhos na jornada financeira.
          </motion.p>
          <motion.div variants={stagger} className="space-y-3">
            {items.map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ y: -2, boxShadow: "0 12px 24px -6px hsl(var(--primary) / 0.1)" }}
                className="flex items-center gap-4 bg-card/80 backdrop-blur-sm rounded-2xl border border-border/60 p-3.5 transition-all group"
              >
                <div className={`${item.bg} rounded-xl p-2 shrink-0 transition-transform group-hover:scale-110`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <p className="text-base text-foreground font-medium flex-1">{item.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════
   8. BENEFÍCIOS ESCOLAS
   ═══════════════════════════════════════════ */
function SchoolBenefits() {
  const items = [
    { icon: BookOpen, text: "Integrar desafios financeiros nas aulas", bg: "bg-accent/10", color: "text-accent-foreground" },
    { icon: BarChart3, text: "Acompanhar a evolução dos estudantes", bg: "bg-primary/10", color: "text-primary" },
    { icon: Trophy, text: "Incentivar competição saudável entre turmas", bg: "bg-secondary/10", color: "text-secondary" },
  ];
  return (
    <>
      <WaveDivider className="text-muted/40 -mb-1" />
      <Section id="escolas" className="bg-muted/40">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div>
            <motion.div variants={fadeUp} className="inline-block bg-accent/10 text-accent-foreground rounded-full px-4 py-1.5 text-sm font-semibold mb-5">
              Para escolas
            </motion.div>
            <motion.h2 variants={fadeUp} className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-balance leading-[1.1]">
              Educação financeira para a <GradientText>nova geração</GradientText>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground text-lg mb-8 text-balance">
              Professores podem transformar a sala de aula num laboratório financeiro.
            </motion.p>
            <motion.div variants={stagger} className="space-y-3">
              {items.map((item, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  whileHover={{ y: -2, boxShadow: "0 12px 24px -6px hsl(var(--primary) / 0.1)" }}
                  className="flex items-center gap-4 bg-card/80 backdrop-blur-sm rounded-2xl border border-border/60 p-3.5 transition-all group"
                >
                  <div className={`${item.bg} rounded-xl p-2 shrink-0 transition-transform group-hover:scale-110`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <p className="text-base text-foreground font-medium flex-1">{item.text}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
          <motion.div variants={fadeUp} className="flex justify-center relative">
            <div className="absolute inset-0 rounded-full bg-accent/8sm sm:max-w-md md:max-w- blur-3xl scale-75 pointer-events-none" />
            <img src={ssm sm:max-w-md md:max-w-choolBenefit} alt="Sala de aula africana" className="w-full max-w-xl relative z-10 drop-shadow-xl" />
          </motion.div>
        </div>
      </Section>
      <WaveDivider flip className="text-muted/40 -mt-1" />
    </>
  );
}

/* ═══════════════════════════════════════════
   9. GAMIFICAÇÃO — animated chips + mockup
   ═══════════════════════════════════════════ */
function GamificationSection() {
  const elements = [
    { icon: Flame, label: "Missões diárias", bg: "bg-destructive/10", color: "text-destructive", anim: "glow" as const },
    { icon: TrendingUp, label: "Níveis de progressão", bg: "bg-primary/10", color: "text-primary", anim: "bounce" as const },
    { icon: Trophy, label: "Ligas semanais", bg: "bg-accent/10", color: "text-accent-foreground", anim: "wiggle" as const },
    { icon: Medal, label: "Medalhas e conquistas", bg: "bg-secondary/10", color: "text-secondary", anim: "pulse" as const },
    { icon: Gamepad2, label: "Avatares personalizados", bg: "bg-primary/10", color: "text-primary", anim: "spin" as const },
  ];
  return (
    <Section>
      <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
        <motion.div variants={fadeUp} className="flex justify-center order-2 md:order-1 relative">
          <div className="absolute inset-0 rounded-full bg-accent/8 blur-3xl scale-75 pointer-events-none" />
         sm sm:max-w-md md:max-w- <img src={gamificationMockup} alt="Plataforma KIVARA gamificada" className="w-full max-w-xl relative z-10 drop-shadow-xl" />
        </motion.div>
        <div className="order-1 md:order-2">
          <motion.div variants={fadeUp} className="inline-block bg-accent/10 text-accent-foreground rounded-full px-4 py-1.5 text-sm font-semibold mb-5">
            Gamificação
          </motion.div>
          <motion.h2 variants={fadeUp} className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-balance leading-[1.1]">
            Porque as crianças adoram aprender com <GradientText>KIVARA</GradientText>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-muted-foreground text-lg mb-8 text-balance">
            Aprender deixa de ser uma obrigação e torna-se uma experiência envolvente.
          </motion.p>
          <motion.div variants={staggerFast} className="flex flex-wrap gap-3">
            {elements.map((el, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, scale: 0.85 },
                  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 20 } },
                }}
                whileHover={{ y: -3, scale: 1.05 }}
                className={`flex items-center gap-2.5 ${el.bg} rounded-full px-4 py-2.5 transition-shadow hover:shadow-md cursor-default`}
              >
                <AnimatedIcon icon={el.icon} animation={el.anim} className={`w-5 h-5 ${el.color}`} />
                <span className="font-display text-sm font-semibold text-foreground">{el.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════
   10. CONFIANÇA — dark block, glow shield + badge
   ═══════════════════════════════════════════ */
function TrustSection() {
  const points = [
    { icon: Users, text: "Contas infantis supervisionadas", anim: "pulse" as const },
    { icon: Eye, text: "Controlo parental completo", anim: "glow" as const },
    { icon: Lock, text: "Dados protegidos e encriptados", anim: "wiggle" as const },
    { icon: ShieldCheck, text: "Ambiente educativo seguro", anim: "glow" as const },
  ];
  return (
    <Section className="!bg-foreground !text-background">
      <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
        <div>
          <motion.div variants={fadeUp} className="inline-block bg-background/10 rounded-full px-4 py-1.5 text-sm font-semibold mb-5 text-background/80">
            Segurança
          </motion.div>
          <motion.h2 variants={fadeUp} className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-balance leading-[1.1]">
            Criado para ser seguro
          </motion.h2>
          <motion.p variants={fadeUp} className="opacity-60 mb-8 text-lg text-balance">
            KIVARA foi concebida com segurança e privacidade como prioridade máxima.
          </motion.p>
          <motion.div variants={staggerFast} className="grid grid-cols-2 gap-3">
            {points.map((p, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ y: -4, boxShadow: "0 12px 30px -8px hsl(var(--secondary) / 0.3)" }}
                className="bg-background/[0.06] rounded-2xl p-5 flex flex-col items-center text-center gap-3 transition-all border border-background/[0.08] group"
              >
                <div className="rounded-full p-2.5 bg-background/10 transition-transform group-hover:scale-110">
                  <AnimatedIcon icon={p.icon} animation={p.anim} className="w-5 h-5" />
                </div>
                <span className="font-display text-sm font-semibold">{p.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
        <motion.div variants={fadeUp} className="flex justify-center relative">
          <div className="absolute inset-0 rounded-full bg-secondary/15 blur-3xl scale-75 pointer-events-none" />
          <img src={trustSecurityImg} alt="Segurança KIVARA" className="w-full max-w-xl opacity-90 relative z-10 drop-shadow-2xl" />
        </motion.div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════
   11. PROVA SOCIAL — 3D testimonials (compact)
   ═══════════════════════════════════════════ */
function SocialProof() {
  const stats = [
    { value: 500, suffix: "+", label: "Crianças activas" },
    { value: 150, suffix: "+", label: "Famílias" },
    { value: 10, suffix: "+", label: "Escolas" },
    { value: 49, suffix: "", label: "Avaliação", display: "4.9★" },
  ];

  const testimonials = [
    { name: "Ana M.", role: "Mãe de 2 filhos", text: "Os meus filhos pedem para fazer missões todos os dias. Nunca pensei que poupar pudesse ser tão divertido para eles!", rating: 5 },
    { name: "Prof. Carlos S.", role: "Professor do 4.º ano", text: "Trouxe o KIVARA para a sala de aula e os alunos passaram a discutir finanças com entusiasmo genuíno.", rating: 5 },
    { name: "Joana R.", role: "Mãe de adolescente", text: "Finalmente uma ferramenta que ensina responsabilidade financeira de forma que os jovens entendem e gostam.", rating: 5 },
  ];

  return (
    <>
      <WaveDivider className="text-muted/40 -mb-1" />
      <Section className="bg-muted/40">
        {/* Stars */}
        <motion.div variants={fadeUp} className="text-center mb-4">
          <div className="flex items-center justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0, rotate: -30 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 300 }}
              >
                <Star className="w-7 h-7 text-accent fill-accent" />
              </motion.div>
            ))}
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground text-balance mb-3 leading-[1.1]">
            Mais de 500 crianças já começaram a sua jornada
          </h2>
          <p className="text-muted-foreground text-lg">Famílias e escolas de vários países confiam em nós.</p>
        </motion.div>

        {/* Stats */}
        <motion.div variants={staggerFast} className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto mb-8 mt-6">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              whileHover={{ y: -4, boxShadow: "0 16px 32px -8px hsl(var(--primary) / 0.12)" }}
              className="bg-card rounded-2xl border border-border p-5 text-center transition-all"
            >
              <p className="font-display text-2xl md:text-3xl font-bold text-primary">
                {s.display || <CountUp target={s.value} suffix={s.suffix} />}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials — 3D rotation on enter */}
        <motion.div variants={staggerFast} className="grid md:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, rotateY: -15, x: -20 },
                visible: {
                  opacity: 1, rotateY: 0, x: 0,
                  transition: { duration: 0.7, ease: easeOut as unknown as [number, number, number, number] }
                },
              }}
              whileHover={{ y: -4, boxShadow: "0 16px 32px -8px hsl(var(--primary) / 0.1)" }}
              className="bg-card rounded-2xl border border-border p-5 relative transition-all"
              style={{ perspective: 1000, transformStyle: "preserve-3d" }}
            >
              <Quote className="w-7 h-7 text-primary/10 absolute top-4 right-4" />
              <div className="flex gap-1 mb-3">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-accent fill-accent" />
                ))}
              </div>
              <p className="text-base text-foreground mb-4 italic leading-relaxed">"{t.text}"</p>
              <div>
                <p className="text-sm font-bold text-foreground">{t.name}</p>
                <p className="text-sm text-muted-foreground">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Section>
      <WaveDivider flip className="text-muted/40 -mt-1" />
    </>
  );
}

/* ═══════════════════════════════════════════
   12. CTA FINAL — gradient shift hover
   ═══════════════════════════════════════════ */
function FinalCTA() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={stagger}
      className="relative px-5 sm:px-8 py-12 md:py-16 bg-secondary overflow-hidden"
    >
      {/* Decorative glow orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-background/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent/15 rounded-full blur-3xl pointer-events-none" />

      <motion.div variants={fadeUp} className="relative text-center max-w-3xl mx-auto">
        <motion.img
          src={kivoSvg}
          alt="Kivo"
          className="w-14 h-14 md:w-18 md:h-18 mx-auto mb-6"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-5 text-secondary-foreground leading-[1.1]">
          Comece hoje a construir o futuro financeiro do seu filho
        </h2>
        <p className="text-secondary-foreground/70 text-lg md:text-xl mb-8 max-w-xl mx-auto text-balance">
          Junte-se às famílias que estão a transformar a educação financeira dos seus filhos.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button
            size="lg"
            className="bg-background text-foreground hover:bg-background/90 text-base px-8 shimmer transition-shadow hover:shadow-xl"
            asChild
          >
            <Link to="/login">
              Criar conta familiar <ChevronRight className="ml-1" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="text-base px-8 border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10" asChild>
            <Link to="/login">Levar KIVARA para a escola</Link>
          </Button>
        </div>
      </motion.div>
    </motion.section>
  );
}

/* ═══════════════════════════════════════════
   13. FOOTER — compact gradient dark
   ═══════════════════════════════════════════ */
function Footer() {
  return (
    <footer className="bg-gradient-to-b from-foreground to-foreground/95 text-background px-5 sm:px-8 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="col-span-2 md:col-span-1">
            <img src={kivaraLogoWhite} alt="KIVARA" className="h-10 md:h-12 opacity-90 mb-3" />
            <p className="text-sm opacity-60">Educação financeira gamificada para crianças e famílias.</p>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold mb-3 opacity-90">Plataforma</h4>
            <ul className="space-y-1.5">
              <li><a href="#como-funciona" className="text-sm opacity-60 hover:opacity-100 transition-opacity">Como funciona</a></li>
              <li><a href="#universo" className="text-sm opacity-60 hover:opacity-100 transition-opacity">Universo KIVARA</a></li>
              <li><a href="#familias" className="text-sm opacity-60 hover:opacity-100 transition-opacity">Para famílias</a></li>
              <li><a href="#escolas" className="text-sm opacity-60 hover:opacity-100 transition-opacity">Para escolas</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold mb-3 opacity-90">Conta</h4>
            <ul className="space-y-1.5">
              <li><Link to="/login" className="text-sm opacity-60 hover:opacity-100 transition-opacity">Entrar</Link></li>
              <li><Link to="/login" className="text-sm opacity-60 hover:opacity-100 transition-opacity">Criar conta</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold mb-3 opacity-90">Newsletter</h4>
            <p className="text-sm opacity-60 mb-2">Receba dicas de educação financeira.</p>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center bg-background/10 rounded-xl px-3 gap-2">
                <Mail className="w-4 h-4 opacity-40" />
                <input type="email" placeholder="email@exemplo.com" className="bg-transparent text-sm py-2 w-full outline-none placeholder:opacity-40" />
              </div>
              <button className="bg-secondary text-secondary-foreground rounded-xl px-3.5 text-sm font-semibold hover:bg-secondary/90 transition-colors">
                →
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-background/10 pt-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-sm opacity-50">© {new Date().getFullYear()} KIVARA. Todos os direitos reservados.</p>
          <p className="text-sm opacity-40">Feito com ❤️ para a próxima geração financeira</p>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-body">
      <Navbar />
      <main id="main-content">
        <Hero />
        <ProblemSection />
        <SolutionSection />
        <HowItWorks />
        <UniverseSection />
        <ParentBenefits />
        <SchoolBenefits />
        <GamificationSection />
        <TrustSection />
        <SocialProof />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
