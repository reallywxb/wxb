<script lang="ts" setup>
import type { VbenFormProps } from '@vben/common-ui';

import { nextTick, onMounted, ref } from 'vue';

import { AddActionIcon, EditActionIcon, SvgDeleteIcon } from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { useUserStore } from '@vben/stores';

import { Button, message, Modal } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import LazySearch from '#/utils/LazySearch';
import { deepMerge } from '#/utils/util';

import addModalUi from './addModal/index.vue';
import {
  delProductControlLevel,
  getPCLFieldValues,
  savePCLFieldValues,
} from './api';
import ReleatedFieldModalComp from './commonFormModal.vue';
import SetRolesComp from './setRoles.vue';

const userStore = useUserStore();
const isFirstLoaded = ref(false); // 是否已初次加载完

const loading = ref(false);
// 定义查询控制器 用于控制表格的查询在页面加载后自
const searchController = new LazySearch(1, async () => {
  await nextTick();
  ChcGridApi.query();
  isFirstLoaded.value = true;
});
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      commonConfig: {
        labelClass: 'w-[90px]',
      },
      compact: true,
      layout: 'horizontal',
      showCollapseButton: false,
      submitButtonOptions: {
        content: '查询',
      },
    }),
    // 表格配置
    gridOptions: deepMerge(gridDefaultOptions, {
      proxyConfig: {
        autoLoad: false,
      },
    }),
  },
  {
    dataTableId: 'productControlLevelAction/query.do',
    id: 'productControlLevel',
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'value',
        minWidth: 100,
        sortable: true,
        title: '字典值',
      },
      {
        field: 'name',
        minWidth: 120,
        sortable: true,
        title: '名称',
      },
      {
        field: 'code',
        minWidth: 120,
        sortable: true,
        title: '编码',
      },
      {
        field: 'seqNo',
        minWidth: 120,
        sortable: true,
        title: '序号',
        align: 'right',
      },
      {
        field: 'invoiceMethodName',
        minWidth: 120,
        sortable: true,
        title: '开票方式',
      },
      {
        field: 'productCategoryName',
        minWidth: 120,
        sortable: true,
        title: '商品类别',
      },
      // {
      //   field: 'productCategoryValue',
      //   minWidth: 120,
      //   sortable: true,
      //   title: '是否常量',
      //   formatter: (row) => {
      //     const val = String(row.cellValue ?? '');
      //     return ['1', '2', '3', '4'].includes(val) ? '是' : '否';
      //   },
      // },
      {
        field: 'description',
        minWidth: 120,
        sortable: true,
        title: '描述',
      },
      {
        align: 'center',
        field: 'action',
        slots: { default: 'action' },
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: $t('system.menu.operation'),
        width: 300,
      },
    ],
    formSchema: [
      {
        component: 'Input',
        fieldName: 'key',
        label: '商品组',
        componentProps: {
          allowClear: true,
          placeholder: '请输入商品组',
        },
      },
    ],
    gridEvents: {},
  },
);

const [AddModal, addModalApi] = useVbenModal({
  class: 'w-[500px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: addModalUi,
  draggable: true,
});

const [SetRolesModal, SetRolesApi] = useVbenModal({
  class: 'w-[800px]',
  closable: true,
  connectedComponent: SetRolesComp,
  draggable: true,
});

const [ReleatedFieldModal, releatedFieldModalApi] = useVbenModal({
  class: 'w-[800px]',
  closable: true,
  closeOnClickModal: false,
  connectedComponent: ReleatedFieldModalComp,
  draggable: true,
});

// 新增 编辑 表单提交之后执行
function refreshTable() {
  ChcGridApi.query();
}

const handleAdd = () => {
  addModalApi
    .setData({
      ChcGridApi,
      openType: 'add',
      formData: {
        showForm: true,
        showFormLast: false,
      },
    })
    .open();
};

const handleEdit = (row: any) => {
  addModalApi
    .setData({
      ChcGridApi,
      openType: 'edit',
      formData: {
        showForm: true,
        showFormLast: false,
        ...row,
      },
    })
    .open();
};

