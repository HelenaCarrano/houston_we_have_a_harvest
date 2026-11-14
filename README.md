# NasaApp 🚀

Projeto moderno desenvolvido com **Next.js** (App Router), **TypeScript**, **Tailwind CSS v4** e **shadcn/ui**.

---

## 🛠️ Tecnologias Utilizadas

- **[Next.js 16](https://nextjs.org/)** — Framework React com App Router e Turbopack
- **[React 19](https://react.dev/)** — Biblioteca para interfaces de usuário
- **[TypeScript](https://www.typescriptlang.org/)** — Tipagem estática
- **[Tailwind CSS v4](https://tailwindcss.com/)** — Framework de estilização utility-first
- **[shadcn/ui](https://ui.shadcn.com/)** — Biblioteca de componentes reutilizáveis e acessíveis
- **[Lucide React](https://lucide.dev/)** — Ícones modernos
- **[NVM](https://github.com/nvm-sh/nvm)** — Gerenciador de versões do Node.js (configurado com `.nvmrc`)

---

## 📋 Pré-requisitos

Recomendamos o uso do **[nvm](https://github.com/nvm-sh/nvm)** para garantir a versão correta do Node.js:

```bash
# Carregar a versão do Node.js definida no .nvmrc
nvm use

# Caso não tenha a versão instalada:
nvm install
```

---

## 🚀 Como Executar o Projeto

1. **Instale as dependências (se ainda não o fez):**
   ```bash
   npm install
   ```

2. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

3. **Abra no navegador:**
   Acesse [http://localhost:3000](http://localhost:3000)

---

## 📦 Scripts Disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor local de desenvolvimento |
| `npm run build` | Cria a versão otimizada para produção |
| `npm run start` | Executa o build de produção localmente |
| `npm run lint` | Executa o linter ESLint |

---

## 🧩 Adicionando Componentes do shadcn/ui

Para adicionar novos componentes da biblioteca `shadcn/ui`, execute:

```bash
npx shadcn@latest add <nome-do-componente>
```

**Exemplos:**
```bash
# Adicionar Card, Dialog ou Input
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add input
```

Os componentes serão adicionados automaticamente na pasta `src/components/ui/`.

---

## 📁 Estrutura de Pastas

```text
├── .nvmrc                   # Versão definida do Node.js
├── components.json          # Configuração do shadcn/ui
├── next.config.ts           # Configurações do Next.js
├── package.json             # Dependências e scripts
├── tsconfig.json            # Configuração do TypeScript
└── src/
    ├── app/                 # App Router (páginas, layouts, estilos globais)
    │   ├── globals.css      # Estilos globais e Tailwind v4
    │   ├── layout.tsx       # Layout raiz
    │   └── page.tsx         # Página inicial
    ├── components/
    │   └── ui/              # Componentes do shadcn/ui (Button, etc.)
    └── lib/
        └── utils.ts         # Utilitários (ex: cn helper)
```
