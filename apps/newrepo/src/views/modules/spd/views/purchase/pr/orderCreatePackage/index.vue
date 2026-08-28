<script setup lang="ts">
import { h, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { SvgDeleteIcon } from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';

import { Button, message, Modal } from 'ant-design-vue'; // 获取Vxe的select组件

import { requestFormClient } from '#/api/request';
import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepClone, deepMerge } from '#/utils/util';

import choosePkgModal from './modals/choosePkgModal.vue';
import createModal from './modals/createModal.vue';

const route = useRoute();

const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数
console.warn('urlParams', urlParams);

// const isFirstLoaded = ref(false); // 是否已初次加载完

const [ChoosePkgModal, choosePkgModalApi] = useVbenModal({
  class: 'w-[1300px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: choosePkgModal,
  draggable: true,
});

const [CreateModal, createModalApi] = useVbenModal({
  class: 'w-[1300px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: createModal,
  draggable: true,
});
const scanedPackageCount = ref();
const departmentId = ref<number | string>('');
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      showCollapseButton: false,
      showDefaultActions: false,
      commonConfig: {
        labelClass: 'w-[90px]',
      },
    }),

    gridOptions: deepMerge(gridDefaultOptions, {
      checkboxConfig: {
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false, // 表格初始化时不自动查询数据
      },
      seqConfig: {
        seqMethod: ({ rowIndex }: { rowIndex: number }) => {
          return rowIndex + 1;
        },
      },
    }),
    // 添加表格事件监听
    gridEvents: {},
  },
  {
    formSchema: [
      {
        component: 'ChcSelect',
        fieldName: 'departmentId',
        label: '院区',
        defaultValue: '',
        componentProps: () => {
          return {
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            placeholder: '',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            onChange(val: any) {
              departmentId.value = val;
            },
            afterFetch(res: any) {
              if (!departmentId.value) {
                ChcGridApi.formApi.getFieldComponentRef(
                  'warehouseId',
                ).params.dependencies = {
                  regionId: -1,
                  departmentId: -1,
                };
                ChcGridApi.formApi
                  ?.getFieldComponentRef('warehouseId')
                  ?.fetchApi();
              }
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'warehouseId',
        label: '仓库',
        componentProps: () => {
          return {
            dictUrl:
              '/baseHandleAction/warehouse.do?readWrite=Y&level2=N&level3=N',
            placeholder: '请选择仓库',
            triggerFields: ['departmentId', 'regionId'],
            paginate: false,
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            allowClear: true,
            autoChooseFirstOption: true,
            afterFetch(res: any) {
              if (res.rows?.length) {
                const firstOption = res.rows[0];
                ChcGridApi.formApi?.setFieldValue(
                  'warehouseId',
                  firstOption.id,
                );
              }
              return { ...res, rows: undefined, records: res.rows };
            },
            onChange(val: any) {
              console.warn('warehouseId change', val);
            },
          };
        },
        dependencies: {
          triggerFields: ['departmentId', 'regionId'],
          trigger(values: any) {
            if (
              ChcGridApi.formApi?.getFieldComponentRef &&
              typeof ChcGridApi.formApi?.getFieldComponentRef === 'function' &&
              ChcGridApi.formApi?.getFieldComponentRef('warehouseId')
            ) {
              ChcGridApi.formApi.getFieldComponentRef(
                'warehouseId',
              ).params.dependencies = {
                regionId: values.departmentId,
                departmentId: values.departmentId,
              };
              ChcGridApi.formApi
                ?.getFieldComponentRef('warehouseId')
                ?.fetchApi();
              ChcGridApi.formApi?.setFieldValue('warehouseId', undefined);
            }
          },
        },
      },
      {
        component: 'Input',
        fieldName: 'packageNo',
        label: '包装号',
        defaultValue: '',
        componentProps: () => {
          return {
            placeholder: '',
            maxlength: 50,
            onPressEnter: (e: any) => {
              console.warn('onPressEnter', e);
              // 阻止表单冒泡
              e.preventDefault && e.preventDefault();
              e.stopPropagation && e.stopPropagation();
              handlePackageNoEnter();
            },
          };
        },
      },
      {
        component: 'Checkbox',
        fieldName: 'revertScan',
        label: '反扫',
        defaultValue: false,
      },
    ],
    gridColumns: [
      {
        type: 'seq',
        width: '50',
        align: 'center',
        title: '序号',
      },
      {
        field: 'packageNo',
        title: '包装号',
        width: 100,
        sortable: false,
      },
      {
        field: 'productCode',
        title: '药品编码',
        width: 150,
        sortable: true,
      },
      {
        field: 'productName',
        title: '药品名称',
        width: '150',
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        width: '90',
        sortable: true,
      },
      {
        field: 'modelNo',
        title: '型号',
        width: '90',
        sortable: true,
        visible: false,
      },
      {
        field: 'manufacturer',
        title: '厂家',
        width: '100',
        sortable: true,
      },
      {
        field: 'qty',
        title: '数量',
        width: '50',
        align: 'right',
        sortable: false,
      },
      {
        field: 'uomName',
        title: '单位',
        width: '40',
        sortable: false,
      },
      {
        field: 'lot',
        title: '批号',
        width: '80',
        sortable: false,
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        width: '80',
        sortable: false,
      },
      {
        field: 'vendorName',
        title: '供应商',
        width: '120',
        sortable: true,
      },
      {
        field: 'price',
        title: '进价',
        width: '70',
        align: 'right',
        sortable: true,
      },
      {
        field: 'price1',
        title: '采购价',
        width: '70',
        align: 'right',
        sortable: true,
        formatter({ row }: any) {
          return row.price;
        },
      },
      {
        field: 'storageStatusName',
        title: '库存状态',
        width: 120,
        sortable: true,
      },
      {
        field: 'locatorName',
        title: '货位',
        width: '90',
        sortable: false,
      },
      {
        field: 'warehouseName',
        title: '仓库',
        width: '120',
        sortable: false,
      },
      {
        field: 'action',
        fixed: 'right',
        title: '操作',
        align: 'center',
        width: 100,
        slots: {
          default: (scope) => {
            return h(
              Button,
              {
                type: 'primary',
                'data-testid': `button_delete_${scope.rowIndex}`,
                danger: true,
                ghost: true,
                class: 'h-[24px] pb-0 pl-[6px] pr-[6px] pt-0 text-[14px]',
                onClick() {
                  console.warn('单元格点击', scope);
                  // 删除此行
                  ChcGridApi.grid.remove(scope.row);
                },
              },
              {
                icon: () => h(SvgDeleteIcon),
              },
            );
          },
        },
      },
    ],
    id: 'orderCreatePackage',
  },
);

const genOrder = async () => {
  const formValues = await ChcGridApi.formApi.getValues();
  const checkedRows: any[] = ChcGridApi.grid.getTableData().fullData || [];
  console.warn('genOrder checkedRows:', checkedRows);
  const unProxyRows: any[] = toRaw(checkedRows);
  const warehouseId = Number(formValues.warehouseId);
  if (!warehouseId) {
    message.warning('请选择退货仓库！');
    return;
  }
  let vendorId: any;
  let error = false;
  unProxyRows.forEach((item, index) => {
    if (warehouseId !== Number(item.warehouseId)) {
      message.warning(
        `第${index + 1}行,${item.productName}(${item.productCode})` +
          `仓库不一致!`,
      );
      error = true;
    }
    if (!vendorId) {
      vendorId = item.vendorId;
    } else if (vendorId !== item.vendorId) {
      message.warning(
        `第${index + 1}行,${item.productName}(${item.productCode})` +
          `供应商不一致!`,
      );
      error = true;
    }
  });
  if (error) {
    return;
  }

  if (unProxyRows.length <= 0) {
    message.warning('请选择包装！');
    return;
  }

  createModalApi
    .setData({
      allowPRUpdateVendor: 'N', // 定数采退无法确定批次采购类型，不允许修改供应商
      warehouseName: unProxyRows[0].warehouseName,
      warehouseId,
      bpartnerId: vendorId,
      rows: unProxyRows,
      callBack() {
        ChcGridApi.grid.reloadData([]);
      },
    })
    .open();
};
const removeAll = () => {
  Modal.confirm({
    title: '提示',
    content: '确认清除已选择包装吗？',
    okText: '确定',
    cancelText: '取消',
    onOk() {
      ChcGridApi.formApi.setValues({
        packageNo: '',
      });
      ChcGridApi.grid.reloadData([]);
    },
  });
};
const choosePkg = async () => {
  const formValues = await ChcGridApi.formApi.getValues();
  const checkedRows = ChcGridApi.grid.getTableData().fullData || [];
  console.warn('choosePkg formValues', formValues);
  console.warn('choosePkg checkedRows', checkedRows);
  choosePkgModalApi
    .setData({
      warehouseId: formValues.warehouseId,
      checkedRows: deepClone(checkedRows),
      callback(rows: any[]) {
        ChcGridApi.grid.reloadData(rows);
      },
    })
    .open();
};
const handlePackageNoEnter = async () => {
  const formValues = await ChcGridApi.formApi.getValues();
  console.warn('handlePackageNoEnter formValues', formValues);
  const packageNo = formValues.packageNo;
  if (!packageNo) {
    message.warning('请输入包装号！');
    return;
  }
  const revertScan = formValues.revertScan;
  if (revertScan) {
    const rows = ChcGridApi.grid.getTableData().fullData || [];
    let unProxyRows: any[] = toRaw(rows);
    unProxyRows = unProxyRows.filter((item) => item.packageNo !== packageNo);
    ChcGridApi.formApi.setValues({
      packageNo: '',
    });
    scanedPackageCount.value = unProxyRows.length;
    ChcGridApi.grid.reloadData(unProxyRows);
  } else {
    const warehouseId = formValues.warehouseId;
    if (!warehouseId) {
      message.warning('请选择仓库！');
      return;
    }
    const rows = ChcGridApi.grid.getTableData().fullData || [];
    const unProxyRows: any[] = toRaw(rows);

    for (const unProxyRow of unProxyRows) {
      if (unProxyRow.packageNo === packageNo) {
        message.warning(`包装号重复：${packageNo}`);
        return;
      }
    }
    try {
      const res = await requestFormClient.post('/packageAction/query.do', {
        packageNo,
      });
      if (res.success) {
        if (res.rows && res.rows.length > 0) {
          const record = res.rows[0];
          if (record.packageStatus !== 'S' && record.packageStatus !== 'D') {
            message.error(`扫码失败，包装不在库：${packageNo}`);
          } else if (
            warehouseId &&
            Number(warehouseId) !== Number(record.warehouseId)
          ) {
            message.error(`扫码失败，包装不在当前仓库：${packageNo}`);
          } else {
            unProxyRows.unshift(record);
            ChcGridApi.grid.reloadData(unProxyRows);
            scanedPackageCount.value = unProxyRows.length;
            ChcGridApi.formApi.setValues({
              packageNo: '',
            });
          }
        } else {
          message.error(`扫码失败，包装未找到：${packageNo}`);
        }
      } else {
        message.error(`扫码失败：${res.msg}`);
      }
    } catch (error) {
      console.error(error);
    }
  }
};
</script>
<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <ChoosePkgModal />
    <CreateModal />
    <ChcGrid>
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="choosePkg"
          class="mr-[0.5rem]"
          data-testid="button_choose_pkg"
        >
          选择包装
        </Button>
        <Button
          type="primary"
          @click="genOrder"
          class="mr-[0.5rem]"
          data-testid="button_gen_order"
        >
          生成定数采退
        </Button>
        <Button
          type="primary"
          danger
          @click="removeAll"
          class="mr-[0.5rem]"
          data-testid="button_remove_all"
        >
          清除
        </Button>
      </template>
      <template #toolbar-tools>
        <span>已扫包数:{{ scanedPackageCount }}</span>
      </template>
    </ChcGrid>
  </Page>
</template>
<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  display: none;
}

.custom-dropdown {
  padding: 8px;
}

.tableHeader {
  position: absolute;
  top: 0;
  z-index: 99;
  height: 40px;
  margin-top: 10px;
  font-family: 'HiraginoSansGB-W3';
  font-size: 14px;
  font-weight: 600;
  line-height: 40px;
  color: #fff;
  background: rgb(64 158 255);
}

.tableHeader span {
  box-sizing: border-box;
  width: 100px;
  text-align: center;
}
</style>
