<script setup lang="ts">
import { getCurrentInstance, isReactive, toRaw } from 'vue';

import { cloneDeep } from 'lodash-es';

import { useStore } from '#/store/drawer';

import NodeTemplate from './node-template.vue';

const props = defineProps({
  nodeConfig: {
    type: Object,
    default: () => {},
  },
});

const emits = defineEmits(['updateData']);

const updateParentData = (d) => {
  emits('updateData', d);
};

// TODO
const store = useStore();
const {
  setDelay,

  setDelayConfig,
} = store;

const _uid = getCurrentInstance().uid;

function open() {
  // TODO
  setDelay(true);
  setDelayConfig({
    value: cloneDeep(
      isReactive(props.nodeConfig) ? toRaw(props.nodeConfig) : props.nodeConfig,
    ),
    flag: false,
    id: _uid,
  });
}
</script>

<template>
  <NodeTemplate
    :uid="_uid"
    store-data-key="delayConfigData"
    @update-data="updateParentData"
    place-holder-method-name="delayStr"
    check-method-name="checkDelay"
    @open="open"
    :node-config="nodeConfig"
  />
</template>

<style scoped lang="less"></style>
