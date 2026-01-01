
import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';

interface TransactionsViewProps {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({ transactions, setTransactions }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTx, setNewTx] = useState<Partial<Transaction> & { months?: number }>({ 
    type: 'expense', 
    category: 'Outros',
    months: 1,
    isPaid: false
  });

  const togglePaid = (id: string) => {
    setTransactions(prev => prev.map(tx => 
      tx.id === id ? { ...tx, isPaid: !tx.isPaid } : tx
    ));
  };

  const deleteTransaction = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este lançamento?')) {
      setTransactions(prev => prev.filter(tx => tx.id !== id));
    }
  };

  const handleAddTransaction = () => {
    if (!newTx.description || !newTx.amount) return;
    
    const startDate = newTx.date || new Date().toISOString().split('T')[0];
    const duration = newTx.months || 1;
    const generatedTxs: Transaction[] = [];

    for (let i = 0; i < duration; i++) {
      const d = new Date(startDate + 'T12:00:00');
      d.setMonth(d.getMonth() + i);
      
      generatedTxs.push({
        id: Math.random().toString(36).substr(2, 9),
        description: duration > 1 
          ? `${newTx.description} (${i + 1}/${duration})` 
          : (newTx.description || ''),
        amount: Number(newTx.amount),
        type: (newTx.type as TransactionType) || 'expense',
        date: d.toISOString().split('T')[0],
        category: newTx.category || 'Outros',
        isPaid: newTx.isPaid || false
      });
    }

    setTransactions(prev => [...generatedTxs, ...prev]);
    setShowAddModal(false);
    setNewTx({ type: 'expense', category: 'Outros', months: 1, isPaid: false });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Histórico Financeiro</h3>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Novo Lançamento
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">Data</th>
              <th className="px-6 py-4 font-semibold">Descrição</th>
              <th className="px-6 py-4 font-semibold">Valor</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.sort((a,b) => b.date.localeCompare(a.date)).map((tx) => (
              <tr key={tx.id} className={`transition-colors ${tx.isPaid ? 'bg-slate-50/30' : 'hover:bg-slate-50/50'}`}>
                <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                  {new Date(tx.date + 'T12:00:00').toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <p className={`font-medium ${tx.isPaid ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{tx.description}</p>
                    <span className="text-[10px] text-slate-400 uppercase tracking-tighter">{tx.category}</span>
                  </div>
                </td>
                <td className={`px-6 py-4 font-bold text-sm whitespace-nowrap ${tx.isPaid ? 'text-slate-300' : tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {tx.type === 'income' ? '+' : '-'} R$ {tx.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button 
                    onClick={() => togglePaid(tx.id)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 ${
                      tx.isPaid 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                    }`}
                  >
                    {tx.isPaid ? (
                      <>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        {tx.type === 'income' ? 'Recebido' : 'Pago'}
                      </>
                    ) : (
                      <>
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                        Pendente
                      </>
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button 
                    onClick={() => togglePaid(tx.id)}
                    className={`text-xs font-semibold underline ${tx.isPaid ? 'text-slate-400' : 'text-indigo-600 hover:text-indigo-800'}`}
                  >
                    {tx.isPaid ? 'Estornar' : 'Liquidado'}
                  </button>
                  <button 
                    onClick={() => deleteTransaction(tx.id)}
                    className="text-slate-300 hover:text-rose-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                  Nenhum lançamento encontrado para este período.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Novo Lançamento</h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <button 
                  onClick={() => setNewTx({...newTx, type: 'income'})}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold border-2 transition-all ${newTx.type === 'income' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 text-slate-400'}`}
                >
                  Entrada
                </button>
                <button 
                  onClick={() => setNewTx({...newTx, type: 'expense'})}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold border-2 transition-all ${newTx.type === 'expense' ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-slate-100 text-slate-400'}`}
                >
                  Saída
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                  value={newTx.description || ''} 
                  onChange={e => setNewTx({...newTx, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
                  <input 
                    type="number" 
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={newTx.amount || ''} 
                    onChange={e => setNewTx({...newTx, amount: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data Início</label>
                  <input 
                    type="date" 
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={newTx.date || ''} 
                    onChange={e => setNewTx({...newTx, date: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                  <select 
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newTx.category}
                    onChange={e => setNewTx({...newTx, category: e.target.value})}
                  >
                    <option>Serviços</option>
                    <option>Software</option>
                    <option>Utilidades</option>
                    <option>Marketing</option>
                    <option>Infraestrutura</option>
                    <option>Outros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Repetir (Meses)</label>
                  <input 
                    type="number" 
                    min="1"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-indigo-600" 
                    value={newTx.months || 1} 
                    onChange={e => setNewTx({...newTx, months: Math.max(1, Number(e.target.value))})}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-100">
                <input 
                  type="checkbox" 
                  id="paid"
                  checked={newTx.isPaid}
                  onChange={e => setNewTx({...newTx, isPaid: e.target.checked})}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <label htmlFor="paid" className="text-sm text-slate-600 cursor-pointer select-none">
                  Já foi liquidado (Pago/Recebido)
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleAddTransaction}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
