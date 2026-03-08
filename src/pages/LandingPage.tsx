import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring, animate } from "framer-motion";
import { Button } from "@/components/ui/button";
import kivaraLogo from "@/assets/logo-kivara-full.png";
import kivaraLogoWhite from "@/assets/logo-kivara-white.svg";
import kivoSvg from "@/assets/kivo.svg";
import heroIllustration from "@/assets/landing/hero-illustration.png";
import parentsBenefit from "@/assets/landing/parents-benefit.png";
import schoolBenefit from "@/assets/landing/school-benefit.png";
import gamificationImg from "@/assets/landing/gamification.png";
import trustSecurityImg from "@/assets/landing/trust-security.png";
import {
  Coins, Target, TrendingUp, ShieldCheck, Users,
  Trophy, Flame, Medal, Gamepad2, Sparkles, Building2, TreePine,
  BookOpen, Swords, ShoppingBag, BarChart3, ListChecks,
  Heart, Lock, Eye, UserCheck, ChevronRight, Star, Zap, Menu, X,
  AlertTriangle, TrendingDown, Sprout, Check, Mail, Quote,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

/* ─── animation variants ─── */
const easeOut = [0.22, 1, 0.36, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easeOut as unknown as [number, number, number, number] } },
};
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.7 } },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: easeOut as unknown as [number, number, number, number] } },
};
const blurIn = {
  hidden: { opacity: 0, filter: "blur(12px)" },
  visible: { opacity: 1, filter: "blur(0px)", transition: { duration: 0.8 } },
};
const slideInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: easeOut as unknown as [number, number, number, number] } },
};
const slideInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: easeOut as unknown as [number, number, number, number] } },
};
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };
const staggerFast = { visible: { transition: { staggerChildren: 0.08 } } };
const staggerSlow = { visible: { transition: { staggerChildren: 0.18 } } };

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

/* ─── StaggerWords ─── */
function StaggerWords({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={className}>
      {text.split(" ").map((word, i) => (
        <motion.span
          key={i}
          variants={{
            hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
            visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, delay: i * 0.06 } },
          }}
          className="inline-block mr-[0.3em]"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

/* ─── Section wrapper — generous spacing ─── */
function Section({ children, className = "", id, fullBleed = false }: { children: React.ReactNode; className?: string; id?: string; fullBleed?: boolean }) {
  return (
    <motion.section
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={stagger}
      className={`px-5 py-20 md:py-32 ${className}`}
    >
      {fullBleed ? children : <div className="mx-auto max-w-6xl">{children}</div>}
    </motion.section>
  );
}

function SectionTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.h2
      variants={fadeUp}
      className={`font-display text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-5 text-balance ${className}`}
    >
      {children}
    </motion.h2>
  );
}

function SectionSubtitle({ children }: { children: React.ReactNode }) {
  return (
    <motion.p variants={fadeUp} className="text-muted-foreground text-body md:text-body-lg text-center max-w-2xl mx-auto mb-14 text-balance">
      {children}
    </motion.p>
  );
}

/* ─── Gradient text component (cross-browser) ─── */
function GradientText({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={className}
      style={{
        backgroundImage: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)), hsl(var(--accent)))",
        backgroundSize: "200% auto",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        animation: "gradient-shift 4s ease infinite",
      }}
    >
      {children}
    </span>
  );
}

