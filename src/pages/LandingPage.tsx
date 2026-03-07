import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import kivaraLogo from "@/assets/logo-kivara.svg";
import kivaraLogoWhite from "@/assets/logo-kivara-white.svg";
import kivoSvg from "@/assets/kivo.svg";
import heroIllustration from "@/assets/landing/hero-illustration.png";
import universeMap from "@/assets/landing/universe-map.png";
import parentsBenefit from "@/assets/landing/parents-benefit.png";
import schoolBenefit from "@/assets/landing/school-benefit.png";
import gamificationImg from "@/assets/landing/gamification.png";
import trustSecurityImg from "@/assets/landing/trust-security.png";
import {
  Coins, Target, TrendingUp, ShieldCheck, Users,
  Trophy, Flame, Medal, Gamepad2, Sparkles, Building2, TreePine,
  BookOpen, Swords, ShoppingBag, BarChart3, ListChecks,
  Heart, Lock, Eye, UserCheck, ChevronRight, Star, Zap, Menu, X,
} from "lucide-react";
import { useState } from "react";

/* ─── animation helpers ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: "easeOut" as const } },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" as const } },
};
const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};
const staggerFast = {
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ─── reusable section wrapper ─── */
function Section({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
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
    <motion.h2
      variants={fadeUp}
      className={`font-display text-heading md:text-heading-lg text-center mb-4 ${className}`}
    >
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

/* ─── 1. NAVBAR ─── */
function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navLinks = [
    { label: "Como funciona", href: "#como-funciona" },
    { label: "Universo", href: "#universo" },
    { label: "Famílias", href: "#familias" },
    { label: "Escolas", href: "#escolas" },
  ];

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-5 h-16">
        <Link to="/" className="flex items-center gap-2">
          <img src={kivaraLogo} alt="KIVARA" className="h-8" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-small font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Entrar</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/login">Criar conta</Link>
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-background border-b border-border px-5 pb-4 space-y-3"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block text-body font-medium text-muted-foreground py-2"
            >
              {link.label}
            </a>
          ))}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <Link to="/login">Entrar</Link>
            </Button>
            <Button size="sm" className="flex-1" asChild>
              <Link to="/login">Criar conta</Link>
            </Button>
          </div>
        </motion.div>
      )}
    </nav>
  );
}

