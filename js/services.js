// js/services.js
export const TrelloService = {
    fetchCards: async (boardId, apiKey, token) => {
        const response = await fetch(`https://api.trello.com/1/boards/${boardId}/cards?key=${apiKey}&token=${token}&members=true`);
        if (!response.ok) throw new Error(`Erro ao buscar cartões: ${response.statusText}`);
        return response.json();
    },
    fetchBoardInfo: async (boardId, apiKey, token) => {
        const response = await fetch(`https://api.trello.com/1/boards/${boardId}?key=${apiKey}&token=${token}`);
        if (!response.ok) throw new Error(`Erro ao buscar informações do board: ${response.statusText}`);
        return response.json();
    },
    fetchLists: async (boardId, apiKey, token) => {
        const response = await fetch(`https://api.trello.com/1/boards/${boardId}/lists?key=${apiKey}&token=${token}`);
        if (!response.ok) throw new Error(`Erro ao buscar listas: ${response.statusText}`);
        return response.json();
    },
    fetchMembers: async (boardId, apiKey, token) => {
        const response = await fetch(`https://api.trello.com/1/boards/${boardId}/members?key=${apiKey}&token=${token}`);
        if (!response.ok) throw new Error(`Erro ao buscar membros: ${response.statusText}`);
        return response.json();
    }
};