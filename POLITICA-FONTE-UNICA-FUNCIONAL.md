# Política de Fonte Única Funcional

Status: decisão obrigatória de arquitetura e manutenção  
Aplicação: todo o repositório `raiz-engine`  
Componente prioritário: `Cena Raiz Desktop`  
Data da decisão: 2026-08-19  

## 1. Decisão

O Sistema Marca Raiz não manterá várias cópias da mesma implementação dentro do repositório.

Quando um arquivo ou componente for adaptado, a mudança deve convergir para uma única versão funcional e canônica. Arquivos antigos não devem permanecer ao lado dos novos apenas como segurança, lembrança ou referência.

> O estado anterior fica no histórico do Git. A origem fica na documentação de proveniência. No código ativo permanece somente a implementação funcional atual.

Essa política vale para código, configurações, scripts, assets, testes, documentação operacional, nomes de produto e integrações.

## 2. O que esta política proíbe

Não criar ou manter no código ativo:

```text
arquivo-old.ts
arquivo-antigo.ts
arquivo-backup.ts
arquivo-copy.ts
arquivo-final.ts
arquivo-final-2.ts
arquivo-v1.ts e arquivo-v2.ts executando a mesma responsabilidade
legacy/ com uma segunda implementação completa
cena-raiz-desktop-clone/
```

Também não é permitido:

- copiar um módulo antes de editá-lo e deixar a cópia no repositório;
- criar uma aplicação nova e abandonar a aplicação anterior ainda versionada;
- manter dois services, dois schemas ou duas timelines como fontes de verdade;
- conservar assets antigos sem uso depois da substituição;
- duplicar testes para a implementação antiga e a nova sem uma necessidade de migração demonstrada;
- deixar imports, comentários, docs e nomes de testes apontando para identidades que já foram removidas;
- usar uma pasta `legacy/` como destino permanente para código que ninguém pretende executar;
- manter clones externos dentro do produto como forma de consulta.

## 3. O que deve acontecer quando um arquivo for trabalhado

Todo arquivo tocado deve receber uma classificação:

| Decisão | Significado |
|---|---|
| `KEEP` | continua canônico e funcional |
| `RENAME` | muda de nome e todas as referências acompanham |
| `MERGE` | conteúdo útil é incorporado ao arquivo canônico e a duplicata é removida |
| `REMOVE` | não tem função ativa e é retirado após verificação |
| `EXTERNAL` | é referência de terceiro e deve ficar fora do produto |
| `GENERATED` | é reproduzível e deve ser ignorado ou gerado durante build |
| `MIGRATION` | existe temporariamente para converter dados ou contratos e possui condição de remoção |

Nenhum arquivo pode permanecer como `UNKNOWN` ao final de uma fase que alterou seu componente.

## 4. Regra para o Cena Raiz Desktop

O caminho atual é:

```text
cena-raiz/cenaraiz/cena-raiz-desktop
```

Depois da consolidação, seu caminho canônico será:

```text
apps/cena-raiz-desktop
```

Quando a migração desse componente começar, ela deve abranger o componente inteiro. Ao final da fase de identidade:

- interface deve usar `Cena Raiz` e `Cena Raiz Desktop`;
- variáveis e funções devem usar `cenaRaiz` ou `cenaRaizDesktop`;
- types e classes devem usar `CenaRaiz` ou `CenaRaizDesktop`;
- constantes e variáveis de ambiente novas devem usar `CENA_RAIZ_*`;
- packages, títulos, descrições, assets e alt text devem estar coerentes;
- testes, fixtures e documentação ativa devem usar a nomenclatura atual;
- imports devem apontar somente para os arquivos canônicos;
- assets substituídos devem ser removidos depois de não possuírem referências;
- módulos renomeados devem deixar de existir no caminho antigo;
- não deve existir uma segunda pasta do desktop como backup ou clone.

A migração não será considerada concluída enquanto o componente permanecer com uma mistura não justificada de `Edvid`, `cena-raiz`, `Cena Raiz` e identificadores inválidos.

## 5. Renomear por inteiro não significa substituir cegamente

Uma migração completa exige inventário e atualização coordenada, não `search and replace` global.

Para cada nome:

