// Función para obtener y mostrar los datos de precios
function fetchAndDisplayPrices() {
  fetch('https://sfl.world/api/v1/prices')
    .then(response => response.json())
    .then(data => {
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
    })
    .catch(error => {
      console.error('Error getting prices:', error);
      const loadingContainer = document.getElementById('loading');
      loadingContainer.style.display = 'flex';
      loadingContainer.querySelector('p').textContent = 'Error loading prices. Try again later.';
    });
}

// Función para crear la tabla de precios
function createPriceTable(priceData) {
  const tableElement = document.createElement('table');
  const tableHeader = document.createElement('thead');
  const tableBody = document.createElement('tbody');

  // Crear encabezado de la tabla
  const headerRow = document.createElement('tr');
  const itemHeader = document.createElement('th');
  itemHeader.textContent = 'Article (P2P)';
  const priceHeader = document.createElement('th');
  priceHeader.textContent = 'Price (SFL)';
  const quantityHeader = document.createElement('th');
  quantityHeader.textContent = 'Quantity';
  const totalHeader = document.createElement('th');
  totalHeader.textContent = 'Total (SFL)';
  headerRow.appendChild(itemHeader);
  headerRow.appendChild(priceHeader);
  headerRow.appendChild(quantityHeader);
  headerRow.appendChild(totalHeader);
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
  row.appendChild(itemCell);
  row.appendChild(priceCell);
  row.appendChild(quantityCell);
  row.appendChild(totalCell);
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

    if (itemText.includes(searchTerm) || priceText.includes(searchTerm)) {
      row.style.display = 'table-row';
    } else {
      row.style.display = 'none';
    }
  });
}

// Función de conversión de moneda
function calculateExchange() {
  const amount = parseFloat(document.getElementById('amount').value);
  const from = document.getElementById('from').value;
  const to = document.getElementById('to').value;

  if (isNaN(amount) || amount <= 0) {
    showResult('Please enter a valid amount.');
    return;
  }

  fetch('https://sfl.world/api/v1/exchange')
    .then(response => {
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(`Error fetching exchange rates: ${response.status} - ${response.statusText}\n${JSON.stringify(data, null, 2)}`);
        });
      }
      return response.json();
    })
    .then(data => {
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
    })
    .catch(error => {
      console.error('Error:', error);
      showResult('Error fetching exchange rates.');
    });
}

// Función para mostrar el resultado de la conversión
function showResult(message) {
  const resultDiv = document.getElementById('result');
  resultDiv.textContent = message;
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

  if (fromSelect.value === 'sfl') {
    sflOption.style.display = 'none';
    maticOption.style.display = 'block';
  } else if (fromSelect.value === 'matic') {
    sflOption.style.display = 'block';
    maticOption.style.display = 'none';
  } else {
    sflOption.style.display = 'block';
    maticOption.style.display = 'block';
  }

  // Limpiar el campo "To" y el resultado de la conversión
  clearToSelection();
  clearResult();
}

// Función para limpiar la selección del campo "To"
function clearToSelection() {
  const toSelect = document.getElementById('to');
  toSelect.value = '';
}

// Función para inicializar y restablecer los campos del convertidor
function initializeConverterFields() {
  const amountInput = document.getElementById('amount');
  const fromSelect = document.getElementById('from');
  const toSelect = document.getElementById('to');

  amountInput.value = '';
  fromSelect.value = '';
  toSelect.value = '';
}

// Función para mostrar/ocultar el convertidor de moneda
function toggleCalculator() {
  const calculatorElement = document.getElementById('calculator');
  const showCalculatorButton = document.getElementById('showCalculatorButton');

  calculatorElement.classList.toggle('show');

  if (calculatorElement.classList.contains('show')) {
    showCalculatorButton.textContent = 'Hide Currency Converter';
  } else {
    showCalculatorButton.textContent = 'Currency Converter';
  }
}

// Función para obtener y mostrar la versión de la aplicación
function displayAppVersion() {
  // Obtener la versión del manifiesto
  const manifest = chrome.runtime.getManifest();
  const version = manifest.version;

  // Mostrar la versión en el elemento HTML
  document.getElementById('version').textContent = version;
}

