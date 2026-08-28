<script lang="ts" setup>
defineProps({
  mode: {
    type: String,
    default: 'D',
  },

  form: {
    type: Object,
    default: () => {},
  },
});
</script>
<template>
  <div>
    <text>
      {{ !form ? '' : form.placeholder }}
    </text>
  </div>
</template>
<style scoped lang="less"></style>
