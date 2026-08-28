<script lang="ts" setup>
import { ref } from 'vue';
// import { useRoute } from 'vue-router';

import {
  EditActionIcon,
  IconfontBasicView,
  SvgPrintFillIcon,
} from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';
import { useGlobalPrintStore, useUserStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import { revertDo } from './api';
import detailModalUI from './modals/detailModal.vue';
import processModalUI from './modals/processModal.vue';

const userStore: any = useUserStore();
const [processModal, processModalApi] = useVbenModal({
  connectedComponent: processModalUI,
});
const [detailModal, detailModalApi] = useVbenModal({
  connectedComponent: detailModalUI,
});
// 子表
const [RoleGrid, roleGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {}),
    gridOptions: deepMerge(gridDefaultOptions, {
      proxyConfig: {
        autoLoad: false,
      },
      pagerConfig: {
        // enabled: false,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
    }),
  },
  {
    gridColumns: [
      {
        type: 'radio',
        width: 120,
        fixed: 'left',
        visible: false,
      },
      { title: '序号', type: 'seq', minWidth: 50, align: 'center' },

      {
        field: 'packageNo',
        title: '包装号',
        sortable: true,
        minWidth: '150',
      },

      {
        field: 'surgicalPackageTypeName',
        title: '套包类型',
        sortable: true,
        minWidth: '150',
      },
      {
        field: 'productCount',
        title: '品种数',
        sortable: true,
        minWidth: '150',
      },
      {
        field: 'packageStatusName',
        title: '状态',
        sortable: true,
        minWidth: '150',
      },
      {
        field: 'warehouseName',
        title: '仓库',
        sortable: true,
        minWidth: '110',
      },
      {
        field: 'bpartnerName',
        title: '执行科室',
        sortable: true,
        minWidth: '100',
      },
      {
        field: 'createuserName',
        title: '创建人',
        sortable: true,
        minWidth: '110',
      },
      {
        field: 'created',
        title: '创建时间',
        sortable: true,
        minWidth: '110',
      },
      {
        align: 'center',
        field: 'action',
        slots: { default: 'action' },
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: '操作',
        width: 100,
      },
    ],
    id: 'child',
    queryUrl: `/surgicalPackageAction/query.do`,
    beforeFetchFn: (params) => {
      const { treatmentId } = selectRow.value || {};
      if (isEmpty(treatmentId)) {
        return false;
      }
      return {
        ...params,
        treatmentId,
      };
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
    gridEvents: {
      radioChange: ({ row }: { row: any }) => {
        roleSelectRow.value = row?.packageId ? row : {};
      },
    },
  },
);
// 父表
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      compact: true,
      layout: 'horizontal',
      showCollapseButton: false,
      submitButtonOptions: {
        content: '查询',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      // stripe: true,

      radioConfig: {
        trigger: 'row',
        highlight: true,
      },

      sortConfig: {
        defaultSort: {
          field: 'priorityRuleName',
          order: 'desc',
        },
      },
      pagerConfig: {
        enabled: true,
      },
      proxyConfig: {
        autoLoad: true,
      },
    }),
  },
  {
    id: 'parentTable',
    queryUrl: `/treatmentAction/query.do?isSurgery=Y`,
    gridColumns: [
      {
        type: 'radio',
        width: 120,
        fixed: 'left',
        visible: false,
      },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'surgicalTypeName',
        title: '术式',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'surgeryNo',
        title: '手术编号',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'diagnosis',
        title: '手术名称',
        minWidth: '200',
        sortable: true,
      },
      {
        field: 'surgeryTime',
        title: '手术时间',
        minWidth: '180',
        sortable: true,
      },
      {
        field: 'patientName',
        title: '患者姓名',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'patientSex',
        title: '患者性别',
        minWidth: '90',
        sortable: true,
      },
      {
        field: 'patientAge',
        title: '患者年龄',
        minWidth: '90',
        sortable: true,
      },
      {
        field: 'bedNo',
        title: '床号',
        minWidth: '60',
        sortable: true,
      },
      {
        field: 'patientPhoneNo',
        title: '患者电话',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'doctorName',
        title: '主刀医生',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'bpartnerName',
        title: '开单科室',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'applyBpartnerName',
        title: '执行科室',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'surgicalPackageCount',
        title: '是否已备货',
        minWidth: '120',
        formatter({ row }: any) {
          return row.surgicalPackageCount && row.surgicalPackageCount > 0
            ? '是'
            : '否';
        },
      },
      {
        field: 'surgicalRoomName',
        title: '手术室',
        minWidth: '120',
        sortable: true,
      },
      {
        align: 'center',
        field: 'action',
        slots: { default: 'action' },
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: '操作',
        width: 100,
      },
    ],
    formSchema: [
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/userOrgList.do',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择机构',
            paginate: false,
            allowClear: true,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            defaultValue: '',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['departmentId', 'regionId'],
          show: () => {
            return userStore.userInfo.isSaas;
          },
        },
        fieldName: 'orgId',
        label: '机构',
      },
      {
        component: 'DateGroup',
        fieldName: 'dateOrdered',
        label: '手术时间',
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(7, 'day')
            .format('YYYY-MM-DD'),
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(-1, 'day')
            .format('YYYY-MM-DD'),
        ],
        formItemClass: 'col-span-1',
      },
      {
        component: 'Input',
        fieldName: 'name',
        label: '手术名称',
        componentProps: {
          placeholder: '请输入手术名称',
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            defaultValue: '',
            options: [
              { value: 'N', label: '否' },
              { value: 'Y', label: '是' },
            ],
            placeholder: '',
            paginate: false,
            filterByFrontEnd: true,
            immediate: true,
          };
        },
        fieldName: 'hasPackaged',
        label: '已备货',
      },
    ],
    gridEvents: {
      radioChange: ({ row }: { row: any }) => {
        if (row && row.treatmentId) {
          selectRow.value = row;
          roleGridApi.query({ treatmentId: row.treatmentId });
        } else {
          // 父表没数据，子表要清空
          roleGridApi.grid.remove();
          selectRow.value = {};
          // roleGridApi.query({ orderId: row.orderId });
        }
      },
    },
    beforeFetchFn: (params) => {
      return {
        ...params,
        isSaas: userStore.userInfo.isSaas,
      };
    },
    afterFetchFn: (params) => {
      roleGridApi.grid.reloadData([]);
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

const selectRow: any = ref({});

const handleQuery = () => {
  roleGridApi.query({
    treatmentId: selectRow.value.treatmentId,
  });
  ChcGridApi.formApi.getValues().then((res: any) => {
    ChcGridApi.query({ ...res });
  });
};

const handleProcess = (row: any) => {
  processModalApi.setData(row).open();
};

const handleView = (row: any) => {
  detailModalApi.setData(row).open();
};
const globalPrintStore = useGlobalPrintStore();
const roleSelectRow: any = ref({});
const handlePrintPackage = () => {
  if (!roleSelectRow.value.packageId) {
    message.warn('请选择一条记录');
    return;
  }
  Modal.confirm({
    title: '打印提示',
    content: '确认打印吗？',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      globalPrintStore.print({
        pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/surgicalPackageAction/printPackageDoc.do?id=${roleSelectRow.value.packageId}`,
      });
    },
    onCancel() {},
  });
};

const handlePrint = () => {
  if (!selectRow.value.treatmentId) {
    message.warn('请选择一条记录');
    return;
  }
  Modal.confirm({
    title: '打印提示',
    content: '确认打印吗？',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      globalPrintStore.print({
        pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/surgicalPackageAction/printPackageDoc.do?treatmentId=${selectRow.value.treatmentId}`,
      });
    },
    onCancel() {},
  });
};

