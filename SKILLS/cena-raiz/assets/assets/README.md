# assets/ — os seus arquivos

Coloque aqui o material do projeto. **Tudo é opcional** — dá pra criar só descrevendo o que você quer.

| Pasta | O que vai aqui | Formato ideal |
|---|---|---|
| `logo/` | O logo do cliente | **PNG com fundo transparente** |
| `produto/` | Fotos do produto, embalagem, packshot | PNG ou JPG, fundo limpo |
| `referencias/` | Estilo, paleta, prints, campanhas que você curte | Qualquer imagem |

## A regra mais importante do projeto

**O logo não entra na imagem estática.**

Ele fica aqui, separado, e sobe direto para o Seedance junto com a imagem principal. No motion ele aparece **no final** — sozinho, com a entrada dele.

Por quê: o logo precisa ser uma camada independente. Se ele estivesse desenhado dentro da imagem, entraria junto com o resto da cena e não teria como fechar o filme. Além disso, modelo de imagem redesenha logo — e logo redesenhado é logo errado.

Por isso o sistema **recusa automaticamente** o logo como referência de imagem.

## Sobre as referências

Referência guia **estilo, composição, densidade e paleta**. Ela não é copiada — o sistema olha, entende o que faz aquilo funcionar, e escreve o prompt daquele jeito.

Duas ou três referências boas ajudam mais que dez. Se as referências brigarem entre si (uma minimalista e uma carregada), o resultado fica no meio do caminho.

## Nomes de arquivo

Não precisa de padrão. Mas nomes que dizem o que são (`logo-principal.png`, `produto-frente.jpg`, `ref-colagem-editorial.png`) fazem o sistema acertar mais rápido.

## Não mexemos aqui

O sistema **só lê** esta pasta. Tudo que ele gera vai para `output/`. Seus arquivos originais ficam intactos.
