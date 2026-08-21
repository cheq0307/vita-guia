document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-copy]');
    if (!button) return;
    const target = document.querySelector(button.dataset.copy);
    if (!target) return;
    await navigator.clipboard.writeText(target.textContent.trim());
    const original = button.textContent;
    button.textContent = 'Copiado';
    setTimeout(() => button.textContent = original, 1800);
});

document.querySelectorAll('[data-chat]').forEach((chat) => {
    const form = chat.querySelector('form');
    const input = form.querySelector('input');
    const messages = chat.querySelector('.chat-messages');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const question = input.value.trim();
        if (!question) return;
        append(question, 'user');
        input.value = '';
        input.disabled = true;

        try {
            const response = await fetch(chat.dataset.endpoint, {
                method: 'POST',
                headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content},
                body: JSON.stringify({question})
            });
            const data = await response.json();
            if (!response.ok) {
                append('No pude responder en este momento. Codigo ' + response.status + '.', 'bot');
                return;
            }
            append(data.answer || 'No pude responder en este momento.', 'bot');
        } catch {
            append('No pude conectarme. Intenta nuevamente.', 'bot');
        } finally {
            input.disabled = false;
            input.focus();
        }
    });

    function append(text, kind) {
        const message = document.createElement('div');
        message.className = 'message ' + kind;
        message.textContent = text;
        messages.appendChild(message);
        messages.scrollTop = messages.scrollHeight;
    }
});
