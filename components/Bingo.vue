<template>
  <div class="flex flex-wrap justify-center lg:justify-evenly xl:justify-center gap-3 sm:gap-5 md:gap-7 lg:gap-0 xl:gap-10 w-full">
    <div>
      <!-- Bingo container -->
      <div class="bg-lime-700 grid grid-cols-1 grid-rows-11 w-[min(85vw,30rem)] h-fit rounded-3xl sm:rounded-[2rem] lg:rounded-[3rem] mx-auto border-2 md:border-4 border-lime-700">
        <h1 class="row-span-1 flex items-center justify-center text-xl font-bold md:text-2xl text-stone-50">
          {{ type === "dailyBingo" ? "DAILY BINGO" : "BINGO" }}
        </h1>
        <!-- Card -->
        <div
          class="row-[2/-1] grid grid-cols-5 grid-rows-5 gap-0 p-0 w-full aspect-square overflow-hidden bg-stone-50 rounded-2xl sm:rounded-[1.5rem] lg:rounded-[2.5rem]"
          style="word-wrap: break-word;"
        >
          <!-- Cells -->
          <div 
            v-for="(cell, index) in bingoCard.cells"
            :id="`${index}`" 
            :class="
              `grid [&_*]:[grid-row:1] [&_*]:[grid-column:1] \
              [&_*]:my-auto [&_*]:mx-auto \
              ${cell.column?'-m-[1px]':'-m-[1px]'} \
              w-full aspect-square cursor-pointer \
              border border-black overflow-hidden \
              ${cell.column % 5 == 4?'border-r-transparent':''} \
              ${cell.column % 5 == 0?'border-l-transparent':''} \
              ${cell.row % 5 == 0?'border-t-transparent':''} \
              ${cell.row % 5 == 4?'border-b-transparent':''} `
            " 
            style="font-size: clamp(10px, 1.5svw, 14px); line-height: 1.2em;"
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
            <span class="text-center select-none break-words inset-2 h-fit w-fit">{{ 
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
              buttonText: 'Cancel',
            },
            {
              buttonText: 'Reset Bingo Card',
              onClick: resetCard
            },
          ]"
        />
        <ConfirmDialog
          v-if="!cardIsSaved"
          dialog-button-text="Save"
          dialog-title="Save Bingo Card?"
          :action-buttons="[
            {
              buttonText: 'Cancel',
            },
            {
              buttonText: 'Save Bingo Card',
              onClick: saveCard
            },
          ]"
        >
          <v-text-field
            v-if="!cardIsSaved"
            class="min-w-32 m-0"
            v-model="cardName"
            :placeholder="cardName"
            label="Card Name"
            variant="underlined"
          ></v-text-field>
        </ConfirmDialog>
      </div>
    </div>
    <!-- System div -->
    <div class="flex flex-col justify-between py-5 w-[max(80%,4rem)] md:max-w-56 lg:max-w-40 lg:!w-full xl:max-w-64">
      <!-- Stats -->
      <div class="flex flex-col justify-center items-start w-full">
        <p v-for="stat in wins" :key="stat.name" :class="
          `${stat.value == stat.winCheck ? 
          'font-bold text-lime-500'
          : stat.notEmpty ? 'text-amber-500' 
          : 'text-gray-400'} w-full mb-5`"
        >
          {{stat.name.toLocaleUpperCase()}}:
          <v-progress-linear 
            v-if="stat.progressValue != undefined"
            :model-value="stat.progressValue" 
            rounded
            :height="8"
          ></v-progress-linear>
        </p>
      </div>
    </div>
  </div>
</template> 

