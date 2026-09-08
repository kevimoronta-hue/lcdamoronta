document.addEventListener('DOMContentLoaded', () => {
    // 1. Entrance Animations (staggered 60ms)
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('visible');
        }, 80 + (index * 60));
    });

    // 2. Copy Functionality
    const buttons = document.querySelectorAll('.copy-button');

    buttons.forEach(btn => {
        btn.addEventListener('click', async () => {
            const textToCopy = btn.getAttribute('data-copy');
            if (!textToCopy) return;

            const triggerSuccess = () => {
                const icon = btn.querySelector('i');
                const textSpan = btn.querySelector('.btn-text');
                
                const origIcon = icon.className;
                const origText = textSpan.textContent;
                
                // Switch to checkmark and "Copiado" without changing dimensions
                icon.className = 'fa-solid fa-check';
                textSpan.textContent = 'Copiado';
                
                // Micro-pulse scale
                btn.style.transform = 'scale(0.97)';
                setTimeout(() => {
                    btn.style.transform = '';
                }, 100);
                
                // Return to normal after 1.3s
                setTimeout(() => {
                    icon.className = origIcon;
                    textSpan.textContent = origText;
                }, 1300);
            };

            // Attempt Clipboard API
            if (navigator.clipboard && window.isSecureContext) {
                try {
                    await navigator.clipboard.writeText(textToCopy);
                    triggerSuccess();
                    return;
                } catch (err) {
                    // fallback below
                }
            }

            // Fallback for file:// or unpermitted environments
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
                    triggerSuccess();
                }
            } catch (err) {
                console.error('Copy fallback error:', err);
            }
        });
    });
});
