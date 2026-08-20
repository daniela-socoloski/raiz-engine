# Procedência — remotion-motion-graphics

| Campo | Valor |
|---|---|
| Origem | <https://github.com/haidrrrry/claude-remotion-skill> (subdiretório `remotion-motion-graphics`) |
| Autoria | haidrrrry |
| Licença | ver `LICENSE` no repositório de origem |
| Vendorizado em | 2026-08-20 |
| Classificação | `EXTEND` — base de ofício, a ser adaptada à marca |

## O que é, e o que não é

Não é versão nem fork do `remotion-best-practices`. São eixos diferentes:

| | remotion-best-practices | remotion-motion-graphics |
|---|---|---|
| Autoria | Remotion (oficial) | terceiro |
| Ensina | usar a API corretamente | ofício de motion design |
| Cobre `stagger` | não | sim |
| Cobre Ken Burns, grain, vignette | não | sim |

Medido: nas 19 pastas do pack oficial, `stagger`, `Ken Burns` e `grain` não
aparecem em nenhum arquivo. Saber usar `interpolate()` não impede o resultado de
parecer vídeo genérico de IA — e é esse buraco que esta skill preenche.

## Onde encaixa na arquitetura

Responde por **Motion Intelligence** (§6.2 do plano audiovisual), a única
responsabilidade que ainda não tinha nada por trás. O Motion Asset Registry sabe
quais assets existem e se são compatíveis; não sabe se o movimento ficou bom.

## Adaptação pendente

`assets/theme.ts` traz um tema fixo — cores, easings, presets de mola, fontes.
Enquanto for constante, toda marca recebe o mesmo movimento, o que contradiz a
hipótese central do motor: marcas diferentes devem produzir decisões
perceptivelmente diferentes.

A adaptação prevista é alimentar esse tema a partir do `BrandRuntimeProfile`, para
que a marca comande ritmo, energia e paleta. Até isso acontecer, as regras de
ofício valem, mas o tema não deve ser usado como está.

## Como atualizar

```bash
git clone --depth 1 https://github.com/haidrrrry/claude-remotion-skill /tmp/crs
cp -r /tmp/crs/remotion-motion-graphics skills/
# preserve este arquivo
```

Sendo skill de terceiro sem versionamento declarado, confira o diff antes de
aceitar: uma mudança nas regras de ofício muda o resultado de todo vídeo.