const handleDel = (scope) => {
  Modal.confirm({
    title: '提示',
    content: `确认删除？`,
    onOk: async () => {
      try {
        const { dictLineId } = scope;
        const params = { dictLineId };
        const response = await delProductControlLevel(params);
        if (response.success) {
          message.success('删除成功');
          ChcGridApi.query();
        } else {
          message.error(response.msg || '删除失败');
        }
      } catch {
        message.error('删除失败');
      }
    },
  });
};

const handleSetRoles = (row: any) => {
  SetRolesApi.setData({
    openType: 'setRoles',
    pcl: row.value,
  }).open();
};

const handleRelatedField = ({ value: pcl }: any) => {
  loading.value = true;
  getPCLFieldValues({ pcl })
    .then(({ data: form }) => {
      releatedFieldModalApi
        .setData({
          title: '关联字段',
          form,
          submit: (params) =>
            savePCLFieldValues({
              pcl,
              fieldValues: JSON.stringify(params),
            }),
        })
        .open();
    })
    .finally(() => {
      loading.value = false;
    });
};

const formOptions: VbenFormProps = {
  layout: 'horizontal',
  schema: [
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/productAction/productCategoryList.do',
          // showSearch: true,
          placeholder: '请选择',
          paginate: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
          showChooseAll: false,
          chooseAllLabel: '请选择',
        };
      },
      fieldName: 'productCategoryId', // 商品名称
      formItemClass: 'col-span-6',
      // labelClass: ' w-[105px] ',
      label: '商品类别',
    },
    {
      component: 'Select',
      componentProps: {
        options: [
          {
            label: '是',
            value: 'Y',
          },
          {
            label: '否',
            value: 'N',
          },
        ],
        placeholder: '请选择',
        showChooseAll: false,
      },
      fieldName: 'isPurchasePriceUnify',
      formItemClass: 'col-span-6',
      label: '统一定价',
    },
    {
      component: 'Select',
      componentProps: {
        options: [
          {
            label: '是',
            value: 'Y',
          },
          {
            label: '否',
            value: 'N',
          },
        ],
        placeholder: '请选择',
        showChooseAll: false,
      },
      fieldName: 'isLot',
      formItemClass: 'col-span-6',
      label: '批号管理',
    },
    {
      component: 'Select',
      componentProps: {
        options: [
          {
            label: '是',
            value: 'Y',
          },
          {
            label: '否',
            value: 'N',
          },
        ],
        placeholder: '请选择',
        showChooseAll: false,
      },
      fieldName: 'isGuaranteeDateMandatory',
      formItemClass: 'col-span-6',
      label: '有效期必填',
    },
    {
      component: 'Select',
      componentProps: {
        options: [
          {
            label: '是',
            value: 'Y',
          },
          {
            label: '否',
            value: 'N',
          },
        ],
        placeholder: '请选择',
        showChooseAll: false,
      },
      fieldName: 'isProductionDateMandatory',
      formItemClass: 'col-span-6',
      label: '生产日期必填',
    },
    {
      component: 'Select',
      componentProps: {
        options: [
          {
            label: '是',
            value: 'Y',
          },
          {
            label: '否',
            value: 'N',
          },
        ],
        placeholder: '请选择',
        showChooseAll: false,
      },
      fieldName: 'isStoragePackage',
      formItemClass: 'col-span-6',
      label: '包装管理',
    },
    {
      component: 'Select',
      componentProps: {
        options: [
          {
            label: '是',
            value: 'Y',
          },
          {
            label: '否',
            value: 'N',
          },
        ],
        placeholder: '请选择',
        showChooseAll: false,
      },
      fieldName: 'isBasePackage',
      formItemClass: 'col-span-6',
      label: '是否单包',
    },
    {
      component: 'Select',
      componentProps: {
        options: [
          {
            label: '是',
            value: 'Y',
          },
          {
            label: '否',
            value: 'N',
          },
        ],
        placeholder: '请选择',
        showChooseAll: false,
      },
      fieldName: 'isSerNo',
      formItemClass: 'col-span-6',
      label: '厂家码管理',
    },
    {
      component: 'Select',
      componentProps: {
        options: [
          {
            label: '是',
            value: 'Y',
          },
          {
            label: '否',
            value: 'N',
          },
        ],
        placeholder: '请选择',
        showChooseAll: false,
      },
      fieldName: 'isBulkPurchase',
      formItemClass: 'col-span-6',
      label: '带量采购',
    },
    {
      component: 'Select',
      componentProps: {
        options: [
          {
            label: '是',
            value: 'Y',
          },
          {
            label: '否',
            value: 'N',
          },
        ],
        placeholder: '请选择',
        showChooseAll: false,
      },
      fieldName: 'isControlledProduct',
      formItemClass: 'col-span-6',
      label: '双人作业',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=1000004',
          // showSearch: true,
          placeholder: '请选择',
          paginate: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
          showChooseAll: false,
          chooseAllLabel: '请选择',
        };
      },
      fieldName: 'storageCondition', // 商品名称
      formItemClass: 'col-span-6',
      // labelClass: ' w-[105px] ',
      label: '存储条件',
    },
    {
      component: 'Select',
      componentProps: {
        options: [
          {
            label: '是',
            value: 'Y',
          },
          {
            label: '否',
            value: 'N',
          },
        ],
        placeholder: '请选择',
        showChooseAll: false,
      },
      fieldName: 'isColdStorage',
      formItemClass: 'col-span-6',
      label: '需冷藏',
    },

    // {
    //   component: 'Select',
    //   componentProps: {
    //     options: [
    //       {
    //         label: '是',
    //         value: 'Y',
    //       },
    //       {
    //         label: '否',
    //         value: 'N',
    //       },
    //     ],
    //     placeholder: '请选择',
    //   },
    //   fieldName: 'isNarcotic',
    //   label: '麻精药品',
    // },
    //
    // {
    //   component: 'Select',
    //   componentProps: {
    //     options: [
    //       {
    //         label: '是',
    //         value: 'Y',
    //       },
    //       {
    //         label: '否',
    //         value: 'N',
    //       },
    //     ],
    //     placeholder: '请选择',
    //   },
    //   fieldName: 'isInfusion',
    //   label: '大输液',
    // },

    {
      component: 'Select',
      componentProps: {
        options: [
          {
            label: '是',
            value: 'Y',
          },
          {
            label: '否',
            value: 'N',
          },
        ],
        placeholder: '请选择',
        showChooseAll: false,
      },
      fieldName: 'isPrecious',
      formItemClass: 'col-span-6',
      label: '高值',
    },
    {
      component: 'Select',
      componentProps: {
        options: [
          {
            label: '是',
            value: 'Y',
          },
          {
            label: '否',
            value: 'N',
          },
        ],
        placeholder: '请选择',
        showChooseAll: false,
      },
      fieldName: 'isFee',
      formItemClass: 'col-span-6',
      label: '是否计价',
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: false,
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
};

