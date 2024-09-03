<template>
  <div class="text-center pa-4">
    <v-btn @click="dialog = true" :color="props.dialogButtonColor">
      {{ props.dialogButtonText }}
    </v-btn>

    <v-dialog
      v-model="dialog"
      width="auto"
    >
      <v-card
        :max-width="props.maxWidth || 400"
        :prepend-icon="props.prependIcon || ''"
      >
        <v-card-title>{{ props.dialogTitle || '' }}</v-card-title>
        <v-card-text>
          <p v-if="Array.isArray(props.dialogText)">
            <span v-for="(line, index) in props.dialogText" :key="index">{{ line }}</span>
          </p>
          <p v-else>{{ props.dialogText }}</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            v-for="(button, index) in props.actionButtons"
            :key="index"
            class="ms-auto"
            @click="actionButtonHandler(index)"
          >
            {{ button.buttonText }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref } from "vue";

  const dialog = ref(false);
  
  const props = defineProps<{
    dialogButtonText: string,
    dialogButtonColor?: string,
    dialogTitle?: string,
    dialogText: string | string[],
    maxWidth?: string,
    prependIcon?: string,
    actionButtons: {
      buttonText: string,
      onClick?: () => void
    }[]
  }>();

  function actionButtonHandler(index: number) {
    dialog.value = false;
    if (props.actionButtons[index].onClick) {
      props.actionButtons[index].onClick();
    }
  }
</script>
