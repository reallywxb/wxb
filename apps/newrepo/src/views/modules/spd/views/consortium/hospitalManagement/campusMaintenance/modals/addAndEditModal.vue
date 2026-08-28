<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button, message } from 'ant-design-vue';
// import { Cascader as AntCascader, Button, message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { saveDo } from '../api';

// const emit = defineEmits(['close']);
const modalData = ref<Record<string, any>>({});
const modalTitle = ref('');
type ModalType = 'ADD' | 'EDIT';
const modalType = ref<ModalType>('ADD');
const isSubmiting = ref(false);
// const regionOptions = ref<CascaderProps['options']>([]);
// const regionValue = ref<string[]>([]);
const [Modal, modalApi] = useVbenModal({
  showConfirmButton: false,
  showCancelButton: true,
  cancelText: '关闭',
  closeOnClickModal: false,
  onCancel() {
    modalApi.close();
  },
  onClosed() {
    // message.info('onClosed：关闭动画结束');
  },
  onConfirm() {
    // message.info('onConfirm');
    // modalApi.close();
  },

  onOpenChange(isOpen) {
    if (isOpen) {
      modalData.value = modalApi.getData<Record<string, any>>();
      console.warn('modalData.value', modalData.value);
      modalTitle.value = modalData.value.modalTitle;
      modalType.value = modalData.value.modalType;
      // 清空地址级联选择器
      // regionValue.value = [];
      // baseFormApi.setFieldValue('region', '');
      // fetchApi().then((res: any) => {
      //   regionOptions.value = res || [];
      // });
      // getCampusTreeData().then((res: any) => {
      //   console.warn('getCampusTreeData res', res);
      // });
      if (modalType.value === 'EDIT') {
        setTimeout(() => {
          baseFormApi.setValues({
            ...modalData.value.row,
            hospitalId: Number(modalData.value.row.hospitalId),
            // 所属医院ID 需要去除这个字段前面的h字符 转成Number 来匹配接口进行回显
            // hospitalId: Number(modalData.value.row.hospitalId.replace('h', '')),
          });
          // 设置地区级联选择器的值
          // if (modalData.value.row.region) {
          //   regionValue.value = Array.isArray(modalData.value.row.region)
          //     ? modalData.value.row.region
          //     : modalData.value.row.region.split(',');
          // }
        }, 100);
      }
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
    labelClass: 'w-[90px]',
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },

  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行，值为horizontal
  actionWrapperClass: 'formActionAreaStyle',
  layout: 'horizontal',

  showCollapseButton: false,
  showDefaultActions: false,
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
  schema: [
    {
      component: 'ChcSelect',
      fieldName: 'hospitalId',
      label: '所属医院',
      rules: 'required',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      componentProps: () => {
        return {
          // dictUrl: '/hospitalAction/queryHospitalList.do',
          dictUrl: '/hospitalAction/queryHospList', // 使用新的医院下拉接口
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          placeholder: '请选择所属医院',
          paginate: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          allowClear: true,
          afterFetch(res: any) {
            // 无需处理 已经再open时 处理了
            // res.data?.forEach((item: any) => {
            //   item.hospitalId = item.hospitalId.toString();
            // });
            const rows =
              res.data?.map(
                (item: { hospitalId: number; hospitalName: string }) => ({
                  id: item.hospitalId,
                  name: item.hospitalName,
                }),
              ) || [];
            return { ...res, rows: undefined, records: rows };
          },
        };
      },
    },
    // {
    //   component: 'TreeSelect',
    //   componentProps: {
    //     allowClear: true,
    //     placeholder: '请选择所属医院的院区',
    //     showSearch: true,
    //     treeCheckable: true,
    //     // showCheckedStrategy: 'SHOW_CHILD', // 只显示子节点
    //     treeData: [],
    //     treeNodeFilterProp: 'label',
    //     maxTagCount: 1,
    //     fieldNames: {
    //       label: 'label',
    //       value: 'id',
    //       children: 'children',
    //     },
    //     onChange: (value: any, label: any, extra: any) => {
    //       console.warn('campusIds onChange', value, label, extra);
    //     },
    //   },
    //   fieldName: 'campusIds',
    //   label: '所属医院',
    // },
    {
      component: 'Input',
      fieldName: 'campusCode',
      label: '院区编码',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      rules: 'required',
      disabled: true,
      componentProps: () => {
        return {
          placeholder: '请输入院区编码',
        };
      },
      dependencies: {
        show() {
          return modalType.value === 'EDIT';
        },
        triggerFields: [''],
      },
    },
    {
      component: 'Input',
      fieldName: 'campusName',
      label: '院区名称',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      rules: 'required',
      componentProps: () => {
        return {
          placeholder: '请输入医院名称',
        };
      },
    },
    // {
    //   component: 'Input', // 占位组件
    //   fieldName: 'region',
    //   label: '所在地区',
    //   rules: 'required',
    //   formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
    //   labelClass: 'leading-1 mb-[0px] pl-[4px]',
    //   renderComponentContent: () => {
    //     return {
    //       // 使用插槽名
    //       default: () => 'region-slot',
    //     };
    //   },
    // },
    {
      component: 'Input',
      fieldName: 'detailAddress',
      label: '详细地址',
      rules: 'required',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      componentProps: () => {
        return {
          placeholder: '请输入详细地址',
        };
      },
    },
    {
      component: 'RadioGroup',
      fieldName: 'isMain',
      label: '主院区标志',
      rules: 'required',
      defaultValue: 'N',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      componentProps: () => {
        return {
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
        };
      },
    },
    {
      component: 'RadioGroup',
      fieldName: 'status',
      label: '状态',
      rules: 'required',
      defaultValue: 'Y',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      componentProps: () => {
        return {
          options: [
            {
              label: '停用',
              value: 'N',
            },
            {
              label: '启用',
              value: 'Y',
            },
          ],
        };
      },
    },
    {
      component: 'RadioGroup',
      fieldName: 'isPurchaseMain',
      label: '采购主体',
      rules: 'required',
      defaultValue: 'N',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      componentProps: () => {
        return {
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
        };
      },
    },
    // {
    //   component: 'Switch',
    //   fieldName: 'IsMain',
    //   label: '主院区标志',
    //   rules: 'required',
    //   defaultValue: 'N',
    //   formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
    //   labelClass: 'leading-1 mb-[0px] pl-[4px]',
    //   componentProps: () => {
    //     return {
    //       checkedValue: 'Y',
    //       unCheckedValue: 'N',
    //       checkedChildren: '是',
    //       unCheckedChildren: '否',
    //       style: {
    //         width: '40px',
    //       },
    //     };
    //   },
    // },
    // {
    //   component: 'Switch',
    //   fieldName: 'IsActive',
    //   label: '状态',
    //   rules: 'required',
    //   defaultValue: 'N',
    //   formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
    //   labelClass: 'leading-1 mb-[0px] pl-[4px]',
    //   componentProps: () => {
    //     return {
    //       checkedValue: 'Y',
    //       unCheckedValue: 'N',
    //       checkedChildren: '启用',
    //       unCheckedChildren: '停用',
    //       style: {
    //         width: '60px',
    //       },
    //     };
    //   },
    // },
    // {
    //   component: 'Switch',
    //   fieldName: 'IsPurchase',
    //   label: '采购主体',
    //   rules: 'required',
    //   defaultValue: 'N',
    //   formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
    //   labelClass: 'leading-1 mb-[0px] pl-[4px]',
    //   componentProps: () => {
    //     return {
    //       checkedValue: 'Y',
    //       unCheckedValue: 'N',
    //       checkedChildren: '是',
    //       unCheckedChildren: '否',
    //       style: {
    //         width: '40px',
    //       },
    //     };
    //   },
    // },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-1',
});

/**
 * 处理地区选择变化
 */
// function handleRegionChange(values: string[]) {
//   if (values.length > 0) {
//     baseFormApi.setFieldValue('region', values.join('/'));
//   } else {
//     baseFormApi.setFieldValue('region', '');
//   }
// }

// 提交表单
async function onSubmit() {
  const validateResult = await baseFormApi.validate();
  if (validateResult.valid) {
    if (isSubmiting.value) {
      message.warning('正在提交！');
      return false;
    }
    isSubmiting.value = true;
    const formValues = await baseFormApi.getValues();
    const params: Record<string, any> = {
      // ...formValues,
      // 需要将所属医院ID 前面加一个h 并且最终转成字符串类型
      // hospitalId: `${String(`h${formValues.hospitalId}`)}`,
      hospitalId: String(formValues.hospitalId),
      campusName: formValues.campusName,
      campusCode: formValues.campusCode,
      detailAddress: formValues.detailAddress,
      main: formValues.isMain === 'Y',
      purchaseMain: formValues.isPurchaseMain === 'Y',
      status: formValues.status === 'Y',
    };
    if (modalType.value === 'EDIT') {
      params.id = modalData.value?.row?.id; // 编辑时需要主键ID
    }
    console.warn('提交参数:', params);
    saveDo(params)
      .then((res) => {
        if (res && res.success) {
          message.success('成功');
          modalApi.close();
          baseFormApi.resetForm();
          modalData.value?.callback();
        }
      })
      .catch((error) => {
        console.error('提交失败:', error);
      })
      .finally(() => {
        isSubmiting.value = false;
      });
  }
}

/**
 * 模拟请求接口
 */
// function fetchApi(): Promise<Record<string, any>> {
//   const treeData: CascaderProps['options'] = [
//     {
//       label: '浙江',
//       value: 'zhejiang',
//       children: [
//         {
//           value: 'hangzhou',
//           label: '杭州',
//           children: [
//             {
//               value: 'xihu',
//               label: '西湖',
//             },
//             {
//               value: 'sudi',
//               label: '苏堤',
//             },
//           ],
//         },
//         {
//           value: 'jiaxing',
//           label: '嘉兴',
//           children: [
//             {
//               value: 'wuzhen',
//               label: '乌镇',
//             },
//             {
//               value: 'meihuazhou',
//               label: '梅花洲',
//             },
//           ],
//         },
//         {
//           value: 'zhoushan',
//           label: '舟山',
//           children: [
//             {
//               value: 'putuoshan',
//               label: '普陀山',
//             },
//             {
//               value: 'taohuadao',
//               label: '桃花岛',
//             },
//           ],
//         },
//       ],
//     },
//     {
//       label: '江苏',
//       value: 'jiangsu',
//       children: [
//         {
//           value: 'nanjing',
//           label: '南京',
//           children: [
//             {
//               value: 'zhonghuamen',
//               label: '中华门',
//             },
//             {
//               value: 'zijinshan',
//               label: '紫金山',
//             },
//             {
//               value: 'yuhuatai',
//               label: '雨花台',
//             },
//           ],
//         },
//       ],
//     },
//   ];
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve(treeData);
//     }, 1000);
//   });
// }
</script>
<template>
  <Modal class="w-[600px]" :title="modalTitle" title-tooltip="">
    <!-- <BaseForm>
      <template #region>
        <AntCascader
          v-model:value="regionValue"
          :options="regionOptions"
          placeholder="请选择所在地区"
          style="width: 100%"
          @change="handleRegionChange"
        />
      </template>
    </BaseForm> -->
    <BaseForm />
    <template #prepend-footer>
      <Button
        type="primary"
        @click="onSubmit"
        data-testid="button_onSubmit_addAndEditModal"
      >
        保存
      </Button>
    </template>
  </Modal>
</template>
<style scoped lang="scss"></style>
