import { Child, Task, Transaction, Vault, Mission, Achievement, StoreItem, Notification, DonationCause, Donation, DiaryEntry, SpendingLimit, AllowanceConfig, SharedGoal, BehavioralInsight, DreamVaultItem, ParentReward, Teacher, Classroom, CollectiveChallenge, ClassLeaderboard, Teen } from '@/types/kivara';

export const mockChildren: Child[] = [
  {
    id: 'child-1',
    name: 'Ana',
    username: 'ana_star',
    pin: '1234',
    avatar: '🦊',
    parentId: 'parent-1',
    familyId: 'family-1',
    balance: 285,
    kivaPoints: 180,
    level: 'saver',
    weeklyAllowance: 50,
  },
  {
    id: 'child-2',
    name: 'Pedro',
    username: 'pedro_hero',
    pin: '5678',
    avatar: '🐻',
    parentId: 'parent-1',
    familyId: 'family-1',
    balance: 120,
    kivaPoints: 75,
    level: 'apprentice',
    weeklyAllowance: 30,
  },
];

export const mockTeens: Teen[] = [
  {
    id: 'teen-1',
    name: 'Lucas',
    username: 'lucas_pro',
    pin: '9999',
    avatar: '🧑‍💻',
    parentId: 'parent-1',
    familyId: 'family-1',
    balance: 780,
    kivaPoints: 420,
    level: 'planner',
    weeklyAllowance: 120,
    weeklySpendLimit: 200,
    spendingCategories: ['food', 'entertainment', 'education', 'transport', 'clothing', 'tech'],
    monthlyBudget: 500,
  },
];

export const mockTeenTransactions: Transaction[] = [
  { id: 'ttx-1', childId: 'teen-1', amount: 120, type: 'allowance', description: 'Mesada semanal', date: '2026-03-03', category: 'other' },
  { id: 'ttx-2', childId: 'teen-1', amount: 35, type: 'spent', description: 'Almoço com amigos', date: '2026-03-04', category: 'food' },
  { id: 'ttx-3', childId: 'teen-1', amount: 25, type: 'spent', description: 'Spotify Premium', date: '2026-03-03', category: 'entertainment' },
  { id: 'ttx-4', childId: 'teen-1', amount: 50, type: 'saved', description: 'Cofre: Portátil novo', date: '2026-03-04', category: 'tech' },
  { id: 'ttx-5', childId: 'teen-1', amount: 40, type: 'earned', description: 'Tarefa: Organizar garagem', date: '2026-03-02' },
  { id: 'ttx-6', childId: 'teen-1', amount: 15, type: 'spent', description: 'Passe de autocarro', date: '2026-03-05', category: 'transport' },
  { id: 'ttx-7', childId: 'teen-1', amount: 20, type: 'spent', description: 'Livro de programação', date: '2026-03-01', category: 'education' },
  { id: 'ttx-8', childId: 'teen-1', amount: 45, type: 'spent', description: 'T-shirt nova', date: '2026-02-28', category: 'clothing' },
  { id: 'ttx-9', childId: 'teen-1', amount: 100, type: 'saved', description: 'Cofre: Portátil novo', date: '2026-02-27', category: 'tech' },
  { id: 'ttx-10', childId: 'teen-1', amount: 30, type: 'donated', description: 'Doação: Livros para Todos', date: '2026-03-01' },
];
export const mockTasks: Task[] = [
  { id: 'task-1', title: 'Arrumar o quarto', description: 'Organizar a cama, brinquedos e secretária', reward: 20, category: 'cleaning', status: 'pending', childId: 'child-1', parentId: 'parent-1', createdAt: '2026-03-01' },
  { id: 'task-2', title: 'Lavar a loiça', description: 'Lavar e secar os pratos do jantar', reward: 15, category: 'cleaning', status: 'completed', childId: 'child-1', parentId: 'parent-1', createdAt: '2026-03-02', completedAt: '2026-03-02' },
  { id: 'task-3', title: 'Estudar matemática', description: 'Completar os exercícios do capítulo 5', reward: 30, category: 'studying', status: 'in_progress', childId: 'child-1', parentId: 'parent-1', createdAt: '2026-03-03' },
  { id: 'task-4', title: 'Ajudar na cozinha', description: 'Ajudar a preparar o jantar', reward: 25, category: 'helping', status: 'pending', childId: 'child-2', parentId: 'parent-1', createdAt: '2026-03-01' },
  { id: 'task-5', title: 'Ler 30 minutos', description: 'Ler um livro durante 30 minutos', reward: 20, category: 'studying', status: 'approved', childId: 'child-2', parentId: 'parent-1', createdAt: '2026-02-28', completedAt: '2026-02-28' },
];

