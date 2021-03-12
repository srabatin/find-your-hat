const prompt = require('prompt-sync')({ sigint: true });

const hat = '^';
const hole = 'O';
const fieldCharacter = '\u2591';
const pathCharacter = '*';
const holeFall = "#";
const hatOn = "ê";
let userInput = "";
let gameOn = true;

function askUser() {
  return prompt("Which way? w = \u2191, a = \u2190, s = \u2193, d = \u2192");
}

class Field {
  constructor(fieldArray) {
    this.field = fieldArray;
    this.playerPosition = [];
    this.rows = 0;
    this.cols = 0;
  }

  // generate the game field
  static generateField(rows, cols, percentage) { //10, 10, 0.35 gives good results
    let field = [];

    // calculate field parameters
    let numberOfItems = rows * cols; //zb 100
    let numberOfHoles = numberOfItems * percentage; // 30
    let emptyFields = numberOfItems - numberOfHoles - 2; // 68

    // generate initial array with all field elements
    let initialArray = [pathCharacter, hat];
    for (let i = 0; i < numberOfHoles; i++) {
      initialArray.push(hole);
    }
    for (let i = 0; i < emptyFields; i++) {
      initialArray.push(fieldCharacter);
    }

    // shuffle array with field elements
    function shuffle(a) {
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }
    field = shuffle(initialArray);

    // splice initial array into field
    function chunkify(a, n, balanced) {
      if (n < 2)
        return [a];
      var len = a.length,
        out = [],
        i = 0,
        size;
      if (len % n === 0) {
        size = Math.floor(len / n);
        while (i < len) {
          out.push(a.slice(i, i += size));
        }
      }
      else if (balanced) {
        while (i < len) {
          size = Math.ceil((len - i) / n--);
          out.push(a.slice(i, i += size));
        }
      }
      else {
        n--;
        size = Math.floor(len / n);
        if (len % size === 0)
          size--;
        while (i < size * n) {
          out.push(a.slice(i, i += size));
        }
        out.push(a.slice(size * n));
      }
      return out;
    }
    field = chunkify(field, rows, true);

    return field;
    /*
    for (let i = 0; i < rows; i++) {
      for (let j = 0; i < cols; i++) {
        let char = generateCharacter();
        field[i][j] = char;
      }
    }*/

  }

  // prints the field and stores information about dimensions
  print() {
    let rows = this.field.length;
    this.rows = this.field.length;
    this.cols = this.field[0].length;
    let i = 0;
    console.log("\n");
    while (i < rows) {
      console.log(this.field[i].join(""));
      i++;
    }
  }

  // find the player for first round
  initiallyLocatePlayer() {
    let posRow = 0;
    let posCol = 0;
    let position = [];
    for (let i = 0; i < this.field.length; i++) {
      if (this.field[i].indexOf(pathCharacter) > -1) {
        posCol = this.field[i].indexOf(pathCharacter);
        posRow = i;
        break;
      };
    }
    position = [posRow, posCol]
    this.playerPosition = position;
  }

  // process the user input and move the player
  movePlayer(move) {
    let pos = this.playerPosition;
    switch (move) {
      case "w":
        pos[0]--;
        break;
      case "a":
        pos[1]--;
        break;
      case "s":
        pos[0]++;
        break;
      case "d":
        pos[1]++;
        break;
      default:
        console.log("Please enter a valid command.");
        return
    }
    this.paintPlayer();
  }

  // paint the player on the field 
  paintPlayer() {
    let pos = this.playerPosition;

    // is new pos a hole? --> game lost!
    if (this.checkForHole(pos)) {
      this.field[pos[0]][pos[1]] = holeFall;
      this.print();
      console.log("Oh noes! You fell into a hole! :( You have lost the game.");
      gameOn = false;
    }

    // is new pos out of bounds? --> game lost!
    else if (this.checkForBounds(pos)) {
      this.print();
      console.log("Out of bounds. You have lost the game.");
      gameOn = false;
    }

    // is new pos a hat --> game won!
    else if (this.checkForHat(pos)) {
      this.field[pos[0]][pos[1]] = hatOn;
      this.print();
      console.log("Hooray! You have found the hat! <:D You have won the game!");
      gameOn = false;
    }

    // if new pos is 
    else {
      this.field[pos[0]][pos[1]] = pathCharacter;
    }
  }

  // check the current position for hole
  checkForHole(pos) {
    let fallInHole = false;
    let coordsToCheck = this.field[pos[0]][pos[1]];
    if (coordsToCheck === hole) {
      fallInHole = true;
    }
    return fallInHole;
  }
  // check if current position off the field
  checkForBounds(pos) {
    let outOfBounds = false;
    if (pos[0] < 0 || pos[1] < 0 || pos[0] > this.rows - 1 || pos[1] > this.cols - 1) {
      outOfBounds = true;
    }
    return outOfBounds;
  }

  // check the current position for hat
  checkForHat(pos) {
    let hatFound = false;
    let coordsToCheck = this.field[pos[0]][pos[1]];
    if (coordsToCheck === hat) {
      hatFound = true;
    }
    return hatFound;
  }

}

// generate field
let gameField = Field.generateField(10, 10, 0.35);

// create instance field1 of class Field
let field1 = new Field(gameField);

// set to false to run initiallyLocatePlayer only once
let gameInitialized = false;

// game loop
while (gameOn) {

  // print the field
  field1.print();

  // initially locate the player
  while (!gameInitialized) {
    field1.initiallyLocatePlayer();
    gameInitialized = true;
  }

  // ask for user input
  userInput = askUser();

  // move player on the field
  field1.movePlayer(userInput);
}


// todo:
// move check for in boundaries in separate method
// move playgame logic in function and call it
// always only reveal the field characters around the player
