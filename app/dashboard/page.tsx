"use client";

import React, { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import MetricCard from "./MetricCard";
import ProjectionChart from "./ProjectionChart";
import CategoryBreakdown from "./CategoryBreakdown";
import DateFilter from "./DateFilter";
import CreditCardBreakdown from "./CreditCardBreakdown";
import { DashboardData, ExpenseRow, SheetRow, IncomeRow } from "@/types/sheet";

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(
    format(startOfMonth(new Date()), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(
    format(endOfMonth(new Date()), "yyyy-MM-dd")
  );
  const [projectionStartDate, setProjectionStartDate] = useState(
    format(startOfMonth(new Date()), "yyyy-MM-dd")
  );
  const [projectionEndDate, setProjectionEndDate] = useState(
    format(endOfMonth(new Date()), "yyyy-MM-dd")
  );

  const fetchDashboardData = async (start: string, end: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/dashboard-data?startDate=${start}&endDate=${end}`,
        { cache: 'no-store' }
      );
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(startDate, endDate);
    fetchProjectionData(projectionStartDate, projectionEndDate);
  }, []);

  const handleFilterChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    fetchDashboardData(start, end);
  };

  const fetchProjectionData = async (start: string, end: string) => {
    try {
      const response = await fetch(
        `/api/dashboard-data?startDate=${start}&endDate=${end}`,
        { cache: 'no-store' }
      );
      const data = await response.json();
      if (data.projectionData) {
        setDashboardData((prev) => prev ? { ...prev, projectionData: data.projectionData } : data);
      }
    } catch (error) {
      console.error("Error fetching projection data:", error);
    }
  };

  const handleProjectionMonthChange = (start: Date, end: Date) => {
    const startStr = format(start, "yyyy-MM-dd");
    const endStr = format(end, "yyyy-MM-dd");
    setProjectionStartDate(startStr);
    setProjectionEndDate(endStr);
    fetchProjectionData(startStr, endStr);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Calculate category breakdowns
  const getCategoryBreakdown = (
    items: (ExpenseRow | SheetRow | IncomeRow)[]
  ) => {
    const categoryMap = new Map<string, number>();

    items.forEach((item) => {
      const category = item.category || "Outros";
      categoryMap.set(category, (categoryMap.get(category) || 0) + item.value);
    });

    return Array.from(categoryMap.entries())
      .map(([category, value]) => ({ category, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  };

  // Calculate credit card breakdown
  const getCreditCardBreakdown = (credits: SheetRow[]) => {
    const cardMap = new Map<string, {
      totalAmount: number;
      itemCount: number;
      pendingAmount: number;
      paidAmount: number;
    }>();

    credits.forEach((credit) => {
      const account = credit.account || "Não especificado";
      const isPending = credit.status.toLowerCase() === "pending" || credit.status.toLowerCase() === "pendente";
      
      if (!cardMap.has(account)) {
        cardMap.set(account, {
          totalAmount: 0,
          itemCount: 0,
          pendingAmount: 0,
          paidAmount: 0,
        });
      }

      const cardData = cardMap.get(account)!;
      cardData.totalAmount += credit.value;
      cardData.itemCount += 1;
      
      if (isPending) {
        cardData.pendingAmount += credit.value;
      } else {
        cardData.paidAmount += credit.value;
      }
    });

    return Array.from(cardMap.entries())
      .map(([account, data]) => ({
        account,
        ...data,
      }))
      .sort((a, b) => b.pendingAmount - a.pendingAmount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Erro ao carregar dados
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Não foi possível carregar os dados do dashboard.
          </p>
        </div>
      </div>
    );
  }

  const totalExpenses = dashboardData.expenses.reduce(
    (sum, expense) => sum + expense.value,
    0
  ) + dashboardData.credits.reduce(
    (sum, credit) => sum + credit.value,
    0
  );
  const totalIncome = dashboardData.incomes.reduce(
    (sum, income) => sum + income.value,
    0
  );
  const balance = totalIncome - totalExpenses;

  console.log("Dashboard data:", dashboardData);
  const expensesByCategory = getCategoryBreakdown([...dashboardData.expenses, ...dashboardData.credits]);
  const incomesByCategory = getCategoryBreakdown(dashboardData.incomes);
  const creditCardSummary = getCreditCardBreakdown(dashboardData.credits);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard Financeiro
        </h1>
        <p className="text-gray-600">
          Visão geral das suas finanças e projeções
        </p>
      </div>

      {/* Date Filter */}
      <DateFilter onFilterChange={handleFilterChange} />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="A Receber"
          value={formatCurrency(dashboardData.totalToReceive)}
          subtitle={`${dashboardData.incomes.filter((i) => i.status.toLowerCase() === "pending").length} pendentes`}
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
        <MetricCard
          title="A Pagar (Cartões)"
          value={formatCurrency(dashboardData.totalToPay)}
          subtitle={`${dashboardData.credits.filter((c) => c.status.toLowerCase() === "pending").length} pendentes`}
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
          }
        />
        <MetricCard
          title="Total de Despesas"
          value={formatCurrency(totalExpenses)}
          subtitle={`${dashboardData.expenses.length + dashboardData.credits.length} transações`}
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
              />
            </svg>
          }
        />
        <MetricCard
          title="Saldo"
          value={formatCurrency(balance)}
          subtitle="Após pagamentos"
          trend={
            balance >= 0
              ? { value: "Positivo", isPositive: true }
              : { value: "Negativo", isPositive: false }
          }
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          }
        />
      </div>

      {/* Credit Card Breakdown */}
      {creditCardSummary.length > 0 && (
        <CreditCardBreakdown data={creditCardSummary} />
      )}

      {/* Projection Chart */}
      {dashboardData.projectionData &&
        dashboardData.projectionData.length > 0 && (
          <ProjectionChart 
            data={dashboardData.projectionData}
            onMonthChange={handleProjectionMonthChange}
          />
        )}

      {/* Category Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {expensesByCategory.length > 0 && (
          <CategoryBreakdown
            data={expensesByCategory}
            title="Despesas por Categoria"
          />
        )}
        {incomesByCategory.length > 0 && (
          <CategoryBreakdown
            data={incomesByCategory}
            title="Receitas por Categoria"
          />
        )}
      </div>

      {/* Additional Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Transferências
            </h3>
            <svg
              className="w-5 h-5 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {dashboardData.transfers.length}
          </p>
          <p className="text-sm text-gray-600">
            Total:{" "}
            {formatCurrency(
              dashboardData.transfers.reduce(
                (sum, transfer) => sum + transfer.value,
                0
              )
            )}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Receitas</h3>
            <svg
              className="w-5 h-5 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 11l5-5m0 0l5 5m-5-5v12"
              />
            </svg>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {dashboardData.incomes.length}
          </p>
          <p className="text-sm text-gray-600">
            Total: {formatCurrency(totalIncome)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Compras</h3>
            <svg
              className="w-5 h-5 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {dashboardData.credits.length}
          </p>
          <p className="text-sm text-gray-600">
            Total:{" "}
            {formatCurrency(
              dashboardData.credits.reduce(
                (sum, credit) => sum + credit.value,
                0
              )
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
