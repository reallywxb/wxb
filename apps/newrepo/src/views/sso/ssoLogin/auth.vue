<script lang="ts" setup>
import { computed } from 'vue';

import { AuthPageLayout } from '@vben/layouts';
import { preferences } from '@vben/preferences';

// import img from '#/images/logo.png';
import { $t } from '#/locales';

const appName = computed(() => preferences.app.name);
const logo = computed(() => preferences.logo.source);
// const logo = computed(() => img);
</script>

<template>
  <AuthPageLayout
    :app-name="appName"
    :logo="logo"
    :page-description="$t('system.authentication.pageDesc')"
    :page-title="$t('system.authentication.pageTitle')"
    :copyright="false"
  />
</template>
