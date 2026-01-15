# Kafra Client - Premium Ragnarok Online Patcher

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Electron](https://img.shields.io/badge/Electron-31.0-47848f.svg)
![React](https://img.shields.io/badge/React-18.3-61dafb.svg)
![Vite](https://img.shields.io/badge/Vite-5.3-646cff.svg)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)

Uma recriação moderna, performática e altamente customizável do clássico **Kafra Client**, desenvolvida com tecnologias web de ponta. Este patcher foi projetado para substituir launchers antigos, oferecendo uma experiência premium para os jogadores e facilidade de configuração para os administradores.

## ✨ Funcionalidades Principais

- 🚀 **Performance Extrema**: Baseado em Electron + Vite para carregamento instantâneo e baixo consumo.
- 🎨 **Interface Premium**: UI moderna com Tailwind CSS, frameless window, animações suaves e glassmorphism.
- 📦 **Patching Nativo GRF**: Implementação do algoritmo **QuickMerge** para injetar arquivos diretamente no `data.grf` sem corrupção, mantendo a integridade do cliente.
- 🎵 **Gerenciamento de Áudio**: BGM integrada com Autoplay inteligente, controle de Mute e pausa automática ao minimizar.
- 🛠️ **Configuração Compatível**: Utiliza o formato `config.yml`, facilitando a migração de servidores existentes.
- 🕹️ **Múltiplos Executáveis**: Suporte flexível para iniciar Jogo, Setup e ferramentas externas.
- 🌗 **Gray Floor Toggle**: Funcionalidade nativa para alternar entre chão normal e cinza via edição automática do `data.ini`.
- 🔐 **SSO Login**: Suporte a login único passando argumentos seguros para o cliente.

---

## 🚀 Guia de Instalação e Uso

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 20 ou superior recomendada)
- [npm](https://www.npmjs.com/) ou [Bun](https://bun.sh/)

### Instalação
1. Clone este repositório:
   ```bash
   git clone https://github.com/SeuUsuario/Kafra-Client.git
   cd Kafra-Client
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

### Desenvolvimento (Rodar Localmente)
Para testar o patcher enquanto edita o código:
```bash
npm run dev
```
*Isso abrirá o servidor Vite e a janela do Electron simultaneamente com Hot Reload.*

### Build (Gerar o Executável)
Para criar a versão final para distribuição aos jogadores:
```bash
npm run build
```
*Os arquivos `.exe` (Instalador e Portátil) serão gerados na pasta `/dist`.*

---

## ⚙️ Guia de Configuração (config.yml)

O coração do patcher é o arquivo `config.yml`. Ele deve ficar na mesma pasta do executável.

### Estrutura Completa
```yaml
# Configurações da Janela
window:
  title: "Kafra Client"      # Título da janela e barra de tarefas
  width: 900                 # Largura em pixels
  height: 600                # Altura em pixels
  resizable: false           # Permitir redimensionar?

# Configurações do Botão "Jogar"
play:
  path: "ragnarok.exe"       # Executável do jogo
  arguments: []              # Argumentos extras (ex: -1rag1)
  exit_on_success: true      # Fechar o patcher ao abrir o jogo?

# Configurações do Cliente e GRF
client:
  default_grf_name: "data.grf"  # GRF principal onde os patches serão injetados
  bgm: "bgm.mp3"                # Música de fundo (deve estar na pasta /public no dev ou raiz no prod)
  
  # Sistema de Gray Floor (Toggle no menu de Opções)
  normal_grf: "adata.grf"       # GRF com chão normal
  gray_grf: "sdata.grf"         # GRF com chão cinza

# Servidores de Patch
web:
  index_url: "http://site.com/news"  # URL para a área de notícias (WebView)
  patch_servers:
    - name: "Principal"
      plist_url: "http://site.com/patchlist.txt"  # Lista de patches
      patch_url: "http://site.com/patches/"       # Pasta com os .thor
```

---

## 🖌️ Customização Visual (Tema)

O visual do patcher é construído com **React** e **Tailwind CSS**.

### Como editar as cores e imagens:
1.  **Plano de Fundo**:
    *   Substitua a imagem em `src/assets/bg.jpg` (ou configure no CSS).
    *   Arquivo: `src/index.css` (classe `body`).

2.  **Cores e Botões**:
    *   As cores são definidas usando classes utilitárias do Tailwind (ex: `bg-blue-600`, `text-white`).
    *   Arquivo principal da UI: `src/components/PatcherUI.tsx`.
    *   Barra de Progresso: `src/components/ProgressBar.tsx`.

3.  **Ícone**:
    *   Substitua o arquivo `public/icon.ico` pelo ícone do seu servidor.
    *   *Nota: É necessário reconstruir o executável (`npm run build`) para atualizar o ícone.*

---

## 📂 Estrutura de Arquivos do Servidor

Para que o atualizador funcione, seu servidor web deve ter a seguinte estrutura:

```text
/patches/
├── patchlist.txt      # Arquivo de controle de versões
├── patch001.thor      # Arquivo de patch compactado
├── patch002.thor
└── ...
```

### Formato do patchlist.txt
O arquivo deve ser texto puro, onde cada linha contém o **ID** (sequencial) e o **NOME DO ARQUIVO**:

```text
1 patch001.thor
2 patch002.thor
3 patch003.thor
// Linhas com // ou # são ignoradas
```

---

## 🛠️ Arquitetura Técnica

- **electron/**: Processo Principal (Node.js). Gerencia janelas, arquivos (GRF/IO) e executa o jogo.
  - `patcher/grf/`: Módulo nativo de leitura e escrita de GRF (v2.0).
  - `patcher/thorPatcher.ts`: Lógica híbrida que decide entre extrair para disco ou injetar no GRF.
- **src/**: Processo de Renderização (React). Toda a interface visual.
- **dist-electron/**: Código compilado do Electron (gerado automaticamente).
- **dist/**: Executáveis finais para distribuição.

---

### Criado por Artur Vale
*Documentação gerada automaticamente para o projeto Kafra Client.*