/* ─── 2. HERO ─── */
function Hero() {
  return (
    <Section className="pt-28 md:pt-36 pb-8 md:pb-16 bg-gradient-to-b from-kivara-light-blue via-kivara-light-blue/40 to-background overflow-hidden">
      <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
        <div>
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-caption font-semibold text-primary">Educação financeira gamificada</span>
          </motion.div>
          <motion.h1
            variants={fadeUp}
            className="font-display text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-foreground"
          >
            Ensinar crianças a{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              dominar o dinheiro
            </span>{" "}
            desde cedo
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-5 text-body md:text-body-lg text-muted-foreground max-w-lg">
            KIVARA transforma educação financeira num jogo interactivo onde crianças aprendem a ganhar,
            poupar e planear o futuro — enquanto os pais acompanham cada passo.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link to="/login">
                Criar conta familiar <ChevronRight className="ml-1" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#como-funciona">Explorar a plataforma</a>
            </Button>
          </motion.div>
          {/* trust badges */}
          <motion.div variants={fadeUp} className="mt-8 flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-secondary" />
              <span className="text-caption">100% seguro</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-caption">+500 famílias</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-accent fill-accent" />
              <span className="text-caption">Gratuito</span>
            </div>
          </motion.div>
        </div>

        {/* Visual — illustration + floating elements */}
        <motion.div
          variants={scaleIn}
          className="relative flex items-center justify-center"
        >
          <img
            src={heroIllustration}
            alt="Crianças a aprender sobre dinheiro"
            className="w-full max-w-md md:max-w-lg drop-shadow-xl"
          />
          {/* Kivo floating */}
          <motion.img
            src={kivoSvg}
            alt="Kivo"
            className="absolute -top-2 -right-2 md:top-0 md:right-0 w-16 md:w-20 drop-shadow-lg"
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          />
          {/* floating icons */}
          <motion.div
            className="absolute top-8 left-0 md:left-4 bg-kivara-light-gold rounded-2xl p-3 shadow-lg"
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 0.3 }}
          >
            <Coins className="text-accent w-5 h-5" />
          </motion.div>
          <motion.div
            className="absolute bottom-4 right-4 bg-kivara-light-green rounded-2xl p-3 shadow-lg"
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut", delay: 0.6 }}
          >
            <Target className="text-secondary w-5 h-5" />
          </motion.div>
          <motion.div
            className="absolute bottom-16 left-2 bg-kivara-light-blue rounded-2xl p-3 shadow-lg"
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

/* ─── 3. PROBLEMA ─── */
function ProblemSection() {
  const points = [
    { text: "Crescemos sem aprender a gerir dinheiro, definir metas ou planear o futuro financeiro.", icon: "💸" },
    { text: "Sem orientação adequada, as decisões financeiras tornam-se difíceis na vida adulta.", icon: "📉" },
    { text: "KIVARA nasceu para mudar isso — começando cedo.", icon: "🌱" },
  ];
  return (
    <Section className="bg-muted/40">
      <SectionTitle>A maioria das pessoas aprende sobre dinheiro tarde demais</SectionTitle>
      <div className="max-w-2xl mx-auto space-y-5 mt-8">
        {points.map((p, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            className="flex items-start gap-4 bg-card rounded-2xl border border-border p-5"
          >
            <span className="text-2xl shrink-0">{p.icon}</span>
            <p className="text-body text-muted-foreground">{p.text}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/* ─── 4. SOLUÇÃO ─── */
function SolutionSection() {
  return (
    <Section>
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div>
          <SectionTitle className="text-left md:text-left">Aprender finanças através da experiência</SectionTitle>
          <motion.div variants={fadeUp} className="text-body md:text-body-lg text-muted-foreground space-y-4">
            <p>Em vez de teoria, KIVARA ensina através da prática.</p>
            <p>
              As crianças completam missões, definem metas e aprendem a tomar decisões financeiras
              num ambiente seguro e supervisionado.
            </p>
            <p className="font-semibold text-foreground flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent shrink-0" />
              Cada acção transforma-se numa lição que constrói hábitos financeiros positivos.
            </p>
          </motion.div>
        </div>
        <motion.div variants={scaleIn} className="flex justify-center">
          <img
            src={heroIllustration}
            alt="Crianças a aprender finanças"
            className="w-full max-w-xs md:max-w-sm rounded-3xl"
          />
        </motion.div>
      </div>
    </Section>
  );
}

/* ─── 5. COMO FUNCIONA ─── */
function HowItWorks() {
  const steps = [
    { icon: Coins, color: "bg-kivara-light-gold text-accent", borderColor: "border-accent/20", title: "Ganhar", desc: "Completar missões e tarefas para ganhar moedas." },
    { icon: Target, color: "bg-kivara-light-green text-secondary", borderColor: "border-secondary/20", title: "Poupar", desc: "Criar metas e aprender a guardar." },
    { icon: TrendingUp, color: "bg-kivara-light-blue text-primary", borderColor: "border-primary/20", title: "Evoluir", desc: "Desbloquear níveis, conquistas e novas aprendizagens." },
  ];
  return (
    <Section id="como-funciona" className="bg-muted/40">
      <SectionTitle>Como funciona</SectionTitle>
      <SectionSubtitle>Três passos simples para começar a jornada financeira.</SectionSubtitle>
      <div className="grid md:grid-cols-3 gap-6">
        {steps.map((s, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            whileHover={{ y: -4 }}
            className={`bg-card rounded-2xl shadow-sm border ${s.borderColor} p-8 text-center flex flex-col items-center gap-4 transition-shadow hover:shadow-md`}
          >
            <div className="relative">
              <div className={`rounded-2xl p-5 ${s.color}`}>
                <s.icon className="w-8 h-8" />
              </div>
              <span className="absolute -top-2 -right-2 bg-foreground text-background text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {i + 1}
              </span>
            </div>
            <h3 className="font-display text-section font-bold">{s.title}</h3>
            <p className="text-body text-muted-foreground">{s.desc}</p>
          </motion.div>
        ))}
      </div>
      {/* Connector line (desktop only) */}
      <div className="hidden md:flex justify-center mt-8">
        <motion.div variants={fadeIn} className="flex items-center gap-2 text-muted-foreground">
          <span className="text-caption font-medium">Ganhar</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-caption font-medium">Poupar</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-caption font-medium">Evoluir</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-caption font-semibold text-primary">🎉 Sucesso!</span>
        </motion.div>
      </div>
    </Section>
  );
}

/* ─── 6. UNIVERSO KIVARA ─── */
function UniverseSection() {
  const zones = [
    { icon: Building2, label: "Cidade do Dinheiro", desc: "Aprende a ganhar e gerir", color: "bg-kivara-light-gold border-accent/30" },
    { icon: TreePine, label: "Vale da Poupança", desc: "Guarda e faz crescer", color: "bg-kivara-light-green border-secondary/30" },
    { icon: BookOpen, label: "Academia Financeira", desc: "Lições interactivas", color: "bg-kivara-light-blue border-primary/30" },
    { icon: Swords, label: "Arena dos Desafios", desc: "Compete e aprende", color: "bg-kivara-pink border-destructive/20" },
    { icon: ShoppingBag, label: "Mercado dos Sonhos", desc: "Realiza objectivos", color: "bg-kivara-purple border-primary/20" },
  ];
  return (
    <Section id="universo">
      <SectionTitle>Um mundo onde aprender sobre dinheiro se torna uma aventura</SectionTitle>
      <SectionSubtitle>Cada zona representa um estágio da aprendizagem financeira.</SectionSubtitle>

      {/* Map illustration */}
      <motion.div variants={scaleIn} className="mb-10 flex justify-center">
        <img
          src={universeMap}
          alt="Mapa do Universo KIVARA"
          className="w-full max-w-2xl rounded-3xl"
        />
      </motion.div>

      <motion.div variants={staggerFast} className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {zones.map((z, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            whileHover={{ scale: 1.04 }}
            className={`rounded-2xl border p-5 text-center flex flex-col items-center gap-2 cursor-default transition-shadow hover:shadow-md ${z.color}`}
          >
            <z.icon className="w-7 h-7 text-foreground/80" />
            <span className="font-heading text-small font-bold">{z.label}</span>
            <span className="text-caption text-muted-foreground">{z.desc}</span>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}

/* ─── 7. BENEFÍCIOS PAIS ─── */
function ParentBenefits() {
  const items = [
    { icon: BarChart3, text: "Acompanhar o progresso financeiro dos filhos" },
    { icon: Heart, text: "Incentivar hábitos saudáveis de poupança" },
    { icon: ListChecks, text: "Criar tarefas e recompensas" },
    { icon: UserCheck, text: "Ensinar responsabilidade financeira" },
  ];
  return (
    <Section id="familias">
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <motion.div variants={scaleIn} className="flex justify-center order-2 md:order-1">
          <img
            src={parentsBenefit}
            alt="Pai e filho a usar KIVARA"
            className="w-full max-w-xs md:max-w-sm"
          />
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
                className="flex items-center gap-4 bg-card rounded-2xl border border-border p-4 hover:shadow-sm transition-shadow"
              >
                <div className="bg-kivara-light-blue rounded-xl p-2.5 shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-body text-foreground font-medium">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ─── 8. BENEFÍCIOS ESCOLAS ─── */
function SchoolBenefits() {
  const items = [
    { icon: Sparkles, text: "Integrar desafios financeiros nas aulas" },
    { icon: BarChart3, text: "Acompanhar a evolução dos estudantes" },
    { icon: Trophy, text: "Incentivar competição saudável entre turmas" },
  ];
  return (
    <Section id="escolas" className="bg-muted/40">
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
                className="flex items-center gap-4 bg-card rounded-2xl border border-border p-4 hover:shadow-sm transition-shadow"
              >
                <div className="bg-kivara-light-green rounded-xl p-2.5 shrink-0">
                  <item.icon className="w-5 h-5 text-secondary" />
                </div>
                <p className="text-body text-foreground font-medium">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
        <motion.div variants={scaleIn} className="flex justify-center">
          <img
            src={schoolBenefit}
            alt="Professora com alunos"
            className="w-full max-w-xs md:max-w-sm"
          />
        </motion.div>
      </div>
    </Section>
  );
}

/* ─── 9. GAMIFICAÇÃO ─── */
function GamificationSection() {
  const elements = [
    { icon: Flame, label: "Missões diárias", color: "text-destructive" },
    { icon: TrendingUp, label: "Níveis de progressão", color: "text-primary" },
    { icon: Trophy, label: "Ligas semanais", color: "text-accent" },
    { icon: Medal, label: "Medalhas e conquistas", color: "text-secondary" },
    { icon: Gamepad2, label: "Avatares personalizados", color: "text-primary" },
  ];
  return (
    <Section>
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <motion.div variants={scaleIn} className="flex justify-center order-2 md:order-1">
          <img
            src={gamificationImg}
            alt="Elementos de gamificação"
            className="w-full max-w-xs md:max-w-sm"
          />
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
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2.5 shadow-sm cursor-default"
              >
                <el.icon className={`w-5 h-5 ${el.color}`} />
                <span className="font-heading text-small font-semibold">{el.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ─── 10. CONFIANÇA ─── */
function TrustSection() {
  const points = [
    { icon: Users, text: "Contas infantis supervisionadas" },
    { icon: Eye, text: "Controlo parental completo" },
    { icon: Lock, text: "Dados protegidos" },
    { icon: ShieldCheck, text: "Ambiente educativo seguro" },
  ];
  return (
    <Section className="bg-primary text-primary-foreground overflow-hidden">
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div>
          <motion.h2
            variants={fadeUp}
            className="font-display text-heading md:text-heading-lg mb-4 text-primary-foreground"
          >
            Criado para ser seguro
          </motion.h2>
          <motion.p variants={fadeUp} className="opacity-80 mb-8">
            KIVARA foi concebida com segurança e privacidade como prioridade.
          </motion.p>
          <div className="grid grid-cols-2 gap-4">
            {points.map((p, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="flex flex-col items-center text-center gap-3 bg-primary-foreground/10 rounded-2xl p-5"
              >
                <div className="bg-primary-foreground/15 rounded-full p-3">
                  <p.icon className="w-6 h-6" />
                </div>
                <span className="font-heading text-small font-semibold">{p.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
        <motion.div variants={scaleIn} className="flex justify-center">
          <img
            src={trustSecurityImg}
            alt="Segurança KIVARA"
            className="w-full max-w-xs md:max-w-sm opacity-90"
          />
        </motion.div>
      </div>
    </Section>
  );
}

/* ─── 11. PROVA SOCIAL ─── */
function SocialProof() {
  const stats = [
    { value: "500+", label: "Crianças activas" },
    { value: "150+", label: "Famílias" },
    { value: "10+", label: "Escolas" },
    { value: "4.9★", label: "Avaliação" },
  ];
  return (
    <Section className="bg-muted/40">
      <motion.div variants={fadeUp} className="text-center mb-10">
        <div className="flex items-center justify-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-6 h-6 text-accent fill-accent" />
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
            className="bg-card rounded-2xl border border-border p-5 text-center"
          >
            <p className="font-display text-heading text-primary">{s.value}</p>
            <p className="text-caption text-muted-foreground mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/* ─── 12. CTA FINAL ─── */
function FinalCTA() {
  return (
    <Section className="bg-gradient-to-br from-kivara-light-blue via-background to-kivara-light-green">
      <motion.div variants={fadeUp} className="text-center max-w-2xl mx-auto">
        <motion.div
          variants={scaleIn}
          className="inline-flex items-center justify-center bg-primary/10 rounded-full p-4 mb-6"
        >
          <img src={kivoSvg} alt="Kivo" className="w-12 h-12" />
        </motion.div>
        <h2 className="font-display text-heading md:text-heading-lg font-bold mb-4">
          Comece hoje a construir o futuro financeiro do seu filho
        </h2>
        <p className="text-muted-foreground text-body md:text-body-lg mb-8 max-w-lg mx-auto">
          Junte-se às famílias que estão a transformar a educação financeira dos seus filhos.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button size="lg" asChild>
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

/* ─── 13. FOOTER ─── */
function Footer() {
  return (
    <footer className="bg-foreground text-background px-5 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <img src={kivaraLogoWhite} alt="KIVARA" className="h-7 opacity-80 mb-4" />
            <p className="text-caption opacity-60">
              Educação financeira gamificada para crianças e famílias.
            </p>
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
            <h4 className="font-heading text-small font-semibold mb-3 opacity-90">Legal</h4>
            <ul className="space-y-2">
              <li><span className="text-caption opacity-60">Termos de serviço</span></li>
              <li><span className="text-caption opacity-60">Política de privacidade</span></li>
            </ul>
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

/* ─── PAGE ─── */
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
