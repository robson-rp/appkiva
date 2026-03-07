
-- Create onboarding_steps table
CREATE TABLE public.onboarding_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL,
  step_index integer NOT NULL DEFAULT 0,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  illustration_key text NOT NULL DEFAULT '',
  cta text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (role, step_index)
);

-- Enable RLS
ALTER TABLE public.onboarding_steps ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage onboarding steps"
  ON public.onboarding_steps FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Authenticated users can read active steps
CREATE POLICY "Authenticated users can view active steps"
  ON public.onboarding_steps FOR SELECT TO authenticated
  USING (is_active = true);

-- updated_at trigger
CREATE TRIGGER set_updated_at_onboarding_steps
  BEFORE UPDATE ON public.onboarding_steps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed with hardcoded data
INSERT INTO public.onboarding_steps (role, step_index, title, description, illustration_key, cta) VALUES
  ('parent', 0, 'Bem-vindo ao KIVARA', 'O KIVARA ajuda os seus filhos a aprender a poupar, planear e tomar decisões financeiras inteligentes através de missões divertidas e desafios práticos.', 'parent-welcome', 'Explorar a plataforma'),
  ('parent', 1, 'Transforme tarefas em lições financeiras', 'Crie tarefas e recompensas para ensinar responsabilidade e gestão de dinheiro de forma divertida e prática.', 'parent-tasks', NULL),
  ('parent', 2, 'Acompanhe o crescimento financeiro', 'Veja o progresso de poupança, missões concluídas e hábitos financeiros em tempo real.', 'parent-dashboard', NULL),
  ('parent', 3, 'Ajude a poupar para os sonhos', 'Crie metas de poupança e veja os seus filhos a desenvolver disciplina e paciência.', 'parent-savings', NULL),
  ('child', 0, 'Olá! Eu sou o Kivo! 🦊', 'Vou ajudar-te a tornar um mestre do dinheiro completando missões e aprendendo a poupar moedas!', 'child-kivo', 'Vamos começar!'),
  ('child', 1, 'Ganha moedas com missões', 'Completa tarefas, desafios e lições para ganhar moedas e subir de nível!', 'child-coins', NULL),
  ('child', 2, 'Poupa para o que mais queres', 'Cria uma meta de poupança e vê as tuas moedas a crescer ao longo do tempo!', 'child-dreams', NULL),
  ('child', 3, 'Desbloqueia conquistas', 'Ganha medalhas e prémios por aprender sobre dinheiro e fazer escolhas inteligentes!', 'child-achievements', NULL),
  ('teen', 0, 'As tuas finanças, o teu controlo 🚀', 'O KIVARA dá-te ferramentas reais para gerir o teu dinheiro, acompanhar gastos e tomar decisões financeiras inteligentes.', 'teen-welcome', 'Começar'),
  ('teen', 1, 'Controla o teu orçamento', 'Vê para onde vai o teu dinheiro, analisa categorias de gastos e mantém-te dentro dos limites.', 'teen-budget', NULL),
  ('teen', 2, 'Investe nos teus objetivos', 'Cria cofres com juros simulados e aprende o poder dos juros compostos para atingir as tuas metas.', 'teen-invest', NULL),
  ('teen', 3, 'Evolui e desbloqueia níveis', 'Completa missões financeiras, mantém streaks e sobe no ranking para provar a tua literacia financeira.', 'teen-level-up', NULL),
  ('teacher', 0, 'Educação financeira na sala de aula', 'O KIVARA ajuda professores a introduzir literacia financeira de forma divertida e envolvente.', 'teacher-classroom', 'Explorar'),
  ('teacher', 1, 'Gerir alunos e progresso', 'Acompanhe a atividade dos alunos, desafios e conquistas de aprendizagem.', 'teacher-manage', NULL),
  ('teacher', 2, 'Crie desafios financeiros', 'Crie competições entre turmas para motivar os alunos a aprender e poupar.', 'teacher-challenges', NULL),
  ('admin', 0, 'Consola de Administração KIVARA', 'Gerencie todo o ecossistema KIVARA incluindo famílias, escolas e parceiros.', 'admin-overview', 'Aceder'),
  ('admin', 1, 'Gestão multi-tenant', 'Controle tenants, subscrições e papéis de utilizador em toda a plataforma.', 'admin-tenants', NULL),
  ('admin', 2, 'Monitorize a atividade', 'Visualize insights em tempo real sobre crescimento, engagement e transações.', 'admin-analytics', NULL),
  ('partner', 0, 'Painel do Parceiro KIVARA', 'Bem-vindo ao KIVARA! Gerencie os seus programas e desafios patrocinados.', 'partner-welcome', 'Começar'),
  ('partner', 1, 'Programas de literacia financeira', 'Crie e acompanhe programas de educação financeira para famílias e escolas.', 'partner-programs', NULL),
  ('partner', 2, 'Desafios patrocinados', 'Lance desafios financeiros e acompanhe a participação e taxa de conclusão.', 'partner-challenges', NULL);
