
import React, { useState, useEffect } from 'react';
import { Transaction, Client } from '../types';
import { getFinancialInsights } from '../services/geminiService';

interface AIInsightsProps {
  transactions: Transaction[];
  clients: Client[];
}

export const AIInsights: React.FC<AIInsightsProps> = ({ transactions, clients }) => {
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      const data = await getFinancialInsights(transactions, clients);
      setInsights(data);
      setLoading(false);
    };

    fetchInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions.length, clients.length]);

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl p-6 shadow-lg text-white">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-indigo-500/30 rounded-lg backdrop-blur-md">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold">Insights da IA</h3>
          <p className="text-indigo-200 text-xs">Recomendações baseadas nos seus dados atuais</p>
        </div>
      </div>

      {loading ? (
        <div className="flex gap-4 items-center">
          <div className="w-4 h-4 bg-indigo-300 animate-bounce rounded-full"></div>
          <div className="w-4 h-4 bg-indigo-300 animate-bounce delay-100 rounded-full"></div>
          <div className="w-4 h-4 bg-indigo-300 animate-bounce delay-200 rounded-full"></div>
          <span className="text-sm italic">Analisando tendências...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map((insight, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-md p-4 rounded-lg border border-white/10 hover:bg-white/20 transition-all cursor-default group">
              <div className="flex items-start gap-2">
                <span className="text-xl opacity-50 group-hover:opacity-100 transition-opacity">💡</span>
                <p className="text-sm font-medium leading-tight">{insight}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
