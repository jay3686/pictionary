/* global $ */

var socket;
var isDrawing = false;
var guessBox;
var chosenWord;
var lastGuess;

var WORDS = [
    "word", "letter", "number", "person", "pen", "class", "people",
    "sound", "water", "side", "place", "man", "men", "woman", "women", "boy",
    "girl", "year", "day", "week", "month", "name", "sentence", "line", "air",
    "land", "home", "hand", "house", "picture", "animal", "mother", "father",
    "brother", "sister", "world", "head", "page", "country", "question",
    "answer", "school", "plant", "food", "sun", "state", "eye", "city", "tree",
    "farm", "story", "sea", "night", "day", "life", "north", "south", "east",
    "west", "child", "children", "example", "paper", "music", "river", "car",
    "foot", "feet", "book", "science", "room", "friend", "idea", "fish",
    "mountain", "horse", "watch", "color", "face", "wood", "list", "bird",
    "body", "dog", "family", "song", "door", "product", "wind", "ship", "area",
    "rock", "order", "fire", "problem", "piece", "top", "bottom", "king",
    "space"
];


var populateGuessList = (guess) => {
    $('#guess-list ul').append(`<li>${guess}</li>`);
    if(guess == chosenWord) {
        $('#guess-list ul li:last').css('color', 'green')
        console.log('correct word was guessed!');
        socket.emit('winner', guess);
    }

}

var handleIsDrawing = (isDrawing) => {
    if(!isDrawing) {
        $('#guess').show();
    } else {
        chosenWord = WORDS[Math.floor(Math.random() * WORDS.length)];
        console.log('guess for', chosenWord);
        $('#draw span').text(chosenWord);
        $('#draw').show();
    }
}

var handleWinner = (guess) => {
    $(`#guess-list ul li:contains(${guess})`).css('color', 'green')
    if(guess === lastGuess) {
        alert('YOU WIN');
    } if (guess === 'DISCONNECT') {
        alert('Game over.  Drawer disconnected.');
    } else {
        alert('someone else wins :(');
    }
}


var onKeyDown = function(event) {
    if (event.keyCode != 13) { // Enter
        return;
    }

    var guess = guessBox.val();
    lastGuess = guess;
    socket.emit('guess', guess);
    populateGuessList(guess);
    guessBox.val('');
};


var pictionary = function() {
    var canvas, context;

    var draw = function(position) {
        context.beginPath();
        context.arc(position.x, position.y,
                         6, 0, 2 * Math.PI);
        context.fill();
    };

    canvas = $('canvas');
    context = canvas[0].getContext('2d');
    canvas[0].width = canvas[0].offsetWidth;
    canvas[0].height = canvas[0].offsetHeight;
    canvas.on('mousedown', (event) => {
        isDrawing = true;
    });
    canvas.on('mouseup', (event) => {
        isDrawing = false;
    });
    canvas.on('mousemove', function(event) {
        if(!isDrawing) {
            return 'nope';
        }
        var offset = canvas.offset();
        var position = {x: event.pageX - offset.left,
                        y: event.pageY - offset.top};
        draw(position);
        socket.emit('draw', position);
    });
    
   socket.on('draw', draw);
};

$(document).ready(function() {
    socket = io();
    pictionary();
    
    guessBox = $('#guess input');
    guessBox.on('keydown', onKeyDown);



    socket.on('guess', populateGuessList);
    socket.on('isDrawing', handleIsDrawing);
    socket.on('winner', handleWinner);
});