export const mockTransactions: Transaction[] = [
  { id: 'tx-1', childId: 'child-1', amount: 50, type: 'allowance', description: 'Mesada semanal', date: '2026-03-01' },
  { id: 'tx-2', childId: 'child-1', amount: 20, type: 'earned', description: 'Tarefa: Arrumar o quarto', date: '2026-03-02' },
  { id: 'tx-3', childId: 'child-1', amount: 30, type: 'saved', description: 'Cofre: Bicicleta nova', date: '2026-03-02' },
  { id: 'tx-4', childId: 'child-1', amount: 15, type: 'spent', description: 'Loja: Skin de astronauta', date: '2026-03-03' },
  { id: 'tx-5', childId: 'child-2', amount: 30, type: 'allowance', description: 'Mesada semanal', date: '2026-03-01' },
  { id: 'tx-6', childId: 'child-2', amount: 20, type: 'earned', description: 'Tarefa: Ler 30 minutos', date: '2026-02-28' },
];

export const mockVaults: Vault[] = [
  { id: 'vault-1', childId: 'child-1', name: 'Bicicleta nova', targetAmount: 500, currentAmount: 180, icon: '🚲', createdAt: '2026-02-15', interestRate: 1 },
  { id: 'vault-2', childId: 'child-1', name: 'Jogo de vídeo', targetAmount: 200, currentAmount: 85, icon: '🎮', createdAt: '2026-02-20', interestRate: 1.5 },
  { id: 'vault-3', childId: 'child-2', name: 'Bola de futebol', targetAmount: 150, currentAmount: 40, icon: '⚽', createdAt: '2026-03-01', interestRate: 1 },
];

export const mockDonationCauses: DonationCause[] = [
  { id: 'cause-1', name: 'Livros para Todos', description: 'Ajuda a comprar livros para crianças sem acesso', icon: '📚', category: 'education', totalReceived: 450 },
  { id: 'cause-2', name: 'Refeições Solidárias', description: 'Contribui para refeições em comunidades carenciadas', icon: '🍽️', category: 'solidarity', totalReceived: 780 },
  { id: 'cause-3', name: 'Plantar Árvores', description: 'Ajuda a plantar árvores na tua comunidade', icon: '🌳', category: 'environment', totalReceived: 320 },
  { id: 'cause-4', name: 'Material Escolar', description: 'Doa material escolar a quem precisa', icon: '✏️', category: 'education', totalReceived: 560 },
];

export const mockDonations: Donation[] = [
  { id: 'don-1', childId: 'child-1', causeId: 'cause-1', amount: 10, date: '2026-03-01' },
  { id: 'don-2', childId: 'child-1', causeId: 'cause-3', amount: 5, date: '2026-03-03' },
];

export const mockMissions: Mission[] = [
  { id: 'mission-1', title: 'Poupança Inteligente', description: 'Guarda 50 moedas no teu cofre esta semana', type: 'saving', targetAmount: 50, reward: 25, kivaPointsReward: 20, status: 'available', week: 10 },
  { id: 'mission-2', title: 'Orçamento Mestre', description: 'Recebes 100 moedas. Planeia como gastar sabiamente!', type: 'budgeting', targetAmount: 100, reward: 30, kivaPointsReward: 25, status: 'in_progress', childId: 'child-1', week: 10 },
  { id: 'mission-3', title: 'Planeamento Familiar', description: 'Cria um plano de poupança para 2 semanas', type: 'planning', reward: 40, kivaPointsReward: 35, status: 'completed', childId: 'child-1', week: 9 },
];

