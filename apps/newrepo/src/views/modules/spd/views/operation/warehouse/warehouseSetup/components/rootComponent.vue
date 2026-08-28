<script setup lang="ts">
import type { WarehouseTableType } from '../api';

import type { VbenFormProps } from '#/adapter/form';

import { inject, onMounted, ref } from 'vue';

import {
  AddActionIcon,
  EditActionIcon,
  UploadActionIcon,
} from '@vben/chc-icons';
import { useVbenModal, z } from '@vben/common-ui';

import { Button, Card, message, TabPane, Tabs } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import { saveWarehouse } from '../api';
import { TREE_CONTEXT_KEY } from '../index';
import addAndEditFormCom from '../modals/addAndEditFormModal.vue';
import importLocationModalCom from '../modals/importLocationModal.vue';
import importProductControlModalCom from '../modals/importProductControlModal.vue';
import importWarehouseModalCom from '../modals/importWarehouseModal.vue';

const treeContext = inject(TREE_CONTEXT_KEY);
// const totalData = ref(0);
const activeTab = ref<string>('1');
const [EndemicGrid, endemicGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      showCollapseButton: false,
      submitButtonOptions: {
        content: '查询',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
      pagerConfig: {
        enabled: true,
      },
    }),
  },
  {
    id: 'rootGrid',
    // api地址
    queryUrl: 'warehouseAction/queryWarehouse.do?type=mc',
    gridColumns: [
      {
        type: 'radio',
        title: '',
        width: 50,
        align: 'center',
        visible: false,
      },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'warehouseCode',
        title: '仓库编码',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'name',
        title: '仓库名称',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'value',
        title: '搜索码',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'campusName',
        title: '院区',
        minWidth: '130',
        sortable: true,
      },
      {
        field: 'departmentName',
        title: '科室',
        minWidth: '130',
        sortable: true,
      },
      {
        field: 'warehouseTypeName',
        title: '仓库类型',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'address',
        title: '地址',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'warehousePolicyName',
        title: '默认作业策略',
        minWidth: '120',
        sortable: true,
        align: 'center',
      },
      {
        field: 'replenishPolicyName',
        title: '默认补货策略',
        minWidth: '120',
        sortable: true,
        align: 'center',
      },
      {
        field: 'parentWarehouseName',
        title: '默认补货仓库',
        minWidth: '120',
        sortable: true,
        align: 'center',
      },
      {
        field: 'isInventorying',
        title: '盘点中',
        minWidth: '60',
        formatter({ cellValue }) {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isActive',
        title: '有效的',
        minWidth: '60',
        formatter({ cellValue }) {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isHisWarehouse',
        title: 'his管理库存',
        minWidth: '120',
        formatter({ cellValue }) {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isStandAlone',
        title: '第三方仓库',
        minWidth: '120',
        formatter({ cellValue }) {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'description',
        title: '描述',
        minWidth: '200',
      },
    ],
    // 表单配置
    formSchema: [
      {
        component: 'Input',
        fieldName: 'warehouseName',
        label: '仓库',
        labelClass: 'w-[fit-content]',
        componentProps: () => {
          return {
            placeholder: '请输入名称/编码/搜索码',
            defaultValue: '',
          };
        },
      },
    ],
    beforeFetchFn: (params) => {
      const data = {
        ...params,
      };
      const selectedNode = treeContext?.selectedNode;
      if (selectedNode.value?.type === 'warehouseType') {
        data.warehouseType = selectedNode.value?.id;
      }
      return data;
    },
    tableSearchExtraParams: {},
  },
);

// 新增和编辑弹框
const [AddAndEditFormModal, AddAndEditFormModalApi] = useVbenModal({
  class: 'w-[75%]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: addAndEditFormCom,
  draggable: true,
});

/**
 * 页面弹窗表单配置
 */
const formOptions: VbenFormProps = {
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-[20vw]',
    },
  },
  layout: 'vertical',
  schema: [
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入仓库名称',
      },
      fieldName: 'name',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '仓库名称',
      rules: z.string().nonempty('请输入仓库名称'),
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入仓库编码',
      },
      fieldName: 'warehouseCode',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '仓库编码',
      rules: z.string().nonempty('请输入仓库编码'),
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入仓库搜索码',
      },
      fieldName: 'value',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '仓库搜索码',
      rules: z.string().nonempty('请输入仓库搜索码'),
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          autoChooseFirstOption: true,
          dictUrl: '/baseHandleAction/refList.do?id=1000457',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择',
          paginate: false,
          filterByFrontEnd: true,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            res.rows?.forEach((row) => {
              row.id = row.id.toString();
            });
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'warehouseType',
      label: '仓库类型',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      // rules: z.string().nonempty('请选择仓库类型'),
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          autoChooseFirstOption: true,
          dictUrl: '/baseHandleAction/departmentList.do',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择',
          paginate: false,
          filterByFrontEnd: true,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            res.rows?.forEach((row) => {
              row.id = row.id.toString();
            });
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'departmentId',
      label: '科室病区类型',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      rules: z.string().nonempty('请选择科室病区类型'),
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入仓库地址',
      },
      fieldName: 'address',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '仓库地址',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/warehouseAction/warehousePolicyList.do',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          allowClear: true,
          placeholder: '请选择默认作业策略',
          paginate: false,
          filterByFrontEnd: true,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            res.rows?.forEach((row) => {
              row.id = row.id.toString();
            });
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'warehousePolicyId',
      label: '默认作业策略',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/warehouseAction/replenishPolicyList.do',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          allowClear: true,
          placeholder: '请选择默认补货策略',
          paginate: false,
          filterByFrontEnd: true,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            res.rows?.forEach((row) => {
              row.id = row.id.toString();
            });
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'replenishPolicyId',
      label: '默认补货策略',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/warehouseAction/queryParentWarehouse.do',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          allowClear: true,
          placeholder: '请选择默认补货仓库',
          paginate: false,
          filterByFrontEnd: true,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            res.rows?.forEach((row) => {
              row.id = row.id.toString();
            });
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'parentWarehouseId',
      label: '默认补货仓库',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
    {
      component: 'Switch',
      fieldName: 'isActive',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '是否有效',
    },
    {
      component: 'Switch',
      fieldName: 'isHisWarehouse',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: 'his管理仓库',
    },
    {
      component: 'Switch',
      fieldName: 'isStandAlone',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '第三方仓库',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入描述',
      },
      fieldName: 'description',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '描述',
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: false,
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
  wrapperClass: 'grid-cols-12',
};

