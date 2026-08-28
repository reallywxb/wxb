<script setup lang="ts">
import type { Component } from 'vue';

import type {
  AdvSearchCompType,
  AdvSearchField,
  AdvSearchItem,
} from '../types';

import { markRaw, ref } from 'vue';

import { COMPONENT_MAP as compMap } from '../config';

const props = withDefaults(
  defineProps<{
    advSearchFields: AdvSearchField[];
    deleteItem?: () => void;
    fieldStatic?: boolean;
    getPopupContainer?: () => HTMLElement;
    operatorStatic?: boolean;
    valueStatic?: boolean;
  }>(),
  {
    fieldStatic: false,
    operatorStatic: false,
    valueStatic: false,
    getPopupContainer: () => {
      return document.querySelector('.advanced-search') as HTMLElement;
    },
    deleteItem: () => {},
  },
);
const item = defineModel<AdvSearchItem>('item', {
  required: true,
});
const OPERATORS_MAP = {
  number: [
    {
      label: '大于',
      value: '>',
    },
    {
      label: '大于等于',
      value: '>=',
    },
    {
      label: '等于',
      value: '=',
    },
    {
      label: '不等于',
      value: '!=',
    },

    {
      label: '小于',
      value: '<',
    },
    {
      label: '小于等于',
      value: '<=',
    },
    {
      label: '为空',
      value: 'IS NULL',
    },
    {
      label: '不为空',
      value: 'IS NOT NULL',
    },
  ],
  text: [
    {
      label: '包含',
      value: 'LIKE',
    },
    {
      label: '不包含',
      value: 'NOT LIKE',
    },
    {
      label: '等于',
      value: '=',
    },
    {
      label: '不等于',
      value: '!=',
    },
    {
      label: '为空',
      value: 'IS NULL',
    },
    {
      label: '不为空',
      value: 'IS NOT NULL',
    },
  ],
  time: [
    {
      label: '大于等于',
      value: '>=',
    },
    {
      label: '等于',
      value: '=',
    },
    {
      label: '小于等于',
      value: '<=',
    },
    {
      label: '区间',
      value: 'BETWEEN',
    },
    {
      label: '为空',
      value: 'IS NULL',
    },
    {
      label: '不为空',
      value: 'IS NOT NULL',
    },
  ],
  // 下拉选择默认是复选
  select: [
    {
      label: '属于',
      value: 'IN',
    },
    {
      label: '不属于',
      value: 'NOT IN',
    },
    {
      label: '为空',
      value: 'IS NULL',
    },
    {
      label: '不为空',
      value: 'IS NOT NULL',
    },
  ],
};
const COMPONENTS_MAP = ref({
  DateGroup: markRaw(compMap.DateGroup as Component),
  TimeGroup: markRaw(compMap.TimeGroup as Component),
  TimePicker: markRaw(compMap.TimePicker as Component),
  DatePicker: markRaw(compMap.DatePicker as Component),
  InputNumber: markRaw(compMap.InputNumber as Component),
  Input: markRaw(compMap.Input as Component),
  ChcSelect: markRaw(compMap.ChcSelect as Component),
});
const ChcSelect = markRaw(compMap.ChcSelect as Component);
const Tag = markRaw(compMap.Tag as Component);
const getOperatorOptions = (compType: AdvSearchCompType) => {
  // if (['date', 'datetime', 'time'].includes(compType)) {
  //   return OPERATORS_MAP.time;
  // } else if (['number'].includes(compType)) {
  //   return OPERATORS_MAP.number;
  // } else if (['select'].includes(compType)) {
  //   return OPERATORS_MAP.select;
  // } else if (['text'].includes(compType)) {
  //   return OPERATORS_MAP.text;
  // } else {
  //   return OPERATORS_MAP.text;
  // }
  if (['date', 'datetime', 'time'].includes(compType)) {
    return 'time';
  } else if (['number'].includes(compType)) {
    return 'number';
  } else if (['select'].includes(compType)) {
    return 'select';
  } else if (['text'].includes(compType)) {
    return 'text';
  } else {
    return 'text';
  }
};
const getComponent = (compType: AdvSearchCompType, range: boolean = false) => {
  if (['date', 'datetime'].includes(compType)) {
    if (range) {
      return 'DateGroup';
    }
    return 'DatePicker';
  } else if (compType === 'number') {
    return 'InputNumber';
  } else if (compType === 'text') {
    return 'Input';
  } else if (['select'].includes(compType)) {
    return 'ChcSelect';
  } else {
    return 'Input';
  }
};
const handleClose = () => {
  props.deleteItem();
};

