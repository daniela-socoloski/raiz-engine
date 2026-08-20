# Procedência — remotion-best-practices

| Campo | Valor |
|---|---|
| Origem | <https://github.com/remotion-dev/skills> (subdiretório `skills/remotion-best-practices`) |
| Autoria | Remotion (remotion.dev) |
| Versão vendorizada | 4.0.513 |
| Vendorizado em | 2026-08-20 |
| Classificação | `RENT` — dependência de commodity, mantida a montante |

## Por que está aqui dentro

É dependência **declarada** da Fase 2 da skill cena-raiz:

- `skills/cena-raiz/SKILL.md:77` manda instalar deste repositório se ausente;
- `skills/cena-raiz/SKILL.md:374` manda carregá-la antes de escrever código Remotion;
- `skills/cena-raiz/install.md:35` a lista como requisito.

Antes vivia apenas em `~/.claude/skills` e `~/.codex/skills`, fora do controle de
versão do motor. O `cenaraiz_install.py` sabe baixá-la, mas isso deixava a Fase 2
dependendo de rede e do GitHub no momento da instalação. Com a cópia aqui, um
clone do raiz-engine já traz o que a documentação exige.

## Como atualizar

O upstream versiona sozinho. Para trazer uma versão nova:

```bash
git clone --depth 1 https://github.com/remotion-dev/skills /tmp/remotion-skills
rm -rf skills/remotion-best-practices
cp -r /tmp/remotion-skills/skills/remotion-best-practices skills/
# preserve este arquivo e atualize a linha "Versão vendorizada" acima
```

O upstream já renomeou `skills/remotion` para `skills/remotion-best-practices` e
transformou a skill num roteador de sub-skills. O `cenaraiz_install.py:55` aceita
os dois nomes, então instalações antigas continuam funcionando.

## O que não fazer

Não editar o conteúdo desta pasta. Correção ou melhoria vai para o upstream; uma
edição local seria perdida na próxima atualização e o motor passaria a depender
de um comportamento que não existe em lugar nenhum.
