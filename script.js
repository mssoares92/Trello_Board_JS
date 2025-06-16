document.addEventListener('DOMContentLoaded', () => {
    const apiKey = 'a6dc11c610cc5ee1c931a16824020c70'; // SUA CHAVE DA API DO TRELLO
    const token = 'ATTA2fdb7333d6891c3fac037d0543b73ed7ef4e8e8f98013705ca805f9b57d0488b73D64C0A'; // SEU TOKEN DO TRELLO
    const boardId = 'XaNWLODV'; // SEU ID DO BOARD DO TRELLO

    const boardInfoDiv = document.getElementById('board-info');
    const memberAnalysisPanel = document.getElementById('member-analysis-panel');
    const listChartCanvas = document.getElementById('listDistributionChart');

    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const filterButton = document.getElementById('filterButton');
    const clearFilterButton = document.getElementById('clearFilterButton');

    let allTrelloCards = [];
    let allTrelloLists = new Map();
    let allTrelloMembers = new Map();

    let listChartInstance = null;

    async function fetchRawData() {
        console.log(`Buscando dados brutos do Trello... (Última atualização de dados brutos: ${new Date().toLocaleTimeString()})`);
        try {
            const cardsResponse = await fetch(`https://api.trello.com/1/boards/${boardId}/cards?key=${apiKey}&token=${token}&members=true`);
            if (!cardsResponse.ok) {
                throw new Error(`Erro ao buscar cartões: ${cardsResponse.statusText}`);
            }
            allTrelloCards = await cardsResponse.json();

            const boardResponse = await fetch(`https://api.trello.com/1/boards/${boardId}?key=${apiKey}&token=${token}`);
            if (!boardResponse.ok) {
                throw new Error(`Erro ao buscar informações do board: ${boardResponse.statusText}`);
            }
            const board = await boardResponse.json();

            const listsResponse = await fetch(`https://api.trello.com/1/boards/${boardId}/lists?key=${apiKey}&token=${token}`);
            if (!listsResponse.ok) {
                throw new Error(`Erro ao buscar listas: ${listsResponse.statusText}`);
            }
            const lists = await listsResponse.json();
            allTrelloLists.clear();
            lists.forEach(list => {
                allTrelloLists.set(list.id, list.name);
            });

            const membersResponse = await fetch(`https://api.trello.com/1/boards/${boardId}/members?key=${apiKey}&token=${token}`);
            if (!membersResponse.ok) {
                throw new Error(`Erro ao buscar membros: ${membersResponse.statusText}`);
            }
            const members = await membersResponse.json();
            allTrelloMembers.clear();
            members.forEach(member => {
                allTrelloMembers.set(member.id, member.fullName);
            });

            applyAndRenderFilter(board, allTrelloCards, allTrelloMembers, allTrelloLists);

        } catch (error) {
            console.error('Erro ao buscar dados do Trello:', error);
            boardInfoDiv.innerHTML = `<p class="error-message">Ocorreu um erro ao carregar as informações: ${error.message}</p>`;
            memberAnalysisPanel.innerHTML = '';
            if (listChartInstance) {
                listChartInstance.destroy();
                listChartInstance = null;
            }
        }
    }

    function applyAndRenderFilter(board, cards, membersMap, listNamesMap) {
        console.log(`Aplicando filtro e renderizando...`);

        const startDate = startDateInput.value ? new Date(startDateInput.value + 'T00:00:00Z') : null;
        const endDate = endDateInput.value ? new Date(endDateInput.value + 'T23:59:59Z') : null;

        let filteredCards = cards;

        if (startDate || endDate) {
            filteredCards = cards.filter(card => {
                const cardLastActivityDate = new Date(card.dateLastActivity);

                const isAfterStartDate = !startDate || cardLastActivityDate >= startDate;
                const isBeforeEndDate = !endDate || cardLastActivityDate <= endDate;
                
                return isAfterStartDate && isBeforeEndDate;
            });
        }

        renderBoardSummary(board, filteredCards, membersMap);
        renderMemberAnalysis(filteredCards, membersMap, listNamesMap);
        renderListDistributionChart(filteredCards, listNamesMap);
    }

    // ... (renderBoardSummary e renderMemberAnalysis permanecem inalteradas, mantendo sua versão mais recente) ...
    // Estou omitindo elas aqui para manter o foco nas mudanças do gráfico.
    // Certifique-se de que no seu arquivo real, elas estejam completas.

    function renderBoardSummary(board, cards, membersMap) {
        boardInfoDiv.innerHTML = '';

        const summaryCard = document.createElement('div');
        summaryCard.classList.add('board-summary-card');

        const boardName = document.createElement('h2');
        boardName.textContent = `Quadro: ${board.name}`;
        summaryCard.appendChild(boardName);

        const totalCards = document.createElement('p');
        totalCards.innerHTML = `<strong>Total de Cartões Filtrados:</strong> ${cards.length}`;
        summaryCard.appendChild(totalCards);

        const uniqueMemberIds = new Set();
        cards.forEach(card => {
            if (card.idMembers) {
                card.idMembers.forEach(memberId => {
                    uniqueMemberIds.add(memberId);
                });
            }
        });

        const membersHeading = document.createElement('p');
        membersHeading.innerHTML = `<strong>Membros Atribuídos a Cartões Filtrados (${uniqueMemberIds.size}):</strong>`;
        summaryCard.appendChild(membersHeading);

        if (uniqueMemberIds.size > 0) {
            const membersList = document.createElement('ul');
            const sortedMemberNames = Array.from(uniqueMemberIds)
                .map(memberId => membersMap.get(memberId) || 'Membro Desconhecido')
                .sort((a, b) => a.localeCompare(b));
            
            sortedMemberNames.forEach(memberName => {
                const listItem = document.createElement('li');
                listItem.textContent = memberName;
                membersList.appendChild(listItem);
            });
            summaryCard.appendChild(membersList);
        } else {
            const noMembersMessage = document.createElement('p');
            noMembersMessage.textContent = 'Nenhum membro atribuído a cartões filtrados neste quadro.';
            summaryCard.appendChild(noMembersMessage);
        }

        boardInfoDiv.appendChild(summaryCard);
    }

    function renderMemberAnalysis(cards, membersMap, listNamesMap) {
        memberAnalysisPanel.innerHTML = '';
        
        const title = document.createElement('h2');
        title.textContent = 'Análise de Cartões por Membro e Status (Filtrados)';
        memberAnalysisPanel.appendChild(title);

        const memberCardStats = {};

        cards.forEach(card => {
            if (card.idMembers && card.idMembers.length > 0) {
                card.idMembers.forEach(memberId => {
                    if (!memberCardStats[memberId]) {
                        memberCardStats[memberId] = {
                            total: 0,
                            status: {}
                        };
                    }

                    memberCardStats[memberId].total++;

                    const listName = listNamesMap.get(card.idList) || 'Lista Desconhecida';

                    if (!memberCardStats[memberId].status[listName]) {
                        memberCardStats[memberId].status[listName] = 0;
                    }
                    memberCardStats[memberId].status[listName]++;
                });
            }
        });

        const sortedMemberIds = Object.keys(memberCardStats).sort((a, b) => {
            const nameA = membersMap.get(a) || 'Membro Desconhecido';
            const nameB = membersMap.get(b) || 'Membro Desconhecido';
            return nameA.localeCompare(nameB);
        });

        if (sortedMemberIds.length === 0) {
            memberAnalysisPanel.innerHTML += '<p style="text-align: center;">Nenhum cartão atribuído a membros neste quadro, ou nenhum cartão no período selecionado.</p>';
            return;
        }

        sortedMemberIds.forEach(memberId => {
            const memberName = membersMap.get(memberId) || 'Membro Desconhecido';
            const stats = memberCardStats[memberId];

            const memberCardSummary = document.createElement('div');
            memberCardSummary.classList.add('member-card-summary');

            const memberTitle = document.createElement('h3');
            memberTitle.textContent = memberName;
            memberCardSummary.appendChild(memberTitle);

            const totalMemberCards = document.createElement('p');
            totalMemberCards.classList.add('total-member-cards');
            totalMemberCards.innerHTML = `Total de Cartões: ${stats.total}`;
            memberCardSummary.appendChild(totalMemberCards);

            const listStatusBreakdown = document.createElement('div');
            listStatusBreakdown.classList.add('list-status-breakdown');

            const sortedStatuses = Object.keys(stats.status).sort((a, b) => a.localeCompare(b));

            sortedStatuses.forEach(statusName => {
                const count = stats.status[statusName];
                const statusItem = document.createElement('div');
                statusItem.classList.add('list-status-item');
                statusItem.innerHTML = `<strong>${statusName}:</strong> ${count}`;
                listStatusBreakdown.appendChild(statusItem);
            });

            memberCardSummary.appendChild(listStatusBreakdown);
            memberAnalysisPanel.appendChild(memberCardSummary);
        });
    }

    // --- Nova função para renderizar o gráfico de pizza ---
    function renderListDistributionChart(cards, listNamesMap) {
        if (listChartInstance) {
            listChartInstance.destroy(); // Destrói a instância anterior do gráfico, se existir
        }

        const listCardCounts = {};

        cards.forEach(card => {
            const listId = card.idList;
            if (!listCardCounts[listId]) {
                listCardCounts[listId] = 0;
            }
            listCardCounts[listId]++;
        });

        const labels = [];
        const data = [];
        const backgroundColors = [];

        // NOVA PALETA DE CORES MAIS DISTINTA E VIBRANTE
        const newPredefinedColors = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
            '#FF9F40', '#8D6E63', '#9CCC65', '#26A69A', '#AB47BC',
            '#FFD54F', '#64B5F6', '#EF5350', '#7E57C2', '#29B6F6',
            '#FDD835', '#D4E157', '#FFEE58', '#BA68C8', '#4DB6AC'
        ];
        let colorIndex = 0;

        for (const listId in listCardCounts) {
            const listName = listNamesMap.get(listId) || 'Lista Desconhecida';
            labels.push(`${listName} (${listCardCounts[listId]})`);
            data.push(listCardCounts[listId]);
            backgroundColors.push(newPredefinedColors[colorIndex % newPredefinedColors.length]);
            colorIndex++;
        }

        if (data.length === 0) {
            listChartCanvas.style.display = 'none';
            listChartCanvas.parentNode.querySelector('h2').textContent = 'Nenhum cartão no período selecionado para o gráfico.';
            return;
        } else {
            listChartCanvas.style.display = 'block';
            listChartCanvas.parentNode.querySelector('h2').textContent = 'Distribuição de Cartões por Lista (Filtrados)';
        }

        const ctx = listChartCanvas.getContext('2d');
        listChartInstance = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors,
                    hoverOffset: 4,
                    borderWidth: 0 // Remove a borda branca entre as fatias
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            font: {
                                size: 12
                            },
                            boxWidth: 20,
                            padding: 10
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) {
                                    label = label.replace(/\s\(\d+\)$/, '');
                                    label += ': ';
                                }
                                if (context.parsed !== null) {
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((context.parsed / total) * 100).toFixed(2);
                                    label += `${context.parsed} cartões (${percentage}%)`;
                                }
                                return label;
                            }
                        },
                        titleFont: { size: 14 },
                        bodyFont: { size: 14 }
                    }
                }
            }
        });
    }

    // --- Configuração dos Event Listeners e Polling ---

    fetchRawData();

    filterButton.addEventListener('click', () => {
        fetchRawData();
    });

    clearFilterButton.addEventListener('click', () => {
        startDateInput.value = '';
        endDateInput.value = '';
        fetchRawData();
    });

    const rawDataRefreshInterval = 60 * 1000;
    setInterval(fetchRawData, rawDataRefreshInterval);
});