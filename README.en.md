# WebAI Multimodal

Language: [PT-BR](README.md) | [EN](README.en.md)

<p align="center">
  <img alt="Status" src="https://img.shields.io/badge/status-active%20study-0a7ea4">
  <img alt="Node" src="https://img.shields.io/badge/node-18%2B-3c873a">
  <img alt="Frontend" src="https://img.shields.io/badge/frontend-HTML%20%7C%20CSS%20%7C%20JS-1f2937">
  <img alt="License" src="https://img.shields.io/badge/license-ISC-4b5563">
</p>

Applied AI study web app with multimodal support (text, image, and audio), using Chrome native APIs to generate streaming responses and automatically translate them into Portuguese.

---

## Summary

- [Overview](#overview)
- [Project Explanation](#project-explanation)
- [Features](#features)
- [Required Prerequisites](#required-prerequisites)
- [Step-by-Step Execution](#step-by-step-execution)
- [License](#license)

---

## Overview

| Item | Description |
| --- | --- |
| Goal | Demonstrate browser-based AI without a dedicated backend |
| Input | Text, image, and audio |
| Output | Streaming response + Portuguese translation |
| Target browser | Google Chrome / Chrome Canary |

---

## Project Explanation

WebAI Multimodal was created to validate a browser-local AI flow, focusing on interactive experience and real-time responses.

Main application flow:

1. The user writes a prompt and can optionally attach an image or audio file.
2. The app sends the content to Chrome's native language model.
3. The response is displayed in streaming mode, updating the UI progressively.
4. After generation completes, the English response is translated into Portuguese.
5. The user can tune parameters (Temperature and Top K) to control response behavior.

> This project is focused on Software Engineering study with applied AI and exploration of experimental Web Platform APIs.

---

## Features

### 1) Multimodal interaction
- Accepts text prompts.
- Allows optional image or audio attachments for extra context.

### 2) Streaming responses
- Displays output while the model is still generating.
- Improves perceived responsiveness of the interface.

### 3) Model parameter controls
- Temperature: controls creativity and variability of responses.
- Top K: controls the candidate token set per generation step.

### 4) Automatic translation
- Detects language and translates English to Portuguese when needed.

### 5) Local-first interface
- Simple structure for quick local testing.
- Layered architecture (controller, services, view) to support maintainability.

---

## Required Prerequisites

### Environment
- Node.js 18 or higher
- npm (installed with Node.js)

### Browser
- Google Chrome or Chrome Canary (recent version)

### Required Chrome flags
- chrome://flags/#prompt-api-for-gemini-nano
- chrome://flags/#translation-api
- chrome://flags/#language-detector-api

> Important: after enabling flags, restart the browser.

---

## Step-by-Step Execution

### 1) Clone the repository
```bash
git clone <REPOSITORY_URL>
cd WebAI
```

### 2) Install dependencies
```bash
npm install
```

### 3) Start the local server
```bash
npm start
```

### 4) Open in the browser
```text
http://localhost:8080
```

### 5) Validate Chrome prerequisites
- Confirm that the 3 required flags are enabled.
- Restart Chrome if necessary.

### 6) Test the full flow
- Adjust Temperature and Top K.
- Enter a prompt (with or without attachment).
- Submit and watch the streaming output.
- Verify the final Portuguese translation.

---

## License

ISC
