<script lang="ts" setup>
import { reactive } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';
import qs from 'qs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import { savePCLRoleAccess } from './api';

const tableSearchExtraParams = reactive({});

const [ChcGrid, chcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [],
      commonConfig: {
        labelClass: 'w-[90px]',
      },
      compact: true,
      layout: 'horizontal',
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      checkboxConfig: {
        highlight: true,
        trigger: 'row',
      },
      proxyConfig: {
        autoLoad: false,
      },
      // cellConfig: {
      //   height: 32,
      // },
    }),
  },
  {
    gridColumns: [
      { type: 'checkbox', title: '', width: 50, align: 'center' },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'name',
        minWidth: 120,
        sortable: true,
        title: '角色名称',
      },
      // {
      //   field: 'oldvalue',
      //   minWidth: 120,
      //   sortable: true,
      //   title: '旧值',
      //   formatter: ({ cellValue }: any) => {
      //     if (cellValue === 'true') {
      //       return '是';
      //     } else if (cellValue === 'false') {
      //       return '否';
      //     } else {
      //       return cellValue;
      //     }
      //   },
      // },
      // {
      //   field: 'newvalue',
      //   minWidth: 120,
      //   sortable: true,
      //   title: '新值',
      //   formatter: ({ cellValue }: any) => {
      //     if (cellValue === 'true') {
      //       return '是';
      //     } else if (cellValue === 'false') {
      //       return '否';
      //     } else {
      //       return cellValue;
      //     }
      //   },
      // },
      // {
      //   field: 'realname',
      //   minWidth: 120,
      //   sortable: true,
      //   title: '操作人',
      // },
      // {
      //   field: 'created',
      //   minWidth: 120,
      //   sortable: true,
      //   title: '操作时间',
      // },
    ],
    dataTableId: '/productControlLevelAction/queryPCLRoleAccess.do',
    id: 'queryPCLRoleAccess',
    tableSearchExtraParams,
    afterFetchFn(params) {
      setTimeout(() => {
        params.rows
          .filter(({ isActive }) => isActive === 'Y')
          .forEach((row) => {
            chcGridApi.grid.setCheckboxRow(row, true);
          });
      }, 0);
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

const [ModalFirst, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },
  confirmDisabled: false,
  showCancelButton: true,
  showConfirmButton: true,
  confirmText: '提交',
  cancelText: '关闭',
  onConfirm() {
    const records = chcGridApi.grid.getCheckboxRecords();

    savePCLRoleAccess(
      qs.stringify({
        ...tableSearchExtraParams,
        roleIds: records.map(({ roleId }) => roleId),
      }),
    );

    modalApi.close();

    message.success('操作成功');
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const data = modalApi.getData<Record<string, any>>();

      Object.assign(tableSearchExtraParams, {
        pcl: data.pcl,
      });
      setTimeout(() => {
        chcGridApi.query();
      }, 200);
    }
  },
});
</script>
<template>
  <ModalFirst confirm-text="提交" title="授权角色" title-tooltip="授权角色">
    <ChcGrid style="height: 600px" />
  </ModalFirst>
</template>

<style scoped lang="scss">
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  /* visibility: hidden; */
  display: none;
}
</style>
