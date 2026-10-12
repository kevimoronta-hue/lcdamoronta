// =========================================
// OFFICIAL BANK CONFIGURATION (SOURCE DE VÉRITÉ)
// Même logique que le template portal-transferencia (src/banks.mjs + src/app.js).
// =========================================
//
// iOS (test physique iPhone 2026-10-12) :
//   Banreservas → tubancoapp://   Popular → popular://   BHD → com.do.bhd.V4TLL69EK8://
//   APAP → Universal Link movil.apap.com.do   Adopem → App Store
//
// Android — le package est la source de vérité (androidApp()) :
//   1. directLink confirmé : App Link BHD / APAP (assetlinks.json + Google DAL)
//   2. sinon market://details?id=<package>  (validé physiquement : Banreservas, Popular, Adopem)
//   3. sinon https://play.google.com/store/apps/details?id=<package>
//
// Desktop → copie seule, aucune navigation.

/** Construit la config Android d'une banque à partir de son package. */
function androidApp(packageName, directLink = null) {
    return {
        packageName,
        directLink,
        marketUrl: `market://details?id=${packageName}`,
        storeUrl: `https://play.google.com/store/apps/details?id=${packageName}`,
    };
}

const BANKS = {
    banreservas: {
        name: 'Banreservas',
        account: '9607307847',
        iosScheme: 'tubancoapp://',   // validé iPhone 2026-10-12
        appLink: null,
        iosStore: 'https://apps.apple.com/do/app/banreservas/id1170610154',
        android: androidApp('com.banreservas.tubancoappmobile'),   // market:// validé Android 2026-10-12
    },
    popular: {
        name: 'Banco Popular',
        account: '771465069',
        iosScheme: 'popular://',   // validé iPhone 2026-10-12
        appLink: null,
        iosStore: 'https://apps.apple.com/do/app/banco-popular-dominicano/id583475424',
        android: androidApp('com.popular.app.android'),   // market:// validé Android 2026-10-12
    },
    apap: {
        name: 'Asociación APAP',
        account: '1036444651',
        appLink: 'https://movil.apap.com.do/',
        iosStore: null,
        android: androidApp('com.apapmovilprod', 'https://movil.apap.com.do/'),
    },
    bhd: {
        name: 'Banco BHD',
        account: '20207090018',
        iosScheme: 'com.do.bhd.V4TLL69EK8://',   // validé iPhone 2026-10-12
        appLink: 'https://link.bhd.com.do/',
        iosStore: null,
        android: androidApp('com.artech.infocorp_bhd.bhd', 'https://link.bhd.com.do/'),
    },
    adopem: {
        name: 'Banco Adopem',
        account: '51012000175795',
        appLink: null,
        iosStore: 'https://apps.apple.com/do/app/appdopem/id1516815961',
        android: androidApp('org.mfbbva.mobile.adp'),   // market:// validé Android 2026-10-12
    },
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

    btn.classList.add('is-copied');

    setTimeout(() => {
        icon.className = origIcon;
        textSpan.textContent = origText;
        btn.classList.remove('is-copied');
    }, 1400);
}


function isAndroid() {
    return /android/i.test(navigator.userAgent);
}

/** iPhone / iPod / iPad (iPadOS se présente comme un Mac tactile). */
function isIOS() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent)
        || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function platformName() {
    return isAndroid() ? 'android' : isIOS() ? 'ios' : 'desktop';
}

/**
 * Choisit comment ouvrir l'app bancaire. Toutes les données viennent de src/banks.mjs.
 *   ANDROID : 1. directLink confirmé — App Link https (intent ciblé sur le package)
 *                ou schéma custom testé sur Android (intent scheme + package),
 *                avec fallback Play Store porté par l'intent
 *             2. market://details?id=<package>  (fiche Play Store, validé physiquement)
 *             3. https://play.google.com/store/apps/details?id=<package> si market:// échoue
 *   IOS     : iosScheme validé → Universal Link → App Store
 *   DESKTOP : null (copie uniquement)
 */
function resolveBankLaunch(bank) {
    if (isAndroid()) {
        const a = bank.android;
        if (!a) return null;
        const fb = a.storeUrl ? `S.browser_fallback_url=${encodeURIComponent(a.storeUrl)};` : '';
        if (a.directLink && a.packageName) {
            if (/^https:\/\//i.test(a.directLink)) {
                const u = new URL(a.directLink);
                return { method: 'android-applink', url: `intent://${u.host}${u.pathname}${u.search}#Intent;scheme=https;package=${a.packageName};${fb}end;`, fallback: a.storeUrl };
            }
            const scheme = a.directLink.replace(/:.*$/, '');
            return { method: 'android-scheme', url: `intent://#Intent;scheme=${scheme};package=${a.packageName};${fb}end;`, fallback: a.storeUrl };
        }
        if (a.marketUrl) return { method: 'android-market', url: a.marketUrl, fallback: a.storeUrl, fallbackIfStillVisible: true };
        if (a.storeUrl) return { method: 'android-store', url: a.storeUrl, fallback: null };
        return null;
    }
    if (isIOS()) {
        if (bank.iosScheme) return { method: 'ios-scheme', url: bank.iosScheme, fallback: null };
        if (bank.appLink) return { method: 'ios-universal-link', url: bank.appLink, fallback: null };
        if (bank.iosStore) return { method: 'ios-store', url: bank.iosStore, fallback: null };
    }
    return null;
}

