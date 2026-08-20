# Procedência — remotion-best-practices

| Campo | Valor |
|---|---|
| Origem | <https://github.com/remotion-dev/skills> (subdiretório `skills/remotion-best-practices`) |
| Autoria | Remotion (remotion.dev) |
| Versão vendorizada | 4.0.513 |
| Vendorizado em | 2026-08-20 |
| Classificação | `RENT` — dependência de commodity, mantida a montante |

## Licença

**A licença MIT do Raiz Engine não cobre esta pasta.** O `PROVENANCE.md` da raiz
afirma que "ambos os componentes carregam licença MIT" — isso vale para
`skills/cena-raiz/` e `apps/cena-raiz-desktop/`, não para este terceiro.

O upstream `remotion-dev/skills` não publica arquivo de licença (`license: null`
na API do GitHub, verificado em 2026-08-20) e é espelho de
`remotion-dev/remotion`, `packages/skills`. Vale portanto a
[Remotion License](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md)
— source-available, não OSS:

- **Uso gratuito** para pessoas físicas, organizações sem fins lucrativos e
  empresas com **até 3 funcionários**. Acima disso, é exigida uma
  [Company License](https://www.remotion.pro/license).
- **Vedado** copiar ou modificar código do Remotion para vender, alugar ou
  sublicenciar um derivado **do próprio Remotion**. Usar o Remotion para criar
  vídeos — que é o que a Fase 2 faz — é caso de uso expressamente permitido.

A eventual exigência de Company License decorre de o produto **renderizar com o
`@remotion/cli`**, não de a documentação estar vendorizada aqui: ela existiria
igual se esta pasta não existisse.

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
