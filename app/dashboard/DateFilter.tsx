"use client";

import React, { useState } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";

interface DateFilterProps {
  readonly onFilterChange: (startDate: string, endDate: string) => void;
}

export default function DateFilter({ onFilterChange }: DateFilterProps) {
  const today = new Date();
  const [startDate, setStartDate] = useState(
    format(startOfMonth(today), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(format(endOfMonth(today), "yyyy-MM-dd"));

  const handleApplyFilter = () => {
    onFilterChange(startDate, endDate);
  };

  const handlePreset = (preset: string) => {
    const today = new Date();
    let start: Date;
    let end: Date;

    switch (preset) {
      case "this-month":
        start = startOfMonth(today);
        end = endOfMonth(today);
        break;
      case "last-30-days":
        start = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        end = today;
        break;
      case "last-90-days":
        start = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
        end = today;
        break;
      case "this-year":
        start = new Date(today.getFullYear(), 0, 1);
        end = today;
        break;
      default:
        return;
    }

    const formattedStart = format(start, "yyyy-MM-dd");
    const formattedEnd = format(end, "yyyy-MM-dd");
    
    setStartDate(formattedStart);
    setEndDate(formattedEnd);
    onFilterChange(formattedStart, formattedEnd);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-end gap-4">
        <div className="flex-1">
          <label
            htmlFor="start-date"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Data Inicial
          </label>
          <input
            type="date"
            id="start-date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="flex-1">
          <label
            htmlFor="end-date"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Data Final
          </label>
          <input
            type="date"
            id="end-date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <button
          onClick={handleApplyFilter}
          className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Aplicar Filtro
        </button>
      </div>
      
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="text-sm text-gray-600 mr-2">Períodos rápidos:</span>
        <button
          onClick={() => handlePreset("this-month")}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          Este Mês
        </button>
        <button
          onClick={() => handlePreset("last-30-days")}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          Últimos 30 dias
        </button>
        <button
          onClick={() => handlePreset("last-90-days")}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          Últimos 90 dias
        </button>
        <button
          onClick={() => handlePreset("this-year")}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          Este Ano
        </button>
      </div>
    </div>
  );
}
