<script setup lang="ts">
import { markRaw, provide, ref } from 'vue';

import ChildCreation from './child/childCreation.vue';
import ChildGroup from './child/childGroup.vue';

interface CreationPayload {
  groupId?: string;
  id?: string;
  cp?: boolean;
  flowId?: string;
}

interface GroupPayload {
  refresh: boolean;
}

const componentMap = {
  creation: ChildCreation,
  group: ChildGroup,
};

const component = ref(markRaw(componentMap.group));
const componentParams = ref<CreationPayload | GroupPayload>();

function changeComponent(
  name: keyof typeof componentMap,
  payload?: CreationPayload | GroupPayload,
) {
  componentParams.value = payload;
  component.value = markRaw(componentMap[name]);
}

provide('changeComponent', changeComponent);
</script>

<template>
  <keep-alive :include="ChildGroup.name">
    <Component :is="component" v-bind="componentParams" />
  </keep-alive>
</template>

<style scoped></style>
