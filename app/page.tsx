export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-3xl w-full">
        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden">
          {/* Header with Gradient */}
          <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-8 sm:p-12">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
                  Rastreador de D\u00edvidas
                </h1>
                <p className="text-purple-100 text-lg">
                  Gest\u00e3o financeira inteligente
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 sm:p-12">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Acesso R\u00e1pido
              </h2>
              <p className="text-gray-600 mb-6">
                Visualize d\u00edvidas por pessoa ou analise relat\u00f3rios mensais dos seus dados.
              </p>
              
              <div className="space-y-6">
                {/* View by User */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Por Pessoa</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <a 
                      href="/owes?user=claudia" 
                      className="group relative overflow-hidden bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                    >
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="relative">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3">
                          <span className="text-2xl font-bold text-white">C</span>
                        </div>
                        <div className="text-white font-semibold text-lg">Claudia</div>
                        <div className="text-pink-100 text-sm">Ver d\u00edvidas \u2192</div>
                      </div>
                    </a>

                    <a 
                      href="/owes?user=joão" 
                      className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                    >
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="relative">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3">
                          <span className="text-2xl font-bold text-white">J</span>
                        </div>
                        <div className="text-white font-semibold text-lg">João</div>
                        <div className="text-blue-100 text-sm">Ver d\u00edvidas \u2192</div>
                      </div>
                    </a>

                    <a 
                      href="/owes?user=maria" 
                      className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                    >
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="relative">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3">
                          <span className="text-2xl font-bold text-white">M</span>
                        </div>
                        <div className="text-white font-semibold text-lg">Maria</div>
                        <div className="text-purple-100 text-sm">Ver d\u00edvidas \u2192</div>
                      </div>
                    </a>
                  </div>
                </div>

                {/* View by Month */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Por M\u00eas</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <a 
                      href="/month?month=01&year=2024" 
                      className="group relative overflow-hidden bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                    >
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="relative">
                        <div className="text-white font-semibold text-base">Janeiro</div>
                        <div className="text-indigo-100 text-sm">2024 \u2192</div>
                      </div>
                    </a>

                    <a 
                      href="/month?month=02&year=2024" 
                      className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                    >
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="relative">
                        <div className="text-white font-semibold text-base">Fevereiro</div>
                        <div className="text-blue-100 text-sm">2024 \u2192</div>
                      </div>
                    </a>

                    <a 
                      href="/month?month=03&year=2024" 
                      className="group relative overflow-hidden bg-gradient-to-br from-cyan-500 to-teal-600 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                    >
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="relative">
                        <div className="text-white font-semibold text-base">Mar\u00e7o</div>
                        <div className="text-cyan-100 text-sm">2024 \u2192</div>
                      </div>
                    </a>

                    <a 
                      href="/month?month=04&year=2024" 
                      className="group relative overflow-hidden bg-gradient-to-br from-teal-500 to-green-600 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                    >
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="relative">
                        <div className="text-white font-semibold text-base">Abril</div>
                        <div className="text-teal-100 text-sm">2024 \u2192</div>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Como funciona</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <div>
                    <p className="text-gray-700">
                      Navigate to <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-purple-600">/owes?user=NAME</code>
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <div>
                    <p className="text-gray-700">
                      Visualize todas as d\u00edvidas pendentes desse usu\u00e1rio
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <div>
                    <p className="text-gray-700">
                      Veja totais, categorias e status num piscar de olhos
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-gray-50 rounded-2xl">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-gray-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Fonte de Dados</h4>
                  <p className="text-sm text-gray-600">
                    Atualize <code className="bg-white px-2 py-0.5 rounded text-xs font-mono">data/expenses.csv</code> com os dados da sua planilha
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
