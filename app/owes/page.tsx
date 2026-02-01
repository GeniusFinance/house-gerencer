"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SheetRow } from "@/types/sheet";
import {
  filterByUser,
  calculateTotal,
  formatCurrency,
  parseSheetData,
  SortOption,
} from "@/lib/dataHelpers";

export default function OwesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userName = searchParams.get("user");

  const [data, setData] = useState<SheetRow[]>([]);
  const [incomeData, setIncomeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [sortColumn, setSortColumn] = useState<string>("validateDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [paymentDescription, setPaymentDescription] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<SheetRow | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch("/api/sheet-data");
        if (!response.ok) {
          throw new Error("Failed to load data");
        }
        const rawData = await response.json();
        console.log("Raw sheet data:", rawData);
        const parsedData = parseSheetData(rawData);
        setData(parsedData);

        try {
          const incomeResponse = await fetch("/api/income-data");
          if (incomeResponse.ok) {
            const incomes = await incomeResponse.json();
            setIncomeData(incomes);
          }
        } catch (incomeErr) {
          console.error("Failed to load income data:", incomeErr);
        }
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
  
  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr || dateStr.trim() === '') return null;
    

    const parts = dateStr.trim().split('/');
    if (parts.length === 3) {
      const day = Number.parseInt(parts[0], 10);
      const month = Number.parseInt(parts[1], 10);
      const year = Number.parseInt(parts[2], 10);
      
      if (!Number.isNaN(day) && !Number.isNaN(month) && !Number.isNaN(year)) {
        const fullYear = year < 100 ? (year < 50 ? 2000 + year : 1900 + year) : year;
        const date = new Date(fullYear, month - 1, day);
        
        if (date.getFullYear() === fullYear && 
            date.getMonth() === month - 1 && 
            date.getDate() === day) {
          return date;
        }
      }
    }
    
    const isoDate = new Date(dateStr);
    if (!Number.isNaN(isoDate.getTime())) {
      return isoDate;
    }
    
    return null;
  };
  
  const dateFilteredData = filteredData.filter((row) => {
    if (!startDate && !endDate) return true;
    
    const rowDate = parseDate(row.validateDate);
    if (!rowDate) return true;
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); 
      return rowDate >= start && rowDate <= end;
    } else if (startDate) {
      const start = new Date(startDate);
      return rowDate >= start;
    } else if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      return rowDate <= end;
    }
    
    return true;
  });
  
  const unpaidData = dateFilteredData.filter((row) => {
    const recebiStatus = row.tags?.toLowerCase().trim() || '';
    return recebiStatus !== 'recebi'
  });
  
  const handleColumnSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };


  const sortedData = [...unpaidData].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortColumn) {
      case "purchaseDate":
        aValue = parseDate(a.purchaseDate)?.getTime() || 0;
        bValue = parseDate(b.purchaseDate)?.getTime() || 0;
        break;
      case "validateDate":
        aValue = parseDate(a.validateDate)?.getTime() || 0;
        bValue = parseDate(b.validateDate)?.getTime() || 0;
        break;
      case "description":
        aValue = a.description.toLowerCase();
        bValue = b.description.toLowerCase();
        break;
      case "value":
        aValue = a.value;
        bValue = b.value;
        break;
      case "category":
        aValue = a.category.toLowerCase();
        bValue = b.category.toLowerCase();
        break;
      case "status":
        aValue = a.status.toLowerCase();
        bValue = b.status.toLowerCase();
        break;
      case "account":
        aValue = a.account.toLowerCase();
        bValue = b.account.toLowerCase();
        break;
      default:
        aValue = parseDate(a.validateDate)?.getTime() || 0;
        bValue = parseDate(b.validateDate)?.getTime() || 0;
    }

    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });
  console.log("sortedData:", sortedData);
  const totalOwed = calculateTotal(unpaidData);

  const userPayments = incomeData.filter((income) => {
    const payerName = income.tags?.toLowerCase() || '';
    const matchesPayer = payerName === userName.toLowerCase();
    
    const matchesDescription = income.description?.toLowerCase().includes(userName.toLowerCase()) ||
                        unpaidData.some(row => 
                          income.relatedCreditId === row.description ||
                          income.description?.toLowerCase().includes(row.description.toLowerCase())
                        );
    
    return matchesPayer || matchesDescription;
  });

  const totalPaid = userPayments.reduce((sum, payment) => {
    const value = typeof payment.value === 'string' ? Number.parseFloat(payment.value) : payment.value;
    return sum + (value || 0);
  }, 0);

  const netDebt = totalOwed - totalPaid;

  const getLinkedPayment = (transactionDescription: string) => {
    return incomeData.find(
      (income) =>
        income.relatedCreditId === transactionDescription ||
        income.description?.toLowerCase().includes(transactionDescription.toLowerCase())
    );
  };

  const getUnpaidTransactions = () => {
    return unpaidData
      .filter(row => {
        const linkedPayment = getLinkedPayment(row.description);
        return !linkedPayment; 
      })
      .sort((a, b) => {
        const dateA = parseDate(a.validateDate || a.purchaseDate);
        const dateB = parseDate(b.validateDate || b.purchaseDate);
        if (!dateA || !dateB) return 0;
        return dateA.getTime() - dateB.getTime();
      });
  };

  const handlePayForTransaction = (transaction: SheetRow) => {
    console.log ("Selected transaction for payment:", transaction);
    setSelectedTransaction(transaction);
    setPaymentAmount(transaction.value.toString());
    setPaymentDescription(`Pagamento - ${transaction.description}`);
    setShowPaymentForm(true);
  };

  const handleOpenGeneralPayment = () => {
    setSelectedTransaction(null);
    setPaymentAmount("");
    setPaymentDescription("");
    setShowPaymentForm(true);
  };

  async function handlePaymentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userName) return;
    
    setUploading(true);

    try {
      let proofUrl = "";

      if (selectedFile) {
        const fileFormData = new FormData();
        fileFormData.append("file", selectedFile);
        fileFormData.append("transactionId", Date.now().toString());
        fileFormData.append("description", paymentDescription || `Pagamento - ${userName}`);

        const uploadResponse = await fetch("/api/upload-proof", {
          method: "POST",
          body: fileFormData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload proof");
        }

        const uploadData = await uploadResponse.json();
        proofUrl = uploadData.fileUrl;
      }

      let incomePayload: any = {
        value: paymentAmount,
        account: "Nubank Pessoal",
        category: "Incomes",
        payer: userName.toLowerCase(),
        proofUrl,
        date: new Date().toLocaleDateString('pt-BR'),
      };
      if (selectedTransaction) {
        incomePayload.description = paymentDescription || `Pagamento - ${selectedTransaction.description}`;
        incomePayload.codigoRelacao = selectedTransaction.code 
        incomePayload.type = "credit"; 
        incomePayload.observation = `Pagamento específico para: ${selectedTransaction.description}`;
      } else {
        const unpaidTransactions = getUnpaidTransactions();
        const transactionsToLink = unpaidTransactions.slice(0, 3).map(t => t.description).join(", ");
        incomePayload.description = paymentDescription || `Pagamento de ${userName} - ${transactionsToLink}`;
        incomePayload.observation = `Pagamento aplicado às dívidas mais antigas. Total: R$ ${paymentAmount}`;
      }
console.log("selectedTransaction:", selectedTransaction);

      const incomeResponse = await fetch("/api/income-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(incomePayload),
      });

      if (!incomeResponse.ok) {
        throw new Error("Failed to register payment");
      }

      setPaymentAmount("");
      setPaymentDescription("");
      setSelectedFile(null);
      setSelectedTransaction(null);
      setShowPaymentForm(false);
      
      const response = await fetch("/api/sheet-data");
      if (response.ok) {
        const rawData = await response.json();
        const parsedData = parseSheetData(rawData);
        setData(parsedData);
      }

      const incomeResp = await fetch("/api/income-data");
      if (incomeResp.ok) {
        const incomes = await incomeResp.json();
        setIncomeData(incomes);
      }

      const successMessage = selectedTransaction 
        ? `Pagamento registrado com sucesso para: ${selectedTransaction.description}!`
        : "Pagamento registrado com sucesso! O valor será descontado das dívidas mais antigas.";
      alert(successMessage);
    } catch (err) {
      console.error("Error submitting payment:", err);
      alert(err instanceof Error ? err.message : "Erro ao registrar pagamento");
    } finally {
      setUploading(false);
    }
  }

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

          {/* Payment Form */}
          {showPaymentForm && (
            <div className="mb-6 p-6 bg-green-50 rounded-2xl border-2 border-green-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {selectedTransaction ? `Pagamento - ${selectedTransaction.description}` : "Registrar Pagamento"}
              </h3>
              {selectedTransaction && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Valor original:</span> {formatCurrency(selectedTransaction.value)}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Este pagamento será vinculado especificamente a esta dívida.
                  </p>
                </div>
              )}
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valor do Pagamento (R$) *
                    </label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0.01"
                      max={netDebt}
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder={`Máx: ${formatCurrency(netDebt)}`}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Este valor será aplicado às dívidas mais antigas primeiro
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição (opcional)
                    </label>
                    <input
                      type="text"
                      value={paymentDescription}
                      onChange={(e) => setPaymentDescription(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Ex: Pagamento parcial do mês"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comprovante de Pagamento *
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-green-500 transition-colors">
                      <input
                        type="file"
                        required
                        accept="image/*,.pdf"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        className="hidden"
                        id="payment-file-upload"
                      />
                      <label
                        htmlFor="payment-file-upload"
                        className="cursor-pointer inline-flex flex-col items-center"
                      >
                        <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="text-sm text-gray-600">
                          {selectedFile ? selectedFile.name : "Clique para enviar comprovante"}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          PNG, JPG, WEBP ou PDF (máx. 5MB)
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPaymentForm(false);
                      setPaymentAmount("");
                      setPaymentDescription("");
                      setSelectedFile(null);
                      setSelectedTransaction(null);
                    }}
                    className="px-6 py-2 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-6 py-2 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Confirmar Pagamento
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-4">
            {/* Total Owed Card */}
            <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl p-6 sm:p-8 shadow-xl">
              <p className="text-red-100 text-sm font-medium mb-2 uppercase tracking-wide">
                Total em Dívida
              </p>
              <div className="text-4xl sm:text-5xl font-bold text-white mb-3">
                {formatCurrency(totalOwed)}
              </div>
              <div className="flex items-center space-x-2">
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="text-white text-sm font-semibold">
                    {unpaidData.length}{" "}
                    {unpaidData.length === 1 ? "item" : "items"}
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

            {/* Payments Summary - Only show if there are payments */}
            {totalPaid > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 shadow-xl">
                  <p className="text-green-100 text-sm font-medium mb-2 uppercase tracking-wide">
                    Total Pago
                  </p>
                  <div className="text-3xl sm:text-4xl font-bold text-white mb-2">
                    {formatCurrency(totalPaid)}
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full inline-block">
                    <span className="text-white text-xs font-semibold">
                      {userPayments.length} pagamento(s)
                    </span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-6 shadow-xl">
                  <p className="text-indigo-100 text-sm font-medium mb-2 uppercase tracking-wide">
                    Saldo Devedor
                  </p>
                  <div className={`text-3xl sm:text-4xl font-bold text-white mb-2 ${netDebt <= 0 ? 'line-through' : ''}`}>
                    {formatCurrency(netDebt)}
                  </div>
                  <div className={`px-3 py-1 rounded-full inline-block ${netDebt <= 0 ? 'bg-green-500/30' : 'bg-white/20 backdrop-blur-sm'}`}>
                    <span className="text-white text-xs font-semibold">
                      {netDebt <= 0 ? '✓ Quitado!' : `Desconto: ${formatCurrency(totalPaid)}`}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {unpaidData.length === 0 ? (
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
              {sortedData.map((row, index) => {
                const linkedPayment = getLinkedPayment(row.description);
                return (
                  <div
                    key={index}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {row.description}
                        </h3>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">
                            <span className="font-medium">Compra:</span> {row.purchaseDate}
                          </p>
                          {row.validateDate && row.validateDate !== row.purchaseDate && (
                            <p className="text-xs text-gray-500">
                              <span className="font-medium">Vencimento:</span> {row.validateDate}
                            </p>
                          )}
                        </div>
                        {linkedPayment && (
                          <div className="mt-2 flex items-center gap-1">
                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                              ✓ Pagamento registrado
                            </span>
                            {linkedPayment.proofUrl && (
                              <a
                                href={linkedPayment.proofUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-700 underline"
                              >
                                Ver comprovante
                              </a>
                            )}
                          </div>
                        )}
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
                      {!linkedPayment && (
                        <button
                          onClick={() => handlePayForTransaction(row)}
                          className="text-xs px-3 py-1 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors flex items-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Pagar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop view - Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th 
                      onClick={() => handleColumnSort("purchaseDate")}
                      className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        Data da Compra
                        {sortColumn === "purchaseDate" && (
                          <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleColumnSort("validateDate")}
                      className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        Vencimento
                        {sortColumn === "validateDate" && (
                          <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleColumnSort("description")}
                      className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        Descrição
                        {sortColumn === "description" && (
                          <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleColumnSort("value")}
                      className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-end gap-1">
                        Valor
                        {sortColumn === "value" && (
                          <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleColumnSort("category")}
                      className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        Categoria
                        {sortColumn === "category" && (
                          <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleColumnSort("status")}
                      className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-center gap-1">
                        Status
                        {sortColumn === "status" && (
                          <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleColumnSort("account")}
                      className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        Conta
                        {sortColumn === "account" && (
                          <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Pagamento
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedData.map((row, index) => {
                    const linkedPayment = getLinkedPayment(row.description);
                    return (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {row.purchaseDate}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {row.validateDate || "-"}
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
                          {linkedPayment && (
                            <div className="mt-2 flex items-center gap-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                ✓ Pagamento registrado
                              </span>
                              {linkedPayment.proofUrl && (
                                <a
                                  href={linkedPayment.proofUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:text-blue-700 font-medium underline"
                                >
                                  Ver comprovante →
                                </a>
                              )}
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
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {linkedPayment ? (
                            <div className="flex flex-col items-center gap-1">
                              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="text-xs text-gray-500">Registrado</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {!linkedPayment ? (
                            <button
                              onClick={() => handlePayForTransaction(row)}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors shadow-sm"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                              Pagar
                            </button>
                          ) : (
                            <span className="text-xs text-green-600 font-medium">✓ Pago</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
