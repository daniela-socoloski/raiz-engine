# PROVIDERS — CAMADA DE RENDER (Higgsfield CLI **ou** Magnific MCP)

> Esta pasta e compartilhada. Cada pessoa pode ter um caminho de render diferente instalado.
> A **inteligencia de prompt e a mesma nos dois casos** — so muda quem executa o render.
> Leia este arquivo antes de renderizar qualquer coisa.

---

## 1. REGRA DE OURO

O prompt **nao muda** por causa do provider. Voce escreve o prompt seguindo
[imageprompts.md](imageprompts.md) (realista) ou [stylized.md](stylized.md) (nao-realista),
e so no momento do render escolhe o provider.

Nunca troque de provider no meio de um batch. Se o batch comecou no Higgsfield, termina no
Higgsfield. Se comecou no Magnific, termina no Magnific.

---

## 2. ORDEM DE RESOLUCAO DO PROVIDER

Resolva nesta ordem e **pare no primeiro que der match**:

1. **Pedido explicito do usuario** — "usa o Magnific", "roda pelo Higgsfield", "usa o MCP".
2. **Variavel de ambiente** `HUMAN_IMAGE_PROVIDER` — valores aceitos: `higgsfield` ou `magnific`.
3. **Auto-deteccao**, nesta ordem:
   - Se as ferramentas `mcp__magnific__*` estiverem disponiveis na sessao **e** o Higgsfield CLI
     nao estiver instalado/logado -> **Magnific MCP**.
   - Se o Higgsfield CLI estiver instalado e logado -> **Higgsfield CLI**.
4. **Os dois disponiveis** -> use **Higgsfield CLI** (padrao da casa) e avise em uma linha que o
   Magnific tambem esta disponivel.
5. **Nenhum disponivel** -> nao tente renderizar. Entregue o prompt salvo em disco e conduza o
   setup da secao 5, em linguagem simples, sem stack trace.

### Pre-flight obrigatorio

Antes de qualquer render, rode:

```bash
python3 scripts/render_image.py check-providers
```

Windows:

```bash
python scripts\render_image.py check-providers
```

O comando responde o status do Higgsfield CLI. O status do Magnific **voce mesmo verifica**:
olhe se existem ferramentas `mcp__magnific__*` na sessao (se estiverem diferidas, use
`ToolSearch` com a query `magnific`).

---

## 3. CONTRATO COMUM (vale para os dois providers)

Independente de quem renderiza, toda execucao entrega a mesma estrutura:

```text
human-output/image/{project_slug}/
├── prompt.txt          prompt mestre em ingles
├── brief.txt           pedido original, modo, qtd, aspect, luz/estilo, resolucao, data
├── image-01.png        arquivos finais, numerados
├── image-02.png
├── metadata.json       provider, modelo, parametros, caminhos
└── _logs/              1 json por imagem
```

E os mesmos parametros logicos:

| Parametro | Valores | Observacao |
|---|---|---|
| `prompt` | texto em ingles | identico nos dois providers |
| `aspect_ratio` | `auto`, `1:1`, `3:2`, `2:3`, `4:3`, `3:4`, `4:5`, `5:4`, `9:16`, `16:9`, `21:9` | |
| `resolution` | `1k`, `2k`, `4k` | padrao `2k` |
| `references` | 0..N imagens locais | opcional |
| `n` | quantidade de imagens | 2 ou mais = render **em paralelo**, teto de 4 simultaneas |

---

## 4. PROVIDER A — HIGGSFIELD CLI (padrao)

Modelo obrigatorio: **Nano Banana 2** (`nano_banana_2`), salvo se a pasta do produto definir outro.

```bash
python3 scripts/render_image.py render \
  "human-output/image/{slug}/prompt.txt" \
  --aspect-ratio "4:5" --resolution "2k" \
  --output-dir "human-output/image/{slug}" --output-name "image-01.png"
```

Com referencia local (repita a flag para varias):

```bash
python3 scripts/render_image.py render \
  "human-output/image/{slug}/prompt.txt" \
  --aspect-ratio "4:5" --resolution "2k" \
  --output-dir "human-output/image/{slug}" --output-name "image-01.png" \
  --reference "/caminho/da/referencia.png"
```

