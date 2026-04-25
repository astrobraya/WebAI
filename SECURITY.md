# Politica de Seguranca

## Versoes suportadas

Projeto em fase de estudo. A manutencao de seguranca considera a branch principal mais recente.

## Como reportar vulnerabilidades

Se voce identificar uma vulnerabilidade, abra uma issue privada se possivel ou entre em contato com o mantenedor descrevendo:

- contexto e impacto
- passos para reproducao
- sugestao de mitigacao

Nao publique exploracoes com detalhes sensiveis antes da correcao.

## Boas praticas adotadas

- Nenhuma chave de API hardcoded no codigo
- Dependencias auditadas com npm audit
- Padrao de variaveis de ambiente com .env.example
- Exclusao de artefatos locais via .gitignore
- Publicacao no npm desativada por default com "private": true

## Checklist antes de cada release

- Executar npm run audit
- Revisar alteracoes com git diff
- Garantir ausencia de segredos no commit
- Validar execucao local apos atualizacoes
