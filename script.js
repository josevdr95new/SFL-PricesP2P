// Función para obtener y mostrar los datos de precios
async function fetchAndDisplayPrices() {
  try {
    const response = await fetch('https://sfl.world/api/v1/prices');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const priceData = data.data.p2p;
    const priceContainer = document.getElementById('priceData');
    const updatedAtElement = document.getElementById('updatedAt');
    const loadingContainer = document.getElementById('loading');

    // Limpiar el contenedor de precios antes de agregar la nueva tabla
    priceContainer.innerHTML = '';

    // Crear la tabla de precios
    const tableElement = createPriceTable(priceData);
    priceContainer.appendChild(tableElement);

    // Mostrar la fecha de actualización
    const updatedAt = new Date(data.updatedAt).toLocaleString();
    updatedAtElement.textContent = `Updated: ${updatedAt}`;

    // Ocultar el mensaje de carga
    loadingContainer.style.display = 'none';
  } catch (error) {
    console.error('Error getting prices:', error);
    const loadingContainer = document.getElementById('loading');
    loadingContainer.style.display = 'flex';
    loadingContainer.querySelector('p').textContent = 'Error loading prices. Try again later.';
  }
}

// Función para crear la tabla de precios
function createPriceTable(priceData) {
  const tableElement = document.createElement('table');
  const tableHeader = document.createElement('thead');
  const tableBody = document.createElement('tbody');

  // Crear encabezado de la tabla
  const headerRow = document.createElement('tr');
  ['Article (P2P)', 'Price (SFL)', 'Quantity', 'Total (SFL)'].forEach(headerText => {
    const th = document.createElement('th');
    th.textContent = headerText;
    headerRow.appendChild(th);
  });
  tableHeader.appendChild(headerRow);

  // Crear filas de la tabla
  Object.entries(priceData).forEach(([item, price]) => {
    const row = createPriceRow(item, price);
    tableBody.appendChild(row);
  });

  tableElement.appendChild(tableHeader);
  tableElement.appendChild(tableBody);
  return tableElement;
}

// Función para crear una fila de la tabla de precios
function createPriceRow(item, price) {
  const row = document.createElement('tr');
  const itemCell = document.createElement('td');
  itemCell.textContent = item;
  const priceCell = document.createElement('td');
  priceCell.textContent = price.toFixed(6);
  const quantityCell = document.createElement('td');
  const quantityInput = document.createElement('input');
  quantityInput.type = 'number';
  quantityInput.value = '1';
  quantityInput.min = '1';
  quantityInput.addEventListener('input', () => updateTotalCell(row, price, quantityInput.value));
  quantityCell.appendChild(quantityInput);
  const totalCell = document.createElement('td');
  totalCell.textContent = price.toFixed(6);
  row.append(itemCell, priceCell, quantityCell, totalCell);
  return row;
}

// Función para actualizar la celda de total
function updateTotalCell(row, price, quantity) {
  const totalCell = row.querySelector('td:last-child');
  totalCell.textContent = (price * quantity).toFixed(6);
}

// Función de búsqueda
function filterTable() {
  const searchInput = document.getElementById('searchInput');
  const searchTerm = searchInput.value.toLowerCase().trim();
  const tableRows = document.querySelectorAll('#priceData table tbody tr');

  tableRows.forEach(row => {
    const itemCell = row.querySelector('td:first-child');
    const priceCell = row.querySelector('td:nth-child(2)');
    const itemText = itemCell.textContent.toLowerCase();
    const priceText = priceCell.textContent.toLowerCase();

    row.style.display = itemText.includes(searchTerm) || priceText.includes(searchTerm) ? 'table-row' : 'none';
  });
}

// Función de conversión de moneda
async function calculateExchange() {
  const amount = parseFloat(document.getElementById('amount').value);
  const from = document.getElementById('from').value;
  const to = document.getElementById('to').value;

  if (isNaN(amount) || amount <= 0) {
    showResult('Please enter a valid amount.');
    return;
  }

  try {
    const response = await fetch('https://sfl.world/api/v1/exchange');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    let rate;
    if (from === 'sfl') {
      rate = data.sfl[to];
    } else if (from === 'matic') {
      rate = data.matic[to];
    } else {
      showResult('Conversion not supported.');
      return;
    }

    if (typeof rate !== 'number' || isNaN(rate)) {
      showResult('Error fetching exchange rates.');
      return;
    }

    const result = (amount * rate).toFixed(8);
    showResult(`${amount} ${from} = ${result} ${to}`);
  } catch (error) {
    console.error('Error:', error);
    showResult('Error fetching exchange rates.');
  }
}

// Función para mostrar el resultado de la conversión
function showResult(message) {
  const resultDiv = document.getElementById('result');
  resultDiv.textContent = message.replace(/matic/g, 'pol');
}

// Función para limpiar el resultado de la conversión
function clearResult() {
  const resultDiv = document.getElementById('result');
  resultDiv.textContent = '';
}

// Función para actualizar las opciones del campo "To"
function updateToOptions() {
  const fromSelect = document.getElementById('from');
  const toSelect = document.getElementById('to');
  const sflOption = toSelect.querySelector('option[value="sfl"]');
  const maticOption = toSelect.querySelector('option[value="matic"]');

  sflOption.style.display = fromSelect.value === 'sfl' ? 'none' : 'block';
  maticOption.style.display = fromSelect.value === 'matic' ? 'none' : 'block';

  // Limpiar el campo "To" y el resultado de la conversión
  clearToSelection();
  clearResult();
}

