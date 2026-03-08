import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring, animate } from "framer-motion";
import { Button } from "@/components/ui/button";
import kivaraLogo from "@/assets/logo-kivara.svg";
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
  AlertTriangle, TrendingDown, Sprout, Check, Mail,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

/* ─── animation helpers ─── */
const easeOut = [0.22, 1, 0.36, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut as unknown as [number, number, number, number] } },
};
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: easeOut as unknown as [number, number, number, number] } },
};
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };
const staggerFast = { visible: { transition: { staggerChildren: 0.08 } } };

/* ─── Counter hook ─── */
function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const count = useMotionValue(0);
  const rounded = useSpring(count, { stiffness: 50, damping: 20 });

  useEffect(() => {
    if (isInView) {
      animate(count, target, { duration: 2, ease: "easeOut" });
    }
  }, [isInView, target, count]);

  useEffect(() => {
    const unsubscribe = rounded.on("change", (v) => {
      if (ref.current) ref.current.textContent = Math.round(v) + suffix;
    });
    return unsubscribe;
  }, [rounded, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

/* ─── Word-by-word stagger ─── */
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

/* ─── Section wrapper ─── */
function Section({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <motion.section
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={stagger}
      className={`px-5 py-16 md:py-24 ${className}`}
    >
      <div className="mx-auto max-w-6xl">{children}</div>
    </motion.section>
  );
}

function SectionTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.h2 variants={fadeUp} className={`font-display text-heading md:text-heading-lg text-center mb-4 ${className}`}>
      {children}
    </motion.h2>
  );
}

function SectionSubtitle({ children }: { children: React.ReactNode }) {
  return (
    <motion.p variants={fadeUp} className="text-muted-foreground text-body md:text-body-lg text-center max-w-2xl mx-auto mb-10">
      {children}
    </motion.p>
  );
}

/* ═══════════════════════════════════════════
   1. NAVBAR — scroll-aware, premium
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
          <img src={kivaraLogo} alt="KIVARA" className="h-8" />
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
   2. HERO — maximum impact
   ═══════════════════════════════════════════ */
function Hero() {
  return (
    <Section className="pt-28 md:pt-36 pb-8 md:pb-16 bg-gradient-to-b from-kivara-light-blue via-kivara-light-blue/30 to-background overflow-hidden relative dot-pattern">
      <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center relative z-10">
        <div>
          {/* Animated badge */}
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-6"
          >
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
              <Sparkles className="w-4 h-4 text-accent" />
            </motion.div>
            <span className="text-caption font-semibold text-foreground">Educação financeira gamificada</span>
          </motion.div>

          {/* Word-by-word headline */}
          <motion.h1
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="font-display text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-foreground"
          >
            <StaggerWords text="Pequenos hábitos." />
            <br />
            <span className="text-primary md:bg-gradient-to-r md:from-primary md:via-secondary md:to-accent md:bg-[length:200%_auto] md:animate-[gradient-shift_4s_ease_infinite]">
              <StaggerWords text="Grandes futuros." />
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-5 text-body md:text-body-lg text-muted-foreground max-w-lg">
            KIVARA transforma educação financeira num jogo interactivo onde crianças aprendem a ganhar,
            poupar e planear o futuro — enquanto os pais acompanham cada passo.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" className="gradient-kivara text-primary-foreground shimmer glow-primary" asChild>
              <Link to="/login">
                Criar conta familiar <ChevronRight className="ml-1" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="hover:glow-primary transition-shadow" asChild>
              <a href="#como-funciona">Explorar a plataforma</a>
            </Button>
          </motion.div>

          {/* Trust badges with counters */}
          <motion.div variants={fadeUp} className="mt-8 flex items-center gap-5 text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-secondary" />
              <span className="text-caption font-medium">100% seguro</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-caption font-medium">+<CountUp target={500} /> famílias</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-accent fill-accent" />
              <span className="text-caption font-medium">Gratuito</span>
            </div>
          </motion.div>
        </div>

        {/* Illustration with glass card */}
        <motion.div variants={scaleIn} className="relative flex items-center justify-center">
          <div className="absolute inset-4 rounded-3xl glass glow-primary opacity-50" />
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
          <motion.div
            className="absolute top-8 left-0 md:left-4 glass rounded-2xl p-3 shadow-lg z-20"
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 0.3 }}
          >
            <Coins className="text-accent w-5 h-5" />
          </motion.div>
          <motion.div
            className="absolute bottom-4 right-4 glass rounded-2xl p-3 shadow-lg z-20"
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut", delay: 0.6 }}
          >
            <Target className="text-secondary w-5 h-5" />
          </motion.div>
          <motion.div
            className="absolute bottom-16 left-2 glass rounded-2xl p-3 shadow-lg z-20"
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut", delay: 0.9 }}
          >
            <Trophy className="text-primary w-5 h-5" />
          </motion.div>
        </motion.div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════
   3. PROBLEMA — dramatic numbered cards
   ═══════════════════════════════════════════ */
