# WebAI Multimodal

Aplicacao web de estudo que usa APIs nativas de IA do Chrome para responder perguntas com suporte a texto, imagem e audio, com traducao do resultado para portugues.

## Explicacao breve do projeto

O WebAI Multimodal foi criado para explorar recursos de IA executados no navegador, sem backend dedicado. O fluxo principal recebe uma pergunta, opcionalmente um arquivo de imagem ou audio, gera resposta em ingles via modelo local do Chrome e traduz o resultado para portugues.

## Funcionalidades

- Perguntas em linguagem natural com resposta em streaming
- Entrada multimodal (texto, imagem e audio)
- Ajuste de parametros do modelo (Temperature e Top K)
- Traducao automatica de ingles para portugues
- Interface responsiva para testes locais

## Requisitos

- Node.js 18+ (recomendado)
- Google Chrome ou Chrome Canary atualizado
- Flags experimentais habilitadas no Chrome:
  - chrome://flags/#prompt-api-for-gemini-nano
  - chrome://flags/#translation-api
  - chrome://flags/#language-detector-api

## Como executar o projeto

1. Instale as dependencias:
   - npm install
2. Inicie o servidor local:
   - npm start
3. Abra no navegador:
   - http://localhost:8080
4. Garanta que as flags do Chrome estejam ativadas e reinicie o navegador.

## Processo de seguranca aplicado

- .gitignore criado para evitar envio de dependencias, logs e arquivos locais
- Arquivo .env.example criado para padronizar futuras configuracoes sem expor segredos
- package.json configurado com "private": true para evitar publicacao acidental no npm
- Auditoria de dependencias executada com npm audit (0 vulnerabilidades)
- SECURITY.md adicionado com diretrizes de reporte e boas praticas

## Publicacao no GitHub (passo a passo)

1. Inicialize o Git no projeto:
   - git init -b main
2. Adicione os arquivos:
   - git add .
3. Crie o commit inicial:
   - git commit -m "chore: setup inicial com seguranca e documentacao"
4. Crie um repositorio vazio no GitHub (sem README).
5. Conecte o remoto:
   - git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
6. Envie para o GitHub:
   - git push -u origin main

## Scripts uteis

- npm start: sobe servidor local na porta 8080
- npm run audit: verifica vulnerabilidades
- npm run audit:fix: aplica correcoes automaticas quando disponiveis

## Estrutura

- index.html
- index.js
- style.css
- controllers/
- services/
- views/

## Licenca

ISC
