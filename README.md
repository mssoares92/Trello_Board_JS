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

[Image of a software architecture diagram showing data flowing from Trello API through a DataProcessor to UIRenderer and Chart.js]

---

## 🛠️ Destaques Técnicos

### 1. Sistema de Filtragem Reativa
A aplicação implementa um motor de busca que permite isolar janelas de tempo específicas e cruzar esses dados com membros da equipe:
* **Cross
