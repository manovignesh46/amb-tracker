import React from 'react';

const formatCurrency = (amount) => {
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export default function ResultsSection({ results, onReset }) {
  const isOnTrack = results.status === 'ON_TRACK';

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
      {/* Header Card with Status */}
      <div className="card-gradient p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mr-3 sm:mr-4">
              <span className="text-xl sm:text-2xl">📊</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">AMB Analysis Results</h2>
          </div>
          <button 
            onClick={onReset} 
            className="px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base bg-gray-100 text-gray-700 rounded-lg font-semibold border border-gray-300 hover:bg-gray-200 transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            Upload Another
          </button>
        </div>
      </div>

      {/* Status Banner */}
      <div
        className={`rounded-xl p-4 sm:p-6 ${
          isOnTrack ? 'status-success' : 'status-warning'
        }`}
      >
        <div className="flex items-center">
          <span className="text-3xl sm:text-4xl mr-3 sm:mr-4">
            {isOnTrack ? '✅' : '⚠️'}
          </span>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800">
              {isOnTrack
                ? 'Great! You are on track with your AMB'
                : 'Alert! You are below the target AMB'}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              {results.statementPeriod}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Grid - 2 columns on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <SummaryCard
          label="Days Elapsed"
          value={results.daysElapsed}
          icon="📅"
        />
        <SummaryCard
          label="Remaining Days"
          value={results.remainingDays}
          icon="⏳"
        />
        <SummaryCard
          label="Total Days"
          value={results.totalDaysInMonth}
          icon="📆"
        />
        <SummaryCard
          label="Statement Period"
          value={results.month}
          icon="🗓️"
        />
      </div>

      {/* Current Status */}
      <div className="card-gradient p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center">
          <span className="mr-2">💰</span>
          Current Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <StatusItem
            label="Current Balance"
            value={formatCurrency(results.currentBalance)}
            gradient="from-green-500 to-emerald-500"
          />
          <StatusItem
            label="Current AMB"
            value={formatCurrency(results.currentAMB)}
            gradient="from-blue-500 to-indigo-500"
          />
          <StatusItem
            label="Target AMB"
            value={formatCurrency(results.targetAMB)}
            gradient="from-purple-500 to-pink-500"
          />
        </div>
      </div>

      {/* Calculations */}
      <div className="card-gradient p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center">
          <span className="mr-2">🧮</span>
          Calculations
        </h3>
        <div className="space-y-2 sm:space-y-3">
          <CalcRow
            label="Sum of Daily Balances"
            value={formatCurrency(results.sumOfDailyBalances)}
          />
          <CalcRow
            label="Required Total Sum"
            value={formatCurrency(results.requiredTotalSum)}
          />
          <CalcRow
            label="Remaining Sum Needed"
            value={formatCurrency(results.remainingSumNeeded)}
            highlight={results.remainingSumNeeded > 0}
          />
        </div>
      </div>

      {/* Required Action */}
      <div className="card-gradient p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center">
          <span className="mr-2">🎯</span>
          Required Action
        </h3>
        <div
          className={`rounded-lg p-6 ${
            isOnTrack && results.surplus > 0
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200'
              : results.requiredBalanceForRemainingDays <= 0
              ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200'
              : 'bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200'
          }`}
        >
          {isOnTrack && results.surplus > 0 ? (
            <div>
              <p className="text-base sm:text-lg font-bold text-gray-800 mb-2">
                🎉 Excellent! You have a surplus!
              </p>
              <p className="text-sm sm:text-base text-gray-700 mb-2">
                You have accumulated <span className="font-bold text-green-600">{formatCurrency(results.surplus)}</span> MORE than needed.
              </p>
              <p className="text-sm sm:text-base text-gray-600">
                You can maintain ₹0 balance for the remaining <span className="font-semibold">{results.remainingDays} days</span> and still meet your target.
              </p>
            </div>
          ) : results.requiredBalanceForRemainingDays <= 0 ? (
            <div>
              <p className="text-base sm:text-lg font-bold text-gray-800 mb-2">
                ✅ Perfect! Target achieved!
              </p>
              <p className="text-sm sm:text-base text-gray-600">
                You can maintain ₹0 balance for the remaining <span className="font-semibold">{results.remainingDays} days</span> and still meet your target.
              </p>
            </div>
          ) : results.deficit > 0 ? (
            <div>
              <p className="text-base sm:text-lg font-bold text-gray-800 mb-2">
                ⚠️ Action Required!
              </p>
              <p className="text-sm sm:text-base text-gray-700 mb-2">
                You need to add <span className="font-bold text-orange-600">{formatCurrency(results.deficit)}</span> to your account.
              </p>
              <p className="text-sm sm:text-base text-gray-600">
                Maintain at least <span className="font-semibold text-orange-600">{formatCurrency(results.requiredBalanceForRemainingDays)}</span> for the remaining <span className="font-semibold">{results.remainingDays} days</span> to meet your target.
              </p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-bold text-gray-800 mb-2">
                📈 Keep it up!
              </p>
              <p className="text-gray-600">
                Maintain at least <span className="font-semibold text-blue-600">{formatCurrency(results.requiredBalanceForRemainingDays)}</span> for the remaining <span className="font-semibold">{results.remainingDays} days</span>.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card-gradient p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center">
          <span className="mr-2">📋</span>
          Transaction History
        </h3>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Closing Balance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.transactions.map((txn, index) => (
                <tr
                  key={index}
                  className="hover:bg-blue-50 transition-colors"
                >
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                    {txn.date}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-right font-semibold text-gray-900">
                    {formatCurrency(txn.closingBalance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, icon }) {
  return (
    <div className="card-gradient p-6 text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
    </div>
  );
}

function StatusItem({ label, value, gradient }) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
      <div className="text-sm text-gray-600 mb-2">{label}</div>
      <div className={`text-2xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
        {value}
      </div>
    </div>
  );
}

function CalcRow({ label, value, highlight }) {
  return (
    <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
      <span className="text-gray-700">{label}</span>
      <span className={`font-bold ${highlight ? 'text-orange-600' : 'text-gray-900'}`}>
        {value}
      </span>
    </div>
  );
}