// ---------------------------------------------------------------------
//  Mode debug : ?bankdebug=1 — banque, plateforme, méthode, URL, fallback,
//  événements de mise en arrière-plan. Jamais de numéro de compte.
// ---------------------------------------------------------------------
const BANK_DEBUG = /[?&]bankdebug=1(?:&|$)/.test(location.search);
let bankDebugEl = null;
let bankDebugT0 = 0;

function bankDebug(msg) {
    if (!BANK_DEBUG) return;
    if (!bankDebugEl) {
        bankDebugEl = document.createElement('pre');
        bankDebugEl.setAttribute('aria-hidden', 'true');
        bankDebugEl.style.cssText = 'position:fixed;left:8px;right:8px;bottom:8px;max-height:38vh;overflow:auto;z-index:9999;margin:0;padding:8px;border-radius:10px;background:rgba(0,0,0,.85);color:#9fe6a0;font:11px/1.4 ui-monospace,Menlo,monospace;white-space:pre-wrap;word-break:break-all;';
        document.body.appendChild(bankDebugEl);
        try { bankDebugEl.textContent = sessionStorage.getItem('bankdebug-log') || ''; } catch (e) { /* stockage indisponible */ }
    }
    const t = bankDebugT0 ? `+${((performance.now() - bankDebugT0) / 1000).toFixed(2)}s` : new Date().toLocaleTimeString();
    bankDebugEl.textContent += `[${t}] ${msg}\n`;
    bankDebugEl.scrollTop = bankDebugEl.scrollHeight;
    try { sessionStorage.setItem('bankdebug-log', bankDebugEl.textContent.slice(-6000)); } catch (e) { /* stockage indisponible */ }
}

if (BANK_DEBUG) {
    ['visibilitychange', 'pagehide', 'pageshow', 'blur', 'focus'].forEach((ev) => {
        window.addEventListener(ev, () => {
            bankDebug(ev === 'visibilitychange' ? `visibilitychange → ${document.visibilityState}` : ev);
        }, { capture: true });
    });
    document.addEventListener('DOMContentLoaded', () => bankDebug(`debug actif · plateforme=${platformName()}`));
}

/**
 * Repli market:// → https : si la page est toujours au premier plan après
 * MARKET_FALLBACK_MS, le Play Store ne s'est pas ouvert (market:// non pris en
 * charge) → on ouvre la version https. Annulé dès que la page passe en arrière-plan.
 */
const MARKET_FALLBACK_MS = 1500;
let marketFallbackTimer = null;

function cancelMarketFallback(reason) {
    if (!marketFallbackTimer) return;
    clearTimeout(marketFallbackTimer);
    marketFallbackTimer = null;
    bankDebug(`fallback https annulé (${reason})`);
}

['pagehide', 'blur'].forEach((ev) => window.addEventListener(ev, () => cancelMarketFallback(ev)));
document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelMarketFallback('page masquée');
});

/** Ouvre l'app de la banque. Appelée directement dans le tap (geste utilisateur). */
function openBankApp(bankKey) {
    const bank = BANKS[bankKey];
    if (!bank) return;
    const launch = resolveBankLaunch(bank);
    bankDebugT0 = performance.now();
    bankDebug(`banque=${bankKey} · plateforme=${platformName()} · méthode=${launch ? launch.method : 'copie-seule'}`);
    if (!launch) return;
    bankDebug(`url=${launch.url}`);
    bankDebug(`fallback=${launch.fallback || '—'}`);

    cancelMarketFallback('nouveau tap');
    window.location.href = launch.url;

    if (launch.fallbackIfStillVisible && launch.fallback) {
        marketFallbackTimer = setTimeout(() => {
            marketFallbackTimer = null;
            if (document.visibilityState === 'visible') {
                bankDebug(`page toujours visible → fallback ${launch.fallback}`);
                window.location.href = launch.fallback;
            }
        }, MARKET_FALLBACK_MS);
    }
}

/**
 * Copier → Feedback → Ouvrir l'app.
 * La copie est lancée sans être attendue : la navigation part dans le même
 * geste utilisateur (sinon le navigateur peut refuser l'ouverture de l'app).
 * Cédula (pas de data-bank) → copie seule.
 */
function copyAndOpenBank(btn) {
    const textToCopy = btn.getAttribute('data-copy');
    const bankKey = btn.getAttribute('data-bank');
    if (!textToCopy) return;

    copyAccount(textToCopy);
    showCopyFeedback(btn);

    if (bankKey) openBankApp(bankKey);
}


// iOS Safari n'applique :active (feedback de pression) qu'avec un écouteur tactile.
document.addEventListener('touchstart', () => {}, { passive: true });

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
