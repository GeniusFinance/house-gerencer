"use client";

import { SheetRow } from "@/types/sheet";
import { formatCurrency } from "@/lib/dataHelpers";
import { useState, useEffect } from "react";

interface PaymentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTransaction: SheetRow | null;
  selectedOwes: SheetRow[];
  userName: string;
  netDebt: number;
  onSubmit: (data: {
    amount: string;
    description: string;
    file: File | null;
  }) => Promise<void>;
}

export default function PaymentDrawer({
  isOpen,
  onClose,
  selectedTransaction,
  selectedOwes,
  userName,
  netDebt,
  onSubmit,
}: PaymentDrawerProps) {
  const [uploading, setUploading] = useState(false);
  
  const totalSelectedAmount = selectedOwes.reduce((sum, owe) => sum + owe.value, 0);
  
  const [paymentAmount, setPaymentAmount] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [paymentDescription, setPaymentDescription] = useState("");

  useEffect(() => {
    if (selectedTransaction) {
      setPaymentAmount(selectedTransaction.value.toString());
      setPaymentDescription(`Pagamento - ${selectedTransaction.description}`);
    } else if (selectedOwes.length > 0) {
      setPaymentAmount(totalSelectedAmount.toString());
      const descriptions = selectedOwes.map(owe => owe.description).join(", ");
      setPaymentDescription(`Pagamento geral - ${selectedOwes.length} dívida(s): ${descriptions}`);
    } else {
      setPaymentAmount("");
      setPaymentDescription("");
    }
  }, [selectedTransaction, selectedOwes, totalSelectedAmount]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      await onSubmit({
        amount: paymentAmount,
        description: paymentDescription,
        file: selectedFile,
      });

      setPaymentAmount("");
      setPaymentDescription("");
      setSelectedFile(null);
    } catch (error) {
      console.error("Error in drawer submit:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setPaymentAmount("");
    setPaymentDescription("");
    setSelectedFile(null);
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={handleClose}
      />

      <div className="fixed inset-x-0 bottom-0 z-50 animate-slide-up">
        <div className="bg-white rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto border-2 border-green-200 shadow-2xl">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />

          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg
              className="w-6 h-6 text-green-600"
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
            {selectedTransaction
              ? `Pagamento - ${selectedTransaction.description}`
              : selectedOwes.length > 0
              ? `Pagamento Geral (${selectedOwes.length} dívidas)`
              : "Registrar Pagamento"}
          </h3>

          {selectedTransaction ? (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Valor original:</span>{" "}
                {formatCurrency(selectedTransaction.value)}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Este pagamento será vinculado especificamente a esta dívida.
              </p>
            </div>
          ) : selectedOwes.length > 0 ? (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200 max-h-60 overflow-y-auto">
              <p className="text-sm text-blue-800 font-semibold mb-2">
                Dívidas Selecionadas ({selectedOwes.length}):
              </p>
              <div className="space-y-2">
                {selectedOwes.map((owe, index) => (
                  <div key={index} className="flex justify-between items-center text-xs p-2 bg-white rounded border border-blue-100">
                    <span className="font-medium text-gray-700 flex-1">{owe.description}</span>
                    <span className="text-blue-600 font-bold">{formatCurrency(owe.value)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-blue-200 flex justify-between items-center">
                <span className="text-sm text-blue-800 font-semibold">Total:</span>
                <span className="text-lg text-blue-900 font-bold">{formatCurrency(selectedOwes.reduce((sum, owe) => sum + owe.value, 0))}</span>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                Este pagamento será vinculado a todas as dívidas selecionadas.
              </p>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  max={selectedTransaction ? selectedTransaction.value : selectedOwes.length > 0 ? totalSelectedAmount : netDebt}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder={selectedTransaction 
                    ? `Máx: ${formatCurrency(selectedTransaction.value)}` 
                    : selectedOwes.length > 0 
                    ? `Máx: ${formatCurrency(totalSelectedAmount)}`
                    : `Máx: ${formatCurrency(netDebt)}`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {selectedOwes.length > 0 
                    ? "Este valor será aplicado proporcionalmente às dívidas selecionadas"
                    : "Este valor será aplicado às dívidas mais antigas primeiro"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição *
                </label>
                <input
                  type="text"
                  required
                  value={paymentDescription}
                  onChange={(e) => setPaymentDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ex: Pagamento parcial do mês"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comprovante de Pagamento (opcional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-green-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) =>
                      setSelectedFile(e.target.files?.[0] || null)
                    }
                    className="hidden"
                    id="payment-file-upload"
                  />
                  <label
                    htmlFor="payment-file-upload"
                    className="cursor-pointer inline-flex flex-col items-center"
                  >
                    <svg
                      className="w-10 h-10 text-gray-400 mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <span className="text-sm text-gray-600">
                      {selectedFile
                        ? selectedFile.name
                        : "Clique para enviar comprovante"}
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
                onClick={handleClose}
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
                    <svg
                      className="animate-spin h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Enviando...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Confirmar Pagamento
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
