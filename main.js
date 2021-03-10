const prompt = require('prompt-sync')({ sigint: true });

const hat = '^';
const hole = 'O';
const fieldCharacter = '░';
const pathCharacter = '*';

class Field {
  constructor(fieldArray) {
    this.field = fieldArray;
  }
  print() {
    let rows = this.field.length;
    //let columns = this.field[0].length;
    let i = 0;
    while (i < rows) {
      console.log(this.field[i].join(""));
      i++;
    }
    //  console.log(this.field[0].join("") + "\n" + this.field[1].join("") + "\n" + this.field[2].join(""));
    //  console.log("Field has " + rows + " rows.");
    //  console.log("Field has " + columns + " columns.");
  }
}

const array1 = ['*', '░', 'O', '░', '░', '░', 'O', 'O', 'O', 'O',];
const array2 = ['░', '░', '░', '░', 'O', '░', '░', '░', '░', '░',];
const array3 = ['O', 'O', 'O', 'O', '░', 'O', 'O', '░', 'O', '░',];
const array4 = ['░', '^', '░', '░', '░', '░', '░', '░', '░', 'O',];

let testField = [array1, array2, array3, array4];

//console.log(array1.join("") + "\n" + array2.join("") + "\n" + array3.join(""));

let field1 = new Field(testField);

field1.print();