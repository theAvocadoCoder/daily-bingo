<template>
  <div class="d-flex justify-center">
    <canvas ref="canvas" :width="SCALE" :height="SCALE" @click="handleClick"></canvas>
    <input type="color" :value="highlightColor" @change="changeHighlightColor">
  </div>
</template>

<script setup>
  import {onMounted, onUnmounted, ref} from "vue";
  import bingoCard from "./bingo.json";

  const canvas = ref(null);
  const highlightColor = ref("#6df843");
  const MAXWIDTH = 600;
  const SCALE = ref(MAXWIDTH);
  const CELLSIZE = ref((SCALE.value/5));

  // onMounted(() => {
  //   window.onresize = handleResize;
  //   handleResize();
  //   drawCard();
  // });

  // onUnmounted(() => {
  //   window.removeEventListener('resize', handleResize);
  // });

  function drawCard() {
    if (canvas.value) {
      const ctx = canvas.value.getContext("2d");

      canvas.value.width = SCALE.value;
      canvas.value.height = SCALE.value;
      CELLSIZE.value = SCALE.value / 5;

      ctx.clearRect(0, 0, SCALE.value, SCALE.value);

      for (let i = 0; i < bingoCard.length; i++) {
        drawCell(ctx, bingoCard[i]);
      }
    }
  }

  function drawCell(ctx, cell) {
    // const ctx = canvas.value.getContext("2d");
    const x = (cell.row - 1) * CELLSIZE.value,
      y = (cell.column - 1) * CELLSIZE.value;

    // Draw the highlight if marked
    if (cell.marked) {
      ctx.beginPath();
      ctx.fillStyle = highlightColor.value;
      ctx.arc(x + CELLSIZE.value / 2, y + CELLSIZE.value / 2, CELLSIZE.value / 2 - 10, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw the cell border
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.strokeRect(x, y, CELLSIZE.value, CELLSIZE.value);

    // Draw text
    ctx.fillStyle = 'black';
    ctx.font = '.5rem Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(cell.value, x + CELLSIZE.value / 2, y + CELLSIZE.value / 2);
  }

  function changeHighlightColor(event) {
    highlightColor.value = event.target.value;
    event.target.blur();
  }

  function handleClick(event) {
    const x = event.offsetX;
    const y = event.offsetY;
    const [row, column] = getCellCoords(x, y);
    const cell = bingoCard.find(cell => cell.row == row && cell.column == column);
    
    if (row == 3 && column == 3) return;
    cell.marked = !cell.marked;

    drawCard();
  }

  function getCellCoords(x, y) {
    return [
      Math.ceil(x / CELLSIZE.value),
      Math.ceil(y / CELLSIZE.value)
    ]
  }

  function handleResize () {
    const newWidth = window.innerWidth * 0.9;
    SCALE.value = newWidth > MAXWIDTH ? MAXWIDTH : newWidth;
    drawCard();
  };

</script>
