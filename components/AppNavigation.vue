<template>
  <v-bottom-navigation 
    :elevation="1" 
    mode="shift" 
    :class="props.position"
    bg-color="teal-lighten-5"
  >
    <nuxt-link to="/groups">
      <v-btn class="text-teal-darken-4" value="groups">
        <v-icon class="text-teal-darken-4">mdi-account-group</v-icon>
        <span>Groups</span>
      </v-btn>
    </nuxt-link>

    <nuxt-link to="/">
      <v-btn class="text-teal-darken-4" value="home">
        <v-icon class="text-teal-darken-4">mdi-home</v-icon>
        <span>Home</span>
      </v-btn>
    </nuxt-link>

    <nuxt-link to="/profile">
      <v-btn class="text-teal-darken-4" value="profile">
        <v-icon class="text-teal-darken-4">mdi-account-circle</v-icon>
        <span>Profile</span>
      </v-btn>
    </nuxt-link>
  </v-bottom-navigation>
</template>

<script setup>
  const props = defineProps(["position"]);
</script>
