> **Legado:** este guia descreve o login com Google no Supabase. Para a AWS, veja `docs/INFRA.md` (seção "Login com Google").

# Login com Google

O painel de administração já tem o botão **Entrar com Google**. Falta ligar o provedor no Supabase, o que exige credenciais criadas na sua conta do Google.

## 1. Criar as credenciais no Google Cloud

1. Em [console.cloud.google.com](https://console.cloud.google.com), crie ou escolha um projeto.
2. Em **APIs e serviços > Tela de consentimento OAuth**, configure o app (nome, e-mail de suporte).
3. Em **Credenciais > Criar credenciais > ID do cliente OAuth**, tipo **Aplicativo da Web**.
4. Em **URIs de redirecionamento autorizados**, adicione a URL de callback do Supabase:
   - local: `http://127.0.0.1:54321/auth/v1/callback`
   - produção: `https://<seu-projeto>.supabase.co/auth/v1/callback`
5. Guarde o **ID do cliente** e a **chave secreta do cliente**.

## 2. Ligar no Supabase

**Local** (`supabase/config.toml` já traz o bloco `[auth.external.google]` desligado):

1. Crie `supabase/.env` (ele é ignorado pelo git) com:

   ```
   GOOGLE_CLIENT_ID=<id do cliente>
   GOOGLE_CLIENT_SECRET=<chave secreta>
   ```

2. Troque `enabled = false` por `enabled = true` em `[auth.external.google]` e reinicie com `supabase stop` e `supabase start`.

**Produção**: Supabase Dashboard > Authentication > Providers > Google, cole o ID e a chave, e adicione a URL do painel em Authentication > URL Configuration (Redirect URLs).

## 3. Como as contas se encontram

- O Supabase vincula a identidade do Google a uma conta existente quando o **e-mail é o mesmo e verificado**.
- Para entrar como administrador pelo Google, **crie um administrador novo já com o seu Gmail** (tela de Usuários, papel Administrador) em vez de trocar o e-mail do administrador existente. Assim nenhum e-mail digitado errado entrega a conta a outra pessoa.
- Mantenha a **confirmação de e-mail ligada** (`enable_confirmations = true`, já é o padrão deste repositório) também em produção. Sem ela, qualquer pessoa poderia se cadastrar com o seu Gmail antes de você e ficar com acesso à conta quando você entrasse pelo Google.
- Quem entrar pelo Google com um e-mail novo recebe uma conta de **usuário comum**. O painel só admite administradores, então essa pessoa vê "Acesso restrito".
- Ao promover um usuário comum a administrador, o painel exige uma **nova senha** (que precisa ser trocada no primeiro acesso). Isso evita herdar uma senha que outra pessoa já conhecia.

## Aplicativo e extensão

O botão do Google foi implementado no painel web. No app Android e na extensão o fluxo é diferente (navegador do sistema e `chrome.identity`) e fica para uma próxima etapa.
