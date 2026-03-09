import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Shield, Sparkles, ArrowLeft, GraduationCap, Zap, Loader2, Building2, Phone, Mail, CheckCircle2, AlertTriangle, Clock, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import kivaraLogoWhite from '@/assets/logo-kivara-white.svg';
import { PasswordStrengthMeter } from '@/components/PasswordStrengthMeter';
import { isPasswordValid } from '@/lib/password-validation';
import { COUNTRY_CURRENCIES } from '@/data/countries-currencies';
import { PARTNER_SECTORS } from '@/data/partner-sectors';
import { supabase } from '@/integrations/supabase/client';
import LoginBannerCarousel from '@/components/LoginBannerCarousel';
import { useT } from '@/contexts/LanguageContext';

type AuthMode = 'login' | 'signup';
type ContactMethod = 'email' | 'phone';

function useRoleConfig() {
  const t = useT();
  const config: Record<UserRole, { label: string; description: string; icon: React.ElementType; colorClass: string; bgClass: string }> = {
    parent: { label: t('role.parent'), description: t('role.parent.desc'), icon: Shield, colorClass: 'text-primary', bgClass: 'bg-primary/10 group-hover:bg-primary/20 hover:border-primary' },
    teen: { label: t('role.teen'), description: t('role.teen.desc'), icon: Zap, colorClass: 'text-chart-3', bgClass: 'bg-chart-3/10 group-hover:bg-chart-3/20 hover:border-chart-3' },
    child: { label: t('role.child'), description: t('role.child.desc'), icon: Sparkles, colorClass: 'text-secondary', bgClass: 'bg-secondary/10 group-hover:bg-secondary/20 hover:border-secondary' },
    teacher: { label: t('role.teacher'), description: t('role.teacher.desc'), icon: GraduationCap, colorClass: 'text-accent-foreground', bgClass: 'bg-accent/10 group-hover:bg-accent/20 hover:border-accent' },
    partner: { label: t('role.partner'), description: t('role.partner.desc'), icon: Building2, colorClass: 'text-chart-4', bgClass: 'bg-chart-4/10 group-hover:bg-chart-4/20 hover:border-chart-4' },
    admin: { label: t('role.admin'), description: t('role.admin.desc'), icon: Shield, colorClass: 'text-destructive', bgClass: 'bg-destructive/10 group-hover:bg-destructive/20 hover:border-destructive' },
  };
  return config;
}

const ROLE_ORDER: UserRole[] = ['parent', 'teen', 'child', 'teacher', 'partner', 'admin'];

const COUNTRY_PHONE_PREFIXES: Record<string, string> = {
  AO: '+244', PT: '+351', BR: '+55', MZ: '+258', CV: '+238',
  GW: '+245', ST: '+239', TL: '+670', US: '+1', GB: '+44',
  FR: '+33', DE: '+49', ES: '+34', ZA: '+27', NG: '+234',
};

