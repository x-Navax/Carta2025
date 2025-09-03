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

            // Evento global para imágenes
            document.body.addEventListener('click', e => {
                if (e.target.classList.contains('menu-image')) {
                    openImageModal(e.target.src, e.target.alt);
                }
            });
        })
        .catch(error => console.error('Error al cargar los datos:', error));

    function createMenuItem(item) {
        const baseName = item.nombre.toLowerCase().replace(/ /g, '_');
        const extensions = ['jpg', 'jpeg', 'png', 'webp']; // extensiones posibles

        const imageTags = extensions.map(ext => 
            `<img class="menu-image" src="${imageBasePath}${baseName}.${ext}" alt="${item.nombre}" 
            onerror="this.style.display='none'">`
        ).join('');

        return `
            <div class="menu-item">
                ${imageTags}
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

    // ==== MODAL PARA EXPANDIR IMAGEN ====
    function openImageModal(src, alt) {
        let modal = document.getElementById('image-modal');

        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'image-modal';
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
            modal.style.display = 'flex';
            modal.style.alignItems = 'center';
            modal.style.justifyContent = 'center';
            modal.style.zIndex = '1000';

            modal.innerHTML = `
                <span id="modal-close" style="
                    position: absolute;
                    top: 20px;
                    right: 30px;
                    font-size: 40px;
                    font-weight: bold;
                    color: white;
                    cursor: pointer;
                    user-select: none;
                ">&times;</span>
                <img id="modal-img" style="max-width:90%; max-height:90%; border-radius:10px;">
            `;

            // cerrar al hacer click en la X
            modal.querySelector('#modal-close').addEventListener('click', () => {
                modal.style.display = 'none';
            });

            // cerrar si se hace click en el fondo oscuro
            modal.addEventListener('click', e => {
                if (e.target === modal) modal.style.display = 'none';
            });

            document.body.appendChild(modal);
        }

        const modalImg = document.getElementById('modal-img');
        modalImg.src = src;
        modalImg.alt = alt;

        modal.style.display = 'flex';
    }
});
