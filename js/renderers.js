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
            <p><strong>Total de Cartões Concluídos (e Softrware Atualizados):</strong> <strong>${totalBoardSpecificCards}</strong></p>
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
            targetElement.innerHTML += '<p style="text-align: center;">Nenhum cartão atribuído a membros neste quadro.</p>';
            return;
        }

        // 🔥 Descobrir o maior total de concluídos
        // 🔥 Descobrir o maior total de concluídos
        let maxTotal = 0;
        const totalsByMember = {};

        sortedMemberIds.forEach(memberId => {
            const stats = memberCardStats[memberId];
            const specificCounts = DataProcessor.calculateSpecificCardCounts(stats, listNamesMap, specificListIds);
            totalsByMember[memberId] = specificCounts.total;

            if (specificCounts.total > maxTotal) {
                maxTotal = specificCounts.total;
            }
        });

        // 🚀 Agora renderiza os cards
        sortedMemberIds.forEach(memberId => {
            const memberName = membersMap.get(memberId) || 'Membro Desconhecido';
            const stats = memberCardStats[memberId];

            const memberCardSummary = document.createElement('div');
            memberCardSummary.classList.add('member-card-summary');

            // 👑 Aplica destaque ao top performer
            if (totalsByMember[memberId] === maxTotal && maxTotal > 0) {
                memberCardSummary.classList.add('top-performer');
            }

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
            totalMemberCardsParagraph.innerHTML = `<strong>Total</strong>: Cartões Concluídos e Software Atrasados: <strong>${specificCounts.total}</strong>`;
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

        // 🔥 Criar crescimento acumulado (efeito exponencial visual)
        const cumulativeData = data.reduce((acc, val, i) => {
            acc.push((acc[i - 1] || 0) + val);
            return acc;
        }, []);

        if (data.length === 0) {
            chartCanvas.style.display = 'none';
            chartTitleElement.textContent =
                `Nenhum cartão ${memberName ? `para ${memberName} ` : ''}no período selecionado para o gráfico.`;
            return;
        } else {
            chartCanvas.style.display = 'block';
            chartTitleElement.textContent =
                `Evolução Acumulada de Cartões por Lista (Filtrados${memberName ? ` - ${memberName}` : ''})`;
        }

        const ctx = chartCanvas.getContext('2d');

        // 🎨 Gradiente profissional (Dracula/Omni vibe)
        const gradient = ctx.createLinearGradient(0, 0, 0, chartCanvas.height);
        gradient.addColorStop(0, 'rgba(80, 250, 123, 0.35)');
        gradient.addColorStop(1, 'rgba(80, 250, 123, 0.02)');

        chartInstanceRef.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Crescimento Acumulado de Cartões',
                    data: cumulativeData,
                    tension: 0.45,
                    fill: true,
                    backgroundColor: gradient,
                    borderColor: '#50fa7b',
                    borderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#50fa7b'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            boxWidth: 8
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const value = context.parsed.y;
                                return ` ${value} cartões acumulados`;
                            },
                            afterLabel: function (context) {
                                const originalValue = data[context.dataIndex];
                                return ` +${originalValue} cartões neste status`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: {
                            maxRotation: 0,
                            autoSkip: true
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            borderDash: [4, 4],
                            color: 'rgba(148,163,184,0.2)'
                        },
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
    }

};