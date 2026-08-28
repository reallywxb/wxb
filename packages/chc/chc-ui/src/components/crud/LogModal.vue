<script lang="ts" setup>
import type { queryLogData, queryLogParams } from '../../types/crud';
import type { GridColumn } from '../../types/crud.d';

import { computed, h, ref } from 'vue';

import { useVbenModal } from '@vben-core/popup-ui';

import dayjs from 'dayjs';

import {
  queryDataTableColumnConfig,
  saveDataTableColumnConfig,
} from '../../api/crudnew';

// import { queryDataTableLog } from '#/components/datatable/api';

const props = withDefaults(
  defineProps<{
    isFormAreaVertical: boolean;
    namespace: string;
    parentTableId: string;
    queryDataTableLog: (
      tabelId: string,
      data: queryLogData,
      params: queryLogParams,
    ) => Promise<any>;
    useVbenVxeGrid: any;
  }>(),
  {},
);
const currentParams = ref();
const data = ref();
const sort = ref<string[]>([]);
const selectOptions = ref([]);
const formLabelClass = props.isFormAreaVertical ? 'pl-[10px] pr-[10px]' : '';
const formOptions = {
  commonConfig: {
    labelClass: 'w-[64px]',
  },
  actionWrapperClass: 'formActionAreaStyle',
  // 默认展开
  collapsed: false,
  collapsedRows: 1,
  fieldMappingTime: [['changeDate', ['dateFrom', 'dateTo']]],
  layout: props.isFormAreaVertical ? 'vertical' : 'horizontal',
  schema: [
    {
      // 日期区间组件
      component: 'DateGroup',
      // 配置日期区间组件属性
      componentProps: {
        // 这里可以传antd-vue date-picker 或者 time-picker 组件内的属性进行配置
        showTime: false, // 是否显示时分秒
        valueFormat: 'YYYY-MM-DD',
      },
      // 配置日期区间组件初始值
      defaultValue: [
        dayjs(dayjs().format('YYYY-MM-DD'))
          .subtract(7, 'day')
          .format('YYYY-MM-DD'),
      ],
      fieldName: 'changeDate',
      formItemClass: `col-span-2 ${formLabelClass}`,
      label: '更新时间',
      labelClass: 'leading-1 mb-[1px] pl-[4px]',
    },
    {
      component: 'Select',
      componentProps: () => {
        return {
          allowClear: true,
          options: selectOptions.value,
          placeholder: '请选择',
          showSearch: true,
        };
      },
      fieldName: 'fieldId',
      formItemClass: `col-span-1 ${formLabelClass}`,
      label: '字段',
      labelClass: 'leading-1 mb-[1px] pl-[4px]',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'createdByName',
      formItemClass: `col-span-1 ${formLabelClass}`,
      label: '更新人',
      labelClass: 'leading-1 mb-[1px] pl-[4px]',
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: false,
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
  wrapperClass: 'grid-cols-5',
};
const queryKeyValues = (rowData: any, keyCols: GridColumn[]) => {
  const keyValues: { [key: string]: any } = {};
  if (keyCols && keyCols.length > 0) {
    keyCols.forEach((col) => {
      if (col.field) {
        keyValues[col.field] = rowData[col.field];
      }
    });
  } else {
    keyValues.id = rowData.id;
  }
  return keyValues;
};
const gridOptions = {
  // checkboxConfig: {
  //   highlight: true,
  //   labelField: 'name',
  // },
  radioConfig: {
    highlight: false,
    trigger: 'row',
  },
  seqConfig: {
    seqMethod: (data: any) => {
      return (
        (currentParams.value.pageInfo.current - 1) *
          currentParams.value.pageInfo.size +
        data.rowIndex +
        1
      );
    },
  },
  id: `${props.parentTableId}-logModal`,
  border: true,
  columns: [
    {
      fixed: 'left',
      // title: '选择',
      type: 'radio',
      minWidth: 50,
      visible: false,
    },
    {
      field: 'index',
      fixed: 'left',
      title: '序号',
      type: 'seq',
      width: 50,
      align: 'center',
    },
    {
      field: 'typeName',
      minWidth: 100,
      sortable: true,
      title: '类型',
      align: 'left',
    },
    {
      field: 'columnName',
      minWidth: 80,
      sortable: true,
      title: '字段',
      align: 'left',
    },
    {
      field: 'oldValueName',
      minWidth: 120,
      sortable: true,
      title: '旧值',
      align: 'right',
    },
    {
      field: 'newValueName',
      minWidth: 120,
      sortable: true,
      title: '新值',
      align: 'right',
    },
    {
      field: 'createdByName',
      minWidth: 120,
      sortable: true,
      title: '更新人',
      align: 'left',
    },
    {
      field: 'createTime',
      minWidth: 160,
      sortable: true,
      title: '更新时间',
      align: 'left',
    },
    {
      field: 'remoteAddr',
      minWidth: 160,
      sortable: true,
      align: 'left',
      title: '远程地址',
    },
  ],
  height: 'auto',
  keepSource: true,
  pagerConfig: {
    enabled: true,
  },
  proxyConfig: {
    autoLoad: true,
    enabled: true,
    ajax: {
      query: async ({ page }: any, formValues: any) => {
        const res = await props.queryDataTableLog(
          data.value.dataTableId,
          {
            current: page.currentPage,
            size: page.pageSize,
            sort: sort.value,
            start: (page.currentPage - 1) * page.pageSize,
            ...formValues,
            keyValues: queryKeyValues(data.value.rowData, data.value.keyCols),
          },
          { preview: data.value.preview || false },
        );
        const finalParams = {
          current: page.currentPage,
          size: page.pageSize,
          sort: sort.value,
          start: (page.currentPage - 1) * page.pageSize,
          ...formValues,
          keyValues: queryKeyValues(data.value.rowData, data.value.keyCols),
        };
        currentParams.value = {
          pageInfo: {
            current: page.currentPage,
            size: page.pageSize,
            total: res.total,
          },
          params: finalParams,
        };
        // console.log('records:', records);
        return {
          total: res.total,
          items: res.records,
        };
      },
    },
  },
  customConfig: {
    restoreStore: () => {
      return new Promise((resolve) => {
        queryDataTableColumnConfig(
          `${props.namespace}-${props.parentTableId}`,
          `${location.pathname}-logModal`,
        ).then((res) => {
          if (res && res.data) {
            // 兼容表格列配置为string和obj的情况
            if (typeof res.data === 'string') {
              let resData: any;
              try {
                resData = JSON.parse(res.data);
                resolve(resData);
              } catch {
                resolve({});
              }
            } else {
              resolve(res.data);
            }
          } else {
            resolve({});
          }
        });
      });
    },
    storage: {
      fixed: true,
      resizable: true,
      sort: true,
      visible: true,
    },
    updateStore: (param: any) => {
      return new Promise((resolve) => {
        saveDataTableColumnConfig(
          `${props.namespace}-${props.parentTableId}`,
          `${location.pathname}-logModal`,
          param.storeData,
        ).then(() => {
          resolve(null);
        });
      });
    },
  },
  rowConfig: {
    isCurrent: true,
    isHover: true,
  },
};
const [Grid, gridApi] = props.useVbenVxeGrid({
  formOptions,
  gridEvents: {
    sortChange: ({ field, order }: { field: string; order: string }) => {
      sort.value = order ? [`${field} ${order}`] : [];
      gridApi.query();
    },
  },
  gridOptions,
  separator: false,
});
const [Modal, modalApi] = useVbenModal({
  cancelText: '关闭',
  class: 'w-[80%] h-[800px]',
  closable: true,
  destroyOnClose: true,
  draggable: true,
  onCancel() {
    modalApi.close();
  },
  onConfirm() {
    // console.info('onConfirm');
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      data.value = modalApi.getData<Record<string, any>>();
      // debugger;
      selectOptions.value = data.value.columns
        .filter((item: { field: string; title: string }) => {
          return item.field !== 'index' && item.field !== 'action';
        })
        .map((item: { field: string; title: string }) => {
          return { label: item.title, value: item.field };
        });

      const timer = setInterval(() => {
        if (
          gridApi.grid.commitProxy &&
          typeof gridApi.grid.commitProxy === 'function'
        ) {
          gridApi.query();
          clearInterval(timer);
        }
      }, 33);
    }
  },
  showCancelButton: true,
  showConfirmButton: false,
});
const TitleText = computed(() => {
  const textArr = [];
  if (data.value.keyCols.length > 0) {
    for (let i = 0; i < data.value.keyCols.length; i++) {
      textArr.push([
        `${data.value.keyCols[i].title.toLowerCase().includes('id') ? data.value.keyCols[i].title : `${data.value.keyCols[i].title}ID`}`,
        `${data.value.rowData[data.value.keyCols[i].field]}`,
      ]);
    }
  } else {
    textArr.push([`ID`, `${data.value.rowData.id}`]);
  }

  return h(
    'div',
    { class: 'pl-[8px]' },
    textArr.map((item) => {
      return h('span', {}, [
        h('span', { class: 'font-bold' }, `${item[0]}: `),
        h('span', {}, item[1]),
      ]);
    }),
  );
});
// onMounted(() => {
//   console.log('onMounted:');
//   gridApi.query();
// });
</script>
<template>
  <Modal title="操作记录">
    <div class="h-full">
      <Grid>
        <template #toolbar-actions> <TitleText /> </template>
      </Grid>
    </div>
  </Modal>
</template>
