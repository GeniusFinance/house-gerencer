'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SheetRow } from '@/types/sheet';
import { filterByMonth, groupByUser, calculateTotal, formatCurrency, parseSheetData, getMonthName, sortData, SortOption } from '@/lib/dataHelpers';

export default function MonthPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const month = searchParams.get('month');
  const year = searchParams.get('year');
  
  const [data, setData] = useState<SheetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [availableMonths, setAvailableMonths] = useState<{month: string, year: string}[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api/sheet-data');
        if (!response.ok) {
          throw new Error('Failed to load data');
        }
        const rawData = await response.json();
        const parsedData = parseSheetData(rawData);
        setData(parsedData);
        
        // Extract unique month/year combinations
        const monthYears = Array.from(
          new Set(
            parsedData
              .filter(row => row.month && row.year)
              .map(row => `${row.month}-${row.year}`)
          )
        ).map(combo => {
          const [m, y] = combo.split('-');
          return { month: m, year: y };
        }).sort((a, b) => {
          if (a.year !== b.year) return b.year.localeCompare(a.year);
          return b.month.localeCompare(a.month);
        });
        setAvailableMonths(monthYears);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
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
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-red-800 text-xl font-bold mb-2 text-center">Erro</h2>
          <p className="text-red-600 text-center">{error}</p>
        </div>
      </div>
    );
  }

  if (!month || !year) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-md">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-gray-800 text-xl font-bold mb-2 text-center">Parâmetros Ausentes</h2>
          <p className="text-gray-600 text-center">
            Por favor, forneça o mês e ano na URL. <br />
            <code className="bg-gray-100 px-3 py-1 rounded-lg mt-3 inline-block text-sm font-mono">
              /month?month=01&year=2024
            </code>
          </p>
        </div>
      </div>
    );
  }

  const filteredData = filterByMonth(data, month, year);
  const sortedData = sortData(filteredData, sortBy);
  const totalAmount = calculateTotal(filteredData);
  const groupedByUser = groupByUser(filteredData);
  const monthName = getMonthName(month);

  const handleMonthChange = (newMonth: string, newYear: string) => {
    router.push(`/month?month=${encodeURIComponent(newMonth)}&year=${encodeURIComponent(newYear)}`);
  };

  return (
    <div className="min-h-screen py-6 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Filter and Sort Controls */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 w-full sm:w-auto">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Alterar Mês
              </label>
              <select
                value={month && year ? `${month}-${year}` : ''}
                onChange={(e) => {
                  const [m, y] = e.target.value.split('-');
                  handleMonthChange(m, y);
                }}
                className="w-full sm:w-64 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="" disabled>Selecione um mês</option>
                {availableMonths.map(({ month: m, year: y }) => (
                  <option key={`${m}-${y}`} value={`${m}-${y}`}>
                    {getMonthName(m)} {y}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex-1 w-full sm:w-auto">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Ordenar Por
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full sm:w-64 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
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

        {/* Header Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Relatório Mensal</p>
                <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">
                  {monthName} {year}
                </h1>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 sm:p-8 shadow-xl">
            <p className="text-blue-100 text-sm font-medium mb-2 uppercase tracking-wide">Total do Mês</p>
            <div className="text-4xl sm:text-5xl font-bold text-white mb-3">
              {formatCurrency(totalAmount)}
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                <span className="text-white text-sm font-semibold">
                  {filteredData.length} {filteredData.length === 1 ? 'transação' : 'transações'}
                </span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                <span className="text-white text-sm font-semibold">
                  {groupedByUser.size} {groupedByUser.size === 1 ? 'pessoa' : 'pessoas'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {filteredData.length === 0 ? (
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Sem Dados</h3>
            <p className="text-gray-500">Nenhuma transação encontrada para este mês.</p>
          </div>
        ) : (
          <>
            {/* Summary by User */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {Array.from(groupedByUser.entries()).map(([user, userTransactions]) => {
                const userTotal = calculateTotal(userTransactions);
                return (
                  <div key={user} className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-lg font-bold uppercase">
                          {user.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 capitalize">{user}</h3>
                        <p className="text-xs text-gray-500">{userTransactions.length} transações</p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(userTotal)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* All Transactions */}
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden">
              <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Todas as Transações</h2>
              </div>

              {/* Mobile view - Cards */}
              <div className="sm:hidden divide-y divide-gray-100">
                {sortedData.map((row, index) => (
                  <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{row.description}</h3>
                        <p className="text-xs text-gray-500">{row.purchaseDate}</p>
                        <p className="text-xs text-indigo-600 font-medium mt-1">{row.pessoas}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg text-gray-900">{formatCurrency(row.value)}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                          {row.category}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          row.status.toLowerCase() === 'paid' || row.status.toLowerCase() === 'pago'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
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
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Person
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Value
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sortedData.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{row.purchaseDate}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                              <span className="text-white text-xs font-bold uppercase">
                                {row.pessoas.charAt(0)}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-gray-900 capitalize">{row.pessoas}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{row.description}</div>
                          {row.observation && (
                            <div className="text-xs text-gray-500 mt-1">{row.observation}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-bold text-gray-900">{formatCurrency(row.value)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-700">{row.category}</div>
                          {row.subcategory && (
                            <div className="text-xs text-gray-500">{row.subcategory}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            row.status.toLowerCase() === 'paid' || row.status.toLowerCase() === 'pago'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
