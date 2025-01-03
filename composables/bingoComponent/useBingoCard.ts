
import type Cell from "~/interfaces/Cell";
import { useBingoTracking } from "./useBingoTracking";


export function useBingoCard(type: string) {

  const { $lstorage, $sStorage } = useNuxtApp();
  
  const bingoCard = ref();
  const storage = (type === "currentCard" ? $sStorage : $lstorage);
  
  watchEffect(() => {
    bingoCard.value = toValue(() => (
      storage.getData(type)
    ));
  });

  const { saveCard, resetCard, updateWins } = useBingoTracking(bingoCard.value);

  // Display markings on marked cells
  // onMounted(() => {
  //   for (let i = 0; i < bingoCard.value.cells.length; i++) {
  //     if (bingoCard.value.cells[i].marked) registerCell(bingoCard.value.cells[i].row, bingoCard.value.cells[i].column);
  //   }
  // });

  useEventListener(window, "lstorage-update", handleCardUpdate);
  useEventListener(window, "sStorage-update", handleCardUpdate);

  type StorageUpdate = {
    key: string,
    value: any,
  }

  function handleCardUpdate({detail}: {detail: StorageUpdate}) {
    if (detail.key === type) {
      bingoCard.value = detail.value || null;
    }
  }

  function markCell(cellIndex: number) {
    // if (bingoCard.value.marked[cellIndex]) { unregisterCell(cellIndex) }
    // else { registerCell(cellIndex) }
    bingoCard.value.marked[cellIndex] = !bingoCard.value.marked[cellIndex];

    const currentCard = getCard();
    setCard({...currentCard, marked: bingoCard.value.marked});

    if (bingoCard.value.saved) saveCard();
  }

  function modifyCell(row: number, column: number, mark: boolean) {
    
    const value = mark ? 1 : -1;

    // TODO: Register or unregister cell

    updateWins();

  }

  function setCard(value: any) {
    storage.setData(type, value);
  }

  function getCard() {
    return storage.getData(type);
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

