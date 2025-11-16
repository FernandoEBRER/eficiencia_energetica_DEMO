// ========================================================================
// 🛑 CONFIGURAÇÕES E VARIÁVEIS GLOBAIS
// ========================================================================
const API_URL = "https://grupo-7-energias-back-end.3du0va.easypanel.host/api/medicoes";
const WEBHOOK_URL = "https://grupo-7-energias-n8n.3du0va.easypanel.host/webhook/56f1c082-3148-4a8c-9c82-223281a64e94";

// Variável para armazenar o objeto do gráfico
let myChart = null; 

// ========================================================================
// 1. FUNÇÃO PRINCIPAL DE CARREGAMENTO E RENDERIZAÇÃO
// ========================================================================

/**
 * Carrega os dados da API (opcionalmente com filtro de data), atualiza a tabela e recria o gráfico.
 * @param {string} startDate - Data de início (opcional, formato yyyy-mm-dd).
 * @param {string} endDate - Data de fim (opcional, formato yyyy-mm-dd).
 */
async function loadData(startDate = null, endDate = null) {
    console.log("🔄 Iniciando carregamento e renderização de dados...");
    
    // Constrói a URL com os parâmetros de filtro
    let fetchUrl = API_URL;
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    if (params.toString()) {
        fetchUrl += '?' + params.toString();
        console.log(`Buscando dados com filtro: ${params.toString()}`);
    } else {
        console.log("Buscando todos os dados (sem filtro).");
    }

    try {
        const resp = await fetch(fetchUrl); // Usa a URL construída
        if (!resp.ok) throw new Error(`Erro HTTP ao buscar dados: ${resp.status}`);
        const dados = await resp.json();

        if (!Array.isArray(dados) || dados.length === 0) {
            console.warn("API retornou array vazio ou formato inesperado.");
            // Limpa o gráfico e a tabela se não houver dados
            document.getElementById("table-body").innerHTML = '<tr><td colspan="12" style="text-align: center;">Nenhum dado encontrado para o período.</td></tr>';
            if (myChart) myChart.destroy();
            myChart = null;
            return;
        }

        // --- ATUALIZAÇÃO DA TABELA ---
        const corpo = document.getElementById("table-body");
        corpo.innerHTML = ""; 

        // Adiciona as novas linhas à tabela
        dados.forEach(item => {
            const tr = document.createElement("tr");
            Object.entries(item).forEach(([chave, valor]) => {
                const td = document.createElement("td");

                if (chave === "data_hora") {
                    const dataFormatada = new Date(valor).toLocaleString("pt-BR", {
                        day: "2-digit", month: "2-digit", year: "numeric",
                        hour: "2-digit", minute: "2-digit", second: "2-digit"
                    });
                    td.textContent = dataFormatada;
                } else {
                    td.textContent = valor;
                }
                tr.appendChild(td);
            });
            corpo.appendChild(tr);
        });

        // --- ATUALIZAÇÃO DO GRÁFICO ---
        
        // Destruir o gráfico anterior se existir
        if (myChart) {
             myChart.destroy();
        }

        const datas = dados.map(d => new Date(d.data_hora).toLocaleString("pt-BR"));
        const corrente = dados.map(d => d.corrente);
        const tensao = dados.map(d => d.tensao);
        const potencia = dados.map(d => d.potencia);
        const energia = dados.map(d => d.energia);

        const ctx = document.getElementById("graficoMedicoes").getContext("2d");
        
        // Cria o novo gráfico
        myChart = new Chart(ctx, { 
            type: "bar",
            data: {
                labels: datas,
                datasets: [
                    { type: "bar", label: "Potência (W)", data: potencia, backgroundColor: "rgba(54, 162, 235, 0.6)", yAxisID: 'y' },
                    { type: "bar", label: "Energia (Wh)", data: energia, backgroundColor: "rgba(255, 206, 86, 0.6)", yAxisID: 'y' },
                    { type: "line", label: "Corrente (A)", data: corrente, borderColor: "rgba(255, 99, 132, 1)", fill: false, tension: 0.3, yAxisID: 'y1' },
                    { type: "line", label: "Tensão (V)", data: tensao, borderColor: "rgba(75, 192, 192, 1)", fill: false, tension: 0.3, yAxisID: 'y1' }
                ]
            },
            // ... dentro da função loadData() ...
            options: { 
                 responsive: true,
                 scales: {
                    // ✅ NOVO CÓDIGO CORRIGIDO (EIXO X)
                    x: {
                        reverse: true, // Força a ordem cronológica (Antiga -> Recente)
                    },
                    y: { beginAtZero: true, position: 'left', title: { display: true, text: 'Potência / Energia' } },
                    y1: { beginAtZero: true, position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Tensão / Corrente' } }
                 },
                 plugins: {
// ...
                    title: { display: true, text: "Medições Elétricas" },
                    legend: { position: "top" }
                 }
            }
        });

        console.log("✅ Renderização concluída.");

    } catch (erro) {
        console.error("🚫 Falha no loadData:", erro);
        alert("Falha ao carregar dados da API. Verifique o console.");
    }
}

// ========================================================================
// 2. FUNÇÃO DE ATUALIZAÇÃO (CHAMADA DO WEBHOOK POST)
// ========================================================================

/**
 * Dispara o Webhook (POST), aguarda, e chama loadData para recarregar o painel.
 */
async function callWebhookAndUpdate() {
    console.log("🚀 Disparando coleta via Webhook (POST)...");
    
    const refreshButton = document.getElementById("refreshBtn");
    if (refreshButton) {
        // Feedback visual: desabilita o botão
        refreshButton.style.opacity = '0.3';
        refreshButton.style.pointerEvents = 'none';
    }

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST', 
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });

        if (!response.ok) {
            console.error("ERRO WEBHOOK DETECTADO:", response.status, response.statusText); 
            throw new Error(`Falha ao chamar o Webhook. Status: ${response.status}`);
        }

        console.log("✅ Webhook POST chamado com sucesso. Status:", response.status);
        
        // Adiciona um delay para dar tempo do N8N processar
        console.log("⏳ Aguardando 3 segundos para o N8N processar...");
        await new Promise(resolve => setTimeout(resolve, 3000)); 

        // Recarrega os dados atualizados sem filtro de data
        await loadData();
        
        console.log("🔄 Dados recarregados após o Webhook.");

    } catch (error) {
        console.error("🚫 Erro na atualização:", error);
        alert("Erro ao chamar o webhook ou recarregar dados. Verifique o console.");
    } finally {
        // Reabilita o botão
        if (refreshButton) {
            refreshButton.style.opacity = '0.8';
            refreshButton.style.pointerEvents = 'auto';
        }
    }
}

