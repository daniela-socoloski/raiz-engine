# Template — UPLOAD.md (plano B: upload manual)

> **Este arquivo só é usado quando o vídeo não pôde ser gerado automaticamente.**
>
> No fluxo normal o sistema sobe as imagens e entrega o MP4 sozinho. O `UPLOAD.md`
> existe para dois casos: a máquina não tem gerador de vídeo, ou a geração falhou
> duas vezes. Se o vídeo saiu, **não crie este arquivo** — ele só polui a pasta.

Formato do arquivo `output/{slug}/02-motion/UPLOAD.md`:

---

```markdown
# {NOME DO PROJETO} — upload manual no Seedance

> Este pacote foi gerado porque {não há gerador de vídeo nesta máquina /
> a geração automática falhou: <motivo>}. Rode no Seedance na mão.

## 1. Arquivos para subir, nesta ordem

| # | Arquivo | O que é |
|---|---|---|
| 1 | `../01-frame/frame-XX.png` | **Imagem principal.** A cena com todos os elementos. |
| 2 | `../../../assets/produto/xxx.png` | Produto, se houver. |
| 3 | `../../../assets/logo/logo.png` | **Logo, arquivo separado.** |

> O logo **não está** na imagem principal — de propósito. Ele sobe separado
> porque entra sozinho no final do motion. Se você subir só a imagem, o
> Seedance não tem de onde tirar o logo para o fecho.
>
> A ordem importa: o prompt se refere ao logo como "the attached logo image".

## 2. Parâmetros

| | |
|---|---|
| Modelo | Seedance 2.0 |
| Duração | {15} segundos |
| Resolução | {1080p} |
| Aspect ratio | {9:16} |
| Som | **ligado** |

## 3. Prompt

```
{prompt completo, pronto para copiar}
```

## 4. O que conferir no resultado

- [ ] A cena 1 termina **igual** à imagem aprovada
- [ ] Nenhum elemento foi redesenhado ou mudou de forma
- [ ] A câmera ficou parada o tempo todo
- [ ] O logo entrou inteiro e legível no final
- [ ] A duração bateu com o pedido
- [ ] O áudio veio, e sem locução ou trilha cantada por cima

Se algum item falhar, o ajuste quase sempre é reforçar a trava correspondente
no prompt — veja "As travas que não se mexe" no template usado.
```

---

## Regras de escrita

- **Caminhos relativos à pasta `02-motion/`**, para o arquivo funcionar mesmo se a pasta do projeto for movida.
- O prompt vai **inteiro** dentro do UPLOAD.md, não só um link — a pessoa precisa copiar sem abrir outro arquivo.
- Diga logo na primeira linha **por que** o pacote manual foi gerado. Sem isso a pessoa acha que o sistema quebrou.
- Se não houver logo em `assets/logo/`, troque a linha do logo por: `⚠️ Sem logo em assets/logo/ — o motion vai terminar sem assinatura. Coloque o arquivo lá e me avise que eu refaço.`
