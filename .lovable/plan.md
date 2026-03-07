

## Plan: Lições em Áudio e Vídeo

### Contexto Actual

O sistema de lições já suporta blocos de tipo `video` (embeds YouTube) e `image` no `LessonBlock`. Contudo, falta:
- Suporte a blocos de **áudio** (narração, podcasts educativos)
- Uma forma de distinguir lições que são predominantemente áudio/vídeo das lições de leitura
- Player de áudio nativo na UI
- Geração de áudio via TTS para narrar lições existentes

### Abordagem

Duas capacidades complementares:

**1. Novo tipo de bloco `audio`** — permite inserir ficheiros ou URLs de áudio (MP3) directamente nos blocos de conteúdo das lições.

**2. Narração automática com TTS** — um botão "Ouvir lição" que converte o texto dos blocos numa narração áudio usando ElevenLabs via uma backend function. Isto transforma qualquer lição de texto numa lição de áudio sob demanda.

### Alterações

| Componente | Descrição |
|---|---|
| `src/types/kivara.ts` | Adicionar `'audio'` ao union type de `LessonBlock.type` |
| `src/components/LessonViewer.tsx` | Adicionar renderização do bloco `audio` com `<audio>` player nativo; adicionar botão "Ouvir" que chama TTS para narrar blocos de texto |
| `supabase/functions/elevenlabs-tts/index.ts` | Nova edge function que recebe texto e retorna áudio MP3 via ElevenLabs API |
| `supabase/functions/generate-lesson/index.ts` | Adicionar `audio` como tipo de bloco possível no schema do tool call |
| `src/pages/shared/LearnPage.tsx` | Adicionar ícone visual (🎧/🎬) nos cards de lições que contêm blocos áudio/vídeo |

### Pré-requisito

Será necessário configurar o secret `ELEVENLABS_API_KEY` para a funcionalidade de TTS. Sem esta chave, o botão "Ouvir" ficará disponível mas pedirá ao utilizador para configurar a integração.

### Detalhes Técnicos

- O bloco `audio` renderiza um `<audio controls>` com estilo personalizado
- O botão "Ouvir lição" concatena o texto de todos os blocos text/tip/example/highlight e envia ao edge function
- O edge function usa o modelo `eleven_multilingual_v2` com uma voz portuguesa (e.g. Daniel)
- O áudio gerado é reproduzido no browser via `Audio()` API
- Blocos de vídeo já funcionam (YouTube embed) — sem alterações necessárias

