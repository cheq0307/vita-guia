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

document.querySelectorAll('[data-guide-modules]').forEach((navigation) => {
    const moduleButtons = [...navigation.querySelectorAll('[data-module-target]')];
    const topicFilters = document.querySelector('[data-topic-filters]');
    const topicButtons = [...(topicFilters?.querySelectorAll('[data-topic-filter]') || [])];
    const topicBar = document.querySelector('[data-topic-filter-bar]');
    const cards = [...document.querySelectorAll('[data-topic]')];
    const sections = [...document.querySelectorAll('[data-topic-section]')];
    const assistant = document.querySelector('[data-assistant-section]');
    const emptyState = document.querySelector('[data-topic-empty]');
    const chatScope = document.querySelector('[data-chat] select[name=scope]');
    const requestedModule = window.location.hash.slice(1);
    let activeModule = moduleButtons.some((button) => button.dataset.moduleTarget === requestedModule)
        ? requestedModule
        : 'productos';
    let activeTopic = 'all';

    const matchesTopic = (card) => {
        const shared = card.dataset.topic === 'mixed' && ['health', 'business'].includes(activeTopic);
        return activeTopic === 'all' || card.dataset.topic === activeTopic || shared;
    };

    const render = () => {
        moduleButtons.forEach((button) => {
            const active = button.dataset.moduleTarget === activeModule;
            button.classList.toggle('is-active', active);
            button.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
        topicButtons.forEach((button) => {
            const active = button.dataset.topicFilter === activeTopic;
            button.classList.toggle('is-active', active);
            button.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
        cards.forEach((card) => {
            card.hidden = !matchesTopic(card);
        });
        let activeSectionHasResults = false;
        sections.forEach((section) => {
            const sectionCards = [...section.querySelectorAll('[data-topic]')];
            const hasResults = activeTopic === 'all' || sectionCards.some(matchesTopic);
            if (section.id === activeModule) activeSectionHasResults = hasResults;
            section.hidden = section.id !== activeModule || !hasResults;
        });

        const assistantActive = activeModule === 'asistente';
        if (assistant) assistant.hidden = !assistantActive;
        if (emptyState) emptyState.hidden = assistantActive || activeSectionHasResults;
        if (topicBar) topicBar.hidden = assistantActive;
        if (chatScope) chatScope.value = activeTopic;
    };

    moduleButtons.forEach((button) => button.addEventListener('click', () => {
        activeModule = button.dataset.moduleTarget;
        window.history.replaceState(null, '', '#' + activeModule);
        render();
    }));
    topicButtons.forEach((button) => button.addEventListener('click', () => {
        activeTopic = button.dataset.topicFilter;
        render();
    }));

    render();
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
