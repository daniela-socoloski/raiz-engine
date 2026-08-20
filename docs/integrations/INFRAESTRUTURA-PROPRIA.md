# Infraestrutura própria — o que falta

Atualizado: 2026-08-20

| # | Item | Estado |
|---|---|---|
| 1 | Repositório GitHub | ✅ |
| 2 | Supabase — endpoint e chave | ✅ |
| 3 | Supabase — tabela, RLS, usuário e acesso | ✅ |
| 4 | Servir runtimes e updates no VPS | ⬜ **falta** |
| 5 | Cor de acento | ⚠️ **parcial** — desktop feito, skill não |
| 6 | Domínio e DNS | ✅ |
| 7 | Bundle ID | ✅ |
| 8 | Assinatura de código | ⬜ **falta** |
| 9 | Ícone do app | ⬜ **falta** |

**5 de 9 prontos, 1 parcial, 3 pendentes.**

---

# FALTA

## 4. Servir os arquivos no VPS ← o único com risco aberto

O DNS já está pronto e apontando:

```
cdn.danielasocoloski.com  →  187.127.28.154
```

Falta o servidor entregar dois caminhos por HTTPS:

| Caminho | Conteúdo |
|---|---|
| `https://cdn.danielasocoloski.com/runtimes/` | pacotes de runtime, ~100 MB por versão |
| `https://cdn.danielasocoloski.com/feed.json` | feed de auto-update |

### Estado verificado, item a item

| Camada | Estado |
|---|---|
| DNS do subdomínio | ✅ configurado, resolvendo para o VPS |
| Hospedagem | ⬜ pendente |
| HTTPS confiável | ⬜ pendente — certificado não confiável |
| Resposta atual do serviço | **HTTP 503** |
| Arquivos de runtime e update | ⬜ não publicados |
| Integração VPS/Coolify | ⬜ não concluída |

### Dependência herdada de publicação

**Classificação:** `INHERITED-INFRASTRUCTURE-DEPENDENCY` · `MIGRATION-GAP` ·
**risco alto antes de distribuição.**

**Origem:** a versão-base publica runtimes e atualizações no Cloudflare R2 do
produto anterior.

**Comportamento executável atual:** `npm run publish:runtimes` e
`npm run publish:update` ainda implementam o adapter R2 herdado e, por isso,
permanecem bloqueados. O aplicativo já não possui fallback para os endpoints do
fornecedor: `resources/distribution-manifest.json` mantém runtime e update
desativados até um canal próprio ser preenchido. O creator local incorpora os
runtimes e não precisa desse download.

**Destino arquitetural documentado:** infraestrutura própria, hoje descrita como
VPS/Coolify, **sem adapter de publicação implementado nem validado**.

**Riscos declarados:**

- publicação acidental na infraestrutura anterior;
- falha por credenciais incompatíveis;
- download de runtimes controlados pelo fornecedor anterior;
- recebimento de atualização publicada fora do controle do Raiz Engine;
- incapacidade de reconstruir a distribuição apenas com infraestrutura própria.

**Decisão:** não executar publicação agora; não declarar VPS/Coolify concluído; não
executar o fluxo herdado; **bloquear releases** enquanto o destino próprio não
estiver validado. Futuramente construir um adapter canônico de publicação,
validar upload, checksum, download, update e rollback e só então remover os
scripts R2 herdados.

**Condição para liberar distribuição:** armazenamento próprio operacional; HTTPS
válido; credenciais próprias; scripts apontando exclusivamente ao destino aprovado;
checksums publicados e verificados; teste de atualização em instalação limpa;
ausência de endpoints ativos do fornecedor anterior.

### Divergência entre o destino documentado e o implementado

Os passos abaixo apontam para o VPS, mas `scripts/publish-runtimes.mjs` e
`scripts/publish-update.mjs` estão implementados **exclusivamente para Cloudflare
R2** — usam `@aws-sdk/client-s3` e as variáveis `CENA_RAIZ_CF_*`.

Servir pelo VPS exige uma destas decisões, ainda em aberto:

1. adaptar os scripts para enviar por SSH/rsync ao VPS;
2. expor endpoint compatível com S3 no VPS (MinIO, por exemplo) e manter os scripts;
3. voltar à decisão de usar R2 e descartar o VPS para esta finalidade.

Enquanto não for decidido, **o caminho de publicação não existe** — nem para o VPS
nem para um R2 próprio.

### Fragilidade de plataforma

Classificação: `ENVIRONMENT-DEPENDENCY` · `BOOTSTRAP-GAP`.

`publish:runtimes`, `publish:update` e `make:signed` invocam `bash -c` para carregar
`signing.env`. A validação de 2026-08-20 comprovou a falha nesta máquina recém-
formatada: `bash` não resolve no `PATH` do PowerShell. O executável existe em
`C:\Program Files\Git\bin\bash.exe` e os scripts `.sh` passam em `bash -n` quando
esse caminho é usado explicitamente, mas os comandos npm atuais continuam
frágeis. Antes da distribuição, o bootstrap deve tornar essa resolução explícita
ou a dependência deve ser substituída por um runner Windows/Node portátil.

