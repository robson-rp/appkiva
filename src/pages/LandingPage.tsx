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
  Trophy, Flame, Medal, Gamepad2, Building2, TreePine,
  BookOpen, Swords, ShoppingBag, BarChart3, ListChecks,
  Heart, Lock, Eye, UserCheck, ChevronRight, Star, Zap, Menu, X,
  AlertTriangle, TrendingDown, Sprout, Check, Mail, Quote,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

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

/* ─── Section wrapper ─── */
function Section({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <motion.section
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={stagger}
      className={`px-5 sm:px-8 py-24 md:py-36 ${className}`}
    >
      <div className="mx-auto max-w-7xl">{children}</div>
    </motion.section>
  );
}

function SectionTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.h2
      variants={fadeUp}
      className={`font-display text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-5 text-balance leading-[1.1] ${className}`}
    >
      {children}
    </motion.h2>
  );
}

function SectionSubtitle({ children }: { children: React.ReactNode }) {
  return (
    <motion.p variants={fadeUp} className="text-muted-foreground text-lg md:text-xl text-center max-w-3xl mx-auto mb-16 text-balance">
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

/* ═══════════════════════════════════════════
   1. NAVBAR — clean, minimal
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
          ? "bg-background/90 backdrop-blur-lg border-b border-border/60"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl flex items-center justify-between px-5 sm:px-8 h-16">
        <Link to="/" className="flex items-center gap-2">
          <img src={kivaraLogo} alt="KIVARA" className="h-10 md:h-12" />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Entrar</Link>
          </Button>
          <Button size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/90" asChild>
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
          className="md:hidden bg-background border-b border-border px-5 pb-4 space-y-3"
        >
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="block text-base font-medium text-muted-foreground py-2">
              {link.label}
            </a>
          ))}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <Link to="/login">Entrar</Link>
            </Button>
            <Button size="sm" className="flex-1 bg-secondary text-secondary-foreground" asChild>
              <Link to="/login">Criar conta</Link>
            </Button>
          </div>
        </motion.div>
      )}
    </nav>
  );
}

/* ═══════════════════════════════════════════
   2. HERO — massive typography, clean layout
   ═══════════════════════════════════════════ */
function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const illustrationY = useTransform(scrollYProgress, [0, 1], [0, 60]);

  return (
    <motion.section
      ref={heroRef}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={stagger}
      className="px-5 sm:px-8 pt-28 md:pt-40 pb-16 md:pb-28"
    >
      <div className="mx-auto max-w-7xl grid md:grid-cols-2 gap-12 md:gap-20 items-center">
        <div>
          <motion.h1
            variants={fadeUp}
            className="font-display text-[2.75rem] sm:text-[3.5rem] md:text-[4.5rem] lg:text-[5.5rem] font-bold leading-[1.05] tracking-tight text-foreground"
          >
            Pequenos hábitos.
            <br />
            <GradientText>Grandes futuros.</GradientText>
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-8 text-lg md:text-xl text-muted-foreground max-w-xl">
            KIVARA transforma educação financeira num jogo interactivo onde crianças aprendem a ganhar,
            poupar e planear o futuro — enquanto os pais acompanham cada passo.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-10 flex flex-wrap gap-4">
            <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-base px-8" asChild>
              <Link to="/login">
                Criar conta familiar <ChevronRight className="ml-1" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8" asChild>
              <a href="#como-funciona">Explorar a plataforma</a>
            </Button>
          </motion.div>

          {/* Feature pills — clean, no glass */}
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
                className="flex items-center gap-1.5 bg-muted rounded-full px-3.5 py-2"
              >
                <pill.icon className={`w-4 h-4 ${pill.color}`} />
                <span className="text-sm font-medium text-muted-foreground">{pill.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Illustration — clean, no floating elements */}
        <motion.div variants={fadeUp} className="flex items-center justify-center" style={{ y: illustrationY }}>
          <img
            src={heroIllustration}
            alt="Crianças a aprender sobre dinheiro"
            className="w-full max-w-md md:max-w-xl"
          />
        </motion.div>
      </div>
    </motion.section>
  );
}

/* ═══════════════════════════════════════════
   3. PROBLEMA — clean cards, no decorative numbers
   ═══════════════════════════════════════════ */
function ProblemSection() {
  const points = [
    { icon: AlertTriangle, text: "Crescemos sem aprender a gerir dinheiro, definir metas ou planear o futuro financeiro.", color: "text-destructive", bg: "bg-destructive/10" },
    { icon: TrendingDown, text: "Sem orientação adequada, as decisões financeiras tornam-se difíceis na vida adulta.", color: "text-accent-foreground", bg: "bg-accent/10" },
    { icon: Sprout, text: "KIVARA nasceu para mudar isso — começando cedo, através do jogo e da prática.", color: "text-secondary", bg: "bg-secondary/10" },
  ];
  return (
    <Section className="bg-muted/40">
      <SectionTitle>A maioria das pessoas aprende sobre dinheiro tarde demais</SectionTitle>
      <SectionSubtitle>Poucas crianças recebem educação financeira. Queremos mudar isso.</SectionSubtitle>

      <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
        {points.map((p, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            whileHover={{ y: -4 }}
            className="bg-card rounded-2xl border border-border p-8 text-center transition-shadow hover:shadow-lg"
          >
            <div className={`${p.bg} rounded-2xl p-3 w-fit mx-auto mb-5`}>
              <p.icon className={`w-6 h-6 ${p.color}`} />
            </div>
            <p className="text-base text-muted-foreground leading-relaxed">{p.text}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════
   4. SOLUÇÃO — split screen, clean
   ═══════════════════════════════════════════ */
function SolutionSection() {
  const checks = [
    "Missões práticas para aprender a ganhar",
    "Metas de poupança com progresso visual",
    "Decisões financeiras num ambiente seguro",
    "Acompanhamento total pelos pais",
  ];
  return (
    <Section>
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <div>
          <motion.div variants={fadeUp} className="inline-block bg-secondary/10 text-secondary rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
            A solução
          </motion.div>
          <motion.h2 variants={fadeUp} className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-balance leading-[1.1]">
            Aprender finanças através da <GradientText>experiência</GradientText>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-muted-foreground mb-10 text-balance">
            Em vez de teoria, KIVARA ensina através da prática. Cada acção transforma-se numa lição que constrói hábitos financeiros positivos.
          </motion.p>
          <motion.div variants={stagger} className="space-y-4">
            {checks.map((text, i) => (
              <motion.div key={i} variants={fadeUp} className="flex items-center gap-3">
                <div className="bg-secondary/10 rounded-full p-1 shrink-0">
                  <Check className="w-4 h-4 text-secondary" />
                </div>
                <span className="text-base text-foreground font-medium">{text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
        <motion.div variants={fadeUp} className="flex justify-center">
          <img src={heroIllustration} alt="Crianças a aprender finanças" className="w-full max-w-md rounded-3xl" />
        </motion.div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════
   5. COMO FUNCIONA — clean steps
   ═══════════════════════════════════════════ */
function HowItWorks() {
  const steps = [
    { icon: Coins, title: "Ganhar", desc: "Completar missões e tarefas para ganhar moedas virtuais.", color: "bg-accent text-accent-foreground" },
    { icon: Target, title: "Poupar", desc: "Criar metas e aprender a guardar para o que realmente importa.", color: "bg-secondary text-secondary-foreground" },
    { icon: TrendingUp, title: "Evoluir", desc: "Desbloquear níveis, conquistas e novas aprendizagens financeiras.", color: "bg-primary text-primary-foreground" },
  ];
  return (
    <Section id="como-funciona" className="bg-muted/40">
      <SectionTitle>Como funciona</SectionTitle>
      <SectionSubtitle>Três passos simples para começar a jornada financeira.</SectionSubtitle>
      <div className="relative">
        {/* Connector line — desktop only */}
        <div className="hidden md:block absolute top-[4.5rem] left-[17%] right-[17%] h-[2px] bg-border z-0" />
        <motion.div variants={staggerFast} className="grid md:grid-cols-3 gap-8 relative z-10">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              className="bg-card rounded-2xl border border-border p-8 text-center flex flex-col items-center gap-5 transition-shadow hover:shadow-lg"
            >
              <div className="relative">
                <div className={`rounded-2xl p-5 ${s.color}`}>
                  <s.icon className="w-7 h-7" />
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
  );
}

/* ═══════════════════════════════════════════
   6. UNIVERSO — clean grid
   ═══════════════════════════════════════════ */
function UniverseSection() {
  const zones = [
    { icon: Building2, label: "Cidade do Dinheiro", desc: "Aprende a ganhar e gerir", bg: "bg-accent/10", color: "text-accent-foreground" },
    { icon: TreePine, label: "Vale da Poupança", desc: "Guarda e faz crescer", bg: "bg-secondary/10", color: "text-secondary" },
    { icon: BookOpen, label: "Academia Financeira", desc: "Lições interactivas", bg: "bg-primary/10", color: "text-primary" },
    { icon: Swords, label: "Arena dos Desafios", desc: "Compete e aprende", bg: "bg-destructive/10", color: "text-destructive" },
    { icon: ShoppingBag, label: "Mercado dos Sonhos", desc: "Realiza objectivos", bg: "bg-accent/10", color: "text-accent-foreground" },
  ];
  return (
    <Section id="universo">
      <SectionTitle>Um mundo onde aprender sobre dinheiro se torna uma aventura</SectionTitle>
      <SectionSubtitle>Cada zona representa um estágio da aprendizagem financeira.</SectionSubtitle>

      <motion.div variants={staggerFast} className="grid grid-cols-2 md:grid-cols-3 gap-5">
        {zones.map((z, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            whileHover={{ y: -4 }}
            className={`bg-card rounded-2xl border border-border p-6 text-center flex flex-col items-center gap-4 transition-shadow hover:shadow-lg ${
              i === zones.length - 1 && zones.length % 2 !== 0 ? "col-span-2 md:col-span-1 mx-auto max-w-[280px] md:max-w-none" : ""
            }`}
          >
            <div className={`${z.bg} rounded-2xl p-4`}>
              <z.icon className={`w-7 h-7 ${z.color}`} />
            </div>
            <span className="font-display text-base font-bold">{z.label}</span>
            <span className="text-sm text-muted-foreground">{z.desc}</span>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}

/* ═══════════════════════════════════════════
   7. BENEFÍCIOS PAIS — clean split
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
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <motion.div variants={fadeUp} className="flex justify-center order-2 md:order-1">
          <img src={parentsBenefit} alt="Pai e filho a usar KIVARA" className="w-full max-w-md" />
        </motion.div>
        <div className="order-1 md:order-2">
          <motion.div variants={fadeUp} className="inline-block bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
            Para famílias
          </motion.div>
          <motion.h2 variants={fadeUp} className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-balance leading-[1.1]">
            Uma ferramenta poderosa para <GradientText>famílias</GradientText>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-muted-foreground text-lg mb-10 text-balance">
            Com KIVARA os pais podem acompanhar, ensinar e motivar os filhos na jornada financeira.
          </motion.p>
          <motion.div variants={stagger} className="space-y-4">
            {items.map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ y: -2 }}
                className="flex items-center gap-4 bg-card rounded-2xl border border-border p-4 transition-shadow hover:shadow-md"
              >
                <div className={`${item.bg} rounded-xl p-2.5 shrink-0`}>
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
    <Section id="escolas" className="bg-muted/40">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <div>
          <motion.div variants={fadeUp} className="inline-block bg-accent/10 text-accent-foreground rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
            Para escolas
          </motion.div>
          <motion.h2 variants={fadeUp} className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-balance leading-[1.1]">
            Educação financeira para a <GradientText>nova geração</GradientText>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-muted-foreground text-lg mb-10 text-balance">
            Professores podem transformar a sala de aula num laboratório financeiro.
          </motion.p>
          <motion.div variants={stagger} className="space-y-4">
            {items.map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ y: -2 }}
                className="flex items-center gap-4 bg-card rounded-2xl border border-border p-4 transition-shadow hover:shadow-md"
              >
                <div className={`${item.bg} rounded-xl p-2.5 shrink-0`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <p className="text-base text-foreground font-medium flex-1">{item.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
        <motion.div variants={fadeUp} className="flex justify-center">
          <img src={schoolBenefit} alt="Professora com alunos" className="w-full max-w-md" />
        </motion.div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════
   9. GAMIFICAÇÃO — static clean chips
   ═══════════════════════════════════════════ */
function GamificationSection() {
  const elements = [
    { icon: Flame, label: "Missões diárias", bg: "bg-destructive/10", color: "text-destructive" },
    { icon: TrendingUp, label: "Níveis de progressão", bg: "bg-primary/10", color: "text-primary" },
    { icon: Trophy, label: "Ligas semanais", bg: "bg-accent/10", color: "text-accent-foreground" },
    { icon: Medal, label: "Medalhas e conquistas", bg: "bg-secondary/10", color: "text-secondary" },
    { icon: Gamepad2, label: "Avatares personalizados", bg: "bg-primary/10", color: "text-primary" },
  ];
  return (
    <Section>
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <motion.div variants={fadeUp} className="flex justify-center order-2 md:order-1">
          <img src={gamificationImg} alt="Elementos de gamificação" className="w-full max-w-md" />
        </motion.div>
        <div className="order-1 md:order-2">
          <motion.div variants={fadeUp} className="inline-block bg-accent/10 text-accent-foreground rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
            Gamificação
          </motion.div>
          <motion.h2 variants={fadeUp} className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-balance leading-[1.1]">
            Porque as crianças adoram aprender com <GradientText>KIVARA</GradientText>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-muted-foreground text-lg mb-10 text-balance">
            Aprender deixa de ser uma obrigação e torna-se uma experiência envolvente.
          </motion.p>
          <motion.div variants={staggerFast} className="flex flex-wrap gap-3">
            {elements.map((el, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ y: -2 }}
                className={`flex items-center gap-2.5 ${el.bg} rounded-full px-5 py-3 transition-shadow hover:shadow-md`}
              >
                <el.icon className={`w-5 h-5 ${el.color}`} />
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
   10. CONFIANÇA — clean dark block
   ═══════════════════════════════════════════ */
function TrustSection() {
  const points = [
    { icon: Users, text: "Contas infantis supervisionadas" },
    { icon: Eye, text: "Controlo parental completo" },
    { icon: Lock, text: "Dados protegidos e encriptados" },
    { icon: ShieldCheck, text: "Ambiente educativo seguro" },
  ];
  return (
    <Section className="!bg-foreground !text-background">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <div>
          <motion.div variants={fadeUp} className="inline-block bg-background/10 rounded-full px-4 py-1.5 text-sm font-semibold mb-6 text-background/80">
            Segurança
          </motion.div>
          <motion.h2 variants={fadeUp} className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-5 text-balance leading-[1.1]">
            Criado para ser seguro
          </motion.h2>
          <motion.p variants={fadeUp} className="opacity-60 mb-12 text-lg text-balance">
            KIVARA foi concebida com segurança e privacidade como prioridade máxima.
          </motion.p>
          <motion.div variants={staggerFast} className="grid grid-cols-2 gap-4">
            {points.map((p, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                className="bg-background/[0.06] rounded-2xl p-6 flex flex-col items-center text-center gap-3 transition-all border border-background/[0.08]"
              >
                <div className="rounded-full p-3 bg-background/10">
                  <p.icon className="w-6 h-6" />
                </div>
                <span className="font-display text-sm font-semibold">{p.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
        <motion.div variants={fadeUp} className="flex justify-center">
          <img src={trustSecurityImg} alt="Segurança KIVARA" className="w-full max-w-md opacity-90" />
        </motion.div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════
   11. PROVA SOCIAL — clean stats + testimonials
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
    <Section className="bg-muted/40">
      {/* Stars */}
      <motion.div variants={fadeUp} className="text-center mb-6">
        <div className="flex items-center justify-center gap-1 mb-5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-7 h-7 text-accent fill-accent" />
          ))}
        </div>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground text-balance mb-4 leading-[1.1]">
          Mais de 500 crianças já começaram a sua jornada
        </h2>
        <p className="text-muted-foreground text-lg">Famílias e escolas de vários países confiam em nós.</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={staggerFast} className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-20 mt-12">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            whileHover={{ y: -4 }}
            className="bg-card rounded-2xl border border-border p-6 text-center transition-shadow hover:shadow-lg"
          >
            <p className="font-display text-3xl md:text-4xl font-bold text-primary">
              {s.display || <CountUp target={s.value} suffix={s.suffix} />}
            </p>
            <p className="text-sm text-muted-foreground mt-2">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Testimonials */}
      <motion.div variants={staggerFast} className="grid md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            whileHover={{ y: -4 }}
            className="bg-card rounded-2xl border border-border p-6 relative transition-shadow hover:shadow-lg"
          >
            <Quote className="w-8 h-8 text-primary/10 absolute top-4 right-4" />
            <div className="flex gap-1 mb-4">
              {[...Array(t.rating)].map((_, j) => (
                <Star key={j} className="w-4 h-4 text-accent fill-accent" />
              ))}
            </div>
            <p className="text-base text-foreground mb-5 italic leading-relaxed">"{t.text}"</p>
            <div>
              <p className="text-sm font-bold text-foreground">{t.name}</p>
              <p className="text-sm text-muted-foreground">{t.role}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}

/* ═══════════════════════════════════════════
   12. CTA FINAL — bold secondary color block
   ═══════════════════════════════════════════ */
function FinalCTA() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={stagger}
      className="px-5 sm:px-8 py-24 md:py-36 bg-secondary"
    >
      <motion.div variants={fadeUp} className="text-center max-w-3xl mx-auto">
        <img src={kivoSvg} alt="Kivo" className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-8" />
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-secondary-foreground leading-[1.1]">
          Comece hoje a construir o futuro financeiro do seu filho
        </h2>
        <p className="text-secondary-foreground/70 text-lg md:text-xl mb-10 max-w-xl mx-auto text-balance">
          Junte-se às famílias que estão a transformar a educação financeira dos seus filhos.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button size="lg" className="bg-background text-foreground hover:bg-background/90 text-base px-8" asChild>
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
   13. FOOTER — clean
   ═══════════════════════════════════════════ */
function Footer() {
  return (
    <footer className="bg-foreground text-background px-5 sm:px-8 py-14">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <img src={kivaraLogoWhite} alt="KIVARA" className="h-11 md:h-14 opacity-90 mb-4" />
            <p className="text-sm opacity-60">Educação financeira gamificada para crianças e famílias.</p>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold mb-3 opacity-90">Plataforma</h4>
            <ul className="space-y-2">
              <li><a href="#como-funciona" className="text-sm opacity-60 hover:opacity-100 transition-opacity">Como funciona</a></li>
              <li><a href="#universo" className="text-sm opacity-60 hover:opacity-100 transition-opacity">Universo KIVARA</a></li>
              <li><a href="#familias" className="text-sm opacity-60 hover:opacity-100 transition-opacity">Para famílias</a></li>
              <li><a href="#escolas" className="text-sm opacity-60 hover:opacity-100 transition-opacity">Para escolas</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold mb-3 opacity-90">Conta</h4>
            <ul className="space-y-2">
              <li><Link to="/login" className="text-sm opacity-60 hover:opacity-100 transition-opacity">Entrar</Link></li>
              <li><Link to="/login" className="text-sm opacity-60 hover:opacity-100 transition-opacity">Criar conta</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold mb-3 opacity-90">Newsletter</h4>
            <p className="text-sm opacity-60 mb-3">Receba dicas de educação financeira.</p>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center bg-background/10 rounded-xl px-3 gap-2">
                <Mail className="w-4 h-4 opacity-40" />
                <input type="email" placeholder="email@exemplo.com" className="bg-transparent text-sm py-2.5 w-full outline-none placeholder:opacity-40" />
              </div>
              <button className="bg-secondary text-secondary-foreground rounded-xl px-3.5 text-sm font-semibold hover:bg-secondary/90 transition-colors">
                →
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-background/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
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