// 新增
const createWarehouse = () => {
  console.warn('新增仓库');
  AddAndEditFormModalApi.setData({
    title: '添加仓库',
    type: 'add',
    form: {
      warehouseId: undefined,
      name: '',
      value: '',
      campusName: '',
      departmentName: '',
      warehouseTypeName: '',
      address: '',
      warehousePolicyId: null,
      warehousePolicyName: '',
      replenishPolicyId: null,
      replenishPolicyName: '',
      parentWarehouseName: '',
      isInventorying: '',
      isActive: 'Y',
      isHisWarehouse: '',
      isStandAlone: '',
      description: '',
      productCategoryId: null,
    },
    submit: (params: any) => {
      console.warn('params', params);
      const newParams = {
        ...params,
        type: 'mc',
      };
      saveWarehouse(newParams).then((res) => {
        console.warn('res', res);
        // 刷新表格
        endemicGridApi.query();
        // 刷新树
        treeContext?.refreshTree();
      });
    },
  }).open();
};

// 修改
const modifyWarehouse = () => {
  console.warn('修改仓库');
  const selectedRow: WarehouseTableType = endemicGridApi.grid.getRadioRecord();
  if (!selectedRow) {
    message.error('请选择一条记录！');
    return;
  }
  const {
    warehouseId,
    warehouseCode,
    name,
    value,
    campusName,
    campusId,
    departmentName,
    departmentId,
    warehouseTypeName,
    address,
    warehousePolicyId,
    warehousePolicyName,
    replenishPolicyId,
    replenishPolicyName,
    parentWarehouseName,
    isInventorying,
    isActive,
    isHisWarehouse,
    isStandAlone,
    description,
    productCategoryId,
    warehouseType,
    parentWarehouseId,
  } = selectedRow;
  AddAndEditFormModalApi.setData({
    title: '修改仓库',
    type: 'edit',
    form: {
      warehouseCode,
      name,
      value,
      campusName,
      campusId,
      departmentId,
      departmentName,
      warehouseTypeName,
      address,
      warehousePolicyId,
      warehousePolicyName,
      replenishPolicyId,
      replenishPolicyName,
      parentWarehouseName,
      isInventorying,
      isActive,
      isHisWarehouse,
      isStandAlone,
      description,
      productCategoryId,
      warehouseType,
      parentWarehouseId,
    },
    submit: (params: any) => {
      console.warn('params', params, warehouseId);
      saveWarehouse({ ...params, warehouseId, type: 'mc' }).then((res) => {
        console.warn('res', res);
        // 刷新表格
        endemicGridApi.query();
        // 刷新树
        treeContext?.refreshTree();
      });
    },
  }).open();
};

// // 导入相关弹框
const [ImportWarehouseModal, ImportWarehouseModalApi] = useVbenModal({
  class: 'w-[75%]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: importWarehouseModalCom,
  draggable: true,
});
const [ImportLocationModal, ImportLocationModalApi] = useVbenModal({
  class: 'w-[75%]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: importLocationModalCom,
  draggable: true,
});
const [ImportProductControlModal, ImportProductControlModalApi] = useVbenModal({
  class: 'w-[75%]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: importProductControlModalCom,
  draggable: true,
});

