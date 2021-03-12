const prompt = require('prompt-sync')({ sigint: true });

const hat = '^';
const hole = 'O';
const fieldCharacter = '░';
const pathCharacter = '*';
const holeFall = "#";
const hatOn = "Ô";
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
    //  console.log(this.field[0].join("") + "\n" + this.field[1].join("") + "\n" + this.field[2].join(""));
    //  console.log("Field has " + rows + " rows.");
    //  console.log("Field has " + columns + " columns.");
  }

  initialLocatePlayer() {
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
    //console.log(position);
    this.playerPosition = position;
  }

  paintPlayer() {
    let pos = this.playerPosition;

    // check if newCoords is hole --> game lost
    if (this.checkForHole(pos)) {
      this.field[pos[0]][pos[1]] = holeFall;
      console.log("Oh noes! You fell into a hole! :( You have lost the game.");
      gameOn = false;
    }

    // check if newCoords is hat --> game won
    else if (this.checkForHat(pos)) {
      this.field[pos[0]][pos[1]] = hatOn;
      console.log("Hooray! You have found the hat! <:D You have won the game!");
      gameOn = false;
    } else {
      this.field[pos[0]][pos[1]] = pathCharacter;
    }
  }

  checkForHole(pos) {
    let fallInHole = false;
    let coordsToCheck = this.field[pos[0]][pos[1]];
    if (coordsToCheck === hole) {
      fallInHole = true;
    }
    return fallInHole;
  }

  checkForHat(pos) {
    let hatFound = false;
    let coordsToCheck = this.field[pos[0]][pos[1]];
    if (coordsToCheck === hat) {
      hatFound = true;
    }
    return hatFound;
  }

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

    if (pos[0] < 0 || pos[1] < 0 || pos[0] > this.rows -1 || pos[1] > this.cols -1) {
      console.log("Out of bounds. You have lost the game.");
      gameOn = false;
    } else {
      this.paintPlayer();
    }
  }

  static generateField(rows, cols, percentage) { //10, 10, 0.3
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

}

// Demo arrays for field
/*
const array1 = ['░', '*', 'O', '░', '░', '░', 'O', 'O', 'O', 'O',];
const array2 = ['░', '░', '░', '░', 'O', '░', '░', '░', '░', '░',];
const array3 = ['O', 'O', 'O', 'O', '░', 'O', 'O', '░', 'O', '░',];
const array4 = ['░', '^', '░', '░', '░', '░', '░', '░', '░', 'O',];
*/

// create testField from demo arrays
/*
let testField = [array1, array2, array3, array4];
*/

//console.log(array1.join("") + "\n" + array2.join("") + "\n" + array3.join(""));

// generate field
let gameField = Field.generateField(10, 10, 0.3);


// create instance field1 of class Field
let field1 = new Field(gameField);


let gameInitialized = false;
while (gameOn) {

  // print the field
  field1.print();

  // initially locate the player
    while (!gameInitialized) {
    field1.initialLocatePlayer();
    gameInitialized = true;
  }

  // ask for user input
  userInput = askUser();

  // move player on the field
  field1.movePlayer(userInput);
}




// locate the player
//field1.locatePlayer();
