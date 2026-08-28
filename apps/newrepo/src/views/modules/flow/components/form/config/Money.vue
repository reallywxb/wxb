<script setup lang="ts">
import { computed } from 'vue';

import { Checkbox, FormItem, InputNumber, Switch } from 'ant-design-vue';

import { useFlowStore } from '#/store/flow';
import { getCurrentConfig } from '#/utils/flow/objutil';

import ValueCom from './components/value/Money.vue';

const props = defineProps({
  id: {
    type: String,
    default: '',
  },
});

const flowStore = useFlowStore();

const config = computed(() => {
  return getCurrentConfig(props.id);
});
const isInLayout = computed(() => {
  const step2 = flowStore.step2;
  const idObjList = step2.filter((res) => res.id === props.id);
  if (idObjList.length > 0) {
    return false;
  }

  return true;
});
</script>

<template>
  <div v-if="config">
    <FormItem label="格式">
      <Checkbox v-model:checked="config.props.showChinese">
        显示大写数字
      </Checkbox>
      <!--		  <checkbox v-model="config.props.showThousandSymbol" label="显示千位分隔符" />-->
    </FormItem>
    <FormItem label="统计总数" v-if="isInLayout">
      <Switch
        v-model:checked="config.props.sum"
        size="large"
        checked-children="开启"
        un-checked-children="关闭"
      />
    </FormItem>
    <FormItem label="最小值">
      <InputNumber
        v-model:value="config.props.min"
        style="width: 100%"
        controls-position="right"
        :min="1"
        :max="100000000000000"
      />
    </FormItem>
    <FormItem label="最大值">
      <InputNumber
        v-model:value="config.props.max"
        style="width: 100%"
        controls-position="right"
        :min="1"
        :max="100000000000000"
      />
    </FormItem>
    <FormItem label="小数位数">
      <InputNumber
        :step="1"
        step-strictly
        v-model:value="config.props.radixNum"
        style="width: 100%"
        controls-position="right"
        :min="0"
        value-on-clear="min"
        :max="10"
      />
    </FormItem>

    <FormItem label="默认值">
      <ValueCom :id="id" :value-config="config.props" />
    </FormItem>
  </div>
</template>

<style scoped lang="less"></style>