type EventType = 'location' | 'productControl' | 'warehouse';
// 优化导入
const handleImport = (name: EventType) => {
  const handlers: Record<EventType, () => void> = {
    warehouse: () => ImportWarehouseModalApi.open(),
    location: () => ImportLocationModalApi.open(),
    productControl: () => ImportProductControlModalApi.open(),
  };
  if (handlers[name]) {
    handlers[name]();
  } else {
    console.error(`未定义导入类型: ${name}`);
  }
};

// 导入
// const handleImport = (type: string) => {
//   console.warn('导入', type);
//   switch (type) {
//     case 'location': {
//       ImportLocationModalApi.open();
//       break;
//     }
//     case 'productControl': {
//       ImportProductControlModalApi.open();
//       break;
//     }
//     case 'warehouse': {
//       ImportWarehouseModalApi.open();
//       break;
//     }
//     default: {
//       break;
//     }
//   }
// };

// const handleImportSuccess = async(importedData: any[]) => {
//   // 获取当前表格数据
//   const tableData = endemicGridApi.grid.getTableData().tableData || [];
//   // 检查重复数据
//   const duplicatePackages: string[] = [];
//   const validImportData: any[] = [];
//   importedData.forEach((importItem) => {
//     const isDuplicate = tableData.some(
//       (tableItem: any) => tableItem.packageNo === importItem.packageNo,
//     );
//     if (isDuplicate) {
//       duplicatePackages.push(importItem.packageNo);
//     } else {
//       validImportData.push(importItem);
//     }
//   });
//   // 如果存在重复数据，提示用户
//   if (duplicatePackages.length > 0) {
//     message.warning(`存在重复数据，请检查：${duplicatePackages.join(', ')}`);
//   }
//   // 只添加非重复的数据
//   if (validImportData.length > 0) {
//     const newTableData = [...validImportData, ...tableData];
//     endemicGridApi.grid.reloadData(newTableData);
//     totalData.value = newTableData.length;
//     message.success(`成功导入 ${validImportData.length} 条数据`);
//   } else if (duplicatePackages.length > 0) {
//     message.error('所有导入数据均为重复数据，未添加任何新数据');
//   }
// }

const afterSubmit = () => {
  console.warn('afterSubmit');
};

onMounted(() => {
  console.warn('treeContext.nodeData', treeContext);
  endemicGridApi.query();
});
</script>

<template>
  <div class="root-container">
    <Tabs v-model:active-key="activeTab" class="pl-4 pr-4">
      <TabPane key="1" tab="仓库一览" />
    </Tabs>
    <Card class="card" title="">
      <AddAndEditFormModal
        :form-options="formOptions"
        :after-submit="afterSubmit"
      />
      <ImportWarehouseModal @import-success="endemicGridApi.query()" />
      <ImportLocationModal @import-success="endemicGridApi.query()" />
      <ImportProductControlModal @import-success="endemicGridApi.query()" />

      <EndemicGrid>
        <template #toolbar-actions>
          <Button
            type="primary"
            class="mr-[0.5rem]"
            @click="createWarehouse()"
            data-testid="button_add_rootComponent"
          >
            新增
            <template #icon>
              <AddActionIcon />
            </template>
          </Button>
          <Button
            type="primary"
            class="mr-[0.5rem]"
            @click="modifyWarehouse()"
            data-testid="button_edit_rootComponent"
          >
            修改
            <template #icon>
              <EditActionIcon />
            </template>
          </Button>
          <Button
            type="primary"
            class="mr-[0.5rem]"
            @click="handleImport('warehouse')"
            data-testid="button_importWarehouse_rootComponent"
          >
            导入仓库
            <template #icon>
              <UploadActionIcon />
            </template>
          </Button>
          <Button
            type="primary"
            class="mr-[0.5rem]"
            @click="handleImport('location')"
            data-testid="button_importLocation_rootComponent"
          >
            导入货位
            <template #icon>
              <UploadActionIcon />
            </template>
          </Button>
          <Button
            type="primary"
            class="mr-[0.5rem]"
            @click="handleImport('productControl')"
            data-testid="button_importProductControl_rootComponent"
          >
            导入商品组
            <template #icon>
              <UploadActionIcon />
            </template>
          </Button>
        </template>
      </EndemicGrid>
    </Card>
  </div>
</template>

<style lang="scss" scoped>
.root-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.card {
  display: flex;
  flex-direction: column;
  // width: calc(100% - 16px);
  width: 100%;
  height: calc(100% - 46px);

  ::v-deep(.ant-card-body) {
    flex: 1;
    min-height: 0;

    .bg-card {
      height: 100%;
    }
  }
}

::v-deep(.ant-btn > svg) {
  margin-right: -2px;
  margin-bottom: 3px;
  margin-left: 2px;
}
</style>
