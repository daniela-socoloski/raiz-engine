# CLAUDE.md — Lollapalooza Brasil

Este arquivo orienta o Claude Code a trabalhar com a marca **Lollapalooza Brasil**.

Antes de criar, editar ou auditar qualquer peça desta marca, leia o arquivo inteiro:

```text
resultado/DNA.md
```

O `DNA.md` é a fonte da verdade. Ele define estilo visual, tom de voz, referências, anti-referências, ferramentas, workflow e critérios de qualidade. O `resultado/DNA.pdf` é a versão editorial apresentável. Este `CLAUDE.md` é só a camada operacional.

---

## Resumo da marca

```text
Marca: Lollapalooza Brasil (@lollapaloozabr)
O que faz: festival de música de três dias no Autódromo de Interlagos, São Paulo.
           Edição 2027 nos dias 19, 20 e 21 de março. Realização RockWorld.
Promessa: o lugar onde a música internacional vira memória brasileira.
Estética: colagem de alta saturação. Tipografia condensada preta pesadíssima sobre
          campo de cor chapada, recortes fotográficos em preto e branco com retícula
          grossa, bordas rasgadas de papel colado.
Voz: fã que estava lá e quer saber se você também estava. Pergunta mais do que anuncia.
Workflow: site em Webflow, venda pela Ticketmaster, e-mail no Keap.
          A camada criativa interna não foi observada e está registrada como hipótese.
```

## Como agir

1. Leia o `DNA.md` inteiro antes de responder.
2. Antes de criar, identifique qual seção do DNA controla o pedido: visual, voz, audiência, workflow, canal, imagem ou comportamento.
3. Use as regras do DNA para criar, revisar ou refinar peças.
4. Se o pedido contradiz o DNA, sinalize a tensão e proponha um caminho coerente.
5. Se o usuário aprovar uma mudança de estilo, voz ou workflow, atualize o `DNA.md`.
6. Depois de qualquer ajuste relevante, regenere `resultado/DNA.pdf`.
7. Se o pedido envolver imagem ou vídeo, use Higgsfield CLI com Nano Banana 2, sempre com referência do acervo real em `referencias/`.

---

## Regras rápidas da marca

### Visual

```text
Cor permanente: preto #000000, branco #FFFFFF, pretos quentes #17120F e #171714.
Cor de edição (muda todo ano): #32C3E2 em 2026, #00AE9A em 2027.
  É um slot, não um valor fixo. Peça de 2028 precisa de cor nova, escolhida pela
  regra da Seção 3.1 do DNA.
Cor de chamada: coral #FB4A40. Estável entre edições, no máximo dois usos por peça.
Respiro: lilás #D9B0DF e rosa #ECB4E5.

Tipografia:
  Anton para nome de atração, cartaz e título de impacto. Nunca em texto corrido.
  Ovink Bold/Black para título editorial. Nunca em nome de atração.
  Golos Text para texto corrido. Barlow para interface e dados.
  O logotipo é lettering desenhado. Nunca redigitar em fonte de biblioteca.

Hierarquia do cartaz acontece por TAMANHO, nunca por peso ou por cor.

Anti-referências: minimalismo de marca de tecnologia, gradiente e pastel,
  foto de banco de imagens, layout centralizado e simétrico, serifada de luxo.

Direção fotográfica: contraluz de palco com fumaça, cor da luz preservada e nunca
  corrigida, contraste alto, pretos fechados, contra-plongée do fosso, gesto em
  movimento. Artista parado não entra.
  Motivo próprio da marca: artista internacional com a bandeira ou a camisa do
  Brasil no palco. Isso é pauta, não acaso.
  Dois regimes: foto documental entra limpa; foto-elemento pode ser recortada e
  tingida. Decidir o regime ANTES de tratar. Nunca misturar os dois na mesma peça.
```

### Voz

```text
A marca soa como: fã em primeira pessoa do plural. "A gente", nunca "pessoal" ou "galera".
Estrutura padrão da legenda: abertura de lembrança, uma frase de emoção nomeada,
  pergunta ao público, #LollaBR.
Usa: saudade, arrepiar, memória, eterno, icônico, histórico, superar, reviver,
  colecionar, viver.
Evita: evento, experiência, imersivo, inesquecível, público-alvo, conteúdo,
  plataforma, curadoria.
Inglês: só como citação de letra ou fala de palco, nunca traduzida.
  Nunca como jargão de mercado.
Nunca usar: "prepare-se para viver", "não é só um festival, é um estilo de vida",
  "line-up dos sonhos", "vem viver essa energia", superlativo sem prova.
Chamadas: "anota aí", "se liga", "fique de olho", "corre no ticketmaster.com.br".
  Nunca "saiba mais", "clique aqui", "confira", "não perca".
```

### Conteúdo patrocinado — a regra que a prática atual não cumpre

```text
Conteúdo patrocinado é conteúdo da marca com o parceiro dentro dele, e não
conteúdo do parceiro hospedado na marca.
1. A legenda continua terminando em pergunta ao público.
2. O sujeito da frase é o público ou o festival, nunca o produto.
3. O produto aparece dentro de uma cena real do festival.
4. O vocabulário proibido continua proibido.
5. Obrigação contratual entra como informação seca, não como adjetivo.
Ver Seção 4.6 do DNA para o diagnóstico completo e o exemplo de reescrita.
```

### Workflow

```text
Ferramentas confirmadas: Webflow, Ticketmaster, Keap, UTM padronizada por botão.
Todo link de venda precisa carregar a marcação de UTM correta.
Camada criativa interna: não observada. Tratar como hipótese até confirmação.

Revisão humana obrigatória:
  imagem gerada por IA, sempre;
  legenda com data, preço, nome de artista ou condição comercial;
  resposta a comentário público;
  comunicado de crise, sem exceção.

Nunca publicar imagem gerada por IA como se fosse registro do festival.
Isso destruiria o argumento central da marca.
```

## Comandos naturais

```text
crie um carrossel de arquivo seguindo meu DNA
escreva a legenda de um Reel de show
reescreva este post de patrocinador na voz da marca
audite esta peça contra o DNA
proponha a cor da edição 2028
ajuste a régua de registro do Threads
refine o DNA com este feedback
```

## Regra de teste

Quando o DNA for recém-criado, faça uma peça pequena para validar aderência: uma legenda, um post de arquivo, uma reescrita de conteúdo patrocinado ou um prompt visual. Depois pergunte o que ficou certo e o que ficou fora.

## Regra de refino

Feedback não fica solto na conversa. Transforme feedback em regra no `DNA.md`.

- "genérico demais" leva a reforçar vocabulário próprio e anti-padrões da Seção 4.
- "não parece o Lolla" leva a revisar a estética-âncora da Seção 3.3.
- "imagem fora do estilo" leva a revisar a Seção 3.8 e as referências de geração.
- "isso é papo de organizador" leva a revisar o princípio editorial da Seção 4.1.

Depois do ajuste, gere uma segunda versão curta para provar a melhoria e regenere o PDF.

## Lacunas conhecidas

```text
TikTok: não analisado. Perfil bloqueado por verificação anti-bot.
Reels: só as capas foram analisadas. Ritmo, trilha e transição estão por inferência.
Camada criativa interna: não observada.
Filtro de temas evitados: leitura de ausência, não política declarada.
  Confirmar com alguém de dentro antes de usar como regra de aprovação.
```
