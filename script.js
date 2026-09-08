// =========================================
// OFFICIAL BANK CONFIGURATION (SOURCE DE VÉRITÉ)
// =========================================

// Verified HTTPS Universal Link / Android App Link (AASA + assetlinks.json confirmed):
//   APAP → https://movil.apap.com.do/  (AASA: GCVY7C8QQ9.apapmovilprod | assetlinks: com.apapmovilprod)
//   BHD  → https://link.bhd.com.do/   (AASA: V4TLL69EK8.com.do.bhd.V4TLL69EK8 | assetlinks: com.artech.infocorp_bhd.bhd)
//   Both verified on real device ✅
//
// Android intent (package= with Play Store fallback):
//   Banreservas, Popular, Adopem — no public HTTPS App Link found after exhaustive domain scan.
//   intent://#Intent;package=<pkg>;S.browser_fallback_url=<store>;end;
//   Chrome Android: opens app if installed, falls back to Play Store if not.
//
// iOS — Banreservas / Popular / Adopem:
//   No verified Universal Link or custom URL scheme found.
//   Fallback: App Store listing via apps.apple.com

const BANKS = {
    banreservas: {
        name: 'Banreservas',
        account: '9607307847',
        appLink: null,
        androidPackage: 'com.banreservas.tubancoappmobile',
        androidStore: 'https://play.google.com/store/apps/details?id=com.banreservas.tubancoappmobile',
        iosStore: 'https://apps.apple.com/do/app/banreservas/id1170610154'
    },
    popular: {
        name: 'Banco Popular',
        account: '771465069',
        appLink: null,
        androidPackage: 'com.popular.app.android',
        androidStore: 'https://play.google.com/store/apps/details?id=com.popular.app.android',
        iosStore: 'https://apps.apple.com/do/app/banco-popular-dominicano/id583475424'
    },
    apap: {
        name: 'Asociación APAP',
        account: '1036444651',
        appLink: 'https://movil.apap.com.do/', // Verified iOS + Android HTTPS App Link ✅
        androidPackage: null,
        androidStore: null,
        iosStore: null
    },
    bhd: {
        name: 'Banco BHD',
        account: '20207090018',
        appLink: 'https://link.bhd.com.do/',  // Verified iOS + Android HTTPS App Link ✅
        androidPackage: null,
        androidStore: null,
        iosStore: null
    },
    adopem: {
        name: 'Banco Adopem',
        account: '51015000000952',
        appLink: null,
        androidPackage: 'org.mfbbva.mobile.adp',
        androidStore: 'https://play.google.com/store/apps/details?id=org.mfbbva.mobile.adp',
        iosStore: 'https://apps.apple.com/do/app/appdopem/id1516815961'
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
 * Returns true when running on Android (Chrome or Samsung Internet).
 * Used to select between Android intent and iOS App Store fallback.
 * APAP and BHD bypass this entirely via verified HTTPS App Links.
 */
function isAndroid() {
    return /android/i.test(navigator.userAgent);
}

/**
 * Action centralisée: Copier → Feedback → Ouvrir l'app.
 *
 * APAP / BHD (appLink set):
 *   iOS + Android → window.location.href vers le HTTPS App Link vérifié.
 *   L'OS intercèpte si l'app est installée (Universal Link / App Link confirmés ✅).
 *
 * Banreservas / Popular / Adopem:
 *   Android → intent avec package + S.browser_fallback_url Play Store
 *             Si app installée → app ouverte.
 *             Si app absente  → Play Store (fallback encodé dans l'intent).
 *   iOS     → App Store officiel (aucun Universal Link ou scheme vérifié disponible).
 *
 * Cédula (pas d'attribut data-bank) → copy-only, aucune navigation.
 */
async function copyAndOpenBank(btn) {
    const textToCopy = btn.getAttribute('data-copy');
    const bankKey = btn.getAttribute('data-bank');
    if (!textToCopy) return;

    // 1. Copier le numéro de compte
    await copyAccount(textToCopy);

    // 2. Afficher ✓ Copiado
    showCopyFeedback(btn);

    // 3. Ouvrir l'app bancaire — uniquement si data-bank présent (Cédula n'en a pas)
    if (!bankKey || !BANKS[bankKey]) return;

    const bank = BANKS[bankKey];

    if (bank.appLink) {
        // APAP / BHD — HTTPS App Link vérifié, fonctionne sur iOS et Android
        window.location.href = bank.appLink;

    } else if (isAndroid()) {
        // Banreservas / Popular / Adopem — Android
        // intent:// avec package + fallback Play Store encodé.
        // Chrome Android: ouvre l'app si installée, sinon redirige vers Play Store.
        const fallback = encodeURIComponent(bank.androidStore);
        window.location.href =
            `intent://#Intent;package=${bank.androidPackage};S.browser_fallback_url=${fallback};end;`;

    } else {
        // Banreservas / Popular / Adopem — iOS
        // Aucun Universal Link ni scheme vérifié → App Store officiel.
        window.location.href = bank.iosStore;
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
