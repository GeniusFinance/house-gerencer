import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { addMonths, format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProjectionChartProps {
  readonly data: Array<{
    date: string;
    toReceive: number;
    toPay: number;
    balance: number;
  }>;
  readonly onMonthChange?: (startDate: Date, endDate: Date) => void;
}

export default function ProjectionChart({ data, onMonthChange }: ProjectionChartProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthsToProject, setMonthsToProject] = useState(1);

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return "";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handlePreviousMonth = () => {
    const newMonth = addMonths(currentMonth, -1);
    setCurrentMonth(newMonth);
    if (onMonthChange) {
      const start = startOfMonth(newMonth);
      const end = endOfMonth(addMonths(newMonth, monthsToProject - 1));
      onMonthChange(start, end);
    }
  };

  const handleNextMonth = () => {
    const newMonth = addMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
    if (onMonthChange) {
      const start = startOfMonth(newMonth);
      const end = endOfMonth(addMonths(newMonth, monthsToProject - 1));
      onMonthChange(start, end);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    if (onMonthChange) {
      const start = startOfMonth(today);
      const end = endOfMonth(addMonths(today, monthsToProject - 1));
      onMonthChange(start, end);
    }
  };

  const handleMonthsChange = (months: number) => {
    setMonthsToProject(months);
    if (onMonthChange) {
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(addMonths(currentMonth, months - 1));
      onMonthChange(start, end);
    }
  };

  const getMonthLabel = () => {
    const start = format(currentMonth, "MMMM yyyy", { locale: ptBR });
    if (monthsToProject > 1) {
      const endMonth = format(addMonths(currentMonth, monthsToProject - 1), "MMMM yyyy", { locale: ptBR });
      return `${start.charAt(0).toUpperCase() + start.slice(1)} - ${endMonth.charAt(0).toUpperCase() + endMonth.slice(1)}`;
    }
    return start.charAt(0).toUpperCase() + start.slice(1);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center">
          <svg
            className="w-5 h-5 text-indigo-600 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900">
            Projeção Financeira
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
            <button
              onClick={handlePreviousMonth}
              className="p-2 hover:bg-white rounded-md transition-colors"
              title="Mês anterior"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={handleToday}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-white rounded-md transition-colors min-w-[180px]"
            >
              {getMonthLabel()}
            </button>
            
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-white rounded-md transition-colors"
              title="Próximo mês"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 font-medium whitespace-nowrap">Projetar:</span>
            <div className="flex gap-1 bg-gray-50 rounded-lg p-1">
              {[1, 2, 3, 6].map((months) => (
                <button
                  key={months}
                  onClick={() => handleMonthsChange(months)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    monthsToProject === months
                      ? "bg-indigo-600 text-white"
                      : "text-gray-600 hover:bg-white"
                  }`}
                >
                  {months} {months === 1 ? "mês" : "meses"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-[350px] text-gray-500">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p>Nenhum dado disponível para este período</p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              stroke="#9CA3AF"
              style={{ fontSize: "12px" }}
            />
            <YAxis
              stroke="#9CA3AF"
              style={{ fontSize: "12px" }}
              tickFormatter={formatCurrency}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "12px",
              }}
              formatter={(value) => formatCurrency(value as number)}
            />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="circle"
            />
            <Line
              type="monotone"
              dataKey="toReceive"
              stroke="#10B981"
              strokeWidth={2}
              name="A Receber"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="toPay"
              stroke="#EF4444"
              strokeWidth={2}
              name="A Pagar"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="#6366F1"
              strokeWidth={2}
              name="Saldo"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
