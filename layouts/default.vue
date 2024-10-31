<template>
  <v-layout>
    <v-app-bar
      class="!bg-stone-950 !text-stone-50 !px-5 !w-full [&>*:first-child]:!overflow-visible"
      prominent
    >
      <v-app-bar-nav-icon variant="text">
        <nuxt-link :to="data ? '/daily-card' : '/'" class="text-2xl">DB</nuxt-link>
      </v-app-bar-nav-icon>

      <v-spacer></v-spacer>

      <v-btn v-if="data" @click="toggleMenu" append-icon="mdi-chevron-down" class="!w-fit !h-fit !p-3">
        <v-avatar icon="mdi-account" :image="sessionUser?.picture"></v-avatar>
      </v-btn>
      <ul
        tabindex="0"
        ref="menuRef"
        @focusout="handleFocusOut"
        :class="`absolute z-10 ${menuIsOpen ? 'flex' : 'hidden'} flex-col gap-4 items-center justify-center top-[calc(100%+.5rem)] right-0 w-fit h-fit p-4 rounded-sm lg:rounded-lg shadow-sm !bg-zinc-900 !text-slate-50 `"  
      >
        <li>
          <v-btn tabindex="0" tag="nuxt-link" to="/profile" prepend-icon="mdi-account" variant="text" text="Profile"></v-btn>
        </li>

        <li>
          <v-btn tabindex="0" tag="nuxt-link" to="/auth/signout" prepend-icon="mdi-logout" variant="text" text="Sign out"></v-btn>
        </li>
      </ul>
        
      <nuxt-link v-if="!data" to="/auth/signin">
        <v-btn append-icon="mdi-login" variant="text" text="Sign in"></v-btn>
      </nuxt-link>
    </v-app-bar>

    <v-navigation-drawer
      v-if="data && $vuetify.display.lgAndUp"
      permanent
      class="!bg-stone-800 !text-stone-50"
    >
      <v-list>
        <v-list-item
          tag="nuxt-link"
          to="/profile"
          :prepend-avatar="sessionUser?.picture"
          :subtitle="`@${sessionUser?.username}`"
          :title="sessionUser?.display_name || sessionUser?.name.toLocaleUpperCase()"
        ></v-list-item>
      </v-list>

      <v-divider></v-divider>

      <v-list density="compact" nav>
        <v-list-item
          v-for="(item) in navItems"
          tag="nuxt-link"
          :to="item.to"
          :active="item.to == path"
          :prepend-icon="item.icon"
          :value="item.value"
        >
          <v-list-item-title>{{ item.value.toLocaleUpperCase() }}</v-list-item-title>
        </v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="p-5">
          <v-btn
            block
            tag="nuxt-link"
            to="/auth/signout"
            append-icon="mdi-logout"
            text="Sign out"
          ></v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <v-main class="">
      <v-app class="!h-full p-5 xl:p-10 !bg-lime-50">
        <slot />
      </v-app>
    </v-main>

    <v-bottom-navigation
      v-if="data && !$vuetify.display.lgAndUp"
      mode="shift"
      class="!bg-stone-950 fixed bottom-0 !w-full"
    >
      <v-btn 
        v-for="(item) in navItems"
        tag="nuxt-link"
        :to="item.to"
        class="!text-stone-50" 
        :value="item.value"
      >
        <v-icon>{{ item.icon }}</v-icon>
        <span>{{ item.value.toLocaleUpperCase() }}</span>
      </v-btn>
    </v-bottom-navigation>
  </v-layout>
</template>

<script setup lang="ts">
  import type User from "~/interfaces/User";
  const navItems = [
    {
      "to": "/groups",
      "icon": "mdi-account-group",
      "value": "groups",
      "bg": "!bg-lime-50"
    },
    {
      "to": "/daily-card",
      "icon": "mdi-home",
      "value": "home",
      "bg": "!bg-lime-50"
    },
    {
      "to": "/cards",
      "icon": "mdi-star",
      "value": "cards",
      "bg": "!bg-lime-50"
    }
  ];

  const menuIsOpen = ref(false);
  const menuRef = ref<HTMLUListElement>();

  const { data } = useAuth();
  const { $storage } = useNuxtApp();

  const path = computed(() => useRoute().path);
  const sessionUser = computed(() => data.value?.user as {name: string} & User);

  useEventListener(window, "keydown", handleA11yMenuBlur);
  useEventListener(window, "load", setSessionUser);

  function handleA11yMenuBlur(event: KeyboardEvent) {
    if (event.key === "Escape" || event.key === "Enter") {
      if ((menuRef && menuRef.value?.matches("ul:has(&:focus, > li:focus, > li > a:active)")) || menuIsOpen.value) {
        setTimeout(() => {
          menuIsOpen.value = false;
        }, 200); // Delay to allow router events take priority
      }
    }
  }

  function setSessionUser() { $storage.setData("bingoUser", sessionUser.value) }

  function handleFocusOut(event: FocusEvent) {
    // Close if focus is not on a menu item or if a menu item was clicked
    if (
      !menuRef.value?.contains(event.relatedTarget as Node)
      || Array.from(menuRef.value.children).find(child => child.matches("li:has(&:active, > a:active)"))
    ) {
      setTimeout(() => {
        menuIsOpen.value = false;
      }, 200); // Delay to allow router events take priority
    }
  }

  function toggleMenu() {
    menuIsOpen.value = !menuIsOpen.value;
    if (menuIsOpen.value) {
      nextTick(() => {
        // Focus the menu when it's opened
        menuRef.value?.focus();
      });
    }
  }
</script>
