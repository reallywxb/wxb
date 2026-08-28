<script lang="ts" setup>
import { toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { AddActionIcon, EditActionIcon, SvgDeleteIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import { Button, message, Modal } from 'ant-design-vue';

import { requestFormClient } from '#/api/request';
import {
  formDefaultOptions,
  gridDefaultOptions,
  importModalDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import FormModalComp from './modals/formModal.vue';

const userStore = useUserStore();
const route = useRoute();
const urlParams = (route.meta?.urlParams as Record<string, any>) || {};
console.warn('userStore', userStore);
console.warn('urlParams', urlParams);
// const isFirstLoaded = ref(false); // 是否已初次加载完
const [ChcGrid, chcGridApi, { FormModal, formModalApi }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      // fieldMappingTime: [['dateRange', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      showCollapseButton: false,
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      checkboxConfig: {
        highlight: false,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
    }),
  },
  {
    id: 'productCareLevel',
    // api地址
    queryUrl: '/productCareAction/queryCareLevel.do?page=input',
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        type: 'radio',
        title: '单选',
        width: 50,
        align: 'center',
        visible: false,
      },
      {
        field: 'careLevelName',
        title: '养护级别',
        // width: '160',
        sortable: true,
      },
      {
        field: 'careDays',
        title: '养护周期',
        // width: '200',
        sortable: true,
        align: 'right',
      },
      {
        field: 'nearGuarDays',
        title: '近效期养护周期',
        // width: '200',
        sortable: true,
        align: 'right',
      },
      {
        field: 'tipsDays',
        title: '养护提醒天数',
        // width: '200',
        sortable: true,
        align: 'right',
      },
    ],
    // 表单配置
    formSchema: [
      {
        component: 'ChcSelect',
        fieldName: 'careLevel',
        label: '养护级别',
        defaultValue: '',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=1000587',
            placeholder: '请选择养护级别',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
    ],
    gridEvents: {},
    tableSearchExtraParams: {},
    showCustomBtn: true,
    showZoomBtn: true,
    afterFetchFn: (params: any) => {
      console.warn('afterFetchFn params', params);
      return {
        ...params,
        records: params.rows,
      };
    },
    customModals: {
      'FormModal-formModalApi': deepMerge(importModalDefaultOptions, {
        // 连接抽离的组件
        connectedComponent: FormModalComp,
      }),
    },
  },
);
// 新增
const handleAdd = () => {
  formModalApi
    ?.setData({
      type: 'ADD',
      modalTitle: '添加',
      callback: () => {
        chcGridApi?.query();
      },
    })
    ?.open();
};
// 编辑
const handleEdit = () => {
  const record = chcGridApi?.grid?.getRadioRecord(true);
  if (!record) {
    return message.error('请选一条记录');
  }
  formModalApi
    ?.setData({
      type: 'EDIT',
      modalTitle: '修改',
      row: toRaw(record),
      callback: () => {
        chcGridApi?.query();
      },
    })
    ?.open();
};
// 删除
const handleDel = () => {
  const record = chcGridApi?.grid?.getRadioRecord(true);
  if (!record) {
    return message.error('请选一条记录');
  }
  Modal.confirm({
    title: '提示',
    content: `确认删除？`,
    okText: '确认',
    okType: 'danger',
    onOk: async () => {
      try {
        await requestFormClient.post('/productCareAction/deleteCareLevel.do', {
          careLevel: record.careLevel,
        });
        message.success('删除成功');
        chcGridApi?.query();
      } catch (error) {
        console.error('删除养护级别失败', error);
      }
    },
  });
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <FormModal />
    <ChcGrid>
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="handleAdd"
          class="mr-[0.5rem]"
          data-testid="button_add"
        >
          新增
          <template #icon>
            <AddActionIcon />
          </template>
        </Button>
        <Button
          type="primary"
          @click="handleEdit"
          class="mr-[0.5rem]"
          data-testid="button_edit"
        >
          修改
          <template #icon>
            <EditActionIcon />
          </template>
        </Button>
        <Button
          type="primary"
          danger
          @click="handleDel"
          data-testid="button_delete"
        >
          删除
          <template #icon>
            <SvgDeleteIcon />
          </template>
        </Button>
      </template>
    </ChcGrid>
  </Page>
</template>

<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  display: none;
}

::v-deep(.ant-btn > svg) {
  margin-right: -2px;
  margin-bottom: 3px;
  margin-left: 2px;
}

::v-deep(.vxe-grid--toolbar-wrapper .vxe-tools--wrapper .ant-btn > svg) {
  margin-right: -1px;
  margin-bottom: 4px;
  margin-left: -5px;
}
</style>
