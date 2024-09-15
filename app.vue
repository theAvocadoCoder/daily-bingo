
<template>
  <div>
    <NuxtLayout class="max-w-screen" :name="$vuetify.display.lgAndUp ? 'desktop' : 'mobile'">
      <!-- <v-app> -->
      <NuxtPage class="h-full p-5 xl:p-10" />
    <!-- </v-app> -->
    </NuxtLayout>
  </div>
</template> 
