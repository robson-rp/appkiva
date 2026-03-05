import { Child, Task, Transaction, Vault, Mission, Achievement, StoreItem, Notification, DonationCause, Donation, DiaryEntry } from '@/types/kivara';

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

export const mockDiaryEntries: DiaryEntry[] = [
  { id: 'diary-1', childId: 'child-1', text: 'Hoje poupei 30 moedas para a bicicleta! Estou quase a chegar à meta 🚲', mood: '😄', date: '2026-03-05', tags: ['poupança'] },
  { id: 'diary-2', childId: 'child-1', text: 'Queria comprar uma skin nova mas decidi esperar. Foi difícil mas sinto que fiz bem!', mood: '😊', date: '2026-03-04', tags: ['autocontrolo'] },
  { id: 'diary-3', childId: 'child-1', text: 'A mesada chegou e já guardei metade no cofre. A outra metade vou usar com cuidado.', mood: '😊', date: '2026-03-03', tags: ['planeamento'] },
  { id: 'diary-4', childId: 'child-1', text: 'Gastei mais do que devia na loja... para a próxima vou pensar melhor antes de comprar.', mood: '😔', date: '2026-03-02', tags: ['reflexão'] },
  { id: 'diary-5', childId: 'child-1', text: 'Fiz a minha primeira doação! Doei 10 moedas para o projecto de livros. Senti-me muito bem!', mood: '😄', date: '2026-03-01', tags: ['doação', 'solidariedade'] },
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
};
