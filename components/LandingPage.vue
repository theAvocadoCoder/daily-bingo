<template>
  <div class="h-fit">
    <div class="flex flex-col justify-center items-center">
      <h1 class="text-3xl lg:text-5xl font-bold">Daily Bingo!</h1>
      <p class="italic text-sm">brought to you by <span class="font-medium [font-style:initial]">World of Avocado</span></p>
    </div>

    <div class="flex flex-col justify-center items-center text-center max-w-xl mx-auto py-5 md:py-7 lg:py-10 text-lg gap-5 md:gap-7 lg:gap-10">
      <p class="">
        Bingo cards are a grid of cells with data in them, could be numbers, emojis, names, anything you want!
        <br><br>You play Daily Bingo by generating a bingo card with your choice of data and marking a cell whenever you encounter its contents.
        <br><br>For example, a bingo card cell that has the content, "Black swan" can be marked when you see a black swan, perhaps when you're walking by your neighborhood lake.
      </p>

      <div class="">
        <p class="">Want to see what that's like?</p>
        <p class="">Try one of our <nuxt-link class="text-emerald-600 font-medium" to="/random-card">random bingo cards</nuxt-link></p>
      </div>
    </div>
  </div>
</template>