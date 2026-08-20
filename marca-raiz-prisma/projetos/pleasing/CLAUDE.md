# CLAUDE.md — Pleasing

Este arquivo orienta o Claude Code a trabalhar com a marca **Pleasing**.

Antes de criar, editar ou auditar qualquer peça desta marca, leia o arquivo inteiro:

```text
resultado/DNA.md
```

O `DNA.md` é a fonte da verdade. Ele define estilo visual, tom de voz, referências, anti-referências, ferramentas, workflow e critérios de qualidade. O `resultado/DNA.pdf` é a versão editorial apresentável, e `resultado/DNA-apresentacao.md` é a fonte curada que gera esse PDF. Este `CLAUDE.md` é só a camada operacional.

---

## Resumo da marca

```text
Marca: Pleasing
O que faz: casa de produto de prazer, com esmalte, beleza, fragrância, vestuário, acessórios e linha íntima
Promessa: Find your Pleasing. Prazer é a categoria, e o produto é o protagonista
Estética: teatro pequeno e bem iluminado, cenário construído com material de textura, objeto brilhante com sombra dura projetada
Voz: adulta, engraçada e sem constrangimento com o corpo, descreve sensação em vez de defender benefício, faz trocadilho com o próprio nome
Workflow: campanha ganha nome antes da produção, imagem principal com produto e embalagem, secundárias derivadas dela, texto escrito depois da imagem
```

## Como agir

1. Leia o `DNA.md` inteiro antes de responder.
2. Antes de criar, identifique qual seção do DNA controla o pedido: visual, voz, audiência, workflow, canal, imagem ou comportamento.
3. Use as regras do DNA para criar, revisar ou refinar peças.
4. Se o pedido contradiz o DNA, sinalize a tensão e proponha um caminho coerente.
5. Se o usuário aprovar uma mudança de estilo, voz ou workflow, atualize o `DNA.md`.
6. Depois de qualquer ajuste relevante, atualize `resultado/DNA-apresentacao.md` e rode `python3 scripts/render-dna-pdf.py "projetos/pleasing"` a partir da pasta-raiz.
7. Para imagem e vídeo, use Higgsfield CLI com Nano Banana 2, passando de uma a três fotos-âncora de `referencias/01-site/` como referência.

---

## Regras rápidas da marca

### Visual

```text
Paleta central: creme #FEFEFA como fundo dominante, preto #191919 no texto, vermelho-tijolo #911813 concentrado em poucos pontos, terracota #C4603F como cor de acabamento, areia #F0E4D7 e bege #E3D6C8 como superfícies
Tipografia: logotipo em serifa proprietária, sempre o arquivo original. Gotham Bold em títulos, Book em texto, Medium em botão e rótulo, sempre em caixa alta espaçada
Referências: as campanhas reais em referencias/01-site e referencias/09-instagram
Anti-referências: merch de turnê, catálogo de farmácia, beleza clínica, bem-estar sexual solene, estética nativa de plataforma, banco de imagens com sorriso
Direção fotográfica: dois registros. Alto de estúdio com cenário construído, luz frontal alta e sombra dura projetada. Baixo de convívio com luz natural difusa, usado no vestuário. Embalagem sempre junto do produto. Rosto frequentemente cortado. Mão com unha pintada como assinatura
```

### Voz

```text
A marca soa como: uma pessoa adulta e engraçada que não tem vergonha do próprio corpo e não precisa provar que é inteligente
Usa: pleasure, playful, joy, lush, sensuous, nostalgia, ritual, radical, never perfect, Find your Pleasing
Evita: clinicamente comprovado, antienvelhecimento, imperfeição a corrigir, discreto como eufemismo, empoderamento, jornada, luxo
Nunca usar: "Não é X, é Y", "Descubra como", "Você merece", "Sinta-se confiante", "Nossa fórmula exclusiva", exclamação em série
Nome de produto: começa com artigo definido e carrega trocadilho sempre que a categoria permite
Limite do duplo sentido: precisa sempre permitir leitura inocente. Se só funciona no nível sexual, está fora
```

### Workflow

```text
Como uma peça nasce: a campanha ganha nome e frase-âncora, a direção define campo de cor, material de textura e registro, a foto principal sai com produto e embalagem, as secundárias derivam dela, e o texto vem depois da imagem
Ferramentas principais: Shopify na loja, Higgsfield CLI com Nano Banana 2 para imagem e vídeo, ElevenLabs quando houver narração
Etapas com revisão humana: toda imagem gerada por IA, todo texto com trocadilho, resposta em comentário público e qualquer comunicação de crise
```

## Comandos naturais

```text
crie um post seguindo meu DNA
escreva um email no tom da marca
audite esta peça contra o DNA
ajuste o tom para ficar menos formal
refine o DNA com este feedback
teste meu DNA com uma peça pequena
```

## Regra de teste

Quando o DNA for recém-criado, faça uma peça pequena para validar aderência: legenda, e-mail curto, bio, anúncio simples, ideia de post ou prompt visual. Depois pergunte o que ficou certo e o que ficou fora. Feedback aprovado vira ajuste no `DNA.md`.

## Regra de refino

Feedback não fica solto na conversa. Transforme feedback em regra.

- "formal demais" leva a ajustar a régua de registros e os exemplos de voz.
- "genérico" leva a reforçar vocabulário próprio, anti-padrões e referências.
- "não parece a marca" leva a revisar a estética-âncora e os critérios de qualidade.
- "imagem fora do estilo" leva a atualizar a direção fotográfica e as instruções de engine.

Depois do ajuste, gere uma segunda versão curta para provar a melhoria.

## Teste final de qualquer peça

A peça funcionaria se a pessoa nunca tivesse ouvido falar de quem fundou a marca? Se a resposta for não, a peça está fora do DNA.
