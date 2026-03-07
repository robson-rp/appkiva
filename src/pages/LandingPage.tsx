import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import kivaraLogo from "@/assets/logo-kivara.svg";
import kivaraLogoWhite from "@/assets/logo-kivara-white.svg";
import kivoSvg from "@/assets/kivo.svg";
import {
  Coins, Target, TrendingUp, ShieldCheck, Users, GraduationCap,
  Trophy, Flame, Medal, Gamepad2, Sparkles, Building2, TreePine,
  BookOpen, Swords, ShoppingBag, BarChart3, ListChecks, Gift,
  Heart, Lock, Eye, UserCheck, ChevronRight, Star, Zap,
} from "lucide-react";

/* ─── animation helpers ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};
const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
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
  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-5 h-16">
        <Link to="/" className="flex items-center gap-2">
          <img src={kivaraLogo} alt="KIVARA" className="h-8" />
        </Link>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Entrar</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/login">Criar conta</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}

/* ─── 2. HERO ─── */
function Hero() {
  return (
    <Section className="pt-28 md:pt-36 bg-gradient-to-b from-kivara-light-blue to-background">
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div>
          <motion.h1
            variants={fadeUp}
            className="font-display text-3xl md:text-5xl font-bold leading-tight text-foreground"
          >
            Ensinar crianças a{" "}
            <span className="text-primary">dominar o dinheiro</span> desde cedo
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
        </div>

        {/* Visual — ícones animados + Kivo */}
        <motion.div
          variants={fadeUp}
          className="relative flex items-center justify-center min-h-[280px] md:min-h-[360px]"
        >
          <motion.img
            src={kivoSvg}
            alt="Kivo mascote"
            className="w-40 md:w-56 drop-shadow-lg"
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          />
          {/* floating icons */}
          <motion.div
            className="absolute top-4 right-8 bg-kivara-light-gold rounded-full p-3 shadow-lg"
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 0.3 }}
          >
            <Coins className="text-accent w-6 h-6" />
          </motion.div>
          <motion.div
            className="absolute bottom-8 left-8 bg-kivara-light-green rounded-full p-3 shadow-lg"
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut", delay: 0.6 }}
          >
            <Target className="text-secondary w-6 h-6" />
          </motion.div>
          <motion.div
            className="absolute top-12 left-4 bg-kivara-light-blue rounded-full p-3 shadow-lg"
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut", delay: 0.9 }}
          >
            <Trophy className="text-primary w-6 h-6" />
          </motion.div>
        </motion.div>
      </div>
    </Section>
  );
}

/* ─── 3. PROBLEMA ─── */
function ProblemSection() {
  const points = [
    "Crescemos sem aprender a gerir dinheiro, definir metas ou planear o futuro financeiro.",
    "Sem orientação adequada, as decisões financeiras tornam-se difíceis na vida adulta.",
    "KIVARA nasceu para mudar isso — começando cedo.",
  ];
  return (
    <Section className="bg-muted/40">
      <SectionTitle>A maioria das pessoas aprende sobre dinheiro tarde demais</SectionTitle>
      <div className="max-w-2xl mx-auto space-y-4">
        {points.map((p, i) => (
          <motion.p key={i} variants={fadeUp} className="text-body text-muted-foreground flex items-start gap-3">
            <Zap className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            {p}
          </motion.p>
        ))}
      </div>
    </Section>
  );
}

/* ─── 4. SOLUÇÃO ─── */
function SolutionSection() {
  return (
    <Section>
      <SectionTitle>Aprender finanças através da experiência</SectionTitle>
      <motion.div variants={fadeUp} className="max-w-2xl mx-auto text-body md:text-body-lg text-muted-foreground space-y-4 text-center">
        <p>Em vez de teoria, KIVARA ensina através da prática.</p>
        <p>
          As crianças completam missões, definem metas e aprendem a tomar decisões financeiras
          num ambiente seguro e supervisionado.
        </p>
        <p className="font-semibold text-foreground">
          Cada acção transforma-se numa lição que constrói hábitos financeiros positivos.
        </p>
      </motion.div>
    </Section>
  );
}

