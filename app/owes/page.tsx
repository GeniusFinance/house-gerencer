"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SheetRow } from "@/types/sheet";
import {
  filterByUser,
  calculateTotal,
  formatCurrency,
  parseSheetData,
  sortData,
  SortOption,
} from "@/lib/dataHelpers";

export default function OwesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userName = searchParams.get("user");

  const [data, setData] = useState<SheetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch("/api/sheet-data");
        if (!response.ok) {
          throw new Error("Failed to load data");
        }
        const rawData = await response.json();
        const parsedData = parseSheetData(rawData);
        setData(parsedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mb-4"></div>
          <div className="text-xl text-white font-medium">Carregando...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-red-800 text-xl font-bold mb-2 text-center">
            Error
          </h2>
          <p className="text-red-600 text-center">{error}</p>
        </div>
      </div>
    );
  }

  if (!userName) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-md">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-gray-800 text-xl font-bold mb-2 text-center">
            Missing User Parameter
          </h2>
          <p className="text-gray-600 text-center">
            Please provide a user name in the URL. <br />
            <code className="bg-gray-100 px-3 py-1 rounded-lg mt-3 inline-block text-sm font-mono">
              /owes?user=claudia
            </code>
          </p>
        </div>
      </div>
    );
  }
  const filteredData = filterByUser(data, userName);
  
  // Helper function to parse dates in multiple formats
  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    
    // Try ISO format first (YYYY-MM-DD)
    let date = new Date(dateStr);
    if (!isNaN(date.getTime())) return date;
    
    // Try DD/MM/YYYY format (Brazilian)
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime())) return date;
    }
    
    // Try MM/DD/YYYY format (US)
    const partsUS = dateStr.split('/');
    if (partsUS.length === 3) {
      const [month, day, year] = partsUS;
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime())) return date;
    }
    
    return null;
  };
  
  // Apply date range filter
  const dateFilteredData = filteredData.filter((row) => {
    if (!startDate && !endDate) return true;
    
    const rowDate = parseDate(row.validateDate);
    if (!rowDate) return true; // Include invalid dates
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include the entire end date
      return rowDate >= start && rowDate <= end;
    } else if (startDate) {
      const start = new Date(startDate);
      return rowDate >= start;
    } else if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include the entire end date
      return rowDate <= end;
    }
    
    return true;
  });
  
  const sortedData = sortData(dateFilteredData, sortBy);
  const totalOwed = calculateTotal(dateFilteredData);

  const handleUserChange = (newUser: string) => {
    router.push(`/owes?user=${encodeURIComponent(newUser)}`);
  };

  return (
    <div className="min-h-screen py-6 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Filter and Sort Controls */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-4 mb-4">
          <div className="flex flex-col gap-4">
            {/* Date Range Filter */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  Data Inicial
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  Data Final
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Clear Date Filter Button */}
            {(startDate || endDate) && (
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Limpar Filtro de Data
                </button>
              </div>
            )}

            {/* Sort Control */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex-1 w-full sm:w-auto">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    Ordenar Por
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="w-full sm:w-64 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="date-desc">Data (Mais Recente)</option>
                    <option value="date-asc">Data (Mais Antiga)</option>
                    <option value="value-desc">Valor (Maior)</option>
                    <option value="value-asc">Valor (Menor)</option>
                    <option value="category">Categoria (A-Z)</option>
                    <option value="status">Status</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Header Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl sm:text-3xl font-bold uppercase">
                  {userName.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">
                  Debts for
                </p>
                <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 capitalize">
                  {userName}
                </h1>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl p-6 sm:p-8 shadow-xl">
            <p className="text-red-100 text-sm font-medium mb-2 uppercase tracking-wide">
              Total Outstanding
            </p>
            <div className="text-4xl sm:text-5xl font-bold text-white mb-3">
              {formatCurrency(totalOwed)}
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                <span className="text-white text-sm font-semibold">
                  {dateFilteredData.length}{" "}
                  {dateFilteredData.length === 1 ? "item" : "items"}
                </span>
              </div>
              {(startDate || endDate) && (
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="text-white text-xs font-medium">
                    📅 Filtrado
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {dateFilteredData.length === 0 ? (
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              All Clear!
            </h3>
            <p className="text-gray-500">No debts found for this user.</p>
          </div>
        ) : (
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden">
            {/* Mobile view - Cards */}
            <div className="sm:hidden divide-y divide-gray-100">
              {sortedData.map((row, index) => (
                <div
                  key={index}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {row.description}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {row.purchaseDate}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-gray-900">
                        {formatCurrency(row.value)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                        {row.category}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          row.status.toLowerCase() === "paid" ||
                          row.status.toLowerCase() === "pago"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {row.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop view - Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Data da compra
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Descrição
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Categoria
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Conta
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedData.map((row, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {row.purchaseDate}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {row.description}
                        </div>
                        {row.observation && (
                          <div className="text-xs text-gray-500 mt-1">
                            {row.observation}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-bold text-gray-900">
                          {formatCurrency(row.value)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-700">
                          {row.category}
                        </div>
                        {row.subcategory && (
                          <div className="text-xs text-gray-500">
                            {row.subcategory}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            row.status.toLowerCase() === "paid" ||
                            row.status.toLowerCase() === "pago"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {row.account}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
