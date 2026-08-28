<script setup lang="ts">
import type { PaginationProps } from 'ant-design-vue';

import { computed, defineComponent } from 'vue';

import { Divider, Pagination, Select } from 'ant-design-vue';

const props = withDefaults(
  defineProps<{
    modelValue?: number | number[] | string | string[] | undefined;
    optionColumns?: SelectOptionColumns;
    options: SelectList;
    paginate?: boolean;
    /**
     * 分页器配置
     */
    pagination?: Partial<PaginationProps>;
  }>(),
  {
    modelValue: undefined,
    optionColumns: () => [],
    paginate: false,
    pagination: (): Partial<PaginationProps> => ({
      showTotal: (total: number) => `共 ${total} 条`,
      simple: true,
      size: 'small',
      total: 100,
    }),
  },
);
const emit = defineEmits([
  'change',
  'pageChange',
  'update:modelValue',
  'dropdownVisibleChange',
]);
// const value = computed({
//   get() {
//     return props.modelValue === undefined ? '' : props.modelValue;
//   },
//   set(val) {
//     if (val) {
//       emit('update:modelValue', val);
//     } else {
//       emit('update:modelValue', '');
//     }
//   },
// });
const VNodes = defineComponent({
  props: {
    vnodes: {
      required: true,
      type: Object,
    },
  },
  render() {
    return this.vnodes;
  },
});
const pageChange = (page: number) => {
  emit('pageChange', page);
};

const dropdownVisibleChange = (open: boolean) => {
  open && emit('dropdownVisibleChange', open);
};
const computedWidth = computed(() => {
  return props.optionColumns && props.optionColumns.length > 0
    ? props.optionColumns.reduce((acc, cur) => {
        return acc + (cur.width || 100);
      }, 0) + 24
    : false;
});
const selectChange = (
  value: any | SelectValue,
  option: any | SelectData | SelectData[],
) => {
  if (value === undefined) {
    emit('change', '', option);
    // console.warn('Select change triggered with undefined value');
  } else {
    emit('change', value, option);
  }
};
</script>
<template>
  <Select
    v-bind="$attrs"
    :value="modelValue"
    @dropdown-visible-change="dropdownVisibleChange"
    :options="options"
    :dropdown-match-select-width="computedWidth"
    :dropdown-menu-style="{
      width: 'auto',
    }"
    @change="selectChange"
  >
    <!-- 自定义单个选项内容 -->
    <template
      #option="options"
      v-if="optionColumns && optionColumns.length > 0"
    >
      <div style="display: flex; flex-wrap: nowrap; width: 100%">
        <span
          v-for="(col, index) in optionColumns"
          :key="index"
          :style="`float: left;padding-right: 10px;word-break: break-all;display:block;overflow:hidden;white-space: nowrap;text-overflow: ellipsis;width:${
            col.width ? col.width : 100
          }px`"
        >
          <span>{{ options[col.name] ? options[col.name] : '&nbsp;' }}</span>
        </span>
      </div>
    </template>

    <template #dropdownRender="{ menuNode }">
      <div class="custom-dropdown">
        <template v-if="optionColumns && optionColumns.length > 0">
          <div class="tableHeader">
            <template v-for="col in optionColumns">
              <span
                v-if="col.header"
                :key="col.name"
                :style="`float: left;width:${col.width ? col.width : 100}px`"
                >{{ col.header }}
              </span>
            </template>
          </div>
          <div style="height: 40px"></div>
        </template>
        <div class="dropdown-content" v-if="menuNode">
          <VNodes :vnodes="menuNode" />
        </div>
        <Divider v-if="paginate" style="margin: 10px 0" />
        <Pagination
          v-bind="props.pagination"
          v-if="paginate"
          @change="pageChange"
        />
      </div>
    </template>
  </Select>
</template>

<style scoped>
.custom-dropdown {
  padding: 8px;
}

.tableHeader {
  position: absolute;
  top: 0;
  z-index: 99;
  height: 40px;
  margin-top: 10px;
  font-family: 'HiraginoSansGB-W3';
  font-size: 14px;
  font-weight: 600;
  line-height: 40px;
  color: #fff;
  background: rgb(64 158 255);
}

.tableHeader span {
  box-sizing: border-box;
  width: 100px;
  text-align: center;
}
</style>
