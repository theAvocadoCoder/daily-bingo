<template>
  <div class="d-flex justify-center gap-5">
    <img ref="starImg" src="~/assets/yellow-star.svg" class="d-none" />
    <canvas class="cursor-pointer" ref="canvas" :width="SCALE" :height="SCALE" @click="markCell"></canvas>
    <div id="system">
      <div id="info">
        <p :class="wins.rows == 5 ? 'win rows' :wins.rows ? '' : 'disabled'">{{ wins.rows == 5 ? "Rows" : `Rows: ${wins.rows}` }}</p>
        <p :class="wins.columns == 5 ? 'win columns' :wins.columns ? '' : 'disabled'">{{ wins.columns == 5 ? "Columns" : `Columns: ${wins.columns}` }}</p>
        <p :class="wins.diagonals == 2 ? 'win diagonals' :wins.diagonals ? '' : 'disabled'">{{ wins.diagonals == 2 ? "Diagonals" : `Diagonals: ${wins.diagonals}` }}</p>
        <p :class="wins.corners ? 'win corners' : 'disabled'">Corners</p>
        <p :class="wins.blackout ? 'win blackout' : 'disabled'">Blackout</p>
      </div>
      <!-- Controls -->
      <div class="w-100">
        <ConfirmDialog
          dialog-button-text="Reset"
          dialog-button-color="light-green-darken-4"
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
</template>

<script setup>
  import {onMounted, onUnmounted, ref} from "vue";
  import bingoCard from "./bingo.json";

  const canvas = ref(null);
  const starImg = ref(null);
  const highlightColor = ref("#6df843");
  const MAXWIDTH = 560;
  const SCALE = ref(300);
  const CELLSIZE = ref((SCALE.value/5));
  const FIRSTRENDER = {value: true};

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

  onMounted(() => { 
    // resetCard();
    drawCard();
    window.onresize = handleResize;
    handleResize();
    FIRSTRENDER.value = false;
  }); 

  onUnmounted(() => { window.removeEventListener('resize', handleResize); });

  function drawCard() {
    if (canvas.value) {
      const ctx = canvas.value.getContext("2d");

      canvas.value.width = SCALE.value;
      canvas.value.height = SCALE.value;
      CELLSIZE.value = SCALE.value / 5;

      ctx.clearRect(0, 0, SCALE.value, SCALE.value);
      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.strokeRect(0, 0, SCALE.value, SCALE.value);
      
      for (let i = 0; i < bingoCard.length; i++) {
        drawCell(ctx, bingoCard[i]);
      }
    }
  }

  function drawCell(ctx, cell) {
    const x = cell.column * CELLSIZE.value,
      y = cell.row * CELLSIZE.value;

    // Draw the highlight if marked
    if (cell.marked) {
      // Register the cell if it's marked and it's the first render
       if (FIRSTRENDER) {registerCell(cell.row, cell.column);}

      ctx.beginPath();
      ctx.fillStyle = highlightColor.value;
      ctx.arc(x + CELLSIZE.value / 2, y + CELLSIZE.value / 2, CELLSIZE.value / 2 - 10, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw the free cell star
    if (cell.row == 2 && cell.column == 2) {
      ctx.drawImage(starImg.value, x + 10, y + 10, CELLSIZE.value - 20, CELLSIZE.value - 20);
    }

    // Draw the cell border
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "black";
    ctx.strokeRect(x, y, CELLSIZE.value, CELLSIZE.value);

    // Draw text
    ctx.fillStyle = 'black';
    ctx.font = SCALE.value > 365 ? '16px Arial' : '12px Arial';
    ctx.textAlign = 'center'; 
    ctx.textBaseline = 'middle';

    // Calculate vertical centering
    const textLines = wrapText(ctx, cell.value, CELLSIZE.value - 10);
    const lineHeight = parseInt(ctx.font, 10) + 2; // Line height based on font size
    const textBlockHeight = textLines.length * lineHeight;
    const textY = y + (CELLSIZE.value - textBlockHeight) / 2 + lineHeight / 2;

    // Draw each line of text
    textLines.forEach((line, index) => {
      ctx.fillText(line, x + CELLSIZE.value / 2, textY + index * lineHeight);
    });
  }

  function wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    let line = '';
    const lines = [];

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && i > 0) {
        lines.push(line);
        line = words[i] + ' ';
      } else {
        line = testLine;
      }
    }

    lines.push(line);
    return lines;
  }

  function markCell(event) {
    const x = event.offsetX;
    const y = event.offsetY;
    const [column, row] = getCellCoords(x, y);
    const cell = bingoCard.find(cell => cell.row == row && cell.column == column);
    // if free cell, don't mark
    if (row == 2 && column == 2) return;

    if (cell.marked) {
      unregisterCell(cell.row, cell.column);
    } else {
      registerCell(cell.row, cell.column);
    }
    cell.marked = !cell.marked;

    drawCard();
  }

  function getCellCoords(x, y) {
    return [
      Math.floor(x / CELLSIZE.value),
      Math.floor(y / CELLSIZE.value)
    ]
  }

  function handleResize () {
    const newWidth = window.innerWidth * 0.9;
    SCALE.value = newWidth > MAXWIDTH ? MAXWIDTH : newWidth;
    setTimeout(()=>drawCard(),300);
  };

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

  function resetCard() {
    for (let i = 1; i <= rows.length; i++) {
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

    for (let i = 0; i < bingoCard.length; i++) {
      bingoCard[i].marked = false;
    }

    drawCard();
  }

</script>