onMounted(() => {
  console.warn('onMounted', userStore.userInfo);
  // 触发自动查询
  searchController.sign();
});
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <AddModal :after-submit="refreshTable" />
    <SetRolesModal :after-submit="refreshTable" />
    <ReleatedFieldModal :form-options="formOptions" />
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
      </template>
      <template #action="scope">
        <Button
          ghost
          type="primary"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleEdit(scope.row)"
          :data-testid="`button_edit_${scope.rowIndex}`"
        >
          编辑
          <template #icon>
            <EditActionIcon />
          </template>
        </Button>
        <Button
          danger
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleDel(scope.row)"
          :data-testid="`button_delete_${scope.rowIndex}`"
        >
          删除
          <template #icon>
            <SvgDeleteIcon />
          </template>
        </Button>
        <Button
          type="primary"
          ghost
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleSetRoles(scope.row)"
          :data-testid="`button_setRoles_${scope.rowIndex}`"
        >
          授权角色
          <!-- <template #icon>
              <SvgDeleteIcon class="mt-[2px]" />
            </template> -->
        </Button>
        <Button
          type="primary"
          ghost
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleRelatedField(scope.row)"
          :loading="loading"
          :data-testid="`button_relatedField_${scope.rowIndex}`"
        >
          关联字段
          <!-- <template #icon>
              <SvgDeleteIcon class="mt-[2px]" />
            </template> -->
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
