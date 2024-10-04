import Cell from "~/interfaces/Cell";

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
    cellObject.value = phrases[i];

    cells.push(cellObject);
    if (column % 5 === 4) row ++;
    column ++;
  }

  return cells;
}