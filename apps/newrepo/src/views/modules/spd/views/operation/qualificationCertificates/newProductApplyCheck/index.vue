<script setup lang="ts">
import type { ApplyOrRejectParams } from './api';

import { h, onMounted, ref, toRaw } from 'vue';

import { SvgDeleteIcon, SvgSaveIcon } from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';

import { Button, message, Modal } from 'ant-design-vue';

import { useSpdGrid } from '#/components/spd';

import { applyOrReject } from './api';
import licenseDetail from './modal/licenseDetail.vue';
import {
  commonFormOptions,
  formSchema,
  gridColumns,
  viewFormOptions,
} from './options';

const extParams = ref<{}>({});

const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: {
      handleSubmit: async (values) => {
        console.warn('values', values);
        const formValues = await ChcGridApi.formApi.getValues();
        ChcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
        ChcGridApi.reload(formValues);
      },
    },
    gridOptions: {
      proxyConfig: {
        autoLoad: true,
      },
    },
    // 添加表格事件监听
    gridEvents: {
      // 单个复选框变化事件
      // checkboxChange: ({ records }: { records: any[] }) => {
      //   calculateSelectedAmount(records);
      // },
      // // 全选/全不选事件
      // checkboxAll: ({ records }: { records: any[] }) => {
      //   calculateSelectedAmount(records);
      // },
    },
  },
  {
    gridColumns,
    formSchema,
    dataTableId:
      '/newProductApplyAction/queryNewProductApply.do?status=WC&page=check',
    commonFormOptions,
    viewFormOptions,
    showCustomBtn: true,
    showZoomBtn: true,
    tableSearchExtraParams: extParams.value,
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
    customModals: {
      // 'CommonImportModal-importModalApi': deepMerge(importModalDefaultOptions, {
      //   // 连接抽离的组件
      //   connectedComponent: ImportModalComp,
      // }),
    },
  },
);

// 审核通过处理函数
const handleApproval = () => {
  // 先检查是否有选中的行数据
  const selectCheckedRows = ChcGridApi.grid.getCheckboxRecords();
  console.warn('handleApproval', selectCheckedRows.value);
  if (selectCheckedRows.length === 0) {
    message.warning('请选择申请！');
    return;
  }
  // 有选中数据才弹出确认框
  Modal.confirm({
    title: '提示',
    content: `确认通过勾选的 ${selectCheckedRows.value.length} 条数据？`,
    onOk: async () => {
      try {
        const ids: ApplyOrRejectParams[] = [];
        selectCheckedRows.value.forEach((row: any) => {
          ids.push({
            applySyncId: row.applyId,
            status: 'PS',
            checkRemark: '',
          });
        });
        const params = {
          ids: JSON.stringify(ids),
        };
        console.warn('params===>', params);
        await applyOrReject(params)
          .then((res) => {
            if (res && res.success) {
              // 刷新表格数据
              ChcGridApi.formApi.getValues().then((resData: any) => {
                ChcGridApi.query({ ...resData });
              });
              message.success('操作成功');
            } else {
              message.error(res.msg || '操作失败');
            }
          })
          .catch((error) => {
            console.error('失败', error);
          });
        ChcGridApi.query();
      } catch {
        message.error('确认失败');
      }
    },
  });
};

// 拒绝处理函数
const handleReject = () => {
  // 先检查是否有选中的行数据
  const selectCheckedRows = ChcGridApi.grid.getCheckboxRecords();
  if (selectCheckedRows.length === 0) {
    message.warning('请选择申请！');
    return;
  }
  Modal.confirm({
    title: '请输入驳回原因',
    content: h('textarea', {
      id: 'reject-reason',
      placeholder: '',
      rows: 4,
      style: {
        width: '100%',
        padding: '6px 10px',
        border: '1px solid #e6e6e6',
        color: '#333',
        outline: 'none',
      },
    }),
    onOk: async () => {
      const rejectReason = (
        document.querySelector('#reject-reason') as HTMLTextAreaElement
      )?.value;
      try {
        const ids = selectCheckedRows.value.map((row: any) => ({
          applySyncId: row.applyId,
          status: 'NO',
          checkRemark: rejectReason,
        }));
        console.warn('ids', ids);
        const params = {
          ids: JSON.stringify(ids),
        };
        const res = await applyOrReject(params);
        if (res && res.success) {
          message.success('成功驳回！');
          // 刷新表格数据
          ChcGridApi.formApi.getValues().then((resData: any) => {
            ChcGridApi.query({ ...resData });
          });
        } else {
          message.error(res.msg || '操作失败');
        }
      } catch {
        message.error('作废失败');
      }
    },
  });
};

const [licenseDetailModal, licenseDetailModalApi] = useVbenModal({
  class: 'w-[600px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: licenseDetail,
  draggable: true,
});
const handleDetail = (scope: any) => {
  console.warn('scope', scope.row);
  licenseDetailModalApi
    ?.setData({
      row: scope.row,
      callback() {
        // 刷新表格数据
        ChcGridApi.query();
      },
    })
    .open();
};

onMounted(() => {
  console.warn('urlParams');
});
</script>
<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <licenseDetailModal />
    <ChcGrid>
      <template #action="scope">
        <Button
          type="primary"
          class="h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleDetail(scope)"
        >
          证照详情
        </Button>
      </template>
      <template #toolbar-actions>
        <Button type="primary" class="mr-[0.5rem]" @click="handleApproval">
          通过
          <template #icon>
            <SvgSaveIcon />
          </template>
        </Button>
        <Button type="primary" class="mr-[0.5rem]" @click="handleReject">
          拒绝
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
  /* visibility: hidden; */
  display: none;
}

::v-deep(.ant-btn > svg) {
  margin-bottom: 4px;
  margin-left: -2px;
}
</style>
