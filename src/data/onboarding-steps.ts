import type { UserRole } from '@/contexts/AuthContext';

export interface OnboardingStep {
  title: string;
  description: string;
  icon: string;
  bullets?: string[];
  highlightSelector?: string;
  position?: 'center' | 'bottom' | 'top';
  showMascot?: boolean;
}

export const ONBOARDING_STEPS: Record<UserRole, OnboardingStep[]> = {
  parent: [
    {
      title: 'Bem-vindo ao KIVARA! 🎉',
      description: 'O KIVARA ajuda as crianças a aprender a poupar, planear e tomar decisões financeiras inteligentes através de missões divertidas e lições da vida real.',
      icon: '🦊',
      showMascot: true,
      position: 'center',
    },
    {
      title: 'O Seu Painel Familiar',
      description: 'Gerencie a aprendizagem financeira dos seus filhos a partir deste painel.',
      icon: '📊',
      bullets: ['Acompanhar progresso', 'Gerir mesadas', 'Criar tarefas', 'Definir metas de poupança'],
      highlightSelector: '[data-onboarding="dashboard"]',
    },
    {
      title: 'Atribuir Tarefas',
      description: 'Ensine responsabilidade através de tarefas.',
      icon: '✅',
      bullets: ['Arrumar o quarto', 'Fazer os trabalhos de casa', 'Ajudar em casa'],
      highlightSelector: '[data-onboarding="tasks"]',
    },
    {
      title: 'Gestão de Mesada',
      description: 'Crie uma mesada digital e ensine as crianças a gerir dinheiro de forma responsável.',
      icon: '💰',
      bullets: ['Mesada semanal ou mensal', 'Bónus por tarefas e missões'],
      highlightSelector: '[data-onboarding="allowance"]',
    },
    {
      title: 'Metas de Poupança',
      description: 'Ajude as crianças a construir hábitos de poupança.',
      icon: '🐷',
      bullets: ['Um brinquedo', 'Uma bicicleta', 'Um presente'],
      highlightSelector: '[data-onboarding="vaults"]',
    },
    {
      title: 'Relatórios e Insights',
      description: 'Acompanhe o crescimento financeiro do seu filho.',
      icon: '📈',
      bullets: ['Hábitos de gasto', 'Progresso de poupança', 'Conquistas de aprendizagem'],
      highlightSelector: '[data-onboarding="reports"]',
    },
  ],
  child: [
    {
      title: 'Olá! Eu sou o Kivo! 🦊',
      description: 'Vou ajudar-te a aprender como ganhar moedas, poupar dinheiro e tornar-te um mestre das finanças!',
      icon: '🦊',
      showMascot: true,
      position: 'center',
    },
    {
      title: 'A Tua Carteira de Moedas',
      description: 'Aqui podes ver quantas moedas ganhaste, de onde vieram e como as gastas.',
      icon: '👛',
      highlightSelector: '[data-onboarding="wallet"]',
    },
    {
      title: 'Completa Missões',
      description: 'Completa missões para ganhar moedas! As missões ajudam-te a aprender sobre poupança e escolhas inteligentes.',
      icon: '🎯',
      highlightSelector: '[data-onboarding="missions"]',
    },
    {
      title: 'Poupa para os Teus Sonhos',
      description: 'Cria uma meta de poupança e vê as tuas moedas crescerem!',
      icon: '✨',
      highlightSelector: '[data-onboarding="dreams"]',
    },
    {
      title: 'Conquistas',
      description: 'Ganha medalhas por poupar moedas, completar missões e atingir metas!',
      icon: '🏆',
      highlightSelector: '[data-onboarding="achievements"]',
    },
  ],
  teen: [
    {
      title: 'Bem-vindo ao KIVARA! 🚀',
      description: 'Aprende a gerir as tuas finanças de forma inteligente. Ganha moedas, poupa e acompanha os teus gastos.',
      icon: '🦊',
      showMascot: true,
      position: 'center',
    },
    {
      title: 'A Tua Carteira',
      description: 'Controla o teu saldo, transações e orçamento mensal num só lugar.',
      icon: '💳',
      highlightSelector: '[data-onboarding="wallet"]',
    },
    {
      title: 'Missões Financeiras',
      description: 'Completa desafios para ganhar moedas e aprender conceitos financeiros importantes.',
      icon: '🎯',
      highlightSelector: '[data-onboarding="missions"]',
    },
    {
      title: 'Cofres de Poupança',
      description: 'Cria cofres para objetivos específicos e vê os teus juros a crescer.',
      icon: '🏦',
      highlightSelector: '[data-onboarding="vaults"]',
    },
    {
      title: 'Análise Financeira',
      description: 'Visualiza os teus gastos por categoria e acompanha a tua evolução financeira.',
      icon: '📊',
      highlightSelector: '[data-onboarding="analytics"]',
    },
  ],
  teacher: [
    {
      title: 'Painel Escolar 🎓',
      description: 'O KIVARA ajuda as escolas a introduzir educação financeira de forma divertida e envolvente.',
      icon: '🎓',
      showMascot: true,
      position: 'center',
    },
    {
      title: 'Gerir Alunos',
      description: 'Organize os alunos por turma, nível e progresso de aprendizagem.',
      icon: '👥',
      highlightSelector: '[data-onboarding="students"]',
    },
    {
      title: 'Desafios Financeiros',
      description: 'Crie desafios para incentivar os alunos a poupar, completar lições e competir entre turmas.',
      icon: '🏆',
      highlightSelector: '[data-onboarding="challenges"]',
    },
  ],
  admin: [
    {
      title: 'Visão Geral da Plataforma 🛡️',
      description: 'Monitore todo o ecossistema KIVARA: utilizadores, escolas e atividade financeira.',
      icon: '🛡️',
      showMascot: true,
      position: 'center',
    },
    {
      title: 'Gestão de Tenants',
      description: 'Controle o acesso de escolas, parceiros e famílias na plataforma.',
      icon: '🏢',
      highlightSelector: '[data-onboarding="tenants"]',
    },
    {
      title: 'Gestão de Subscrições',
      description: 'Crie e controle planos de preços para famílias, escolas e parceiros institucionais.',
      icon: '💎',
      highlightSelector: '[data-onboarding="subscriptions"]',
    },
  ],
  partner: [
    {
      title: 'Painel do Parceiro 🤝',
      description: 'Bem-vindo ao KIVARA! Gerencie os seus programas e desafios patrocinados.',
      icon: '🤝',
      showMascot: true,
      position: 'center',
    },
    {
      title: 'Programas',
      description: 'Crie e acompanhe programas de literacia financeira para famílias e escolas.',
      icon: '📋',
      highlightSelector: '[data-onboarding="programs"]',
    },
    {
      title: 'Desafios Patrocinados',
      description: 'Lance desafios financeiros e acompanhe a participação e taxa de conclusão.',
      icon: '🏆',
      highlightSelector: '[data-onboarding="challenges"]',
    },
  ],
};