export const mockAchievements: Achievement[] = [
  { id: 'ach-1', title: 'Primeira Poupança', description: 'Guardaste moedas pela primeira vez!', icon: '🏆', unlockedAt: '2026-02-15', childId: 'child-1' },
  { id: 'ach-2', title: '10 Tarefas Completas', description: 'Completaste 10 tarefas!', icon: '⭐', unlockedAt: '2026-03-01', childId: 'child-1' },
  { id: 'ach-3', title: 'Missão Cumprida', description: 'Completaste a tua primeira missão', icon: '🎯', unlockedAt: '2026-03-02', childId: 'child-1' },
  { id: 'ach-4', title: 'Super Poupador', description: 'Poupaste mais de 100 moedas', icon: '💎' },
  { id: 'ach-5', title: 'Mestre das Tarefas', description: 'Completa 50 tarefas', icon: '🌟' },
];

export const mockStoreItems: StoreItem[] = [
  { id: 'item-1', name: 'Skin Astronauta', description: 'Avatar espacial para o teu perfil', price: 50, category: 'avatar', image: '👨‍🚀' },
  { id: 'item-2', name: 'Chapéu Mágico', description: 'Um chapéu especial para o teu avatar', price: 30, category: 'accessory', image: '🎩' },
  { id: 'item-3', name: 'Medalha de Ouro', description: 'Mostra que és o melhor!', price: 75, category: 'badge', image: '🥇' },
  { id: 'item-4', name: 'Skin Pirata', description: 'Avatar de pirata aventureiro', price: 45, category: 'avatar', image: '🏴‍☠️' },
  { id: 'item-5', name: 'Óculos de Sol', description: 'Acessório estiloso', price: 20, category: 'accessory', image: '😎' },
  { id: 'item-6', name: 'Sticker Pack', description: 'Pack de stickers digitais', price: 15, category: 'digital', image: '🎨' },
];

export const mockNotifications: Notification[] = [
  { id: 'notif-1', title: 'Tarefa aprovada!', message: 'A tarefa "Ler 30 minutos" foi aprovada. +20 coins!', type: 'task', read: false, date: '2026-03-05' },
  { id: 'notif-2', title: 'Nova missão disponível!', message: 'A missão "Poupança Inteligente" está disponível esta semana.', type: 'mission', read: false, date: '2026-03-04' },
  { id: 'notif-3', title: 'Conquista desbloqueada!', message: 'Parabéns! Desbloqueaste "10 Tarefas Completas"!', type: 'achievement', read: true, date: '2026-03-01' },
];

export const mockTeacherNotifications: Notification[] = [
  { id: 'tnotif-1', title: '🎯 Desafio quase concluído!', message: '"Operação Mealheiro" atingiu 62% — a turma está a progredir bem!', type: 'class', read: false, date: '2026-03-05' },
  { id: 'tnotif-2', title: '📝 Tarefas pendentes', message: '3 alunos da Turma dos Exploradores têm tarefas por avaliar.', type: 'task', read: false, date: '2026-03-05' },
  { id: 'tnotif-3', title: '🏆 Nova conquista na turma!', message: 'Sofia desbloqueou "Guardador de Ouro" — a primeira da turma!', type: 'achievement', read: false, date: '2026-03-04' },
  { id: 'tnotif-4', title: '📊 Relatório semanal', message: 'A Turma dos Exploradores poupou 420 KivaCoins esta semana. +15% vs semana anterior.', type: 'savings', read: true, date: '2026-03-03' },
  { id: 'tnotif-5', title: '🆕 Desafio a iniciar', message: '"Desafio do Orçamento" começa em 5 dias. 0 inscrições até agora.', type: 'class', read: true, date: '2026-03-02' },
];

