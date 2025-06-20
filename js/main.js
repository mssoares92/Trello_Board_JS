// js/main.js
import { config } from './config.js';
import { domElements } from './domElements.js';
import { TrelloService } from './services.js';
import { DataProcessor } from './processors.js';
import { UIRenderer } from './renderers.js';

// --- Armazenamento de Dados Globais ---
let allTrelloCards = [];
let allTrelloLists = new Map();
let allTrelloMembers = new Map();
let allTrelloBoardInfo = null; // Store board info globally
let currentFilteredMemberId = null; // State for member chart filter

const appChartInstanceRef = { current: null }; // Reference for Chart.js instance

/**
 * Applies filters and renders the UI.
 * @param {object} board - Trello board information.
 * @param {Array} cards - All Trello cards.
 * @param {Map} membersMap - Map of member IDs to full names.
 * @param {Map} listNamesMap - Map of list IDs to list names.
 * @param {string|null} memberIdToFilter - ID of the member to filter the chart by, or null.
 */
async function applyAndRenderFilterProcess(board, cards, membersMap, listNamesMap, memberIdToFilter = null) {
    currentFilteredMemberId = memberIdToFilter; // Update global member filter state

    const startDate = domElements.startDateInput.value ? new Date(domElements.startDateInput.value + 'T00:00:00Z') : null;
    const endDate = domElements.endDateInput.value ? new Date(domElements.endDateInput.value + 'T23:59:59Z') : null;

    // Filter cards for different UI sections
    const filteredCardsForBoardSummary = DataProcessor.filterCards(cards, startDate, endDate);
    // Cards for member analysis panel are filtered ONLY by date, not by specific member
    const filteredCardsForMemberAnalysis = DataProcessor.filterCards(cards, startDate, endDate);
    
    // Cards for the chart are filtered by date AND by member if specified
    const filteredCardsForChart = DataProcessor.filterCards(cards, startDate, endDate, memberIdToFilter);

    const memberCardStats = DataProcessor.processCardsForMemberStats(filteredCardsForMemberAnalysis, membersMap, listNamesMap);
    const listChartData = DataProcessor.calculateListCardCounts(filteredCardsForChart, listNamesMap);

    let totalBoardSpecificCards = 0;
    for (const memberId in memberCardStats) {
        const stats = memberCardStats[memberId];
        const specificCounts = DataProcessor.calculateSpecificCardCounts(stats, listNamesMap, config.listIds);
        totalBoardSpecificCards += specificCounts.total;
    }

    // Render UI components
    UIRenderer.renderBoardSummary(board, filteredCardsForBoardSummary, membersMap, domElements.boardInfo, totalBoardSpecificCards, memberCardStats);
    
    // Pass a callback function to renderMemberAnalysis for member click handling
    UIRenderer.renderMemberAnalysis(memberCardStats, membersMap, listNamesMap, domElements.memberAnalysisPanel, config.listIds, (clickedMemberId) => {
        // When a member is clicked, re-render the process with the new member filter
        applyAndRenderFilterProcess(allTrelloBoardInfo, allTrelloCards, allTrelloMembers, allTrelloLists, clickedMemberId);
    });

    // Get member name for chart title
    const memberNameForChart = memberIdToFilter ? membersMap.get(memberIdToFilter) : null;
    UIRenderer.renderListDistributionChart(listChartData, domElements.listChartCanvas, appChartInstanceRef, domElements.listChartTitle, memberNameForChart);
}

/**
 * Initializes the application: fetches data and performs initial rendering.
 */
async function initializeAndRenderApp() {
    try {
        const [cards, board, lists, members] = await Promise.all([
            TrelloService.fetchCards(config.boardId, config.apiKey, config.token),
            TrelloService.fetchBoardInfo(config.boardId, config.apiKey, config.token),
            TrelloService.fetchLists(config.boardId, config.apiKey, config.token),
            TrelloService.fetchMembers(config.boardId, config.apiKey, config.token)
        ]);

        allTrelloCards = cards;
        allTrelloLists.clear();
        lists.forEach(list => allTrelloLists.set(list.id, list.name));
        allTrelloMembers.clear();
        members.forEach(member => allTrelloMembers.set(member.id, member.fullName));
        allTrelloBoardInfo = board; // Store board info globally after fetching

        // Initial render with current filters (or none)
        applyAndRenderFilterProcess(allTrelloBoardInfo, allTrelloCards, allTrelloMembers, allTrelloLists, currentFilteredMemberId);

    } catch (error) {
        console.error('Erro geral no aplicativo:', error);
        UIRenderer.renderErrorMessage(domElements.boardInfo, error.message);
        UIRenderer.clearElement(domElements.memberAnalysisPanel);
        if (appChartInstanceRef.current) {
            appChartInstanceRef.current.destroy();
            appChartInstanceRef.current = null;
        }
        // Ensure domElements.listChartTitle is handled defensively if it's still null for some reason
        if (domElements.listChartTitle) {
            domElements.listChartTitle.textContent = "Erro ao carregar dados do gráfico.";
        }
    }
}

// --- Event Listeners ---
domElements.filterButton.addEventListener('click', () => {
    // When filter button is clicked, remove any active member filter
    applyAndRenderFilterProcess(allTrelloBoardInfo, allTrelloCards, allTrelloMembers, allTrelloLists, null);
});

domElements.clearFilterButton.addEventListener('click', () => {
    domElements.startDateInput.value = '';
    domElements.endDateInput.value = '';
    // When filter is cleared, remove any active member filter
    applyAndRenderFilterProcess(allTrelloBoardInfo, allTrelloCards, allTrelloMembers, allTrelloLists, null);
});

// --- Initialization on DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', () => {
    initializeAndRenderApp();
    setInterval(initializeAndRenderApp, config.refreshInterval);
});