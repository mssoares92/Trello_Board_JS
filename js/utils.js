// js/domElements.js
export const domElements = {
    boardInfo: document.getElementById('board-info'),
    memberAnalysisPanel: document.getElementById('member-analysis-panel'),
    listChartCanvas: document.getElementById('listDistributionChart'),
    startDateInput: document.getElementById('startDate'),
    endDateInput: document.getElementById('endDate'),
    filterButton: document.getElementById('filterButton'),
    clearFilterButton: document.getElementById('clearFilterButton'),
    listChartTitle: document.getElementById('listChartTitle')
};

// js/utils.js
export const TrelloUtils = { // <--- Added 'export' here
    convertHexcodeIntoUTC: (hex) => {
        if (!hex || hex.length < 8) {
            throw new Error("Hex inválido ou muito curto.");
        }
        const hexTimestamp = hex.substring(0, 8);
        const timestampInSeconds = parseInt(hexTimestamp, 16);
        return new Date(timestampInSeconds * 1000).toISOString();
    }
};