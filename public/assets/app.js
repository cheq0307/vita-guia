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

document.querySelectorAll('[data-topic-filters]').forEach((filters) => {
    const buttons = [...filters.querySelectorAll('[data-topic-filter]')];
    const cards = [...document.querySelectorAll('[data-topic]')];
    const sections = [...document.querySelectorAll('[data-topic-section]')];
    const chatScope = document.querySelector('[data-chat] select[name=scope]');

    buttons.forEach((button) => button.addEventListener('click', () => {
        const selected = button.dataset.topicFilter;
        buttons.forEach((candidate) => {
            const active = candidate === button;
            candidate.classList.toggle('is-active', active);
            candidate.setAttribute('aria-pressed', active ? 'true' : 'false');
        });

        cards.forEach((card) => {
            const shared = card.dataset.topic === 'mixed' && ['health', 'business'].includes(selected);
            card.hidden = selected !== 'all' && card.dataset.topic !== selected && !shared;
        });
        sections.forEach((section) => {
            const sectionCards = [...section.querySelectorAll('[data-topic]')];
            section.hidden = selected !== 'all' && sectionCards.every((card) => card.hidden);
        });
        if (chatScope) chatScope.value = selected;
    }));
});

document.querySelectorAll('[data-chat]').forEach((chat) => {
    const form = chat.querySelector('form');
    const input = form.querySelector('input');
    const scope = form.querySelector('select[name=scope]');
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
                body: JSON.stringify({question, scope: scope?.value || 'all'})
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
