import Cell from "../interfaces/Cell";

export default function (phrases: string[]) {
  let row = 0;
  let column = 0;
  const cells: Cell[] = [];

  for (let i = 0; i < phrases.length; i++) {
    const cellObject: Cell = {
      column: 0,
      marked: false,
      row: 0,
      value: "",
    };
    cellObject.column = column % 5;
    cellObject.row = row % 5;
    if (i === Math.floor(phrases.length / 2)) {
      cellObject.value = "Free";
     } else {
      cellObject.value = phrases[i];
     }

    cells.push(cellObject);
    column ++;
    if (column % 5 === 4) row ++;
  }

  return cells;
}