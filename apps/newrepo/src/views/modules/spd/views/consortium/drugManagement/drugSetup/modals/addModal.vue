<script lang="ts" setup>
import { nextTick, ref, toRaw } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import { Button, message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import { saveBatchProduct } from '../api';

const props = defineProps<{
  orgOptions: any[];
}>();
const emit = defineEmits(['close']);
const modalData = ref<any>({});
const title = ref('批量添加产品');
const selectedCount = ref(0);
const handleFormSubmit = async () => {
  const formValues = await baseFormApi.getValues();
  ChcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
  ChcGridApi.query(formValues);
};
const handleFormReset = async () => {
  await baseFormApi.resetForm();
  const formValues = await baseFormApi.getValues();
  ChcGridApi.formApi.setLatestSubmissionValues(formValues);
  ChcGridApi.query(formValues);
};

const [Modal, modalApi] = useVbenModal({
  showConfirmButton: false,
  cancelText: '取消',
  onCancel() {
    modalApi.close();
  },
  onClosed() {},
  onConfirm() {},

  onOpenChange(isOpen) {
    if (isOpen) {
      modalData.value = modalApi.getData<Record<string, any>>();
      // title.value = modalData.value.AD_User_ID ? '修改用户' : '新增用户';
      selectedCount.value = 0;
      const updateSchemaList: any[] = [];
      if (props.orgOptions) {
        updateSchemaList.push({
          fieldName: 'campusIds',
          componentProps: {
            treeData: props.orgOptions,
          },
        });
      }
      nextTick(() => {
        baseFormApi.updateSchema(updateSchemaList);
        baseFormApi.setValues({
          campusIds: modalData.value.campusKeys,
        });
      });
    }
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },
});
const [BaseForm, baseFormApi] = useVbenForm({
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 在label后显示一个冒号
    colon: true,
    // labelClass: 'w-[120px]',
    labelClass: 'w-[fit-content]',
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },

  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行
  actionWrapperClass: 'formActionAreaStyle',
  layout: 'horizontal',
  showCollapseButton: false,
  showDefaultActions: true,
  submitButtonOptions: {
    content: '查询',
  },
  handleSubmit: handleFormSubmit,
  handleReset: handleFormReset,
  schema: [
    {
      component: 'TreeSelect',
      componentProps: {
        allowClear: true,
        placeholder: '',
        showSearch: true,
        treeCheckable: false,
        treeData: [],
        treeNodeFilterProp: 'label',
        maxTagCount: 1,
        fieldNames: {
          label: 'label',
          value: 'key',
          children: 'children',
        },
      },
      disabled: true,
      fieldName: 'campusIds',
      labelClass: 'pl-2',
      label: '下发院区',
    },
    {
      component: 'Input',
      fieldName: 'productName',
      label: '药品名称',
      labelClass: 'pl-2',
      componentProps: () => {
        return {
          placeholder: '请输入编码/名称/搜索码',
        };
      },
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          autoChooseFirstOption: false,
          dictUrl: '/baseHandleAction/refList.do?id=1000244',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择药品组',
          paginate: false,
          allowClear: true,
          filterByFrontEnd: true,
          showChooseAll: '',
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          defaultValue: '',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'productControlLevel',
      labelClass: 'pl-2',
      label: '药品组',
    },
    // {
    //   component: 'ChcSelect',
    //   componentProps: () => {
    //     return {
    //       // autoChooseFirstOption: true,
    //       options: [
    //         { value: '', label: '全部' },
    //         { value: 'Y', label: '是' },
    //         { value: 'N', label: '否' },
    //       ],
    //       placeholder: '请选择',
    //       paginate: false,
    //       filterByFrontEnd: true,
    //       showChooseAll: '',
    //       immediate: true,
    //     };
    //   },
    //   defaultValue: '',
    //   fieldName: 'ControlLevel',
    //   label: '管控级别',
    // },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          // autoChooseFirstOption: true,
          options: [
            { value: '', label: '全部' },
            { value: 'Y', label: '是' },
            { value: 'N', label: '否' },
          ],
          placeholder: '请选择启用状态',
          paginate: false,
          filterByFrontEnd: true,
          showChooseAll: '',
          immediate: true,
        };
      },
      defaultValue: '',
      fieldName: 'isActive',
      label: '启用状态',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          // autoChooseFirstOption: true,
          options: [
            { value: '', label: '全部' },
            { value: 'Y', label: '是' },
            { value: 'N', label: '否' },
          ],
          placeholder: '请选择带量采购',
          paginate: false,
          filterByFrontEnd: true,
          showChooseAll: '',
          immediate: true,
        };
      },
      defaultValue: '',
      fieldName: 'isBulkPurchase',
      labelClass: 'pl-2',
      label: '带量采购',
    },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-3',
});

