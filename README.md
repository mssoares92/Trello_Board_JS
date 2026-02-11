# 📊 Trello Advanced Analytics Dashboard

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-Grid%20%26%20Flexbox-1572B6?style=for-the-badge&logo=css3)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel)

Uma solução robusta de **Business Intelligence (BI)** desenvolvida para transformar dados brutos da API do Trello em insights estratégicos. O foco da aplicação é o monitoramento de fluxos de trabalho, análise de produtividade por membro e gestão de prazos através de filtragem temporal dinâmica.

**🔗 [Acesse o Projeto Live](https://trello-board-js.vercel.app/)**

---

## 🏗️ Arquitetura do Software

O projeto foi estruturado seguindo padrões modernos de engenharia de frontend, utilizando uma abordagem modular para garantir escalabilidade e fácil manutenção:

* **`TrelloService`**: Gerencia toda a comunicação assíncrona com a REST API do Trello.
* **`DataProcessor`**: O núcleo lógico. Responsável pela normalização de datas, cálculos estatísticos e filtragem multidimensional.
* **`UIRenderer`**: Camada de visualização que abstrai a manipulação do DOM e a renderização de gráficos complexos.
* **`Main.js`**: Orquestrador central que gerencia o estado global (Cards, Lists, Members) e os gatilhos de atualização.



---

## 🛠️ Destaques Técnicos

### 1. Sistema de Filtragem Reativa
A aplicação implementa um motor de busca que permite isolar janelas de tempo específicas e cruzar esses dados com membros da equipe:
* **Cross-Filtering**: Ao selecionar um membro no painel lateral, todos os gráficos e métricas do board são recalculados instantaneamente para refletir apenas a performance individual daquele colaborador.
* **Normalização Temporal**: Tratamento de strings de data para garantir que o filtro cubra exatamente de `00:00:00` a `23:59:59` do intervalo selecionado.

### 2. Layout Responsivo & Grid System
A interface foi projetada para alta densidade de informação:
* **CSS Grid**: Utilizado para o painel de análise de membros, adaptando-se de 4 colunas (Desktop) para 1 coluna (Mobile) via Media Queries.
* **Flexbox**: Aplicado em cards de resumo para garantir alinhamento vertical consistente e resiliência a conteúdos dinâmicos.

### 3. Otimização de Performance
* **Parallel Fetching**: Uso de `Promise.all` para reduzir o tempo de latência no carregamento inicial de dados.
* **Memory Management**: Destruição programática de instâncias do Chart.js para evitar *memory leaks* durante as atualizações automáticas (polling).

---

## ⚙️ Regras de Negócio & Configuração

O dashboard é configurado para monitorar fluxos de trabalho específicos (ex: Processos de Licitação):

