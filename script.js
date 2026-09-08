// =========================================
// OFFICIAL BANK CONFIGURATION (SOURCE DE VÉRITÉ)
// =========================================
const BANKS = {
    banreservas: {
        name: 'Banreservas',
        account: '9607307847',
        androidPackage: 'com.banreservas.tubancoappmobile',
        androidStore: 'https://play.google.com/store/apps/details?id=com.banreservas.tubancoappmobile',
        iosLaunch: null,
        iosStore: 'https://apps.apple.com/do/app/banreservas/id1170610154',
        webFallback: 'https://www.banreservas.com'
    },
    popular: {
        name: 'Banco Popular',
        account: '771465069',
        androidPackage: 'com.popular.app.android',
        androidStore: 'https://play.google.com/store/apps/details?id=com.popular.app.android',
        iosLaunch: null,
        iosStore: 'https://apps.apple.com/do/app/banco-popular-dominicano/id583475424',
        webFallback: 'https://popularenlinea.com'
    },
    apap: {
        name: 'Asociación APAP',
        account: '1036444651',
        androidPackage: 'com.apapmovilprod',
        androidStore: 'https://play.google.com/store/apps/details?id=com.apapmovilprod',
        iosLaunch: null,
        iosStore: 'https://apps.apple.com/do/app/m%C3%B3vil-apap/id1073508748',
        webFallback: 'https://apap.com.do'
    },
    bhd: {
        name: 'Banco BHD',
        account: '20207090018',
        androidPackage: 'com.artech.infocorp_bhd.bhd',
        androidStore: 'https://play.google.com/store/apps/details?id=com.artech.infocorp_bhd.bhd',
        iosLaunch: null,
        iosStore: 'https://apps.apple.com/do/app/m%C3%B3vil-banking-personal-bhd/id736887202',
        webFallback: 'https://bhd.com.do'
    },
    adopem: {
        name: 'Banco Adopem',
        account: '51015000000952',
        androidPackage: 'org.mfbbva.mobile.adp',
        androidStore: 'https://play.google.com/store/apps/details?id=org.mfbbva.mobile.adp',
        iosLaunch: null,
        iosStore: 'https://apps.apple.com/do/app/appdopem/id1516815961',
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

    if (platform === 'android') {
        // Intent standard Chrome Android: cible le package officiel de l'app installée
        // S.browser_fallback_url redirige vers Google Play UNIQUEMENT si l'app n'est pas installée
        const intentUrl = `intent://#Intent;package=${bank.androidPackage};S.browser_fallback_url=${encodeURIComponent(bank.androidStore)};end;`;
        window.location.href = intentUrl;
    } else if (platform === 'ios') {
        // Sur iOS: Si un launcher URI vérifié existe, on le déclenche avec fallback temporisé
        if (bank.iosLaunch) {
            clearIosFallback();
            iosFallbackTimer = setTimeout(() => {
                if (!document.hidden) {
                    window.location.href = bank.iosStore;
                }
                iosFallbackTimer = null;
            }, 2000);
            window.location.href = bank.iosLaunch;
        } else {
            // Aucun launcher vérifié: fallback officiel App Store
            // Évite strictement l'alerte d'erreur Safari "URL non valide"
            window.location.href = bank.iosStore;
        }
    } else {
        // Desktop: ouverture du portail web bancaire dans un nouvel onglet
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
