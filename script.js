// =========================================
// OFFICIAL BANK CONFIGURATION
// =========================================
const BANKS = {
    banreservas: {
        name: 'Banreservas',
        account: '9607307847',
        androidPackage: 'com.banreservas.tubancoappmobile',
        androidFallback: 'https://play.google.com/store/apps/details?id=com.banreservas.tubancoappmobile',
        iosSchemeOrUniversalLink: null, // UNVERIFIED: Aucun schéma public vérifié disponible
        iosFallback: 'https://apps.apple.com/do/app/banreservas/id1170610154',
        webFallback: 'https://www.banreservas.com'
    },
    popular: {
        name: 'Banco Popular',
        account: '771465069',
        androidPackage: 'com.popular.app.android',
        androidFallback: 'https://play.google.com/store/apps/details?id=com.popular.app.android',
        iosSchemeOrUniversalLink: null, // UNVERIFIED: Aucun schéma public vérifié disponible
        iosFallback: 'https://apps.apple.com/do/app/banco-popular-dominicano/id583475424',
        webFallback: 'https://popularenlinea.com'
    },
    apap: {
        name: 'Asociación APAP',
        account: '1036444651',
        androidPackage: 'com.apapmovilprod',
        androidFallback: 'https://play.google.com/store/apps/details?id=com.apapmovilprod',
        iosSchemeOrUniversalLink: null, // UNVERIFIED: Aucun schéma public vérifié disponible
        iosFallback: 'https://apps.apple.com/do/app/m%C3%B3vil-apap/id1073508748',
        webFallback: 'https://apap.com.do'
    },
    bhd: {
        name: 'Banco BHD',
        account: '20207090018',
        androidPackage: 'com.artech.infocorp_bhd.bhd',
        androidFallback: 'https://play.google.com/store/apps/details?id=com.artech.infocorp_bhd.bhd',
        iosSchemeOrUniversalLink: null, // UNVERIFIED: Aucun schéma public vérifié disponible
        iosFallback: 'https://apps.apple.com/do/app/m%C3%B3vil-banking-personal-bhd/id736887202',
        webFallback: 'https://bhd.com.do'
    },
    adopem: {
        name: 'Banco Adopem',
        account: '51015000000952',
        androidPackage: 'org.mfbbva.mobile.adp',
        androidFallback: 'https://play.google.com/store/apps/details?id=org.mfbbva.mobile.adp',
        iosSchemeOrUniversalLink: null, // UNVERIFIED: Aucun schéma public vérifié disponible
        iosFallback: 'https://apps.apple.com/do/app/appdopem/id1516815961',
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
 * Copie asynchrone dans le presse-papiers avec fallback
 */
async function copyAccount(text) {
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback ci-dessous si refusé ou non sécurisé
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
 * Ouvre l'application bancaire installée ou son fallback
 */
function openBankApp(bankKey) {
    const bank = BANKS[bankKey];
    if (!bank) return;

    const platform = detectPlatform();

    if (platform === 'android') {
        // Intent standard Chrome Android: cible le package officiel de l'application installée.
        // Si l'application n'est pas installée, Chrome navigue automatiquement vers S.browser_fallback_url.
        const intentUrl = `intent://#Intent;package=${bank.androidPackage};S.browser_fallback_url=${encodeURIComponent(bank.androidFallback)};end;`;
        window.location.href = intentUrl;
    } else if (platform === 'ios') {
        // Sur iOS, les banques dominicaines ne fournissent aucun schéma d'URL public officiel.
        // Fallback sécurisé vers l'App Store officiel (bouton "Ouvrir" si l'app est installée).
        if (bank.iosSchemeOrUniversalLink) {
            window.location.href = bank.iosSchemeOrUniversalLink;
        } else {
            window.location.href = bank.iosFallback;
        }
    } else {
        // Desktop: ouverture du site web bancaire dans un nouvel onglet
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

    // ÉTAPE 1 (FIRST): Copier immédiatement le numéro
    await copyAccount(textToCopy);

    // ÉTAPE 2 (THEN): Afficher le feedback visuel
    showCopyFeedback(btn);

    // ÉTAPE 3 (THEN): Lancer l'application bancaire UNIQUEMENT pour les comptes bancaires
    // La cédula n'ayant pas de data-bank, elle reste COPY ONLY
    if (bankKey && BANKS[bankKey]) {
        openBankApp(bankKey);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Animation des cartes en cascade (stagger)
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('visible');
        }, 80 + (index * 60));
    });

    // 2. Écouteurs d'événements de clic sur les boutons de copie
    const buttons = document.querySelectorAll('.copy-button');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => copyAndOpenBank(btn));
    });
});
