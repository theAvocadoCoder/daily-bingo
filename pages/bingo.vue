<script setup>
import { ref } from 'vue';
import bingoCard from "./bingo.json"

const card = ref(bingoCard);

const rows = ref([null,[],[],[],[],[]]),
columns = ref([null,[],[],[],[],[]]),
fDiagonal = ref([]),
bDiagonal = ref([]);

function markCell(row,cellId) {
  const cellIndex = card.value[row].indexOf(card.value[row].filter(c=>c.id===cellId)[0]);
  const cell = card.value[row][cellIndex];
  if (cellId !== "r3-cell-3") cell.class.includes("selected") 
    ? cell.class = cell.class.replace("selected", "") 
    : cell.class += " selected";
}
  
</script>

<template>
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
</template>

<style>
  #card {
    border: 1px solid black;
    width: min(99%,35rem);
    height: min(90%,35rem);
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
    flex: 1;

    &:not(:last-child) {
      border-bottom: 1px solid black;
    }
  }
  .cell {
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: .5rem;
    flex: 1;
    height: 100px;
    width: 100px;
    font-size: .75rem;
    cursor: pointer;
    user-select: none;

    &:not(:last-child) {
      border-right: 1px solid black;
    }

    &:hover {
      background-color: #00ccfe3d;
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