### Passos no Coolify, quando a decisão acima estiver tomada

1. **New Resource → Service → Static site** (ou container `nginx`)
2. Domínio: `cdn.danielasocoloski.com` — o Coolify emite o certificado sozinho
3. Publicar com o mecanismo escolhido

### Depois, definir na distribuição

```
CENA_RAIZ_RUNTIMES_BASE_URL=https://cdn.danielasocoloski.com/runtimes
CENA_RAIZ_UPDATE_FEED_URL=https://cdn.danielasocoloski.com/feed.json
```

### Por que é o único risco real

Enquanto essas variáveis não existirem, o app usa como fallback o **bucket do
fornecedor original**. O auto-update consulta o feed dele a cada 4 horas — uma
release publicada por ele pode ser instalada por cima da sua, na máquina dos seus
usuários.

Quando as variáveis estiverem valendo, os fallbacks em `src/main.ts` devem ser
**removidos do código**, não apenas sobrepostos.

## 8. Assinatura de código

Sem assinatura o instalador funciona, mas o SmartScreen alerta a cada instalação.

Azure Trusted Signing. Variáveis que o CI espera:

```
AZURE_TENANT_ID  AZURE_CLIENT_ID  AZURE_CLIENT_SECRET
CENA_RAIZ_ATS_ENDPOINT  CENA_RAIZ_ATS_ACCOUNT  CENA_RAIZ_ATS_PROFILE
```

A verificação de identidade da empresa leva dias. Comece cedo se pretende distribuir.

## 9. Ícone do app

`src/brand/cena-raiz-icon.png` ainda tem **12.515 pixels de `#ff5200`**, o laranja
do produto original. É imagem, não código: precisa ser refeito no editor gráfico,
com a paleta verde e teal.

---

# PRONTO

## 1. GitHub

`daniela-socoloski/raiz-engine`, autenticado por GitHub App (ID 1923331). Token
renovado sozinho pelo credential helper em `tools/github-app/`.

## 2. Supabase — endpoint e chave

`src/main.ts` aponta para `chfrrgnuinhhkvavndsw` com publishable key. Zero
referências ao projeto do fornecedor. O gate do curso dele foi removido: agora
exige apenas matrícula `active` e não expirada.

Credenciais fora do repositório, em arquivo de ambiente no perfil do usuário, fora da árvore.

## 3. Supabase — tabela, RLS, usuário e acesso

Criado e **verificado consultando o banco**, não pela resposta da API:

| Item | Estado |
|---|---|
| Tabela `enrollments` | 7 colunas |
| RLS | ativa e **forçada** |
| Política | `enrollments_select_own` — só `SELECT`, só `authenticated` |
| Índices | 3: chave primária, um-ativo-por-pessoa, busca por `user_id` |
| Trigger | `updated_at` automático |
| Escrita pelo app | **nenhuma policy** — ninguém se autoconcede acesso |

Testado de ponta a ponta com login real: autenticação → consulta exata do app
(`main.ts:3160`) → **acesso liberado**. A RLS devolveu apenas a linha do próprio
usuário.

Conceder acesso a mais alguém: criar em Authentication → Users e rodar

```sql
insert into public.enrollments (user_id, status)
select id, 'active' from auth.users where email = 'pessoa@exemplo.com';
```

## 5. Cor de acento — **PARCIAL**

Feito no **aplicativo desktop**:

```css
--accent:    #8ca906   /* verde claro do logo — interface */
--teal:      #09b5b7   /* teal do logo */
--olive:     #738b03   /* verde do logo */
--hl-accent: #09b5b7   /* teal — destaque de legenda no vídeo */
```

Nove tons derivados do laranja foram trocados por verdes de **luminosidade
equivalente**, para o contraste sobre o fundo escuro não piorar.

Preservados de propósito: rosa e vermelho de erro (`#ff8fa0`, `#ff6b6b`) e as cores
da roda de matiz do seletor.

### Falta — a skill não foi migrada

A primeira varredura cobriu apenas o desktop. A skill herdada tem paleta própria e
continua com o laranja do produto original:

| Arquivo | O que resta |
|---|---|
| `cena-raiz/assets/preview/app.css` | paleta inteira: `--orange: #ff7713`, `--hl-accent: #ff5200`, tons derivados |
| `cena-raiz/assets/shortform/src/Main.tsx` | `background: '#ff5200'` |
| `cena-raiz/assets/shortform/src/StackedCaptions.tsx` | `const ORANGE = '#ff5200'` |
| `cena-raiz-desktop/resources/remotion-template/public/edit-data.json` | duas fixtures com `"accent": "#ff5200"` |
| `references/shortform.md`, `agent.md` | documentação cita a cor como padrão |

