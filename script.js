document.addEventListener('DOMContentLoaded', () => {
    const copyButtons = document.querySelectorAll('.copy-btn');
    
    copyButtons.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            // Prevent double clicks while animating
            if (btn.classList.contains('success')) return;

            const accountToCopy = btn.getAttribute('data-account');
            const originalHTML = btn.innerHTML;
            
            try {
                // Try modern Clipboard API first
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(accountToCopy);
                } else {
                    // Fallback for older browsers or non-secure contexts (e.g. local testing)
                    const textArea = document.createElement("textarea");
                    textArea.value = accountToCopy;
                    // Move text area out of viewport
                    textArea.style.position = "fixed";
                    textArea.style.left = "-999999px";
                    textArea.style.top = "-999999px";
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    try {
                        document.execCommand('copy');
                    } catch (err) {
                        console.error('Fallback copy failed', err);
                    }
                    textArea.remove();
                }
                
                // Show success state
                btn.classList.add('success');
                btn.innerHTML = `<svg class="copy-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
                </svg><span class="btn-text">¡Copiado!</span>`;
                
                // Reset after 2 seconds
                setTimeout(() => {
                    btn.classList.remove('success');
                    btn.innerHTML = originalHTML;
                }, 2000);
                
            } catch (err) {
                console.error('Failed to copy text: ', err);
            }
        });
    });
});