1. localizar todas as definições e usos;
2. identificar se é nome visual, identificador interno, contrato persistido ou infraestrutura externa;
3. escolher o nome canônico correto para aquele contexto;
4. atualizar definição, imports, consumidores, testes e documentação no mesmo lote;
5. criar migração ou fallback apenas quando um consumidor real existir e for comprovado;
6. validar o comportamento;
7. remover o arquivo, símbolo ou asset antigo quando não houver consumidores;
8. confirmar por busca que o legado restante pertence somente à allowlist documentada.

Exemplos de formas canônicas:

| Contexto | Forma correta |
|---|---|
| Produto | `Cena Raiz Desktop` |
| Pasta ou package | `cena-raiz-desktop` |
| Variável TypeScript | `cenaRaizDesktop` |
| Type | `CenaRaizDesktopApi` |
| Constante | `CENA_RAIZ_INSTRUCTIONS` |
| Variável de ambiente | `CENA_RAIZ_FFMPEG` |
| Protocolo | `cena-raiz-media` |

## 6. Compatibilidade não autoriza duas implementações

Alguns contratos antigos podem precisar ser aceitos durante uma transição. Nesses casos, a compatibilidade deve existir dentro da implementação canônica ou em um adapter pequeno e explicitamente temporário.

Exemplo permitido:

```ts
const ffmpegPath =
  process.env.CENA_RAIZ_FFMPEG
  ?? process.env.EDVID_FFMPEG;
```

Existe uma variável canônica nova e apenas uma implementação. O nome antigo é somente uma entrada de compatibilidade.

Exemplos proibidos:

```text
ffmpeg-service.ts
edvid-ffmpeg-service.ts

timeline.ts
timeline-legacy.ts
```

quando ambos implementam permanentemente a mesma responsabilidade.

### Compatibilidade real não é alias especulativo

Duas coisas diferentes costumam ser confundidas sob a palavra "compatibilidade":

| | Alias de identidade | Dependência de infraestrutura |
|---|---|---|
| O que é | manter o nome antigo funcionando ao lado do novo | continuar usando um serviço de terceiro até existir substituto próprio |
| Exemplo | `window.edvidDesktop`, `EDVID_*`, `edvid-media://` | pacote de runtimes e feed de atualização do fornecedor anterior |
| Justificação | só com consumidor real comprovado | necessidade operacional enquanto o substituto não existe |
| Estado atual | **dispensado** — `CLEAN CUT — ACCEPTED` | **ativo** — `INHERITED-INFRASTRUCTURE-DEPENDENCY` |
| Fonte responsável | `PLANO-MIGRACAO-IDENTIDADE.md` § 5 | `docs/integrations/INFRAESTRUTURA-PROPRIA.md` |

Alias de identidade criado por precaução abstrata é exatamente a segunda implementação
que esta política proíbe: código vivo que ninguém consome e ninguém sabe quando remover.
Dependência de infraestrutura herdada é outra coisa — tem consumidor real, tem risco
declarado e tem condição objetiva de encerramento.

Todo fallback temporário precisa declarar:

- contrato antigo aceito;
- consumidor que ainda precisa dele;
- teste de migração;
- condição objetiva de remoção;
- fase do roadmap em que será retirado.

Se não existe consumidor comprovado, não criar compatibilidade especulativa.

## 7. História e proveniência sem duplicação

Preservar a origem do código não significa conservar arquivos antigos no produto.

A separação correta é:

| Necessidade | Local correto |
|---|---|
| recuperar uma versão anterior | histórico Git |
| identificar o projeto de origem | `PROVENANCE.md` |
| manter aviso de licença | `LICENSE` e `NOTICE.md` |
| explicar uma decisão estrutural | `docs/decisions/` |
| consultar código de terceiro | diretório externo ao produto |
| converter dados antigos | migration versionada e temporária |
| executar o produto atual | arquivo canônico atual |

Os avisos MIT e as referências de upstream devem permanecer onde legalmente ou tecnicamente necessários. Isso não exige manter a identidade antiga na interface nem uma cópia da implementação anterior.

## 8. Exceções legítimas

Os itens abaixo podem coexistir quando possuem funções diferentes e explícitas:

