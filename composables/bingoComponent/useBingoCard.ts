
import type Cell from "~/interfaces/Cell";
import { useBingoTracking } from "./useBingoTracking";


export function useBingoCard(type: string) {

  const { $storage } = useNuxtApp();
  
  const bingoCard = ref();
  watchEffect(() => {
    bingoCard.value = toValue(() => $storage.getData(type));
  });

  const { saveCard, resetCard, updateWins } = useBingoTracking(bingoCard.value);
  const cardType = bingoCard.value.creator.user_id === null ? "dailyBingo" : "currentCard";

  // Display markings on marked cells
  onMounted(() => {
    for (let i = 0; i < bingoCard.value.cells.length; i++) {
      if (bingoCard.value.cells[i].marked) registerCell(bingoCard.value.cells[i].row, bingoCard.value.cells[i].column);
    }
  });

  useEventListener(window, "storage-update", handleCardUpdate);

  type StorageUpdate = {
    key: string,
    value: any,
  }

  function handleCardUpdate({detail}: {detail: StorageUpdate}) {
    if (detail.key === type) {
      bingoCard.value = detail.value || null;
    }
  }

  function markCell(_cell: Cell) {
    const {column, row} = _cell;
    const cell = bingoCard.value.cells.find((cell: Cell) => cell.row == row && cell.column == column) as Cell;

    if (cell.marked) { unregisterCell(cell.row, cell.column) }
    else { registerCell(cell.row, cell.column) }
    cell.marked = !cell.marked;

    const currentCard = $storage.getData(cardType);
    $storage.setData(cardType, {...currentCard, cells: bingoCard.value.cells});

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

