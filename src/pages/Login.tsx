import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Shield, Sparkles, ArrowLeft, GraduationCap, Zap, Loader2, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import kivaraLogo from '@/assets/logo-kivara.svg';
import kivoImg from '@/assets/kivo.svg';
import { COUNTRY_CURRENCIES } from '@/data/countries-currencies';

type AuthMode = 'login' | 'signup';

const ROLE_CONFIG: Record<UserRole, { label: string; description: string; icon: React.ElementType; colorClass: string; bgClass: string }> = {
  parent: { label: 'Encarregado', description: 'Gerir tarefas, mesadas e acompanhar o progresso', icon: Shield, colorClass: 'text-primary', bgClass: 'bg-primary/10 group-hover:bg-primary/20 hover:border-primary' },
  teen: { label: 'Adolescente', description: 'Carteira avançada, categorias e orçamento', icon: Zap, colorClass: 'text-chart-3', bgClass: 'bg-chart-3/10 group-hover:bg-chart-3/20 hover:border-chart-3' },
  child: { label: 'Criança', description: 'Missões, poupanças e ganhar moedas', icon: Sparkles, colorClass: 'text-secondary', bgClass: 'bg-secondary/10 group-hover:bg-secondary/20 hover:border-secondary' },
  teacher: { label: 'Professor', description: 'Gerir turmas e desafios colectivos', icon: GraduationCap, colorClass: 'text-accent-foreground', bgClass: 'bg-accent/10 group-hover:bg-accent/20 hover:border-accent' },
  partner: { label: 'Parceiro', description: 'Gestão do programa de parceria institucional', icon: Building2, colorClass: 'text-chart-4', bgClass: 'bg-chart-4/10 group-hover:bg-chart-4/20 hover:border-chart-4' },
  admin: { label: 'Administrador', description: 'Gestão global da plataforma', icon: Shield, colorClass: 'text-destructive', bgClass: 'bg-destructive/10 group-hover:bg-destructive/20 hover:border-destructive' },
};

const ROLE_ORDER: UserRole[] = ['parent', 'teen', 'child', 'teacher', 'partner', 'admin'];