// Función para limpiar la selección del campo "To"
function clearToSelection() {
  document.getElementById('to').value = '';
}

// Función para inicializar y restablecer los campos del convertidor
function initializeConverterFields() {
  const fields = ['amount', 'from', 'to'];
  fields.forEach(id => document.getElementById(id).value = '');
}

// Función para mostrar/ocultar el convertidor de moneda
function toggleCalculator() {
  const calculatorElement = document.getElementById('calculator');
  const showCalculatorButton = document.getElementById('showCalculatorButton');

  calculatorElement.classList.toggle('show');
  showCalculatorButton.textContent = calculatorElement.classList.contains('show') ? 'Hide Currency Converter' : 'Currency Converter';
}

// Función para obtener y mostrar la versión de la aplicación
function displayAppVersion() {
  const manifest = chrome.runtime.getManifest();
  document.getElementById('version').textContent = manifest.version;
}

// Función para determinar la clase basada en la tarifa de gas
function getGasTariffClass(gasTariff) {
  if (gasTariff <= 30) {
    return 'gas-tariff-low';
  } else if (gasTariff <= 100) {
    return 'gas-tariff-medium';
  } else {
    return 'gas-tariff-high';
  }
}

// Obtener el contenedor del DOM
const gasTariffContainer = document.getElementById('gasTariffContainer');
const lastUpdateContainer = document.getElementById('lastUpdate');

// Función para cargar la tarifa de gas de la red de Polygon
async function loadGasTariff() {
  try {
    const response = await fetch('https://api.polygonscan.com/api?module=gastracker&action=gasoracle&apikey=YourApiKeyToken');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data.status === "1") {
      const gasTariff = parseFloat(data.result.SafeGasPrice);
      gasTariffContainer.textContent = `Polygon gas: ${gasTariff} Gwei`;
      gasTariffContainer.classList.remove('gas-tariff-low', 'gas-tariff-medium', 'gas-tariff-high');
      gasTariffContainer.classList.add(getGasTariffClass(gasTariff));
      lastUpdateContainer.textContent = `Last update: ${new Date().toLocaleTimeString()}`;
    } else {
      gasTariffContainer.textContent = 'Error loading gas tariff.';
    }
  } catch (error) {
    gasTariffContainer.textContent = 'Error loading gas tariff.';
    console.error('Error loading gas tariff:', error);
  }
}

const pricesDiv = document.getElementById('prices');

async function updatePrices() {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=sunflower-land,matic-network');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const sfl = data.find(coin => coin.id === 'sunflower-land');
    const matic = data.find(coin => coin.id === 'matic-network');

    pricesDiv.innerHTML = `
      <p>SFL: $${sfl.current_price}</p>
      <p>POL: $${matic.current_price}</p>
    `;
  } catch (error) {
    console.error('Error getting prices:', error);
    pricesDiv.textContent = 'Error loading prices.';
  }
}

// Función para mostrar una notificación personalizada
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.classList.add('notification', `notification-${type}`);
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add('hide');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Función para actualizar los precios y la tarifa de gas
async function updateData() {
  const refreshButton = document.getElementById('refreshButton');
  const icon = refreshButton.querySelector('i');

  // Añadir clase para iniciar la animación
  refreshButton.classList.add('loading');

  try {
    await Promise.all([updatePrices(), loadGasTariff(), fetchAndDisplayPrices()]);
    showNotification('Update data');
  } catch (error) {
    console.error('Error updating data:', error);
    showNotification('Error updating data.', 'error');
  } finally {
    // Remover clase para detener la animación
    refreshButton.classList.remove('loading');
  }
}

// Actualizar los datos cada 60 segundos
setInterval(updateData, 60000);

// Llamada inicial para cargar los datos al cargar la página
updateData();

const linkButton = document.getElementById("linkButton");
const myList = document.getElementById("myList");

linkButton.addEventListener("click", () => {
  myList.style.display = myList.style.display === "none" ? "block" : "none";
});

document.addEventListener('DOMContentLoaded', () => {
  fetchAndDisplayPrices();
  document.getElementById('searchInput').addEventListener('input', filterTable);
  document.getElementById('convertButton').addEventListener('click', calculateExchange);
  document.getElementById('from').addEventListener('change', updateToOptions);
  document.getElementById('to').addEventListener('change', clearResult);

  const donationButton = document.getElementById('donationButton');
  const donationModal = document.getElementById('donationModal');
  const closeButton = document.getElementsByClassName('close-button')[0];

  donationButton.addEventListener('click', () => donationModal.style.display = 'block');
  closeButton.addEventListener('click', () => donationModal.style.display = 'none');
  window.addEventListener('click', event => event.target === donationModal && (donationModal.style.display = 'none'));

  initializeConverterFields();
  document.getElementById('showCalculatorButton').addEventListener('click', toggleCalculator);
  displayAppVersion();
  document.getElementById('from').addEventListener('change', updateToOptions);

  // Agregar evento de clic al botón de actualización
  document.getElementById('refreshButton').addEventListener('click', updateData);
});