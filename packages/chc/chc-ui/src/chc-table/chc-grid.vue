<script setup lang="ts">
import type { VxeGridInstance } from 'vxe-table';

import type { SetupContext } from 'vue';

import type { ExtendedFormApi } from '@vben-core/form-ui';

import type { ChcGridProps } from './types';

import { computed, ref, toRaw, useSlots, useTemplateRef } from 'vue';

import { EmptyIcon } from '@vben/icons';
import { cloneDeep, cn } from '@vben/utils';

import { VbenLoading } from '@vben-core/shadcn-ui';

import { Button } from 'ant-design-vue';
import { VxeGrid } from 'vxe-table';

import { useDefaultConfig } from './defaultConfig';
import { deepMerge } from './utils';

import 'vxe-table/styles/cssvar.scss';
import 'vxe-pc-ui/styles/cssvar.scss';
import './style.css';

const props = withDefaults(defineProps<ChcGridProps>(), {});

const [Form, formApi] = props.useVbenForm({
  collapseTriggerResize: true,
  compact: true,
  handleSubmit: async () => {
    const formValues = await formApi.getValues();
    formApi.setLatestSubmissionValues(toRaw(formValues));
    gridRef.value?.commitProxy &&
      (await gridRef.value?.commitProxy?.('reload', formValues));
  },
  handleReset: async () => {
    await formApi.resetForm();
    const formValues = await formApi.getValues();
    formApi.setLatestSubmissionValues(formValues);
  },
  actionWrapperClass: props.isFormAreaVertical
    ? 'formActionAreaStyle'
    : undefined,
  collapsed: true,
  collapsedRows: 1,
  layout: props.isFormAreaVertical ? 'vertical' : 'horizontal',
  // 控制表单是否显示折叠按钮
  showCollapseButton: true,
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: true,
  wrapperClass:
    'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4  2xl:grid-cols-5',
  ...props.formOptions,
  commonConfig: {
    labelClass: 'w-[60px]',
    ...props.formOptions?.commonConfig,
    componentProps: {
      class: 'w-full',
      ...props.formOptions?.commonConfig?.componentProps,
    },
  },
});
const gridRef = useTemplateRef<VxeGridInstance>('gridRef');
const { defaultGridOptions, defaultGridEvents, finalTableExtraConfig } =
  useDefaultConfig(gridRef, formApi, props);
