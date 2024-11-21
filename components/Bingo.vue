<template>
  <div class="flex flex-wrap justify-center lg:justify-evenly xl:justify-center gap-3 sm:gap-5 md:gap-7 lg:gap-0 xl:gap-10 w-full">
    <div>
      <!-- Bingo container -->
      <div class="bg-lime-700 p-[5px] sm:p-2 flex flex-col justify-center items-center w-[min(85vw,30rem)] h-fit mx-auto border-2 md:border-4 border-lime-700 rounded-[2.5rem] sm:rounded-[3rem] lg:rounded-[3.5rem]">
        <h1 class="row-span-1 my-1 sm:my-2 md:my-3 flex items-center justify-center text-xl font-bold md:text-2xl text-stone-50">
          {{ type === "dailyBingo" ? "DAILY BINGO" : "BINGO" }}
        </h1>
        <!-- Card -->
        <div
          class="grid grid-cols-5 grid-rows-5 gap-0.5 sm:gap-1 p-0 w-full aspect-square overflow-hidden rounded-[2rem] rounded-t-3xl sm:rounded-[2.5rem] lg:rounded-[3rem]"
          style="word-wrap: break-word;"
        >
          <!-- Cells -->
          <div v-for="(cell, index) in bingoCard.cells"
            @click="markCell(cell)" :id="`${index}`" style="font-size: clamp(10px, 1.5svw, 14px); line-height: 1.2em;"
            :class="`grid [&_*]:[grid-area:1/1] [&_*]:my-auto [&_*]:mx-auto bg-stone-50 w-full aspect-square cursor-pointer overflow-hidden px-0.5`" 
          >
            <!-- Mark -->
            <span v-if="cell.marked" :class="`rounded-[50%] w-3/4 h-3/4`" :style="`background-color: #76FF03`"></span>
            <!-- Star -->
            <img v-if="cell.row == 2 && cell.column == 2 && !cell.marked"
              ref="starImg" src="~/assets/yellow-star.svg" class="w-3/4 h-3/4"
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
          dialog-button-text="Reset" dialog-title="Reset Bingo Card?" dialog-text="This will clear all your markings from the card."
          :action-buttons="[
            {  buttonText: 'Cancel' },
            { buttonText: 'Reset Bingo Card', onClick: resetCard },
          ]"
        />
        <SignedIn>
          <ConfirmDialog
            v-if="!cardIsSaved"
            dialog-button-text="Save" dialog-title="Save Bingo Card?"
            :action-buttons="[
              { buttonText: 'Cancel' },
              { buttonText: 'Save Bingo Card', onClick: () => saveCard(cardName) },
            ]"
          >
            <v-text-field
              v-if="!cardIsSaved && ownCard"
              v-model="cardName"
              class="min-w-32 m-0" :placeholder="cardName" label="Card Name" variant="underlined"
            ></v-text-field>

            <p v-else><span class="font-bold">{{ cardName }}</span> by <span class="italic">{{ `${bingoCard.creator.user_id ? "@" : ""}${bingoCard.creator.username}` }}</span></p>
          </ConfirmDialog>
        </SignedIn>
        <SignedOut>
          <div class="text-center p-4">
            <v-btn tag="nuxt-link" to="/sign-in" class="!bg-lime-700 !text-stone-50">Save</v-btn>
          </div>
        </SignedOut>
      </div>
    </div>
    <!-- System div -->
    <div class="flex flex-col justify-between py-5 w-[max(80%,4rem)] md:max-w-56 lg:max-w-40 lg:!w-full xl:max-w-64">
      <!-- Stats -->
      <div class="flex flex-col justify-center items-start w-full">
        <!-- TODO: Display new stats -->
      </div>
    </div>
  </div>
</template> 

<script setup lang="ts">
  const {$lstorage} = useNuxtApp();
  
  const props = defineProps<{
    type: string,
    saved?: boolean,
  }>();

  const {
    markCell, saveCard, resetCard, bingoCard
  } = useBingoCard(props.type);

  const cardIsSaved = computed(() => bingoCard.value.saved);
  const cardName = ref(`${bingoCard.value.name}`);
  const sessionUser = computed(() => $lstorage.getData("bingoUser"));
  const ownCard = (
    bingoCard.value.creator.user_id === sessionUser.value._id
    || bingoCard.value.creator.user_id === null
  )

</script>
