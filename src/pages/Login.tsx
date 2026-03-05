import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserRole } from '@/types/kivara';
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
    <div className="min-h-screen flex items-center justify-center p-4 gradient-kivara">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="mb-4"
          >
            <img src={kivoImg} alt="Kivo" className="w-24 h-24 mx-auto" />
          </motion.div>
          <img src={kivaraLogo} alt="KIVARA" className="h-12 mx-auto mb-2 brightness-0 invert" />
          <p className="text-white/80 font-body">Pequenos hábitos. Grandes futuros.</p>
        </div>

        <Card className="shadow-kivara border-0">
          <CardHeader className="text-center">
            <CardTitle className="font-display">Entrar</CardTitle>
            <CardDescription>Seleciona o teu perfil para continuar</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Role selection */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => setSelectedRole('parent')}
                className={`p-4 rounded-xl border-2 transition-all text-center ${
                  selectedRole === 'parent'
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <span className="text-3xl block mb-2">👩</span>
                <span className="font-display font-semibold text-sm">Encarregado</span>
              </button>
              <button
                onClick={() => setSelectedRole('child')}
                className={`p-4 rounded-xl border-2 transition-all text-center ${
                  selectedRole === 'child'
                    ? 'border-secondary bg-secondary/5 shadow-md'
                    : 'border-border hover:border-secondary/40'
                }`}
              >
                <span className="text-3xl block mb-2">🧒</span>
                <span className="font-display font-semibold text-sm">Criança</span>
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {selectedRole === 'parent' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="maria@example.com" defaultValue="maria@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Palavra-passe</Label>
                    <Input id="password" type="password" placeholder="••••••••" defaultValue="123456" />
                  </div>
                </>
              )}
              {selectedRole === 'child' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="username">Nome de utilizador</Label>
                    <Input id="username" placeholder="ana_star" defaultValue="ana_star" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pin">PIN</Label>
                    <Input id="pin" type="password" maxLength={4} placeholder="••••" defaultValue="1234" />
                  </div>
                </>
              )}
              {selectedRole && (
                <Button type="submit" className="w-full font-display font-semibold h-12 rounded-xl" size="lg">
                  Entrar como {selectedRole === 'parent' ? 'Encarregado' : 'Criança'}
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
