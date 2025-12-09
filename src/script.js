// Récupérer les éléments du DOM
const newBtn = document.getElementById('newBtn');
const modal = document.getElementById('modal');
const modalClose = document.querySelector('.modal-close');
const cancelBtn = document.getElementById('cancelBtn');
const submitBtn = document.getElementById('submitBtn');
const exerciseNameInput = document.getElementById('exerciseName');
const exerciseMaxInput = document.getElementById('exerciseMax');
const statsGrid = document.getElementById('statsGrid');
const numberList = document.getElementById('numberList');
const historySection = document.getElementById('historySection');

// Clé pour localStorage
const STORAGE_KEY = 'savedExercises';

// Charger les exercices au démarrage
window.addEventListener('DOMContentLoaded', loadExercises);

// Ouvrir la modal
newBtn.addEventListener('click', openModal);
modalClose.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);

// Fermer la modal en cliquant dehors
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Soumettre le formulaire
submitBtn.addEventListener('click', createExercise);
exerciseNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        exerciseMaxInput.focus();
    }
});
exerciseMaxInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        createExercise();
    }
});

// Fonction pour ouvrir la modal
function openModal() {
    modal.classList.add('active');
    exerciseNameInput.focus();
}

// Fonction pour fermer la modal
function closeModal() {
    modal.classList.remove('active');
    exerciseNameInput.value = '';
    exerciseMaxInput.value = '';
}

// Fonction de calcul des répétitions
function calcReps(M, day) {
    const base = Math.floor(M * (0.50 + 0.05 * day));
    const series = [];

    for (let i = 1; i <= 5; i++) {
        let reps;

        if (i <= day) {
            reps = base;
        } else {
            reps = base - 1;
        }

        // sécurité : minimum 1 rep
        series.push(Math.max(1, reps));
    }

    return series;
}

// Fonction pour créer un exercice
function createExercise() {
    const exerciseName = exerciseNameInput.value.trim();
    const exerciseMax = exerciseMaxInput.value.trim();

    if (exerciseName === '') {
        alert('Veuillez entrer le nom de l\'exercice');
        exerciseNameInput.focus();
        return;
    }

    if (exerciseMax === '') {
        alert('Veuillez entrer le maximum');
        exerciseMaxInput.focus();
        return;
    }

    if (isNaN(exerciseMax)) {
        alert('Veuillez entrer un nombre valide');
        exerciseMaxInput.focus();
        return;
    }

    const M = parseFloat(exerciseMax);

    if (M <= 0) {
        alert('Le maximum doit être supérieur à 0');
        exerciseMaxInput.focus();
        return;
    }

    // Récupérer les exercices existants
    let exercises = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    // Créer un nouvel exercice avec les 3 jours
    const exerciseId = Date.now().toString();
    const days = [1, 3, 5];

    days.forEach(day => {
        const reps = calcReps(M, day);
        
        exercises.push({
            id: exerciseId,
            name: exerciseName,
            max: M,
            day: day,
            reps: reps,
            timestamp: new Date().toLocaleString('fr-FR')
        });
    });

    // Sauvegarder dans localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(exercises));

    // Fermer la modal et rafraîchir
    closeModal();
    loadExercises();
}

// Fonction pour charger et afficher les exercices
function loadExercises() {
    const exercises = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    // Vider les grilles
    statsGrid.innerHTML = '';
    numberList.innerHTML = '';

    if (exercises.length === 0) {
        historySection.style.display = 'none';
        return;
    }

    historySection.style.display = 'block';

    // Grouper par exerciseId
    const grouped = {};
    exercises.forEach(ex => {
        if (!grouped[ex.id]) {
            grouped[ex.id] = [];
        }
        grouped[ex.id].push(ex);
    });

    // Créer les cartes de stats (derniers exercices en haut)
    const exerciseIds = Object.keys(grouped).reverse();
    
    // Afficher tous les exercices dans l'historique
    exerciseIds.forEach((exId) => {
        const group = grouped[exId];
        const firstEx = group[0];
        
        const li = document.createElement('li');
        
        let dayDetails = '';
        const sortedGroup = group.sort((a, b) => a.day - b.day);
        
        sortedGroup.forEach(ex => {
            const repsStr = ex.reps.join(' - ');
            // Mapper l'affichage : 1->1, 3->2, 5->3
            const displayDay = ex.day === 1 ? 1 : (ex.day === 3 ? 2 : 3);
            dayDetails += `
                <div class="day-detail">
                    <div class="day-detail-label">Jour ${displayDay}</div>
                    <div class="day-detail-value">${repsStr}</div>
                </div>
            `;
        });
        
        li.innerHTML = `
            <div class="number-info">
                <div>
                    <div class="number-value">${firstEx.name}</div>
                    <div style="font-size: 1rem; color: var(--primary-color); margin: 10px 0;">Max : ${firstEx.max} rep</div>
                    <div class="day-details">
                        ${dayDetails}
                    </div>
                    <div class="number-time">${firstEx.timestamp}</div>
                </div>
                <button class="delete-btn" onclick="deleteExercise('${exId}')">Supprimer</button>
            </div>
        `;
        numberList.appendChild(li);
    });
}

// Fonction pour supprimer un exercice (tous les jours)
function deleteExercise(exerciseId) {
    let exercises = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    exercises = exercises.filter(ex => ex.id !== exerciseId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(exercises));
    loadExercises();
}

console.log('Application de programme de musculation chargée');
