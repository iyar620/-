const list_of_topics = {
    "Animals": ["dog", "cat", "elephant", "giraffe", "tiger", "lion", "zebra", "kangaroo", "panda", "koala", "dolphin", "whale", "shark", "eagle", "owl", "crocodile", "deer", "fox", "wolf", "bear", "hedgehog", "parrot", "duck", "rooster", "donkey", "sheep", "goat", "cow", "horse", "rabbit"],
    "Fruits_and_Vegetables": ["apple", "banana", "tomato", "cucumber", "orange", "grape", "watermelon", "strawberry", "blueberries", "kiwi", "carrot", "broccoli", "lettuce", "pepper", "spinach", "cherry", "peach", "pear", "plum", "pomegranate", "mango", "pineapple", "melon", "papaya", "fig", "zucchini", "eggplant", "onion", "garlic"],
    "Countries_and_Cities": ["Israel", "Tel Aviv", "New York", "Paris", "Tokyo", "London", "Berlin", "Sydney", "Rome", "Madrid", "Beijing", "Moscow", "Cairo", "Dubai", "Toronto", "Los Angeles", "San Francisco", "Chicago", "Miami", "Boston", "Washington", "Mexico City", "Buenos Aires", "Rio de Janeiro", "Sao Paulo", "Cape Town", "Johannesburg", "Mumbai", "New Delhi", "Bangalore"],
    "Professions": ["Doctor", "Teacher", "Engineer", "Lawyer", "Chef", "Nurse", "Architect", "Pilot", "Scientist", "Artist", "Musician", "actor", "writer", "photographer", "journalist", "firefighter", "policeman", "driver", "farmer", "builder", "electrician", "plumber", "programmer", "designer", "manager", "secretary", "pharmacist", "veterinarian", "psychologist", "coach"],
    "Hobbies": ["Drawing", "Reading", "Running", "Swimming", "Cooking", "Gardening", "Fishing", "Hiking", "Biking", "Knitting", "Dance", "Singing", "Music", "Painting", "Photography", "Collecting", "Writing", "Video Games", "Puzzles", "Chess", "Yoga", "Meditation", "Camping", "Surfing", "Skiing", "Snowboarding", "Karate", "Judo", "Boxing", "Football"],
    "Vehicles": ["car", "bicycle", "plane", "train", "boat", "motorcycle", "bus", "truck", "scooter", "submarine", "helicopter", "spaceship", "tram", "van", "yacht", "tractor", "caravan", "off-road vehicle", "commercial vehicle", "police car", "fire engine", "ambulance", "tank"],
    "Foods": ["pizza", "hamburger", "sushi", "falafel", "chocolate", "pasta", "salad", "sandwich", "soup", "steak", "taco", "burrito", "pancakes", "waffles", "ice cream", "shawarma", "hummus", "couscous", "bread", "cake", "cookies", "pie", "croissant", "bagel", "pita", "bun", "biscuit", "dessert", "candy"],
    "Sports": ["Football", "Basketball", "Tennis", "Cricket", "Baseball", "Hockey", "Golf", "Swimming", "Running", "Cycling", "boxing", "wrestling", "gymnastics", "skiing", "surfing", "volleyball", "handball", "water polo", "rugby", "football", "badminton", "table tennis", "squash", "karate", "judo", "taekwondo", "jumping", "diving", "kayaking", "sailing"],
    "Music_Instruments": ["guitar", "piano", "violin", "drums", "flute", "saxophone", "trumpet", "cello", "harp", "clarinet", "trombone", "accordion", "banjo", "ukulele", "mandolin", "contrabass", "bouzouki", "oud", "canon", "darboka", "tamborine", "marimba", "xylophone", "bells", "gong", "synthesizer", "organ", "harmonica", "melodica", "kazoo"],
    "Movies_and_TV_Shows": ["Inception", "Titanic", "Friends", "Line Breaker", "The Godfather", "The Dark Knight", "Game-of-Thrones", "The-Simpsons", "Stranger-Things", "Harry-Potter", "Star-Wars", "Lord-of-the-Rings", "The Avengers", "Sherlock", "The Office", "Black-Panther", "Avengers: Endgame", "The Diary", "Life-is-beautiful", "The-Never-Ending-Story", "The-Magic-Princess", "The-Secret-Life-of-Pets", "The-Voice-In-Your-Head", "The-Wizard-of-Oz", "The-Wonderful-Journey", "Journey-to-the-mystery-planet", "Journey-to-the-forbidden-planet", "Journey-to-the-lost-planet"],
    "Colors": ["red", "blue", "green", "yellow", "purple", "orange", "pink", "brown", "black", "white", "gray", " turquoise", "burgundy", "gold", "silver", "bronze"],
    "Random": [
        "dog", "cat", "elephant", "giraffe", "tiger", "lion", "zebra", "kangaroo", "panda", "koala", "dolphin", "whale", "shark", "eagle", "owl", "crocodile", "deer", "fox", "wolf", "bear", "hedgehog", "parrot", "duck", "rooster", "donkey", "sheep", "goat", "cow", "horse", "rabbit",
        "apple", "banana", "tomato", "cucumber", "orange", "grape", "watermelon", "strawberry", "blueberries", "kiwi", "carrot", "broccoli", "lettuce", "pepper", "spinach", "cherry", "peach", "pear", "plum", "pomegranate", "mango", "pineapple", "melon", "papaya", "fig", "zucchini", "eggplant", "onion", "garlic",
        "Israel", "Tel Aviv", "New York", "Paris", "Tokyo", "London", "Berlin", "Sydney", "Rome", "Madrid", "Beijing", "Moscow", "Cairo", "Dubai", "Toronto", "Los Angeles", "San Francisco", "Chicago", "Miami", "Boston", "Washington", "Mexico City", "Buenos Aires", "Rio de Janeiro", "Sao Paulo", "Cape Town", "Johannesburg", "Mumbai", "New Delhi", "Bangalore",
        "Doctor", "Teacher", "Engineer", "Lawyer", "Chef", "Nurse", "Architect", "Pilot", "Scientist", "Artist", "Musician", "actor", "writer", "photographer", "journalist", "firefighter", "policeman", "driver", "farmer", "builder", "electrician", "plumber", "programmer", "designer", "manager", "secretary", "pharmacist", "veterinarian", "psychologist", "coach",
        "Drawing", "Reading", "Running", "Swimming", "Cooking", "Gardening", "Fishing", "Hiking", "Biking", "Knitting", "Dance", "Singing", "Music", "Painting", "Photography", "Collecting", "Writing", "Video Games", "Puzzles", "Chess", "Yoga", "Meditation", "Camping", "Surfing", "Skiing", "Snowboarding", "Karate", "Judo", "Boxing", "Football",
        "car", "bicycle", "plane", "train", "boat", "motorcycle", "bus", "truck", "scooter", "submarine", "helicopter", "spaceship", "tram", "van", "yacht", "tractor", "caravan", "off-road vehicle", "commercial vehicle", "police car", "fire engine", "ambulance", "tank",
        "pizza", "hamburger", "sushi", "falafel", "chocolate", "pasta", "salad", "sandwich", "soup", "steak", "taco", "burrito", "pancakes", "waffles", "ice cream", "shawarma", "hummus", "couscous", "bread", "cake", "cookies", "pie", "croissant", "bagel", "pita", "bun", "biscuit", "dessert", "candy",
        "Football", "Basketball", "Tennis", "Cricket", "Baseball", "Hockey", "Golf", "Swimming", "Running", "Cycling", "boxing", "wrestling", "gymnastics", "skiing", "surfing", "volleyball", "handball", "water polo", "rugby", "football", "badminton", "table tennis", "squash", "karate", "judo", "taekwondo", "jumping", "diving", "kayaking", "sailing",
        "guitar", "piano", "violin", "drums", "flute", "saxophone", "trumpet", "cello", "harp", "clarinet", "trombone", "accordion", "banjo", "ukulele", "mandolin", "contrabass", "bouzouki", "oud", "canon", "darboka", "tamborine", "marimba", "xylophone", "bells", "gong", "synthesizer", "organ", "harmonica", "melodica", "kazoo",
        "Inception", "Titanic", "Friends", "Line Breaker", "The Godfather", "The Dark Knight", "Game-of-Thrones", "The-Simpsons", "Stranger-Things", "Harry-Potter", "Star-Wars", "Lord-of-the-Rings", "The Avengers", "Sherlock", "The Office", "Black-Panther", "Avengers: Endgame", "The Diary", "Life-is-beautiful", "The-Never-Ending-Story", "The-Magic-Princess", "The-Secret-Life-of-Pets", "The-Voice-In-Your-Head", "The-Wizard-of-Oz", "The-Wonderful-Journey", "Journey-to-the-mystery-planet", "Journey-to-the-forbidden-planet", "Journey-to-the-lost-planet",
        "red", "blue", "green", "yellow", "purple", "orange", "pink", "brown", "black", "white", "gray", "turquoise", "burgundy", "gold", "silver", "bronze"
        ]  
}


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





