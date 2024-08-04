fetch('https://sfl.world/api/v1/prices')
  .then(response => response.json())
  .then(data => {
    const priceData = data.data.p2p;
    const priceContainer = document.getElementById('priceData');
    const updatedAtElement = document.getElementById('updatedAt');
    const loadingContainer = document.getElementById('loading');

    const tableElement = document.createElement('table');
    const tableHeader = document.createElement('thead');
    const tableBody = document.createElement('tbody');

    // Crear encabezado de la tabla
    const headerRow = document.createElement('tr');
    const itemHeader = document.createElement('th');
    itemHeader.textContent = 'Article (P2P)';
    const priceHeader = document.createElement('th');
    priceHeader.textContent = 'Price (SFL)';
    headerRow.appendChild(itemHeader);
    headerRow.appendChild(priceHeader);
    tableHeader.appendChild(headerRow);

    // Crear filas de la tabla
    Object.entries(priceData).forEach(([item, price]) => {
      const row = document.createElement('tr');
      const itemCell = document.createElement('td');
      itemCell.textContent = item;
      const priceCell = document.createElement('td');
      priceCell.textContent = price.toFixed(6);
      row.appendChild(itemCell);
      row.appendChild(priceCell);
      tableBody.appendChild(row);
    });

    tableElement.appendChild(tableHeader);
    tableElement.appendChild(tableBody);
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

//Search
function filterTable() {
  const searchInput = document.getElementById('searchInput');
  const searchTerm = searchInput.value.toLowerCase().trim();
  const tableRows = document.querySelectorAll('#priceData table tbody tr');

  tableRows.forEach(row => {
    const itemCell = row.querySelector('td:first-child');
    const priceCell = row.querySelector('td:last-child');
    const itemText = itemCell.textContent.toLowerCase();
    const priceText = priceCell.textContent.toLowerCase();

    if (itemText.includes(searchTerm) || priceText.includes(searchTerm)) {
      row.style.display = 'table-row';
    } else {
      row.style.display = 'none';
    }
  });
}

document.getElementById('searchInput').addEventListener('input', filterTable);

// Version
// Obtener la versión del manifiesto
const manifest = chrome.runtime.getManifest();
const version = manifest.version;

// Mostrar la versión en el elemento HTML
document.getElementById('version').textContent = version;