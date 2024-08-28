<script setup>
import { ref } from 'vue';
import bingoCard from "./bingo.json"

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
    blackout: 0
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


function markCell(row,cellId) {
  if (cellId === "r3-cell-3") return
  const cellIndex = card.value[row].indexOf(card.value[row].filter(c=>c.id===cellId)[0]);
  const cell = card.value[row][cellIndex];
  if (cell.class.includes("selected")) { 
    cell.class = cell.class.replace("selected", "");
    unregisterCell(cell.row, cell.column);
  } else {
    cell.class += " selected";
    registerCell(cell.row, cell.column);
  }
}

function registerCell() {

}

function unregisterCell(row, column) {
  rows[row] --;
  columns[column] --;
  for (style in fDiagonalStyle) {
    if (row == style[0] && column == style[1]) fDiagonal--
  }
  for (style in bDiagonalStyle) {
    if (row == style[0] && column == style[1]) bDiagonal--
  }
  for (style in cornersStyle) {
    if (row == style[0] && column == style[1]) corners--
  }
}
  
</script>

<template>
  <main>
    <div id="card">
      <template v-for="row,rowid in card">
        <div :id="'row-'+(rowid+1)" class="row">
          <template v-for="cell in row">
            <div :id="cell.id" :class="cell.class" @click="markCell(cell.row - 1,cell.id)">
              {{ cell.value }}
            </div>
          </template>
        </div>
      </template>
    </div>
    <div id="info">
      I show up
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
    width: min(99vw,20rem);
    height: min(99vw,20rem);
    padding: 0;
    gap: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: stretch;
    margin-inline: auto;
  }

  .row {
    display: flex;
    height: 20%;

    &:not(:last-child) {
      border-bottom: 1px solid black;
    }
  }
  .cell {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: .45rem;
    flex: 1;
    height: 4rem;
    width: 4rem;
    font-size: .45rem;
    cursor: pointer;
    user-select: none;
    position: relative;

    &:not(:last-child) {
      border-right: 1px solid black;
    }

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

      &::before, &::after, &:hover::after {
        content: "";
        position: absolute;
        z-index: -1;
        inset: 0.9rem;
        border-left: 1.05rem solid transparent;
        border-right: 1.05rem solid transparent;
      }

      &::before {
        bottom: 1.5rem;
        border-bottom: 1.5rem solid #6df843;
      }

      &::after, &:hover::after {
        top: 1.5rem;
        border-top: 1.5rem solid #6df843;
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
</style>
