import type Card from "~/interfaces/Card";
import type Cell from "~/interfaces/Cell";
import { useBingoTracking } from "./useBingoTracking";
import type { ComputedGetter } from "vue";


export function useBingoCard(card: ComputedGetter<Card>) {
  const bingoCard = ref();

  watchEffect(() => {
   bingoCard.value = toValue(card);
  })

  const { $storage } = useNuxtApp();
  const { saveCard, resetCard, updateWins } = useBingoTracking(bingoCard.value);
  const cardType = bingoCard.value.creator.user_id === null ? "dailyBingo" : "currentCard";

  // Display markings on marked cells
  onMounted(() => {
    for (let i = 0; i < bingoCard.value.cells.length; i++) {
      if (bingoCard.value.cells[i].marked) registerCell(bingoCard.value.cells[i].row, bingoCard.value.cells[i].column);
    }
  });

  function markCell(_cell: Cell) {
    const {column, row} = _cell;
    const cell = bingoCard.value.cells.find((cell: Cell) => cell.row == row && cell.column == column) as Cell;

    if (cell.marked) { unregisterCell(cell.row, cell.column) }
    else { registerCell(cell.row, cell.column) }
    cell.marked = !cell.marked;

    const currentCard = $storage.getData(cardType);
    $storage.setData(cardType, {...currentCard, cells: bingoCard.value.cells}, true);

    if (bingoCard.value.saved) saveCard();
  }

  function modifyCell(row: number, column: number, mark: boolean) {
    
    const value = mark ? 1 : -1;

    // TODO: Register or unregister cell

    updateWins();

  }

  function registerCell(row: number, column: number)
  { modifyCell(row, column, true) }

  function unregisterCell(row: number, column: number)
  { modifyCell(row, column, false) }

  return {
    markCell,
    registerCell,
    unregisterCell,
    saveCard,
    resetCard,
    updateWins,
    bingoCard,
  }
  
}

