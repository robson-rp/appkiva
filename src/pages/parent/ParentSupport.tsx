import { Mail, MessageCircle, Phone, Shield, Clock, Crown, HelpCircle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFeatureGate, FEATURES } from '@/hooks/use-feature-gate';
import { useNavigate } from 'react-router-dom';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useT } from '@/contexts/LanguageContext';

export default function ParentSupport() {
  const t = useT();
  const { allowed: hasPriority } = useFeatureGate(FEATURES.PRIORITY_SUPPORT);
  const navigate = useNavigate();

  const contactChannels = [
    {
      icon: Mail,
      title: 'Email',
      description: t('parent.support.email_desc'),
      value: 'suporte@kivara.app',
      shortValue: 'Email',
      href: 'mailto:suporte@kivara.app',
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      description: t('parent.support.whatsapp_desc'),
      value: '+351 900 000 000',
      shortValue: 'WhatsApp',
      href: 'https://wa.me/351900000000',
    },
    {
      icon: Phone,
      title: t('parent.profile.phone'),
      description: t('parent.support.phone_desc'),
      value: '+351 900 000 001',
      shortValue: t('parent.profile.phone'),
      href: 'tel:+351900000001',
      priorityOnly: true,
    },
  ];

  const faqItems = Array.from({ length: 5 }, (_, i) => ({
    question: t(`parent.support.faq${i + 1}_q`),
    answer: t(`parent.support.faq${i + 1}_a`),
  }));

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-display font-bold text-foreground">{t('parent.support.title')}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t('parent.support.subtitle')}</p>
        </div>
        {hasPriority ? (
          <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 gap-1.5 px-3 py-1.5 shrink-0">
            <Crown className="h-3.5 w-3.5" />
            {t('parent.support.priority')}
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-muted-foreground shrink-0">
            <Shield className="h-3.5 w-3.5" />
            {t('parent.support.standard')}
          </Badge>
        )}
      </div>

      {/* Priority Banner */}
      {hasPriority ? (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-foreground text-sm sm:text-base">{t('parent.support.priority_active')}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">{t('parent.support.priority_desc')}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4">
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-muted flex items-center justify-center shrink-0">
                <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm sm:text-base">{t('parent.support.upgrade_prompt')}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{t('parent.support.upgrade_desc')}</p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={() => navigate('/parent/subscription')} className="w-full sm:w-auto shrink-0">
              {t('parent.support.view_plans')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Contact Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('parent.support.channels')}</CardTitle>
          <CardDescription>{t('parent.support.channels_desc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {contactChannels.map((channel) => {
            const isLocked = channel.priorityOnly && !hasPriority;
            return (
              <div
                key={channel.title}
                className={`flex items-center gap-3 sm:gap-4 p-3 rounded-xl transition-colors ${
                  isLocked ? 'opacity-50' : 'hover:bg-muted/50'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <channel.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm text-foreground">{channel.title}</p>
                    {channel.priorityOnly && (
                      <Badge variant="outline" className="text-xs px-1.5 py-0">{t('parent.support.premium')}</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{channel.description}</p>
                </div>
                {!isLocked ? (
                  <Button variant="ghost" size="sm" asChild className="shrink-0 px-2 sm:px-3">
                    <a href={channel.href} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 sm:mr-1.5" />
                      <span className="hidden sm:inline text-xs">{channel.value}</span>
                      <span className="sm:hidden text-xs">{channel.shortValue}</span>
                    </a>
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground shrink-0">{t('parent.support.requires_upgrade')}</span>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            {t('parent.support.faq')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-sm text-left">{item.question}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
