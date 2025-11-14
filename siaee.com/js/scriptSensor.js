document.addEventListener("DOMContentLoaded", async () => {
  const url = "https://grupo-7-energias-back-end.3du0va.easypanel.host/api/alertas";

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

    // Preenche linhas com valores
    dados.forEach(item => {
      const tr = document.createElement("tr");
      const campos = [
        item.id,
        item.device_id,
        item.mensagem_ia,
        new Date(item.data_hora).toLocaleString("pt-BR")
      ];

      campos.forEach(valor => {
        const td = document.createElement("td");
        td.textContent = valor;
        tr.appendChild(td);
      });

      corpo.appendChild(tr);
    });

  } catch (erro) {
    console.error("Falha ao carregar dados:", erro);
    document.getElementById("table-body").innerHTML =
      "<tr><td colspan='6'>Erro ao carregar dados</td></tr>";
  }
});