/* ─── Animated gradient orbs background ─── */
function GradientOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-30 animate-float-slow"
        style={{
          background: "radial-gradient(circle, hsl(var(--kivara-blue) / 0.3) 0%, transparent 70%)",
          top: "-10%",
          left: "-10%",
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full opacity-25 animate-float-slow"
        style={{
          background: "radial-gradient(circle, hsl(var(--kivara-green) / 0.25) 0%, transparent 70%)",
          top: "20%",
          right: "-5%",
          animationDelay: "2s",
        }}
      />
      <div
        className="absolute w-[350px] h-[350px] rounded-full opacity-20 animate-float-slow"
        style={{
          background: "radial-gradient(circle, hsl(var(--kivara-gold) / 0.2) 0%, transparent 70%)",
          bottom: "-5%",
          left: "30%",
          animationDelay: "4s",
        }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════
   1. NAVBAR
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
          ? "bg-background/80 backdrop-blur-xl shadow-lg shadow-foreground/5 border-b border-border/50"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="mx-auto max-w-6xl flex items-center justify-between px-5 h-16">
        <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-105">
          <img src={kivaraLogo} alt="KIVARA" className="h-10 md:h-12" />
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-small font-medium text-muted-foreground hover:text-foreground transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary after:scale-x-0 after:origin-right after:transition-transform hover:after:scale-x-100 hover:after:origin-left"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Entrar</Link>
          </Button>
          <Button size="sm" className="gradient-kivara text-primary-foreground shimmer glow-primary" asChild>
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
          className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border px-5 pb-4 space-y-3"
        >
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="block text-body font-medium text-muted-foreground py-2">
              {link.label}
            </a>
          ))}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <Link to="/login">Entrar</Link>
            </Button>
            <Button size="sm" className="flex-1 gradient-kivara text-primary-foreground" asChild>
              <Link to="/login">Criar conta</Link>
            </Button>
          </div>
        </motion.div>
      )}
    </nav>
  );
}

/* ═══════════════════════════════════════════
   2. HERO — maximum impact with gradient orbs + parallax
   ═══════════════════════════════════════════ */