Windows: troque `python3` por `python` e use `\` nos caminhos.

O script cuida de: checar CLI/login, subir as referencias, submeter, esperar o job, baixar o
arquivo e escrever `metadata.json` + `_logs/`.

Se falhar, **nao troque de modelo como fallback**. Corrija login, referencias, prompt,
aspect ratio ou resolucao e tente de novo.

---

## 5. PROVIDER B — MAGNIFIC MCP

Servidor: `https://mcp.magnific.com/mcp` (HTTP, autenticado por OAuth no primeiro uso).

### 5.1. Setup (uma vez por maquina)

Se a pessoa abriu o Claude Code **dentro desta pasta**, o [.mcp.json](.mcp.json) daqui ja declara
o servidor — basta aprovar quando o Claude Code perguntar.

Para usar em **qualquer outra pasta**, adicione o servidor uma vez:

```bash
claude mcp add --transport http --scope user magnific https://mcp.magnific.com/mcp
```

Depois disso, reabra a sessao e faca o login/autorizacao do Magnific quando ele pedir.

### 5.2. Como chamar

Os nomes exatos das ferramentas podem mudar entre versoes do servidor. **Descubra em runtime**:
procure as ferramentas `mcp__magnific__*` na sessao (se estiverem diferidas, `ToolSearch` com a
query `magnific`) e leia a assinatura antes de chamar. Depois mapeie o contrato da secao 3 para
os parametros reais da ferramenta.

Mapeamento esperado:

| Contrato | Como passar no Magnific |
|---|---|
| `prompt` | o campo de prompt/texto da ferramenta de geracao |
| `aspect_ratio` | campo de aspect ratio; se a ferramenta so aceitar largura/altura, converta mantendo a proporcao |
| `resolution` | `1k` ~ 1024px, `2k` ~ 2048px, `4k` ~ 4096px no lado maior |
| `references` | campo de imagem de referencia / image-to-image, se existir |
| `n` | uma chamada por imagem |

Se o Magnific expuser uma ferramenta de **upscale** alem da de geracao: gere em `2k` e faca
upscale so quando o usuario pedir qualidade maxima. Nao faca upscale por conta propria — isso
consome credito.

### 5.3. Salvando o resultado no padrao da casa

O MCP devolve uma URL (ou um arquivo). Nao deixe o resultado solto: passe pelo script para cair
na mesma estrutura de pasta, com metadata e log.

```bash
python3 scripts/render_image.py save-external \
  --url "https://.../resultado.png" \
  --output-dir "human-output/image/{slug}" --output-name "image-01.png" \
  --provider magnific_mcp --model "{nome_da_ferramenta}" \
  --prompt-file "human-output/image/{slug}/prompt.txt" \
  --aspect-ratio "4:5" --resolution "2k"
```

Se o MCP ja gravou um arquivo local, troque `--url` por `--file "/caminho/do/arquivo.png"`.

---

## 6. QUANDO NENHUM PROVIDER EXISTE

Nao invente render e nao prometa arquivo. Faca assim:

1. Salve `prompt.txt` e `brief.txt` na pasta do projeto (isso sempre acontece).
2. Diga em uma frase que falta o motor de render.
3. Ofereca os dois caminhos, sem jargao:

**Higgsfield CLI**

```bash
npm install -g @higgsfield/cli
```

```bash
higgsfield auth login
```

**Magnific MCP**

```bash
claude mcp add --transport http --scope user magnific https://mcp.magnific.com/mcp
```

4. Confirme credenciais antes de rodar qualquer comando pago.

---

## 7. CHECKLIST DO RENDER

- [ ] Provider resolvido pela ordem da secao 2, nao por chute
- [ ] Pre-flight rodado antes do primeiro render
- [ ] Prompt identico ao que seria usado no outro provider
- [ ] Batch inteiro no mesmo provider
- [ ] Batch de 2+ imagens disparado **em paralelo**, teto de 4 simultaneas — nunca em serie
- [ ] `--reference` repetido em **todas** as chamadas do batch, nao so na primeira
- [ ] Conferido quais PNGs existem de fato no fim; refeitas so as que falharam
- [ ] Saida em `human-output/image/{project_slug}/` na pasta atual do usuario
- [ ] `metadata.json` **consolidado** no fim, com o batch inteiro (o script sozinho so deixa a
      ultima imagem; os registros individuais ficam em `_logs/image-NN.json`)
- [ ] Sem fallback silencioso de modelo ou de provider
