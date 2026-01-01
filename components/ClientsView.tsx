
import React, { useState } from 'react';
import { Client, Transaction } from '../types';

interface ClientsViewProps {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
}

export const ClientsView: React.FC<ClientsViewProps> = ({ clients, setClients, setTransactions }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClient, setNewClient] = useState<Partial<Client> & { months?: number }>({ 
    status: 'active', 
    months: 1,
    artCount: 0,
    videoCount: 0,
    hasPaidTraffic: false,
    observations: '',
    cnpj: ''
  });

  const handleAddClient = () => {
    if (!newClient.name || !newClient.recurringValue) return;
    
    const clientId = Math.random().toString(36).substr(2, 9);
    const startDate = newClient.nextBillingDate || new Date().toISOString().split('T')[0];
    const duration = newClient.months || 1;

    const client: Client = {
      id: clientId,
      name: newClient.name || '',
      cnpj: newClient.cnpj || '',
      email: newClient.email || '',
      recurringValue: Number(newClient.recurringValue),
      status: (newClient.status as 'active' | 'inactive') || 'active',
      nextBillingDate: startDate,
      artCount: Number(newClient.artCount || 0),
      videoCount: Number(newClient.videoCount || 0),
      hasPaidTraffic: !!newClient.hasPaidTraffic,
      observations: newClient.observations || ''
    };

    const generatedTransactions: Transaction[] = [];
    for (let i = 0; i < duration; i++) {
      const d = new Date(startDate + 'T12:00:00');
      d.setMonth(d.getMonth() + i);
      
      generatedTransactions.push({
        id: Math.random().toString(36).substr(2, 9),
        description: `Recebimento: ${client.name} (Parc. ${i + 1}/${duration})`,
        amount: client.recurringValue,
        type: 'income',
        date: d.toISOString().split('T')[0],
        category: 'Serviços',
        isPaid: false
      });
    }

    setClients(prev => [...prev, client]);
    setTransactions(prev => [...generatedTransactions, ...prev]);
    setShowAddModal(false);
    setNewClient({ status: 'active', months: 1, artCount: 0, videoCount: 0, hasPaidTraffic: false, observations: '', cnpj: '' });
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Clientes Recorrentes</h3>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Novo Cliente
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">Cliente / CNPJ</th>
              <th className="px-6 py-4 font-semibold">Valor Mensal</th>
              <th className="px-6 py-4 font-semibold">Entregáveis</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs uppercase">
                      {client.name.substring(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{client.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono tracking-tighter">{client.cnpj || 'Sem CNPJ'}</p>
                      <p className="text-xs text-slate-500">{client.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-slate-700">
                  R$ {client.recurringValue.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs text-slate-500" title="Artes">
                      <span>🎨</span> {client.artCount || 0}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500" title="Vídeos">
                      <span>🎬</span> {client.videoCount || 0}
                    </div>
                    {client.hasPaidTraffic && (
                      <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-bold uppercase tracking-tight">Tráfego</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                    client.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {client.status === 'active' ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => deleteClient(client.id)} className="text-slate-400 hover:text-rose-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Adicionar Novo Cliente</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-2">Informações Gerais</h4>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Empresa</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={newClient.name || ''} 
                    onChange={e => setNewClient({...newClient, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">CNPJ</label>
                  <input 
                    type="text" 
                    placeholder="00.000.000/0001-00"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={newClient.cnpj || ''} 
                    onChange={e => setNewClient({...newClient, cnpj: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">E-mail de Cobrança</label>
                  <input 
                    type="email" 
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={newClient.email || ''} 
                    onChange={e => setNewClient({...newClient, email: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Valor Mensal (R$)</label>
                    <input 
                      type="number" 
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                      value={newClient.recurringValue || ''} 
                      onChange={e => setNewClient({...newClient, recurringValue: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">1ª Cobrança</label>
                    <input 
                      type="date" 
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                      value={newClient.nextBillingDate || ''} 
                      onChange={e => setNewClient({...newClient, nextBillingDate: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Duração do Contrato (Meses)</label>
                  <input 
                    type="number" 
                    min="1"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={newClient.months || 1} 
                    onChange={e => setNewClient({...newClient, months: Math.max(1, Number(e.target.value))})}
                  />
                </div>
              </div>

              {/* Detalhes do Plano */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-2">Detalhes do Plano</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Quantidade Artes</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5">🎨</span>
                      <input 
                        type="number" 
                        min="0"
                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                        value={newClient.artCount || 0} 
                        onChange={e => setNewClient({...newClient, artCount: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Quantidade Vídeos</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5">🎬</span>
                      <input 
                        type="number" 
                        min="0"
                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                        value={newClient.videoCount || 0} 
                        onChange={e => setNewClient({...newClient, videoCount: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <input 
                    type="checkbox" 
                    id="traffic"
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                    checked={newClient.hasPaidTraffic || false}
                    onChange={e => setNewClient({...newClient, hasPaidTraffic: e.target.checked})}
                  />
                  <label htmlFor="traffic" className="text-sm font-medium text-slate-700 cursor-pointer select-none">
                    Gestão de Tráfego Pago incluso
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Observações do Plano</label>
                  <textarea 
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    placeholder="Ex: Formatos específicos, temas, restrições de horários..."
                    value={newClient.observations || ''} 
                    onChange={e => setNewClient({...newClient, observations: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8 border-t pt-6">
              <button 
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleAddClient}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Salvar Cliente e Gerar Faturas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