// 执行动态格式化函数
const executeFunctionStr = (
  funStr: string,
  funName: string,
  ...args: any[]
) => {
  // eslint-disable-next-line no-new-func
  const fn = new Function('...args', `${funStr};return ${funName}(...args)`);
  return fn(...args);
};
</script>
<template>
  <div class="flex w-full items-center gap-1">
    <template v-if="fieldStatic && operatorStatic && valueStatic">
      <slot name="tag"></slot>
    </template>

    <Tag
      v-if="fieldStatic && operatorStatic && valueStatic"
      closable
      color="purple"
      @close="handleClose"
    >
      {{
        `${item.fieldName} ${item.operatorName} ${item.valueName || item.value || ''}`
      }}
    </Tag>
    <!-- <span v-if="fieldStatic">{{ item.fieldName }}</span> -->
    <!-- <component
      v-if="fieldStatic"
      :is="COMPONENTS_MAP.Input"
      disabled
      class="w-[90px] shrink-0 grow-0"
      v-model:value="item.fieldName"
    /> -->
    <ChcSelect
      v-if="!fieldStatic"
      class="w-[90px] shrink-0 grow-0"
      v-model="item.field"
      label-field="field"
      value-field="value"
      @change="
        async (value: string, option: AdvSearchField) => {
          if (!value) {
            // 清空字段时,重置操作符和取值
            item.field = undefined;
            item.operator = undefined;
            item.fieldName = undefined;
            item.operatorName = undefined;
            item.value = undefined;
            item.valueName = undefined;
            item.compType = 'text';
            item.component = getComponent('text');
            // item.operatorOptions = [];
            item.operatorOptions = undefined;
            item.compProps = undefined;
          } else {
            if (option.compType === 'select' && option.itemProps) {
              item.compProps = {
                ...option.itemProps,
                formatInterfaceData:
                  option.itemProps && option.itemProps.formatInterfaceData
                    ? (data: any) => {
                        return executeFunctionStr(
                          option.itemProps!.formatInterfaceData,
                          'formatInterfaceData',
                          data,
                        );
                      }
                    : undefined,
              };
            }
            item.value = option.compType === 'number' ? 0 : undefined;
            item.valueName = undefined;
            item.operator = undefined;
            item.field = value;
            item.fieldName = option.field;
            item.operatorName = undefined;
            item.compType = option.compType;
            item.operatorOptions = getOperatorOptions(option.compType);
            item.component = getComponent(option.compType);

            // console.log(option);
          }
        }
      "
      :options="advSearchFields"
      placeholder="请选择"
      :get-popup-container="getPopupContainer"
    />
    <!-- <component
      v-if="operatorStatic"
      :is="COMPONENTS_MAP.Input"
      disabled
      class="w-[90px] shrink-0 grow-0"
      v-model:value="item.operatorName"
    /> -->
    <!-- <span v-if="operatorStatic">{{ item.operatorName }}</span> -->
    <ChcSelect
      v-if="!operatorStatic"
      class="w-[90px] shrink-0 grow-0"
      :disabled="!item.field"
      v-model="item.operator"
      :options="item.operatorOptions ? OPERATORS_MAP[item.operatorOptions] : []"
      @change="
        (val: string, option: { label: string; value: string }) => {
          // 定义一个更新组件的方法
          const updateComp = (
            compType: AdvSearchCompType,
            range: boolean = false,
          ) => {
            // 判断是否是同一个组件，是同一个组件，无需更新组件，不是同一个组件，更新组件
            if (item.component !== getComponent(compType, range)) {
              item.component = getComponent(compType, range);
              item.value = range ? [] : undefined; //换组件时，重置取值
              item.valueName = undefined;
            }
          };
          // 日期组件在调整到时间跨度时，需要使用时间跨度组件
          if (
            (item.compType === 'date' || item.compType === 'datetime') &&
            val === 'BETWEEN'
          ) {
            // 如果是时间跨度，要使用时间跨度组件
            updateComp(item.compType, true);
          } else {
            updateComp(item.compType, false);
          }

          // 操作符调整到为空或者不为空时，组件置空，且不可编辑
          if (val === 'IS NULL' || val === 'IS NOT NULL') {
            item.value = undefined;
            item.valueName = undefined;
          }
          // 操作符被清空的情况下，清空取值
          if (val === undefined) {
            item.value = undefined;
            item.valueName = undefined;
            item.operatorName = undefined;
          } else {
            item.operatorName = option.label;
          }

          // 针对数字组件 值永远重置为0
          if (item.compType === 'number') {
            if (val === 'IS NULL' || val === 'IS NOT NULL') {
              item.value = undefined;
              item.valueName = undefined;
            } else {
              item.value = item.value === undefined ? 0 : item.value;
            }
          }
        }
      "
      placeholder="请选择"
      :get-popup-container="getPopupContainer"
    />
    <!-- <span v-if="valueStatic">{{ item.valueName || item.value }};</span> -->
    <!--       :options="
        item.compType === 'select'
          ? [
              { value: 1, label: '你' },
              { value: 2, label: '好' },
              { value: 3, label: '世' },
              { value: 4, label: '界' },
            ]
          : undefined
      " -->
    <component
      v-if="!valueStatic"
      class="flex-1"
      :class="{
        'pb-[2px]': item.compType === 'text',
        'pt-[2px]': item.compType === 'text',
        '[&_input:first-of-type]:leading-[26px]': item.compType === 'number',
      }"
      :value-format="
        item.compType === 'date'
          ? 'YYYY-MM-DD'
          : item.compType === 'datetime'
            ? 'YYYY-MM-DD HH:mm'
            : undefined
      "
      :format="
        item.compType === 'date'
          ? 'YYYY-MM-DD'
          : item.compType === 'datetime'
            ? 'YYYY-MM-DD HH:mm'
            : undefined
      "
      :show-time="item.compType === 'datetime' ? true : undefined"
      :mode="item.compType === 'select' ? 'multiple' : undefined"
      :get-popup-container="getPopupContainer"
      :disabled="
        !item.field ||
        !item.operator ||
        item.operator === 'IS NULL' ||
        item.operator === 'IS NOT NULL'
      "
      @change="
        (val: any, option: { label: string }[]) => {
          if (item.compType === 'select') {
            item.valueName = option.map(
              (itemIn: { label: string }) => itemIn.label,
            );
          }
          if (val === undefined) {
            item.valueName = undefined;
          }
        }
      "
      v-model="item.value"
      v-model:value="item.value"
      :is="COMPONENTS_MAP[item.component]"
      placeholder="取值"
      v-bind="item.compProps"
      allow-clear
    />
    <slot name="control"></slot>
  </div>
</template>
<style scoped></style>
