
import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Expense, Transaction } from '../types';

interface ExpensesViewProps {
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
}

const COLORS = ['#6366f1', '#f43f5e', '#ec4899', '#f59e0b', '#10b981', '#64748b', '#0ea5e9', '#8b5cf6', '#d946ef'];

export const ExpensesView: React.FC<ExpensesViewProps> = ({ 
  expenses, 
  setExpenses, 
  setTransactions, 
  categories, 
  setCategories 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  
  const [newExp, setNewExp] = useState<Partial<Expense> & { months: number }>({
    description: '',
    amount: 0,
    category: categories[0] || 'Outros',
    dueDate: new Date().toISOString().split('T')[0],
    isRecurring: true,
    months: 1
  });

  const categoryData = useMemo(() => {
    const data: Record<string, number> = {};
    expenses.forEach(exp => {
      data[exp.category] = (data[exp.category] || 0) + exp.amount;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const totalMonthlyExpenses = useMemo(() => {
    return expenses.reduce((acc, curr) => acc + curr.amount, 0);
  }, [expenses]);

  const handleAddExpense = () => {
    if (!newExp.description || !newExp.amount) return;

    const id = Math.random().toString(36).substr(2, 9);
    const expense: Expense = {
      id,
      description: newExp.description,
      amount: Number(newExp.amount),
      category: newExp.category || categories[0] || 'Outros',
      dueDate: newExp.dueDate || '',
      isRecurring: !!newExp.isRecurring
    };

    const generatedTransactions: Transaction[] = [];
    const duration = newExp.months || 1;

    for (let i = 0; i < duration; i++) {
      const d = new Date((newExp.dueDate || '') + 'T12:00:00');
      d.setMonth(d.getMonth() + i);

      generatedTransactions.push({
        id: Math.random().toString(36).substr(2, 9),
        description: duration > 1 
          ? `${expense.description} (${i + 1}/${duration})` 
          : expense.description,
        amount: expense.amount,
        type: 'expense',
        date: d.toISOString().split('T')[0],
        category: expense.category,
        isPaid: false
      });
    }

    setExpenses(prev => [...prev, expense]);
    setTransactions(prev => [...generatedTransactions, ...prev]);
    setShowModal(false);
    setNewExp({ description: '', amount: 0, category: categories[0] || 'Outros', isRecurring: true, months: 1, dueDate: new Date().toISOString().split('T')[0] });
  };

  const deleteExpense = (id: string) => {
    if (confirm('Deseja remover este custo fixo da agência? Transações futuras não serão afetadas.')) {
      setExpenses(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleAddCategory = () => {
    const name = newCatName.trim();
    if (name && !categories.includes(name)) {
      setCategories(prev => [...prev, name]);
      setNewCatName('');
    }
  };

  const removeCategory = (cat: string) => {
    const isInUse = expenses.some(e => e.category === cat);
    if (isInUse) {
      alert('Esta categoria está em uso em algumas despesas e não pode ser removida agora.');
      return;
    }
    setCategories(prev => prev.filter(c => c !== cat));
  };

  return (
    <div className="space-y-6">
      {/* Resumo e Gráfico */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center">
          <p className="text-sm font-medium text-slate-500 mb-1">Custo Fixo Mensal</p>
          <h4 className="text-3xl font-bold text-rose-600 mb-4">
            R$ {totalMonthlyExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h4>
          <div className="space-y-3 mt-4 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
            {categoryData.length > 0 ? categoryData.map((cat, idx) => (
              <div key={cat.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                  <span className="text-slate-600 truncate max-w-[120px]">{cat.name}</span>
                </div>
                <span className="font-semibold text-slate-800">
                  {totalMonthlyExpenses > 0 ? ((cat.value / totalMonthlyExpenses) * 100).toFixed(1) : 0}%
                </span>
              </div>
            )) : (
              <p className="text-xs text-slate-400 italic">Nenhum custo fixo lançado.</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200 min-h-[320px]">
          <h3 className="text-sm font-semibold text-slate-800 mb-4 uppercase tracking-wider">Distribuição de Gastos</h3>
          <div className="h-full min-h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData.length > 0 ? categoryData : [{ name: 'Sem Dados', value: 1 }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.length > 0 ? categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  )) : (
                    <Cell fill="#f1f5f9" />
                  )}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => categoryData.length > 0 ? `R$ ${value.toLocaleString()}` : '0'}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabela de Despesas */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between flex-wrap gap-4">
          <h3 className="text-lg font-semibold text-slate-800">Custo da Agência</h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowCategoryModal(true)}
              className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Gerenciar Categorias
            </button>
            <button 
              onClick={() => setShowModal(true)}
              className="bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-rose-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Lançar Despesa
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Descrição</th>
                <th className="px-6 py-4 font-semibold">Categoria</th>
                <th className="px-6 py-4 font-semibold">Valor</th>
                <th className="px-6 py-4 font-semibold">Recorrência</th>
                <th className="px-6 py-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-800">{exp.description}</p>
                    <p className="text-xs text-slate-400">Primeiro Vencimento: {new Date(exp.dueDate + 'T12:00:00').toLocaleDateString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold uppercase">
                      {exp.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-rose-600">
                    R$ {exp.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    {exp.isRecurring ? (
                      <span className="flex items-center gap-1 text-xs text-indigo-600 font-medium">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        Mensal
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">Pontual</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => deleteExpense(exp.id)} className="text-slate-300 hover:text-rose-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                    Nenhuma despesa recorrente cadastrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Nova Despesa */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Nova Despesa da Agência</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">O que é este gasto?</label>
                <input 
                  type="text" 
                  placeholder="Ex: Aluguel, Pro-labore, Ferramenta IA..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none" 
                  value={newExp.description} 
                  onChange={e => setNewExp({...newExp, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
                  <input 
                    type="number" 
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none font-bold" 
                    value={newExp.amount || ''} 
                    onChange={e => setNewExp({...newExp, amount: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data 1º Vencimento</label>
                  <input 
                    type="date" 
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none" 
                    value={newExp.dueDate} 
                    onChange={e => setNewExp({...newExp, dueDate: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                <select 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
                  value={newExp.category}
                  onChange={e => setNewExp({...newExp, category: e.target.value})}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  {categories.length === 0 && <option>Outros</option>}
                </select>
              </div>
              <div className="flex items-center gap-3 p-3 bg-rose-50 rounded-lg border border-rose-100">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-rose-800 uppercase mb-1">Projetar para quantos meses?</label>
                  <input 
                    type="number" 
                    min="1"
                    className="w-full px-3 py-1.5 border border-rose-200 rounded focus:ring-2 focus:ring-rose-500 outline-none font-bold text-rose-600" 
                    value={newExp.months} 
                    onChange={e => setNewExp({...newExp, months: Math.max(1, Number(e.target.value))})}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleAddExpense}
                className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors shadow-sm"
              >
                Confirmar Custo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Gerenciar Categorias */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Categorias da Agência</h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
            
            <div className="flex gap-2 mb-6">
              <input 
                type="text" 
                placeholder="Nova categoria..."
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
              />
              <button 
                onClick={handleAddCategory}
                className="bg-slate-900 text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>

            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
              {categories.map(cat => (
                <div key={cat} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg group hover:bg-slate-100 transition-colors">
                  <span className="text-sm font-medium text-slate-700">{cat}</span>
                  <button 
                    onClick={() => removeCategory(cat)}
                    className="text-slate-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>
              ))}
              {categories.length === 0 && (
                <p className="text-xs text-center text-slate-400 py-4">Nenhuma categoria personalizada.</p>
              )}
            </div>

            <button 
              onClick={() => setShowCategoryModal(false)}
              className="w-full mt-6 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-medium hover:bg-slate-200 transition-colors"
            >
              Concluir
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
