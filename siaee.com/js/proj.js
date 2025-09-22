// ======== MENU LATERAL ===========
const menuItems = document.querySelectorAll('.item-menu');

function selectLink() {
  menuItems.forEach(item => item.classList.remove('ativo'));
  this.classList.add('ativo');
}

menuItems.forEach(item =>
  item.addEventListener('click', selectLink)
);

const btnExp = document.querySelector('#btn-exp');
const menuSite = document.querySelector('.menu-lateral');

btnExp.addEventListener('click', () => {
  menuSite.classList.toggle('expandir');
});

// ======== GRÁFICOS ==========

// Consumo por setor
new Chart(document.getElementById('graficoSetor'), {
  type: 'bar',
  data: {
    labels: ['Corredor', 'Banheiro', 'Cozinha'],
    datasets: [{
      label: 'kWh',
      data: [3, 1, 3],
      backgroundColor: ['#b3872c', 'red', 'purple']
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: { beginAtZero: true }
    }
  }
});

// Fator potência x tempo
new Chart(document.getElementById('graficoFator'), {
  type: 'line',
  data: {
    labels: ['00h', '06h', '12h', '18h', '24h'],
    datasets: [{
      label: 'Fator de Potência',
      data: [0.8, 0.9, 1, 0.95, 0.85],
      fill: false,
      borderColor: '#45a049',
      tension: 0.4
    }]
  },
  options: { responsive: true }
});

// Ranking de sensores por consumo
new Chart(document.getElementById('graficoRanking'), {
  type: 'bar',
  data: {
    labels: ['Sensor 1', 'Sensor 2', 'Sensor 3'],
    datasets: [{
      label: 'Consumo',
      data: [40, 20, 40],
      backgroundColor: ['#b3872c', 'red', 'purple']
    }]
  },
  options: {
    indexAxis: 'y',
    responsive: true
  }
});

// Participação
new Chart(document.getElementById('graficoPizza'), {
  type: 'pie',
  data: {
    labels: ['Sensor 1', 'Sensor 2', 'Sensor 3'],
    datasets: [{
      data: [40, 20, 40],
      backgroundColor: ['#b3872c', 'red', 'purple']
    }]
  },
  options: { responsive: true }
});
