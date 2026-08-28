<script setup lang="ts">
/* eslint-disable vue/no-mutating-props */

import { computed } from 'vue';

import { Empty, Radio, RadioGroup } from 'ant-design-vue';

import { useFlowStore } from '#/store/flow';

defineProps({
  formPerm: {
    type: Object,
    default: () => {},
  },
  hideKey: {
    type: Array,
    default: () => [],
  },
});
const flowStore = useFlowStore();

const step2FormList = computed(() => {
  const step2 = flowStore.step2;

  return step2;
});
</script>

<template>
  <div>
    <div
      style="display: flex; flex-direction: row; background-color: #f5f7fa"
      effect="dark"
    >
      <div class="f1">表单字段</div>
      <div class="f2">只读</div>
      <div class="f3">编辑</div>
      <div class="f4">隐藏</div>
    </div>

    <div v-if="step2FormList.length === 0">
      <Empty description="暂无表单" />
    </div>
    <template v-for="item in step2FormList" :key="item.id">
      <div style="display: flex; flex-direction: row">
        <div class="f1">
          <span>{{ item.name }}</span>
          <span v-if="item.required" style="color: #c75450"> * </span>
        </div>

        <RadioGroup v-model:value="formPerm[item.id]" size="large">
          <div class="f2">
            <Radio size="large" value="R" />
          </div>
          <div class="f3">
            <Radio
              :disabled="!(hideKey.length === 0 || !hideKey.includes('E'))"
              size="large"
              value="E"
            />
          </div>
          <div class="f4">
            <Radio size="large" value="H" />
          </div>
        </RadioGroup>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
$width2: 80px;
$width3: 80px;
$width4: 80px;

.f1 {
  width: calc(100% - #{$width2} - #{$width3} - #{$width4});
  padding: 10px;
}

.f2,
.f3,
.f4 {
  display: inline-block;
}

.f2 {
  width: $width2;
  padding: 10px;
}

.f3 {
  width: $width3;
  padding: 10px;
}

.f4 {
  width: $width4;
  padding: 10px;
}
</style>
