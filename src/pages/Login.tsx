import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Shield, Sparkles, ArrowLeft, GraduationCap, Zap, Loader2, Building2, Phone, Mail, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import kivaraLogoWhite from '@/assets/logo-kivara-white.svg';
import { COUNTRY_CURRENCIES } from '@/data/countries-currencies';
import { PARTNER_SECTORS } from '@/data/partner-sectors';
import { supabase } from '@/integrations/supabase/client';
import LoginBannerCarousel from '@/components/LoginBannerCarousel';

type AuthMode = 'login' | 'signup';
type ContactMethod = 'email' | 'phone';

const ROLE_CONFIG: Record<UserRole, { label: string; description: string; icon: React.ElementType; colorClass: string; bgClass: string }> = {
  parent: { label: 'Encarregado', description: 'Gerir tarefas, mesadas e acompanhar o progresso', icon: Shield, colorClass: 'text-primary', bgClass: 'bg-primary/10 group-hover:bg-primary/20 hover:border-primary' },
  teen: { label: 'Adolescente', description: 'Carteira avançada, categorias e orçamento', icon: Zap, colorClass: 'text-chart-3', bgClass: 'bg-chart-3/10 group-hover:bg-chart-3/20 hover:border-chart-3' },
  child: { label: 'Criança', description: 'Missões, poupanças e ganhar moedas', icon: Sparkles, colorClass: 'text-secondary', bgClass: 'bg-secondary/10 group-hover:bg-secondary/20 hover:border-secondary' },
  teacher: { label: 'Professor', description: 'Gerir turmas e desafios colectivos', icon: GraduationCap, colorClass: 'text-accent-foreground', bgClass: 'bg-accent/10 group-hover:bg-accent/20 hover:border-accent' },
  partner: { label: 'Parceiro', description: 'Gestão do programa de parceria institucional', icon: Building2, colorClass: 'text-chart-4', bgClass: 'bg-chart-4/10 group-hover:bg-chart-4/20 hover:border-chart-4' },
  admin: { label: 'Administrador', description: 'Gestão global da plataforma', icon: Shield, colorClass: 'text-destructive', bgClass: 'bg-destructive/10 group-hover:bg-destructive/20 hover:border-destructive' },
};

const ROLE_ORDER: UserRole[] = ['parent', 'teen', 'child', 'teacher', 'partner', 'admin'];

const GENDER_OPTIONS = [
  { value: 'male', label: 'Masculino' },
  { value: 'female', label: 'Feminino' },
  { value: 'other', label: 'Outro' },
];

const COUNTRY_PHONE_PREFIXES: Record<string, string> = {
  AO: '+244', PT: '+351', BR: '+55', MZ: '+258', CV: '+238',
  GW: '+245', ST: '+239', TL: '+670', US: '+1', GB: '+44',
  FR: '+33', DE: '+49', ES: '+34', ZA: '+27', NG: '+234',
};

