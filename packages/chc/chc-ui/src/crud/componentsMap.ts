import { h } from 'vue';

import { useDebounceFn } from '@vueuse/core';
import { DatePicker, Input, TimePicker } from 'ant-design-vue';

import ChcSelect from '../components/chc-select/index.vue';
import DateGroup from '../components/date-group/index.vue';
import TimeGroup from '../components/time-group/index.vue';

export default {
  input: Input,
  select: ChcSelect,
  dateGroup: DateGroup,
  timeGroup: TimeGroup,
};
// 用于生成插槽组件的方法
export function getSlotComponents(column, params, quickSearchForm, gridApi) {
  if (column.searchOptions && column.searchOptions.type === 'select') {
    return h(ChcSelect, {
      modelValue: quickSearchForm.value[column.field],
      'onUpdate:modelValue': (e) => {
        // console.log('onUpdate:modelValue:', e);
        quickSearchForm.value[column.field] = e.target.value;
      },
      onChange: useDebounceFn((e) => {
        // console.log('onChange:', e);
        quickSearchForm.value[column.field] = e;
        gridApi.query({
          // quickSearch: quickSearchForm.value,
        });
      }, 300),
      class: {
        'w-[calc(100%-20px)]': column.sortable,
        'w-full': !column.sortable,
        'text-left': true,
      },
      ...column.searchOptions,
      ...(column.searchOptions.quickSearchOptions &&
        column.searchOptions.quickSearchOptions),
    });
  } else if (column.searchOptions && column.searchOptions.type === 'time') {
    return h(TimePicker, {
      value: quickSearchForm.value[column.field],
      class: {
        'w-[calc(100%-20px)]': column.sortable,
        'w-full': !column.sortable,
      },
      onChange: useDebounceFn((e) => {
        // console.log('onChange:', e);
        quickSearchForm.value[column.field] = e;
        gridApi.query({
          // quickSearch: quickSearchForm.value,
        });
      }, 300),
    });
  } else if (column.searchOptions && column.searchOptions.type === 'date') {
    return h(DatePicker, {
      value: quickSearchForm.value[column.field],
      class: {
        'w-[calc(100%-20px)]': column.sortable,
        'w-full': !column.sortable,
      },
      onChange: useDebounceFn((e) => {
        // console.log('onChange:', e);
        quickSearchForm.value[column.field] = e;
        gridApi.query({
          // quickSearch: quickSearchForm.value,
        });
      }, 300),
    });
  } else if (
    column.searchOptions &&
    column.searchOptions.type === 'date-time'
  ) {
    return h(DatePicker, {
      showTime: true,
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
      value: quickSearchForm.value[column.field],
      class: {
        'w-[calc(100%-20px)]': column.sortable,
        'w-full': !column.sortable,
      },
      onChange: useDebounceFn((e) => {
        // console.log('onChange:', e);
        quickSearchForm.value[column.field] = e;
        gridApi.query({
          // quickSearch: quickSearchForm.value,
        });
      }, 300),
    });
  } else if (
    column.searchOptions &&
    column.searchOptions.type === 'range-time'
  ) {
    return h(TimeGroup, {
      value: quickSearchForm.value[column.field],
      class: {
        'w-[calc(100%-20px)]': column.sortable,
        'w-full': !column.sortable,
      },
      onChange: useDebounceFn((e) => {
        // console.log('onChange:', e);
        quickSearchForm.value[column.field] = e;
        gridApi.query({
          // quickSearch: quickSearchForm.value,
        });
      }, 300),
    });
  } else if (
    column.searchOptions &&
    column.searchOptions.type === 'range-date'
  ) {
    return h(DateGroup, {
      value: quickSearchForm.value[column.field],
      class: {
        'w-[calc(100%-20px)]': column.sortable,
        'w-full': !column.sortable,
      },
      onChange: useDebounceFn((e) => {
        // console.log('onChange:', e);
        quickSearchForm.value[column.field] = e;
        gridApi.query({
          // quickSearch: quickSearchForm.value,
        });
      }, 300),
    });
  } else if (
    column.searchOptions &&
    column.searchOptions.type === 'range-date-time'
  ) {
    return h(DateGroup, {
      showTime: true,
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
      value: quickSearchForm.value[column.field],
      class: {
        'w-[calc(100%-20px)]': column.sortable,
        'w-full': !column.sortable,
      },
      onChange: useDebounceFn((e) => {
        // console.log('onChange:', e);
        quickSearchForm.value[column.field] = e;
        gridApi.query({
          // quickSearch: quickSearchForm.value,
        });
      }, 300),
    });
  } else {
    return h(Input, {
      modelValue: quickSearchForm.value[column.field],
      'onUpdate:modelValue': (e) => {
        // console.log('onUpdate:modelValue:', e);
        quickSearchForm.value[column.field] = e.target.value;
      },
      onInput: (e) => {
        // console.log('onInput:', e);
        quickSearchForm.value[column.field] = e.target.value;
      },
      onChange: useDebounceFn(() => {
        gridApi.query({
          // quickSearch: quickSearchForm.value,
        });
      }, 300),
      class: {
        'w-[calc(100%-20px)]': column.sortable,
        'w-full': !column.sortable,
      },
      allowClear: true,
      placeholder: `请输入${column.title}`,
      ...column,
    });
  }
}

// 用于生成快捷搜索form内属性初始值的方法
export const getQuickSearchFormInitValue = (columns, quickSearchForm) => {
  columns.forEach((column) => {
    if (
      column.field !== 'index' &&
      column.field !== 'action' &&
      column.field !== 'operation' &&
      column.type !== 'seq' &&
      column.type !== 'checkbox'
    ) {
      if (column.children) {
        return getQuickSearchFormInitValue(column.children, quickSearchForm);
      } else {
        quickSearchForm.value[`${column.field}`] = '';
      }
    }
  });
};
