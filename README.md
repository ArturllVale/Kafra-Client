# Kafra Client - Ragnarok Online Patcher

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Electron](https://img.shields.io/badge/Electron-31.0-47848f.svg)
![React](https://img.shields.io/badge/React-18.3-61dafb.svg)
![Vite](https://img.shields.io/badge/Vite-5.3-646cff.svg)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)

Uma recriação moderna, performática e altamente customizável do clássico **RPatchur**, desenvolvida com tecnologias web de ponta. Este patcher foi projetado para substituir launchers antigos, oferecendo uma experiência premium para os jogadores e facilidade de configuração para os administradores.

## ✨ Funcionalidades

- 🚀 **Performance Extrema**: Desenvolvido com Electron + Vite para carregamento instantâneo.
- 🎨 **Interface Premium**: UI moderna com Tailwind CSS, frameless window, animações suaves e glassmorphism.
- 🎵 **BGM Integrada**: Suporte a música de fundo com controle de Mute na barra de título.
- 🛠️ **Configuração Compatível**: Utiliza o formato `rpatchur.yml`, facilitando a migração de servidores existentes.
- 📦 **Patching THOR**: Suporte completo para download e extração de arquivos de patch `.thor`.
- 🕹️ **Múltiplos Executáveis**: Botões dedicados para Iniciar Jogo, Setup e ações manuais.
- 🌗 **Gray Floor Toggle**: Funcionalidade nativa para alternar entre chão normal e cinza via edição automática do `data.ini`.
- 🔐 **SSO Login**: Suporte a login único diretamente pelo launcher.
- 🚉 **Multi-Mirror**: Sistema de múltiplos servidores de patch para maior confiabilidade.

## 🚀 Como Iniciar

### Pré-requisitos
- [Node.js](https://nodejs.org/) (recomendado v20+)
- [npm](https://www.npmjs.com/) ou [Bun](https://bun.sh/)

### Instalação
```bash
# Clone o projeto
git clone [URL_DO_REPOSITORIO]

# Instale as dependências
npm install
```

### Desenvolvimento
```bash
# Inicie o servidor Vite e o Electron
npm run dev
```

### Build (Gerar o .exe)
```bash
# Gera o instalador (NSIS) e a versão portátil na pasta /dist
npm run build
```

## ⚙️ Configuração

Toda a personalização é feita através do arquivo `rpatchur.yml`. Você pode definir:
- Título e dimensões da janela.
- Caminhos dos executáveis do jogo.
- URLs dos servidores de patch e arquivos `plist.txt`.
- Nomes das GRFs para o sistema de Gray Floor.

## 📂 Estrutura do Projeto

- `electron/`: Código do processo principal (Main) e lógica de patching.
- `src/`: Interface em React (Renderer), componentes e estilos.
- `public/`: Assets estáticos e ícones.
- `dist/`: Onde seu executável será gerado após o build.

---

### Criado por Artur Vale com <3
