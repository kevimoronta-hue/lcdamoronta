// =========================================
// OFFICIAL BANK CONFIGURATION (SOURCE DE VÉRITÉ)
// =========================================
const BANKS = {
    banreservas: {
        name: 'Banreservas',
        account: '9607307847',
        androidPackage: 'com.banreservas.tubancoappmobile',
        androidLaunch: 'intent://#Intent;package=com.banreservas.tubancoappmobile;S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.banreservas.tubancoappmobile;end;',
        androidStore: 'https://play.google.com/store/apps/details?id=com.banreservas.tubancoappmobile',
        iosUniversalLink: null,
        iosScheme: 'banreservas://',
        iosStore: 'https://apps.apple.com/do/app/banreservas/id1170610154',
        webFallback: 'https://www.banreservas.com'
    },
    popular: {
        name: 'Banco Popular',
        account: '771465069',
        androidPackage: 'com.popular.app.android',
        androidLaunch: 'intent://#Intent;package=com.popular.app.android;S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.popular.app.android;end;',
        androidStore: 'https://play.google.com/store/apps/details?id=com.popular.app.android',
        iosUniversalLink: null,
        iosScheme: 'popularenlinea://',
        iosStore: 'https://apps.apple.com/do/app/banco-popular-dominicano/id583475424',
        webFallback: 'https://popularenlinea.com'
    },
    apap: {
        name: 'Asociación APAP',
        account: '1036444651',
        androidPackage: 'com.apapmovilprod',
        androidLaunch: 'intent://#Intent;package=com.apapmovilprod;S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.apapmovilprod;end;',
        androidStore: 'https://play.google.com/store/apps/details?id=com.apapmovilprod',
        iosUniversalLink: null,
        iosScheme: 'apapmovil://',
        iosStore: 'https://apps.apple.com/do/app/m%C3%B3vil-apap/id1073508748',
        webFallback: 'https://apap.com.do'
    },
    bhd: {
        name: 'Banco BHD',
        account: '20207090018',
        androidPackage: 'com.artech.infocorp_bhd.bhd',
        androidLaunch: 'intent://#Intent;package=com.artech.infocorp_bhd.bhd;S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.artech.infocorp_bhd.bhd;end;',
        androidStore: 'https://play.google.com/store/apps/details?id=com.artech.infocorp_bhd.bhd',
        iosUniversalLink: null,
        iosScheme: 'bhd://',
        iosStore: 'https://apps.apple.com/do/app/m%C3%B3vil-banking-personal-bhd/id736887202',
        webFallback: 'https://bhd.com.do'
    },
    adopem: {
        name: 'Banco Adopem',
        account: '51015000000952',
        androidPackage: 'org.mfbbva.mobile.adp',
        androidLaunch: 'intent://#Intent;package=org.mfbbva.mobile.adp;S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dorg.mfbbva.mobile.adp;end;',
        androidStore: 'https://play.google.com/store/apps/details?id=org.mfbbva.mobile.adp',
        iosUniversalLink: null,
        iosScheme: 'appdopem://',
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
 * Gestion du timer de fallback pour iOS
 */
let iosFallbackTimer = null;

function clearIosFallback() {
    if (iosFallbackTimer) {
        clearTimeout(iosFallbackTimer);
        iosFallbackTimer = null;
    }
}

// Annuler le fallback Store dès que l'application prend le relais (Safari passe en arrière-plan)
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
            // Fallback ci-dessous si refusé ou contexte restreint
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
 * Tente d'ouvrir l'application bancaire installée, avec Store uniquement en fallback
 */
function openBankApp(bankKey) {
    const bank = BANKS[bankKey];
    if (!bank) return;

    const platform = detectPlatform();

    if (platform === 'android') {
        // Sur Android: Intent standard ciblant l'application installée par son package.
        // Google Play Store s'ouvre UNIQUEMENT si l'application n'est pas installée.
        window.location.href = bank.androidLaunch;
    } else if (platform === 'ios') {
        // Sur iOS: Priorité à l'ouverture de l'application via son URL scheme.
        // App Store s'ouvre UNIQUEMENT en fallback si l'application n'est pas installée.
        const targetUrl = bank.iosUniversalLink || bank.iosScheme;
        const storeFallback = bank.iosStore;

        if (targetUrl) {
            clearIosFallback();

            // Déclencher le fallback Store après 2000ms UNIQUEMENT si la page est encore visible
            // Si l'application s'ouvre, les événements blur/pagehide/visibilitychange annulent le timer
            iosFallbackTimer = setTimeout(() => {
                if (!document.hidden) {
                    window.location.href = storeFallback;
                }
                iosFallbackTimer = null;
            }, 2000);

            // Lancer l'application installée
            window.location.href = targetUrl;
        } else {
            window.location.href = storeFallback;
        }
    } else {
        // Desktop: ouverture du portail web bancaire dans un nouvel onglet
        window.open(bank.webFallback, '_blank', 'noopener,noreferrer');
    }
}

/**
 * Action centralisée: Copier -> Feedback -> Ouvrir l'application bancaire
 */
async function copyAndOpenBank(btn) {
    const textToCopy = btn.getAttribute('data-copy');
    const bankKey = btn.getAttribute('data-bank');
    if (!textToCopy) return;

    // 1. FIRST: Copier immédiatement le numéro de compte
    await copyAccount(textToCopy);

    // 2. THEN: Afficher le feedback visuel "✓ Copiado"
    showCopyFeedback(btn);

    // 3. THEN: Lancer l'application bancaire UNIQUEMENT si une banque est associée
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
