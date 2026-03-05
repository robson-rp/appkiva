import { CollectibleBadge, BadgeCategory, BadgeTier } from '@/types/kivara';

export const mockBadges: CollectibleBadge[] = [
  // ── POUPANÇA ──
  { id: 'b-s1', name: 'Primeiro Tostão', description: 'Poupaste pela primeira vez', icon: '🌱', category: 'saving', tier: 'bronze', requirement: 'Fazer o primeiro depósito num cofre', unlockedAt: '2026-02-15', childId: 'child-1' },
  { id: 'b-s2', name: 'Cofre de Ouro', description: 'Atingiste 100🪙 num cofre', icon: '🏆', category: 'saving', tier: 'silver', requirement: 'Acumular 100 moedas num único cofre', unlockedAt: '2026-03-01', childId: 'child-1' },
  { id: 'b-s3', name: 'Mestre Poupador', description: 'Poupaste 500🪙 no total', icon: '💎', category: 'saving', tier: 'gold', requirement: 'Acumular 500 moedas em poupanças totais' },
  { id: 'b-s4', name: 'Rei dos Cofres', description: 'Tens 3 cofres activos ao mesmo tempo', icon: '👑', category: 'saving', tier: 'platinum', requirement: 'Manter 3 cofres activos simultaneamente', unlockedAt: '2026-03-03', childId: 'child-1' },
  { id: 'b-s5', name: 'Poupança Consistente', description: '4 semanas seguidas a poupar', icon: '🔥', category: 'saving', tier: 'gold', requirement: 'Poupar durante 4 semanas consecutivas' },

  // ── GENEROSIDADE ──
  { id: 'b-g1', name: 'Coração Generoso', description: 'Fizeste a tua primeira doação', icon: '❤️', category: 'generosity', tier: 'bronze', requirement: 'Doar pela primeira vez', unlockedAt: '2026-03-01', childId: 'child-1' },
  { id: 'b-g2', name: 'Amigo Solidário', description: 'Doaste para 2 causas diferentes', icon: '🤝', category: 'generosity', tier: 'silver', requirement: 'Doar para 2 causas distintas', unlockedAt: '2026-03-03', childId: 'child-1' },
  { id: 'b-g3', name: 'Filantropo Júnior', description: 'Doaste 50🪙 no total', icon: '🌟', category: 'generosity', tier: 'gold', requirement: 'Acumular 50 moedas em doações' },
  { id: 'b-g4', name: 'Herói da Comunidade', description: 'Doaste para todas as causas', icon: '🦸', category: 'generosity', tier: 'platinum', requirement: 'Fazer doações para todas as causas disponíveis' },

  // ── DISCIPLINA ──
  { id: 'b-d1', name: 'Primeiro Passo', description: 'Completaste a tua primeira tarefa', icon: '👣', category: 'discipline', tier: 'bronze', requirement: 'Completar 1 tarefa', unlockedAt: '2026-02-28', childId: 'child-1' },
  { id: 'b-d2', name: 'Trabalhador Dedicado', description: '5 tarefas completas', icon: '⚡', category: 'discipline', tier: 'silver', requirement: 'Completar 5 tarefas', unlockedAt: '2026-03-02', childId: 'child-1' },
  { id: 'b-d3', name: 'Missão Cumprida', description: 'Completaste a primeira missão', icon: '🎯', category: 'discipline', tier: 'silver', requirement: 'Completar 1 missão', unlockedAt: '2026-03-02', childId: 'child-1' },
  { id: 'b-d4', name: 'Maratonista', description: '10 tarefas em 1 semana', icon: '🏃', category: 'discipline', tier: 'gold', requirement: 'Completar 10 tarefas numa única semana' },
  { id: 'b-d5', name: 'Mestre da Disciplina', description: '30 dias consecutivos activo', icon: '🏅', category: 'discipline', tier: 'platinum', requirement: 'Usar a app 30 dias seguidos' },

  // ── CONHECIMENTO ──
  { id: 'b-k1', name: 'Curioso', description: 'Completaste a primeira lição', icon: '📖', category: 'knowledge', tier: 'bronze', requirement: 'Completar 1 micro-lição' },
  { id: 'b-k2', name: 'Estudante Aplicado', description: '3 lições completas', icon: '🎓', category: 'knowledge', tier: 'silver', requirement: 'Completar 3 micro-lições' },
  { id: 'b-k3', name: 'Quiz Master', description: '100% num quiz', icon: '🧠', category: 'knowledge', tier: 'gold', requirement: 'Obter pontuação perfeita num quiz' },
  { id: 'b-k4', name: 'Sábio Financeiro', description: 'Todas as lições completas', icon: '🦉', category: 'knowledge', tier: 'platinum', requirement: 'Completar todas as micro-lições disponíveis' },
  { id: 'b-k5', name: 'Mestre do Orçamento', description: 'Completaste as lições de orçamento', icon: '📊', category: 'knowledge', tier: 'gold', requirement: 'Completar todas as lições da categoria Orçamento' },
];
