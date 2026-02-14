import React from "react";

interface CreditCardSummary {
  readonly account: string;
  readonly totalAmount: number;
  readonly itemCount: number;
  readonly pendingAmount: number;
  readonly paidAmount: number;
}

interface CreditCardBreakdownProps {
  readonly data: CreditCardSummary[];
}

export default function CreditCardBreakdown({ data }: CreditCardBreakdownProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getCardColor = (index: number) => {
    const colors = [
      "from-purple-500 to-purple-600",
      "from-blue-500 to-blue-600",
      "from-pink-500 to-pink-600",
      "from-indigo-500 to-indigo-600",
      "from-violet-500 to-violet-600",
      "from-cyan-500 to-cyan-600",
    ];
    return colors[index % colors.length];
  };

  const getCardIcon = (account: string) => {
    const lowerAccount = account.toLowerCase();
    
    if (lowerAccount.includes("nubank")) {
      return "💜";
    } else if (lowerAccount.includes("inter") || lowerAccount.includes("banco inter")) {
      return "🧡";
    } else if (lowerAccount.includes("itaú") || lowerAccount.includes("itau")) {
      return "🔶";
    } else if (lowerAccount.includes("bradesco")) {
      return "🔴";
    } else if (lowerAccount.includes("santander")) {
      return "🔺";
    } else if (lowerAccount.includes("caixa")) {
      return "🔵";
    } else if (lowerAccount.includes("banco do brasil") || lowerAccount.includes("bb")) {
      return "💛";
    }
    return "💳";
  };

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Pagamentos por Cartão
        </h3>
        <p className="text-gray-500 text-center py-8">
          Nenhum pagamento de cartão encontrado
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-6">
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
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900">
          Pagamentos por Cartão
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((card, index) => (
          <div
            key={card.account}
            className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${getCardColor(
              index
            )} p-6 shadow-lg hover:shadow-xl transition-shadow`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">{getCardIcon(card.account)}</span>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
                  <span className="text-white text-xs font-semibold">
                    {card.itemCount} {card.itemCount === 1 ? "compra" : "compras"}
                  </span>
                </div>
              </div>

              <h4 className="text-white font-bold text-lg mb-4 truncate">
                {card.account || "Não especificado"}
              </h4>

              <div className="space-y-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-white/80 text-xs font-medium mb-1">
                    A Pagar
                  </div>
                  <div className="text-white text-2xl font-bold">
                    {formatCurrency(card.pendingAmount)}
                  </div>
                </div>

                {card.paidAmount > 0 && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <div className="text-white/80 text-xs font-medium mb-1">
                      Já Pago
                    </div>
                    <div className="text-white text-lg font-semibold">
                      {formatCurrency(card.paidAmount)}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="flex justify-between items-center">
                  <span className="text-white/80 text-xs font-medium">
                    Total Geral
                  </span>
                  <span className="text-white text-sm font-bold">
                    {formatCurrency(card.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 font-medium">Total de Todos os Cartões:</span>
          <span className="text-2xl font-bold text-gray-900">
            {formatCurrency(data.reduce((sum, card) => sum + card.totalAmount, 0))}
          </span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-gray-600 text-sm">Total a Pagar:</span>
          <span className="text-lg font-semibold text-red-600">
            {formatCurrency(data.reduce((sum, card) => sum + card.pendingAmount, 0))}
          </span>
        </div>
      </div>
    </div>
  );
}