// ========================================================================
// 3. FUNÇÃO DE FILTRO DE GRÁFICO
// ========================================================================

/**
 * Coleta as datas dos inputs de filtro do gráfico e chama loadData com os filtros.
 */
function callFilterData() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    if (startDate || endDate) {
        loadData(startDate, endDate);
    } else {
        alert("Por favor, selecione pelo menos a data de início ou a data de fim para filtrar.");
    }
}

/**
 * Reseta os inputs de data e recarrega todos os dados.
 */
function resetChartFilter() {
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    loadData(); // Recarrega sem parâmetros de data
}


// ========================================================================
// 4. INICIALIZAÇÃO E EVENT LISTENERS
// ========================================================================

document.addEventListener("DOMContentLoaded", () => {
    // 4A. Carregamento Inicial
    loadData();

    // 4B. Event Listener no Botão de Refresh
    const refreshButton = document.getElementById("refreshBtn");
    if (refreshButton) {
        refreshButton.addEventListener("click", callWebhookAndUpdate);
    } 

    // 4C. Event Listener no Botão "Filtrar Gráfico"
    const filterChartButton = document.getElementById("filterChartBtn");
    if (filterChartButton) {
        filterChartButton.addEventListener("click", callFilterData);
    }

    // 4D. Event Listener no Botão "Resetar"
    const resetChartFilterButton = document.getElementById("resetChartFilterBtn");
    if (resetChartFilterButton) {
        resetChartFilterButton.addEventListener("click", resetChartFilter);
    }

    if (!refreshButton || !filterChartButton) {
        console.warn("Algum botão (refreshBtn ou filterChartBtn) não foi encontrado no DOM.");
    }
});