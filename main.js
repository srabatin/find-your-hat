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
  }
  
  print() {
    let rows = this.field.length;
    //let columns = this.field[0].length;
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

  locatePlayer() {
    let posRow = 0;
    let posCol = 0;
    let playerPosition = [];
    for (let i = 0; i < this.field.length; i++) {
      if (this.field[i].indexOf(pathCharacter) > -1) {
        posCol = this.field[i].indexOf(pathCharacter);
        posRow = i;
        break;
      };
    }
    playerPosition = [posRow, posCol]
    //console.log(playerPosition);
    return playerPosition;
  }

  paintPlayer(newCoords) {
    let moveFrom = this.locatePlayer();
    let moveTo = newCoords;

    // check if newCoords is hole --> game lost
    if (this.checkForHole(moveTo)) {
      this.field[moveTo[0]][moveTo[1]] = holeFall;
      console.log("Oh noes! You fell into a hole! :( You have lost the game.");
      gameOn = false;
    }

    // check if newCoords is hat --> game won
    else if (this.checkForHat(moveTo)) {
      this.field[moveTo[0]][moveTo[1]] = hatOn;
      console.log("Hooray! You have found the hat! <:D You have won the game!");
      gameOn = false;
    } else {
      this.field[moveFrom[0]][moveFrom[1]] = pathCharacter;
      this.field[moveTo[0]][moveTo[1]] = pathCharacter;
    }
  }

  checkForHole(newCoord) {
    let fallInHole = false;
    let coordsToCheck = this.field[newCoord[0]][newCoord[1]];
    
    if (coordsToCheck === hole) {
      fallInHole = true;
    }
    return fallInHole;
  }

  checkForHat(newCoord) {
    let hatFound = false;
    let coordsToCheck = this.field[newCoord[0]][newCoord[1]];
    
    if (coordsToCheck === hat) {
      hatFound = true;
    }
    return hatFound;
  }

  movePlayer(move) {
    let playerPosition = this.locatePlayer();
    switch (move) {
      case "w":
        playerPosition[0]--;
        break;
      case "a":
        playerPosition[1]--;
        break;
      case "s":
        playerPosition[0]++;
        break;
      case "d":
        playerPosition[1]++;
        break;
      default:
        console.log("Please enter a valid command.");
        return
    }

    if (playerPosition[0] < 0 || playerPosition[1] < 0) {
      console.log("Out of bounds. You have lost the game.");
      gameOn = false;
    } else {
      this.paintPlayer(playerPosition);
    }
  }
}

// Demo arrays for field
const array1 = ['░', '*', 'O', '░', '░', '░', 'O', 'O', 'O', 'O',];
const array2 = ['░', '░', '░', '░', 'O', '░', '░', '░', '░', '░',];
const array3 = ['O', 'O', 'O', 'O', '░', 'O', 'O', '░', 'O', '░',];
const array4 = ['░', '^', '░', '░', '░', '░', '░', '░', '░', 'O',];

// create testField from demo arrays
let testField = [array1, array2, array3, array4];

//console.log(array1.join("") + "\n" + array2.join("") + "\n" + array3.join(""));



// create instance field1 of class Field
let field1 = new Field(testField);



while (gameOn) {
  // print the field
field1.print();

// ask for user input
userInput = askUser();

// move player on the field
field1.movePlayer(userInput);
}




// locate the player
//field1.locatePlayer();
