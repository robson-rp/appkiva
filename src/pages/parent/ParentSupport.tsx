import { Mail, MessageCircle, Phone, Shield, Clock, Crown, HelpCircle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFeatureGate, FEATURES } from '@/hooks/use-feature-gate';
import { useNavigate } from 'react-router-dom';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const contactChannels = [
  {
    icon: Mail,
    title: 'Email',
    description: 'Resposta em até 24h (prioritário: 4h)',
    value: 'suporte@kivara.app',
    shortValue: 'Email',
    href: 'mailto:suporte@kivara.app',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    description: 'Seg–Sex, 9h–18h',
    value: '+351 900 000 000',
    shortValue: 'Abrir',
    href: 'https://wa.me/351900000000',
  },
  {
    icon: Phone,
    title: 'Telefone',
    description: 'Apenas suporte prioritário',
    value: '+351 900 000 001',
    shortValue: 'Ligar',
    href: 'tel:+351900000001',
    priorityOnly: true,
  },
];

const faqItems = [
  {
    question: 'Como posso adicionar mais crianças ao meu plano?',
    answer: 'Acede a Crianças no menu e clica em "Adicionar Criança". O número máximo depende do teu plano activo.',
  },
  {
    question: 'Como funciona a mesada automática?',
    answer: 'Configura o valor e a frequência na secção Mesada. O sistema envia automaticamente na data programada.',
  },
  {
    question: 'Posso alterar o meu plano de subscrição?',
    answer: 'Sim! Acede a Subscrição no menu para ver os planos disponíveis e fazer upgrade a qualquer momento.',
  },
  {
    question: 'Os dados das crianças estão seguros?',
    answer: 'Absolutamente. Cumprimos as normas RGPD e temos encriptação de ponta a ponta. Os dados nunca são partilhados com terceiros.',
  },
  {
    question: 'Como posso cancelar a minha subscrição?',
    answer: 'Contacta o nosso suporte por email ou WhatsApp. Processamos cancelamentos sem perguntas.',
  },
];

export default function ParentSupport() {
  const { allowed: hasPriority } = useFeatureGate(FEATURES.PRIORITY_SUPPORT);
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-display font-bold text-foreground">Suporte</h1>
          <p className="text-muted-foreground text-sm mt-1">Estamos aqui para ajudar</p>
        </div>
        {hasPriority ? (
          <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 gap-1.5 px-3 py-1.5 shrink-0">
            <Crown className="h-3.5 w-3.5" />
            Prioritário
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-muted-foreground shrink-0">
            <Shield className="h-3.5 w-3.5" />
            Padrão
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
              <p className="font-semibold text-foreground text-sm sm:text-base">Suporte Prioritário Activo</p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Tempo de resposta reduzido, canal telefónico dedicado e atendimento preferencial.
              </p>
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
                <p className="font-semibold text-foreground text-sm sm:text-base">Queres resposta mais rápida?</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Faz upgrade para Família Premium e desbloqueia suporte prioritário.
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={() => navigate('/parent/subscription')} className="w-full sm:w-auto shrink-0">
              Ver planos
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Contact Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Canais de contacto</CardTitle>
          <CardDescription>Escolhe o canal mais conveniente</CardDescription>
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
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">Premium</Badge>
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
                  <span className="text-xs text-muted-foreground shrink-0">Requer upgrade</span>
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
            Perguntas Frequentes
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