export const mockDiaryEntries: DiaryEntry[] = [
  { id: 'diary-1', childId: 'child-1', text: 'Hoje poupei 30 moedas para a bicicleta! Estou quase a chegar à meta 🚲', mood: '😄', date: '2026-03-05', tags: ['poupança'] },
  { id: 'diary-2', childId: 'child-1', text: 'Queria comprar uma skin nova mas decidi esperar. Foi difícil mas sinto que fiz bem!', mood: '😊', date: '2026-03-04', tags: ['autocontrolo'] },
  { id: 'diary-3', childId: 'child-1', text: 'A mesada chegou e já guardei metade no cofre. A outra metade vou usar com cuidado.', mood: '😊', date: '2026-03-03', tags: ['planeamento'] },
  { id: 'diary-4', childId: 'child-1', text: 'Gastei mais do que devia na loja... para a próxima vou pensar melhor antes de comprar.', mood: '😔', date: '2026-03-02', tags: ['reflexão'] },
  { id: 'diary-5', childId: 'child-1', text: 'Fiz a minha primeira doação! Doei 10 moedas para o projecto de livros. Senti-me muito bem!', mood: '😄', date: '2026-03-01', tags: ['doação', 'solidariedade'] },
];

export const mockSpendingLimits: SpendingLimit[] = [
  { childId: 'child-1', weeklySpendLimit: 40, minSavingsPercent: 30, purchaseBlockEnabled: false },
  { childId: 'child-2', weeklySpendLimit: 25, minSavingsPercent: 20, purchaseBlockEnabled: true },
];

export const mockAllowanceConfigs: AllowanceConfig[] = [
  { childId: 'child-1', baseAmount: 50, frequency: 'weekly', taskBonus: 5, missionBonus: 10, lastSent: '2026-03-01' },
  { childId: 'child-2', baseAmount: 30, frequency: 'weekly', taskBonus: 3, missionBonus: 8, lastSent: '2026-03-01' },
];

export const mockSharedGoals: SharedGoal[] = [
  { id: 'goal-1', name: 'Bicicleta nova', icon: '🚲', targetAmount: 500, parentContribution: 200, childContribution: 180, childId: 'child-1', createdAt: '2026-02-15' },
  { id: 'goal-2', name: 'Viagem ao Parque Aquático', icon: '🎢', targetAmount: 300, parentContribution: 100, childContribution: 50, childId: 'child-2', createdAt: '2026-03-01' },
];

export const mockInsights: BehavioralInsight[] = [
  { id: 'ins-1', childId: 'child-1', type: 'positive', title: 'Excelente poupadora!', description: 'A Ana poupou 43% das moedas ganhas este mês — acima da média familiar.', metric: '43%', trend: 'up' },
  { id: 'ins-2', childId: 'child-1', type: 'neutral', title: 'Gastos estáveis', description: 'Os gastos da Ana mantêm-se consistentes nas últimas 4 semanas.', metric: '15/sem', trend: 'stable' },
  { id: 'ins-3', childId: 'child-2', type: 'warning', title: 'Poupança em queda', description: 'O Pedro poupou apenas 12% esta semana — abaixo do mínimo recomendado de 20%.', metric: '12%', trend: 'down' },
  { id: 'ins-4', childId: 'child-2', type: 'positive', title: 'Tarefas em alta', description: 'O Pedro completou 3 tarefas esta semana — o melhor resultado do mês!', metric: '3 tarefas', trend: 'up' },
  { id: 'ins-5', childId: 'child-1', type: 'warning', title: 'Compra impulsiva detectada', description: 'A Ana gastou 15 moedas logo após receber a mesada. Pode beneficiar de um período de espera.', trend: 'down' },
];

