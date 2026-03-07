import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MicroLesson, DIFFICULTY_CONFIG } from '@/types/kivara';
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, Sparkles, BookOpen, Lightbulb, Star, Zap, Image, Play, Volume2, Loader2, Square, Headphones } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LessonViewerProps {
  lesson: MicroLesson;
  onComplete: (score: number) => void;
  onBack: () => void;
}

type Phase = 'reading' | 'quiz' | 'results';

export function LessonViewer({ lesson, onComplete, onBack }: LessonViewerProps) {
  const [phase, setPhase] = useState<Phase>('reading');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [blockIndex, setBlockIndex] = useState(0);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsPlaying, setTtsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const totalBlocks = lesson.blocks.length;
  const totalQuestions = lesson.quiz.length;
  const question = lesson.quiz[currentQuestion];
  const isCorrect = selectedOption === question?.correctOptionId;
  const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const passed = score >= 60;

  const handleAnswer = (optionId: string) => {
    if (answered) return;
    setSelectedOption(optionId);
    setAnswered(true);
    if (optionId === question.correctOptionId) {
      setCorrectCount(c => c + 1);
    }
  };

  const handleNext = () => {
    if (phase === 'reading') {
      if (blockIndex < totalBlocks - 1) {
        setBlockIndex(b => b + 1);
      } else {
        setPhase('quiz');
      }
    } else if (phase === 'quiz') {
      if (currentQuestion < totalQuestions - 1) {
        setCurrentQuestion(c => c + 1);
        setSelectedOption(null);
        setAnswered(false);
      } else {
        setPhase('results');
      }
    }
  };

  const stopTts = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setTtsPlaying(false);
  }, []);

  const playTts = useCallback(async () => {
    if (ttsPlaying) {
      stopTts();
      return;
    }

    // Gather text from all text-like blocks
    const textContent = lesson.blocks
      .filter(b => ['text', 'tip', 'example', 'highlight'].includes(b.type))
      .map(b => b.content)
      .join('\n\n');

    if (!textContent.trim()) {
      toast({ title: 'Sem conteúdo de texto para narrar', variant: 'destructive' });
      return;
    }

    setTtsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text: textContent }),
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(err.error || `Erro ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setTtsPlaying(false);
        audioRef.current = null;
      };

      setTtsPlaying(true);
      await audio.play();
    } catch (e) {
      console.error('TTS error:', e);
      toast({
        title: 'Erro ao gerar áudio',
        description: e instanceof Error ? e.message : 'Tenta novamente',
        variant: 'destructive',
      });
    } finally {
      setTtsLoading(false);
    }
  }, [lesson.blocks, ttsPlaying, stopTts, toast]);

  const blockIcons: Record<string, typeof BookOpen> = {
    text: BookOpen,
    tip: Lightbulb,
    example: Star,
    highlight: Zap,
    image: Image,
    video: Play,
    audio: Headphones,
  };

  const blockColors: Record<string, string> = {
    text: 'bg-muted/50 border-border/50',
    tip: 'bg-chart-2/10 border-chart-2/30',
    example: 'bg-chart-4/10 border-chart-4/30',
    highlight: 'bg-primary/10 border-primary/30',
    image: 'bg-muted/30 border-border/50',
    video: 'bg-primary/5 border-primary/20',
    audio: 'bg-chart-5/10 border-chart-5/30',
  };

  const blockLabels: Record<string, string> = {
    text: 'Conteúdo',
    tip: 'Dica',
    example: 'Exemplo',
    highlight: 'Destaque',
    image: 'Imagem',
    video: 'Vídeo',
    audio: 'Áudio',
  };

  const renderBlockContent = (block: any) => {
    const Icon = blockIcons[block.type] || BookOpen;

    if (block.type === 'audio') {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-chart-5 shrink-0" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Áudio</span>
          </div>
          <div className="rounded-xl bg-muted/50 p-3">
            <audio
              controls
              src={block.content}
              className="w-full h-10"
              preload="metadata"
            />
          </div>
          {block.caption && <p className="text-xs text-muted-foreground italic text-center">{block.caption}</p>}
        </div>
      );
    }

    if (block.type === 'image') {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary shrink-0" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Imagem</span>
          </div>
          <img
            src={block.content}
            alt={block.caption || 'Ilustração da lição'}
            className="w-full rounded-xl object-cover max-h-64"
            loading="lazy"
          />
          {block.caption && <p className="text-xs text-muted-foreground italic text-center">{block.caption}</p>}
        </div>
      );
    }

    if (block.type === 'video') {
      const videoId = extractYouTubeId(block.content);
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary shrink-0" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Vídeo</span>
          </div>
          {videoId ? (
            <div className="aspect-video rounded-xl overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title={block.caption || 'Vídeo educativo'}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <a href={block.content} target="_blank" rel="noopener noreferrer"
               className="block p-4 rounded-xl bg-primary/10 text-primary text-sm font-medium text-center hover:bg-primary/20 transition-colors">
              ▶️ Abrir vídeo
            </a>
          )}
          {block.caption && <p className="text-xs text-muted-foreground italic text-center">{block.caption}</p>}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary shrink-0" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {blockLabels[block.type] || 'Conteúdo'}
          </span>
        </div>
        <p className="text-sm text-foreground leading-relaxed">{block.content}</p>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => { stopTts(); onBack(); }} className="rounded-xl shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="font-display font-bold text-foreground truncate">{lesson.icon} {lesson.title}</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge className={`text-[10px] ${DIFFICULTY_CONFIG[lesson.difficulty].color} border-0`}>
              {DIFFICULTY_CONFIG[lesson.difficulty].label}
            </Badge>
            <span className="text-[10px] text-muted-foreground">
              {phase === 'reading' ? `${blockIndex + 1}/${totalBlocks} blocos` : phase === 'quiz' ? `Pergunta ${currentQuestion + 1}/${totalQuestions}` : 'Resultados'}
            </span>
          </div>
        </div>
        {/* TTS Button */}
        <Button
          variant="outline"
          size="icon"
          className="rounded-xl shrink-0"
          onClick={playTts}
          disabled={ttsLoading}
          title={ttsPlaying ? 'Parar narração' : 'Ouvir lição'}
        >
          {ttsLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : ttsPlaying ? (
            <Square className="h-4 w-4 fill-current" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Progress */}
      <Progress
        value={
          phase === 'reading'
            ? ((blockIndex + 1) / totalBlocks) * 50
            : phase === 'quiz'
            ? 50 + ((currentQuestion + (answered ? 1 : 0)) / totalQuestions) * 50
            : 100
        }
        className="h-2"
      />

      <AnimatePresence mode="wait">
        {/* READING PHASE */}
        {phase === 'reading' && (
          <motion.div
            key={`block-${blockIndex}`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            <Card className={`border ${blockColors[lesson.blocks[blockIndex].type] || blockColors.text}`}>
              <CardContent className="p-5">
                {renderBlockContent(lesson.blocks[blockIndex])}
              </CardContent>
            </Card>

            <Button onClick={handleNext} className="w-full mt-4 rounded-xl gap-2">
              {blockIndex < totalBlocks - 1 ? 'Continuar' : 'Iniciar Quiz'} <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        )}

        {/* QUIZ PHASE */}
        {phase === 'quiz' && question && (
          <motion.div
            key={`q-${currentQuestion}`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <Card className="border-border/50">
              <CardContent className="p-5">
                <p className="font-display font-bold text-foreground mb-1">Pergunta {currentQuestion + 1}</p>
                <p className="text-sm text-foreground">{question.question}</p>
              </CardContent>
            </Card>

            <div className="space-y-2">
              {question.options.map((opt) => {
                const isSelected = selectedOption === opt.id;
                const isRight = opt.id === question.correctOptionId;
                let style = 'border-border/50 hover:border-primary/50 hover:bg-primary/5';
                if (answered) {
                  if (isRight) style = 'border-chart-3 bg-chart-3/10';
                  else if (isSelected && !isRight) style = 'border-destructive bg-destructive/10';
                  else style = 'border-border/30 opacity-60';
                } else if (isSelected) {
                  style = 'border-primary bg-primary/10';
                }
                return (
                  <motion.button
                    key={opt.id}
                    whileTap={!answered ? { scale: 0.98 } : undefined}
                    onClick={() => handleAnswer(opt.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${style}`}
                    disabled={answered}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      answered && isRight ? 'bg-chart-3 text-white' : answered && isSelected ? 'bg-destructive text-white' : 'bg-muted text-muted-foreground'
                    }`}>
                      {answered && isRight ? <CheckCircle className="h-4 w-4" /> : answered && isSelected ? <XCircle className="h-4 w-4" /> : opt.id.toUpperCase()}
                    </div>
                    <span className="text-sm text-foreground">{opt.text}</span>
                  </motion.button>
                );
              })}
            </div>

            {answered && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className={`border ${isCorrect ? 'border-chart-3/50 bg-chart-3/5' : 'border-chart-1/50 bg-chart-1/5'}`}>
                  <CardContent className="p-4 flex items-start gap-3">
                    {isCorrect ? <CheckCircle className="h-5 w-5 text-chart-3 shrink-0 mt-0.5" /> : <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />}
                    <div>
                      <p className={`text-sm font-bold ${isCorrect ? 'text-chart-3' : 'text-destructive'}`}>
                        {isCorrect ? 'Correcto! 🎉' : 'Não foi desta vez'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{question.explanation}</p>
                    </div>
                  </CardContent>
                </Card>
                <Button onClick={handleNext} className="w-full mt-3 rounded-xl gap-2">
                  {currentQuestion < totalQuestions - 1 ? 'Próxima pergunta' : 'Ver resultados'} <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* RESULTS PHASE */}
        {phase === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <Card className={`border-2 ${passed ? 'border-chart-3/50 bg-gradient-to-br from-chart-3/10 to-chart-3/5' : 'border-chart-1/50 bg-gradient-to-br from-chart-1/10 to-chart-1/5'}`}>
              <CardContent className="p-6 text-center space-y-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
                  className="text-5xl"
                >
                  {passed ? '🎉' : '📚'}
                </motion.div>
                <h3 className="text-xl font-display font-bold text-foreground">
                  {passed ? 'Parabéns!' : 'Quase lá!'}
                </h3>
                <p className="text-3xl font-display font-bold text-foreground">{score}%</p>
                <p className="text-sm text-muted-foreground">
                  {correctCount}/{totalQuestions} respostas correctas
                </p>
                {passed && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center justify-center gap-2 bg-primary/10 rounded-xl p-3"
                  >
                    <Sparkles className="h-5 w-5 text-primary" />
                    <span className="font-display font-bold text-primary">+{lesson.kivaPointsReward} KivaPoints</span>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            <Button
              onClick={() => onComplete(score)}
              className="w-full rounded-xl gap-2"
              variant={passed ? 'default' : 'secondary'}
            >
              {passed ? 'Concluir lição' : 'Tentar novamente'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match?.[1] || null;
}