- migrations de schema ou dados;
- fixtures de compatibilidade;
- adapters para providers diferentes;
- schemas versionados consumidos por projetos reais;
- assets diferentes com funções criativas distintas;
- documentação de proveniência;
- licenças de terceiros;
- snapshots de teste deliberados;
- builds para plataformas diferentes.
- launchers mínimos por sistema operacional que chamam a mesma lógica canônica de bootstrap.

Esses itens não são duplicatas quando cada um possui responsabilidade, consumidor e ciclo de vida próprios.

Arquivos gerados, caches, runtimes empacotados e outputs não devem ser usados como backup de código-fonte.

Para instalação, a fonte de verdade deve ser única: um manifest de toolchain,
uma orquestração compartilhada e um conjunto de locks versionados. `install.ps1`
e `install.sh` podem preparar ambientes diferentes, mas não podem manter listas
independentes de versões ou comportamentos concorrentes. READMEs explicam como
acionar o bootstrap; não substituem o código e o manifest executáveis.

## 9. Infraestrutura ainda não substituída

Referências como `Creator Factory`, autenticação, entitlement, assinatura, bundle ID, updates e storage podem representar infraestrutura ainda ativa. Elas não devem ser apenas apagadas ou renomeadas enquanto o Sistema Marca Raiz não possuir substitutos funcionais.

A regra é:

1. identificar a dependência real;
2. construir ou configurar o substituto próprio;
3. migrar os consumidores;
4. validar login, build, assinatura e atualização;
5. remover integralmente o código e a configuração anterior que não forem mais necessários;
6. manter somente a referência histórica ou legal aplicável.

Não manter para sempre duas infraestruturas. Também não fingir que a infraestrutura antiga deixou de existir apenas mudando seu texto visível.

## 10. Processo de remoção segura

Uma remoção de arquivo deve seguir esta sequência:

1. confirmar o caminho absoluto do alvo;
2. classificar o arquivo e explicar por que deixou de ser canônico;
3. localizar imports, referências, scripts, testes e documentação;
4. migrar o conteúdo útil para a fonte de verdade;
5. atualizar todos os consumidores;
6. rodar validações proporcionais ao risco;
7. remover o arquivo obsoleto;
8. buscar referências órfãs;
9. revisar o diff;
10. registrar a remoção no commit ou decisão correspondente.

Enquanto não existir commit-base, nenhuma remoção material deve acontecer sem backup externo e aprovação explícita.

## 11. Regra para Codex, VS Code e Claude Code

Toda tarefa que altera um componente deve incluir:

```text
Fonte de verdade:
Arquivos que serão mantidos:
Arquivos que serão renomeados:
Arquivos que serão consolidados:
Arquivos que serão removidos:
Compatibilidade temporária necessária:
Condição de remoção da compatibilidade:
Busca final por nomes e referências antigas:
Testes obrigatórios:
```

Nenhuma ferramenta deve criar cópias de segurança dentro do repositório. Se recuperação adicional for necessária antes do baseline Git, ela deve ficar fora de `raiz-engine/` e ser registrada no inventário.

## 12. Critério de conclusão de uma migração

Uma migração de arquivo, módulo ou componente somente está concluída quando:

- existe uma única implementação canônica para cada responsabilidade;
- todos os imports e consumidores apontam para ela;
- os arquivos substituídos foram removidos;
- não existem cópias `old`, `backup`, `clone`, `copy`, `v1` ou `v2` sem função explícita;
- testes e documentação ativa usam os nomes atuais;
- nomes antigos restantes aparecem somente em allowlist de compatibilidade, migração, licença ou proveniência;
- cada fallback possui condição de remoção;
- build, typecheck e testes relevantes passam ou suas falhas herdadas estão registradas;
- o Git permite recuperar o estado anterior;
- o diff não contém perda acidental de comportamento funcional.

## 13. Aplicação ao plano geral

Esta política acompanha todas as fases do Raiz Engine:

```text
inventariar
→ definir a fonte de verdade
→ adaptar ou construir
→ migrar consumidores
→ validar
→ remover o obsoleto
→ registrar no Git e na proveniência
→ seguir para a próxima capacidade
```

O objetivo não é acumular versões do sistema. É evoluir continuamente uma arquitetura única, funcional, compreensível e recuperável.
