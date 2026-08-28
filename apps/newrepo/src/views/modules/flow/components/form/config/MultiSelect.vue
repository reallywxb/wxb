<script setup lang="ts">
import { computed } from 'vue';

import { DeleteOutlined } from '@ant-design/icons-vue';
import { Button, FormItem, Input } from 'ant-design-vue';

import { getCurrentConfig } from '#/utils/flow/objutil';

import ValueCom from './components/value/MultiSelect.vue';

const props = defineProps({
  id: {
    type: String,
    default: '',
  },
});

const config = computed(() => {
  return getCurrentConfig(props.id);
});
const options = computed(() => {
  return config.value.props.options;
});

const addOption = () => {
  options.value.push({
    key: '',
    value: '',
  });
};
const deleteOption = (index) => {
  options.value.splice(index, 1);
};
</script>

<template>
  <div v-if="config">
    <FormItem label="选项" required>
      <template v-if="config.props.dataFrom === 1">
        <div v-for="(item, index) in options" :key="index" class="class_option">
          <div class="f1">
            <Input v-model:value="item.key" placeholder="选项值key" />
          </div>
          <div class="f2">
            <Input v-model:value="item.value" placeholder="选项标签value" />
          </div>
          <div class="f3">
            <DeleteOutlined @click.stop="deleteOption(index)" :size="20" />
          </div>
        </div>
        <Button type="primary" @click.stop="addOption">添加选项</Button>
      </template>
    </FormItem>

    <FormItem label="默认值">
      <ValueCom :id="id" :value-config="config.props" />
    </FormItem>
  </div>
</template>

<style scoped lang="less">
@f1_width: 150px;
@f3_width: 40px;
.class_option {
  display: flex;
  flex-direction: row;
  width: 100%;

  .f1 {
    width: @f1_width;
  }

  .f2 {
    margin-left: 5px;
    width: calc(100% - @f1_width - @f3_width - 5px);
  }

  .f3 {
    width: @f3_width;
    text-align: center;
    padding-top: 5px;
    height: 35.6px;
  }
}
</style>