function ProblemSection() {
  const points = [
    { icon: AlertTriangle, text: "Crescemos sem aprender a gerir dinheiro, definir metas ou planear o futuro financeiro.", accent: "from-destructive/20 to-transparent" },
    { icon: TrendingDown, text: "Sem orientação adequada, as decisões financeiras tornam-se difíceis na vida adulta.", accent: "from-accent/20 to-transparent" },
    { icon: Sprout, text: "KIVARA nasceu para mudar isso — começando cedo.", accent: "from-secondary/20 to-transparent" },
  ];
  return (
    <Section className="relative overflow-hidden">
      {/* Radial gradient bg */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--muted)/0.6)_0%,transparent_70%)]" />
      <div className="relative z-10">
        <SectionTitle>A maioria das pessoas aprende sobre dinheiro tarde demais</SectionTitle>
        <div className="max-w-2xl mx-auto space-y-5 mt-8">
          {points.map((p, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              whileHover={{ x: 4 }}
              className="flex items-start gap-4 bg-card rounded-2xl border border-border p-5 relative overflow-hidden group transition-shadow hover:shadow-md"
            >
              {/* Gradient left accent */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${p.accent} group-hover:w-1.5 transition-all`} />
              <div className="bg-muted rounded-xl p-2.5 shrink-0 ml-2">
                <p.icon className="w-5 h-5 text-foreground/70" />
              </div>
              <div className="flex items-start gap-3">
                <span className="text-caption font-bold text-muted-foreground/50 mt-0.5">{String(i + 1).padStart(2, "0")}</span>
                <p className="text-body text-muted-foreground">{p.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════
   4. SOLUÇÃO
   ═══════════════════════════════════════════ */
function SolutionSection() {
  return (
    <Section className="gradient-mesh">
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div>
          <SectionTitle className="text-left md:text-left">Aprender finanças através da experiência</SectionTitle>
          <motion.div variants={fadeUp} className="text-body md:text-body-lg text-muted-foreground space-y-4">
            <p>Em vez de teoria, KIVARA ensina através da prática.</p>
            <p>As crianças completam missões, definem metas e aprendem a tomar decisões financeiras num ambiente seguro e supervisionado.</p>
            <p className="font-semibold text-foreground flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent shrink-0" />
              Cada acção transforma-se numa lição que constrói hábitos financeiros positivos.
            </p>
          </motion.div>
        </div>
        <motion.div variants={scaleIn} className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl gradient-border" />
            <img src={heroIllustration} alt="Crianças a aprender finanças" className="w-full max-w-xs md:max-w-sm rounded-3xl relative z-10" />
          </div>
        </motion.div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════
   5. COMO FUNCIONA — connector line + gradient steps
   ═══════════════════════════════════════════ */
function HowItWorks() {
  const steps = [
    { icon: Coins, gradient: "from-accent/80 to-accent/40", title: "Ganhar", desc: "Completar missões e tarefas para ganhar moedas." },
    { icon: Target, gradient: "from-secondary/80 to-secondary/40", title: "Poupar", desc: "Criar metas e aprender a guardar." },
    { icon: TrendingUp, gradient: "from-primary/80 to-primary/40", title: "Evoluir", desc: "Desbloquear níveis, conquistas e novas aprendizagens." },
  ];
  return (
    <Section id="como-funciona" className="bg-muted/30">
      <SectionTitle>Como funciona</SectionTitle>
      <SectionSubtitle>Três passos simples para começar a jornada financeira.</SectionSubtitle>
      <div className="relative">
        {/* SVG connector line — desktop only */}
        <svg className="hidden md:block absolute top-1/2 left-0 w-full h-2 -translate-y-1/2 z-0" preserveAspectRatio="none">
          <motion.line
            x1="17%" y1="50%" x2="83%" y2="50%"
            stroke="hsl(var(--border))"
            strokeWidth="2"
            strokeDasharray="8 4"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div className="grid md:grid-cols-3 gap-6 relative z-10">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              whileHover={{ y: -6 }}
              className="glass rounded-2xl p-8 text-center flex flex-col items-center gap-4 transition-all hover:shadow-xl hover:shadow-primary/5 group"
            >
              <div className="relative">
                <div className={`rounded-2xl p-5 bg-gradient-to-br ${s.gradient} text-primary-foreground`}>
                  <s.icon className="w-8 h-8" />
                </div>
                <span className="absolute -top-2 -right-2 bg-gradient-to-br from-foreground to-foreground/80 text-background text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center shadow-lg">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-display text-section font-bold">{s.title}</h3>
              <p className="text-body text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════
   6. UNIVERSO KIVARA — glassmorphism cards
   ═══════════════════════════════════════════ */
function UniverseSection() {
  const zones = [
    { icon: Building2, label: "Cidade do Dinheiro", desc: "Aprende a ganhar e gerir", glow: "hover:shadow-accent/20" },
    { icon: TreePine, label: "Vale da Poupança", desc: "Guarda e faz crescer", glow: "hover:shadow-secondary/20" },
    { icon: BookOpen, label: "Academia Financeira", desc: "Lições interactivas", glow: "hover:shadow-primary/20" },
    { icon: Swords, label: "Arena dos Desafios", desc: "Compete e aprende", glow: "hover:shadow-destructive/20" },
    { icon: ShoppingBag, label: "Mercado dos Sonhos", desc: "Realiza objectivos", glow: "hover:shadow-primary/20" },
  ];
  return (
    <Section id="universo" className="gradient-mesh">
      <SectionTitle>Um mundo onde aprender sobre dinheiro se torna uma aventura</SectionTitle>
      <SectionSubtitle>Cada zona representa um estágio da aprendizagem financeira.</SectionSubtitle>

      <motion.div variants={staggerFast} className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {zones.map((z, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            whileHover={{ scale: 1.05, y: -4 }}
            className={`glass gradient-border rounded-2xl p-5 text-center flex flex-col items-center gap-3 cursor-default transition-shadow hover:shadow-xl ${z.glow}`}
          >
            <div className="bg-muted/60 rounded-xl p-3">
              <z.icon className="w-7 h-7 text-foreground/80" />
            </div>
            <span className="font-heading text-small font-bold">{z.label}</span>
            <span className="text-caption text-muted-foreground">{z.desc}</span>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}

/* ═══════════════════════════════════════════
   7. BENEFÍCIOS PAIS — premium cards
   ═══════════════════════════════════════════ */
function ParentBenefits() {
  const items = [
    { icon: BarChart3, text: "Acompanhar o progresso financeiro dos filhos", color: "from-primary to-primary/60" },
    { icon: Heart, text: "Incentivar hábitos saudáveis de poupança", color: "from-destructive to-destructive/60" },
    { icon: ListChecks, text: "Criar tarefas e recompensas", color: "from-secondary to-secondary/60" },
    { icon: UserCheck, text: "Ensinar responsabilidade financeira", color: "from-accent to-accent/60" },
  ];
  return (
    <Section id="familias">
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <motion.div variants={scaleIn} className="flex justify-center order-2 md:order-1">
          <img src={parentsBenefit} alt="Pai e filho a usar KIVARA" className="w-full max-w-xs md:max-w-sm" />
        </motion.div>
        <div className="order-1 md:order-2">
          <SectionTitle className="text-left md:text-left">Uma ferramenta poderosa para famílias</SectionTitle>
          <motion.p variants={fadeUp} className="text-muted-foreground text-body mb-8">
            Com KIVARA os pais podem acompanhar, ensinar e motivar os filhos na jornada financeira.
          </motion.p>
          <div className="space-y-4">
            {items.map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ x: 4 }}
                className="flex items-center gap-4 bg-card rounded-2xl border border-border p-4 hover:shadow-md transition-all relative overflow-hidden group"
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${item.color} group-hover:w-1.5 transition-all`} />
                <div className={`bg-gradient-to-br ${item.color} rounded-xl p-2.5 shrink-0 ml-2`}>
                  <item.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <p className="text-body text-foreground font-medium">{item.text}</p>
                <motion.div initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.1 }} viewport={{ once: true }}>
                  <Check className="w-5 h-5 text-secondary ml-auto shrink-0" />
                </motion.div>
              </motion.div>
            ))}
          </div>
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
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div>
          <SectionTitle className="text-left md:text-left">Educação financeira para a nova geração</SectionTitle>
          <motion.p variants={fadeUp} className="text-muted-foreground text-body mb-8">
            Professores podem transformar a sala de aula num laboratório financeiro.
          </motion.p>
          <div className="space-y-4">
            {items.map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ x: 4 }}
                className="flex items-center gap-4 bg-card rounded-2xl border border-border p-4 hover:shadow-md transition-all relative overflow-hidden group"
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${item.color} group-hover:w-1.5 transition-all`} />
                <div className={`bg-gradient-to-br ${item.color} rounded-xl p-2.5 shrink-0 ml-2`}>
                  <item.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <p className="text-body text-foreground font-medium">{item.text}</p>
                <motion.div initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.1 }} viewport={{ once: true }}>
                  <Check className="w-5 h-5 text-secondary ml-auto shrink-0" />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
        <motion.div variants={scaleIn} className="flex justify-center">
          <img src={schoolBenefit} alt="Professora com alunos" className="w-full max-w-xs md:max-w-sm" />
        </motion.div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════
   9. GAMIFICAÇÃO — gradient chips
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
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <motion.div variants={scaleIn} className="flex justify-center order-2 md:order-1">
          <img src={gamificationImg} alt="Elementos de gamificação" className="w-full max-w-xs md:max-w-sm" />
        </motion.div>
        <div className="order-1 md:order-2">
          <SectionTitle className="text-left md:text-left">Porque as crianças adoram aprender com KIVARA</SectionTitle>
          <motion.p variants={fadeUp} className="text-muted-foreground text-body mb-8">
            Aprender deixa de ser uma obrigação e torna-se uma experiência envolvente.
          </motion.p>
          <div className="flex flex-wrap gap-3">
            {elements.map((el, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ scale: 1.06 }}
                animate={{ boxShadow: ["0 0 0 0 transparent", "0 0 15px -3px hsl(var(--primary) / 0.2)", "0 0 0 0 transparent"] }}
                transition={{ boxShadow: { repeat: Infinity, duration: 3, delay: i * 0.5 } }}
                className={`flex items-center gap-2 bg-gradient-to-r ${el.gradient} text-primary-foreground rounded-full px-5 py-3 shadow-md cursor-default`}
              >
                <el.icon className="w-5 h-5" />
                <span className="font-heading text-small font-semibold">{el.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════
   10. CONFIANÇA — dark premium with glass
   ═══════════════════════════════════════════ */
function TrustSection() {
  const points = [
    { icon: Users, text: "Contas infantis supervisionadas" },
    { icon: Eye, text: "Controlo parental completo" },
    { icon: Lock, text: "Dados protegidos" },
    { icon: ShieldCheck, text: "Ambiente educativo seguro" },
  ];
  return (
    <Section className="bg-foreground text-background overflow-hidden relative">
      <div className="absolute inset-0 gradient-mesh-dark" />
      <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <motion.h2 variants={fadeUp} className="font-display text-heading md:text-heading-lg mb-4">
            Criado para ser seguro
          </motion.h2>
          <motion.p variants={fadeUp} className="opacity-70 mb-8">
            KIVARA foi concebida com segurança e privacidade como prioridade.
          </motion.p>
          <div className="grid grid-cols-2 gap-4">
            {points.map((p, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ scale: 1.03 }}
                className="glass-dark rounded-2xl p-5 flex flex-col items-center text-center gap-3 transition-shadow hover:shadow-xl"
              >
                <motion.div
                  className="rounded-full p-3 ring-2 ring-background/10"
                  animate={{ boxShadow: ["0 0 0 0 transparent", "0 0 20px -4px hsla(0,0%,100%,0.15)", "0 0 0 0 transparent"] }}
                  transition={{ repeat: Infinity, duration: 3, delay: i * 0.4 }}
                >
                  <p.icon className="w-6 h-6" />
                </motion.div>
                <span className="font-heading text-small font-semibold">{p.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
        <motion.div variants={scaleIn} className="flex justify-center">
          <img src={trustSecurityImg} alt="Segurança KIVARA" className="w-full max-w-xs md:max-w-sm opacity-90" />
        </motion.div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════
   11. PROVA SOCIAL — animated counters
   ═══════════════════════════════════════════ */
function SocialProof() {
  const stats = [
    { value: 500, suffix: "+", label: "Crianças activas" },
    { value: 150, suffix: "+", label: "Famílias" },
    { value: 10, suffix: "+", label: "Escolas" },
    { value: 49, suffix: "", label: "Avaliação", display: "4.9★" },
  ];
  return (
    <Section className="bg-muted/30">
      <motion.div variants={fadeUp} className="text-center mb-10">
        <div className="flex items-center justify-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <Star className="w-6 h-6 text-accent fill-accent" />
            </motion.div>
          ))}
        </div>
        <p className="font-display text-heading md:text-heading-lg text-foreground">
          Mais de 500 crianças já começaram a sua jornada financeira com KIVARA.
        </p>
        <p className="text-muted-foreground mt-2 text-body">Famílias e escolas de vários países confiam em nós.</p>
      </motion.div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            whileHover={{ y: -4 }}
            className="glass rounded-2xl p-6 text-center transition-all hover:shadow-xl hover:shadow-primary/5"
          >
            <p className="font-display text-heading bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {s.display || <CountUp target={s.value} suffix={s.suffix} />}
            </p>
            <p className="text-caption text-muted-foreground mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════
   12. CTA FINAL — maximum impact
   ═══════════════════════════════════════════ */
function FinalCTA() {
  return (
    <Section className="relative overflow-hidden">
      <div className="absolute inset-0 gradient-mesh" />
      {/* Decorative sparkles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-accent/40"
          style={{ left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%` }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.4 }}
        />
      ))}
      <motion.div variants={fadeUp} className="text-center max-w-2xl mx-auto relative z-10">
        <motion.div
          variants={scaleIn}
          className="inline-flex items-center justify-center glass rounded-full p-4 mb-6 glow-accent"
        >
          <img src={kivoSvg} alt="Kivo" className="w-12 h-12" />
        </motion.div>
        <h2 className="font-display text-heading md:text-heading-lg font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent bg-[length:200%_auto]">
          Comece hoje a construir o futuro financeiro do seu filho
        </h2>
        <p className="text-muted-foreground text-body md:text-body-lg mb-8 max-w-lg mx-auto">
          Junte-se às famílias que estão a transformar a educação financeira dos seus filhos.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button size="lg" className="gradient-kivara text-primary-foreground shimmer glow-primary" asChild>
            <Link to="/login">
              Criar conta familiar <ChevronRight className="ml-1" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/login">Levar KIVARA para a escola</Link>
          </Button>
        </div>
      </motion.div>
    </Section>
  );
}

/* ═══════════════════════════════════════════
   13. FOOTER — premium dark
   ═══════════════════════════════════════════ */
function Footer() {
  return (
    <footer className="bg-foreground text-background px-5 py-12 relative overflow-hidden">
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
