const list_of_topics = {
    "Animals": ["dog", "cat", "elephant", "giraffe", "tiger", "lion", "zebra", "kangaroo", "panda", "koala", "dolphin", "whale", "shark", "eagle", "owl"],
    "Fruits_and_Vegetables": ["apple", "banana", "tomato", "cucumber", "orange", "grape", "watermelon", "strawberry", "blueberry", "kiwi", "carrot", "broccoli", "lettuce", "pepper", "spinach"],
    "Countries_and_Cities": ["Israel", "Tel-Aviv", "New-York", "Paris", "Tokyo", "London", "Berlin", "Sydney", "Rome", "Madrid", "Beijing", "Moscow", "Cairo", "Dubai", "Toronto"],
    "Professions": ["doctor", "teacher", "engineer", "lawyer", "chef", "nurse", "architect", "pilot", "scientist", "artist", "musician", "actor", "writer", "photographer", "journalist"],
    "Hobbies": ["painting", "reading", "running", "swimming", "cooking", "gardening", "fishing", "hiking", "cycling", "knitting", "dancing", "singing", "playing-guitar", "playing_piano", "drawing"],
    "Vehicles": ["car", "bicycle", "airplane", "train", "boat", "motorcycle", "bus", "truck", "scooter", "submarine", "helicopter", "spaceship", "tram", "van", "yacht"],
    "Foods": ["pizza", "hamburger", "sushi", "falafel", "chocolate", "pasta", "salad", "sandwich", "soup", "steak", "tacos", "burrito", "pancakes", "waffles", "ice_cream"],
    "Sports": ["soccer", "basketball", "tennis", "cricket", "baseball", "hockey", "golf", "swimming", "running", "cycling", "boxing", "wrestling", "gymnastics", "skiing", "surfing"],
    "Music_Instruments": ["guitar", "piano", "violin", "drums", "flute", "saxophone", "trumpet", "cello", "harp", "clarinet", "trombone", "accordion", "banjo", "ukulele", "mandolin"],
    "Movies_and_TV_Shows": ["Inception", "Titanic", "Friends", "Breaking-Bad", "The-Godfather", "The-Dark-Knight", "Game-of-Thrones", "The-Simpsons", "Stranger-Things", "Harry-Potter", "Star-Wars", "The-Lord-of-the-Rings", "Avengers", "Sherlock", "The-Office"]
};


const HANGMAN_PHOTOS = {
    1: "x-------x",
    2: "x-------x\n|\n|\n|\n|\n|",
    3: "x-------x\n|       |\n|       0\n|\n|\n|",
    4: "x-------x\n|       |\n|       0\n|       |\n|\n|",
    5: "x-------x\n|       |\n|       0\n|      /|\\\n|\n|",
    6: "x-------x\n|       |\n|       0\n|      /|\\\n|      /\n|",
    7: "x-------x\n|       |\n|       0\n|      /|\\\n|      / \\\n|",
    8: "x-------x\n|       |\n|       0\n|      /|\\\n|      / \\\n|"
};
let secretWord = '';
let oldLettersGuessed = [];
let num_of_tries = 0;
const MAX_TRIES = 7;

function startGame() {
    const topic = document.getElementById('topic').value;
    secretWord = list_of_topics[topic][Math.floor(Math.random() * list_of_topics[topic].length)];
    oldLettersGuessed = [];
    num_of_tries = 0;
    document.getElementById('word').innerText = '_ '.repeat(secretWord.length);
    document.getElementById('hangman').innerText = HANGMAN_PHOTOS[1];
    document.getElementById('message').innerText = ''; // איפוס ההודעה
    enableInput();
}

function guessLetter() {
    const letter = document.getElementById('letter').value.toLowerCase();
    if (letter && !oldLettersGuessed.includes(letter)) {
        oldLettersGuessed.push(letter);
        if (!secretWord.includes(letter)) {
            num_of_tries++;
        }
        updateDisplay();
    }
    document.getElementById('letter').value = '';
}

function updateDisplay() {
    let displayedWord = '';
    for (let char of secretWord) {
        if (oldLettersGuessed.includes(char)) {
            displayedWord += char + ' ';
        } else {
            displayedWord += '_ ';
        }
    }
    document.getElementById('word').innerText = displayedWord.trim();
    document.getElementById('hangman').innerText = HANGMAN_PHOTOS[num_of_tries + 1];

    if (num_of_tries >= MAX_TRIES) {
        document.getElementById('message').innerText = `Sorry, you lost. The word was: ${secretWord}`;
        disableInput();
    } else if (!displayedWord.includes('_')) {
        document.getElementById('message').innerText = 'Congratulations, you won!';
        disableInput();
    }
}

function disableInput() {
    document.getElementById('letter').disabled = true;
    document.querySelector('button[onclick="guessLetter()"]').disabled = true;
}

function enableInput() {
    document.getElementById('letter').disabled = false;
    document.querySelector('button[onclick="guessLetter()"]').disabled = false;
}





