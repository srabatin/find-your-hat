const prompt = require('prompt-sync')({ sigint: true });
const fs = require('fs');

const treasure = "x";
const hole = "O";
const field = "\u2591";
const fog = "\u2593";
const player = "\u263B";
const path = "\u2592";
const holeFall = "\u271D";
const treasureFound = "\u22C6";

let userInput = "";
let gameOn = true;
let moves = 1;
let playerName = "";
let highScore = "";

// read highscores
function readHighscores() {
  try {
    var data = fs.readFileSync('highscore.txt', 'utf8');
    highScore = data;    
  } catch(e) {
    console.log('Error:', e.stack);
  }
}

// sort highscores
function sortHighscores(score) {
    // string to array
  let scoreArray = score.split("\n");
  for (let i = 0; i < scoreArray.length; i++) {
    scoreArray[i] = scoreArray[i].split(";");
  }
  // sort array
  scoreArray = scoreArray.sort(function(a, b){return a[1] - b[1]});
    // array to string
  for (let i = 0; i < scoreArray.length; i++) {
    scoreArray[i] = scoreArray[i].join(";");
  }
  highScore = scoreArray.join("\n");
}

function displayHighscores() {
  console.log("\nHighscores:\n" + highScore.replace(/[;]/g, ", Moves: "));
}

function askUser() {
  return prompt("\u00AB Which way to go? \u00BB (w = \u2191, a = \u2190, s = \u2193, d = \u2192) ");
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
    let initialArray = [player, treasure];
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
        if (i < playerPosition[0] - fov || i > playerPosition[0] + fov || j < playerPosition[1] - fov || j > playerPosition[1] + fov) {
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
      console.clear();
      this.print();
      console.log("\u00AB Hey, " + playerName + "! Where are you running, ya bloody traitor?! \u00BB\nGame over. Moves: " + moves);
      playAgain();
    }

    // is new pos a hole? --> game lost!
    else if (this.checkForHole(pos)) {
      gameOn = false;
      console.clear();
      this.map[oldPos[0]][oldPos[1]] = path;
      this.map[pos[0]][pos[1]] = holeFall;
      this.print();
      console.log("\u00AB Oh goddamit, " + playerName + "! You fell into a hole! \u00BB\nGame over. Moves: " + moves);
      playAgain();
    }

    // is new pos the treasure --> game won!
    else if (this.checkForTreasure(pos)) {
      gameOn = false;
      console.clear();
      this.map[oldPos[0]][oldPos[1]] = path;
      this.map[pos[0]][pos[1]] = treasureFound;
      this.print();
      console.log("\u00AB I knew it, " + playerName + "! You are a great pirate! You have found the treasure!\u00BB\nGame won! Moves: " + moves);
      writeHighScore(moves);
      playAgain();
    }

    // if new pos is map field
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

  // check the current position for treasure
  checkForTreasure(pos) {
    let treasureFound = false;
    let coordsToCheck = this.map[pos[0]][pos[1]];
    if (coordsToCheck === treasure) {
      treasureFound = true;
    }
    return treasureFound;
  }
}

// play function
function playGame(height, width, percentHoles) {
  readHighscores();
  // ask for username
  console.clear();
  playerName = prompt("\u00AB Greetings, stranger! This looks like a treasure island, huh? What's your name? \u00BB ");

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
    moves++;
  }
}

// write highscore
function writeHighScore(moves) {
  highScore = highScore + "\n" + playerName + ";" + moves
  sortHighscores(highScore);
  displayHighscores(highScore);
  fs.writeFileSync("highscore.txt", highScore);
}

function playAgain() {
  console.log("\n");
  let playAgain = prompt("\u00AB Arrrrrr, play again my friend? [y] means yes and [n] means no! \u00BB ");
  if (playAgain === "y" || playAgain === "Y" || playAgain === "yes" || playAgain === "YES") {
    userInput = "";
    gameOn = true;
    moves = 1;
    playerName = "";
    console.log("\n");
    playGame(height, width, percentageHoles, fov);
  } else if (playAgain === "n") {
    console.log("\n\u00AB Farewell, my friend! \u00BB\n")
  }
}

// -----------------------------------------------------------------------------------------

// set game parameters
const width = 20; // width of map fields
const height = 10; // height of map fields
const percentageHoles = 0.3; // percentage of holes on the map
const fov = 2; // field of view distance

// call to play the game
playGame(height, width, percentageHoles, fov);