export default function Login() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [contactMethod, setContactMethod] = useState<ContactMethod>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [country, setCountry] = useState('AO');
  const [gender, setGender] = useState('');
  const [sector, setSector] = useState('');
  const [schoolTenantId, setSchoolTenantId] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [inviteValid, setInviteValid] = useState<boolean | null>(null);
  const [inviteData, setInviteData] = useState<{ household_id: string; parent_profile_id: string; code_id: string } | null>(null);
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch schools for teacher/parent/child/teen signup
  useEffect(() => {
    if (['teacher', 'parent', 'child', 'teen'].includes(selectedRole ?? '') && authMode === 'signup') {
      supabase
        .from('tenants')
        .select('id, name')
        .eq('tenant_type', 'school')
        .eq('is_active', true)
        .then(({ data }) => {
          if (data) setSchools(data);
        });
    }
  }, [selectedRole, authMode]);

  // Validate invite code for child/teen
  useEffect(() => {
    if ((selectedRole === 'child' || selectedRole === 'teen') && inviteCode.length === 6) {
      supabase.rpc('validate_invite_code', { _code: inviteCode }).then(({ data, error }) => {
        if (error || !data) {
          setInviteValid(false);
          setInviteData(null);
        } else {
          const result = data as any;
          setInviteValid(result.valid);
          if (result.valid) {
            setInviteData({
              household_id: result.household_id,
              parent_profile_id: result.parent_profile_id,
              code_id: result.code_id,
            });
          } else {
            setInviteData(null);
          }
        }
      });
    } else {
      setInviteValid(null);
      setInviteData(null);
    }
  }, [inviteCode, selectedRole]);

  const phoneWithPrefix = `${COUNTRY_PHONE_PREFIXES[country] || '+244'}${phone.replace(/\s/g, '')}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    setSubmitting(true);

    try {
      if (authMode === 'signup') {
        // Validate child/teen must have valid invite
        if ((selectedRole === 'child' || selectedRole === 'teen') && !inviteValid) {
          toast({ title: 'Código inválido', description: 'Precisas de um código de convite válido do teu encarregado.', variant: 'destructive' });
          setSubmitting(false);
          return;
        }

        // Validate teacher must select school
        if (selectedRole === 'teacher' && !schoolTenantId) {
          toast({ title: 'Escola obrigatória', description: 'Seleciona a tua escola para continuar.', variant: 'destructive' });
          setSubmitting(false);
          return;
        }

        // Validate partner must have sector
        if (selectedRole === 'partner' && !sector) {
          toast({ title: 'Sector obrigatório', description: 'Seleciona o sector de actividade.', variant: 'destructive' });
          setSubmitting(false);
          return;
        }

        // Validate parent must have gender
        if (selectedRole === 'parent' && !gender) {
          toast({ title: 'Género obrigatório', description: 'Seleciona o teu género.', variant: 'destructive' });
          setSubmitting(false);
          return;
        }

        if (contactMethod === 'phone') {
          // Phone signup with OTP
          if (!otpSent) {
            const { error } = await supabase.auth.signInWithOtp({
              phone: phoneWithPrefix,
              options: {
                data: {
                  display_name: displayName || phoneWithPrefix,
                  role: selectedRole,
                  country,
                  gender: gender || undefined,
                  phone: phoneWithPrefix,
                  institution_name: selectedRole === 'partner' ? displayName : undefined,
                  sector: sector || undefined,
                  school_tenant_id: (schoolTenantId && schoolTenantId !== 'other') ? schoolTenantId : undefined,
                  avatar: selectedRole === 'parent' ? '👩' : selectedRole === 'teacher' ? '👨‍🏫' : selectedRole === 'teen' ? '🧑‍💻' : selectedRole === 'admin' ? '🛡️' : selectedRole === 'partner' ? '🏢' : '🦊',
                },
              },
            });
            if (error) {
              toast({ title: 'Erro', description: error.message, variant: 'destructive' });
              setSubmitting(false);
              return;
            }
            setOtpSent(true);
            toast({ title: 'OTP enviado! 📱', description: `Código enviado para ${phoneWithPrefix}` });
            setSubmitting(false);
            return;
          } else {
            // Verify OTP
            const { error } = await supabase.auth.verifyOtp({
              phone: phoneWithPrefix,
              token: otpCode,
              type: 'sms',
            });
            if (error) {
              toast({ title: 'Código inválido', description: error.message, variant: 'destructive' });
              setSubmitting(false);
              return;
            }
            // If child/teen, claim the invite code
            if (inviteData && (selectedRole === 'child' || selectedRole === 'teen')) {
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('id')
                  .eq('user_id', user.id)
                  .single();
                if (profile) {
                  await supabase.rpc('claim_invite_code', { _code: inviteCode, _profile_id: profile.id });
                }
              }
            }
          }
        } else {
          // Email signup
          const { error } = await signup(
            email,
            password,
            selectedRole,
            displayName || email,
            country,
            {
              gender: gender || undefined,
              phone: phone ? phoneWithPrefix : undefined,
              institution_name: selectedRole === 'partner' ? displayName : undefined,
              sector: sector || undefined,
              school_tenant_id: (schoolTenantId && schoolTenantId !== 'other') ? schoolTenantId : undefined,
              invite_code: inviteCode || undefined,
            }
          );
          if (error) {
            toast({ title: 'Erro ao criar conta', description: error, variant: 'destructive' });
            setSubmitting(false);
            return;
          }
          toast({ title: 'Conta criada!', description: 'Verifica o teu email para confirmar a conta.' });
        }
      } else {
        // Login
        if (contactMethod === 'phone') {
          if (!otpSent) {
            const { error } = await supabase.auth.signInWithOtp({ phone: phoneWithPrefix });
            if (error) {
              toast({ title: 'Erro', description: error.message, variant: 'destructive' });
              setSubmitting(false);
              return;
            }
            setOtpSent(true);
            toast({ title: 'OTP enviado! 📱', description: `Código enviado para ${phoneWithPrefix}` });
            setSubmitting(false);
            return;
          } else {
            const { error } = await supabase.auth.verifyOtp({
              phone: phoneWithPrefix,
              token: otpCode,
              type: 'sms',
            });
            if (error) {
              toast({ title: 'Código inválido', description: error.message, variant: 'destructive' });
              setSubmitting(false);
              return;
            }
          }
        } else {
          const { error } = await login(email, password);
          if (error) {
            toast({ title: 'Erro ao entrar', description: error, variant: 'destructive' });
            setSubmitting(false);
            return;
          }
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
    setPhone('');
    setPassword('');
    setDisplayName('');
    setCountry('AO');
    setGender('');
    setSector('');
    setSchoolTenantId('');
    setInviteCode('');
    setInviteValid(null);
    setInviteData(null);
    setAuthMode('login');
    setContactMethod('email');
    setOtpSent(false);
    setOtpCode('');
  };

  const isChildOrTeen = selectedRole === 'child' || selectedRole === 'teen';
  const needsInviteFirst = isChildOrTeen && authMode === 'signup' && !inviteValid;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Hero Panel — minimal on mobile, showcase on desktop */}
      <div className="relative flex flex-col items-center justify-center px-4 py-3 lg:flex-1 lg:p-16 gradient-kivara overflow-hidden">
        {/* Soft glow orbs */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-[-20%] right-[-15%] w-[45%] h-[45%] rounded-full bg-white/[0.04] blur-3xl" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-white/[0.03] blur-3xl" />
        </div>

        {/* Geometric pattern overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="geo-grid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M60 0 L30 30 L60 60" fill="none" stroke="white" strokeWidth="0.5" />
              <path d="M0 0 L30 30 L0 60" fill="none" stroke="white" strokeWidth="0.5" />
              <circle cx="30" cy="30" r="1.5" fill="white" opacity="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#geo-grid)" />
        </svg>

        {/* Accent lines — desktop only */}
        <div className="absolute top-[15%] left-[8%] w-24 h-[1px] bg-white/10 rotate-45 hidden lg:block" />
        <div className="absolute bottom-[20%] right-[10%] w-32 h-[1px] bg-white/10 -rotate-30 hidden lg:block" />
        <div className="absolute top-[40%] right-[5%] w-16 h-[1px] bg-white/10 rotate-12 hidden lg:block" />

        <div className="relative z-10 flex flex-row lg:flex-col items-center gap-2 lg:gap-5 w-full">
          {/* Logo — smaller on mobile, large on desktop */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <img 
              src={kivaraLogoWhite} 
              alt="KIVARA" 
              className="h-12 sm:h-16 lg:h-64 drop-shadow-[0_2px_10px_rgba(0,0,0,0.15)]" 
            />
          </motion.div>

          {/* Slogan — desktop: centered below logo */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:block lg:-mt-6 text-white/60 lg:text-sm tracking-[0.25em] uppercase font-light"
          >
            Pequenos hábitos. Grandes futuros
          </motion.p>

          {/* Version badge — desktop only */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="hidden lg:inline-flex mt-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.05] text-white/30 text-[10px] tracking-widest uppercase"
          >
            beta v1.0
          </motion.span>
        </div>

        {/* Slogan — mobile: bottom-right corner */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="lg:hidden absolute bottom-1.5 right-3 z-10 text-white/40 text-[8px] sm:text-[9px] tracking-[0.15em] uppercase font-light"
        >
          Pequenos hábitos. Grandes futuros
        </motion.p>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-start sm:items-center justify-center p-4 sm:p-6 lg:p-16 bg-background overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          {!selectedRole ? (
              <motion.div
                key="role-select"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">
                    Bem-vindo! 👋
                  </h2>
                  <p className="text-muted-foreground font-body text-sm sm:text-base">
                    Seleciona o teu perfil para continuar
                  </p>
                </div>

                <LoginBannerCarousel />

                <div className="grid grid-cols-2 sm:grid-cols-1 gap-2.5 sm:gap-3">
                  {ROLE_ORDER.map(role => {
                    const cfg = ROLE_CONFIG[role];
                    const Icon = cfg.icon;
                    return (
                      <motion.button
                        key={role}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      onClick={() => {
                          setSelectedRole(role);
                          setAuthMode('login');
                          setEmail('');
                          setPassword('');
                          setContactMethod('email');
                        }}
                        className={`w-full p-3 sm:p-4 rounded-2xl border-2 border-border bg-card hover:shadow-md transition-all text-left flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-4 group ${cfg.bgClass.split(' ').pop()}`}
                      >
                        <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 transition-colors ${cfg.bgClass.split(' ').slice(0, 2).join(' ')}`}>
                          <Icon className={`h-5 w-5 sm:h-7 sm:w-7 ${cfg.colorClass}`} />
                        </div>
                        <div className="flex-1 min-w-0 text-center sm:text-left">
                          <span className="font-display font-bold text-sm sm:text-base text-foreground block truncate">{cfg.label}</span>
                          <span className="text-xs text-muted-foreground hidden sm:block">{cfg.description}</span>
                          
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
                transition={{ duration: 0.3 }}
                className="space-y-4 sm:space-y-6"
              >
                <LoginBannerCarousel />
                <div>
                  <button
                    onClick={resetForm}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 font-body"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar
                  </button>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">
                    {authMode === 'signup' ? 'Criar Conta' : `Área do ${ROLE_CONFIG[selectedRole].label}`}
                  </h2>
                  <p className="text-muted-foreground font-body">
                    {authMode === 'signup'
                      ? `Cria a tua conta como ${ROLE_CONFIG[selectedRole].label.toLowerCase()}`
                      : 'Insere as tuas credenciais para aceder'}
                  </p>
                </div>

                <form key={authMode} onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                  {/* ===== SIGNUP-ONLY FIELDS ===== */}
                  {authMode === 'signup' && (
                    <>
                      {/* Child/Teen: Invite code first */}
                      {isChildOrTeen && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="font-semibold">Código de Convite Familiar</Label>
                            <p className="text-xs text-muted-foreground">Pede ao teu encarregado o código de 6 caracteres.</p>
                            <div className="relative">
                              <Input
                                placeholder="EX: A3B7K9"
                                value={inviteCode}
                                onChange={e => setInviteCode(e.target.value.toUpperCase().slice(0, 6))}
                                className="h-12 rounded-xl text-base tracking-widest font-mono text-center uppercase"
                                maxLength={6}
                                required
                              />
                              {inviteValid === true && (
                                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
                              )}
                            </div>
                            {inviteValid === false && (
                              <p className="text-xs text-destructive">Código inválido ou expirado. Pede um novo ao teu encarregado.</p>
                            )}
                            {inviteValid === true && (
                              <p className="text-xs text-secondary">✓ Código válido! Preenche os teus dados abaixo.</p>
                            )}
                          </div>

                          {/* School - For child/teen after invite validated */}
                          {inviteValid && schools.length > 0 && (
                            <div className="space-y-2">
                              <Label className="font-semibold">Escola <span className="text-muted-foreground font-normal">(opcional)</span></Label>
                              <Select value={schoolTenantId} onValueChange={setSchoolTenantId}>
                                <SelectTrigger className="h-12 rounded-xl text-base">
                                  <SelectValue placeholder="Selecionar escola (opcional)" />
                                </SelectTrigger>
                                <SelectContent>
                                  {schools.map(s => (
                                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Show remaining fields only if not child/teen or if invite is valid */}
                      {!needsInviteFirst && (
                        <>
                          {/* Name / Institution Name */}
                          <div className="space-y-2">
                            <Label htmlFor="displayName" className="font-semibold">
                              {selectedRole === 'partner' ? 'Nome da Instituição' : 'Nome'}
                            </Label>
                            <Input
                              id="displayName"
                              placeholder={selectedRole === 'partner' ? 'Nome da instituição' : 'O teu nome'}
                              value={displayName}
                              onChange={e => setDisplayName(e.target.value)}
                              className="h-12 rounded-xl text-base"
                              required
                            />
                          </div>

                          {/* Gender - Only for parents */}
                          {selectedRole === 'parent' && (
                            <div className="space-y-2">
                              <Label className="font-semibold">Género</Label>
                              <Select value={gender} onValueChange={setGender}>
                                <SelectTrigger className="h-12 rounded-xl text-base">
                                  <SelectValue placeholder="Selecionar género" />
                                </SelectTrigger>
                                <SelectContent>
                                  {GENDER_OPTIONS.map(g => (
                                    <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {/* School - For parents (optional, to link children) */}
                          {selectedRole === 'parent' && (
                            <div className="space-y-2">
                              <Label className="font-semibold">Escola dos filhos <span className="text-muted-foreground font-normal">(opcional)</span></Label>
                              <Select value={schoolTenantId} onValueChange={setSchoolTenantId}>
                                <SelectTrigger className="h-12 rounded-xl text-base">
                                  <SelectValue placeholder="Selecionar escola (opcional)" />
                                </SelectTrigger>
                                <SelectContent>
                                  {schools.map(s => (
                                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                  ))}
                                  <SelectItem value="other">Outra (editar depois)</SelectItem>
                                </SelectContent>
                              </Select>
                              {schoolTenantId === 'other' && (
                                <p className="text-xs text-muted-foreground">
                                  Podes associar a escola mais tarde no teu perfil.
                                </p>
                              )}
                            </div>
                          )}

                          {/* Sector - Only for partners */}
                          {selectedRole === 'partner' && (
                            <div className="space-y-2">
                              <Label className="font-semibold">Sector de Actividade</Label>
                              <Select value={sector} onValueChange={setSector}>
                                <SelectTrigger className="h-12 rounded-xl text-base">
                                  <SelectValue placeholder="Selecionar sector" />
                                </SelectTrigger>
                                <SelectContent>
                                  {PARTNER_SECTORS.map(s => (
                                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {/* School - Only for teachers */}
                          {selectedRole === 'teacher' && (
                            <div className="space-y-2">
                              <Label className="font-semibold">Escola</Label>
                              {schools.length === 0 ? (
                                <p className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-xl">
                                  Nenhuma escola registada. Contacta o administrador da plataforma.
                                </p>
                              ) : (
                                <Select value={schoolTenantId} onValueChange={setSchoolTenantId}>
                                  <SelectTrigger className="h-12 rounded-xl text-base">
                                    <SelectValue placeholder="Selecionar escola" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {schools.map(s => (
                                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                          )}

                          {/* Country - Not for child/teen (inherited from parent) */}
                          {!isChildOrTeen && (
                            <div className="space-y-2">
                              <Label className="font-semibold">País</Label>
                              <Select value={country} onValueChange={setCountry}>
                                <SelectTrigger className="h-12 rounded-xl text-base">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {COUNTRY_CURRENCIES.map(c => (
                                    <SelectItem key={c.code} value={c.code}>
                                      {c.name} ({c.currencySymbol})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}

                  {/* ===== CONTACT METHOD TOGGLE ===== */}
                  {!needsInviteFirst && (
                    <>
                      {/* Toggle Email/Phone - not for child/teen in signup (they just use password) */}
                      {!(isChildOrTeen && authMode === 'signup') && (
                        <div className="flex gap-2 p-1 bg-muted/50 rounded-xl">
                          <button
                            type="button"
                            onClick={() => { setContactMethod('email'); setOtpSent(false); setOtpCode(''); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-display font-medium transition-all ${
                              contactMethod === 'email'
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            <Mail className="h-4 w-4" /> Email
                          </button>
                          <button
                            type="button"
                            onClick={() => { setContactMethod('phone'); setOtpSent(false); setOtpCode(''); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-display font-medium transition-all ${
                              contactMethod === 'phone'
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            <Phone className="h-4 w-4" /> Telefone
                          </button>
                        </div>
                      )}

                      {/* Email or Phone field */}
                      {contactMethod === 'email' || (isChildOrTeen && authMode === 'signup') ? (
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
                      ) : (
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="font-semibold">Telefone</Label>
                          <div className="flex gap-2">
                            <div className="w-24 shrink-0">
                              <Input
                                value={COUNTRY_PHONE_PREFIXES[country] || '+244'}
                                readOnly
                                className="h-12 rounded-xl text-base text-center bg-muted/30 font-mono"
                              />
                            </div>
                            <Input
                              id="phone"
                              type="tel"
                              placeholder="912 345 678"
                              value={phone}
                              onChange={e => setPhone(e.target.value)}
                              className="h-12 rounded-xl text-base"
                              required
                            />
                          </div>
                        </div>
                      )}

                      {/* Password - Only for email auth */}
                      {(contactMethod === 'email' || (isChildOrTeen && authMode === 'signup')) && !otpSent && (
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
                      )}

                      {/* OTP Code Input */}
                      {otpSent && contactMethod === 'phone' && (
                        <div className="space-y-2">
                          <Label htmlFor="otp" className="font-semibold">Código OTP</Label>
                          <p className="text-xs text-muted-foreground">Insere o código de 6 dígitos enviado para o teu telefone.</p>
                          <Input
                            id="otp"
                            placeholder="000000"
                            value={otpCode}
                            onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="h-12 rounded-xl text-base tracking-widest text-center font-mono"
                            maxLength={6}
                            required
                          />
                        </div>
                      )}

                      <Button
                        type="submit"
                        className="w-full font-display font-bold h-13 rounded-xl text-base"
                        size="lg"
                        disabled={submitting}
                      >
                        {submitting ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : otpSent ? (
                          'Verificar Código'
                        ) : contactMethod === 'phone' ? (
                          'Enviar Código'
                        ) : authMode === 'signup' ? (
                          'Criar Conta'
                        ) : (
                          'Entrar'
                        )}
                      </Button>

                      <p className="text-center text-sm text-muted-foreground">
                        {authMode === 'login' ? (
                          <>Não tens conta?{' '}
                            <button type="button" onClick={() => { setAuthMode('signup'); setOtpSent(false); setOtpCode(''); }} className="text-primary font-semibold hover:underline">
                              Criar conta
                            </button>
                          </>
                        ) : (
                          <>Já tens conta?{' '}
                            <button type="button" onClick={() => { setAuthMode('login'); setOtpSent(false); setOtpCode(''); }} className="text-primary font-semibold hover:underline">
                              Entrar
                            </button>
                          </>
                        )}
                      </p>
                    </>
                  )}
                </form>
              </motion.div>
            )}

          <p className="text-center text-xs text-muted-foreground mt-6 sm:mt-10 pb-4">
            © 2026 KIVARA — Pequenos hábitos. Grandes futuros.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
