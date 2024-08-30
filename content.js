(async () => {
  const { toolbarActive } = await chrome.storage.local.get('toolbarActive');

  if (toolbarActive) {
    let toolbar = document.querySelector('.seo-toolbar');

    if (!toolbar) {
      toolbar = document.createElement('div');
      toolbar.className = 'seo-toolbar';

      // Zjištění názvu šablony WordPress
      const themeRegex = /\/wp-content\/themes\/([^\/]+)\//;
      const matches = document.documentElement.innerHTML.match(themeRegex);
      let themeName = matches ? matches[1] : 'N/A';

      // Vytvoření textu pro Theme, různé styly pro klikatelné a neklikatelné odkazy
      let themeLink = themeName !== 'N/A' 
        ? `<a href="https://themeforest.net/search/${themeName}" target="_blank" style="font-weight: bold; text-decoration: none;" onmouseover="this.style.textDecoration='underline';" onmouseout="this.style.textDecoration='none';">Theme: ${themeName}</a>` 
        : `Theme: ${themeName}`;

      // Počítání jednotlivých typů obrázků na stránce
      const pngCount = document.querySelectorAll('img[src$=".png"]').length;
      const gifCount = document.querySelectorAll('img[src$=".gif"]').length;
      const jpgCount = document.querySelectorAll('img[src$=".jpg"], img[src$=".jpeg"]').length;
      const svgCount = document.querySelectorAll('img[src$=".svg"]').length;
      const bmpCount = document.querySelectorAll('img[src$=".bmp"]').length;
      const tiffCount = document.querySelectorAll('img[src$=".tiff"], img[src$=".tif"]').length;
      const webpCount = document.querySelectorAll('img[src$=".webp"]').length;

      // Počítání chybějících alt tagů
      let missingAltCount = 0;
      let missingAlts = '';
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        const alt = img.getAttribute('alt');
        if (alt === null || alt.trim() === '') {
          missingAltCount++;
          missingAlts += `<div>${img.src}</div>`;
        }
      });

      // Zneaktivnění linku pro Missing Alts, pokud je hodnota nula
      let missingAltsLink = missingAltCount > 0 
        ? `<span id="missingAltsCount" class="clickable" style="font-weight: bold; text-decoration: none;" onmouseover="this.style.textDecoration='underline';" onmouseout="this.style.textDecoration='none';">Missing Alts: ${missingAltCount}</span>` 
        : `Missing Alts: ${missingAltCount}`;

      // Zjištění velikosti všech načtených zdrojů na stránce
      let totalSize = 0;
      performance.getEntriesByType("resource").forEach((resource) => {
        totalSize += resource.transferSize;
      });

      const totalSizeKB = (totalSize / 1024).toFixed(2);

      // Počítání interních a externích odkazů
      const links = document.querySelectorAll('a[href]');
      const currentDomain = window.location.hostname;
      let internalLinkCount = 0;
      let externalLinkCount = 0;

      let internalLinks = '';
      let externalLinks = '';

      links.forEach(link => {
        const linkDomain = (new URL(link.href)).hostname;
        if (linkDomain === currentDomain) {
          internalLinkCount++;
          internalLinks += `<div>${link.href}</div>`;
        } else {
          externalLinkCount++;
          externalLinks += `<div>${link.href}</div>`;
        }
      });

      // Zneaktivnění linku pro Internal Links, pokud je hodnota nula
      let internalLinksLink = internalLinkCount > 0 
        ? `<span id="internalLinkCount" class="clickable" style="font-weight: bold; text-decoration: none;" onmouseover="this.style.textDecoration='underline';" onmouseout="this.style.textDecoration='none';">Internal Links: ${internalLinkCount}</span>` 
        : `Internal Links: ${internalLinkCount}`;

      // Zneaktivnění linku pro External Links, pokud je hodnota nula
      let externalLinksLink = externalLinkCount > 0 
        ? `<span id="externalLinkCount" class="clickable" style="font-weight: bold; text-decoration: none;" onmouseover="this.style.textDecoration='underline';" onmouseout="this.style.textDecoration='none';">External Links: ${externalLinkCount}</span>` 
        : `External Links: ${externalLinkCount}`;

      // Sestavení textu do lišty
      let imageText = 'Images:';
      if (jpgCount > 0) imageText += ` JPG: ${jpgCount}`;
      if (pngCount > 0) imageText += `, PNG: ${pngCount}`;
      if (gifCount > 0) imageText += `, GIF: ${gifCount}`;
      if (svgCount > 0) imageText += `, SVG: ${svgCount}`;
      if (bmpCount > 0) imageText += `, BMP: ${bmpCount}`;
      if (tiffCount > 0) imageText += `, TIFF: ${tiffCount}`;
      if (webpCount > 0) imageText += `, WEBP: ${webpCount}`;

      imageText += ` | ${missingAltsLink} | Page Size: ${totalSizeKB} KB | ${internalLinksLink} | ${externalLinksLink} | ${themeLink}`;

      toolbar.innerHTML = `SEO BAR - ${imageText}`;
      document.body.style.marginTop = '20px'; // Adjust the page layout
      document.body.prepend(toolbar);

      // Vytvoření modálního okna pro zobrazení chybějících alt tagů
      if (missingAltCount > 0) {
        let missingAltsModal = document.createElement('div');
        missingAltsModal.id = 'missingAltsModal';
        missingAltsModal.style.display = 'none';
        missingAltsModal.style.position = 'fixed';
        missingAltsModal.style.zIndex = '1000001';
        missingAltsModal.style.left = '50%';
        missingAltsModal.style.top = '50%';
        missingAltsModal.style.transform = 'translate(-50%, -50%)';
        missingAltsModal.style.width = '50%';
        missingAltsModal.style.height = '50%';
        missingAltsModal.style.overflowY = 'scroll';
        missingAltsModal.style.backgroundColor = '#fff';
        missingAltsModal.style.border = '1px solid #ccc';
        missingAltsModal.style.padding = '10px';
        missingAltsModal.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
        missingAltsModal.innerHTML = `<div style="text-align: right;"><button id="closeMissingAltsModal">Close</button></div>${missingAlts}`;

        document.body.appendChild(missingAltsModal);

        // Přidání funkce pro zobrazení modálního okna při kliknutí na "Missing Alts: XX"
        document.getElementById('missingAltsCount').addEventListener('click', () => {
          missingAltsModal.style.display = 'block';
        });

        // Přidání funkce pro zavření modálního okna
        document.getElementById('closeMissingAltsModal').addEventListener('click', () => {
          missingAltsModal.style.display = 'none';
        });
      }

      // Vytvoření modálního okna pro zobrazení interních odkazů
      if (internalLinkCount > 0) {
        let internalModal = document.createElement('div');
        internalModal.id = 'internalLinkModal';
        internalModal.style.display = 'none';
        internalModal.style.position = 'fixed';
        internalModal.style.zIndex = '1000001';
        internalModal.style.left = '50%';
        internalModal.style.top = '50%';
        internalModal.style.transform = 'translate(-50%, -50%)';
        internalModal.style.width = '50%';
        internalModal.style.height = '50%';
        internalModal.style.overflowY = 'scroll';
        internalModal.style.backgroundColor = '#fff';
        internalModal.style.border = '1px solid #ccc';
        internalModal.style.padding = '10px';
        internalModal.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
        internalModal.innerHTML = `<div style="text-align: right;"><button id="closeInternalModal">Close</button></div>${internalLinks}`;

        document.body.appendChild(internalModal);

        // Přidání funkce pro zobrazení modálního okna při kliknutí na "Internal Links: XX"
        document.getElementById('internalLinkCount').addEventListener('click', () => {
          internalModal.style.display = 'block';
        });

        // Přidání funkce pro zavření modálního okna
        document.getElementById('closeInternalModal').addEventListener('click', () => {
          internalModal.style.display = 'none';
        });
      }

      // Vytvoření modálního okna pro zobrazení externích odkazů
      if (externalLinkCount > 0) {
        let externalModal = document.createElement('div');
        externalModal.id = 'externalLinkModal';
        externalModal.style.display = 'none';
        externalModal.style.position = 'fixed';
        externalModal.style.zIndex = '1000001';
        externalModal.style.left = '50%';
        externalModal.style.top = '50%';
        externalModal.style.transform = 'translate(-50%, -50%)';
        externalModal.style.width = '50%';
        externalModal.style.height = '50%';
        externalModal.style.overflowY = 'scroll';
        externalModal.style.backgroundColor = '#fff';
        externalModal.style.border = '1px solid #ccc';
        externalModal.style.padding = '10px';
        externalModal.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
        externalModal.innerHTML = `<div style="text-align: right;"><button id="closeExternalModal">Close</button></div>${externalLinks}`;

        document.body.appendChild(externalModal);

        // Přidání funkce pro zobrazení modálního okna při kliknutí na "External Links: XX"
        document.getElementById('externalLinkCount').addEventListener('click', () => {
          externalModal.style.display = 'block';
        });

        // Přidání funkce pro zavření modálního okna
        document.getElementById('closeExternalModal').addEventListener('click', () => {
          externalModal.style.display = 'none';
        });
      }
    } else {
      // Aktualizace počtu obrázků, chybějících alt tagů, velikosti stránky, interních a externích odkazů při obnovení stránky
      const pngCount = document.querySelectorAll('img[src$=".png"]').length;
      const gifCount = document.querySelectorAll('img[src$=".gif"]').length;
      const jpgCount = document.querySelectorAll('img[src$=".jpg"], img[src$=".jpeg"]').length;
      const svgCount = document.querySelectorAll('img[src$=".svg"]').length;
      const bmpCount = document.querySelectorAll('img[src$=".bmp"]').length;
      const tiffCount = document.querySelectorAll('img[src$=".tiff"], img[src$=".tif"]').length;
      const webpCount = document.querySelectorAll('img[src$=".webp"]').length;

      let missingAltCount = 0;
      let missingAlts = '';
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        const alt = img.getAttribute('alt');
        if (alt === null || alt.trim() === '') {
          missingAltCount++;
          missingAlts += `<div>${img.src}</div>`;
        }
      });

      let totalSize = 0;
      performance.getEntriesByType("resource").forEach((resource) => {
        totalSize += resource.transferSize;
      });

      const totalSizeKB = (totalSize / 1024).toFixed(2);

      let internalLinkCount = 0;
      let externalLinkCount = 0;
      let internalLinks = '';
      let externalLinks = '';

      links.forEach(link => {
        const linkDomain = (new URL(link.href)).hostname;
        if (linkDomain === currentDomain) {
          internalLinkCount++;
          internalLinks += `<div>${link.href}</div>`;
        } else {
          externalLinkCount++;
          externalLinks += `<div>${link.href}</div>`;
        }
      });

      let imageText = 'Images:';
      if (jpgCount > 0) imageText += ` JPG: ${jpgCount}`;
      if (pngCount > 0) imageText += `, PNG: ${pngCount}`;
      if (gifCount > 0) imageText += `, GIF: ${gifCount}`;
      if (svgCount > 0) imageText += `, SVG: ${svgCount}`;
      if (bmpCount > 0) imageText += `, BMP: ${bmpCount}`;
      if (tiffCount > 0) imageText += `, TIFF: ${tiffCount}`;
      if (webpCount > 0) imageText += `, WEBP: ${webpCount}`;

      let missingAltsLink = missingAltCount > 0 
        ? `<span id="missingAltsCount" class="clickable" style="font-weight: bold; text-decoration: none;" onmouseover="this.style.textDecoration='underline';" onmouseout="this.style.textDecoration='none';">Missing Alts: ${missingAltCount}</span>` 
        : `Missing Alts: ${missingAltCount}`;

      let internalLinksLink = internalLinkCount > 0 
        ? `<span id="internalLinkCount" class="clickable" style="font-weight: bold; text-decoration: none;" onmouseover="this.style.textDecoration='underline';" onmouseout="this.style.textDecoration='none';">Internal Links: ${internalLinkCount}</span>` 
        : `Internal Links: ${internalLinkCount}`;

      let externalLinksLink = externalLinkCount > 0 
        ? `<span id="externalLinkCount" class="clickable" style="font-weight: bold; text-decoration: none;" onmouseover="this.style.textDecoration='underline';" onmouseout="this.style.textDecoration='none';">External Links: ${externalLinkCount}</span>` 
        : `External Links: ${externalLinkCount}`;

      imageText += ` | ${missingAltsLink} | Page Size: ${totalSizeKB} KB | ${internalLinksLink} | ${externalLinksLink} | ${themeLink}`;

      toolbar.innerHTML = `SEO BAR - ${imageText}`;
      document.body.style.marginTop = '30px';
      document.body.prepend(toolbar);

      // Znovu přidání funkcí pro modální okna, pokud jsou počty > 0
      if (missingAltCount > 0) {
        let missingAltsModal = document.createElement('div');
        missingAltsModal.id = 'missingAltsModal';
        missingAltsModal.style.display = 'none';
        missingAltsModal.style.position = 'fixed';
        missingAltsModal.style.zIndex = '1000001';
        missingAltsModal.style.left = '50%';
        missingAltsModal.style.top = '50%';
        missingAltsModal.style.transform = 'translate(-50%, -50%)';
        missingAltsModal.style.width = '50%';
        missingAltsModal.style.height = '50%';
        missingAltsModal.style.overflowY = 'scroll';
        missingAltsModal.style.backgroundColor = '#fff';
        missingAltsModal.style.border = '1px solid #ccc';
        missingAltsModal.style.padding = '10px';
        missingAltsModal.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
        missingAltsModal.innerHTML = `<div style="text-align: right;"><button id="closeMissingAltsModal">Close</button></div>${missingAlts}`;

        document.body.appendChild(missingAltsModal);

        document.getElementById('missingAltsCount').addEventListener('click', () => {
          missingAltsModal.style.display = 'block';
        });

        document.getElementById('closeMissingAltsModal').addEventListener('click', () => {
          missingAltsModal.style.display = 'none';
        });
      }

      if (internalLinkCount > 0) {
        let internalModal = document.createElement('div');
        internalModal.id = 'internalLinkModal';
        internalModal.style.display = 'none';
        internalModal.style.position = 'fixed';
        internalModal.style.zIndex = '1000001';
        internalModal.style.left = '50%';
        internalModal.style.top = '50%';
        internalModal.style.transform = 'translate(-50%, -50%)';
        internalModal.style.width = '50%';
        internalModal.style.height = '50%';
        internalModal.style.overflowY = 'scroll';
        internalModal.style.backgroundColor = '#fff';
        internalModal.style.border = '1px solid #ccc';
        internalModal.style.padding = '10px';
        internalModal.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
        internalModal.innerHTML = `<div style="text-align: right;"><button id="closeInternalModal">Close</button></div>${internalLinks}`;

        document.body.appendChild(internalModal);

        document.getElementById('internalLinkCount').addEventListener('click', () => {
          internalModal.style.display = 'block';
        });

        document.getElementById('closeInternalModal').addEventListener('click', () => {
          internalModal.style.display = 'none';
        });
      }

      if (externalLinkCount > 0) {
        let externalModal = document.createElement('div');
        externalModal.id = 'externalLinkModal';
        externalModal.style.display = 'none';
        externalModal.style.position = 'fixed';
        externalModal.style.zIndex = '1000001';
        externalModal.style.left = '50%';
        externalModal.style.top = '50%';
        externalModal.style.transform = 'translate(-50%, -50%)';
        externalModal.style.width = '50%';
        externalModal.style.height = '50%';
        externalModal.style.overflowY = 'scroll';
        externalModal.style.backgroundColor = '#fff';
        externalModal.style.border = '1px solid #ccc';
        externalModal.style.padding = '10px';
        externalModal.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
        externalModal.innerHTML = `<div style="text-align: right;"><button id="closeExternalModal">Close</button></div>${externalLinks}`;

        document.body.appendChild(externalModal);

        document.getElementById('externalLinkCount').addEventListener('click', () => {
          externalModal.style.display = 'block';
        });

        document.getElementById('closeExternalModal').addEventListener('click', () => {
          externalModal.style.display = 'none';
        });
      }
    }
  } else {
    let toolbar = document.querySelector('.seo-toolbar');
    if (toolbar) {
      toolbar.remove();
    }
  }
})();
