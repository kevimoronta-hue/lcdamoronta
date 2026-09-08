// =========================================
// OFFICIAL BANK CONFIGURATION (SOURCE DE VÉRITÉ)
// =========================================
const BANKS = {
    banreservas: {
        name: 'Banreservas',
        account: '9607307847',
        iosUniversalLink: null,
        iosScheme: null,
        iosStore: 'https://apps.apple.com/do/app/banreservas/id1170610154',
        androidPackage: 'com.banreservas.tubancoappmobile',
        androidAppLinkOrIntent: null,
        androidStore: 'https://play.google.com/store/apps/details?id=com.banreservas.tubancoappmobile',
        webFallback: 'https://www.banreservas.com'
    },
    popular: {
        name: 'Banco Popular',
        account: '771465069',
        iosUniversalLink: null,
        iosScheme: null,
        iosStore: 'https://apps.apple.com/do/app/banco-popular-dominicano/id583475424',
        androidPackage: 'com.popular.app.android',
        androidAppLinkOrIntent: null,
        androidStore: 'https://play.google.com/store/apps/details?id=com.popular.app.android',
        webFallback: 'https://popularenlinea.com'
    },
    apap: {
        name: 'Asociación APAP',
        account: '1036444651',
        iosUniversalLink: null,
        iosScheme: null,
        iosStore: 'https://apps.apple.com/do/app/m%C3%B3vil-apap/id1073508748',
        androidPackage: 'com.apapmovilprod',
        androidAppLinkOrIntent: null,
        androidStore: 'https://play.google.com/store/apps/details?id=com.apapmovilprod',
        webFallback: 'https://apap.com.do'
    },
    bhd: {
        name: 'Banco BHD',
        account: '20207090018',
        iosUniversalLink: null,
        iosScheme: null,
        iosStore: 'https://apps.apple.com/do/app/m%C3%B3vil-banking-personal-bhd/id736887202',
        androidPackage: 'com.artech.infocorp_bhd.bhd',
        androidAppLinkOrIntent: null,
        androidStore: 'https://play.google.com/store/apps/details?id=com.artech.infocorp_bhd.bhd',
        webFallback: 'https://bhd.com.do'
    },
    adopem: {
        name: 'Banco Adopem',
        account: '51015000000952',
        iosUniversalLink: null,
        iosScheme: null,
        iosStore: 'https://apps.apple.com/do/app/appdopem/id1516815961',
        androidPackage: 'org.mfbbva.mobile.adp',
        androidAppLinkOrIntent: null,
        androidStore: 'https://play.google.com/store/apps/details?id=org.mfbbva.mobile.adp',
        webFallback: 'https://bancoadopem.com.do'
    }
};

/**
 * Détection de la plateforme d'exécution
 */
function detectPlatform() {
    const ua = navigator.userAgent || navigator.vendor || window.opera || '';
    if (/android/i.test(ua)) return 'android';
    if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) return 'ios';
    return 'desktop';
}

/**
 * Timer de fallback pour iOS
 */
let iosFallbackTimer = null;

function clearIosFallback() {
    if (iosFallbackTimer) {
        clearTimeout(iosFallbackTimer);
        iosFallbackTimer = null;
    }
}

// Annuler le timer de fallback si l'application s'ouvre (Safari passe en arrière-plan)
window.addEventListener('pagehide', clearIosFallback);
window.addEventListener('blur', clearIosFallback);
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        clearIosFallback();
    }
});

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
 * Ouvre l'application bancaire si un mécanisme vérifié existe,
 * sinon bascule proprement vers le Store officiel en fallback
 */
function openBankApp(bankKey) {
    const bank = BANKS[bankKey];
    if (!bank) return;

    const platform = detectPlatform();

    if (platform === 'ios') {
        const targetUrl = bank.iosUniversalLink || bank.iosScheme;
        const storeFallback = bank.iosStore;

        if (targetUrl) {
            clearIosFallback();
            iosFallbackTimer = setTimeout(() => {
                if (!document.hidden) {
                    window.location.href = storeFallback;
                }
                iosFallbackTimer = null;
            }, 2000);
            window.location.href = targetUrl;
        } else {
            // Aucun schéma vérifié disponible: fallback direct App Store
            // Évite strictement l'erreur fatale Safari "URL non valide"
            window.location.href = storeFallback;
        }
    } else if (platform === 'android') {
        if (bank.androidAppLinkOrIntent) {
            window.location.href = bank.androidAppLinkOrIntent;
        } else {
            // Aucun Intent/App Link BROWSABLE vérifié: fallback direct Google Play
            window.location.href = bank.androidStore;
        }
    } else {
        // Desktop: ouverture du site web bancaire dans un nouvel onglet
        window.open(bank.webFallback, '_blank', 'noopener,noreferrer');
    }
}

/**
 * Action centralisée: Copier -> Feedback -> Ouvrir l'application bancaire / Fallback
 */
async function copyAndOpenBank(btn) {
    const textToCopy = btn.getAttribute('data-copy');
    const bankKey = btn.getAttribute('data-bank');
    if (!textToCopy) return;

    // 1. FIRST: Copier immédiatement le numéro de compte
    await copyAccount(textToCopy);

    // 2. THEN: Afficher le feedback visuel "✓ Copiado"
    showCopyFeedback(btn);

    // 3. THEN: Lancer l'application bancaire UNIQUEMENT pour les comptes bancaires
    // La cédula n'ayant pas d'attribut data-bank, elle reste STRICTEMENT COPY ONLY
    if (bankKey && BANKS[bankKey]) {
        openBankApp(bankKey);
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
