# CleanSistem — PDV

Sistema de Ponto de Venda simples para pequenas lojas.

## Estrutura

```
CleanSistem/
├── pdv/           → API backend (.NET 10, armazenamento em memória)
│   └── Pdv.Api/
└── pdv-front/     → Frontend (React + Vite + Tailwind CSS)
```

## Como rodar

### Backend (porta 5000)

```bash
cd pdv/Pdv.Api
dotnet run
# Swagger: http://localhost:5000/swagger
```

### Frontend (porta 5173)

```bash
cd pdv-front
npm install
npm run dev
# App: http://localhost:5173
```

> O Vite faz proxy automático de `/api` → `http://localhost:5000`.

## Funcionalidades

- **Caixa** — leitor de código de barras, carrinho, pagamento (Dinheiro / Pix / Cartão)
- **Produtos** — cadastrar, editar, excluir, busca por nome ou código
- **Estoque** — entrada de produtos com autocomplete
- **Relatórios** — total do dia, número de vendas, mais vendidos