function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const illustrationY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  return (
    <motion.section
      ref={heroRef}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={stagger}
      className="px-5 pt-28 md:pt-40 pb-12 md:pb-24 relative overflow-hidden"
    >
      <GradientOrbs />

      <div className="mx-auto max-w-6xl grid md:grid-cols-2 gap-10 md:gap-16 items-center relative z-10">
        <div>
          {/* Badge */}
          <motion.div
            variants={blurIn}
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-8"
          >
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
              <Sparkles className="w-4 h-4 text-accent" />
            </motion.div>
            <span className="text-caption font-semibold text-foreground">Educação financeira gamificada</span>
          </motion.div>

          {/* Headline — bigger, bolder */}
          <motion.h1
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="font-display text-[2.5rem] sm:text-[3.25rem] md:text-[4rem] lg:text-[4.5rem] font-bold leading-[1.08] tracking-tight text-foreground"
          >
            <StaggerWords text="Pequenos hábitos." />
            <br />
            <GradientText>
              <StaggerWords text="Grandes futuros." />
            </GradientText>
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-8 text-body-lg md:text-lg text-muted-foreground max-w-xl text-balance">
            KIVARA transforma educação financeira num jogo interactivo onde crianças aprendem a ganhar,
            poupar e planear o futuro — enquanto os pais acompanham cada passo.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-10 flex flex-wrap gap-3">
            <Button size="lg" className="gradient-kivara text-primary-foreground shimmer glow-primary text-base" asChild>
              <Link to="/login">
                Criar conta familiar <ChevronRight className="ml-1" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="hover:glow-primary transition-shadow text-base" asChild>
              <a href="#como-funciona">Explorar a plataforma</a>
            </Button>
          </motion.div>

          {/* Feature pills */}
          <motion.div variants={staggerFast} className="mt-10 flex flex-wrap gap-3">
            {[
              { icon: ShieldCheck, label: "100% seguro", color: "text-secondary" },
              { icon: Users, label: "+500 famílias", color: "text-primary" },
              { icon: Star, label: "Gratuito", color: "text-accent" },
              { icon: Zap, label: "Gamificado", color: "text-accent" },
            ].map((pill, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="flex items-center gap-1.5 bg-card/60 backdrop-blur-sm border border-border/50 rounded-full px-3 py-1.5"
              >
                <pill.icon className={`w-3.5 h-3.5 ${pill.color}`} />
                <span className="text-caption font-medium text-muted-foreground">{pill.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Illustration with parallax */}
        <motion.div variants={scaleIn} className="relative flex items-center justify-center" style={{ y: illustrationY }}>
          <div className="absolute inset-4 rounded-3xl bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 blur-2xl animate-pulse-glow" />
          <img
            src={heroIllustration}
            alt="Crianças a aprender sobre dinheiro"
            className="w-full max-w-md md:max-w-lg drop-shadow-2xl relative z-10"
          />
          <motion.img
            src={kivoSvg}
            alt="Kivo"
            className="absolute -top-2 -right-2 md:top-0 md:right-0 w-16 md:w-20 drop-shadow-lg z-20"
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          />
          {/* Floating glass elements */}
          {[
            { Icon: Coins, cls: "top-8 left-0 md:left-4", delay: 0.3 },
            { Icon: Target, cls: "bottom-4 right-4", delay: 0.6 },
            { Icon: Trophy, cls: "bottom-16 left-2", delay: 0.9 },
          ].map((f, i) => (
            <motion.div
              key={i}
              className={`absolute ${f.cls} glass rounded-2xl p-3 shadow-lg z-20`}
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 2.5 + i * 0.3, ease: "easeInOut", delay: f.delay }}
            >
              <f.Icon className="w-5 h-5 text-accent" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}

/* ═══════════════════════════════════════════
   3. PROBLEMA — editorial with oversized numbers
   ═══════════════════════════════════════════ */
function ProblemSection() {
  const points = [
    { icon: AlertTriangle, text: "Crescemos sem aprender a gerir dinheiro, definir metas ou planear o futuro financeiro.", accent: "from-destructive to-destructive/30" },
    { icon: TrendingDown, text: "Sem orientação adequada, as decisões financeiras tornam-se difíceis na vida adulta.", accent: "from-accent to-accent/30" },
    { icon: Sprout, text: "KIVARA nasceu para mudar isso — começando cedo, através do jogo e da prática.", accent: "from-secondary to-secondary/30" },
  ];
  return (
    <Section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--muted)/0.5)_0%,transparent_70%)]" />
      <div className="relative z-10">
        <SectionTitle>A maioria das pessoas aprende sobre dinheiro tarde demais</SectionTitle>
        <SectionSubtitle>Poucas crianças recebem educação financeira. Queremos mudar isso.</SectionSubtitle>

        <div className="max-w-3xl mx-auto grid md:grid-cols-3 gap-6 mt-4">
          {points.map((p, i) => (
            <motion.div
              key={i}
              variants={i === 0 ? slideInLeft : i === 2 ? slideInRight : fadeUp}
              whileHover={{ y: -6, scale: 1.02 }}
              className="relative bg-card rounded-2xl border border-border p-6 pt-12 text-center hover:shadow-xl hover:shadow-primary/5 transition-all group"
            >
              {/* Oversized decorative number */}
              <span className="absolute top-2 left-4 font-display text-7xl font-black text-foreground/[0.04] select-none leading-none">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className={`mx-auto bg-gradient-to-br ${p.accent} rounded-2xl p-3 w-fit mb-4`}>
                <p.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <p className="text-body text-muted-foreground">{p.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════
   4. SOLUÇÃO — split screen with gradient border
   ═══════════════════════════════════════════ */
function SolutionSection() {
  const checks = [
    "Missões práticas para aprender a ganhar",
    "Metas de poupança com progresso visual",
    "Decisões financeiras num ambiente seguro",
    "Acompanhamento total pelos pais",
  ];
  return (
    <Section className="relative overflow-hidden">
      <GradientOrbs />
      <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
        <motion.div variants={slideInLeft}>
          <motion.div variants={fadeUp} className="inline-block bg-secondary/10 text-secondary rounded-full px-4 py-1 text-caption font-semibold mb-4">
            A solução
          </motion.div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-balance">
            Aprender finanças através da <GradientText>experiência</GradientText>
          </h2>
          <p className="text-body md:text-body-lg text-muted-foreground mb-8 text-balance">
            Em vez de teoria, KIVARA ensina através da prática. Cada acção transforma-se numa lição que constrói hábitos financeiros positivos.
          </p>
          <motion.div variants={staggerSlow} className="space-y-3">
            {checks.map((text, i) => (
              <motion.div key={i} variants={fadeUp} className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + i * 0.15, type: "spring", stiffness: 300 }}
                  className="bg-secondary/15 rounded-full p-1 shrink-0"
                >
                  <Check className="w-4 h-4 text-secondary" />
                </motion.div>
                <span className="text-body text-foreground font-medium">{text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
        <motion.div variants={scaleIn} className="flex justify-center">
          <div className="relative">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-primary via-secondary to-accent opacity-20 blur-lg animate-pulse-glow" />
            <div className="gradient-border rounded-3xl overflow-hidden">
              <img src={heroIllustration} alt="Crianças a aprender finanças" className="w-full max-w-xs md:max-w-sm rounded-3xl relative z-10" />
            </div>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════
   5. COMO FUNCIONA — solid gradient line + glow steps
   ═══════════════════════════════════════════ */
function HowItWorks() {
  const steps = [
    { icon: Coins, gradient: "from-accent to-accent/60", title: "Ganhar", desc: "Completar missões e tarefas para ganhar moedas virtuais." },
    { icon: Target, gradient: "from-secondary to-secondary/60", title: "Poupar", desc: "Criar metas e aprender a guardar para o que realmente importa." },
    { icon: TrendingUp, gradient: "from-primary to-primary/60", title: "Evoluir", desc: "Desbloquear níveis, conquistas e novas aprendizagens financeiras." },
  ];
  return (
    <Section id="como-funciona" className="bg-muted/30">
      <SectionTitle>Como funciona</SectionTitle>
      <SectionSubtitle>Três passos simples para começar a jornada financeira.</SectionSubtitle>
      <div className="relative">
        {/* Solid gradient connector — desktop only */}
        <div className="hidden md:block absolute top-1/2 left-[17%] right-[17%] h-[3px] -translate-y-1/2 z-0 rounded-full overflow-hidden">
          <motion.div
            className="h-full w-full bg-gradient-to-r from-accent via-secondary to-primary rounded-full"
            initial={{ scaleX: 0, transformOrigin: "left" }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          />
        </div>
        <motion.div variants={staggerSlow} className="grid md:grid-cols-3 gap-8 relative z-10">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              whileHover={{ y: -8, scale: 1.02 }}
              className="glass rounded-2xl p-8 text-center flex flex-col items-center gap-5 transition-all hover:shadow-xl hover:shadow-primary/10 group"
            >
              <div className="relative">
                <motion.div
                  className={`rounded-2xl p-5 bg-gradient-to-br ${s.gradient} text-primary-foreground shadow-lg`}
                  whileHover={{ boxShadow: "0 0 30px -4px hsl(var(--primary) / 0.3)" }}
                >
                  <s.icon className="w-8 h-8" />
                </motion.div>
                <span className="absolute -top-2 -right-2 bg-gradient-to-br from-foreground to-foreground/80 text-background text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center shadow-lg">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-display text-xl font-bold">{s.title}</h3>
              <p className="text-body text-muted-foreground text-balance">{s.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════
   6. UNIVERSO — staggered grid with hover lift + gradient reveal
   ═══════════════════════════════════════════ */
function UniverseSection() {
  const zones = [
    { icon: Building2, label: "Cidade do Dinheiro", desc: "Aprende a ganhar e gerir", gradient: "from-accent/20 to-accent/5" },
    { icon: TreePine, label: "Vale da Poupança", desc: "Guarda e faz crescer", gradient: "from-secondary/20 to-secondary/5" },
    { icon: BookOpen, label: "Academia Financeira", desc: "Lições interactivas", gradient: "from-primary/20 to-primary/5" },
    { icon: Swords, label: "Arena dos Desafios", desc: "Compete e aprende", gradient: "from-destructive/20 to-destructive/5" },
    { icon: ShoppingBag, label: "Mercado dos Sonhos", desc: "Realiza objectivos", gradient: "from-primary/20 to-accent/5" },
  ];
  return (
    <Section id="universo" className="relative overflow-hidden">
      <GradientOrbs />
      <div className="relative z-10">
        <SectionTitle>Um mundo onde aprender sobre dinheiro se torna uma aventura</SectionTitle>
        <SectionSubtitle>Cada zona representa um estágio da aprendizagem financeira.</SectionSubtitle>

        <motion.div variants={staggerFast} className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {zones.map((z, i) => (
            <motion.div
              key={i}
              variants={blurIn}
              whileHover={{ scale: 1.05, y: -6 }}
              className={`gradient-border rounded-2xl p-6 text-center flex flex-col items-center gap-4 cursor-default transition-all hover:shadow-2xl hover:shadow-primary/10 bg-card/80 backdrop-blur-sm ${
                i === zones.length - 1 && zones.length % 2 !== 0 ? "col-span-2 md:col-span-1 mx-auto max-w-[280px] md:max-w-none" : ""
              }`}
            >
              <div className={`bg-gradient-to-br ${z.gradient} rounded-2xl p-4`}>
                <z.icon className="w-7 h-7 text-foreground/80" />
              </div>
              <span className="font-heading text-body font-bold">{z.label}</span>
              <span className="text-caption text-muted-foreground">{z.desc}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════
   7. BENEFÍCIOS PAIS — asymmetric with progress indicators
   ═══════════════════════════════════════════ */
function ParentBenefits() {
  const items = [
    { icon: BarChart3, text: "Acompanhar o progresso financeiro dos filhos", color: "from-primary to-primary/60" },
    { icon: Heart, text: "Incentivar hábitos saudáveis de poupança", color: "from-destructive to-destructive/60" },
    { icon: ListChecks, text: "Criar tarefas e recompensas educativas", color: "from-secondary to-secondary/60" },
    { icon: UserCheck, text: "Ensinar responsabilidade financeira na prática", color: "from-accent to-accent/60" },
  ];
  return (
    <Section id="familias">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <motion.div variants={scaleIn} className="flex justify-center order-2 md:order-1 relative">
          <div className="absolute -inset-8 rounded-full bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 blur-2xl" />
          <img src={parentsBenefit} alt="Pai e filho a usar KIVARA" className="w-full max-w-xs md:max-w-sm relative z-10" />
        </motion.div>
        <div className="order-1 md:order-2">
          <motion.div variants={fadeUp} className="inline-block bg-primary/10 text-primary rounded-full px-4 py-1 text-caption font-semibold mb-4">
            Para famílias
          </motion.div>
          <motion.h2 variants={fadeUp} className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-balance">
            Uma ferramenta poderosa para <GradientText>famílias</GradientText>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-muted-foreground text-body mb-8 text-balance">
            Com KIVARA os pais podem acompanhar, ensinar e motivar os filhos na jornada financeira.
          </motion.p>
          <motion.div variants={staggerSlow} className="space-y-4">
            {items.map((item, i) => (
              <motion.div
                key={i}
                variants={slideInRight}
                whileHover={{ x: 4 }}
                className="flex items-center gap-4 bg-card rounded-2xl border border-border p-4 hover:shadow-lg hover:shadow-primary/5 transition-all relative overflow-hidden group"
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${item.color} group-hover:w-1.5 transition-all`} />
                <div className={`bg-gradient-to-br ${item.color} rounded-xl p-2.5 shrink-0 ml-2`}>
                  <item.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <p className="text-body text-foreground font-medium flex-1">{item.text}</p>
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.12, type: "spring", stiffness: 300 }}
                  viewport={{ once: true }}
                >
                  <Check className="w-5 h-5 text-secondary shrink-0" />
                </motion.div>
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
    { icon: Sparkles, text: "Integrar desafios financeiros nas aulas", color: "from-accent to-accent/60" },
    { icon: BarChart3, text: "Acompanhar a evolução dos estudantes", color: "from-primary to-primary/60" },
    { icon: Trophy, text: "Incentivar competição saudável entre turmas", color: "from-secondary to-secondary/60" },
  ];
  return (
    <Section id="escolas" className="bg-muted/30">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <motion.div variants={fadeUp} className="inline-block bg-accent/10 text-accent-foreground rounded-full px-4 py-1 text-caption font-semibold mb-4">
            Para escolas
          </motion.div>
          <motion.h2 variants={fadeUp} className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-balance">
            Educação financeira para a <GradientText>nova geração</GradientText>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-muted-foreground text-body mb-8 text-balance">
            Professores podem transformar a sala de aula num laboratório financeiro.
          </motion.p>
          <motion.div variants={staggerSlow} className="space-y-4">
            {items.map((item, i) => (
              <motion.div
                key={i}
                variants={slideInLeft}
                whileHover={{ x: 4 }}
                className="flex items-center gap-4 bg-card rounded-2xl border border-border p-4 hover:shadow-lg hover:shadow-primary/5 transition-all relative overflow-hidden group"
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${item.color} group-hover:w-1.5 transition-all`} />
                <div className={`bg-gradient-to-br ${item.color} rounded-xl p-2.5 shrink-0 ml-2`}>
                  <item.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <p className="text-body text-foreground font-medium flex-1">{item.text}</p>
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.12, type: "spring", stiffness: 300 }}
                  viewport={{ once: true }}
                >
                  <Check className="w-5 h-5 text-secondary shrink-0" />
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
        <motion.div variants={scaleIn} className="flex justify-center relative">
          <div className="absolute -inset-8 rounded-full bg-gradient-to-br from-accent/10 via-transparent to-primary/10 blur-2xl" />
          <img src={schoolBenefit} alt="Professora com alunos" className="w-full max-w-xs md:max-w-sm relative z-10" />
        </motion.div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════
   9. GAMIFICAÇÃO — floating animated tags
   ═══════════════════════════════════════════ */
function GamificationSection() {
  const elements = [
    { icon: Flame, label: "Missões diárias", gradient: "from-destructive/80 to-destructive/40" },
    { icon: TrendingUp, label: "Níveis de progressão", gradient: "from-primary/80 to-primary/40" },
    { icon: Trophy, label: "Ligas semanais", gradient: "from-accent/80 to-accent/40" },
    { icon: Medal, label: "Medalhas e conquistas", gradient: "from-secondary/80 to-secondary/40" },
    { icon: Gamepad2, label: "Avatares personalizados", gradient: "from-primary/80 to-accent/40" },
  ];
  return (
    <Section>
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <motion.div variants={scaleIn} className="flex justify-center order-2 md:order-1 relative">
          <div className="absolute -inset-8 rounded-full bg-gradient-to-br from-accent/15 via-transparent to-secondary/10 blur-2xl" />
          <img src={gamificationImg} alt="Elementos de gamificação" className="w-full max-w-xs md:max-w-sm relative z-10" />
        </motion.div>
        <div className="order-1 md:order-2">
          <motion.div variants={fadeUp} className="inline-block bg-accent/10 text-accent-foreground rounded-full px-4 py-1 text-caption font-semibold mb-4">
            Gamificação
          </motion.div>
          <motion.h2 variants={fadeUp} className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-balance">
            Porque as crianças adoram aprender com <GradientText>KIVARA</GradientText>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-muted-foreground text-body mb-8 text-balance">
            Aprender deixa de ser uma obrigação e torna-se uma experiência envolvente.
          </motion.p>
          <motion.div variants={staggerFast} className="flex flex-wrap gap-3">
            {elements.map((el, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ scale: 1.08, rotate: [-1, 1, 0] }}
                animate={{
                  y: [0, -4, 0],
                }}
                transition={{
                  y: { repeat: Infinity, duration: 2.5 + i * 0.3, ease: "easeInOut", delay: i * 0.2 },
                }}
                className={`flex items-center gap-2 bg-gradient-to-r ${el.gradient} text-primary-foreground rounded-full px-5 py-3 shadow-lg cursor-default`}
              >
                <el.icon className="w-5 h-5" />
                <span className="font-heading text-small font-semibold">{el.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════
   10. CONFIANÇA — dark premium with glass + pulse rings
   ═══════════════════════════════════════════ */
function TrustSection() {
  const points = [
    { icon: Users, text: "Contas infantis supervisionadas" },
    { icon: Eye, text: "Controlo parental completo" },
    { icon: Lock, text: "Dados protegidos e encriptados" },
    { icon: ShieldCheck, text: "Ambiente educativo seguro" },
  ];
  return (
    <Section className="bg-foreground text-background overflow-hidden relative">
      {/* Animated grid background */}
      <div className="absolute inset-0 gradient-mesh-dark" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(hsl(0 0% 100% / 0.1) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100% / 0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div className="relative z-10 mx-auto max-w-6xl grid md:grid-cols-2 gap-12 items-center">
        <div>
          <motion.div variants={fadeUp} className="inline-block bg-background/10 rounded-full px-4 py-1 text-caption font-semibold mb-4 text-background/80">
            Segurança
          </motion.div>
          <motion.h2 variants={fadeUp} className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-5 text-balance">
            Criado para ser seguro
          </motion.h2>
          <motion.p variants={fadeUp} className="opacity-70 mb-10 text-body text-balance">
            KIVARA foi concebida com segurança e privacidade como prioridade máxima.
          </motion.p>
          <motion.div variants={staggerFast} className="grid grid-cols-2 gap-4">
            {points.map((p, i) => (
              <motion.div
                key={i}
                variants={blurIn}
                whileHover={{ scale: 1.05 }}
                className="glass-dark rounded-2xl p-6 flex flex-col items-center text-center gap-3 transition-all hover:shadow-2xl"
              >
                <motion.div
                  className="rounded-full p-3.5 ring-2 ring-background/10"
                  animate={{
                    boxShadow: [
                      "0 0 0 0 transparent",
                      "0 0 25px -4px hsla(0,0%,100%,0.15)",
                      "0 0 0 0 transparent",
                    ],
                  }}
                  transition={{ repeat: Infinity, duration: 3, delay: i * 0.4 }}
                >
                  <p.icon className="w-6 h-6" />
                </motion.div>
                <span className="font-heading text-small font-semibold">{p.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
        <motion.div variants={scaleIn} className="flex justify-center relative">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 blur-2xl animate-pulse-glow" />
          <img src={trustSecurityImg} alt="Segurança KIVARA" className="w-full max-w-xs md:max-w-sm opacity-90 relative z-10" />
        </motion.div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════
   11. PROVA SOCIAL — testimonials + counters
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
    <Section className="bg-muted/30 overflow-hidden">
      <div className="mx-auto max-w-6xl">
        {/* Stars */}
        <motion.div variants={fadeUp} className="text-center mb-6">
          <div className="flex items-center justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0, rotate: -180 }} whileInView={{ opacity: 1, scale: 1, rotate: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, type: "spring" }}>
                <Star className="w-7 h-7 text-accent fill-accent" />
              </motion.div>
            ))}
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground text-balance mb-3">
            Mais de 500 crianças já começaram a sua jornada
          </h2>
          <p className="text-muted-foreground text-body text-balance">Famílias e escolas de vários países confiam em nós.</p>
        </motion.div>

        {/* Stats */}
        <motion.div variants={staggerFast} className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-16">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              className="glass rounded-2xl p-6 text-center transition-all hover:shadow-xl hover:shadow-primary/5"
            >
              <p
                className="font-display text-2xl md:text-3xl font-bold"
                style={{
                  backgroundImage: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {s.display || <CountUp target={s.value} suffix={s.suffix} />}
              </p>
              <p className="text-caption text-muted-foreground mt-1">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials */}
        <motion.div variants={staggerFast} className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              variants={i === 0 ? slideInLeft : i === 2 ? slideInRight : fadeUp}
              whileHover={{ y: -4 }}
              className="glass rounded-2xl p-6 relative overflow-hidden transition-all hover:shadow-xl hover:shadow-primary/5"
            >
              <Quote className="w-8 h-8 text-primary/15 absolute top-4 right-4" />
              <div className="flex gap-1 mb-3">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-accent fill-accent" />
                ))}
              </div>
              <p className="text-body text-foreground mb-4 italic">"{t.text}"</p>
              <div>
                <p className="text-small font-bold text-foreground">{t.name}</p>
                <p className="text-caption text-muted-foreground">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════
   12. CTA FINAL — full-bleed gradient + sparkles
   ═══════════════════════════════════════════ */
function FinalCTA() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={stagger}
      className="px-5 py-24 md:py-36 relative overflow-hidden"
    >
      {/* Full-bleed gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />
      <GradientOrbs />

      {/* Sparkles */}
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-accent/50"
          style={{ left: `${10 + i * 9}%`, top: `${15 + (i % 4) * 20}%` }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0], y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 2 + i * 0.3, delay: i * 0.3 }}
        />
      ))}

      <motion.div variants={fadeUp} className="text-center max-w-2xl mx-auto relative z-10">
        <motion.div
          variants={scaleIn}
          className="inline-flex items-center justify-center glass rounded-full p-5 mb-8"
        >
          <div className="absolute inset-0 rounded-full glow-accent animate-pulse-glow" />
          <img src={kivoSvg} alt="Kivo" className="w-14 h-14 relative z-10" />
        </motion.div>
        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-5">
          <GradientText>Comece hoje a construir o futuro financeiro do seu filho</GradientText>
        </h2>
        <p className="text-muted-foreground text-body md:text-body-lg mb-10 max-w-lg mx-auto text-balance">
          Junte-se às famílias que estão a transformar a educação financeira dos seus filhos.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button size="lg" className="gradient-kivara text-primary-foreground shimmer glow-primary text-base" asChild>
            <Link to="/login">
              Criar conta familiar <ChevronRight className="ml-1" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="text-base" asChild>
            <Link to="/login">Levar KIVARA para a escola</Link>
          </Button>
        </div>
      </motion.div>
    </motion.section>
  );
}

/* ═══════════════════════════════════════════
   13. FOOTER
   ═══════════════════════════════════════════ */
function Footer() {
  return (
    <footer className="bg-foreground text-background px-5 py-14 relative overflow-hidden">
      <div className="absolute inset-0 gradient-mesh-dark opacity-50" />
      <div className="mx-auto max-w-6xl relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <img src={kivaraLogoWhite} alt="KIVARA" className="h-9 opacity-90 mb-4 drop-shadow-lg" />
            <p className="text-caption opacity-60">Educação financeira gamificada para crianças e famílias.</p>
          </div>
          <div>
            <h4 className="font-heading text-small font-semibold mb-3 opacity-90">Plataforma</h4>
            <ul className="space-y-2">
              <li><a href="#como-funciona" className="text-caption opacity-60 hover:opacity-100 transition-opacity">Como funciona</a></li>
              <li><a href="#universo" className="text-caption opacity-60 hover:opacity-100 transition-opacity">Universo KIVARA</a></li>
              <li><a href="#familias" className="text-caption opacity-60 hover:opacity-100 transition-opacity">Para famílias</a></li>
              <li><a href="#escolas" className="text-caption opacity-60 hover:opacity-100 transition-opacity">Para escolas</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading text-small font-semibold mb-3 opacity-90">Conta</h4>
            <ul className="space-y-2">
              <li><Link to="/login" className="text-caption opacity-60 hover:opacity-100 transition-opacity">Entrar</Link></li>
              <li><Link to="/login" className="text-caption opacity-60 hover:opacity-100 transition-opacity">Criar conta</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading text-small font-semibold mb-3 opacity-90">Newsletter</h4>
            <p className="text-caption opacity-60 mb-3">Receba dicas de educação financeira.</p>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center bg-background/10 rounded-xl px-3 gap-2">
                <Mail className="w-4 h-4 opacity-40" />
                <input type="email" placeholder="email@exemplo.com" className="bg-transparent text-caption py-2 w-full outline-none placeholder:opacity-40" />
              </div>
              <button className="gradient-kivara text-primary-foreground rounded-xl px-3 text-caption font-semibold hover:opacity-90 transition-opacity">
                →
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-background/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-caption opacity-50">© {new Date().getFullYear()} KIVARA. Todos os direitos reservados.</p>
          <p className="text-caption opacity-40">Feito com ❤️ para a próxima geração financeira</p>
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
