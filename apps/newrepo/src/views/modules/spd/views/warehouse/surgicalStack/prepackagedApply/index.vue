<script lang="ts" setup>
import { ref } from 'vue';

// import { useUserStore } from '@vben/stores';
import { Page } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import { Button, message, Modal } from 'ant-design-vue';
// console.log(userStore.userInfo, 'userInfo');

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import { packageApply, scanDo } from './api';

const userStore: any = useUserStore();

const extParams = ref<any>({});

// 父表
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      submitOnEnter: false,
      layout: 'horizontal',
      showCollapseButton: false,
      showDefaultActions: false,
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
    queryUrl:
      '/surgicalPackageAction/query.do?packageStatus=S&page=ybzSurgicalApply',
    gridColumns: [
      {
        type: 'radio',
        width: 0,
        fixed: 'left',
        visible: false,
      },
      { title: '序号', type: 'seq', width: 50, align: 'center' },

      { field: 'packageNo', title: '包装号', minWidth: '300', sortable: true },
      {
        field: 'surgicalPackageTypeName',
        title: '套包类型',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'warehouseName',
        title: '仓库',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'bpartnerName',
        title: '执行科室',
        sortable: true,
        minWidth: '150',
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
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/warehouse.do?accessAll=Y&level3=N',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择执行仓库',
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

        fieldName: 'warehouseId',
        label: '执行仓库',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/departmentBPartner.do',
            // dictUrl: '/baseHandleAction/customer.do?isDepartment=Y&readWrite=Y',
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
      {
        component: 'Input',
        fieldName: 'userCode',
        label: '领用人工号',
        componentProps: () => {
          return {
            placeholder: '扫描员工号',
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'packageNo',
        label: '包装号',
        // formItemClass: 'col-start-1',
        componentProps: () => {
          return {
            placeholder: '请输入包装号',
            onPressEnter: async () => {
              handlePackageNoEnter();
            },
          };
        },
      },
      {
        component: 'Checkbox',
        fieldName: 'isRevertScan',
        defaultValue: false,
        label: '反扫',
        // formItemClass: 'col-span-1',
      },
    ],
    tableSearchExtraParams: extParams.value,
    gridEvents: {},
    afterFetchFn: (params) => {
      const rows =
        params.rows?.map((item: any) => {
          return {
            ...item,
          };
        }) || [];

      return {
        ...params,
        records: rows,
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

const handleApply = async () => {
  const formData = await ChcGridApi.formApi.getValues();

  const searchData = await ChcGridApi.formApi.getValues();
  const tableData =
    ChcGridApi.grid.getTableData<Record<string, any>>().visibleData || [];
  if (tableData.length === 0) {
    message.warn('没有需要提交的数据');
    return;
  }

  const errorIndex = tableData.findIndex(
    (item: any) => item.bpartnerId !== searchData.bpartnerId.toString(),
  );

  if (errorIndex !== -1) {
    message.warn(`第${errorIndex + 1}行，手术室不匹配`);
    return;
  }
  if (!formData.userCode) {
    message.warn('请录入领用人工号');
    return;
  }
  Modal.confirm({
    title: '提示',
    content: `确认领用？`,
    onOk: async () => {
      const packageIds = tableData.map((item: any) => item.packageId);
      const param = {
        packageIds,
        userCode: formData.userCode,
        // packageIds: JSON.stringify(packageIds),
      };
      // 发送请求
      packageApply(param).then((res) => {
        if (res && res.success) {
          ChcGridApi.query(searchData);
          message.success('领用成功');
        }
      });
    },
  });
};
// 扫描包装
const handlePackageNoEnter = async () => {
  // const formData = await baseFormApi.getValues();
  const searchData = await ChcGridApi.formApi.getValues();
  let packageNo = searchData.packageNo;
  const warehouseId = searchData.warehouseId;
  const tableData =
    ChcGridApi.grid.getTableData<Record<string, any>>().visibleData || [];

  if (!packageNo) {
    message.warn('请输入包装号');
    return;
  }
  packageNo = packageNo.trim();

  if (searchData.isRevertScan) {
    // 反扫
    const selectData = tableData.find((data: any) => {
      return data.packageNo === packageNo;
    });
    ChcGridApi.formApi?.setFieldValue('packageNo', undefined);

    if (selectData) {
      ChcGridApi.grid.remove(selectData);
    }
  } else {
    // 非反扫
    // 判断有没有扫过
    const hasScaned = tableData.some((data: any) => {
      return data.packageNo === packageNo;
    });
    if (hasScaned) {
      ChcGridApi.formApi?.setFieldValue('packageNo', undefined);
      message.warn(`包装号重复：${packageNo}`);
      return;
    }
    if (!warehouseId) {
      message.warn(`发货仓库不可为空!`);
      return;
    }
    if (!searchData.bpartnerId) {
      message.warn(`手术室不可为空!`);
      return;
    }
    scanDo({ packageNo, warehouseId, bpartnerId: searchData.bpartnerId }).then(
      async (result: any) => {
        if (result.success) {
          ChcGridApi.formApi?.setFieldValue('packageNo', undefined);
          if (result.rows && result.rows.length > 0) {
            const record = result.rows[0];
            await ChcGridApi.grid.insertAt(record);
          } else {
            message.error('无此包装');
          }
        } else {
          message.error(`获取包装失败：${result.msg}`);
        }
      },
    );
  }
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <div class="h-full">
      <ChcGrid class="flex-1 overflow-hidden">
        <template #toolbar-actions>
          <Button
            type="primary"
            @click="handleApply"
            class="mr-[0.5rem]"
            data-testid="button_apply"
          >
            提交
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
