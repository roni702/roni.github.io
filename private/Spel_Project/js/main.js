document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SELECTIES ---
    const mainAppContainer = document.getElementById('main-app-container');
    const gameSelectionScreen = document.getElementById('game-selection-screen');
    const orientationWarning = document.getElementById('orientation-warning');
    const gameContainers = document.querySelectorAll('.game-container');

    // Modals en pop-ups
    const playerEditModal = document.getElementById('player-edit-modal');
    const editPlayerNameInput = document.getElementById('editPlayerName');
    const editPlayerImageInput = document.getElementById('editPlayerImage');
    const editPlayerImagePreview = document.getElementById('editPlayerImagePreview');
    const savePlayerBtn = document.getElementById('save-player-btn');
    const cancelPlayerEditBtn = document.getElementById('cancel-player-edit-btn');
    const deletePlayerBtn = document.getElementById('delete-player-btn');

    const screenshotMessage = document.getElementById('screenshot-message');
    const emailFormContainer = document.getElementById('email-form-container');
    const emailForm = document.getElementById('email-form');
    const cancelFormBtn = document.getElementById('cancel-form-btn');
    const statusMessage = document.getElementById('status-message');
    const statusText = document.getElementById('status-text');

    let activePlayerForEdit = null;
    let playerCounter = 3; // Start teller hoger om conflicten met P1, P2 etc. te voorkomen
    let currentScreenshotData = null;

    // --- FUNCTIES ---

    /**
     * Toont een tijdelijk statusbericht onderaan het scherm.
     */
    function showStatusMessage(message, type = 'success') {
        statusText.textContent = message;
        statusMessage.className = 'fixed bottom-4 right-4 text-white p-4 rounded-lg shadow-lg z-50 transition-transform duration-300 ease-out transform'; // Reset
        statusMessage.classList.add(type === 'success' ? 'bg-green-500' : 'bg-red-500');
        statusMessage.classList.remove('hidden', 'translate-y-full');

        setTimeout(() => {
            statusMessage.classList.add('translate-y-full');
        }, 3000);
    }

    /**
     * Controleert de schermoriëntatie.
     */
    function checkOrientation() {
        const isMobileOrTablet = window.innerWidth <= 1023;
        if (isMobileOrTablet && window.innerHeight > window.innerWidth) {
            orientationWarning.classList.remove('hidden');
            mainAppContainer.classList.add('hidden');
        } else {
            orientationWarning.classList.add('hidden');
            mainAppContainer.classList.remove('hidden');
        }
    }

    /**
     * Schakelt naar een specifiek spelscherm.
     */
    function showGameScreen(gameId) {
        gameSelectionScreen.classList.add('hidden');
        gameContainers.forEach(container => container.classList.add('hidden'));
        const gameToShow = document.getElementById(gameId);
        if (gameToShow) {
            gameToShow.classList.remove('hidden');
        }
    }

    /**
     * Schakelt terug naar het sportkeuzescherm.
     */
    function showGameSelectionScreen() {
        gameContainers.forEach(container => container.classList.add('hidden'));
        gameSelectionScreen.classList.remove('hidden');
    }

    /**
     * Creëert een speler op het veld.
     */
    function createPlayerOnField(x, y, field, initialName = 'Speler') {
        const player = document.createElement('div');
        player.className = 'player-on-field';
        player.style.left = `${x}px`;
        player.style.top = `${y}px`;
        player.dataset.x = x;
        player.dataset.y = y;

        player.innerHTML = `
            <div class="action-buttons">
                <button class="action-btn edit-btn" title="Bewerk speler"><i class="fas fa-pencil-alt"></i></button>
                <button class="action-btn delete-btn" title="Verwijder speler"><i class="fas fa-trash-alt"></i></button>
            </div>
            <img src="https://placehold.co/70x70/3b82f6/ffffff?text=${initialName.charAt(0)}" alt="Speler" class="player-image">
            <span class="player-name">${initialName}</span>
        `;

        field.appendChild(player);

        player.querySelector('.edit-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            openPlayerEditModal(player);
        });
        player.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            player.remove();
        });
    }

    /**
     * Opent de modal om een speler te bewerken.
     */
    function openPlayerEditModal(playerElement) {
        activePlayerForEdit = playerElement;
        const nameSpan = playerElement.querySelector('.player-name');
        const image = playerElement.querySelector('.player-image');

        editPlayerNameInput.value = nameSpan.textContent;
        editPlayerImagePreview.src = image.src;
        editPlayerImageInput.value = '';

        playerEditModal.classList.remove('hidden');
    }

    /**
     * Slaat wijzigingen van een speler op.
     */
    function savePlayerChanges() {
        if (!activePlayerForEdit) return;

        const nameSpan = activePlayerForEdit.querySelector('.player-name');
        const image = activePlayerForEdit.querySelector('.player-image');
        const newName = editPlayerNameInput.value.trim();
        nameSpan.textContent = newName === '' ? 'Speler' : newName;

        const file = editPlayerImageInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => { image.src = e.target.result; };
            reader.readAsDataURL(file);
        }

        playerEditModal.classList.add('hidden');
        showStatusMessage('Speler bijgewerkt!', 'success');
        activePlayerForEdit = null;
    }

    /**
     * Verwerkt de screenshot en toont het e-mailformulier.
     */
    function handleScreenshotClick(field, button) {
        button.disabled = true;
        showStatusMessage('Screenshot wordt gemaakt...', 'success');
        field.classList.add('no-hover');

        html2canvas(field, { useCORS: true, backgroundColor: null, scale: 1 })
            .then(canvas => {
                // De belangrijke aanpassing is hier:
                currentScreenshotData = canvas.toDataURL('image/jpeg', 0.5);

                screenshotMessage.classList.remove('hidden');
                setTimeout(() => {
                    screenshotMessage.classList.add('hidden');
                    emailFormContainer.classList.remove('hidden');
                }, 1500);
            })
            .catch(err => {
                // ... (rest van de code)
            });
    }

    // --- INTERACT.JS CONFIGURATIE ---

    interact('.draggable-template').draggable({
        inertia: true,
        listeners: {
            move: (event) => {
                const { target, dx, dy } = event;
                const x = (parseFloat(target.getAttribute('data-x')) || 0) + dx;
                const y = (parseFloat(target.getAttribute('data-y')) || 0) + dy;
                target.style.transform = `translate(${x}px, ${y}px)`;
                target.setAttribute('data-x', x);
                target.setAttribute('data-y', y);
            },
            end: (event) => {
                event.target.style.transform = 'none';
                event.target.removeAttribute('data-x');
                event.target.removeAttribute('data-y');
            }
        }
    });

    interact('.game-field').dropzone({
        accept: '.draggable-template',
        ondrop: (event) => {
            const field = event.target;
            const dropRect = field.getBoundingClientRect();
            const template = event.relatedTarget;
            const initialName = template.textContent.trim();
            const x = event.clientX - dropRect.left - 35;
            const y = event.clientY - dropRect.top - 35;
            createPlayerOnField(x, y, field, initialName);
        }
    });

    interact('.player-on-field').draggable({
        inertia: true,
        modifiers: [interact.modifiers.restrictRect({ restriction: 'parent' })],
        listeners: {
            move: (event) => {
                const { target, dx, dy } = event;
                const x = (parseFloat(target.dataset.x) || 0) + dx;
                const y = (parseFloat(target.dataset.y) || 0) + dy;
                target.style.left = `${x}px`;
                target.style.top = `${y}px`;
                target.dataset.x = x;
                target.dataset.y = y;
            }
        }
    });

    // --- EVENT LISTENERS ---

    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    checkOrientation();

    // Game selectie & terug knoppen
    document.getElementById('select-football').addEventListener('click', () => showGameScreen('football-game-container'));
    document.getElementById('select-basketball').addEventListener('click', () => showGameScreen('basketball-game-container'));
    document.getElementById('select-tennis').addEventListener('click', () => showGameScreen('tennis-game-container'));

    document.getElementById('football-back-btn').addEventListener('click', showGameSelectionScreen);
    document.getElementById('basketball-back-btn').addEventListener('click', showGameSelectionScreen);
    document.getElementById('tennis-back-btn').addEventListener('click', showGameSelectionScreen);

    // Modal knoppen
    savePlayerBtn.addEventListener('click', savePlayerChanges);
    cancelPlayerEditBtn.addEventListener('click', () => playerEditModal.classList.add('hidden'));
    deletePlayerBtn.addEventListener('click', () => {
        if (activePlayerForEdit) {
            activePlayerForEdit.remove();
            playerEditModal.classList.add('hidden');
            showStatusMessage('Speler verwijderd.', 'success');
            activePlayerForEdit = null;
        }
    });
    editPlayerImageInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => { editPlayerImagePreview.src = event.target.result; };
            reader.readAsDataURL(e.target.files[0]);
        }
    });

    // Screenshot & Formulier knoppen
    document.getElementById('football-screenshot-btn').addEventListener('click', (e) => handleScreenshotClick(document.getElementById('football-field'), e.currentTarget));
    document.getElementById('basketball-screenshot-btn').addEventListener('click', (e) => handleScreenshotClick(document.getElementById('basketball-field'), e.currentTarget));
    document.getElementById('tennis-screenshot-btn').addEventListener('click', (e) => handleScreenshotClick(document.getElementById('tennis-field'), e.currentTarget));

    cancelFormBtn.addEventListener('click', () => {
        emailFormContainer.classList.add('hidden');
        emailForm.reset();
        currentScreenshotData = null;
    });

    // In main.js

    emailForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const submitButton = event.target.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Bezig met versturen...';

        showStatusMessage('Opstelling wordt verstuurd...', 'success');

        const params = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            screenshot: currentScreenshotData // De base64-string van de screenshot
        };

        // ---- NIEUWE CODE MET EMAILJS ----
        try {
            // E-mail 1: Stuur de notificatie naar jezelf
            await emailjs.send('service_hq5d6mu', 'template_admin_not', params);

            // E-mail 2: Stuur de bevestiging naar de gebruiker
            await emailjs.send('service_hq5d6mu', 'template_user_confi', params);

            // Alles is goed gegaan
            showStatusMessage('Opstelling succesvol verstuurd!', 'success');
            emailFormContainer.classList.add('hidden');
            emailForm.reset();
            currentScreenshotData = null;

        } catch (error) {
            console.error("Fout bij versturen via EmailJS:", error);
            showStatusMessage(`Versturen mislukt: ${error.text || 'Controleer de console.'}`, 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Verstuur mijn opstelling';
        }
        // ---- EINDE NIEUWE CODE ----
    });

    // "Nieuwe speler" knoppen
    function addNewPlayerTemplate(panelId, prefix) {
        playerCounter++;
        const panel = document.getElementById(panelId);
        const button = panel.querySelector('button');
        const newPlayer = document.createElement('div');
        newPlayer.className = 'draggable-template';
        newPlayer.textContent = `${prefix}${playerCounter}`;
        panel.insertBefore(newPlayer, button);
    }
    document.getElementById('add-football-player-btn').addEventListener('click', () => addNewPlayerTemplate('football-player-panel', 'P'));
    document.getElementById('add-basketball-player-btn').addEventListener('click', () => addNewPlayerTemplate('basketball-player-panel', 'B'));
    document.getElementById('add-tennis-player-btn').addEventListener('click', () => addNewPlayerTemplate('tennis-player-panel', 'T'));

});