// =========================================
// OFFICIAL BANK CONFIGURATION (SOURCE DE VÉRITÉ)
// =========================================

// Verified HTTPS app-link domains (AASA + assetlinks.json confirmed):
//   APAP → https://movil.apap.com.do/   (AASA: GCVY7C8QQ9.apapmovilprod / assetlinks: com.apapmovilprod)
//   BHD  → https://link.bhd.com.do/     (AASA: V4TLL69EK8.com.do.bhd.V4TLL69EK8 / assetlinks: com.artech.infocorp_bhd.bhd)
//
// Android package intents (no store fallback — direct installed-app test):
//   Banreservas → com.banreservas.tubancoappmobile
//   Popular     → com.popular.app.android
//   Adopem      → org.mfbbva.mobile.adp
//
// iOS — Banreservas / Popular / Adopem: copy-only (no verified Universal Link / URL scheme).

const BANKS = {
    banreservas: {
        name: 'Banreservas',
        account: '9607307847',
        appLink: null,                                        // No verified HTTPS app-link (iOS: copy-only)
        androidPackage: 'com.banreservas.tubancoappmobile'   // Android: direct package intent
    },
    popular: {
        name: 'Banco Popular',
        account: '771465069',
        appLink: null,                                        // No verified HTTPS app-link (iOS: copy-only)
        androidPackage: 'com.popular.app.android'            // Android: direct package intent
    },
    apap: {
        name: 'Asociación APAP',
        account: '1036444651',
        appLink: 'https://movil.apap.com.do/',               // Verified iOS + Android HTTPS App Link
        androidPackage: null                                  // appLink used on Android too (verified)
    },
    bhd: {
        name: 'Banco BHD',
        account: '20207090018',
        appLink: 'https://link.bhd.com.do/',                 // Verified iOS + Android HTTPS App Link
        androidPackage: null                                  // appLink used on Android too (verified)
    },
    adopem: {
        name: 'Banco Adopem',
        account: '51015000000952',
        appLink: null,                                        // No verified HTTPS app-link (iOS: copy-only)
        androidPackage: 'org.mfbbva.mobile.adp'             // Android: direct package intent
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
 * Returns true when running on Android (Chrome or WebView).
 * Used ONLY to decide between package intent vs copy-only for
 * Banreservas / Popular / Adopem.
 * APAP and BHD use verified HTTPS App Links on every platform.
 */
function isAndroid() {
    return /android/i.test(navigator.userAgent);
}

/**
 * Action centralisée: Copier → Feedback → Ouvrir l'app si mécanisme disponible.
 *
 * APAP / BHD (appLink set):
 *   All platforms → window.location.href to verified HTTPS App Link.
 *   The OS intercepts if the app is installed.
 *
 * Banreservas / Popular / Adopem (androidPackage set, appLink null):
 *   Android → package intent (intent://#Intent;package=…;end;)
 *             No store fallback — raw installed-app test.
 *   iOS     → copy-only (no verified Universal Link / URL scheme).
 *
 * Cédula (no data-bank attribute): always copy-only.
 */
async function copyAndOpenBank(btn) {
    const textToCopy = btn.getAttribute('data-copy');
    const bankKey = btn.getAttribute('data-bank');
    if (!textToCopy) return;

    // 1. Copy account number
    await copyAccount(textToCopy);

    // 2. Show ✓ Copiado feedback
    showCopyFeedback(btn);

    // 3. Open bank app — only if a bank key is present (Cédula has none)
    if (!bankKey || !BANKS[bankKey]) return;

    const bank = BANKS[bankKey];

    if (bank.appLink) {
        // APAP / BHD — verified HTTPS App Link works on iOS and Android
        window.location.href = bank.appLink;
    } else if (bank.androidPackage && isAndroid()) {
        // Banreservas / Popular / Adopem — Android only
        // No S.browser_fallback_url: we want a binary pass/fail on the intent
        window.location.href = `intent://#Intent;package=${bank.androidPackage};end;`;
    }
    // else: iOS for Banreservas / Popular / Adopem → copy-only, no navigation
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
