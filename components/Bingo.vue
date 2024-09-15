<template>
  <client-only>
    <div class="flex flex-wrap justify-center lg:justify-evenly xl:justify-center gap-3 sm:gap-5 md:gap-7 lg:gap-0 xl:gap-10 w-full">
      <div>
        <!-- Bingo container -->
        <div class="bg-lime-700 grid grid-cols-1 grid-rows-11 w-[min(85vw,30rem)] h-fit rounded-2xl sm:rounded-3xl lg:rounded-4xl mx-auto border-2 md:border-4 border-lime-700">
          <h1 class="row-span-1 flex items-center justify-center text-xl font-bold md:text-2xl text-stone-50">
            Daily Bingo
          </h1>
          <!-- Card -->
          <div
            class="row-[2/-1] grid grid-cols-5 grid-rows-5 gap-0 p-0 w-full aspect-square overflow-hidden bg-stone-50 rounded-2xl sm:rounded-3xl lg:rounded-4xl"
            style="word-wrap: break-word;"
          >
            <!-- Cells -->
            <div 
              v-for="(cell, index) in bingoCard"
              :id="`${index}`" 
              :class="
                `grid [&_*]:[grid-row:1] [&_*]:[grid-column:1] \
                [&_*]:my-auto [&_*]:mx-auto \
                p-1 ${cell.column?'-m-[1px]':'-m-[1px]'} \
                w-full aspect-square cursor-pointer \
                border border-black overflow-hidden \
                ${cell.column % 5 == 4?'border-r-transparent':''} \
                ${cell.column % 5 == 0?'border-l-transparent':''} \
                ${cell.row % 5 == 0?'border-t-transparent':''} \
                ${cell.row % 5 == 4?'border-b-transparent':''} `
              " 
              style="font-size: clamp(10px, 2svw, 16px); line-height: 1.2em;"
              @click="markCell(cell)"
            >
              <!-- Mark -->
              <span
                v-if="cell.marked"defaultCard.value
                :class="`rounded-[50%] w-3/4 h-3/4`"
                :style="`background-color: ${STATIC.highlightColor}`"
              ></span>
              <!-- Star -->
              <img 
                v-if="cell.row == 2 && cell.column == 2"
                ref="starImg"
                src="~/assets/yellow-star.svg"
                class="w-3/4 h-3/4"
              />
              <!-- Text -->
              <span class="text-center select-none break-words">{{ 
                cell.row == 2 && cell.column == 2 ? 'FREE' : cell.value 
              }}</span>
            </div>
          </div>
        </div>
        <!-- Controls -->
        <div class="w-full flex justify-evenly">
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
          <ConfirmDialog
            dialog-button-text="Save"
            dialog-title="Save Bingo Card?"
            dialog-text="This will save the card to your collection."
            :action-buttons="[
              {
                buttonText: 'Save Bingo Card',
                onClick: saveCard
              },
              {
                buttonText: 'Cancel',
              }
            ]"
          />
        </div>
      </div>
      <!-- System div -->
      <div class="flex flex-col justify-between py-5 w-[max(80%,4rem)] md:max-w-56 lg:max-w-40 lg:!w-full xl:max-w-64">
        <!-- Stats -->
        <div class="flex flex-col justify-center items-start w-full">
          <p :class="
            `${wins.rows === 5 ? 
            'font-bold text-lime-500'
            : rows.filter(c=>c>0).length > 0 ? 'text-amber-500' 
            : 'text-gray-400'} w-full mb-5`"
          >
            Rows:
            <v-progress-linear 
              :model-value="rows.reduce((p,c)=>p+c)/24*100" 
              rounded
              :height="8"
            ></v-progress-linear>
          </p>
          <p :class="`${wins.columns === 5 ? 
            'font-bold text-lime-500'
            : columns.filter(c=>c>0).length > 0 ? 'text-amber-500' 
            : 'text-gray-400'} w-full mb-5`"
          >
            Columns: 
            <v-progress-linear 
              :model-value="columns.reduce((p,c)=>p+c)/24*100" 
              rounded
              :height="8"
            ></v-progress-linear>
          </p>
          <p :class="`${wins.diagonals === 2 ? 
            'font-bold text-lime-500'
            : fDiagonal + bDiagonal > 0 ? 'text-amber-500' 
            : 'text-gray-400'} w-full mb-5`"
          >
            Diagonals: 
            <v-progress-linear 
              :model-value="(bDiagonal + fDiagonal)/8*100" 
              rounded
              :height="8"
            ></v-progress-linear>
          </p>
          <p :class="`${wins.corners ? 
            'font-bold text-lime-500' 
            : corners !== 0 ? 'text-amber-500'
            : 'text-gray-400'} w-full mb-5`"
          >
            Corners: 
            <v-progress-linear 
              :model-value="corners/4*100" 
              rounded
              :height="8"
            ></v-progress-linear>
          </p>
          <p :class="`${wins.blackout ? 
            'font-weightbold text-lime-500' 
            : 'text-gray-400'} w-full mb-5`"
          >
            Blackout
          </p>
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
    card?: Cell[],
  }>();
  // const defaultCard = ref<Cell[]>([]);
  // for (let index = 0; index < 25; index++){
  //   defaultCard.value.push({ marked: false, value: "", column: index % 5, row: Math.floor(index / 5)});
  // }
  const bingoCard = ref(props.card as Cell[]);

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
