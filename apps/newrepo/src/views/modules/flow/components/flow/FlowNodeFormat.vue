<script setup lang="ts">
import { Timeline } from 'ant-design-vue';

import FlowNodeFormatContent from './FlowNodeFormatContent.vue';

defineProps({
  nodeUser: {
    type: Object,
    default: () => ({}),
  },
  row: {
    type: Array,
    default: () => [],
  },
  disableSelect: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <div style="padding: 10px">
    <Timeline :reverse="false" style="border: 0 solid red">
      <FlowNodeFormatContent
        :disable-select="disableSelect"
        :node-user="nodeUser"
        :row="row"
      />
    </Timeline>
  </div>
</template>

<style scoped lang="less">
ul {
  padding: 0px;
}
</style>
