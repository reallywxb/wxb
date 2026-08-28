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

import { updateMaterialsInfo } from '../api';

const emit = defineEmits(['close']);
const modalData = ref<any>({});
const title = ref('新增统方敏感物资');

// const getMockTableData = (): Promise<any[]> => {
//   const mockData = Array.from({ length: 20 }, (_, index) => ({
//     id: index + 1,
//     productName: `产品${index + 1}`,
//     productSpec: `规格${index + 1}`,
//     brand: `品牌${index + 1}`,
//     factory: `厂家${index + 1}`,
//     defaultVendorName: `供应商${index + 1}`,
//     isActive: 'Y',
//     uomName: `单位${index + 1}`,
//     price: `${index + 1}00`,
//     insurance: `${Math.random().toFixed(2)}${index}`,
//     productId: `${Math.random().toFixed(2)}${index}`,
//   }));
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve(mockData);
//     }, 500);
//   });
// };

const handleFormSubmit = async () => {
  const formValues = await baseFormApi.getValues();
  ChcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
  ChcGridApi.query(formValues);
  // const data = await getMockTableData();
  // ChcGridApi.grid.reloadData(data);
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
      nextTick(() => {
        baseFormApi.setValues({
          campusIds: modalData.value.campusKeys || [],
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
      component: 'Input',
      fieldName: 'productName',
      label: '物资关键词',
      labelClass: 'pl-2',
      componentProps: () => {
        return {
          placeholder: '请输入名称/型号/编码',
        };
      },
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          autoChooseFirstOption: false,
          dictUrl: '/baseHandleAction/vendor.do',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择默认供应商',
          paginate: false,
          filterByFrontEnd: true,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          showChooseAll: false,
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'defaultVendorId',
      label: '默认供应商',
    },
    // {
    //   component: 'ChcSelect',
    //   componentProps: () => {
    //     return {
    //       mode: 'multiple',
    //       maxTagCount: 1,
    //       options: [
    //         { value: '', label: '全部' },
    //         { value: 'A', label: 'apple' },
    //         { value: 'B', label: 'banana' },
    //         { value: 'C', label: 'orange' },
    //         { value: 'D', label: 'peach' },
    //         { value: 'E', label: 'pear' },
    //       ],
    //       placeholder: '请选择',
    //       paginate: false,
    //       filterByFrontEnd: true,
    //       showChooseAll: '',
    //       immediate: false,
    //     };
    //   },
    //   defaultValue: [],
    //   labelClass: 'pl-2',
    //   fieldName: 'brand',
    //   label: '品牌',
    // },
    // {
    //   component: 'Input',
    //   fieldName: 'modelNo',
    //   label: '型号',
    //   labelClass: 'pl-2',
    //   componentProps: () => {
    //     return {
    //       placeholder: '请输入型号',
    //     };
    //   },
    // },
    {
      component: 'Input',
      fieldName: 'insurance',
      label: '医保编码',
      labelClass: 'pl-2',
      componentProps: () => {
        return {
          placeholder: '请输入医保编码',
        };
      },
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
    id: 'addMaterialsGrid',
    queryUrl: '/mcProductAction/queryProduct.do?type=apt',
    gridColumns: [
      { type: 'checkbox', title: '', width: 40, align: 'center' },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'isActive',
        minWidth: 110,
        sortable: true,
        title: '状态',
        formatter({ row: { isActive } }: any) {
          return isActive ? (isActive === 'Y' ? '启用' : '停用') : '';
        },
      },
      {
        field: 'productName',
        minWidth: 130,
        sortable: true,
        title: '药品名称',
      },
      {
        field: 'productSpec',
        title: '规格',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'modelNo',
        minWidth: 130,
        sortable: true,
        title: '规格型号',
        visible: false,
      },
      {
        field: 'brandName',
        minWidth: 100,
        sortable: true,
        title: '品牌',
      },
      {
        field: 'manufacturerName',
        minWidth: 150,
        sortable: true,
        title: '厂家',
      },
      {
        field: 'defaultVendorName',
        title: '默认供应商',
        minWidth: 110,
      },
      {
        field: 'uomName',
        title: '单位',
        width: '90px',
      },
      {
        field: 'priceList',
        title: '单价',
        width: '100px',
        align: 'right',
      },
      {
        field: 'insurance',
        title: '医保药品编码',
        width: '160px',
      },
      {
        field: 'productCode',
        title: '药品编码',
        width: '160px',
      },
    ],

    gridEvents: {
      // 监听复选框变化
      // checkboxChange: ({ records }: any) => {
      // },
      // // 监听全选/取消全选
      // checkboxAll: ({ records }: any) => {
      // },
    },
    afterFetchFn: (params: any) => {
      return {
        ...params,
        records: params.rows || [],
      };
    },
    beforeFetchFn: (params) => {
      console.warn('params', params);
      return {
        ...params,
      };
    },
  },
);

// 提交
async function onSubmit() {
  const checkedArr = ChcGridApi.grid.getCheckboxRecords();
  if (checkedArr && checkedArr.length === 0) {
    message.error({
      content: '请选择要添加的物资',
    });
    return;
  }
  const productAccess = checkedArr.map((item: any) => ({
    productId: item.productId,
    productCode: item.productCode,
    productName: item.productName,
  }));
  const params = {
    productAccess: JSON.stringify(productAccess),
  };
  console.warn('params', params);
  updateMaterialsInfo(params).then((res) => {
    if (res && res.success) {
      message.success({
        content: '保存成功',
      });
      modalApi.close();
      modalData.value?.callback();
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
        提交
      </Button>
    </template>
  </Modal>
</template>

<style lang="less" scoped></style>
