# output/ — o que o sistema gera

Cada projeto vira uma pasta com slug próprio. Seus arquivos originais em `assets/` nunca são tocados.

```
output/nome-do-projeto/
├── brief.md                      O que foi combinado: ideia, formato,
│                                 tipo de motion, texto, assets usados
├── 01-frame/
│   ├── prompt-frame.txt          O prompt em inglês usado na imagem
│   ├── frame-01.png              Primeira versão
│   ├── frame-02.png              Versões seguintes, se houve ajuste
│   └── _logs/                    Job id, modelo, parâmetros, URL de origem
└── 02-motion/
    ├── prompt-seedance.txt       O prompt de animação
    ├── motion-01.mp4             ← o vídeo
    └── _logs/                    Job id, imagens enviadas e seus UUIDs
```

## A entrega é o MP4

`02-motion/motion-01.mp4` é o resultado final. O sistema sobe as imagens no Seedance sozinho — a imagem aprovada, o produto se houver, e **o logo como arquivo separado**, porque ele não está na imagem e é o que fecha o motion.

O `_logs/` guarda o que foi enviado e com quais UUIDs. Serve pra reproduzir ou depurar um resultado estranho.

## Quando aparece um UPLOAD.md

Só em dois casos: quando a máquina não tem gerador de vídeo, ou quando a geração falhou duas vezes. Aí o arquivo traz a lista de arquivos, os parâmetros e o prompt pronto pra colar no Seedance na mão.

Se o vídeo saiu, esse arquivo não é criado.

## Versões

Ajustes geram arquivo novo (`frame-02.png`, `motion-02.mp4`), nunca sobrescrevem. Assim dá para voltar atrás e comparar.

## Slug

Minúsculo, com hífen, sem acento: `nike-lancamento-inverno`, `cliente-x-institucional`.
