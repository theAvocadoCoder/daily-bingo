<template>
  <client-only>
    <div class="flex flex-wrap gap-3" v-if="bingoCard.length > 0">
      <div
        class="flex flex-wrap justify-center items-center mx-auto border border-black break-words overflow-hidden"
        style="width: min(85vw,30rem); height: min(85vw,30rem); word-wrap: break-word;"
      >
        <template v-for="(cell, index) in bingoCard">
          <div 
            :id="`${index}`" 
            class="relative flex justify-center items-center text-center cursor-pointer w-1/5 h-1/5 select-none border border-black" 
            style="font-size: clamp(11px, 3svw, 16px); line-height: 1.2em;"
            @click="markCell(cell)"
          >
            <span style="z-index: 2;">{{ cell.value }}</span>
            <template v-if="cell.marked">
              <span
                :class="`absolute rounded-[50%] inset-3`"
                :style="`background-color: ${STATIC.highlightColor};`"
              ></span>
            </template>
            <template v-if="cell.row == 2 && cell.column == 2">
              <img ref="starImg" src="~/assets/yellow-star.svg" class="absolute w-3/4 h-3/4" />
            </template>
          </div>
        </template>
      </div>
      <!-- System div -->
      <div class="flex flex-col justify-between py-2">
        <!-- Info -->
        <div class="flex flex-col justify-center items-start w-full">
          <p :class="`${wins.rows === 5 ? 
            'font-medium text-green-600'
            : rows.filter(c=>c>0).length > 0 ? 'text-amber-500' 
            : 'text-gray-500'} w-full mb-5`"
          >
            Rows:
            <v-progress-linear 
              :model-value="rows.reduce((p,c)=>p+c)/24*100" 
              rounded
              :height="8"
            ></v-progress-linear>
          </p>
          <p :class="`${wins.columns === 5 ? 
            'font-medium text-green-600'
            : columns.filter(c=>c>0).length > 0 ? 'text-amber-500' 
            : 'text-gray-500'} w-full mb-5`"
          >
            Columns: 
            <v-progress-linear 
              :model-value="columns.reduce((p,c)=>p+c)/24*100" 
              rounded
              :height="8"
            ></v-progress-linear>
          </p>
          <p :class="`${wins.diagonals === 2 ? 
            'font-medium text-green-600'
            : fDiagonal + bDiagonal > 0 ? 'text-amber-500' 
            : 'text-gray-500'} w-full mb-5`"
          >
            Diagonals: 
            <v-progress-linear 
              :model-value="(bDiagonal + fDiagonal)/8*100" 
              rounded
              :height="8"
            ></v-progress-linear>
          </p>
          <p :class="`${wins.corners ? 
            'font-medium text-green-600' 
            : corners !== 0 ? 'text-amber-500'
            : 'text-gray-500'} w-full mb-5`"
          >
            Corners: 
            <v-progress-linear 
              :model-value="corners/4*100" 
              rounded
              :height="8"
            ></v-progress-linear>
          </p>
          <p :class="`${wins.blackout ? 
            'font-weight-black text-green-600' 
            : 'text-gray-500'} w-full mb-5`"
          >
            Blackout
          </p>
        </div>
        <!-- Controls -->
        <div class="w-full">
          <ConfirmDialog
            dialog-button-text="Reset"
            dialog-title="Reset Bingo Card?"
            dialog-text="This will clear all your markings from the card."
            :action-buttons="[
              {
                buttonText: 'Reset Bingo Card',
                onClick: resetCard
              },
              {
                buttonText: 'Cancel',
              }
            ]"
          />
        </div>
      </div>
    </div> 
  </client-only>
</template> 

<script setup lang="ts">
  import {onMounted, onUnmounted, ref} from "vue";
  import type Cell from "~/server/interfaces/Cell";
  const { getData, setData } = useNuxtApp().$locally;
  
  const props = defineProps<{
    card: Cell[],
  }>();
  const bingoCard = ref(props.card);

  const STATIC = {
    minWidth: 300,
    maxWidth: 560,
    length: 5,
    highlightColor: "#76FF03", // MDI light-green-accent-3 
    dpr: Math.ceil(window.devicePixelRatio),
  }

  const rows = ref([0,0,0,0,0]);
  const columns = ref([0,0,0,0,0]);
  const fDiagonal = ref(0);
  const bDiagonal = ref(0);
  const corners = ref(0);
  const wins = ref({
    rows: 0,
    columns: 0,
    diagonals: 0,
    corners: 0,
    blackout: 0,
  });

  const fDiagonalStyle = [[0,4],[1,3],[3,1],[4,0]];
  const bDiagonalStyle = [[0,0],[1,1],[3,3],[4,4]];
  const cornersStyle = [[0,0],[0,4],[4,0],[4,4]];
  const winStyle = {
    rows: [5,5,4,5,5],
    columns: [5,5,4,5,5],
    fDiagonal: 4,
    bDiagonal: 4,
    corners: 4,
  };

  let saveCardInterval: ReturnType<typeof setInterval>;

  onMounted(() => {
    for (let i = 0; i < bingoCard.value.length; i++) {
      if (bingoCard.value[i].marked) registerCell(bingoCard.value[i].row, bingoCard.value[i].column);
    }

    saveCardInterval = setInterval(saveCard, 60_000);
  });

  onUnmounted(() => {
    clearInterval(saveCardInterval);
  });

  function markCell(_cell: Cell) {
    const {column, row} = _cell;
    const cell = bingoCard.value.find((cell: Cell) => cell.row == row && cell.column == column) as Cell;
    // if free cell, don't mark
    if (row == 2 && column == 2) return;

    if (cell.marked) {
      unregisterCell(cell.row, cell.column);
    } else {
      registerCell(cell.row, cell.column);
    }
    cell.marked = !cell.marked;
    setData("dailyBingo", {...getData("dailyBingo"), cells: bingoCard.value}, true);
  }
  
  function saveCard () {
    // TODO: write functionality to save card state
  }

  function registerCell(row: number, column: number) {
    modifyCell(row, column, true);
  }

  function unregisterCell(row: number, column: number) {
    modifyCell(row, column, false);
  }

  function modifyCell(row: number, column: number, mark: boolean) {
    const value = mark ? 1 : -1;

    rows.value[row] += value;
    columns.value[column] += value;

    for (let i = 0; i < fDiagonalStyle.length; i++) {
      if (row == fDiagonalStyle[i][0] && column == fDiagonalStyle[i][1]) fDiagonal.value += value;
    }
    for (let i = 0; i < bDiagonalStyle.length; i++) {
      if (row == bDiagonalStyle[i][0] && column == bDiagonalStyle[i][1]) bDiagonal.value += value;
    }
    for (let i = 0; i < cornersStyle.length; i++) {
      if (row == cornersStyle[i][0] && column == cornersStyle[i][1]) corners.value += value;
    }

    updateWins();
  }

  function updateWins() {
    // Check rows
    wins.value.rows = rows.value.filter((row, index) => row == winStyle.rows[index]).length;

    // Check columns
    wins.value.columns = columns.value.filter((column, index) => column == winStyle.columns[index]).length;

    // Check diagonals
    wins.value.diagonals = fDiagonal.value == winStyle.fDiagonal && bDiagonal.value == winStyle.bDiagonal
      ? 2 : fDiagonal.value == winStyle.fDiagonal || bDiagonal.value == winStyle.bDiagonal
      ? 1 : 0;

    // Check corners
    wins.value.corners = corners.value === winStyle.corners ? 1 : 0;

    // Blackout
    if (
      wins.value.rows == 5 &&
      wins.value.columns == 5 &&
      wins.value.diagonals == 2 &&
      wins.value.corners
    ) {wins.value.blackout = 1}
    else {wins.value.blackout = 0}
  }

  function resetCard() {
    for (let i = 0; i <= STATIC.length; i++) {
      rows.value[i] = 0;
      columns.value[i] = 0;
    }

    fDiagonal.value = 0; 
    bDiagonal.value = 0;
    corners.value = 0;
    wins.value.rows = 0;
    wins.value.columns = 0;
    wins.value.diagonals = 0;
    wins.value.corners = 0;
    wins.value.blackout = 0;

    for (let i = 0; i < bingoCard.value.length; i++) {
      bingoCard.value[i].marked = false;
    }

    // drawCard();
  }

</script>
