// js/processors.js
import { TrelloUtils } from './utils.js'; // Import TrelloUtils

export const DataProcessor = {
    processCardsForMemberStats: (cards, membersMap, listNamesMap) => {
        const memberCardStats = {};
        cards.forEach(card => {
            if (card.idMembers && card.idMembers.length > 0) {
                card.idMembers.forEach(memberId => {
                    if (!memberCardStats[memberId]) {
                        memberCardStats[memberId] = { total: 0, status: {} };
                    }
                    memberCardStats[memberId].total++;
                    const listName = listNamesMap.get(card.idList) || 'Lista Desconhecida';
                    memberCardStats[memberId].status[listName] = (memberCardStats[memberId].status[listName] || 0) + 1;
                });
            }
        });
        return memberCardStats;
    },
    filterCards: (cards, startDate, endDate, memberIdToFilter = null) => {
        let filtered = cards;

        if (startDate || endDate) {
            filtered = filtered.filter(card => {
                try {
                    const cardCreationDate = new Date(TrelloUtils.convertHexcodeIntoUTC(card.id));
                    const isAfterStartDate = !startDate || cardCreationDate >= startDate;
                    const isBeforeEndDate = !endDate || cardCreationDate <= endDate;
                    return isAfterStartDate && isBeforeEndDate;
                } catch (e) {
                    console.warn("Erro ao converter ID do cartão para data durante a filtragem:", card.id, e);
                    return false;
                }
            });
        }

        if (memberIdToFilter) {
            filtered = filtered.filter(card => card.idMembers && card.idMembers.includes(memberIdToFilter));
        }
        return filtered;
    },
    calculateListCardCounts: (cards, listNamesMap) => {
        const listCardCounts = {};
        cards.forEach(card => {
            const listId = card.idList;
            listCardCounts[listId] = (listCardCounts[listId] || 0) + 1;
        });

        const labels = [];
        const data = [];
        for (const listId in listCardCounts) {
            const listName = listNamesMap.get(listId) || 'Lista Desconhecida';
            labels.push(`${listName} (${listCardCounts[listId]})`);
            data.push(listCardCounts[listId]);
        }
        return { labels, data };
    },
    calculateSpecificCardCounts: (stats, listNamesMap, specificListIds) => {
        const concludedListName = listNamesMap.get(specificListIds.concluidos);
        const licitacaoAnalisesListName = listNamesMap.get(specificListIds.licitacaoAnalises);

        const concludedCardsCount = concludedListName ? (stats.status[concludedListName] || 0) : 0;
        const licitacaoAnalisesCardsCount = licitacaoAnalisesListName ? (stats.status[licitacaoAnalisesListName] || 0) : 0;

        return {
            concluded: concludedCardsCount,
            licitacaoAnalises: licitacaoAnalisesCardsCount,
            total: concludedCardsCount + licitacaoAnalisesCardsCount
        };
    }
};