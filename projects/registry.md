# Registro de projetos

Projetos e fontes canônicas verificadas do ecossistema T.O.N.Y.

| Projeto | Domínio | Fonte verificada | Papel / estado |
| --- | --- | --- | --- |
| TONNY_COMMAND_CENTER | Orquestração | `Tonnyboll/TONNY_COMMAND_CENTER` | Cérebro, memória persistente e coordenador de agents |
| Félix | Tecnologia | Catálogo curado local | Contexto arquitetural e de domínio indexado; adaptador de código pendente |
| TONY Hunter | Financeiro / mercado | Catálogo curado local | Contexto de pesquisa somente leitura indexado; adaptador de código pendente |
| Bot de WhatsApp | Tecnologia / operações | Catálogo curado local | Padrões gerais indexados; fonte operacional pendente |
| TonnyBoll Studios | Criativo — braço do TONNY_COMMAND_CENTER | `Tonnyboll/TonnyBoll_Studios` | API/plataforma criativa versionável; abriga TB Lab Kids e TB Lab Stories |

## Modelo de resolução

O usuário fornece a intenção ao cérebro. O T.O.N.Y. recupera contexto, seleciona agents e estrutura a missão. O TonnyBoll Studios recebe essa missão como plataforma criativa, e o laboratório ou projeto correspondente executa o trabalho de domínio.

Para o TB Lab Kids:

`TONNY_COMMAND_CENTER → agents → TonnyBoll_Studios → TB_LAB_KIDS → universo/personagem → episódio/clipe`

Exemplo de objetivo:

`“Criar um vídeo do Melanca buscando viralização”`

O objetivo deve ser convertido em um plano de conceito, roteiro, takes, prompts, validação e distribuição. Viralização é alvo de otimização e teste, não garantia de resultado.

Adicionar novas fontes, APIs e responsáveis somente após verificação. Contextos pessoal, familiar, saúde e financeiro devem permanecer separados e com acesso mínimo necessário.
