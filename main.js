const prompt = require('prompt-sync')({ sigint: true });
const hat = "^";
const hole = "O";
const field = "\u2591";
const fog = "\u2593";
const player = "\u263B";
const path = "\u2592";
const holeFall = "\u271D";
const hatOn = "ê";
let userInput = "";
let gameOn = true;
let moves = 1;
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
    let mapArray = [];

    // calculate map parameters
    let numberOfItems = rows * cols; //zb 100
    let numberOfHoles = numberOfItems * percentage; // 30
    let emptyFields = numberOfItems - numberOfHoles - 2; // 68

    // generate initial array with all map fields
    let initialArray = [player, hat];
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
    mapArray = shuffle(initialArray);

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
    mapArray = chunkify(mapArray, rows, true);
    return mapArray;
  }

  // prints the map and stores information about dimensions
  print() {
    let rows = this.map.length;
    this.rows = this.map.length;
    this.cols = this.map[0].length;

    // create shadowMap
    const shadowMap = JSON.parse(JSON.stringify(this.map));

    // fog fields
    let playerPosition = this.initiallyLocatePlayer()
    for (let i = 0; i < shadowMap.length; i++) { // rows
      for (let j = 0; j < shadowMap[i].length; j++) { // cols
        if (i < playerPosition[0] - 2 || i > playerPosition[0] + 2 || j < playerPosition[1] - 2 || j > playerPosition[1] + 2) {
          shadowMap[i][j] = fog;
        }
      }
    }

    
    console.log("\n");
    let paintMap = "";
    let i = 0;
    while (i < rows) {

      if (gameOn) {
        paintMap = paintMap + shadowMap[i].join("") + "\n";
      } else {
        paintMap = paintMap + this.map[i].join("") + "\n";
      }
      i++;
    }

    console.log(paintMap);


  }

  // find the player for first round
  initiallyLocatePlayer() {
    let posRow = 0;
    let posCol = 0;
    let position = [];
    for (let i = 0; i < this.map.length; i++) {
      if (this.map[i].indexOf(holeFall) > -1) {
        posCol = this.map[i].indexOf(holeFall);
        posRow = i;
        break;
      } else if (this.map[i].indexOf(player) > -1) {
        posCol = this.map[i].indexOf(player);
        posRow = i;
        break;
      };
    }
    position = [posRow, posCol]
    return position;
  }

  // process the user input and move the player
  movePlayer(move) {
    let pos = this.playerPosition;
    let oldPos = pos.map(x => x);
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
    this.paintPlayer(oldPos);
  }

  // paint the player on the map 
  paintPlayer(oldPos) {
    let pos = this.playerPosition;

    // is new pos out of bounds? --> game lost!
    if (this.checkForBounds(pos)) {
      gameOn = false;
      this.print();
      console.log("Out of bounds. You have lost the game. \nMoves: " + moves);
    }

    // is new pos a hole? --> game lost!
    else if (this.checkForHole(pos)) {
      gameOn = false;
      this.map[oldPos[0]][oldPos[1]] = path;
      this.map[pos[0]][pos[1]] = holeFall;
      this.print();
      console.log("Oh noes! You fell into a hole! :( You have lost the game. \nMoves: " + moves);
    }

    // is new pos a hat --> game won!
    else if (this.checkForHat(pos)) {
      gameOn = false;
      console.clear();
      this.map[oldPos[0]][oldPos[1]] = path;
      this.map[pos[0]][pos[1]] = hatOn;
      this.print();
      console.log("Hooray! You have found the hat! <:D You have won the game! \nMoves: " + moves);
    }

    // if new pos is 
    else {
      this.map[oldPos[0]][oldPos[1]] = path;
      this.map[pos[0]][pos[1]] = player;
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
      map1.playerPosition = map1.initiallyLocatePlayer();
      gameInitialized = true;
    }

    // ask for user input
    userInput = askUser();

    // move player on the map
    map1.movePlayer(userInput);
    moves ++;
  }
}

// call to play the game
playGame(10, 20, 0.3);


