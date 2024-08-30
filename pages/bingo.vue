<script setup>
import { ref } from 'vue';
import bingoCard from "./bingo.json";

const SCALE = 5,
  LENGTH = SCALE ** 2;

const card = ref(bingoCard);

const rows = ref([null,0,0,0,0,0]),
  columns = ref([null,0,0,0,0,0]),
  fDiagonal = ref(0),
  bDiagonal = ref(0),
  corners = ref(0),
  wins = ref({
    rows: 0,
    columns: 0,
    diagonals: 0,
    corners: 0,
    blackout: 0,
  });

const fDiagonalStyle = [[1,5],[2,4],[4,2],[5,1]],
  bDiagonalStyle = [[1,1],[2,2],[4,4],[5,5]],
  cornersStyle = [[1,1],[1,5],[5,1],[5,5]],
  winStyle = {
    rows: [null,5,5,4,5,5],
    columns: [null,5,5,4,5,5],
    fDiagonal: 4,
    bDiagonal: 4,
    corners: 4,
  };


function markCell(_cell) {
  if (_cell.id === "r3-cell-3") return

  const cell = card.value[card.value.indexOf(_cell)];

  if (cell.class.includes("selected")) { 
    cell.class = cell.class.replace("selected", "");
    unregisterCell(cell.row, cell.column);
  } else {
    cell.class += " selected";
    registerCell(cell.row, cell.column);
  }
}

function registerCell(row, column) {
  rows.value[row] += 1;
  columns.value[column] += 1;

  for (let i = 0; i < fDiagonalStyle.length; i++) {
    if (row == fDiagonalStyle[i][0] && column == fDiagonalStyle[i][1]) fDiagonal.value += 1;
  }
  for (let i = 0; i < bDiagonalStyle.length; i++) {
    if (row == bDiagonalStyle[i][0] && column == bDiagonalStyle[i][1]) bDiagonal.value += 1;
  }
  for (let i = 0; i < cornersStyle.length; i++) {
    if (row == cornersStyle[i][0] && column == cornersStyle[i][1]) corners.value += 1;
  }

  updateWins();
}

function unregisterCell(row, column) {
  rows.value[row] -= 1;
  columns.value[column] -= 1;

  for (let i = 0; i < fDiagonalStyle.length; i++) {
    if (row == fDiagonalStyle[i][0] && column == fDiagonalStyle[i][1]) fDiagonal.value -= 1;
  }
  for (let i = 0; i < bDiagonalStyle.length; i++) {
    if (row == bDiagonalStyle[i][0] && column == bDiagonalStyle[i][1]) bDiagonal.value -= 1;
  }
  for (let i = 0; i < cornersStyle.length; i++) {
    if (row == cornersStyle[i][0] && column == cornersStyle[i][1]) corners.value -= 1;
  }

  updateWins();
}

function updateWins() {
  // Check rows
  wins.value.rows = rows.value.filter((row, index) => row && row == winStyle.rows[index]).length;

  // Check columns
  wins.value.columns = columns.value.filter((column, index) => column && column == winStyle.columns[index]).length;

  // Check diagonals
  wins.value.diagonals = [fDiagonal.value,bDiagonal.value].filter((diagonal,index) => diagonal == [winStyle.fDiagonal,winStyle.bDiagonal][index]).length;

  // Check corners
  wins.value.corners = [corners.value].filter((corner,index) => corner == [winStyle.corners][index]).length;

  // Blackout
  if (
    wins.value.rows == 5 &&
    wins.value.columns == 5 &&
    wins.value.diagonals == 2 &&
    wins.value.corners
  ) wins.value.blackout = 1;
}

function resetBoard() {
  for (let i = 0; i < LENGTH; i++) {
    card.value[i].class = "cell";
  }
  for (let i = 1; i <= SCALE; i++) {
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
}
  
</script>

<template>
  <main>
    <div id="card">
      <template v-for="cell in card">
        <div :id="cell.id" :class="cell.class" @click="markCell(cell)">
          {{ cell.value }}
        </div>
      </template>
    </div>
    <div id="system">
      <div id="info">
        <p :class="wins.rows == 5 ? 'win rows' :wins.rows ? '' : 'disabled'">{{ wins.rows == 5 ? "Rows" : `Rows: ${wins.rows}` }}</p>
        <p :class="wins.columns == 5 ? 'win columns' :wins.columns ? '' : 'disabled'">{{ wins.columns == 5 ? "Columns" : `Columns: ${wins.columns}` }}</p>
        <p :class="wins.diagonals == 2 ? 'win diagonals' :wins.diagonals ? '' : 'disabled'">{{ wins.diagonals == 2 ? "Diagonals" : `Diagonals: ${wins.diagonals}` }}</p>
        <p :class="wins.corners ? 'win corners' : 'disabled'">Corners</p>
        <p :class="wins.blackout ? 'win blackout' : 'disabled'">Blackout</p>
      </div>
      <div id="controls">
        <button id="reset-btn" @click="resetBoard">Reset</button>
      </div>
    </div>
  </main>
</template>

<style>

  * {
    padding: 0;
    margin: 0;
    box-sizing: border-box;
  }

  main {
    display: flex;
    flex-wrap: wrap;
  }

  #card {
    border: 1px solid black;
    width: min(99vw,30rem);
    height: min(99vw,30rem);
    padding: 0;
    gap: 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    margin-inline: auto;
  }

  .cell {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: .45rem;
    height: 20%;
    width: 20%;
    font-size: calc(.5rem * 1em);
    cursor: pointer;
    user-select: none;
    position: relative;
    border: 1px solid black;

    &:hover::after {
      content: "";
      position: absolute;
      z-index: -1;
      inset: 1rem;
      background-color: #6df843;
      border-radius: 50%;
    }

    &#r3-cell-3 {
      position: relative;

      &:hover::after {
        all: unset;
      }

      &:hover::after, &::after {
        content: url("~/assets/yellow-star.svg");
        position: absolute;
        z-index: -1;
        transform: scale(0.5);
        transform-origin: center center;
      }
    }
  }

  .selected {
    position: relative;

    &::after {
      content: "";
      position: absolute;
      z-index: -1;
      inset: 1rem;
      background-color: #6df843;
      border-radius: 50%;
    }
  }

  #system {
    width: 30%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding-block: .5rem;
  }

  #info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: start;
  }

  /* #controls {
  } */

  #reset-btn {
    background-color: #68ff2c;
    color: #0a010a;
    padding: .5rem 1rem;
    border: none;
    border-radius: .5rem;
    box-shadow: 0px 1px 15px 0px #020c0141;

    &:hover {
      transform: translate(0, .1rem);
      background-color: #55e71b;
      color: #09010c
    }
  }

  .win {
    font-size: 1.5rem;
    font-weight: bold;
  }

  .blackout { color: blue; font-size: 2rem }

  .corners { color: red }
  
  .diagonals { color: purple }

  .rows { color: green }

  .columns { color: orange }

  .disabled {
    color: gray;
  }

</style>
