document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.copy-button');

    buttons.forEach(btn => {
        btn.addEventListener('click', async () => {
            const textToCopy = btn.getAttribute('data-copy');
            if (!textToCopy) return;

            try {
                await navigator.clipboard.writeText(textToCopy);
                
                const icon = btn.querySelector('i');
                const textSpan = btn.querySelector('.btn-text');
                
                const originalIconClass = icon.className;
                const originalText = textSpan.textContent;
                
                // État "✓ Copiado"
                btn.classList.add('success');
                icon.className = 'fa-solid fa-check';
                textSpan.textContent = 'Copiado';
                
                // Retour à la normale après 1.5s
                setTimeout(() => {
                    btn.classList.remove('success');
                    icon.className = originalIconClass;
                    textSpan.textContent = originalText;
                }, 1500);
                
            } catch (err) {
                console.error('Erreur lors de la copie : ', err);
            }
        });
    });
});
