// =========================================
// OFFICIAL BANK APPS CONFIGURATION
// =========================================
const BANK_CONFIG = {
    'banreservas': {
        name: 'Banreservas',
        account: '9607307847',
        // Android: Intent officiel ciblant le package vérifié avec fallback Google Play
        android: 'intent://#Intent;package=com.banreservas.tubancoappmobile;S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.banreservas.tubancoappmobile;end;',
        // iOS: Lien officiel App Store (ID vérifié: 1164823611)
        ios: 'https://apps.apple.com/do/app/banreservas/id1164823611',
        // Fallback Web officiel
        fallback: 'https://www.banreservas.com'
    },
    'popular': {
        name: 'Banco Popular',
        account: '771465069',
        // Android: Intent officiel ciblant le package vérifié avec fallback Google Play
        android: 'intent://#Intent;package=do.com.bpd.popularenlinea;S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Ddo.com.bpd.popularenlinea;end;',
        // iOS: Lien officiel App Store (ID vérifié: 583475424)
        ios: 'https://apps.apple.com/do/app/banco-popular-dominicano/id583475424',
        // Fallback Web officiel
        fallback: 'https://popularenlinea.com'
    },
    'apap': {
        name: 'Asociación APAP',
        account: '1036444651',
        // Android: Intent officiel ciblant le package vérifié avec fallback Google Play
        android: 'intent://#Intent;package=com.apap.movil;S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.apap.movil;end;',
        // iOS: Lien officiel App Store (ID vérifié: 1453915858)
        ios: 'https://apps.apple.com/do/app/m%C3%B3vil-apap/id1453915858',
        // Fallback Web officiel
        fallback: 'https://apap.com.do'
    },
    'bhd': {
        name: 'Banco BHD',
        account: '20207090018',
        // Android: Intent officiel ciblant le package vérifié avec fallback Google Play
        android: 'intent://#Intent;package=do.bhd.mbanking;S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Ddo.bhd.mbanking;end;',
        // iOS: Lien officiel App Store (ID vérifié: 1438596644)
        ios: 'https://apps.apple.com/app/m%C3%B3vil-banking-personal-bhd/id1438596644',
        // Fallback Web officiel
        fallback: 'https://bhd.com.do'
    },
    'adopem': {
        name: 'Banco Adopem',
        account: '51015000000952',
        // Android: Intent officiel ciblant le package vérifié avec fallback Google Play
        android: 'intent://#Intent;package=do.com.adopem.app;S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Ddo.com.adopem.app;end;',
        // iOS: Lien officiel App Store (ID vérifié: 1456637385)
        ios: 'https://apps.apple.com/app/appdopem/id1456637385',
        // Fallback Web officiel
        fallback: 'https://bancoadopem.com.do'
    }
};

/**
 * Détection légère de la plateforme
 */
function detectPlatform() {
    const ua = navigator.userAgent || navigator.vendor || window.opera || '';
    if (/android/i.test(ua)) return 'android';
    if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) return 'ios';
    return 'desktop';
}

/**
 * Ouvre l'application bancaire ou son fallback selon la plateforme
 */
function openBankApp(bankKey) {
    const config = BANK_CONFIG[bankKey];
    if (!config) return;

    const platform = detectPlatform();

    // Léger délai de 380ms pour laisser l'utilisateur voir le feedback 'Copiado'
    setTimeout(() => {
        if (platform === 'android' && config.android) {
            window.location.href = config.android;
        } else if (platform === 'ios' && config.ios) {
            window.location.href = config.ios;
        } else {
            // Sur desktop: ouverture propre du portail bancaire dans un nouvel onglet
            window.open(config.fallback, '_blank', 'noopener,noreferrer');
        }
    }, 380);
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Animations d'entrée en cascade (stagger 60ms)
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('visible');
        }, 80 + (index * 60));
    });

    // 2. Gestion de la copie et ouverture d'application
    const buttons = document.querySelectorAll('.copy-button');

    buttons.forEach(btn => {
        btn.addEventListener('click', async () => {
            const textToCopy = btn.getAttribute('data-copy');
            const bankKey = btn.getAttribute('data-bank');
            if (!textToCopy) return;

            const triggerFeedback = () => {
                const icon = btn.querySelector('i');
                const textSpan = btn.querySelector('.btn-text');
                
                const origIcon = icon.className;
                const origText = textSpan.textContent;
                
                // Feedback visuel sans décalage de layout
                icon.className = 'fa-solid fa-check';
                textSpan.textContent = 'Copiado';
                
                // Micro-pulse
                btn.style.transform = 'scale(0.97)';
                setTimeout(() => {
                    btn.style.transform = '';
                }, 100);
                
                // Rétablissement de l'état initial après 1.4s
                setTimeout(() => {
                    icon.className = origIcon;
                    textSpan.textContent = origText;
                }, 1400);

                // Si une banque est associée, lancer l'ouverture après le feedback
                if (bankKey && BANK_CONFIG[bankKey]) {
                    openBankApp(bankKey);
                }
            };

            // ÉTAPE 1: Copier immédiatement dans le presse-papiers
            if (navigator.clipboard && window.isSecureContext) {
                try {
                    await navigator.clipboard.writeText(textToCopy);
                    triggerFeedback();
                    return;
                } catch (err) {
                    // Fallback ci-dessous si le contexte refuse navigator.clipboard
                }
            }

            // Fallback presse-papiers pour contextes non sécurisés ou protocoles locaux
            try {
                const textArea = document.createElement('textarea');
                textArea.value = textToCopy;
                textArea.style.position = 'fixed';
                textArea.style.left = '-9999px';
                textArea.style.top = '0';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                if (successful) {
                    triggerFeedback();
                }
            } catch (err) {
                console.error('Erreur de copie:', err);
            }
        });
    });
});
