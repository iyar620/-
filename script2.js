const list_of_topics = {
    "Animals": ["כלב", "חתול", "פיל", "ג'ירפה", "נמר", "אריה", "זברה", "קנגורו", "פנדה", "קואלה", "דולפין", "לווייתן", "כריש", "נשר", "ינשוף"],
    "Fruits_and_Vegetables": ["תפוח", "בננה", "עגבנייה", "מלפפון", "תפוז", "ענב", "אבטיח", "תות", "אוכמניות", "קיווי", "גזר", "ברוקולי", "חסה", "פלפל", "תרד"],
    "Countries_and_Cities": ["ישראל", "תל-אביב", "ניו-יורק", "פריז", "טוקיו", "לונדון", "ברלין", "סידני", "רומא", "מדריד", "בייג'ינג", "מוסקבה", "קהיר", "דובאי", "טורונטו"],
    "Professions": ["רופא", "מורה", "מהנדס", "עורך-דין", "שף", "אחות", "אדריכל", "טייס", "מדען", "אמן", "מוזיקאי", "שחקן", "סופר", "צלם", "עיתונאי"],
    "Hobbies": ["ציור", "קריאה", "ריצה", "שחייה", "בישול", "גינון", "דייג", "טיולים", "רכיבה על אופניים", "סריגה", "ריקוד", "שירה","נגינה", "ציור"],
    "Vehicles": ["מכונית", "אופניים", "מטוס", "רכבת", "סירה", "אופנוע", "אוטובוס", "משאית", "קטנוע", "צוללת", "מסוק", "חללית", "חשמלית", "וואן", "יאכטה"],
    "Foods": ["פיצה", "המבורגר", "סושי", "פלאפל", "שוקולד", "פסטה", "סלט", "סנדוויץ'", "מרק", "סטייק", "טאקו", "בוריטו", "פנקייק", "ופלים", "גלידה"],
    "Sports": ["כדורגל", "כדורסל", "טניס", "קריקט", "בייסבול", "הוקי", "גולף", "שחייה", "ריצה", "רכיבה על אופניים", "אגרוף", "היאבקות", "התעמלות", "סקי", "גלישה"],
    "Music_Instruments": ["גיטרה", "פסנתר", "כינור", "תופים", "חליל", "סקסופון", "חצוצרה", "צ'לו", "נבל", "קלרינט", "טרומבון", "אקורדיון", "בנג'ו", "יוקוליל", "מנדולינה"],
    "Movies_and_TV_Shows": ["התחלה", "טיטאניק", "חברים", "שובר-שורות", "הסנדק", "האביר-האפל", "משחקי-הכס", "משפחת-סימפסון", "דברים-מוזרים", "הארי-פוטר", "מלחמת-הכוכבים", "שר-הטבעות", "הנוקמים", "שרלוק", "המשרד"]
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



function disableInput() {
    document.getElementById('letter').disabled = true;
    document.querySelector('button[onclick="guessLetter()"]').disabled = true;
}

function enableInput() {
    document.getElementById('letter').disabled = false;
    document.querySelector('button[onclick="guessLetter()"]').disabled = false;
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
        document.getElementById('message').innerText = `מצטערים, הפסדת. המילה הייתה: ${secretWord}`;
        disableInput();
    } else if (!displayedWord.includes('_')) {
        document.getElementById('message').innerText = 'כל הכבוד! ניצחת!';
        disableInput();
    }
}






