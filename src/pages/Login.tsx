import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserRole } from '@/types/kivara';
import { Shield, Sparkles, ArrowLeft } from 'lucide-react';
import kivaraLogo from '@/assets/logo-kivara.svg';
import kivoImg from '@/assets/kivo.svg';

export default function Login() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    login(selectedRole);
    navigate(selectedRole === 'parent' ? '/parent' : '/child');
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Hero Panel */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-8 lg:p-16 gradient-kivara overflow-hidden">
        {/* Decorative circles */}
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

          {/* Feature highlights */}
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
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedRole('parent')}
                    className="w-full p-6 rounded-2xl border-2 border-border hover:border-primary bg-card hover:shadow-kivara transition-all text-left flex items-center gap-5 group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Shield className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <span className="font-display font-bold text-lg text-foreground block">
                        Encarregado
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Gerir tarefas, mesadas e acompanhar o progresso
                      </span>
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedRole('child')}
                    className="w-full p-6 rounded-2xl border-2 border-border hover:border-secondary bg-card hover:shadow-md transition-all text-left flex items-center gap-5 group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                      <Sparkles className="h-8 w-8 text-secondary" />
                    </div>
                    <div>
                      <span className="font-display font-bold text-lg text-foreground block">
                        Criança
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Missões, poupanças e ganhar moedas
                      </span>
                    </div>
                  </motion.button>
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
                    onClick={() => setSelectedRole(null)}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 font-body"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar
                  </button>
                  <h2 className="font-display text-3xl font-bold text-foreground mb-2">
                    {selectedRole === 'parent' ? 'Área do Encarregado' : 'Área da Criança'}
                  </h2>
                  <p className="text-muted-foreground font-body">
                    {selectedRole === 'parent'
                      ? 'Insere as tuas credenciais para aceder ao painel'
                      : 'Insere o teu nome de utilizador e PIN'}
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  {selectedRole === 'parent' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="font-semibold">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="maria@example.com"
                          defaultValue="maria@example.com"
                          className="h-12 rounded-xl text-base"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="font-semibold">Palavra-passe</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          defaultValue="123456"
                          className="h-12 rounded-xl text-base"
                        />
                      </div>
                    </>
                  )}
                  {selectedRole === 'child' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="username" className="font-semibold">Nome de utilizador</Label>
                        <Input
                          id="username"
                          placeholder="ana_star"
                          defaultValue="ana_star"
                          className="h-12 rounded-xl text-base"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pin" className="font-semibold">PIN</Label>
                        <Input
                          id="pin"
                          type="password"
                          maxLength={4}
                          placeholder="••••"
                          defaultValue="1234"
                          className="h-12 rounded-xl text-base"
                        />
                      </div>
                    </>
                  )}

                  <Button
                    type="submit"
                    className="w-full font-display font-bold h-13 rounded-xl text-base"
                    size="lg"
                  >
                    Entrar
                  </Button>
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
