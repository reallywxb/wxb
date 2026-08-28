<script lang="ts" setup>
// import { onDeactivated } from 'vue';

// const props =
withDefaults(
  defineProps<{
    formModal: any;
    formModalApi: any;
    grid: any;
    logModal: any;
    logModalApi: any;
  }>(),
  {},
);
// onDeactivated(() => {
//   props.logModalApi && props.logModalApi.close();
//   props.formModalApi && props.formModalApi.close();
// });
</script>
<template>
  <logModal v-if="logModal" />
  <formModal v-if="formModal" />
  <grid v-if="grid" />
</template>