export default function Login() {
  const t = useT();
  const ROLE_CONFIG = useRoleConfig();
  const GENDER_OPTIONS = [
    { value: 'male', label: t('auth.gender_male') },
    { value: 'female', label: t('auth.gender_female') },
    { value: 'other', label: t('auth.gender_other') },
  ];

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
  const [emailSignupSuccess, setEmailSignupSuccess] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const otpTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 2FA state
  const [twoFACode, setTwoFACode] = useState('');
  const [twoFAAttempts, setTwoFAAttempts] = useState(0);
  const [twoFATrustDevice, setTwoFATrustDevice] = useState(false);
  const [twoFAResendCountdown, setTwoFAResendCountdown] = useState(0);
  const [twoFALocked, setTwoFALocked] = useState(false);
  const twoFATimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { login, signup, user, pending2FA, complete2FA } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect when user is loaded by AuthContext (pending2FA blocks redirect)
  useEffect(() => {
    if (user && !pending2FA) {
      const dest = user.role === 'parent' ? '/parent' : user.role === 'teacher' ? '/teacher' : user.role === 'teen' ? '/teen' : user.role === 'admin' ? '/admin' : user.role === 'partner' ? '/partner' : '/child';
      navigate(dest, { replace: true });
    }
  }, [user, pending2FA, navigate]);

  // OTP countdown timer (phone auth)
  const startOtpCountdown = useCallback(() => {
    setOtpCountdown(60);
    if (otpTimerRef.current) clearInterval(otpTimerRef.current);
    otpTimerRef.current = setInterval(() => {
      setOtpCountdown(prev => {
        if (prev <= 1) {
          if (otpTimerRef.current) clearInterval(otpTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // 2FA resend countdown timer
  const startTwoFACountdown = useCallback(() => {
    setTwoFAResendCountdown(30);
    if (twoFATimerRef.current) clearInterval(twoFATimerRef.current);
    twoFATimerRef.current = setInterval(() => {
      setTwoFAResendCountdown(prev => {
        if (prev <= 1) {
          if (twoFATimerRef.current) clearInterval(twoFATimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (otpTimerRef.current) clearInterval(otpTimerRef.current);
      if (twoFATimerRef.current) clearInterval(twoFATimerRef.current);
    };
  }, []);

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
        if (contactMethod === 'email' && !isPasswordValid(password)) {
          toast({ title: t('password.too_weak'), variant: 'destructive' });
          setSubmitting(false);
          return;
        }
        if ((selectedRole === 'child' || selectedRole === 'teen') && !inviteValid) {
          toast({ title: t('auth.otp_invalid'), description: t('auth.invite_required'), variant: 'destructive' });
          setSubmitting(false);
          return;
        }
        if (selectedRole === 'teacher' && !schoolTenantId) {
          toast({ title: t('auth.school_required'), description: t('auth.school_required'), variant: 'destructive' });
          setSubmitting(false);
          return;
        }
        if (selectedRole === 'partner' && !sector) {
          toast({ title: t('auth.sector_required'), description: t('auth.sector_required'), variant: 'destructive' });
          setSubmitting(false);
          return;
        }
        if (selectedRole === 'parent' && !gender) {
          toast({ title: t('auth.gender_required'), description: t('auth.gender_required'), variant: 'destructive' });
          setSubmitting(false);
          return;
        }

        if (contactMethod === 'phone') {
          toast({ title: t('auth.phone_not_available'), description: t('auth.phone_not_available_desc'), variant: 'destructive' });
          setSubmitting(false);
          return;
        } else {
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
            toast({ title: t('auth.error_signup'), description: error, variant: 'destructive' });
            setSubmitting(false);
            return;
          }
          setEmailSignupSuccess(true);
          setSubmitting(false);
          return;
        }
      } else {
        if (contactMethod === 'phone') {
          toast({ title: t('auth.phone_not_available'), description: t('auth.phone_not_available_desc'), variant: 'destructive' });
          setSubmitting(false);
          return;
        } else {
          const { error, requires2FA } = await login(email, password);
          if (error) {
            toast({ title: t('auth.error_login'), description: error, variant: 'destructive' });
            setSubmitting(false);
            return;
          }
          if (requires2FA) {
            // Trigger reauthentication — sends OTP nonce to user's email
            try {
              await supabase.auth.reauthenticate();
              startTwoFACountdown();
              toast({ title: t('twofa.code_sent'), description: email });
            } catch (e) {
              console.warn('reauthenticate error:', e);
            }
            setSubmitting(false);
            return;
          }
        }
      }

      // Navigation is handled by the useEffect watching `user` from AuthContext
    } catch {
      toast({ title: t('auth.error_unexpected'), variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  // ── 2FA handlers ──
  const handleVerify2FA = async () => {
    if (twoFACode.length !== 6 || submitting) return;
    setSubmitting(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: { _2fa_verified_at: new Date().toISOString() },
        nonce: twoFACode,
      });

      if (error) {
        const newAttempts = twoFAAttempts + 1;
        setTwoFAAttempts(newAttempts);
        setTwoFACode('');

        if (newAttempts >= 5) {
          setTwoFALocked(true);
          await supabase.auth.signOut();
          complete2FA();
          toast({ title: t('twofa.too_many_attempts'), description: t('twofa.try_again_later'), variant: 'destructive' });
        } else {
          toast({ title: t('twofa.invalid_code'), description: `${t('twofa.attempts_remaining')}: ${5 - newAttempts}`, variant: 'destructive' });
        }
        setSubmitting(false);
        return;
      }

      // 2FA verified successfully — trust device if checked
      if (twoFATrustDevice) {
        const token = crypto.randomUUID();
        localStorage.setItem('kivara_trusted_device', token);
        try {
          await supabase.functions.invoke('verify-2fa', {
            body: { action: 'trust-device', device_token: token },
          });
        } catch {
          // Non-critical failure
        }
      }

      complete2FA();
      toast({ title: t('twofa.verified') });
    } catch {
      toast({ title: t('auth.error_unexpected'), variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend2FA = async () => {
    if (twoFAResendCountdown > 0) return;
    try {
      await supabase.auth.reauthenticate();
      startTwoFACountdown();
      setTwoFACode('');
      toast({ title: t('twofa.code_resent'), description: email });
    } catch {
      toast({ title: t('auth.error_unexpected'), variant: 'destructive' });
    }
  };

  const handleCancel2FA = async () => {
    await supabase.auth.signOut();
    complete2FA();
    setTwoFACode('');
    setTwoFAAttempts(0);
    setTwoFATrustDevice(false);
    setTwoFAResendCountdown(0);
    setTwoFALocked(false);
    if (twoFATimerRef.current) clearInterval(twoFATimerRef.current);
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
    setEmailSignupSuccess(false);
    setOtpCountdown(0);
    if (otpTimerRef.current) clearInterval(otpTimerRef.current);
    setTwoFACode('');
    setTwoFAAttempts(0);
    setTwoFATrustDevice(false);
    setTwoFAResendCountdown(0);
    setTwoFALocked(false);
    if (twoFATimerRef.current) clearInterval(twoFATimerRef.current);
  };

  const isChildOrTeen = selectedRole === 'child' || selectedRole === 'teen';
  const needsInviteFirst = isChildOrTeen && authMode === 'signup' && !inviteValid;

  // Email signup success screen
  if (emailSignupSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center space-y-6"
        >
          <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="h-10 w-10 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground">{t('auth.account_created')}</h2>
          <p className="text-muted-foreground font-body">{t('auth.email_verification_sent')}</p>
          <p className="text-sm text-muted-foreground">{email}</p>
          <Button onClick={resetForm} variant="outline" className="rounded-xl">
            {t('auth.back')}
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Hero Panel */}
      <div className="relative flex flex-col items-center justify-center px-4 py-3 lg:flex-1 lg:p-16 gradient-kivara overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-[-20%] right-[-15%] w-[45%] h-[45%] rounded-full bg-white/[0.04] blur-3xl" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-white/[0.03] blur-3xl" />
        </div>

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

        <div className="absolute top-[15%] left-[8%] w-24 h-[1px] bg-white/10 rotate-45 hidden lg:block" />
        <div className="absolute bottom-[20%] right-[10%] w-32 h-[1px] bg-white/10 -rotate-30 hidden lg:block" />
        <div className="absolute top-[40%] right-[5%] w-16 h-[1px] bg-white/10 rotate-12 hidden lg:block" />

        <div className="relative z-10 flex flex-row lg:flex-col items-center gap-2 lg:gap-5 w-full">
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

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:block lg:-mt-6 text-white/60 lg:text-sm tracking-[0.25em] uppercase font-light"
          >
            {t('auth.slogan')}
          </motion.p>

          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="hidden lg:inline-flex mt-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.05] text-white/30 text-[10px] tracking-widest uppercase"
          >
            beta v1.0
          </motion.span>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="lg:hidden absolute bottom-1.5 right-3 z-10 text-white/40 text-[8px] sm:text-[9px] tracking-[0.15em] uppercase font-light"
        >
          {t('auth.slogan')}
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
          {/* ── 2FA Verification Screen ── */}
          {pending2FA ? (
            <motion.div
              key="two-fa"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {twoFALocked ? (
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground">{t('twofa.locked_title')}</h2>
                  <p className="text-muted-foreground font-body text-sm">{t('twofa.locked_desc')}</p>
                  <Button onClick={resetForm} variant="outline" className="rounded-xl">
                    {t('auth.back')}
                  </Button>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleCancel2FA}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-body"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {t('auth.back')}
                  </button>

                  <div className="text-center space-y-3">
                    <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <ShieldCheck className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="font-display text-2xl font-bold text-foreground">{t('twofa.title')}</h2>
                    <p className="text-muted-foreground font-body text-sm">{t('twofa.instruction')}</p>
                    <p className="text-xs text-muted-foreground">{email}</p>
                  </div>

                  <div className="flex justify-center">
                    <InputOTP maxLength={6} value={twoFACode} onChange={setTwoFACode}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  <div className="flex items-center gap-2 justify-center">
                    <Checkbox
                      id="trustDevice"
                      checked={twoFATrustDevice}
                      onCheckedChange={(v) => setTwoFATrustDevice(!!v)}
                    />
                    <label htmlFor="trustDevice" className="text-sm text-muted-foreground cursor-pointer select-none">
                      {t('twofa.trust_device')}
                    </label>
                  </div>

                  <Button
                    onClick={handleVerify2FA}
                    className="w-full font-display font-bold h-13 rounded-xl text-base"
                    size="lg"
                    disabled={twoFACode.length !== 6 || submitting}
                  >
                    {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : t('twofa.confirm')}
                  </Button>

                  <div className="text-center">
                    {twoFAResendCountdown > 0 ? (
                      <span className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                        <Clock className="h-3 w-3" />
                        {t('twofa.resend_in')} {twoFAResendCountdown}s
                      </span>
                    ) : (
                      <button
                        onClick={handleResend2FA}
                        className="text-xs text-primary font-semibold hover:underline"
                      >
                        {t('twofa.resend')}
                      </button>
                    )}
                  </div>

                  {twoFAAttempts > 0 && (
                    <p className="text-center text-xs text-muted-foreground">
                      {t('twofa.attempts_remaining')}: {5 - twoFAAttempts}
                    </p>
                  )}
                </>
              )}
            </motion.div>
          ) : !selectedRole ? (
              <motion.div
                key="role-select"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">
                    {t('auth.welcome')}
                  </h2>
                  <p className="text-muted-foreground font-body text-sm sm:text-base">
                    {t('auth.select_profile')}
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
                    {t('auth.back')}
                  </button>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">
                    {authMode === 'signup' ? t('auth.create_account') : `${t('auth.area_of')} ${ROLE_CONFIG[selectedRole].label}`}
                  </h2>
                  <p className="text-muted-foreground font-body">
                    {authMode === 'signup'
                      ? `${t('auth.create_as')} ${ROLE_CONFIG[selectedRole].label.toLowerCase()}`
                      : t('auth.enter_credentials')}
                  </p>
                </div>

                <form key={authMode} onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                  {authMode === 'signup' && (
                    <>
                      {isChildOrTeen && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="font-semibold">{t('auth.invite_code')}</Label>
                            <p className="text-xs text-muted-foreground">{t('auth.invite_hint')}</p>
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
                              <p className="text-xs text-destructive">{t('auth.invite_invalid')}</p>
                            )}
                            {inviteValid === true && (
                              <p className="text-xs text-secondary">{t('auth.invite_valid')}</p>
                            )}
                          </div>

                          {inviteValid && schools.length > 0 && (
                            <div className="space-y-2">
                              <Label className="font-semibold">{t('auth.school')} <span className="text-muted-foreground font-normal">({t('common.optional')})</span></Label>
                              <Select value={schoolTenantId} onValueChange={setSchoolTenantId}>
                                <SelectTrigger className="h-12 rounded-xl text-base">
                                  <SelectValue placeholder={t('auth.select_school_optional')} />
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

                      {!needsInviteFirst && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="displayName" className="font-semibold">
                              {selectedRole === 'partner' ? t('auth.institution_name') : t('auth.name')}
                            </Label>
                            <Input
                              id="displayName"
                              placeholder={selectedRole === 'partner' ? t('auth.institution_name') : t('auth.name')}
                              value={displayName}
                              onChange={e => setDisplayName(e.target.value)}
                              className="h-12 rounded-xl text-base"
                              required
                            />
                          </div>

                          {selectedRole === 'parent' && (
                            <div className="space-y-2">
                              <Label className="font-semibold">{t('auth.gender')}</Label>
                              <Select value={gender} onValueChange={setGender}>
                                <SelectTrigger className="h-12 rounded-xl text-base">
                                  <SelectValue placeholder={t('auth.gender')} />
                                </SelectTrigger>
                                <SelectContent>
                                  {GENDER_OPTIONS.map(g => (
                                    <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {selectedRole === 'parent' && (
                            <div className="space-y-2">
                              <Label className="font-semibold">{t('auth.school_optional')} <span className="text-muted-foreground font-normal">({t('common.optional')})</span></Label>
                              <Select value={schoolTenantId} onValueChange={setSchoolTenantId}>
                                <SelectTrigger className="h-12 rounded-xl text-base">
                                  <SelectValue placeholder={t('auth.select_school_optional')} />
                                </SelectTrigger>
                                <SelectContent>
                                  {schools.map(s => (
                                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                  ))}
                                  <SelectItem value="other">{t('auth.other_school')}</SelectItem>
                                </SelectContent>
                              </Select>
                              {schoolTenantId === 'other' && (
                                <p className="text-xs text-muted-foreground">
                                  {t('auth.other_school_hint')}
                                </p>
                              )}
                            </div>
                          )}

                          {selectedRole === 'partner' && (
                            <div className="space-y-2">
                              <Label className="font-semibold">{t('auth.sector')}</Label>
                              <Select value={sector} onValueChange={setSector}>
                                <SelectTrigger className="h-12 rounded-xl text-base">
                                  <SelectValue placeholder={t('auth.select_sector')} />
                                </SelectTrigger>
                                <SelectContent>
                                  {PARTNER_SECTORS.map(s => (
                                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {selectedRole === 'teacher' && (
                            <div className="space-y-2">
                              <Label className="font-semibold">{t('auth.school')}</Label>
                              {schools.length === 0 ? (
                                <p className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-xl">
                                  {t('auth.no_schools')}
                                </p>
                              ) : (
                                <Select value={schoolTenantId} onValueChange={setSchoolTenantId}>
                                  <SelectTrigger className="h-12 rounded-xl text-base">
                                    <SelectValue placeholder={t('auth.select_school')} />
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

                          {!isChildOrTeen && (
                            <div className="space-y-2">
                              <Label className="font-semibold">{t('auth.country')}</Label>
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

                  {!needsInviteFirst && (
                    <>
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
                            <Mail className="h-4 w-4" /> {t('auth.email')}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setContactMethod('phone'); setOtpSent(false); setOtpCode(''); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-display font-medium transition-all relative ${
                              contactMethod === 'phone'
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            <Phone className="h-4 w-4" /> {t('auth.phone')}
                            <span className="absolute -top-1 -right-1 text-[9px] bg-muted-foreground/20 text-muted-foreground px-1.5 py-0.5 rounded-full leading-none">{t('auth.coming_soon')}</span>
                          </button>
                        </div>
                      )}

                      {contactMethod === 'phone' && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                          <AlertTriangle className="h-5 w-5 text-muted-foreground shrink-0" />
                          <p className="text-xs text-muted-foreground">{t('auth.phone_not_available_desc')}</p>
                        </div>
                      )}

                      {(contactMethod === 'email' || (isChildOrTeen && authMode === 'signup')) && (
                        <div className="space-y-2">
                          <Label htmlFor="email" className="font-semibold">{t('auth.email')}</Label>
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
                      )}

                      {(contactMethod === 'email' || (isChildOrTeen && authMode === 'signup')) && !otpSent && (
                        <div className="space-y-2">
                          <Label htmlFor="password" className="font-semibold">{t('auth.password')}</Label>
                          <Input
                            id="password"
                            type="password"
                            placeholder="••••••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="h-12 rounded-xl text-base"
                            minLength={12}
                            required
                          />
                          {authMode === 'signup' && <PasswordStrengthMeter password={password} />}
                          {authMode === 'login' && (
                            <div className="text-right">
                              <Link to="/forgot-password" className="text-xs text-primary hover:underline font-medium">
                                {t('password.forgot_link')}
                              </Link>
                            </div>
                          )}
                        </div>
                      )}

                      {otpSent && contactMethod === 'phone' && (
                        <div className="space-y-2">
                          <Label htmlFor="otp" className="font-semibold">{t('auth.otp_code')}</Label>
                          <p className="text-xs text-muted-foreground">{t('auth.otp_hint')}</p>
                          <Input
                            id="otp"
                            placeholder="000000"
                            value={otpCode}
                            onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="h-12 rounded-xl text-base tracking-widest text-center font-mono"
                            maxLength={6}
                            required
                          />
                          <div className="flex items-center justify-between">
                            {otpCountdown > 0 ? (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {t('auth.resend_in')} {otpCountdown}s
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => { setOtpSent(false); setOtpCode(''); }}
                                className="text-xs text-primary font-semibold hover:underline"
                              >
                                {t('auth.resend_otp')}
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {contactMethod !== 'phone' && (
                        <Button
                          type="submit"
                          className="w-full font-display font-bold h-13 rounded-xl text-base"
                          size="lg"
                          disabled={submitting}
                        >
                          {submitting ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : authMode === 'signup' ? (
                            t('auth.sign_up')
                          ) : (
                            t('auth.sign_in')
                          )}
                        </Button>
                      )}

                      <p className="text-center text-sm text-muted-foreground">
                        {authMode === 'login' ? (
                          <>{t('auth.no_account')}{' '}
                            <button type="button" onClick={() => { setAuthMode('signup'); setOtpSent(false); setOtpCode(''); }} className="text-primary font-semibold hover:underline">
                              {t('auth.register')}
                            </button>
                          </>
                        ) : (
                          <>{t('auth.has_account')}{' '}
                            <button type="button" onClick={() => { setAuthMode('login'); setOtpSent(false); setOtpCode(''); }} className="text-primary font-semibold hover:underline">
                              {t('auth.login')}
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
            © 2026 KIVARA — {t('auth.slogan')}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