// Eventos y ejecución de funciones
document.addEventListener('DOMContentLoaded', () => {
  // Obtener y mostrar los datos de precios
  fetchAndDisplayPrices();

  // Agregar evento de búsqueda
  document.getElementById('searchInput').addEventListener('input', filterTable);

  // Agregar evento de conversión de moneda
  document.getElementById('convertButton').addEventListener('click', calculateExchange);
  document.getElementById('from').addEventListener('change', updateToOptions);
  document.getElementById('to').addEventListener('change', clearResult);

  // Agregar evento de donación
  const donationButton = document.getElementById('donationButton');
  const donationModal = document.getElementById('donationModal');
  const closeButton = document.getElementsByClassName('close-button')[0];

  donationButton.addEventListener('click', () => {
    donationModal.style.display = 'block';
  });

  closeButton.addEventListener('click', () => {
    donationModal.style.display = 'none';
  });

  window.addEventListener('click', (event) => {
    if (event.target == donationModal) {
      donationModal.style.display = 'none';
    }
  });

  // Inicializar y restablecer los campos del convertidor
  initializeConverterFields();

  // Mostrar/ocultar el convertidor de moneda
  showCalculatorButton.addEventListener('click', toggleCalculator);

  // Mostrar la versión de la aplicación
  displayAppVersion();

  // Agregar evento de cambio al campo "From"
  document.getElementById('from').addEventListener('change', updateToOptions);
});


// Función para determinar la clase basada en la tarifa de gas
function getGasTariffClass(gasTariff) {
    if (gasTariff <= 30) {
        return 'gas-tariff-low'; // Clase para tarifas bajas
    } else if (gasTariff <= 100) {
        return 'gas-tariff-medium'; // Clase para tarifas medianas
    } else {
        return 'gas-tariff-high'; // Clase para tarifas altas
    }
}

// Obtener el contenedor del DOM
const gasTariffContainer = document.getElementById('gasTariffContainer');
const lastUpdateContainer = document.getElementById('lastUpdate');

// Función para cargar la tarifa de gas de la red de Polygon
async function loadGasTariff() {
    try {
        const response = await fetch('https://api.polygonscan.com/api?module=gastracker&action=gasoracle&apikey=YourApiKeyToken'); // Reemplaza con la URL de la API real y tu clave de API
        const data = await response.json();
        if (data.status === "1") {
            const gasTariff = parseFloat(data.result.SafeGasPrice); // Ajusta esto según la estructura de la respuesta de la API
            gasTariffContainer.textContent = `Polygon gas: ${gasTariff} Gwei`;
            
            // Elimina todas las clases de fondo dinámico
            gasTariffContainer.classList.remove('gas-tariff-low', 'gas-tariff-medium', 'gas-tariff-high');
            // Añade la clase basada en el valor de la tarifa de gas
            gasTariffContainer.classList.add(getGasTariffClass(gasTariff));

            const now = new Date();
            lastUpdateContainer.textContent = `Last update: ${now.toLocaleTimeString()}`;
        } else {
            gasTariffContainer.textContent = 'Error loading gas tariff.';
        }
    } catch (error) {
        gasTariffContainer.textContent = 'Error loading gas tariff.';
        console.error('Error loading gas tariff:', error);
    }
}

// Cargar la tarifa de gas al cargar la página
//window.addEventListener('load', loadGasTariff);

// Actualizar la tarifa de gas cada 15 segundos (15000 ms)
//setInterval(loadGasTariff, 15000);


const pricesDiv = document.getElementById('prices');

        function updatePrices() {
            fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=sunflower-land,matic-network')
                .then(response => response.json())
                .then(data => {
                    const sfl = data.find(coin => coin.id === 'sunflower-land');
                    const matic = data.find(coin => coin.id === 'matic-network');

                    pricesDiv.innerHTML = `
                        <p>SFL: $${sfl.current_price}</p>
                        <p>MATIC: $${matic.current_price}</p>
                    `;
                })
                .catch(error => {
                    console.error('Error getting prices:', error);
                    pricesDiv.textContent = 'Error loading prices.';
                });
        }


// Función para mostrar una notificación personalizada
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.classList.add('notification', `notification-${type}`);
  notification.textContent = message;
  document.body.appendChild(notification);

  // Agregar la animación de ocultación
  setTimeout(() => {
    notification.classList.add('hide');
    setTimeout(() => {
      notification.remove();
    }, 300); // Esperar un poco más para que termine la animación
  }, 3000); // Ocultar la notificación después de 3 segundos
}

// Función para actualizar los precios y la tarifa de gas
function updateData() {
  updatePrices();
  loadGasTariff();
  fetchAndDisplayPrices();

  // Mostrar una notificación personalizada
  showNotification('Update data');
}

// Actualizar los datos cada 60 segundos
setInterval(updateData, 60000);

// Llamada inicial para cargar los datos al cargar la página
updateData();


const linkButton = document.getElementById("linkButton");
    const myList = document.getElementById("myList");

    linkButton.addEventListener("click", function() {
        if (myList.style.display === "none") {
            myList.style.display = "block"; // Mostrar la lista
        } else {
            myList.style.display = "none"; // Ocultar la lista
        }
    });
	
	