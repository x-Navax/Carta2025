document.addEventListener('DOMContentLoaded', () => {
    const googleSheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRD_AZIh7XHUWvgQSFMr1JKAEid4MvJf87iTLxRz2LitzPz194cSDu8WyGy9eErskk-LnzdGFqMgVa_/pub?gid=0&single=true&output=csv';
    const imageBasePath = 'imagenes/'; // Carpeta donde están las imágenes

    fetch(googleSheetURL)
        .then(response => response.text())
        .then(csvData => {
            const data = parseCSV(csvData);
            console.log('Datos cargados:', data);

            const categorias = data.reduce((acc, item) => {
                acc[item.categoria] = acc[item.categoria] || [];
                acc[item.categoria].push(item);
                return acc;
            }, {});

            Object.keys(categorias).forEach(categoria => {
                const itemsHTML = categorias[categoria].map(item => createMenuItem(item)).join('');
                const section = document.querySelector(`.menu-section[data-category="${categoria}"] .section-content`);
                if (section) {
                    section.innerHTML = itemsHTML;
                    section.previousElementSibling.addEventListener('click', () => {
                        section.style.display = section.style.display === 'block' ? 'none' : 'block';
                    });
                }
            });
        })
        .catch(error => console.error('Error al cargar los datos:', error));

    function createMenuItem(item) {
        const sanitizedImageName = item.nombre.toLowerCase().replace(/ /g, '_') + '.jpg';
        const imagePath = `${imageBasePath}${sanitizedImageName}`;

        // Solo muestro la etiqueta <img> si carga bien, sino se oculta con onerror
        const imageTag = `<img class="menu-image" src="${imagePath}" alt="${item.nombre}" onerror="this.style.display='none'">`;

        return `
            <div class="menu-item">
                ${imageTag}
                <div class="menu-info">
                    <h3>${item.nombre}</h3>
                    <p>${item.descripcion}</p>
                    <span class="price">$${item.precio}</span>
                </div>
            </div>
        `;
    }

    function parseCSV(csv) {
        const lines = csv.split('\n');
        const headers = lines[0].split(',');

        return lines.slice(1).map(line => {
            const values = line.split(',');
            return headers.reduce((obj, header, index) => {
                obj[header.trim()] = values[index] ? values[index].trim() : '';
                return obj;
            }, {});
        });
    }
});
