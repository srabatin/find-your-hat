const prompt = require('prompt-sync')({ sigint: true });
const hat = '^';
const hole = 'O';
const field = '\u2591';
const path = '*';
const holeFall = "#";
const hatOn = "ê";
let userInput = "";
let gameOn = true;
function askUser() {
  return prompt("Which way? w = \u2191, a = \u2190, s = \u2193, d = \u2192");
}

class Map {
  constructor(mapArray) {
    this.map = mapArray;
    this.playerPosition = [];
    this.rows = 0;
    this.cols = 0;
  }

  // generate the game map
  static generateMap(rows, cols, percentage) { //10, 10, 0.35 gives good results
    let map = [];

    // calculate map parameters
    let numberOfItems = rows * cols; //zb 100
    let numberOfHoles = numberOfItems * percentage; // 30
    let emptyFields = numberOfItems - numberOfHoles - 2; // 68

    // generate initial array with all map fields
    let initialArray = [path, hat];
    for (let i = 0; i < numberOfHoles; i++) {
      initialArray.push(hole);
    }
    for (let i = 0; i < emptyFields; i++) {
      initialArray.push(field);
    }

    // shuffle array with map elements
    function shuffle(a) {
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }
    map = shuffle(initialArray);

    // splice initial array into map
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
    map = chunkify(map, rows, true);
    return map;
  }

  // prints the map and stores information about dimensions
  print() {
    let rows = this.map.length;
    this.rows = this.map.length;
    this.cols = this.map[0].length;
    let i = 0;
    console.log("\n");
    while (i < rows) {
      console.log(this.map[i].join(""));
      i++;
    }
  }

  // find the player for first round
  initiallyLocatePlayer() {
    let posRow = 0;
    let posCol = 0;
    let position = [];
    for (let i = 0; i < this.map.length; i++) {
      if (this.map[i].indexOf(path) > -1) {
        posCol = this.map[i].indexOf(path);
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

  // paint the player on the map 
  paintPlayer() {
    let pos = this.playerPosition;

    // is new pos a hole? --> game lost!
    if (this.checkForHole(pos)) {
      this.map[pos[0]][pos[1]] = holeFall;
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
      this.map[pos[0]][pos[1]] = hatOn;
      this.print();
      console.log("Hooray! You have found the hat! <:D You have won the game!");
      gameOn = false;
    }

    // if new pos is 
    else {
      this.map[pos[0]][pos[1]] = path;
    }
  }

  // check the current position for hole
  checkForHole(pos) {
    let fallInHole = false;
    let coordsToCheck = this.map[pos[0]][pos[1]];
    if (coordsToCheck === hole) {
      fallInHole = true;
    }
    return fallInHole;
  }

  // check if current position off the map
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
    let coordsToCheck = this.map[pos[0]][pos[1]];
    if (coordsToCheck === hat) {
      hatFound = true;
    }
    return hatFound;
  }

}

// play function
function playGame(height, width, percentHoles) {
  // generate map
  let gameMap = Map.generateMap(height, width, percentHoles);

  // create instance map1 of class Map
  let map1 = new Map(gameMap);

  // set to false to run initiallyLocatePlayer only once
  let gameInitialized = false;

  // game loop
  while (gameOn) {

    // print the map
    console.clear();
    map1.print();

    // initially locate the player
    while (!gameInitialized) {
      map1.initiallyLocatePlayer();
      gameInitialized = true;
    }

    // ask for user input
    userInput = askUser();

    // move player on the map
    map1.movePlayer(userInput);
  }
}

// call to play the game
playGame(10, 10, 0.35);


/* todo:
move check for in boundaries in separate method DONE
move playgame logic in function and call it DONE
rename field to map
separate player char and path char
player char = e
path char = light field
always only reveal the field characters around the player: when painting map, create copy of map array and replace all map fields around player and 8 view-fields with dark-shade char
count moves to solve map
ask for player name
save to highscore.txt
*/
