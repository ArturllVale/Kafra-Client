# Adicionando Botões de Ação Personalizados

Este guia explica como adicionar novos botões de ação à interface do Patcher. Existem dois métodos: o **Simples** (recomendado, sem código) e o **Avançado** (para lógica personalizada).

---

## Método 1: Simples (Via Configuração)

Você pode adicionar botões apenas editando o arquivo `config.yml`. Ideal para abrir sites ou executáveis simples.

### 1. Abra o arquivo `config.yml`
Localize o arquivo de configuração na pasta do seu patcher/projeto.

### 2. Adicione a seção `custom_actions`
Adicione no arquivo uma lista chamada `custom_actions`.

Exemplo:
```yaml
custom_actions:
  - label: "Loja de Cash"
    type: "link"
    target: "https://seusever.com/loja"
    color: "#fbbf24" # Opcional: Cor hexadecimal (Amarelo)

  - label: "Configurações"
    type: "exe"
    target: "opensetup.exe"
```

### Explicação dos Campos
- **label**: Texto do botão.
- **type**: `exe` (abre programa na pasta) ou `link` (abre site).
- **target**: Nome do arquivo ou URL.
- **color**: Cor de fundo (ex: `#FF0000`).

---

## Método 2: Avançado (Via Código)

Use este método se precisar de comportamentos complexos (ex: lógica condicional, alterar estado da UI, interações avançadas com Electron).

### 1. Adicionar o Botão na Interface (UI)

Abra `src/components/PatcherUI.tsx`.
Encontre a seção "Actions" e adicione seu botão manualmente:

```tsx
<button
    onClick={onMinhaAcao}
    disabled={isPatching}
    className="w-full btn-secondary text-xs disabled:opacity-50"
>
    Minha Ação Especial
</button>
```

### 2. Definir a Propriedade (Prop)

Em `src/components/PatcherUI.tsx`, adicione a nova função à interface `PatcherUIProps` e à desestruturação do componente:

```typescript
interface PatcherUIProps {
    // ...
    onMinhaAcao: () => void;
}

export const PatcherUI: React.FC<PatcherUIProps> = ({
    // ...
    onMinhaAcao,
    // ...
}) => { ... }
```

### 3. Implementar a Lógica em App.tsx

Abra `src/App.tsx`. Crie a função e passe para o componente:

```typescript
const handleMinhaAcao = useCallback(async () => {
    // Sua lógica aqui
    console.log("Botão clicado!");
    
    // Exemplo: Chamar backend
    if (isElectron) {
       await window.patcher.launchExe('especial.exe');
    }
}, []);

// No return:
<PatcherUI
    // ...
    onMinhaAcao={handleMinhaAcao}
/>
```