const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      showCollapseButton: false,
      showDefaultActions: false,
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: true,

      checkboxConfig: {
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
    id: 'drugTable',
    queryUrl: '/mcProductAction/queryProduct.do',
    gridColumns: [
      { type: 'checkbox', title: '', width: 40, align: 'center' },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'insurance',
        title: '医保编码',
        minWidth: '160px',
        sortable: true,
      },
      {
        field: 'productCode',
        title: '药品编码',
        minWidth: '120px',
        sortable: true,
      },
      {
        field: 'name',
        title: '药品名称',
        minWidth: '120px',
        sortable: true,
      },
      {
        field: 'medicineName',
        title: '通用名称',
        width: '120px',
        sortable: true,
      },
      {
        field: 'value',
        title: '拼音码',
        width: '100px',
      },
      {
        field: 'productSpec',
        title: '规格',
        width: '90px',
      },
      {
        field: 'uomName',
        title: '单位',
        width: '90px',
      },
      {
        field: 'baseUOMName',
        title: '最小单位',
        width: '100px',
      },
      {
        field: 'baseUOMQty',
        title: '最小单位转换比',
        width: '140px',
        align: 'right',
      },
      {
        field: 'baseUOMPrecision',
        title: '最小单位精度',
        width: '120px',
        align: 'right',
      },
      {
        field: 'manufacturerName',
        title: '生产厂家',
        width: '160px',
      },
      {
        field: 'certificateNo',
        title: '批准文号',
        width: '120px',
      },
      {
        field: 'markCode',
        title: '省标编码',
        width: '120px',
      },
      {
        field: 'productStyleName',
        title: '剂型',
        width: '100px',
      },
      // {
      //   field: 'ControlLevel',
      //   title: '管控等级',
      //   width: '120px',
      // },
    ],

    gridEvents: {
      // 监听复选框变化
      checkboxChange: ({ records }: any) => {
        selectedCount.value = records.length;
      },
      // 监听全选/取消全选
      checkboxAll: ({ records }: any) => {
        selectedCount.value = records.length;
      },
    },
    afterFetchFn: (params: any) => {
      // const checkRows = params.rows.filter((item: any) => item.IsUsed === 'Y');
      // if (checkRows.length > 0) {
      //   setTimeout(() => {
      //     ChcGridApi.grid.setCheckboxRow(checkRows, true);
      //   }, 200);
      // }
      return {
        ...params,
        records: params.rows || [],
      };
    },
    beforeFetchFn: (params) => {
      console.warn('params', params);
      return {
        ...params,
        campusIds: undefined, // 查询院区始终不传
      };
    },
  },
);

// 提交
async function onSubmit() {
  const checkedArr = ChcGridApi.grid.getCheckboxRecords();
  if (checkedArr && checkedArr.length === 0) {
    message.error({
      content: '请选择要添加的药品',
    });
    return;
  }
  const productIds = checkedArr.map((item: any) => item.productId);
  const params = {
    productIds: JSON.stringify(productIds),
    campusIds: JSON.stringify(modalData.value.campusId),
  };
  console.warn('params', params);
  saveBatchProduct(params).then((res) => {
    if (res && res.success) {
      message.success({
        content: '保存成功',
      });
      modalApi.close();
      emit('close');
    }
  });
}
</script>
<template>
  <Modal class="h-[600px] w-[900px]" :title="title" title-tooltip="">
    <Page content-class="p-[0.5rem]">
      <BaseForm />
      <ChcGrid class="h-[340px] w-full overflow-hidden" />
    </Page>
    <template #prepend-footer>
      <Button
        type="primary"
        @click="onSubmit"
        data-testid="button_onSubmit_addModal"
      >
        提交{{ selectedCount > 0 ? `(${selectedCount}条)` : '' }}
      </Button>
    </template>
  </Modal>
</template>

<style lang="less" scoped></style>
