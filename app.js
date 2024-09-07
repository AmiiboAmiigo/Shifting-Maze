const max = 9;
const mutations = [0, 1, 3, 5, 7, 2, 4, 6, 8];
let shifts = []; 
let offset = 0;
let mutationIndex = 0;
let selectedItem = null; 
let selectedItemNumber = null; 

const rooms = Array.from({ length: max }, (_, i) => ({
    name: `Room ${i + 1}`,
    description: `Description for Room ${i + 1}`,
    challenge: `Challenge for Room ${i + 1}`,
}));

// Create an object to store notes for each room
let roomNotes = {};

function setup() {
    createElements();
    updateGrid();
}

function createElements() {
    const container = document.querySelector('.container');
    const roomDetails = document.getElementById('roomDetails');

    const roomName = document.createElement('p');
    roomName.id = 'roomName';
    roomDetails.appendChild(roomName);

    const roomDescription = document.createElement('p');
    roomDescription.id = 'roomDescription';
    roomDetails.appendChild(roomDescription);

    const roomChallenge = document.createElement('div');
    roomChallenge.id = 'roomChallenge';
    roomChallenge.className = 'hidden';
    roomDetails.appendChild(roomChallenge);

    const challengeSpan = document.createElement('span');
    challengeSpan.textContent = 'Challenge';
    roomChallenge.appendChild(challengeSpan);

    const challengeText = document.createElement('p');
    challengeText.id = 'challengeText';
    roomChallenge.appendChild(challengeText);

    const roomNotes = document.createElement('div');
    roomNotes.id = 'roomNotes';
    roomNotes.className = 'hidden';
    roomDetails.appendChild(roomNotes);

    const notesSpan = document.createElement('span');
    notesSpan.textContent = 'Notes';
    roomNotes.appendChild(notesSpan);

    const notesText = document.createElement('p');
    notesText.id = 'notesText';
    roomNotes.appendChild(notesText);
}

function updateGrid() {
    const gridContainer = document.querySelector('.grid-container');
    // Save the current grid state before updating
    shifts.push(gridContainer.innerHTML); 
    gridContainer.innerHTML = ''; // Clear any existing grid items
    const items = Array.from({ length: max }, (_, i) => ({
        number: section(i + 1),
        index: i + 1
    }));
    // Shuffle items randomly
    for (let i = items.length - 1; i > 0; i--) {
        const j = getRandomInt(i + 1);
        [items[i], items[j]] = [items[j], items[i]];
    }
    // Render the grid items with notes
    items.forEach(item => {
        const gridItem = document.createElement('div');
        gridItem.className = 'grid-item';
        gridItem.innerHTML = `
            <span class="block font-bold text-xl">${item.number}</span> <div>
                <input type="text" id="note${item.number}" class="note-input" placeholder="Notes" value="${roomNotes[item.number] || ''}">
            </div>
        `;
        gridItem.onclick = () => {
            // Remove highlight from previously selected item
            if (selectedItem) {
                selectedItem.classList.remove('clicked');
            }
            // Select and highlight the new item
            gridItem.classList.add('clicked');
            selectedItem = gridItem;
            selectedItemNumber = item.number;
            // Update the note text box when a room is selected
            const noteInput = gridItem.querySelector('.note-input');
            noteInput.value = roomNotes[item.number] || '';
            setRoom(item.number);
        };
        gridContainer.appendChild(gridItem);
        // Add event listener to the note input
        const noteInput = gridItem.querySelector('.note-input');
        noteInput.addEventListener('input', () => {
            const currentValue = noteInput.value;
            roomNotes[item.number] = currentValue;
            document.getElementById('notesText').textContent = currentValue;
            setRoom(item.number); 
        });
    });
    // Reapply highlight to the previously selected item (updated for undo)
    if (selectedItemNumber !== null) {
        const gridItems = document.querySelectorAll('.grid-item');
        gridItems.forEach(item => {
            if (parseInt(item.querySelector('span').textContent, 10) === selectedItemNumber) {
                // Update selectedItem to the newly restored item
                selectedItem = item; 
                // Reapply highlight
                selectedItem.classList.add('clicked'); 
                // Set the room details
                setRoom(selectedItemNumber); 
            }
        });
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function shift() {
    mutationIndex = (mutationIndex + 1) % mutations.length;
    offset = mutations[mutationIndex];
    updateGrid(); 
}

// Modified undo function to correctly update selectedItem and selectedItemNumber
function undo() {
    if (shifts.length === 0) return;
    const lastGridState = shifts.pop(); 
    const gridContainer = document.querySelector('.grid-container');
    gridContainer.innerHTML = lastGridState; 
    // Reapply the notes to the restored grid
    const noteInputs = document.querySelectorAll('.note-input');
    noteInputs.forEach((input) => {
        const roomNumber = parseInt(input.id.replace('note', ''), 10); 
        input.value = roomNotes[roomNumber] || '';
        // Add event listener to the note input
        input.addEventListener('input', () => {
            const currentValue = input.value;
            roomNotes[roomNumber] = currentValue;
            document.getElementById('notesText').textContent = currentValue;
            setRoom(roomNumber); 
        });
    });
    // Find the newly restored grid item corresponding to the selectedItemNumber
    const gridItems = document.querySelectorAll('.grid-item');
    gridItems.forEach(item => {
        if (parseInt(item.querySelector('span').textContent, 10) === selectedItemNumber) {
            // Update selectedItem to the newly restored item
            selectedItem = item; 
            // Reapply highlight
            selectedItem.classList.add('clicked'); 
            // Set the room details
            setRoom(selectedItemNumber); 
        }
    });
}

function section(index) {
    return (index + offset - 1) % max + 1;
}

function setRoom(roomNumber) {
    const room = rooms[roomNumber - 1];
    document.getElementById('roomName').textContent = room.name;
    document.getElementById('roomDescription').textContent = room.description; 

    const roomChallenge = document.getElementById('roomChallenge');
    roomChallenge.classList.toggle('hidden', !room.challenge);
    document.getElementById('challengeText').textContent = room.challenge || '';
    const roomNotes = document.getElementById('roomNotes');
    roomNotes.classList.toggle('hidden', !document.getElementById(`note${roomNumber}`).value);
    document.getElementById('notesText').textContent = document.getElementById(`note${roomNumber}`).value || '';
}

setup();

document.getElementById('shiftButton').addEventListener('click', shift);
document.getElementById('undoButton').addEventListener('click', undo);
