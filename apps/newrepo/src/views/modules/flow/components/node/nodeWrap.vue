<script setup>
/* eslint-disable vue/no-mutating-props */

import Approval from './node/approval.vue';
import CC from './node/cc.vue';
import Condition from './node/condition.vue';
import Delay from './node/delay.vue';
import Parallel from './node/parallel.vue';
import Starter from './node/starter.vue';

defineProps({
  nodeConfig: {
    type: Object,
    default: () => ({}),
  },
});

const emits = defineEmits(['update:nodeConfig']);

const nodeConfigUpdate = (e) => {
  emits('update:nodeConfig', e);
};
</script>
<template>
  <div>
    <Approval
      @update-data="nodeConfigUpdate"
      v-if="nodeConfig.type === 1"
      :node-config="nodeConfig"
    />
    <Starter
      @update-data="nodeConfigUpdate"
      v-else-if="nodeConfig.type === 0"
      :node-config="nodeConfig"
    />
    <CC
      @update-data="nodeConfigUpdate"
      v-else-if="nodeConfig.type === 2"
      :node-config="nodeConfig"
    />
    <Delay
      @update-data="nodeConfigUpdate"
      v-else-if="nodeConfig.type === 7"
      :node-config="nodeConfig"
    />
    <Condition
      @update-data="nodeConfigUpdate"
      v-else-if="nodeConfig.type === 4 || nodeConfig.type === 8"
      :node-config="nodeConfig"
    />
    <Parallel
      @update-data="nodeConfigUpdate"
      v-else-if="nodeConfig.type === 5"
      :node-config="nodeConfig"
    />
    <nodeWrap
      v-if="nodeConfig.childNode"
      v-model:node-config="nodeConfig.childNode"
    />
  </div>
</template>
<style scoped></style>
