<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useSpdGrid } from '#/components/spd';
import { useVbenForm } from '#/adapter/form';
import type { VbenFormProps } from '#/adapter/form';
import type { SchemaColumnAndOptions } from '#/adapter/chc-ui';
import { merge } from 'lodash-es';
const props = withDefaults(
  defineProps<{
    blackList: string[];
    extraParams?: Record<string, any>;
    blackListField: string;
    formOptions?: VbenFormProps;
    gridOptions: SchemaColumnAndOptions;
  }>(),
  {
    extraParams: () => ({}),
    blackListField: 'productCode',
    formOptions: undefined,
  },
);
const onSubmit = () => {
  searchFormApi.getValues().then((values) => {
    ChcGridApi.query(values);
  });
};
const handleSearch = () => {
  searchFormApi.getValues().then((values) => {
    ChcGridApi.query(values);
  });
};
const defaultFormProps: VbenFormProps = {
  // 默认展开
  collapsed: false,
  showCollapseButton: false,
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
    hideLabel: true,
    formItemClass: 'mr-2 pb-0',
    // labelWidth: 0,
    // labelClass: 'hidden',
  },
  actionWrapperClass: 'pb-0 col-span-1 text-left pt-[2px]',
  // actionLayout: 'inline',
  actionPosition: 'left',
  // 提交函数
  handleSubmit: onSubmit,
  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行
  layout: 'horizontal',
  // 是否可展开
  submitButtonOptions: {
    content: '查询',
    class:
      props.formOptions &&
      props.formOptions.schema &&
      props.formOptions.schema.length > 0
        ? 'ml-3'
        : 'ml-0',
  },
  resetButtonOptions: {
    show:
      props.formOptions &&
      props.formOptions.schema &&
      props.formOptions.schema.length > 0,
  },
  wrapperClass: 'grid-cols-4',
};

const [SearchForm, searchFormApi] = useVbenForm(
  merge(
    defaultFormProps,
    props.formOptions
      ? {
          ...props.formOptions,
          schema: props.formOptions.schema?.map((item) => {
            let componentProps: any;
            if (item.componentProps) {
              if (typeof item.componentProps === 'function') {
                componentProps = item.componentProps();
              } else {
                componentProps = item.componentProps;
              }
            } else {
              item.componentProps = {};
            }
            componentProps['data-testid'] =
              `${item.component}_${item.fieldName}_batchAddModal`;

            if (item.component === 'Input') {
              const originalOnKeyup = componentProps.onKeyup;
              componentProps.onKeyup = (e: KeyboardEvent) => {
                originalOnKeyup && originalOnKeyup(e);
                if (e.key === 'Enter') {
                  handleSearch();
                }
              };
            }
            if (item.component === 'ChcSelect') {
              const originalOnChange = componentProps.onChange;
              componentProps.onChange = (e: KeyboardEvent) => {
                originalOnChange && originalOnChange(e);
                handleSearch();
              };
            }
            // debugger;
            componentProps =
              item.componentProps && typeof item.componentProps === 'function'
                ? () => componentProps
                : componentProps;
            return {
              ...item,
              componentProps,
            };
          }),
        }
      : {},
  ),
);
const defaultGridOptions: SchemaColumnAndOptions = {
  id: 'batchAdd',
  tableSearchExtraParams: props.extraParams,
};
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    showSearchForm: false,
    gridOptions: {
      checkboxConfig: {
        trigger: 'row',
        checkMethod: (scope: any) => {
          return !props.blackList.includes(scope.row[props.blackListField]);
        },
      },
    },
  },
  merge(defaultGridOptions, props.gridOptions),
);
onMounted(() => {
  if (
    searchFormApi &&
    searchFormApi.getValues &&
    typeof searchFormApi.getValues === 'function'
  ) {
    searchFormApi.getValues().then((values) => {
      ChcGridApi.query(values);
    });
  } else {
    ChcGridApi.query();
  }
});
const batchAddGridApi = computed(() => {
  return ChcGridApi.grid;
});
const batchAddSearchForm = computed(() => {
  return searchFormApi;
});
defineExpose({
  gridApi: batchAddGridApi,
  formApi: batchAddSearchForm,
});
</script>
<template>
  <div class="h-full">
    <ChcGrid>
      <template #toolbar-actions>
        <SearchForm class="w-full"></SearchForm>
      </template>
    </ChcGrid>
  </div>
</template>
<style scoped></style>
