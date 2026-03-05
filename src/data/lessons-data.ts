import { MicroLesson } from '@/types/kivara';

export const mockLessons: MicroLesson[] = [
  {
    id: 'lesson-1',
    title: 'O Poder da Poupança',
    description: 'Descobre porque poupar é o primeiro passo para a liberdade financeira.',
    icon: '🐷',
    category: 'saving',
    difficulty: 'beginner',
    estimatedMinutes: 3,
    kivaPointsReward: 15,
    blocks: [
      { type: 'text', content: 'Poupar não é guardar o que sobra — é separar primeiro e gastar o resto. Os melhores poupadores seguem a regra dos 3 cofres.' },
      { type: 'highlight', content: 'Regra dos 3 Cofres: divide o teu dinheiro em Gastar (50%), Poupar (30%) e Doar (20%).' },
      { type: 'tip', content: 'Mesmo que poupes apenas 1 moeda por dia, no fim do ano terás 365 moedas!', icon: '💡' },
      { type: 'example', content: 'A Maria recebe 100🪙 por mês. Poupa 30🪙 e ao fim de 6 meses já tem 180🪙 — mais juros!' },
    ],
    quiz: [
      {
        id: 'q1-1', question: 'Segundo a regra dos 3 cofres, quanto deves poupar?',
        options: [{ id: 'a', text: '10%' }, { id: 'b', text: '30%' }, { id: 'c', text: '50%' }, { id: 'd', text: '80%' }],
        correctOptionId: 'b', explanation: 'A regra recomenda poupar 30% do que recebes.',
      },
      {
        id: 'q1-2', question: 'Se poupares 2🪙 por dia, quanto terás em 30 dias?',
        options: [{ id: 'a', text: '30🪙' }, { id: 'b', text: '45🪙' }, { id: 'c', text: '60🪙' }, { id: 'd', text: '90🪙' }],
        correctOptionId: 'c', explanation: '2 × 30 = 60 moedas. Pequenos valores acumulam-se!',
      },
      {
        id: 'q1-3', question: 'Qual é a melhor estratégia de poupança?',
        options: [{ id: 'a', text: 'Guardar o que sobra no fim do mês' }, { id: 'b', text: 'Separar primeiro e gastar o resto' }, { id: 'c', text: 'Gastar tudo e pedir emprestado' }, { id: 'd', text: 'Só poupar quando for muito dinheiro' }],
        correctOptionId: 'b', explanation: 'Pagar-te a ti mesmo primeiro é a chave do sucesso financeiro!',
      },
    ],
  },
  {
    id: 'lesson-2',
    title: 'Orçamento Pessoal',
    description: 'Aprende a planear os teus gastos como um profissional.',
    icon: '📊',
    category: 'budgeting',
    difficulty: 'intermediate',
    estimatedMinutes: 5,
    kivaPointsReward: 25,
    blocks: [
      { type: 'text', content: 'Um orçamento é um plano para o teu dinheiro. Sem ele, o dinheiro desaparece sem saberes para onde foi.' },
      { type: 'highlight', content: 'Passo 1: Lista tudo o que recebes. Passo 2: Lista tudo o que gastas. Passo 3: Compara e ajusta.' },
      { type: 'tip', content: 'Divide os gastos em "Necessários" (comida, escola) e "Desejos" (jogos, doces). Primeiro os necessários!', icon: '📝' },
      { type: 'example', content: 'O João recebe 200🪙. Gasta 80🪙 em necessidades, 60🪙 em desejos e poupa 60🪙. O orçamento está equilibrado!' },
      { type: 'tip', content: 'Revê o teu orçamento todas as semanas. Ajustar é normal e saudável!', icon: '🔄' },
    ],
    quiz: [
      {
        id: 'q2-1', question: 'O que é um orçamento?',
        options: [{ id: 'a', text: 'Uma lista de compras' }, { id: 'b', text: 'Um plano para o teu dinheiro' }, { id: 'c', text: 'Uma conta bancária' }, { id: 'd', text: 'Um empréstimo' }],
        correctOptionId: 'b', explanation: 'O orçamento é o teu mapa financeiro — mostra para onde vai cada moeda.',
      },
      {
        id: 'q2-2', question: 'O que devemos pagar primeiro?',
        options: [{ id: 'a', text: 'Desejos' }, { id: 'b', text: 'Necessidades' }, { id: 'c', text: 'Presentes' }, { id: 'd', text: 'Jogos' }],
        correctOptionId: 'b', explanation: 'Necessidades vêm sempre primeiro: comida, escola, transporte.',
      },
      {
        id: 'q2-3', question: 'Com que frequência deves rever o teu orçamento?',
        options: [{ id: 'a', text: 'Uma vez por ano' }, { id: 'b', text: 'Nunca' }, { id: 'c', text: 'Todas as semanas' }, { id: 'd', text: 'Só quando acabar o dinheiro' }],
        correctOptionId: 'c', explanation: 'Rever semanalmente ajuda-te a manter o controlo!',
      },
    ],
  },
  {
    id: 'lesson-3',
    title: 'Juros: O Dinheiro que Cresce',
    description: 'Descobre como o dinheiro pode trabalhar para ti.',
    icon: '📈',
    category: 'investing',
    difficulty: 'intermediate',
    estimatedMinutes: 4,
    kivaPointsReward: 20,
    blocks: [
      { type: 'text', content: 'Quando poupas dinheiro num cofre com juros, o banco paga-te por guardares lá o dinheiro. É como plantar uma semente de dinheiro!' },
      { type: 'highlight', content: 'Juros simples: ganhas sobre o valor inicial. Juros compostos: ganhas sobre o valor inicial + juros anteriores!' },
      { type: 'example', content: '100🪙 com 2% de juros ao mês: Mês 1 = 102🪙, Mês 2 = 104.04🪙, Mês 3 = 106.12🪙. O crescimento acelera!' },
      { type: 'tip', content: 'Quanto mais cedo começares a poupar, mais tempo o dinheiro tem para crescer!', icon: '🌱' },
    ],
    quiz: [
      {
        id: 'q3-1', question: 'O que são juros?',
        options: [{ id: 'a', text: 'Uma multa por gastar muito' }, { id: 'b', text: 'Dinheiro que o banco te paga por poupares' }, { id: 'c', text: 'Um imposto sobre compras' }, { id: 'd', text: 'O preço de um produto' }],
        correctOptionId: 'b', explanation: 'Juros são a recompensa por guardares o teu dinheiro!',
      },
      {
        id: 'q3-2', question: '100🪙 com 10% de juros simples dão quanto ao fim de 1 mês?',
        options: [{ id: 'a', text: '100🪙' }, { id: 'b', text: '105🪙' }, { id: 'c', text: '110🪙' }, { id: 'd', text: '120🪙' }],
        correctOptionId: 'c', explanation: '100 + (100 × 10%) = 100 + 10 = 110🪙',
      },
    ],
  },
  {
    id: 'lesson-4',
    title: 'Necessidade vs Desejo',
    description: 'Aprende a distinguir o que precisas do que queres.',
    icon: '🤔',
    category: 'budgeting',
    difficulty: 'beginner',
    estimatedMinutes: 3,
    kivaPointsReward: 15,
    blocks: [
      { type: 'text', content: 'Antes de gastar, faz a pergunta mágica: "Preciso disto ou quero disto?" Esta simples pergunta pode poupar-te centenas de moedas.' },
      { type: 'highlight', content: 'Necessidade = o que precisas para viver (comida, roupa, escola). Desejo = o que gostas mas podes viver sem (jogos, doces, brinquedos).' },
      { type: 'tip', content: 'Regra das 24 horas: antes de comprar um desejo, espera 24 horas. Se ainda quiseres, talvez valha a pena!', icon: '⏰' },
      { type: 'example', content: 'A Sara queria uma skin nova por 50🪙. Esperou 24h e decidiu que preferia poupar para uma bicicleta. Fez a escolha certa!' },
    ],
    quiz: [
      {
        id: 'q4-1', question: 'Qual destes é uma necessidade?',
        options: [{ id: 'a', text: 'Um jogo novo' }, { id: 'b', text: 'Comida saudável' }, { id: 'c', text: 'Uma skin de avatar' }, { id: 'd', text: 'Um brinquedo' }],
        correctOptionId: 'b', explanation: 'Comida é essencial para viver — é uma necessidade!',
      },
      {
        id: 'q4-2', question: 'O que é a "Regra das 24 horas"?',
        options: [{ id: 'a', text: 'Comprar tudo em 24 horas' }, { id: 'b', text: 'Esperar 24h antes de comprar um desejo' }, { id: 'c', text: 'Poupar durante 24 horas' }, { id: 'd', text: 'Gastar tudo num dia' }],
        correctOptionId: 'b', explanation: 'Esperar 24h ajuda-te a evitar compras por impulso!',
      },
    ],
  },
  {
    id: 'lesson-5',
    title: 'O Poder de Doar',
    description: 'Descobre como partilhar pode enriquecer-te.',
    icon: '🤝',
    category: 'donating',
    difficulty: 'beginner',
    estimatedMinutes: 3,
    kivaPointsReward: 15,
    blocks: [
      { type: 'text', content: 'Doar não é perder dinheiro — é investir na comunidade. Quando ajudas outros, estás a construir um mundo melhor para todos.' },
      { type: 'highlight', content: 'Mesmo 5% do que recebes pode fazer uma grande diferença na vida de alguém!' },
      { type: 'tip', content: 'Escolhe uma causa que te importe. Quando doamos para algo que nos toca, sentimos mais alegria.', icon: '❤️' },
      { type: 'example', content: 'A turma do 4.º ano juntou 500🪙 e comprou 20 livros para uma biblioteca comunitária. Cada moeda contou!' },
    ],
    quiz: [
      {
        id: 'q5-1', question: 'Porque é importante doar?',
        options: [{ id: 'a', text: 'Para ficar famoso' }, { id: 'b', text: 'Para ajudar a comunidade e construir um mundo melhor' }, { id: 'c', text: 'Porque somos obrigados' }, { id: 'd', text: 'Para ter menos dinheiro' }],
        correctOptionId: 'b', explanation: 'Doar fortalece a comunidade e traz satisfação pessoal!',
      },
      {
        id: 'q5-2', question: 'Quanto é recomendado doar?',
        options: [{ id: 'a', text: 'Tudo' }, { id: 'b', text: 'Nada' }, { id: 'c', text: 'Pelo menos 5% do que recebes' }, { id: 'd', text: '90%' }],
        correctOptionId: 'c', explanation: 'Mesmo uma pequena percentagem pode fazer grande diferença!',
      },
    ],
  },
  {
    id: 'lesson-6',
    title: 'Empreendedorismo Jovem',
    description: 'Descobre formas criativas de ganhar as tuas próprias moedas.',
    icon: '🚀',
    category: 'earning',
    difficulty: 'advanced',
    estimatedMinutes: 5,
    kivaPointsReward: 30,
    blocks: [
      { type: 'text', content: 'Empreender é criar algo de valor e oferecer aos outros. Não precisas de ser adulto para começar!' },
      { type: 'highlight', content: 'Ideias: vender limonada, fazer pulseiras artesanais, dar explicações a colegas, cuidar de jardins, criar conteúdo digital.' },
      { type: 'tip', content: 'Primeiro passo: identifica um problema. Segundo passo: cria uma solução. Terceiro passo: oferece a quem precisa!', icon: '💡' },
      { type: 'example', content: 'O Tomás criou um serviço de passeio de cães no bairro. Ganha 20🪙 por passeio e já tem 5 clientes regulares!' },
      { type: 'tip', content: 'Reinveste parte dos lucros no teu negócio para crescer mais rápido.', icon: '📈' },
    ],
    quiz: [
      {
        id: 'q6-1', question: 'O que é empreender?',
        options: [{ id: 'a', text: 'Pedir dinheiro emprestado' }, { id: 'b', text: 'Criar algo de valor e oferecer aos outros' }, { id: 'c', text: 'Gastar dinheiro' }, { id: 'd', text: 'Trabalhar para alguém' }],
        correctOptionId: 'b', explanation: 'Empreender é resolver problemas e criar valor!',
      },
      {
        id: 'q6-2', question: 'O que deves fazer com os lucros do teu negócio?',
        options: [{ id: 'a', text: 'Gastar tudo em doces' }, { id: 'b', text: 'Reinvestir parte para crescer' }, { id: 'c', text: 'Esconder debaixo da cama' }, { id: 'd', text: 'Dar tudo aos amigos' }],
        correctOptionId: 'b', explanation: 'Reinvestir faz o negócio crescer e gera mais lucros no futuro!',
      },
      {
        id: 'q6-3', question: 'Qual é o primeiro passo para empreender?',
        options: [{ id: 'a', text: 'Pedir um empréstimo' }, { id: 'b', text: 'Identificar um problema' }, { id: 'c', text: 'Comprar material caro' }, { id: 'd', text: 'Fazer publicidade' }],
        correctOptionId: 'b', explanation: 'Todo bom negócio começa por resolver um problema real!',
      },
    ],
  },
];