export default function Login() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [country, setCountry] = useState('AO');
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    setSubmitting(true);

    try {
      if (authMode === 'signup') {
        const { error } = await signup(email, password, selectedRole, displayName || email);
        if (error) {
          toast({ title: 'Erro ao criar conta', description: error, variant: 'destructive' });
          setSubmitting(false);
          return;
        }
        toast({ title: 'Conta criada!', description: 'Verifica o teu email para confirmar a conta.' });
      } else {
        const { error } = await login(email, password);
        if (error) {
          toast({ title: 'Erro ao entrar', description: error, variant: 'destructive' });
          setSubmitting(false);
          return;
        }
      }

      const dest = selectedRole === 'parent' ? '/parent' : selectedRole === 'teacher' ? '/teacher' : selectedRole === 'teen' ? '/teen' : selectedRole === 'admin' ? '/admin' : selectedRole === 'partner' ? '/partner' : '/child';
      navigate(dest);
    } catch {
      toast({ title: 'Erro inesperado', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedRole(null);
    setEmail('');
    setPassword('');
    setDisplayName('');
    setAuthMode('login');
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Hero Panel */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-8 lg:p-16 gradient-kivara overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[60%] h-[60%] rounded-full bg-white/5 blur-3xl" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative z-10 flex flex-col items-center text-center"
        >
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="mb-6"
          >
            <img src={kivoImg} alt="Kivo" className="w-32 h-32 lg:w-44 lg:h-44 drop-shadow-2xl" />
          </motion.div>

          <img src={kivaraLogo} alt="KIVARA" className="h-14 lg:h-20 mb-4 brightness-0 invert drop-shadow-lg" />

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-white/90 font-body text-lg lg:text-xl font-medium tracking-wide"
          >
            Pequenos hábitos. Grandes futuros.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-10 hidden lg:flex flex-col gap-3 text-white/70 text-sm"
          >
            {[
              'Carteira virtual para crianças',
              'Missões de educação financeira',
              'Cofres de poupança com metas',
              'Supervisão parental completa',
              'Modo escolar para professores',
            ].map((feat, i) => (
              <motion.div
                key={feat}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="flex items-center gap-2"
              >
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                <span>{feat}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <AnimatePresence mode="wait">
            {!selectedRole ? (
              <motion.div
                key="role-select"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="font-display text-3xl font-bold text-foreground mb-2">
                    Bem-vindo! 👋
                  </h2>
                  <p className="text-muted-foreground font-body">
                    Seleciona o teu perfil para continuar
                  </p>
                </div>

                <div className="space-y-4">
                  {ROLE_ORDER.map(role => {
                    const cfg = ROLE_CONFIG[role];
                    const Icon = cfg.icon;
                    return (
                      <motion.button
                        key={role}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          const testEmails: Record<UserRole, string> = {
                            parent: 'encarregado@kivara.com',
                            child: 'crianca@kivara.com',
                            teen: 'adolescente@kivara.com',
                            teacher: 'professor@kivara.com',
                            partner: 'parceiro@kivara.com',
                            admin: 'admin@kivara.com',
                          };
                          setSelectedRole(role);
                          setEmail(testEmails[role]);
                          setPassword('Test1234!');
                          setAuthMode('login');
                        }}
                        className={`w-full p-6 rounded-2xl border-2 border-border bg-card hover:shadow-md transition-all text-left flex items-center gap-5 group ${cfg.bgClass.split(' ').pop()}`}
                      >
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${cfg.bgClass.split(' ').slice(0, 2).join(' ')}`}>
                          <Icon className={`h-8 w-8 ${cfg.colorClass}`} />
                        </div>
                        <div>
                          <span className="font-display font-bold text-lg text-foreground block">{cfg.label}</span>
                          <span className="text-sm text-muted-foreground">{cfg.description}</span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div>
                  <button
                    onClick={resetForm}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 font-body"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar
                  </button>
                  <h2 className="font-display text-3xl font-bold text-foreground mb-2">
                    {authMode === 'signup' ? 'Criar Conta' : `Área do ${ROLE_CONFIG[selectedRole].label}`}
                  </h2>
                  <p className="text-muted-foreground font-body">
                    {authMode === 'signup'
                      ? `Cria a tua conta como ${ROLE_CONFIG[selectedRole].label.toLowerCase()}`
                      : 'Insere as tuas credenciais para aceder'}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {authMode === 'signup' && (
                    <div className="space-y-2">
                      <Label htmlFor="displayName" className="font-semibold">Nome</Label>
                      <Input
                        id="displayName"
                        placeholder="O teu nome"
                        value={displayName}
                        onChange={e => setDisplayName(e.target.value)}
                        className="h-12 rounded-xl text-base"
                        required
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-semibold">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="exemplo@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="h-12 rounded-xl text-base"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="font-semibold">Palavra-passe</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="h-12 rounded-xl text-base"
                      minLength={6}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full font-display font-bold h-13 rounded-xl text-base"
                    size="lg"
                    disabled={submitting}
                  >
                    {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : authMode === 'signup' ? 'Criar Conta' : 'Entrar'}
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    {authMode === 'login' ? (
                      <>Não tens conta?{' '}
                        <button type="button" onClick={() => setAuthMode('signup')} className="text-primary font-semibold hover:underline">
                          Criar conta
                        </button>
                      </>
                    ) : (
                      <>Já tens conta?{' '}
                        <button type="button" onClick={() => setAuthMode('login')} className="text-primary font-semibold hover:underline">
                          Entrar
                        </button>
                      </>
                    )}
                  </p>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center text-xs text-muted-foreground mt-10">
            © 2026 KIVARA — Pequenos hábitos. Grandes futuros.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