const finalOptions = computed(() => {
  const midProps = cloneDeep(toRaw(props.gridOptions));
  Object.defineProperty(midProps, 'id', {
    value: props.id,
    enumerable: true,
  });
  const finalVal = deepMerge(defaultGridOptions, midProps, {
    concatArrays: false,
  });
  return finalVal;
});
const events = computed(() => {
  const midGridEvents = cloneDeep(toRaw(props.gridEvents));
  const finalGridEvents = deepMerge(defaultGridEvents, midGridEvents, {
    concatArrays: false,
  });
  return {
    ...finalGridEvents,
  };
});
// 继承slots
const slots: SetupContext['slots'] = useSlots();
const delegatedSlots = computed(() => {
  const resultSlots: string[] = [];
  for (const key of Object.keys(slots)) {
    if (!['empty', 'form', 'loading'].includes(key)) {
      resultSlots.push(key);
    }
  }
  return resultSlots;
});
// 设置表格loading
const loading = ref(false);
function setLoading(tableLoading: boolean) {
  loading.value = tableLoading;
}
function handleExport(opt: any) {
  gridRef.value?.openExport({
    columns:
      props.gridOptions?.columns && props.gridOptions?.columns.length > 0
        ? props.gridOptions?.columns
            .filter(
              (item) =>
                item?.field !== 'index' &&
                item?.field !== 'action' &&
                item?.field !== 'operation' &&
                item?.type !== 'seq' &&
                item?.type !== 'checkbox',
            )
            .map((item) => {
              return { field: item?.field };
            })
        : [],
    modes: finalTableExtraConfig?.paginate
      ? ['current', 'selected', 'all']
      : ['current', 'selected'],
    remote: true,
    types: ['xlsx', 'csv'],
    filename: `导出-${Date.now()}`,
    sheetName: 'Sheet1',
    ...opt,
  });
}
defineExpose<{
  formApi: ExtendedFormApi;
  gridApi: VxeGridInstance;
  setLoading: (tableLoading: boolean) => void;
}>({
  get gridApi() {
    return gridRef.value as VxeGridInstance;
  },
  get formApi() {
    return formApi as ExtendedFormApi;
  },
  get setLoading() {
    return setLoading;
  },
});
</script>
<template>
  <div :class="cn('bg-card h-full rounded-md')">
    <!-- p-2 pb-1 pl-2 pr-2 pt-2-->
    <VxeGrid
      ref="gridRef"
      :class="cn('p-2')"
      v-bind="finalOptions"
      v-on="events"
      :loading="loading"
    >
      <!-- 继承默认的slot -->
      <template
        v-for="slotName in delegatedSlots"
        :key="slotName"
        #[slotName]="slotProps"
      >
        <slot :name="slotName" v-bind="slotProps"></slot>
      </template>
      <!-- 表格左侧工具栏 -->
      <template
        v-if="finalTableExtraConfig?.showToolbar"
        #toolbar-actions="slotProps"
      >
        <Button
          type="primary"
          class="mr-2"
          @click="handleExport"
          v-if="finalTableExtraConfig?.showExportBtn"
        >
          导出
        </Button>
        <slot name="toolbar-actions" v-bind="slotProps"> </slot>
      </template>
      <!-- 表格右侧工具栏 -->
      <template
        v-if="finalTableExtraConfig?.showToolbar"
        #toolbar-tools="slotProps"
      >
        <slot name="toolbar-tools" v-bind="slotProps"></slot>
      </template>
      <!-- form表单 -->
      <template #form>
        <div
          v-if="formOptions"
          :class="
            cn('relative rounded py-1', formOptions.compact ? 'pb-4' : 'pb-4')
          "
        >
          <slot name="form">
            <Form>
              <template #reset-before="slotProps">
                <slot name="reset-before" v-bind="slotProps"></slot>
              </template>
              <template #submit-before="slotProps">
                <slot name="submit-before" v-bind="slotProps"></slot>
              </template>
              <template #expand-before="slotProps">
                <slot name="expand-before" v-bind="slotProps"></slot>
              </template>
              <template #expand-after="slotProps">
                <slot name="expand-after" v-bind="slotProps"></slot>
              </template>
            </Form>
          </slot>
          <div
            :class="
              cn(
                'bg-background-deep z-100 absolute -left-2 bottom-2 h-2 w-[calc(100%+1rem)] overflow-hidden',
              )
            "
          ></div>
        </div>
      </template>
      <!-- loading -->
      <template #loading>
        <slot name="loading">
          <VbenLoading :spinning="true" />
        </slot>
      </template>
      <!-- 统一控状态 -->
      <template #empty>
        <slot name="empty">
          <EmptyIcon class="mx-auto" />
          <div class="mt-2">{{ $t('common.noData') }}</div>
        </slot>
      </template>
    </VxeGrid>
  </div>
</template>
<style scoped>
::v-deep(.vxe-grid--toolbar-wrapper) {
  padding-bottom: 0;
}

/* 去除导出弹窗内的冗余模块 */
::v-deep(
  .vxe-table-export--panel
    .vxe-table-export--panel-column
    > ul
    > li[title='序号']
) {
  display: none;
}

::v-deep(
  .vxe-table-export--panel
    .vxe-table-export--panel-column
    > ul
    > li[title='单选']
) {
  display: none;
}

::v-deep(
  .vxe-table-export--panel
    .vxe-table-export--panel-column
    > ul
    > li[title='多选']
) {
  display: none;
}

::v-deep(
  .vxe-table-export--panel
    .vxe-table-export--panel-column
    > ul
    > li[title='操作']
) {
  display: none;
}

::v-deep(
  .vxe-table-export--panel
    .vxe-table-export--panel-table
    tr:has(td > .vxe-table-export--panel-option-row)
) {
  display: none;
}

::v-deep(.vxe-pager.size--mini) {
  height: auto;
  padding-top: 0.35rem;
}
</style>
