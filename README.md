⚙️ Configuração e Regras de Negócio
O sistema foi desenhado para ser altamente customizável através do módulo config.js. Ele permite a definição de fluxos específicos, como o monitoramento de processos de licitação:

Identificadores de Lista (Mapping): O projeto mapeia IDs específicos da API do Trello para categorias de análise internas (ex: concluidos e licitacaoAnalises). Isso permite que o DataProcessor realize cálculos de performance focados em entregas reais, ignorando listas auxiliares.

Ciclo de Atualização: Configurado para um polling de 60 segundos, garantindo que o dashboard reflita mudanças quase em tempo real sem sobrecarregar o limite de requisições (rate limit) da API do Trello.

🔒 Segurança e Boas Práticas
[!IMPORTANT] Nota sobre Credenciais: O arquivo config.js contém a apiKey e o token de acesso. Para ambientes de produção, recomenda-se:

Adicionar o config.js ao seu .gitignore.

Utilizar variáveis de ambiente (process.env) caso utilize um bundler como Vite ou Webpack.

Rotacionar tokens periodicamente através do painel de desenvolvedor do Trello.

📊 Lógica de Processamento de Dados
Abaixo, um detalhamento da inteligência aplicada no DataProcessor:

Filtragem Multidimensional
A função filterCards não apenas filtra por data, mas gerencia o estado de filtragem cruzada por membros. Se um memberId é fornecido, o motor de busca isola a performance individual, permitindo comparar a produtividade de um colaborador específico versus a média do quadro.

Normalização Temporal
As datas de entrada são tratadas para cobrir o intervalo total do dia selecionado:

Início: YYYY-MM-DDT00:00:00Z

Fim: YYYY-MM-DDT23:59:59Z Isso elimina discrepâncias comuns em fusos horários diferentes (UTC vs Local).

🚀 Como instalar este projeto
Clone o repositório:

Bash

git clone https://github.com/seu-usuario/trello-analytics.git
Configure suas chaves: Edite o arquivo js/config.js com suas credenciais obtidas em trello.com/app-key.

Execução: Como o projeto utiliza ES6 Modules, ele não funcionará abrindo o arquivo .html diretamente no navegador. Utilize uma extensão como o Live Server (VS Code) ou o comando abaixo:

Bash

# Se tiver Python instalado
python -m http.server 8000
🛠️ Tecnologias e Ferramentas
Runtime: Navegador (Client-side apenas)

Gráficos: Chart.js 4.x

Estilização: CSS Moderno (Grid & Flexbox)

Integração: Trello REST API
