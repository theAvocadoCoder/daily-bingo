
<template>
  <div>
    <NuxtLayout :name="$vuetify.display.mdAndUp ? 'desktop' : 'mobile'">
      <v-app>
      <NuxtPage />
    </v-app>
    </NuxtLayout>
  </div>
</template> 