<script setup lang="ts">
  import type Card from "~/interfaces/Card";
  import type Cell from "~/interfaces/Cell";
  import type User from "~/interfaces/User";
  const { getData, setData } = useNuxtApp().$locally;
  const {$toast} = useNuxtApp();
  const { data, getSession } = useAuth();
  
  // TODO: figure out how to refactor this component so it doesn't modify the props unless via the parent
  const props = defineProps<{
    card: Card,
    type?: string,
    saved?: boolean,
  }>();

  const sessionUser = computed(() => data.value?.user as User);
  const cardIsSaved = computed(() => props.saved ? props.saved : getData(props.type as string).saved);
  const _id = computed(() => getData(props.type as string)._id);
  const bingoCard = ref(props.card as Card);

  const cardName = props.type == "dailyBingo" ?
    ref('Daily Bingo') :
    ref(`My Bingo #${Math.ceil(Math.random()*1000)}`);

  const STATIC = {
    length: 25,
    scale: 5,
    highlightColor: "#76FF03", // MDI light-green-accent-3
  }

  type Stat = {
      name: string,
      value: number,
      progressValue?: number,
      winCheck: number,
      notEmpty: boolean,
  }

  interface Wins  {
    [x: string]: Stat
  }

  const rows = ref([0,0,0,0,0]);
  const columns = ref([0,0,0,0,0]);
  const fDiagonal = ref(0);
  const bDiagonal = ref(0);
  const corners = ref(0);
  const wins = computed<Wins>(() => ({
    rows: {
      name: "rows",
      value: 0,
      progressValue: rows.value.reduce((p,c)=>p+c)/24*100,
      winCheck: 5,
      notEmpty: rows.value.filter(c=>c>0).length > 0,
    },
    columns: {
      name: "columns",
      value: 0,
      progressValue: columns.value.reduce((p,c)=>p+c)/24*100,
      winCheck: 5,
      notEmpty: columns.value.filter(c=>c>0).length > 0,
    },
    diagonals: {
      name: "diagonals",
      value: 0,
      progressValue: (bDiagonal.value + fDiagonal.value)/8*100,
      winCheck: 2,
      notEmpty: fDiagonal.value + bDiagonal.value > 0,
    },
    corners: {
      name: "corners",
      value: 0,
      progressValue: corners.value/4*100,
      winCheck: 1,
      notEmpty: corners.value !== 0,
    },
    blackout: {
      name: "blackout",
      value: 0,
      winCheck: 1,
      notEmpty: false,
    },
  }));

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

  onMounted(() => {
    for (let i = 0; i < bingoCard.value.cells.length; i++) {
      if (bingoCard.value.cells[i].marked) registerCell(bingoCard.value.cells[i].row, bingoCard.value.cells[i].column);
    }
  });

  function markCell(_cell: Cell) {
    const {column, row} = _cell;
    const cell = bingoCard.value.cells.find((cell: Cell) => cell.row == row && cell.column == column) as Cell;
    // if free cell, don't mark
    if (row == 2 && column == 2) return;

    if (cell.marked) {
      unregisterCell(cell.row, cell.column);
    } else {
      registerCell(cell.row, cell.column);
    }
    cell.marked = !cell.marked;
    if (cardIsSaved.value) {
      saveCard();
    }
  }
  
  async function saveCard () {
    const currentCard = getData(props.type as string);
    if (!cardIsSaved.value) {
      // If the daily card hasn't been saved before, create it, then attach to user
      await $fetch<Card>("/api/cards/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cells: bingoCard.value.cells,
          creator: {
            user_id: props.type === "dailyBingo" ? null : `${sessionUser.value?._id}`,
            username: props.type === "dailyBingo" ? "Daily Bingo" : `@${sessionUser.value?.username}`,
          },
          name: cardName.value,
        }),
      }).then(async (newCard) => {
        await $fetch(`/api/users/${sessionUser.value._id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: newCard?._id,
            operation: "cards-insert",
          }),
        });
        setData(props.type as string, {...currentCard, cells: bingoCard.value.cells, saved: true, _id: newCard?._id}, true);
      });
      // @ts-expect-error
      await getSession(true);
      setData("bingoUser", sessionUser.value, true);
      $toast.success(`${cardName.value} saved`);
    } else {
      // If the card exists, update it in DB
      await $fetch(`/api/cards/${_id.value}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          card: {
            cells: bingoCard.value.cells,
          }
        })
      });
    }
    setData(props.type as string, {...currentCard, cells: bingoCard.value.cells}, true);
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
    wins.value.rows.value = rows.value.filter((row, index) => row == winStyle.rows[index]).length;

    // Check columns
    wins.value.columns.value = columns.value.filter((column, index) => column == winStyle.columns[index]).length;

    // Check diagonals
    wins.value.diagonals.value = fDiagonal.value == winStyle.fDiagonal && bDiagonal.value == winStyle.bDiagonal
      ? 2 : fDiagonal.value == winStyle.fDiagonal || bDiagonal.value == winStyle.bDiagonal
      ? 1 : 0;

    // Check corners
    wins.value.corners.value = corners.value === winStyle.corners ? 1 : 0;

    // Blackout
    if (
      wins.value.rows.value == 5 &&
      wins.value.columns.value == 5 &&
      wins.value.diagonals.value == 2 &&
      wins.value.corners.value
    ) {wins.value.blackout.value = 1}
    else {wins.value.blackout.value = 0}
  }

  function resetCard() {
    for (let i = 0; i <= STATIC.scale; i++) {
      rows.value[i] = 0;
      columns.value[i] = 0;
    }

    fDiagonal.value = 0; 
    bDiagonal.value = 0;
    corners.value = 0;
    wins.value.rows.value = 0;
    wins.value.columns.value = 0;
    wins.value.diagonals.value = 0;
    wins.value.corners.value = 0;
    wins.value.blackout.value = 0;

    for (let i = 0; i < bingoCard.value.cells.length; i++) {
      bingoCard.value.cells[i].marked = false;
    }

    const currentCard = getData(props.type as string);
    setData(props.type as string, {...currentCard, cells: bingoCard.value.cells}, true);

    if (cardIsSaved.value) {
      saveCard();
    }
  }

</script>