export const KIVO_TIPS: Record<string, string[]> = {
  dashboard: [
    'Olá! Eu sou o Kivo! 🐿️ Bem-vindo à tua página principal!',
    'Sabias que poupar um pouco todos os dias faz uma grande diferença?',
    'Tens tarefas pendentes! Completa-as para ganhar moedas! 💰',
  ],
  wallet: [
    'A tua carteira mostra todo o teu dinheiro virtual! 💰',
    'Tenta poupar pelo menos 30% do que ganhas!',
    'Cada moeda conta! Os grandes poupadores começam com pouco.',
  ],
  missions: [
    'As missões ajudam-te a aprender sobre dinheiro! 🎯',
    'Completa missões para ganhar KivaPoints extra!',
    'Esta semana tens uma missão especial de poupança!',
  ],
  vaults: [
    'Os cofres são como mealheiros digitais! 🏦',
    'Define uma meta e poupa um pouco todos os dias!',
    'Estás a ir muito bem com as tuas poupanças! Continua!',
  ],
  store: [
    'Gasta as tuas moedas com sabedoria na loja! 🛍️',
    'Antes de comprar, pergunta: preciso mesmo disto?',
    'Itens especiais aparecem de vez em quando. Fica atento!',
  ],
  achievements: [
    'As conquistas mostram o quanto já aprendeste! 🏆',
    'Cada badge conta uma história do teu progresso!',
    'Continua a completar tarefas para desbloquear mais!',
  ],
  diary: [
    'Escrever sobre o teu dia ajuda-te a perceber como usas o dinheiro! 📝',
    'Reflectir é o primeiro passo para tomar melhores decisões!',
    'Tenta escrever todos os dias para manter a tua sequência! 🔥',
  ],
  dreams: [
    'O Cofre dos Sonhos guarda os teus maiores desejos! ✨',
    'Adiciona imagens e descrições para te manteres motivado!',
    'Os teus pais podem deixar mensagens de encorajamento! 💬',
  ],
};

export const mockDreamVaults: DreamVaultItem[] = [
  {
    id: 'dream-1',
    childId: 'child-1',
    title: 'Ir à Disneylândia',
    description: 'O meu sonho é visitar a Disneylândia com a família! Quero ver o castelo e andar nas montanhas-russas.',
    icon: '🏰',
    targetAmount: 1000,
    currentAmount: 320,
    priority: 'high',
    parentComments: [
      { id: 'pc-1', text: 'Adoramos este sonho! Continua a poupar e vamos ajudar-te! 💪', date: '2026-03-03', emoji: '❤️' },
      { id: 'pc-2', text: 'Já poupaste muito! Estamos orgulhosos de ti.', date: '2026-03-05', emoji: '🌟' },
    ],
    createdAt: '2026-02-01',
  },
  {
    id: 'dream-2',
    childId: 'child-1',
    title: 'Tablet para desenhar',
    description: 'Quero um tablet para praticar desenho digital e criar as minhas próprias histórias.',
    icon: '🎨',
    targetAmount: 400,
    currentAmount: 150,
    priority: 'medium',
    parentComments: [
      { id: 'pc-3', text: 'Que bom objectivo criativo! Se chegares a 50%, complementamos o resto.', date: '2026-03-02', emoji: '🎯' },
    ],
    createdAt: '2026-02-20',
  },
  {
    id: 'dream-3',
    childId: 'child-2',
    title: 'Equipamento de futebol',
    description: 'Botas novas e uma camisola do meu jogador favorito!',
    icon: '⚽',
    targetAmount: 250,
    currentAmount: 60,
    priority: 'high',
    parentComments: [
      { id: 'pc-4', text: 'Boa escolha! Vamos acompanhar o teu progresso.', date: '2026-03-04', emoji: '💪' },
    ],
    createdAt: '2026-03-01',
  },
];

