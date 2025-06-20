// js/renderers.js
import { DataProcessor } from './processors.js'; // Import DataProcessor

export const UIRenderer = {
    renderErrorMessage: (element, message) => {
        element.innerHTML = `<p class="error-message">Ocorreu um erro ao carregar as informações: ${message}</p>`;
    },
    clearElement: (element) => {
        element.innerHTML = '';
    },
    renderBoardSummary: (board, cards, membersMap, targetElement, totalBoardSpecificCards, memberCardStats) => {
        UIRenderer.clearElement(targetElement);
        const summaryCard = document.createElement('div');
        summaryCard.classList.add('board-summary-card');

        summaryCard.innerHTML = `
            <h2>Quadro: ${board.name}</h2>
            <p><strong>Total de Cartões Filtrados:</strong> ${cards.length}</p>
            <p><strong>Total de Cartões Concluídos (e Licitação):</strong> <strong>${totalBoardSpecificCards}</strong></p>
            <p><strong>Membros Atribuídos a Cartões Filtrados:</strong></p>
        `;

        const uniqueMemberIds = new Set();
        cards.forEach(card => card.idMembers?.forEach(memberId => uniqueMemberIds.add(memberId)));

        if (uniqueMemberIds.size > 0) {
            const membersList = document.createElement('ul');
            const sortedMemberIdsArray = Array.from(uniqueMemberIds).sort((a, b) => {
                const nameA = membersMap.get(a) || 'Membro Desconhecido';
                const nameB = membersMap.get(b) || 'Membro Desconhecido';
                return nameA.localeCompare(b);
            });

            sortedMemberIdsArray.forEach(memberId => {
                const memberName = membersMap.get(memberId) || 'Membro Desconhecido';
                const totalCardsForMember = memberCardStats[memberId]?.total || 0;
                
                const listItem = document.createElement('li');
                listItem.textContent = `${memberName} (${totalCardsForMember} cartões)`;
                membersList.appendChild(listItem);
            });
            summaryCard.appendChild(membersList);
        } else {
            summaryCard.innerHTML += '<p>Nenhum membro atribuído a cartões filtrados neste quadro.</p>';
        }
        targetElement.appendChild(summaryCard);
    },

    renderMemberAnalysis: (memberCardStats, membersMap, listNamesMap, targetElement, specificListIds, onMemberClickCallback) => {
        UIRenderer.clearElement(targetElement);

        const title = document.createElement('h2');
        title.textContent = 'Análise de Cartões por Membro e Status (Filtrados)';
        targetElement.appendChild(title);

        const sortedMemberIds = Object.keys(memberCardStats).sort((a, b) => {
            const nameA = membersMap.get(a) || 'Membro Desconhecido';
            const nameB = membersMap.get(b) || 'Membro Desconhecido';
            return nameA.localeCompare(b);
        });

        if (sortedMemberIds.length === 0) {
            targetElement.innerHTML += '<p style="text-align: center;">Nenhum cartão atribuído a membros neste quadro, ou nenhum cartão no período selecionado.</p>';
            return;
        }

        sortedMemberIds.forEach(memberId => {
            const memberName = membersMap.get(memberId) || 'Membro Desconhecido';
            const stats = memberCardStats[memberId];

            const memberCardSummary = document.createElement('div');
            memberCardSummary.classList.add('member-card-summary');

            const memberTitle = document.createElement('h3');
            memberTitle.textContent = memberName;
            memberTitle.style.cursor = 'pointer';
            memberTitle.classList.add('member-name-clickable');
            memberTitle.dataset.memberId = memberId;
            
            memberTitle.addEventListener('click', () => {
                onMemberClickCallback(memberId);
            });

            memberCardSummary.appendChild(memberTitle);

            const specificCounts = DataProcessor.calculateSpecificCardCounts(stats, listNamesMap, specificListIds);

            const totalMemberCardsParagraph = document.createElement('p');
            totalMemberCardsParagraph.classList.add('total-member-cards');
            totalMemberCardsParagraph.innerHTML = `Total de Cartões Concluídos (e Licitação): <strong>${specificCounts.total}</strong>`;
            memberCardSummary.appendChild(totalMemberCardsParagraph);

            const specificListsBreakdown = document.createElement('div');
            specificListsBreakdown.classList.add('specific-list-breakdown', 'hidden');
            specificListsBreakdown.innerHTML += `<p>• ${listNamesMap.get(specificListIds.concluidos) || 'Concluídos Desconhecido'}: ${specificCounts.concluded}</p>`;
            specificListsBreakdown.innerHTML += `<p>• ${listNamesMap.get(specificListIds.licitacaoAnalises) || 'Licitação Desconhecida'}: ${specificCounts.licitacaoAnalises}</p>`;
            memberCardSummary.appendChild(specificListsBreakdown);

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
            targetElement.appendChild(memberCardSummary);
        });
    },

    renderListDistributionChart: (chartData, chartCanvas, chartInstanceRef, chartTitleElement, memberName = null) => {
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
            chartInstanceRef.current = null;
        }

        const { labels, data } = chartData;
        const newPredefinedColors = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
            '#FF9F40', '#8D6E63', '#9CCC65', '#26A69A', '#AB47BC',
            '#FFD54F', '#64B5F6', '#EF5350', '#7E57C2', '#29B6F6',
            '#FDD835', '#D4E157', '#FFEE58', '#BA68C8', '#4DB6AC'
        ];
        const backgroundColors = data.map((_, i) => newPredefinedColors[i % newPredefinedColors.length]);

        if (data.length === 0) {
            chartCanvas.style.display = 'none';
            chartTitleElement.textContent = `Nenhum cartão ${memberName ? `para ${memberName} ` : ''}no período selecionado para o gráfico.`;
            return;
        } else {
            chartCanvas.style.display = 'block';
            chartTitleElement.textContent = `Distribuição de Cartões por Lista (Filtrados${memberName ? ` - ${memberName}` : ''})`;
        }

        const ctx = chartCanvas.getContext('2d');
        chartInstanceRef.current = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors,
                    hoverOffset: 4,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top' },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                let label = context.label?.replace(/\s\(\d+\)$/, '') || '';
                                if (context.parsed !== null) {
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((context.parsed / total) * 100).toFixed(2);
                                    label += `: ${context.parsed} cartões (${percentage}%)`;
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }
};