import { db, collection, getDocs, orderBy, query } from './config.js';

document.addEventListener('DOMContentLoaded', async function () {
    try {
        const bookContainer = document.getElementById('book');
        const categoryFilter = document.getElementById('categoryFilter');

        if (!window.St || !window.St.PageFlip) {
            console.error("PageFlip library not loaded.");
            return;
        }

        const PageFlip = window.St.PageFlip;
        let pageFlip;

        const pageFlipSettings = {
            width: 400,
            height: 600,
            size: 'fixed',
            minWidth: 300,
            maxWidth: 500,
            minHeight: 500,
            maxHeight: 850,
            maxShadowOpacity: 0.4,
            showCover: false,
            mobileScrollSupport: true,
            useMouseEvents: true
        };

        let allPhotos = [];

        const endPageHTML = `
            <div class="my-page">
                <div class="end-page">The end</div>
            </div>
        `;

        try {
            const q = query(collection(db, "photos"));
            const querySnapshot = await getDocs(q);

            const docs = [];
            querySnapshot.forEach((doc) => {
                docs.push(doc.data());
            });

            docs.sort((a, b) => {
                const orderA = (a.order !== undefined) ? a.order : 999;
                const orderB = (b.order !== undefined) ? b.order : 999;
                return orderA - orderB;
            });

            allPhotos = docs;

            if (categoryFilter && categoryFilter.value !== "All") {
                const filtered = allPhotos.filter(photo => photo.category === categoryFilter.value);
                const selectedOption = categoryFilter.options[categoryFilter.selectedIndex];
                const title = selectedOption ? selectedOption.text : "Volume 1";
                renderBook(filtered, title);
            } else {
                renderBook(allPhotos, "All Moments");
            }

        } catch (e) {
            console.error("Error loading photos:", e);
        }

        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                try {
                    const selectedCategory = e.target.value;
                    const selectedOption = e.target.options[e.target.selectedIndex];
                    const title = selectedOption ? selectedOption.text : "Volume 1";

                    if (selectedCategory === "All") {
                        renderBook(allPhotos, "All Moments");
                    } else {
                        const filtered = allPhotos.filter(photo => photo.category === selectedCategory);
                        renderBook(filtered, title);
                    }
                } catch (err) {
                    console.error("Error filtering:", err);
                }
            });
        }

        function renderBook(photosToRender, albumTitle = "Volume 1") {
            if (pageFlip) {
                try {
                    pageFlip.destroy();
                } catch (err) { }
                pageFlip = null;
            }

            const deskBackground = document.querySelector('.desk-background');
            let oldBookElement = document.getElementById('book');

            if (oldBookElement) {
                oldBookElement.remove();
            }

            const newBookElement = document.createElement('div');
            newBookElement.id = 'book';

            const controls = document.querySelector('.controls-container');
            if (controls) {
                deskBackground.insertBefore(newBookElement, controls);
            } else {
                deskBackground.appendChild(newBookElement);
            }

            const coverPageHTML = `
                <div class="my-page cover">
                    <div class="cover-page-content">
                        <h1 class="cover-title">Our Story</h1>
                        <div class="cover-subtitle">Written in Destiny</div>
                        <div class="cover-names">Vrajesh & Foram</div>
                        <div class="cover-subtitle" style="margin-top: auto; border: none;">${albumTitle}</div>
                    </div>
                </div>
            `;

            newBookElement.insertAdjacentHTML('beforeend', coverPageHTML);

            if (photosToRender.length > 0) {
                const chunkedDocs = [];
                for (let i = 0; i < photosToRender.length; i += 2) {
                    chunkedDocs.push(photosToRender.slice(i, i + 2));
                }

                const newPages = chunkedDocs.map((chunk, index) => createPhotoPage(chunk, index));
                newPages.forEach(node => newBookElement.appendChild(node));

                newBookElement.insertAdjacentHTML('beforeend', endPageHTML);

                const pages = newBookElement.querySelectorAll('.my-page');
                pages.forEach((p, i) => {
                    if (i > 0) {
                        if (i % 2 !== 0) p.classList.add('--left');
                        else p.classList.add('--right');
                    }
                });

            } else {
                const noMetricPage = document.createElement('div');
                noMetricPage.className = "my-page";
                noMetricPage.innerHTML = `<div class="page-content" style="text-align:center; color:#888;"><i>No moments in this category yet...</i></div>`;
                newBookElement.appendChild(noMetricPage);
                newBookElement.insertAdjacentHTML('beforeend', endPageHTML);
            }

            setTimeout(() => {
                try {
                    const targetElement = document.getElementById('book');
                    if (targetElement) {
                        pageFlip = new PageFlip(targetElement, pageFlipSettings);
                        pageFlip.loadFromHTML(targetElement.querySelectorAll('.my-page'));
                    }
                } catch (err) {
                    console.error("Error initializing PageFlip:", err);
                }
            }, 50);
        }

        function createPhotoPage(photos, pageIndex) {
            const page = document.createElement('div');
            page.className = "my-page";

            const photosHtml = photos.map((data, i) => {
                const cleanUrl = transformDriveUrl(data.url);

                return `
                    <div class="photo-item">
                        <div class="image-wrapper" onclick="window.openLightbox('${cleanUrl}', event)" onmousedown="event.stopPropagation()" ontouchstart="event.stopPropagation()">
                             <img src="${cleanUrl}" alt="Memory" loading="lazy" referrerpolicy="no-referrer">
                        </div>
                    </div>
                `;
            }).join('');

            page.innerHTML = `
                <div class="page-content">
                    <div class="photo-grid">
                        ${photosHtml}
                    </div>
                </div>
                <div class="page-number">${pageIndex + 1}</div> 
            `;
            return page;
        }

        function transformDriveUrl(url) {
            if (!url) return "";
            if (url.includes("drive.google.com") && url.includes("id=")) {
                const idMatch = url.match(/id=([^&]+)/);
                if (idMatch && idMatch[1]) {
                    return "https://lh3.googleusercontent.com/d/" + idMatch[1];
                }
            }
            return url;
        }

        const prevBtn = document.getElementById('prevBtn');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                try {
                    if (pageFlip) pageFlip.flipPrev();
                } catch (e) { }
            });
        }

        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                try {
                    if (pageFlip) pageFlip.flipNext();
                } catch (e) { }
            });
        }

        window.openLightbox = (src, event) => {
            try {
                if (event) {
                    event.stopPropagation();
                }
                const lightbox = document.getElementById('lightbox');
                const img = document.getElementById('lightbox-img');
                const dlBtn = document.getElementById('lightbox-download');

                if (img) img.src = src;

                if (dlBtn) {
                    const newDlBtn = dlBtn.cloneNode(true);
                    dlBtn.parentNode.replaceChild(newDlBtn, dlBtn);

                    newDlBtn.addEventListener('click', async (e) => {
                        e.preventDefault();
                        try {
                            const response = await fetch(src);
                            const blob = await response.blob();
                            const blobUrl = window.URL.createObjectURL(blob);

                            const a = document.createElement('a');
                            a.href = blobUrl;
                            const filename = src.split('/').pop().split('?')[0] || 'memory.jpg';
                            a.download = filename;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            window.URL.revokeObjectURL(blobUrl);
                        } catch (err) {
                            window.open(src, '_blank');
                        }
                    });
                }

                if (lightbox) lightbox.classList.remove('hidden');
            } catch (err) {
                console.error("Lightbox error", err);
            }
        };

        const closeLightbox = () => {
            try {
                const lb = document.getElementById('lightbox');
                if (lb) lb.classList.add('hidden');
            } catch (e) { }
        };

        const closeBtn = document.querySelector('.lightbox-close');
        if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

        const lbContainer = document.getElementById('lightbox');
        if (lbContainer) {
            lbContainer.addEventListener('click', (e) => {
                if (e.target.id === 'lightbox') closeLightbox();
            });
        }
    } catch (globalErr) {
        console.error("Global script error:", globalErr);
    }
});

