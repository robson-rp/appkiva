import type { UserRole } from '@/contexts/AuthContext';

export interface OnboardingStep {
  title: string;
  description: string;
  illustrationKey: string;
  cta?: string;
}

export const ONBOARDING_STEPS: Record<UserRole, OnboardingStep[]> = {
  parent: [
    {
      title: 'Bem-vindo ao KIVARA',
      description: 'O KIVARA ajuda os seus filhos a aprender a poupar, planear e tomar decisões financeiras inteligentes através de missões divertidas e desafios práticos.',
      illustrationKey: 'parent-welcome',
      cta: 'Explorar a plataforma',
    },
    {
      title: 'Transforme tarefas em lições financeiras',
      description: 'Crie tarefas e recompensas para ensinar responsabilidade e gestão de dinheiro de forma divertida e prática.',
      illustrationKey: 'parent-tasks',
    },
    {
      title: 'Acompanhe o crescimento financeiro',
      description: 'Veja o progresso de poupança, missões concluídas e hábitos financeiros em tempo real.',
      illustrationKey: 'parent-dashboard',
    },
    {
      title: 'Ajude a poupar para os sonhos',
      description: 'Crie metas de poupança e veja os seus filhos a desenvolver disciplina e paciência.',
      illustrationKey: 'parent-savings',
    },
  ],
  child: [
    {
      title: 'Olá! Eu sou o Kivo! 🦊',
      description: 'Vou ajudar-te a tornar um mestre do dinheiro completando missões e aprendendo a poupar moedas!',
      illustrationKey: 'child-kivo',
      cta: 'Vamos começar!',
    },
    {
      title: 'Ganha moedas com missões',
      description: 'Completa tarefas, desafios e lições para ganhar moedas e subir de nível!',
      illustrationKey: 'child-coins',
    },
    {
      title: 'Poupa para o que mais queres',
      description: 'Cria uma meta de poupança e vê as tuas moedas a crescer ao longo do tempo!',
      illustrationKey: 'child-dreams',
    },
    {
      title: 'Desbloqueia conquistas',
      description: 'Ganha medalhas e prémios por aprender sobre dinheiro e fazer escolhas inteligentes!',
      illustrationKey: 'child-achievements',
    },
  ],
  teen: [
    {
      title: 'As tuas finanças, o teu controlo 🚀',
      description: 'O KIVARA dá-te ferramentas reais para gerir o teu dinheiro, acompanhar gastos e tomar decisões financeiras inteligentes.',
      illustrationKey: 'teen-welcome',
      cta: 'Começar',
    },
    {
      title: 'Controla o teu orçamento',
      description: 'Vê para onde vai o teu dinheiro, analisa categorias de gastos e mantém-te dentro dos limites.',
      illustrationKey: 'teen-budget',
    },
    {
      title: 'Investe nos teus objetivos',
      description: 'Cria cofres com juros simulados e aprende o poder dos juros compostos para atingir as tuas metas.',
      illustrationKey: 'teen-invest',
    },
    {
      title: 'Evolui e desbloqueia níveis',
      description: 'Completa missões financeiras, mantém streaks e sobe no ranking para provar a tua literacia financeira.',
      illustrationKey: 'teen-level-up',
    },
  ],
  teacher: [
    {
      title: 'Educação financeira na sala de aula',
      description: 'O KIVARA ajuda professores a introduzir literacia financeira de forma divertida e envolvente.',
      illustrationKey: 'teacher-classroom',
      cta: 'Explorar',
    },
    {
      title: 'Gerir alunos e progresso',
      description: 'Acompanhe a atividade dos alunos, desafios e conquistas de aprendizagem.',
      illustrationKey: 'teacher-manage',
    },
    {
      title: 'Crie desafios financeiros',
      description: 'Crie competições entre turmas para motivar os alunos a aprender e poupar.',
      illustrationKey: 'teacher-challenges',
    },
  ],
  admin: [
    {
      title: 'Consola de Administração KIVARA',
      description: 'Gerencie todo o ecossistema KIVARA incluindo famílias, escolas e parceiros.',
      illustrationKey: 'admin-overview',
      cta: 'Aceder',
    },
    {
      title: 'Gestão multi-tenant',
      description: 'Controle tenants, subscrições e papéis de utilizador em toda a plataforma.',
      illustrationKey: 'admin-tenants',
    },
    {
      title: 'Monitorize a atividade',
      description: 'Visualize insights em tempo real sobre crescimento, engagement e transações.',
      illustrationKey: 'admin-analytics',
    },
  ],
  partner: [
    {
      title: 'Painel do Parceiro KIVARA',
      description: 'Bem-vindo ao KIVARA! Gerencie os seus programas e desafios patrocinados.',
      illustrationKey: 'partner-welcome',
      cta: 'Começar',
    },
    {
      title: 'Programas de literacia financeira',
      description: 'Crie e acompanhe programas de educação financeira para famílias e escolas.',
      illustrationKey: 'partner-programs',
    },
    {
      title: 'Desafios patrocinados',
      description: 'Lance desafios financeiros e acompanhe a participação e taxa de conclusão.',
      illustrationKey: 'partner-challenges',
    },
  ],
};
