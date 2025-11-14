document.addEventListener("DOMContentLoaded", async () => {
  const url = "https://grupo-7-energias-back-end.3du0va.easypanel.host/api/medicoes";

  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Erro HTTP: ${resp.status}`);
    const dados = await resp.json();

    if (!Array.isArray(dados) || dados.length === 0) {
      console.error("Array vazio ou formato inesperado", dados);
      return;
    }

    // Limpa corpo da tabela
    const corpo = document.getElementById("table-body");
    corpo.innerHTML = "";

    // Remove linha "Carregando dados..." se ainda existir
    const carregando = document.querySelector("#table-body td[colspan]");
    if (carregando) carregando.remove();

    // Preenche linhas com valores
    dados.forEach(item => {
      const tr = document.createElement("tr");
      Object.values(item).forEach(valor => {
        const td = document.createElement("td");
        td.textContent = valor;
        tr.appendChild(td);
      });
      corpo.appendChild(tr);
    });

    // GRÁFICO
    const datas = dados.map(d => new Date(d.data_hora).toLocaleString("pt-BR"));
    const corrente = dados.map(d => d.corrente);
    const tensao = dados.map(d => d.tensao);
    const potencia = dados.map(d => d.potencia);
    const energia = dados.map(d => d.energia);

    const ctx = document.getElementById("graficoMedicoes").getContext("2d");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: datas,
        datasets: [
          {
            type: "bar",
            label: "Potência (W)",
            data: potencia,
            backgroundColor: "rgba(54, 162, 235, 0.6)",
            yAxisID: 'y'
          },
          {
            type: "bar",
            label: "Energia (Wh)",
            data: energia,
            backgroundColor: "rgba(255, 206, 86, 0.6)",
            yAxisID: 'y'
          },
          {
            type: "line",
            label: "Corrente (A)",
            data: corrente,
            borderColor: "rgba(255, 99, 132, 1)",
            fill: false,
            tension: 0.3,
            yAxisID: 'y1'
          },
          {
            type: "line",
            label: "Tensão (V)",
            data: tensao,
            borderColor: "rgba(75, 192, 192, 1)",
            fill: false,
            tension: 0.3,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            position: 'left',
            title: {
              display: true,
              text: 'Potência / Energia'
            }
          },
          y1: {
            beginAtZero: true,
            position: 'right',
            grid: {
              drawOnChartArea: false
            },
            title: {
              display: true,
              text: 'Tensão / Corrente'
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: "Medições Elétricas"
          },
          legend: {
            position: "top"
          }
        }
      }
    });

  } catch (erro) {
    console.error("Falha ao carregar dados:", erro);
  }
});
