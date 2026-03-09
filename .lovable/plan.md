

## Revisão do Fluxo de Autenticação — Email + Telefone

### Diagnóstico

O código do Login (`src/pages/Login.tsx`) e do AuthContext já implementam ambos os fluxos (email com password e telefone com OTP). No entanto, existem problemas que impedem o funcionamento correcto:

**1. Login por Telefone requer configuração do provider SMS**
O Lovable Cloud (Supabase) precisa de um provider SMS configurado (Twilio, Vonage, etc.) para enviar OTPs por SMS. Sem isso, `signInWithOtp({ phone })` falha silenciosamente ou retorna erro. Como não há provider SMS configurado, o login por telefone não funciona.

**2. Fluxo pós-login por telefone — race condition no perfil**
Quando um utilizador faz signup por telefone, o `signInWithOtp` + `verifyOtp` cria o utilizador mas o trigger `handle_new_user` pode não criar o perfil correctamente porque os `raw_user_meta_data` são passados no primeiro `signInWithOtp` e podem não persistir.

**3. Navegação pós-autenticação não espera pelo AuthContext**
Após login/signup bem-sucedido, o código faz `navigate(dest)` imediatamente. Mas o `AuthContext` ainda não carregou o `KivaraUser` (é assíncrono via `onAuthStateChange`). Isto causa redirecionamento para a rota certa mas sem dados do utilizador, resultando em erro ou página em branco.

**4. Crianças/Adolescentes forçados a usar email no signup**
No código actual (linha 598-623), crianças e adolescentes no signup não vêem o toggle email/phone — são forçados a usar email. Isto é intencional mas limita a usabilidade.

### Plano de Correção

#### Ficheiro: `src/pages/Login.tsx`

1. **Corrigir navegação pós-auth**: Em vez de navegar imediatamente após login/signup, remover o `navigate(dest)` manual e deixar o `AuthContext` + router guards tratarem do redirecionamento quando o `user` estiver carregado.

2. **Melhorar feedback de erro no telefone**: Quando o OTP falha, mostrar mensagem clara. Adicionar botão "Reenviar código" após 60 segundos.

3. **Adicionar countdown para reenvio de OTP**: Timer de 60s visível após enviar o código.

4. **Corrigir email signup feedback**: Após signup por email, não tentar navegar — mostrar mensagem de confirmação a pedir que verifiquem o email.

#### Ficheiro: `src/contexts/AuthContext.tsx`

5. **Melhorar tratamento de phone auth**: O `fetchKivaraUser` pode falhar se o perfil ainda não existir (race condition com trigger). Adicionar retry com delay.

#### Ficheiro: `src/App.tsx`

6. **Verificar guards de rota**: Confirmar que as rotas protegidas redireccionam para `/login` quando `user` é `null` e `loading` é `false`, evitando ecrãs em branco.

#### i18n (`src/i18n/pt.ts` e `src/i18n/en.ts`)

7. **Adicionar chaves**: `auth.resend_otp`, `auth.resend_in`, `auth.email_verification_sent`, `auth.phone_not_available`.

#### Nota sobre SMS Provider

O login por telefone requer um provider SMS no backend. Sem Twilio/Vonage configurado, vamos mostrar uma mensagem informativa quando o utilizador selecciona "Telefone", indicando que esta funcionalidade estará disponível em breve — em vez de falhar silenciosamente. Alternativamente, se quiser activar o SMS, será necessário configurar as credenciais do Twilio.

### Resumo de Ficheiros

| Ficheiro | Acção |
|----------|-------|
| `src/pages/Login.tsx` | Corrigir navegação pós-auth, adicionar resend OTP timer, melhorar feedback |
| `src/contexts/AuthContext.tsx` | Adicionar retry no fetchKivaraUser para phone auth |
| `src/i18n/pt.ts` | Adicionar ~5 chaves auth |
| `src/i18n/en.ts` | Adicionar ~5 chaves auth |