/* ─── 5. COMO FUNCIONA ─── */
function HowItWorks() {
  const steps = [
    { icon: Coins, color: "bg-kivara-light-gold text-accent", title: "Ganhar", desc: "Completar missões e tarefas para ganhar moedas." },
    { icon: Target, color: "bg-kivara-light-green text-secondary", title: "Poupar", desc: "Criar metas e aprender a guardar." },
    { icon: TrendingUp, color: "bg-kivara-light-blue text-primary", title: "Evoluir", desc: "Desbloquear níveis, conquistas e novas aprendizagens." },
  ];
  return (
    <Section id="como-funciona">
      <SectionTitle>Como funciona</SectionTitle>
      <SectionSubtitle>Três passos simples para começar a jornada financeira.</SectionSubtitle>
      <div className="grid md:grid-cols-3 gap-6">
        {steps.map((s, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            className="bg-card rounded-2xl shadow-sm border border-border p-8 text-center flex flex-col items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className={`rounded-full p-4 ${s.color}`}>
              <s.icon className="w-8 h-8" />
            </div>
            <span className="text-sm font-semibold text-muted-foreground tracking-wider uppercase">Passo {i + 1}</span>
            <h3 className="font-display text-section font-bold">{s.title}</h3>
            <p className="text-body text-muted-foreground">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/* ─── 6. UNIVERSO KIVARA ─── */
function UniverseSection() {
  const zones = [
    { icon: Building2, label: "Cidade do Dinheiro", color: "bg-kivara-light-gold border-accent/30" },
    { icon: TreePine, label: "Vale da Poupança", color: "bg-kivara-light-green border-secondary/30" },
    { icon: BookOpen, label: "Academia Financeira", color: "bg-kivara-light-blue border-primary/30" },
    { icon: Swords, label: "Arena dos Desafios", color: "bg-kivara-pink border-destructive/20" },
    { icon: ShoppingBag, label: "Mercado dos Sonhos", color: "bg-kivara-purple border-primary/20" },
  ];
  return (
    <Section className="bg-muted/40">
      <SectionTitle>Um mundo onde aprender sobre dinheiro se torna uma aventura</SectionTitle>
      <SectionSubtitle>Cada zona representa um estágio da aprendizagem financeira.</SectionSubtitle>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {zones.map((z, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            className={`rounded-2xl border p-5 text-center flex flex-col items-center gap-3 ${z.color}`}
          >
            <z.icon className="w-8 h-8 text-foreground/80" />
            <span className="font-heading text-small font-semibold">{z.label}</span>
          </motion.div>
        ))}
      </div>
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
    <Section>
      <SectionTitle>Uma ferramenta poderosa para famílias</SectionTitle>
      <SectionSubtitle>Com KIVARA os pais podem acompanhar, ensinar e motivar.</SectionSubtitle>
      <div className="grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
        {items.map((item, i) => (
          <motion.div key={i} variants={fadeUp} className="flex items-start gap-4 bg-card rounded-2xl border border-border p-5">
            <div className="bg-kivara-light-blue rounded-xl p-3 shrink-0">
              <item.icon className="w-6 h-6 text-primary" />
            </div>
            <p className="text-body text-foreground font-medium">{item.text}</p>
          </motion.div>
        ))}
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
    <Section className="bg-muted/40">
      <SectionTitle>Educação financeira para a nova geração</SectionTitle>
      <SectionSubtitle>Professores podem transformar a sala de aula num laboratório financeiro.</SectionSubtitle>
      <div className="grid sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
        {items.map((item, i) => (
          <motion.div key={i} variants={fadeUp} className="flex flex-col items-center text-center gap-4 bg-card rounded-2xl border border-border p-6">
            <div className="bg-kivara-light-green rounded-xl p-3">
              <item.icon className="w-6 h-6 text-secondary" />
            </div>
            <p className="text-body text-foreground font-medium">{item.text}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/* ─── 9. GAMIFICAÇÃO ─── */
function GamificationSection() {
  const elements = [
    { icon: Flame, label: "Missões diárias" },
    { icon: TrendingUp, label: "Níveis de progressão" },
    { icon: Trophy, label: "Ligas semanais" },
    { icon: Medal, label: "Medalhas e conquistas" },
    { icon: Gamepad2, label: "Avatares personalizados" },
  ];
  return (
    <Section>
      <SectionTitle>Porque as crianças adoram aprender com KIVARA</SectionTitle>
      <SectionSubtitle>
        Aprender deixa de ser uma obrigação e torna-se uma experiência envolvente.
      </SectionSubtitle>
      <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
        {elements.map((el, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            className="flex items-center gap-2 bg-card border border-border rounded-full px-5 py-3 shadow-sm"
          >
            <el.icon className="w-5 h-5 text-accent" />
            <span className="font-heading text-small font-semibold">{el.label}</span>
          </motion.div>
        ))}
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
    <Section className="bg-primary text-primary-foreground">
      <SectionTitle className="text-primary-foreground">Criado para ser seguro</SectionTitle>
      <motion.p variants={fadeUp} className="text-center opacity-80 mb-10 max-w-xl mx-auto">
        KIVARA foi concebida com segurança e privacidade como prioridade.
      </motion.p>
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5 max-w-4xl mx-auto">
        {points.map((p, i) => (
          <motion.div key={i} variants={fadeUp} className="flex flex-col items-center text-center gap-3">
            <div className="bg-primary-foreground/15 rounded-full p-4">
              <p.icon className="w-7 h-7" />
            </div>
            <span className="font-heading text-small font-semibold">{p.text}</span>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/* ─── 11. PROVA SOCIAL ─── */
function SocialProof() {
  return (
    <Section>
      <motion.div variants={fadeUp} className="text-center">
        <div className="flex items-center justify-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-6 h-6 text-accent fill-accent" />
          ))}
        </div>
        <p className="font-display text-section md:text-section-lg text-foreground font-bold">
          Mais de 500 crianças já começaram a sua jornada financeira com KIVARA.
        </p>
        <p className="text-muted-foreground mt-2 text-body">Famílias e escolas de vários países confiam em nós.</p>
      </motion.div>
    </Section>
  );
}

/* ─── 12. CTA FINAL ─── */
function FinalCTA() {
  return (
    <Section className="bg-gradient-to-br from-kivara-light-blue via-background to-kivara-light-green">
      <motion.div variants={fadeUp} className="text-center">
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
      <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6">
        <img src={kivaraLogoWhite} alt="KIVARA" className="h-7 opacity-80" />
        <p className="text-caption opacity-60">© {new Date().getFullYear()} KIVARA. Todos os direitos reservados.</p>
        <div className="flex gap-5">
          <Link to="/login" className="text-small opacity-70 hover:opacity-100 transition-opacity">Entrar</Link>
          <a href="#como-funciona" className="text-small opacity-70 hover:opacity-100 transition-opacity">Como funciona</a>
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
