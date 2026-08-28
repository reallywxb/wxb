<script lang="ts" setup>
import { ref } from 'vue';

import { SvgPrintFillIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import { Button, message, Modal } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import { packageConsume } from './api';

const userStore: any = useUserStore();

const extParams = ref<any>({});

const handlePackageNoEnter = async () => {
  const formData = await ChcGridApi.formApi.getValues();
  if (formData.packageNo) {
    ChcGridApi.query({
      ...formData,
    });
  }
};

// 父表
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      showCollapseButton: false,
      showDefaultActions: false,
      commonConfig: {
        labelClass: 'w-[90px]',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: true,
      proxyConfig: {
        // autoLoad: true,
      },
      checkboxConfig: {
        // trigger: 'default',
        highlight: true,
      },
      pagerConfig: {
        enabled: false,
      },
      editConfig: {
        enabled: true,
        mode: 'row',
        trigger: 'click',
        showStatus: false,
        showIcon: false,
        autoClear: true,
        beforeEditMethod: ({ row }: { row: any }) => {
          return row.isFee === 'N';
        },
      },
    }),
  },
  {
    id: 'parent',
    queryUrl: '/surgicalPackageAction/queryReturnConsume.do',
    gridColumns: [
      {
        type: 'checkbox',
        title: '',
        width: 50,
        fixed: 'left',
        align: 'center',
      },
      {
        field: 'index',
        title: '序号',
        width: 50,
        align: 'center',
        formatter(scope: any) {
          return scope.rowIndex + 1;
        },
      },

      { field: 'packageNo', title: '包装号', minWidth: '180', sortable: true },
      {
        field: 'productName',
        title: '药品名称',
        width: '150',
        sortable: true,
      },
      {
        field: 'productCode',
        title: '药品编码',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        width: '150',
        sortable: true,
      },
      {
        field: 'manufacturer',
        title: '厂家',
        width: '150',
        sortable: true,
      },
      {
        field: 'qty',
        title: '总数量',
        width: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'consumeQty',
        title: '消耗数量',
        width: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'leftQty',
        title: '剩余数量',
        width: '100',
        align: 'right',
        sortable: true,
        editRender: {
          name: 'VxeNumberInput',
          props: {
            type: 'integer',
            min: 0,
          },
        },
      },
      {
        field: 'uomName',
        title: '单位',
        width: '100',
        sortable: true,
      },
      {
        field: 'surgeryNo',
        title: '手术单号',
        width: '150',
        sortable: true,
      },
      {
        field: 'surgeryTime',
        title: '手术时间',
        width: '150',
        sortable: true,
      },
      {
        field: 'doctorName',
        title: '医生',
        width: '100',
        sortable: true,
      },
      {
        field: 'patientName',
        title: '患者',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'bedNo',
        title: '床号',
        sortable: true,
        minWidth: '150',
      },
      {
        field: 'sugicalRoomName',
        title: '手术室',
        minWidth: '150',
        sortable: true,
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
        component: 'Input',
        fieldName: 'packageNo',
        label: '包装号',
        componentProps: () => {
          return {
            placeholder: '扫描包装号',
            onPressEnter: async () => {
              handlePackageNoEnter();
            },
          };
        },
      },
    ],
    tableSearchExtraParams: extParams.value,
    gridEvents: {},
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

const handleSubmit = () => {
  const selectedRows = ChcGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.warn('没有需要提交的数据');
    return;
  }
  const noQtyIndex = selectedRows.findIndex(
    (item: any) => !item.leftQty && item.leftQty !== 0,
  );
  if (noQtyIndex !== -1) {
    return message.warn(`第${noQtyIndex + 1}行，没有填写剩余数量`);
  }
  const packages = selectedRows.map((content: any) => {
    return {
      isFee: content.isFee,
      packageId: content.packageId,
      productId: content.productId,
      qtyBilled: content.consumeQty,
      qtyConsumed: content.qty - content.leftQty,
    };
  });
  Modal.confirm({
    title: '提示',
    content: '确认回库？',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      packageConsume({ data: JSON.stringify(packages) }).then((res: any) => {
        if (res && res.success) {
          message.success('回库成功');
          ChcGridApi.grid.remove();
        }
      });
    },
    onCancel() {},
  });
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <div class="h-full">
      <ChcGrid class="flex-1 overflow-hidden">
        <template #toolbar-actions>
          <Button
            type="primary"
            class="mr-[0.5rem]"
            @click="handleSubmit"
            data-testid="button_submit"
          >
            <template #icon>
              <SvgPrintFillIcon />
            </template>
            确认回库
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
