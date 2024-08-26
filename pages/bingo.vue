<script setup>
import { ref } from 'vue'

const card = ref([
  [
    "green car",
    "man on a bike",
    "fur hat",
    "leaf with 3 holes",
    "your mother's face",
  ],
  [
    "",
    "",
    "",
    "",
    "",
  ],
  [
    "",
    "",
    "",
    "",
    "",
  ],
  [
    "",
    "",
    "",
    "",
    "",
  ],
  [
    "",
    "",
    "",
    "",
    "",
  ],
]);

function markCell(cellId) {
}

function unMarkCell() {
  squares.value.splice(selectedIndex.value, 1);
}
  
</script>

<template>
  <div id="card">
    <template v-for="row,rowid in card">
      <div :id="'row-'+(rowid+1)" class="row">
        <template v-for="cell,cellid in row">
          <div :id="'r'+(rowid+1)+'-cell-'+(cellid+1)" class="cell" @click="markCell(cellid)">
            {{ cell }}
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<style>
  .row {
    display: flex;
  }
  .cell {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    height: 100px;
    width: 100px;
  }
</style>
