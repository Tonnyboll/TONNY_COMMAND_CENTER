# Ingestão de conhecimento do Git

## Objetivo

Transformar o que já foi implementado em padrões reutilizáveis para novos projetos, preservando evidência e privacidade.

## Fluxo

```text
Repositórios autorizados
        ↓
Inventário de árvores e fontes
        ↓
Documentação + testes + estado real
        ↓
Padrão curado / decisão / evidência
        ↓
Knowledge Layer
        ↓
Contexto mínimo no projeto ativado
```

## O que entra no conhecimento compartilhável

- regras arquiteturais gerais;
- invariantes de domínio sem dados pessoais;
- padrões de testes e quality gates;
- práticas de observabilidade e auditoria;
- fluxos de produção e documentação reutilizáveis.

## O que fica somente local

- nomes e caminhos de repositórios privados;
- inventário detalhado de arquivos;
- decisões internas e referências que identifiquem sistemas confidenciais;
- qualquer segredo, token, credencial ou dado pessoal;
- código fonte bruto.

O catálogo local é carregado pela variável `TONY_PRIVATE_KNOWLEDGE_FILE` ou pelo caminho padrão `data/knowledge/private-curated.json`. A Knowledge Layer deve retornar contexto com estado explícito `ANALISADO`; ela não deve afirmar que executou uma prática só porque encontrou sua documentação.

## Atualizações

Uma nova varredura deve comparar o catálogo anterior, marcar fontes alteradas, revisar padrões afetados e registrar uma nova missão. Padrões conflitantes não devem ser sobrescritos silenciosamente: registrar a evidência, a decisão vigente e a fonte substituída.
