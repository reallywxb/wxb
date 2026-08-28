<script lang="ts" setup>
import { ref } from 'vue';

// import { useUserStore } from '@vben/stores';
import { Page } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import { message, Modal } from 'ant-design-vue';
// console.log(userStore.userInfo, 'userInfo');
import dayjs from 'dayjs';

import { useVbenForm } from '#/adapter/form';
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
      fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
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
    queryUrl:
      '/surgicalPackageAction/query.do?packageStatus=S&page=surgicalApply&isStockup=N',
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
      {
        field: 'surgicalTypeName',
        title: '术式',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'surgeryNo',
        title: '手术编号',
        minWidth: '120',
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
        field: 'kdBpartnerName',
        title: '开单科室',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'sugicalRoomName',
        title: '手术室',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'surgicalPackageTypeName',
        title: '套包类型',
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
        component: 'DateGroup',
        fieldName: 'dateOrdered',
        label: '手术时间',
        formItemClass: 'col-span-1',
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(-1, 'day')
            .format('YYYY-MM-DD'),
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(-1, 'day')
            .format('YYYY-MM-DD'),
        ],
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
            placeholder: '请选择加工仓库',
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
        label: '加工仓库',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
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
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/customer.do?isDepartment=Y&readWrite=Y',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择开单科室',
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

        fieldName: 'kdBpartnerId',
        label: '开单科室',
      },
      {
        component: 'Input',
        fieldName: 'surgeryNo',
        label: '手术单号',
        componentProps: {
          placeholder: '请输入手术单号',
        },
      },
      {
        component: 'Input',
        fieldName: 'patientName',
        label: '患者姓名',
        componentProps: {
          placeholder: '请输入患者姓名',
        },
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
  const formData = await baseFormApi.getValues();

  const searchData = await ChcGridApi.formApi.getValues();
  const tableData = ChcGridApi.grid.getData<Record<string, any>>();
  if (tableData.length === 0) {
    message.warn('没有需要提交的数据');
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

const handlePackageNoEnter = async () => {
  const formData = await baseFormApi.getValues();
  const searchData = await ChcGridApi.formApi.getValues();
  let packageNo = formData.packageNo;
  const warehouseId = searchData.warehouseId;
  packageNo = packageNo.trim();
  const tableData =
    ChcGridApi.grid.getTableData<Record<string, any>>().visibleData || [];

  if (!packageNo) {
    message.warn('请输入包装号');
    return;
  }
  if (formData.isRevertScan) {
    // 反扫
    const selectData = tableData.find((data: any) => {
      return data.packageNo === packageNo;
    });
    baseFormApi?.setFieldValue('packageNo', undefined);

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
      message.warn(`包装号重复：${packageNo}`);
      return;
    }
    scanDo({ packageNo }).then((result: any) => {
      console.warn('scanDo result:', result);
      if (result.success) {
        if (result.rows && result.rows.length > 0) {
          const record = result.rows[0];
          if (record.packageStatus === 'U') {
            message.error(`扫码失败，包装已拆包：${packageNo}`);
          } else if (warehouseId && warehouseId !== record.warehouseId) {
            message.error(`扫码失败，包装不在当前仓库：${packageNo}`);
          } else if (record.isStockUp === 'Y') {
            message.error(`扫码失败，包装为预备货包装：${packageNo}`);
          } else if (record.packageStatus === 'S') {
            baseFormApi?.setFieldValue('packageNo', undefined);
            ChcGridApi.grid.insertAt(record, 0);
            // ChcGridApi.query(searchData);
          } else {
            if (record.packageStatus === 'V') {
              message.error(`扫码失败，包装已作废：${packageNo}`);
            }
            if (record.packageStatus === 'L' || record.packageStatus === 'J') {
              message.error(`扫码失败，包装已领用：${packageNo}`);
            }
            if (record.packageStatus === 'B') {
              message.error(`扫码失败，包装已回库：${packageNo}`);
            }
          }
        } else {
          message.error(`扫码失败，包装未找到：${packageNo}`);
        }
      } else {
        message.error(`扫码失败：${result.msg}`);
      }
    });
  }
};

const [BaseForm, baseFormApi] = useVbenForm({
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 在label后显示一个冒号
    // colon: true,
    labelClass: 'w-[90px]',
    // 所有表单项
    componentProps: {
      // class: 'w-full',
    },
  },

  // 提交函数
  handleSubmit: handleApply,
  submitButtonOptions: {
    content: '领出',
  },
  resetButtonOptions: {
    show: false,
  },

  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行
  actionWrapperClass: 'formActionAreaStyle',
  layout: 'horizontal',
  compact: true,
  showCollapseButton: false,
  // id: 'BaseForm',
  showDefaultActions: true,
  schema: [
    {
      component: 'Input',
      fieldName: 'packageNo',
      label: '包装号',
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
      formItemClass: 'col-span-1',
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
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-5',
});
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <div class="h-full">
      <ChcGrid class="flex-1 overflow-hidden">
        <template #toolbar-actions>
          <BaseForm style="width: 100%" />
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