Não confundir com `#ff5f57`, `#febc2e` e `#28c840` em `CustomGraphics.tsx`: são os
semáforos de janela do macOS, não cor de marca.

Enquanto a skill não for migrada, uma peça renderizada por ela sai com o laranja do
fornecedor mesmo que a interface do desktop esteja verde.

## 6. Domínio e DNS

`danielasocoloski.com`, na Hostinger, com DNS gerenciável por API.

O registro `cdn` foi criado sem tocar em MX, SPF, DMARC ou no ALIAS do site.
A Hostinger guarda snapshot automático a cada alteração de zona.

## 7. Bundle ID

`com.creatorfactory.cena-raiz` → **`com.danielasocoloski.cena-raiz`**

Define nome do executável, chaves de registro do instalador e o diretório de dados
do usuário. Trocado antes de qualquer distribuição, quando ainda era de graça.

---

# Não se aplica

Assinatura e notarização Apple (`CENA_RAIZ_MAC_SIGN_IDENTITY`, `CENA_RAIZ_APPLE_*`).
Ambiente é Windows 11 exclusivamente. Os blocos são inertes: leem variáveis
inexistentes e são ignorados. Mantidos como `DEFER`.

Cautela registrada: foi num desses blocos inertes que uma substituição global
quebrou `forge.config.ts` sem ninguém notar. Código que nunca roda esconde defeito.

---

# Higiene de credenciais

| Credencial | Onde vive | Situação |
|---|---|---|
| Chave privada do GitHub App | diretório próprio do usuário, fora da árvore do repositório | fora do repositório |
| Supabase — secretas | arquivo de ambiente no perfil do usuário, fora da árvore | fora do repositório |
| Token da API Hostinger | variável de ambiente do Windows | fora do repositório |
| Supabase — **públicas** | `cena-raiz-desktop/.env` | **dentro** do repositório, ignorado pelo Git |

**Correção de registro:** não é verdade que todas as credenciais estejam fora do
repositório. Existe um `.env` dentro do componente desktop com a URL do projeto e a
publishable key — ambas públicas por natureza, as mesmas que o app entrega ao
cliente final. O arquivo é ignorado pelo Git, verificado com `git check-ignore` a
partir do próprio diretório, e o `.env.example` versionado não contém valores.

Nenhuma chave secreta está dentro do repositório.

**Pendente de revogação:** o Personal Access Token do Supabase e a
secret key foram expostos durante a configuração. O PAT alcança todos os projetos
da conta. Revogar em `supabase.com/dashboard/account/tokens`.

Nada do que foi construído depende deles: o app usa apenas a publishable key.

## Pendências de segurança antes de distribuir

**Refresh token protegido.** Classificação: `SECURITY-DEBT-REMEDIATED-IN-CODE`.
O aplicativo agora cifra a sessão com `safeStorage` do Electron, que usa DPAPI
no Windows, migra o JSON legado uma única vez e falha fechado quando o
armazenamento seguro do sistema não está disponível. O teste automatizado cobre
round trip, migração, exclusão e indisponibilidade. A validação do comportamento
empacotado em uma VM Windows limpa continua sendo parte do gate da Fase 0.

**Dois caminhos de autenticação convivendo.** Classificação:
`WORKING-MACHINE-CONFIGURATION` · `BOOTSTRAP-DECISION-PENDING`.
O `gh` está autenticado e prefere Git sobre **SSH**, enquanto o `origin` local
continua em **HTTPS**, atendido por um credential helper do GitHub App que vive
fora do repositório, por decisão de segurança. Nada quebra — `gh` usa o
token dele para API, o Git usa o helper para push — mas convém unificar para não
haver dúvida sobre qual identidade autoriza cada operação.

**Privilégios de tabela mais amplos que o necessário.** Registro factual, consultado
diretamente em `information_schema.role_table_grants`:

- `authenticated` **possui** acesso à tabela `enrollments`;
- o teste autenticado de ponta a ponta retornou a matrícula;
- **não existe bloqueio por ausência de `SELECT`**;
- tabela, RLS e fluxo de login estão funcionais.

Hardening futuro, não executado nesta etapa: `anon` e `authenticated` receberam
`SELECT`, `INSERT`, `UPDATE` e `DELETE` pelos privilégios padrão do Supabase. A RLS
bloqueia operações sem policy, mas antes da distribuição convém revisar os grants
pelo menor privilégio, mantendo apenas o que o cliente exige.

---

# Ordem sugerida

1. **Provar o diretório creator em Windows limpo** — instalação, repetição,
   reparo e falha parcial, sem depender de ferramentas do desenvolvedor
2. **Implementar e provar o canal próprio** — VPS/Coolify ou outro destino
   explicitamente aprovado, com checksum, update e rollback
3. **Assinar e definir o launcher oficial** — começar cedo, pois a validação de
   identidade pode demorar
4. **Substituir o ícone** — concluir a identidade visual antes da distribuição
