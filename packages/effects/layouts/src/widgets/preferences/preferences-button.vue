<script lang="ts" setup>
import { Settings } from '@vben/icons';

import { VbenIconButton } from '@vben-core/shadcn-ui';

import Preferences from './preferences.vue';

const emit = defineEmits<{ clearPreferencesAndLogout: [] }>();

function clearPreferencesAndLogout() {
  emit('clearPreferencesAndLogout');
}
</script>
<template>
  <Preferences @clear-preferences-and-logout="clearPreferencesAndLogout">
    <VbenIconButton
      class="dark:hover:bg-accent dark:hover:text-accent-foreground dark:text-foreground bg-[hsl(var(--header))] text-[hsl(var(--header-foreground))] hover:bg-[hsl(var(--header-accent-hover))] hover:text-[hsl(var(--header-accent-foreground))]"
    >
      <Settings class="size-4" />
    </VbenIconButton>
  </Preferences>
</template>
