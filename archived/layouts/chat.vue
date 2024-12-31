<template>
  <v-layout>
    <div class="relative h-full w-screen flex flex-col bg-zinc-300">
      <v-app-bar
        class="!fixed !top-0 !bg-stone-950 !text-stone-50 !px-5 !w-full [&>*:first-child]:!overflow-visible"
        prominent
      >
        <v-btn tag="nuxt-link" to="/groups" prepend-icon="mdi-arrow-left" class="!w-fit !h-fit !p-3">
          <slot name="avatar"></slot>
        </v-btn>

        <v-app-bar-title @click="groupDetailsDialog = true">
          <slot name="groupName"></slot>
        </v-app-bar-title>

        <v-dialog
          v-model="groupDetailsDialog"
          transition="dialog-top-transition"
          fullscreen
        >

          <v-card>
            <v-toolbar>
              <v-btn
                icon="mdi-close"
                @click="groupDetailsDialog = false"
              ></v-btn>

              <v-toolbar-title>
                <slot name="groupName"></slot>
              </v-toolbar-title>

              <v-spacer></v-spacer>

              <v-toolbar-items>
                <v-btn
                  text="Save"
                  variant="text"
                  @click="groupDetailsDialog = false"
                ></v-btn>
              </v-toolbar-items>
            </v-toolbar>

            <!-- <RouterView> -->
              <!-- <slot name="details"></slot> -->
              <NuxtPage />
            <!-- </RouterView> -->
          </v-card>
        </v-dialog>

        <v-spacer></v-spacer>
      </v-app-bar>

      <slot name="main"></slot>
    </div>
  </v-layout>
</template>

<script setup lang="ts">
  const groupDetailsDialog = ref(false);
</script>
