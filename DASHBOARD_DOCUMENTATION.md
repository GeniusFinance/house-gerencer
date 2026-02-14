# Dashboard Feature Documentation

## Overview
The Dashboard provides a comprehensive financial overview with interactive charts, metrics, and filters for tracking income, expenses, credit card payments, and financial projections.

## Features

### 📊 Metric Cards
- **A Receber (To Receive)**: Total pending income from loans and other sources
- **A Pagar (To Pay)**: Total pending credit card payments
- **Total de Despesas (Total Expenses)**: Sum of all expenses in the selected period
- **Saldo (Balance)**: Net balance after all payments

### 📈 Charts

#### Projeção Financeira (Financial Projection)
- Line chart showing projected income vs expenses over time
- Three lines:
  - **A Receber** (Green): Expected income
  - **A Pagar** (Red): Expected payments
  - **Saldo** (Blue): Net balance

#### Despesas por Categoria (Expenses by Category)
- Horizontal bar chart showing expense breakdown by category
- Top 8 categories displayed

#### Receitas por Categoria (Income by Category)
- Horizontal bar chart showing income breakdown by category
- Top 8 categories displayed

### 🔍 Date Filters
- Custom date range selection
- Quick presets:
  - **Este Mês** (This Month)
  - **Últimos 30 dias** (Last 30 Days)
  - **Últimos 90 dias** (Last 90 Days)
  - **Este Ano** (This Year)

### 📋 Summary Cards
- **Transferências**: Total number and value of transfers
- **Receitas**: Total income transactions
- **Compras**: Total credit card purchases

## Data Sources

The dashboard pulls data from Google Sheets with the following pages:

1. **EXPENSE** (Columns: Date, Description, Value, Account, Status, Category, Subcategory, Tags, code)
2. **CREDIT** (Columns: Purchase Date, Validate Date, Description, Value, Account, Status, Category, Subcategory, Tags, Pessoas, Inter pessoal, Observation, Month, Year, code, Comprovante)
3. **INCOME** (Columns: Date, Description, Value, Account, Status, Category, Subcategory, Tags, Comprovante, Código Relacao)
4. **TRANSFERS** (Columns: Date, Conta origem, Conta destino, Value, Tags)

## Navigation

Access the dashboard from the home page by clicking the **"Dashboard Financeiro"** button at the top of the "Acesso Rápido" section.

Direct URL: `/dashboard`

## Technical Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Charts**: Recharts
- **Styling**: Tailwind CSS
- **Date Handling**: date-fns
- **Data Source**: Google Sheets API

## API Endpoint

The dashboard fetches data from:
```
GET /api/dashboard-data?startDate={YYYY-MM-DD}&endDate={YYYY-MM-DD}
```

Response includes:
- Total to receive
- Total to pay
- Expenses array
- Credits array
- Incomes array
- Transfers array
- Projection data

## Browser Compatibility

Optimized for modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Performance

- Server-side data fetching
- Optimized chart rendering with Recharts
- Responsive design for mobile and desktop
