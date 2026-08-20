# Operação — as armadilhas que já custaram tempo e crédito

Este arquivo existe porque cada item abaixo **já aconteceu**. Leia antes de disparar qualquer geração em lote.

---

## 1. Nunca rode geração em foreground longo

O shell tem teto de **10 minutos**. Takes de vídeo levam mais que isso. Quando o comando é morto, ele leva junto os processos filhos que ainda estavam baixando — e você perde o download de jobs que já foram pagos.

**Sempre** dispare geração de vídeo em background:

```bash
# certo — sobrevive ao teto de 10 min
bash scripts/gen_takes.sh ... &   # com run_in_background no Bash tool
```

Se um lote foi interrompido: **não repague cegamente**. Os scripts pulam arquivos que já existem (`already_done`), então basta relançar o mesmo comando — só o que falta é gerado.

## 2. `jobs -p` não funciona em shell não-interativo

Isto **falha silenciosamente** — `jobs -p` volta vazio, o loop não espera nada, o script sai e mata os filhos:

```bash
# ERRADO — não espera, mata tudo
for d in a b c; do cmd "$d" & done
for p in $(jobs -p); do wait "$p"; done
```

```bash
# CERTO — captura os PIDs explicitamente
PIDS=()
for d in a b c; do cmd "$d" & PIDS+=($!); done
FAIL=0
for p in "${PIDS[@]}"; do wait "$p" || FAIL=$((FAIL+1)); done
```

## 3. Um wrapper que termina não significa que o trabalho terminou

Se você lança `nohup ... &` dentro de um comando em background, o **wrapper** retorna na hora e é reportado como "completed" — mas os filhos continuam vivos e gerando. Antes de concluir que algo morreu, confira:

```bash
pgrep -f "generate create" | wc -l      # jobs ainda rodando?
ls output/ads/*/04-takes/*.mp4 | wc -l  # quantos arquivos já existem?
```

## 4. Recuperar jobs órfãos quase nunca compensa

Se um lote morreu depois de criar os jobs, é tentador buscá-los com `higgsfield generate list`. Na prática: o listing **não traz o prompt**, um único `create` pode gerar mais de um job, e mapear job → campanha vira adivinhação. Colocar a imagem errada na pasta errada corrompe tudo silenciosamente adiante.

Imagem custa ~2 créditos. **Regere e siga.** Só vale recuperar vídeo (~45 créditos/take), e mesmo assim identificando visualmente, nunca por palpite.

## 5. Verifique antes de animar, sempre

Um take custa ~22x uma imagem. Animar um frame com rótulo quebrado é jogar crédito fora e ainda produzir lixo. Abra os frames e rode o checklist de [prompt_grammar.md](prompt_grammar.md) **antes** de chamar `gen_takes.sh`.

Se não der para conferir os 25, confira no mínimo: todos os frames regerados, o `03-detail` (macro de rótulo) de cada campanha, e um frame por campanha escolhido ao acaso. E **diga ao usuário quais você não abriu**.

## 6. Custos de referência

| Item | Créditos |
|---|---|
| Imagem (Nano Banana, 2k, 9:16) | ~2 |
| Take de vídeo (Seedance 2.0, 5s, 1080p) | ~45 |
| Uma campanha completa (5 imagens + 5 takes) | ~235 |
| Cinco campanhas | ~1.175 |

Confira o custo real antes de lotes grandes:

```bash
higgsfield generate cost seedance_2_0 --prompt "x" --duration 5 --resolution 1080p --mode std
```

## 7. Duração exata: por que o corte é por frame

Cortar por tempo (`-t 3.0`) faz o ffmpeg fechar um frame antes. Pior: com `anchor=end`, o `-ss` cai exatamente no último frame disponível e sobra margem zero — o corte devolve 71 frames em vez de 72. Cinco takes = 5 frames perdidos = 14,833s em vez de 15,000s.

O `stitch.sh` já resolve isso: posiciona o corte pela **contagem de frames da origem**, com meio frame de folga, e usa `-frames:v`. Não volte a cortar por tempo.

Confira sempre o resultado por frame, não por segundo:

```bash
ffprobe -v error -count_frames -select_streams v:0 \
  -show_entries stream=nb_read_frames -of default=nk=1:nw=1 ad-15s.mp4
```

15s a 24fps = **360 frames**. Qualquer outro número é bug.
