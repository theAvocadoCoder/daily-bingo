<template>
  <div>
    <canvas ref="canvas" width="500" height="500"></canvas>
  </div>
</template>

<script setup>
  import {ref, onMounted} from "vue";

  const canvas = ref(null);

  onMounted(() => {
    const SCALE = ref(canvas.value.width);
    const ctx = canvas.value.getContext("2d");

    ctx.beginPath();
    ctx.lineWidth = 2.5;
    ctx.moveTo(0,0);
    ctx.lineTo(SCALE.value,0);
    ctx.lineTo(SCALE.value,SCALE.value);
    ctx.lineTo(0,SCALE.value);
    ctx.lineTo(0,0);
    ctx.stroke();

    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.moveTo(SCALE.value/5,0);
    ctx.lineTo(SCALE.value/5,SCALE.value);
    ctx.moveTo(SCALE.value*2/5,0);
    ctx.lineTo(SCALE.value*2/5,SCALE.value);
    ctx.moveTo(SCALE.value*3/5,0);
    ctx.lineTo(SCALE.value*3/5,SCALE.value);
    ctx.moveTo(SCALE.value*4/5,0);
    ctx.lineTo(SCALE.value*4/5,SCALE.value);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0,SCALE.value/5);
    ctx.lineTo(SCALE.value,SCALE.value/5);
    ctx.moveTo(0,SCALE.value*2/5);
    ctx.lineTo(SCALE.value,SCALE.value*2/5);
    ctx.moveTo(0,SCALE.value*3/5);
    ctx.lineTo(SCALE.value,SCALE.value*3/5);
    ctx.moveTo(0,SCALE.value*4/5);
    ctx.lineTo(SCALE.value,SCALE.value*4/5);
    ctx.stroke();
  })
</script>
