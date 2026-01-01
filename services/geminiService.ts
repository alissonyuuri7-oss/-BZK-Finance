
import { GoogleGenAI } from "@google/genai";
import { Transaction, Client } from "../types";

export const getFinancialInsights = async (transactions: Transaction[], clients: Client[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const dataSummary = {
    totalIncome: transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0),
    totalExpense: transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0),
    clientCount: clients.length,
    activeRecurringValue: clients.filter(c => c.status === 'active').reduce((acc, curr) => acc + curr.recurringValue, 0),
    expenseCategories: Array.from(new Set(transactions.filter(t => t.type === 'expense').map(t => t.category)))
  };

  const prompt = `Analise os seguintes dados financeiros e forneça 3 insights curtos e práticos para melhorar o negócio:
  Receita Total: R$ ${dataSummary.totalIncome}
  Despesas Totais: R$ ${dataSummary.totalExpense}
  Valor em Recorrência Ativa: R$ ${dataSummary.activeRecurringValue}
  Categorias de Gastos: ${dataSummary.expenseCategories.join(', ')}
  Número de Clientes: ${dataSummary.clientCount}

  Retorne apenas um array JSON de strings, sem formatação markdown adicional.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const insights = JSON.parse(response.text || '[]');
    return insights;
  } catch (error) {
    console.error("Erro ao obter insights da IA:", error);
    return ["Mantenha o controle de suas despesas recorrentes.", "Analise o churn rate de seus clientes mensais.", "Considere reinvestir o lucro em automação."];
  }
};