export const mockParentRewards: ParentReward[] = [
  { id: 'pr-1', name: 'Noite de cinema em família', description: 'Escolhe o filme e os snacks para uma sessão especial!', price: 100, icon: '🎬', category: 'experience', createdBy: 'parent-1', available: true },
  { id: 'pr-2', name: 'Deitar 30min mais tarde', description: 'Podes ficar acordado mais 30 minutos numa noite à escolha', price: 50, icon: '🌙', category: 'privilege', createdBy: 'parent-1', available: true },
  { id: 'pr-3', name: 'Escolher o jantar', description: 'Tu decides o que a família vai jantar!', price: 40, icon: '🍕', category: 'privilege', createdBy: 'parent-1', available: true },
  { id: 'pr-4', name: 'Passeio ao parque aquático', description: 'Um dia especial no parque aquático com a família', price: 200, icon: '🎢', category: 'experience', createdBy: 'parent-1', available: true },
  { id: 'pr-5', name: 'Livro à escolha', description: 'Escolhe um livro novo da livraria', price: 60, icon: '📖', category: 'physical', createdBy: 'parent-1', available: true },
  { id: 'pr-6', name: 'Hora extra de ecrã', description: 'Uma hora adicional de tablet ou TV', price: 35, icon: '📱', category: 'privilege', createdBy: 'parent-1', available: true },
];

export const mockTeachers: Teacher[] = [
  { id: 'teacher-1', name: 'Prof. Carlos Mendes', email: 'carlos@escola.mz', school: 'Escola Primária Sol Nascente', avatar: '👨‍🏫' },
];

export const mockClassrooms: Classroom[] = [
  { id: 'class-1', name: 'Turma dos Exploradores', teacherId: 'teacher-1', grade: '4.º Ano', studentIds: ['child-1', 'child-2'], icon: '🧭', createdAt: '2026-02-01' },
  { id: 'class-2', name: 'Turma dos Inventores', teacherId: 'teacher-1', grade: '5.º Ano', studentIds: ['child-1'], icon: '💡', createdAt: '2026-02-15' },
];

export const mockChallenges: CollectiveChallenge[] = [
  {
    id: 'ch-1', title: 'Operação Mealheiro', description: 'Juntos, a turma deve poupar 1000 KivaCoins esta semana!',
    classroomId: 'class-1', icon: '🐷', type: 'saving', targetAmount: 1000, currentAmount: 620,
    status: 'active', participants: [{ childId: 'child-1', contribution: 380 }, { childId: 'child-2', contribution: 240 }],
    reward: 50, kivaPointsReward: 30, startDate: '2026-03-03', endDate: '2026-03-10',
  },
  {
    id: 'ch-2', title: 'Desafio do Orçamento', description: 'Cada aluno recebe 200 moedas virtuais. Quem gere melhor ganha!',
    classroomId: 'class-1', icon: '📊', type: 'budgeting', targetAmount: 200, currentAmount: 0,
    status: 'upcoming', participants: [], reward: 40, kivaPointsReward: 25, startDate: '2026-03-10', endDate: '2026-03-17',
  },
  {
    id: 'ch-3', title: 'Feira Solidária', description: 'A turma organiza uma feira virtual. Objectivo: angariar 500 moedas para doação.',
    classroomId: 'class-2', icon: '🤝', type: 'teamwork', targetAmount: 500, currentAmount: 500,
    status: 'completed', participants: [{ childId: 'child-1', contribution: 500 }],
    reward: 60, kivaPointsReward: 40, startDate: '2026-02-24', endDate: '2026-03-03',
  },
];

export const mockLeaderboard: ClassLeaderboard[] = [
  { childId: 'child-1', name: 'Ana', avatar: '🦊', kivaPoints: 180, tasksCompleted: 12, savingsRate: 43 },
  { childId: 'child-2', name: 'Pedro', avatar: '🐻', kivaPoints: 75, tasksCompleted: 8, savingsRate: 22 },
  { childId: 'child-3', name: 'Sofia', avatar: '🐱', kivaPoints: 210, tasksCompleted: 15, savingsRate: 55 },
  { childId: 'child-4', name: 'Tomás', avatar: '🐶', kivaPoints: 95, tasksCompleted: 6, savingsRate: 30 },
  { childId: 'child-5', name: 'Inês', avatar: '🦋', kivaPoints: 160, tasksCompleted: 11, savingsRate: 48 },
];
