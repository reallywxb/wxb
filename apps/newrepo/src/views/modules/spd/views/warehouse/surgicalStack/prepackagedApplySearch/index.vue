<script lang="ts" setup>
import { ref } from 'vue';

import { IconfontBasicView, SvgPrintFillIcon } from '@vben/chc-icons';
// import { useUserStore } from '@vben/stores';
import { Page, useVbenModal } from '@vben/common-ui';
import { useGlobalPrintStore, useUserStore } from '@vben/stores';

import { Button, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import detailModalUI from '../surgicalPackage/modals/detailModal.vue';

const userStore: any = useUserStore();

const extParams = ref<any>({});
const globalPrintStore = useGlobalPrintStore();
const [detailModal, detailModalApi] = useVbenModal({
  connectedComponent: detailModalUI,
});

// 父表
const [ChcGrid] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [
        ['dateOrdered', ['createDateFrom', 'createDateTo'], 'YYYY-MM-DD'],
      ],
      compact: true,
      layout: 'horizontal',
      // showCollapseButton: false,
      submitButtonOptions: {
        content: '查询',
      },
      commonConfig: {
        labelClass: 'w-[90px]',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: true,
      proxyConfig: {
        autoLoad: true,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      pagerConfig: {
        enabled: true,
      },
    }),
  },
  {
    id: 'parent',
    queryUrl: '/surgicalPackageAction/query.do?isStockup=Y',
    gridColumns: [
      {
        type: 'radio',
        width: 0,
        fixed: 'left',
        visible: false,
      },
      { title: '序号', type: 'seq', width: 50, align: 'center' },

      { field: 'packageNo', title: '包装号', minWidth: '180', sortable: true },
      {
        field: 'surgicalPackageTypeName',
        title: '套包类型',
        minWidth: '90',
        sortable: true,
      },
      {
        field: 'createUserName',
        title: '加工人',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'created',
        title: '加工时间',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'applyUserName',
        title: '领用人',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'applyTime',
        title: '领用时间',
        minWidth: '120',
      },
      {
        field: 'completeUserName',
        title: '回库人',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'completeTime',
        title: '回库时间',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'packageStatusName',
        title: '包装状态',
        minWidth: '90',
        sortable: true,
      },
      {
        field: 'bpartnerName',
        title: '执行科室',
        minWidth: '100',
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
        label: '加工时间',
        formItemClass: 'col-span-1',
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(7, 'day')
            .format('YYYY-MM-DD'),
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(-1, 'day')
            .format('YYYY-MM-DD'),
        ],
      },
      {
        component: 'Input',
        fieldName: 'packageNo',
        label: '包装号',
        componentProps: {
          placeholder: '请输入包装号',
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl:
              '/baseHandleAction/refList.do?id=M_Surgical_Package.PackageStatus',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择包装状态',
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

        fieldName: 'packageStatus',
        label: '包装状态',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/customer.do?isDepartment=Y&readWrite=Y',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择执行科室',
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

        fieldName: 'bpartnerId',
        label: '执行科室',
      },
    ],
    tableSearchExtraParams: extParams.value,
    gridEvents: {
      radioChange: ({ row }: { row: any }) => {
        selectRow.value = row?.packageId ? row : {};
      },
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows || [],
      };
    },
    beforeFetchFn: (params) => {
      return {
        ...params,
        isSaas: userStore.userInfo.isSaas,
      };
    },
  },
);

const handleView = (row: any) => {
  detailModalApi.setData(row).open();
};
const selectRow = ref<any>({});

const handlePrint = () => {
  if (!selectRow.value.packageId) {
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
        pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/surgicalPackageAction/printPackageDoc.do?isybz=Y&id=${selectRow.value.packageId}`,
      });
    },
    onCancel() {},
  });
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <div class="h-full">
      <detailModal />
      <ChcGrid class="flex-1 overflow-hidden">
        <template #toolbar-actions>
          <Button
            type="primary"
            class="mr-[0.5rem]"
            @click="handlePrint"
            data-testid="button_print"
          >
            <template #icon>
              <SvgPrintFillIcon />
            </template>
            打印
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
      </ChcGrid>
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
