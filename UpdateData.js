function getTimeDifference(publishDate, modifiedDate) {
    return new Promise((resolve, reject) => {
        try {
            const publish = new Date(publishDate);
            const modified = new Date(modifiedDate);
            
            if (isNaN(publish.getTime()) || isNaN(modified.getTime())) {
                reject(new Error('Fechas inválidas'));
            }
            
            const diffMinutes = Math.floor((modified - publish) / (1000 * 60));
            
            // Calcular días, horas y minutos entre publicación y modificación
            const days = Math.floor(diffMinutes / (24 * 60));
            const hours = Math.floor((diffMinutes % (24 * 60)) / 60);
            const minutes = diffMinutes % 60;
            
            // Calcular tiempo desde la modificación hasta hoy
            const now = new Date();
            const diffToNowMinutes = Math.floor((now - modified) / (1000 * 60));
            const daysToNow = Math.floor(diffToNowMinutes / (24 * 60));
            const hoursToNow = Math.floor((diffToNowMinutes % (24 * 60)) / 60);
            const minutesToNow = diffToNowMinutes % 60;
            
            resolve([
                `${days}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
                `${daysToNow}:${hoursToNow.toString().padStart(2, '0')}:${minutesToNow.toString().padStart(2, '0')}`
            ]);
        } catch (error) {
            reject(error);
        }
    });
}

function calculateTimeDifference() {
    return new Promise((resolve, reject) => {
        try {
            // Buscar meta tags publishedMeta y modifiedMeta
            const publishedMeta = document.querySelector('meta[property="article:published_time"]');
            const modifiedMeta = document.querySelector('meta[property="article:modified_time"]');

            // Si encontramos los meta tags, calculamos la diferencia
            if (publishedMeta && modifiedMeta) {
                const publishedTime = publishedMeta.getAttribute('content');
                const modifiedTime = modifiedMeta.getAttribute('content');
                return resolve(getTimeDifference(publishedTime, modifiedTime));
            }

            // Si no hay meta tags, buscamos en el script de Schema.org
            const schemas = document.querySelectorAll('script[type="application/ld+json"]');
            for (const schema of schemas) {
                try {
                    const schemaData = JSON.parse(schema.textContent);
                    const publishedDate = schemaData.datePublished;
                    const modifiedDate = schemaData.dateModified;

                    if (publishedDate && modifiedDate) {
                        return resolve(getTimeDifference(publishedDate, modifiedDate));
                    }
                } catch (e) {
                    continue;
                }
            }

            // Si no encontramos ninguna fecha
            resolve(['No se encontraron fechas', 'No se encontraron fechas']);

        } catch (error) {
            reject(error);
        }
    });
}

return calculateTimeDifference()
    .then(differences => seoSpider.data(differences))
    .catch(error => seoSpider.error(error));
