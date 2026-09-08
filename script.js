// =========================================
// OFFICIAL BANK CONFIGURATION (SOURCE DE VÉRITÉ)
// =========================================

// Verified app-link domains (publicly confirmed via AASA + assetlinks.json):
//   APAP → https://movil.apap.com.do/   (AASA: GCVY7C8QQ9.apapmovilprod / assetlinks: com.apapmovilprod)
//   BHD  → https://link.bhd.com.do/     (AASA: V4TLL69EK8.com.do.bhd.V4TLL69EK8 / assetlinks: com.artech.infocorp_bhd.bhd)
// All other banks: copy-only (no public app-link domain verified).

const BANKS = {
    banreservas: {
        name: 'Banreservas',
        account: '9607307847',
        appLink: null   // No verified public app-link domain
    },
    popular: {
        name: 'Banco Popular',
        account: '771465069',
        appLink: null   // No verified public app-link domain
    },
    apap: {
        name: 'Asociación APAP',
        account: '1036444651',
        appLink: 'https://movil.apap.com.do/'  // Verified: AASA + assetlinks on movil.apap.com.do
    },
    bhd: {
        name: 'Banco BHD',
        account: '20207090018',
        appLink: 'https://link.bhd.com.do/'    // Verified: AASA + assetlinks on link.bhd.com.do
    },
    adopem: {
        name: 'Banco Adopem',
        account: '51015000000952',
        appLink: null   // No verified public app-link domain
    }
};

/**
 * Copie asynchrone dans le presse-papiers avec fallback robuste
 */
async function copyAccount(text) {
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback ci-dessous
        }
    }
    return fallbackCopy(text);
}

/**
 * Méthode de copie de secours pour contextes non sécurisés
 */
function fallbackCopy(text) {
    try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.setAttribute('readonly', '');
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
    } catch (e) {
        console.error('Fallback copy error:', e);
        return false;
    }
}

/**
 * Déclenchement du feedback visuel "✓ Copiado"
 */
function showCopyFeedback(btn) {
    const icon = btn.querySelector('i');
    const textSpan = btn.querySelector('.btn-text');
    if (!icon || !textSpan) return;

    const origIcon = icon.className;
    const origText = textSpan.textContent;

    icon.className = 'fa-solid fa-check';
    textSpan.textContent = 'Copiado';

    btn.style.transform = 'scale(0.97)';
    setTimeout(() => {
        btn.style.transform = '';
    }, 100);

    setTimeout(() => {
        icon.className = origIcon;
        textSpan.textContent = origText;
    }, 1400);
}

/**
 * Action centralisée: Copier → Feedback → Naviguer vers l'app-link vérifié (APAP / BHD uniquement)
 *
 * Pour APAP et BHD : window.location.href vers le domaine HTTPS vérifié.
 * Le système d'exploitation (iOS / Android) décide si l'app installée intercepte le lien.
 * Aucune détection d'app, aucun timer, aucun store fallback.
 *
 * Pour Banreservas, Popular, Adopem et la Cédula : COPY ONLY. Aucune navigation.
 */
async function copyAndOpenBank(btn) {
    const textToCopy = btn.getAttribute('data-copy');
    const bankKey = btn.getAttribute('data-bank');
    if (!textToCopy) return;

    // 1. Copier immédiatement le numéro de compte
    await copyAccount(textToCopy);

    // 2. Afficher le feedback visuel "✓ Copiado"
    showCopyFeedback(btn);

    // 3. Naviguer vers l'app-link vérifié — APAP et BHD uniquement
    //    La cédula n'a pas d'attribut data-bank → toujours COPY ONLY
    //    Les banques sans appLink → toujours COPY ONLY
    if (bankKey && BANKS[bankKey] && BANKS[bankKey].appLink) {
        window.location.href = BANKS[bankKey].appLink;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Animation d'entrée des cartes en cascade
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('visible');
        }, 80 + (index * 60));
    });

    // 2. Écouteurs de clic sur les boutons de copie
    const buttons = document.querySelectorAll('.copy-button');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => copyAndOpenBank(btn));
    });
});