const handleRevert = () => {
  if (!selectRow.value.treatmentId) {
    message.warn('请选择一条记录');
    return;
  }
  Modal.confirm({
    title: '提示',
    content: '确认撤销该手术单的套包吗？',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      revertDo({ treatmentId: selectRow.value.treatmentId }).then((res) => {
        if (res && res.success) {
          message.success({
            content: '操作成功',
          });
          handleQuery();
        }
      });
    },
  });
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <div class="h-full">
      <processModal @confirm="handleQuery" />
      <detailModal />
      <PageSplitLazy
        :distribute="0.6"
        :line-thickness="6"
        :is-vertical="false"
        background-color="#f1f3f6"
        hover-color="#c0c4cc"
        :has-line-tip="true"
      >
        <template #first>
          <ChcGrid class="flex-1 overflow-hidden">
            <template #toolbar-actions>
              <Button
                type="primary"
                class="mr-[0.5rem]"
                @click="handlePrint"
                data-testid="button_print"
              >
                打印
                <template #icon>
                  <SvgPrintFillIcon />
                </template>
              </Button>
              <Button
                type="primary"
                class="mr-[0.5rem]"
                @click="handleRevert"
                data-testid="button_revert"
              >
                撤销包装
              </Button>
            </template>
            <template #action="scope">
              <Button
                type="primary"
                style="background-color: #b17a33d4"
                class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
                @click="handleProcess(scope.row)"
                data-testid="button_process"
              >
                加工套包
                <template #icon>
                  <EditActionIcon />
                </template>
              </Button>
            </template>
          </ChcGrid>
        </template>
        <template #second>
          <RoleGrid>
            <template #toolbar-actions>
              <Button
                type="primary"
                @click="handlePrintPackage"
                data-testid="button_printPackage"
              >
                打印包装
                <template #icon>
                  <SvgPrintFillIcon />
                </template>
              </Button>
            </template>
            <template #action="scope">
              <Button
                type="primary"
                style="background-color: #b17a33d4"
                class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
                @click="handleView(scope.row)"
                :data-testid="`button_view_detail_${scope.rowIndex}`"
              >
                查看明细
                <template #icon>
                  <IconfontBasicView />
                </template>
              </Button>
            </template>
          </RoleGrid>
        </template>
      </PageSplitLazy>
    </div>
  </Page>
</template>

<style scoped>
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
