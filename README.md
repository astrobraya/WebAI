# WebAI Multimodal

Idioma: [PT-BR](README.md) | [EN](README.en.md)

<p align="center">
  <img alt="Status" src="https://img.shields.io/badge/status-estudo%20ativo-0a7ea4">
  <img alt="Node" src="https://img.shields.io/badge/node-18%2B-3c873a">
  <img alt="Frontend" src="https://img.shields.io/badge/frontend-HTML%20%7C%20CSS%20%7C%20JS-1f2937">
  <img alt="License" src="https://img.shields.io/badge/license-ISC-4b5563">
</p>

Aplicacao web de estudo em IA aplicada, com suporte multimodal (texto, imagem e audio), usando APIs nativas do Chrome para gerar respostas em streaming e traduzir automaticamente para portugues.

---

## Sumario

- [Visao Geral](#visao-geral)
- [Explicacao do Projeto](#explicacao-do-projeto)
- [Funcionalidades](#funcionalidades)
- [Requisitos Necessarios](#requisitos-necessarios)
- [Passo a Passo de Execucao](#passo-a-passo-de-execucao)
- [Licenca](#licenca)

---

## Visao Geral

| Item | Descricao |
| --- | --- |
| Objetivo | Demonstrar IA no navegador sem backend dedicado |
| Entrada | Texto, imagem e audio |
| Saida | Resposta em streaming + traducao para portugues |
| Navegador alvo | Google Chrome / Chrome Canary |

---

## Explicacao do Projeto

O WebAI Multimodal foi criado para validar um fluxo de IA executado localmente no navegador, com foco em experiencia interativa e resposta em tempo real.

Fluxo principal da aplicacao:

1. O usuario escreve uma pergunta e, se quiser, anexa uma imagem ou audio.
2. O sistema envia o conteudo para o modelo nativo de linguagem do Chrome.
3. A resposta e exibida em streaming, atualizando a interface progressivamente.
4. Ao final da geracao, o texto em ingles e traduzido para portugues.
5. O usuario pode ajustar parametros (Temperature e Top K) para controlar o comportamento da resposta.

> Projeto voltado para estudo de Engenharia de Software com IA aplicada e exploracao de APIs experimentais da Web Platform.

---

## Funcionalidades

### 1) Interacao multimodal
- Aceita pergunta em texto.
- Permite anexar imagem ou audio para contexto adicional.

### 2) Resposta em streaming
- Exibe a resposta enquanto ela esta sendo gerada.
- Melhora a percepcao de desempenho da interface.

### 3) Controle de parametros do modelo
- Temperature: controla criatividade/variacao das respostas.
- Top K: controla o conjunto de tokens candidatos por etapa.

### 4) Traducao automatica
- Detecta idioma e traduz de ingles para portugues quando necessario.

### 5) Interface focada em uso local
- Estrutura simples para testes rapidos.
- Separacao por camadas (controller, services, view) para facilitar manutencao.

---

## Requisitos Necessarios

### Ambiente
- Node.js 18 ou superior
- npm (instalado junto com Node.js)

### Navegador
- Google Chrome ou Chrome Canary em versao recente

### Flags do Chrome (obrigatorias)
- chrome://flags/#prompt-api-for-gemini-nano
- chrome://flags/#translation-api
- chrome://flags/#language-detector-api

> Importante: apos ativar as flags, reinicie o navegador.

---

## Passo a Passo de Execucao

### 1) Clonar o repositorio
```bash
git clone https://github.com/astrobraya/WebAI.git
cd WebAI
```

### 2) Instalar dependencias
```bash
npm install
```

### 3) Iniciar o servidor local
```bash
npm start
```

### 4) Abrir no navegador
```text
http://localhost:8080
```

### 5) Validar pre-requisitos no Chrome
- Confirmar que as 3 flags estao habilitadas.
- Reiniciar o Chrome se necessario.

### 6) Testar o fluxo
- Ajustar Temperature e Top K.
- Digitar pergunta (com ou sem anexo).
- Enviar e acompanhar a resposta em streaming.
- Verificar traducao final para portugues.

---

## Licenca

ISC
