<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';

import { h, nextTick, onMounted, reactive, ref } from 'vue';

import { SearchActionIcon } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

import { message, Modal } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { saveWarehouseProduct } from '../api';
import chooseProductModalUi from './chooseProductModal.vue'; // 药品编码弹框

interface DynamicParams {
  warehouseId: string;
  zoneId: string;
  sectionId: string;
  locatorId: string;
  pickupLocatorId: string;
  productId: string;
}

const hiddenFieldSet = ref();
const modalData = ref<Record<string, any>>({});
const modalTitle = ref('');
// 创建响应式的参数对象
const dynamicParams = reactive<DynamicParams>({
  warehouseId: '', // 仓库基础参数
  zoneId: '', // 字库ID
  sectionId: '', // 整件库区ID
  locatorId: '', // 整件货位ID
  pickupLocatorId: '', // 散件货位ID
  productId: '', // 商品ID(用于规格、补货定数等)
});

const lotExtraParam = ref({ warehouseId: dynamicParams.warehouseId });
const lotExtraParam2 = ref({ productId: dynamicParams.productId });

const [ChooseProductModal, ChooseProductModalApi] = useVbenModal({
  class: 'w-[1300px]',
  closable: true,
  draggable: true,
  connectedComponent: chooseProductModalUi,
});

/**
 * 判断字段是否应该显示
 * @param fieldName - 字段名
 * @returns 是否显示
 */
const shouldShowField = (fieldName: string): boolean => {
  return !hiddenFieldSet.value.has(fieldName);
};

// const queryReplenish = async (values?: {
//   productId?: number | string | undefined;
//   warehouseId?: number | string | undefined;
// }) => {
//   const { warehouseId, productId } = values || {};
//   const formValues = await BaseFormApi.getValues();
//   const params = {
//     warehouseId,
//     productId,
//   };
//   if (!params.warehouseId) {
//     params.warehouseId = formValues.warehouseId;
//   }
//   if (!params.productId) {
//     params.productId = formValues.productId;
//   }
//   try {
//     const res = await requestFormClient.post(
//       '/packUnitChangeApplyAction/queryReplenish.do',
//       params,
//     );
//     console.warn('queryReplenish res', res);
//     BaseFormApi.setValues({
//       oldPackUnit: isEmpty(res?.oldPackUnit) ? '' : res?.oldPackUnit,
//       oldPackageUnitTopLimit: isEmpty(res?.oldPackageUnitTopLimit)
//         ? ''
//         : res?.oldPackageUnitTopLimit,
//     });
//   } catch (error) {
//     console.error(error);
//   }
// };

// 基本信息的表单配置
const baseFormSchemas: VbenFormSchema[] = [
  {
    component: 'ChcSelect',
    componentProps: () => {
      return {
        autoChooseFirstOption: false,
        dictUrl: '/baseHandleAction/warehouse.do?level1=Y&level2=Y&accessAll=Y',
        // showSearch: true,
        placeholder: '请选择',
        paginate: false,
        // allowClear: true,
        onChange(val: any, option: any) {
          dynamicParams.warehouseId = option.id;
          lotExtraParam.value.warehouseId = val;
        },
        immediate: true,
        labelField: 'name',
        valueField: 'id',
        afterFetch(res: any) {
          BaseFormApi?.setFieldValue('warehouseId', undefined);
          return { ...res, rows: undefined, records: res.rows };
        },
      };
    },
    // defaultValue: 1_000_007,
    fieldName: 'warehouseId',
    label: '仓库',
  },
  {
    fieldName: 'productCode', // 药品编码
    label: '药品编码',
    rules: 'required',
    component: 'Input',
    componentProps: () => {
      return {
        allowClear: false,
        placeholder: ' ',
        maxlength: 20,
      };
    },
    renderComponentContent: () => ({
      suffix: () =>
        h(SearchActionIcon, {
          onClick: async () => {
            console.warn('点击了');
            const formValues = await BaseFormApi.getValues();
            console.warn('formValues', formValues);
            ChooseProductModalApi.setData({
              productCode: formValues.productCode,
              callback: (row: any) => {
                console.warn('row', row);
                dynamicParams.productId = row.productId;
                lotExtraParam2.value.productId = row.productId;
                nextTick(() => {
                  (
                    BaseFormApi?.getFieldComponentRef(
                      'productSpecId',
                    ) as SelectComponentRef
                  ).fetchApi!();
                  (
                    replenishmentStrategyFormApi?.getFieldComponentRef(
                      'replenishPackageQty',
                    ) as SelectComponentRef
                  ).fetchApi!();
                  BaseFormApi?.setFieldValue(
                    'productSpecId',
                    row.productSpecId,
                  );
                });

                // BaseFormApi.setValues({
                //   ...row,
                // });
                // queryReplenish({
                //   warehouseId: formValues.warehouseId,
                //   productId: row.productId,
                // });
              },
            }).open();
          },
        }),
    }),
  },
  {
    component: 'Input',
    fieldName: 'productName',
    label: '商品',
    disabled: true,
    componentProps: () => {
      return {
        placeholder: '请输入',
      };
    },
  },
  {
    component: 'ChcSelect',
    fieldName: 'productSpecId',
    label: '使用规格',
    componentProps: () => {
      return {
        dictUrl: '/baseHandleAction/productSepcList.do',
        placeholder: '请选择',
        paginate: false,
        // showChooseAll: '',
        immediate: true,
        labelField: 'name',
        valueField: 'id',
        autoChooseFirstOption: true,
        extraParams: lotExtraParam2.value,
        // extraParams: {
        //   productId: dynamicParams.productId,
        // },
        afterFetch(res: any) {
          // 选中第一项
          // BaseFormApi?.setFieldValue('productSpecId', res.rows?.[0]?.id);
          return { ...res, rows: undefined, records: res.rows || [] };
        },
      };
    },
  },
  {
    component: 'Input',
    fieldName: 'productSpec',
    label: '商品规格',
    disabled: true,
    componentProps: () => {
      return {
        allowClear: true,
        placeholder: ' ',
        maxlength: 20,
      };
    },
  },
  {
    component: 'Input',
    fieldName: 'manufacturer',
    label: '厂家',
    disabled: true,
    componentProps: () => {
      return {
        allowClear: true,
        placeholder: ' ',
        maxlength: 50,
      };
    },
  },
  {
    component: 'ChcSelect',
    componentProps: () => {
      return {
        autoChooseFirstOption: false,
        dictUrl: '/warehouseAction/zoneList.do',
        // extraParams: {
        //   warehouseId: dynamicParams.warehouseId,
        // },
        // showSearch: true,
        placeholder: '请选择',
        onChange(val: any, option: any) {
          // debugger;
          console.warn('zoneId', val, option);
          // 更新对应子级库
        },
        paginate: false,
        // showChooseAll: '',
        immediate: true,
        labelField: 'name',
        valueField: 'id',
        afterFetch(res: any) {
          return { ...res, rows: undefined, records: res.rows };
        },
      };
    },
    fieldName: 'zoneId',
    formItemClass: 'col-span-1',
    label: '默认子库',
  },
  {
    component: 'ChcSelect',
    componentProps: () => {
      return {
        autoChooseFirstOption: false,
        dictUrl: '/warehouseAction/wareLocatorList.do',
        // showSearch: true,
        placeholder: '请选择',
        triggerFields: ['zoneId', 'type', 'warehouseId'],
        onChange(val: any, option: any) {
          console.warn('sectionId', val, option);
          dynamicParams.sectionId = option.id;
        },
        paginate: false,
        // showChooseAll: '',
        immediate: true,
        labelField: 'name',
        valueField: 'id',
        afterFetch(res: any) {
          return { ...res, rows: undefined, records: res.rows };
        },
      };
    },
    fieldName: 'sectionId',
    label: '默认整件库区',
    formItemClass: ' col-span-1 col-start-1',
    dependencies: {
      triggerFields: ['zoneId', 'type', 'warehouseId'], // 当zoneId改变时，触发依赖更新
      async trigger(values) {
        await nextTick();
        console.warn('默认整件库区trigger', values, BaseFormApi);
        if (
          BaseFormApi?.getFieldComponentRef &&
          typeof BaseFormApi?.getFieldComponentRef === 'function' &&
          BaseFormApi?.getFieldComponentRef('sectionId') &&
          (BaseFormApi.getFieldComponentRef('sectionId') as SelectComponentRef)
            .params
        ) {
          (
            BaseFormApi.getFieldComponentRef('sectionId') as SelectComponentRef
          ).params!.dependencies = {
            warehouseId: values.warehouseId,
            zoneId: values.zoneId,
            type: values.zoneId ? 'section' : undefined,
          };
          (BaseFormApi?.getFieldComponentRef('sectionId') as SelectComponentRef)
            .fetchApi!();
        }
      },
    },
  },
  {
    component: 'ChcSelect',
    componentProps: () => {
      return {
        autoChooseFirstOption: false,
        dictUrl: '/warehouseAction/wareLocatorList.do',
        // showSearch: true,
        placeholder: '请选择',
        triggerFields: ['zoneId', 'type', 'warehouseId', 'sectionId'],
        onChange(val: any, option: any) {
          console.warn('locatorId', val, option);
        },
        paginate: false,
        showChooseAll: '',
        immediate: true,
        labelField: 'name',
        valueField: 'id',
        afterFetch(res: any) {
          return { ...res, rows: undefined, records: res.rows };
        },
      };
    },
    fieldName: 'locatorId',
    label: '默认整件货位',
    dependencies: {
      triggerFields: ['zoneId', 'type', 'warehouseId', 'sectionId'],
      async trigger(values) {
        await nextTick();
        if (
          BaseFormApi?.getFieldComponentRef &&
          typeof BaseFormApi?.getFieldComponentRef === 'function' &&
          BaseFormApi?.getFieldComponentRef('locatorId') &&
          (BaseFormApi.getFieldComponentRef('locatorId') as SelectComponentRef)
            .params
        ) {
          (
            BaseFormApi.getFieldComponentRef('locatorId') as SelectComponentRef
          ).params!.dependencies = {
            warehouseId: values.warehouseId,
            zoneId: values.zoneId,
            type: values.zoneId || values.sectionId ? 'locator' : undefined,
            sectionId: values.sectionId,
          };
          (BaseFormApi?.getFieldComponentRef('locatorId') as SelectComponentRef)
            .fetchApi!();
        }
      },
    },
  },
  {
    component: 'ChcSelect',
    componentProps: () => {
      return {
        autoChooseFirstOption: false,
        dictUrl: '/warehouseAction/wareLocatorList.do',
        // showSearch: true,
        placeholder: '请选择',
        triggerFields: ['zoneId', 'type', 'warehouseId', 'sectionId'],
        onChange(val: any, option: any) {
          console.warn('pickupLocatorId', val, option);
        },
        paginate: false,
        showChooseAll: '',
        immediate: true,
        labelField: 'name',
        valueField: 'id',
        afterFetch(res: any) {
          return { ...res, rows: undefined, records: res.rows };
        },
      };
    },
    fieldName: 'pickupLocatorId',
    label: '默认散件货位',
    dependencies: {
      triggerFields: ['zoneId', 'type', 'warehouseId', 'sectionId'],
      async trigger(values) {
        await nextTick();
        if (
          BaseFormApi?.getFieldComponentRef &&
          typeof BaseFormApi?.getFieldComponentRef === 'function' &&
          BaseFormApi?.getFieldComponentRef('pickupLocatorId') &&
          (
            BaseFormApi.getFieldComponentRef(
              'pickupLocatorId',
            ) as SelectComponentRef
          ).params
        ) {
          (
            BaseFormApi.getFieldComponentRef(
              'pickupLocatorId',
            ) as SelectComponentRef
          ).params!.dependencies = {
            warehouseId: values.warehouseId,
            zoneId: values.zoneId,
            type: values.zoneId || values.sectionId ? 'locator' : undefined,
            sectionId: values.sectionId,
          };
          (
            BaseFormApi?.getFieldComponentRef(
              'pickupLocatorId',
            ) as SelectComponentRef
          ).fetchApi!();
          // BaseFormApi?.setFieldValue('pickupLocatorId', undefined);
        }
      },
    },
  },
  {
    component: 'ChcSelect',
    componentProps: () => {
      return {
        autoChooseFirstOption: false,
        dictUrl: '/warehouseAction/replenishSourceList.do',
        extraParams: lotExtraParam.value,
        // extraParams: {
        //   warehouseId: dynamicParams.warehouseId,
        // },
        // showSearch: true,
        placeholder: '请选择',
        onChange(val: any, option: any) {
          console.warn('replenishSource', val, option);
        },
        paginate: false,
        showChooseAll: '',
        immediate: true,
        labelField: 'name',
        valueField: 'id',
        afterFetch(res: any) {
          // 将id和name为空的过滤掉
          res.rows = res.rows.filter((item: any) => item.id && item.name);
          return { ...res, rows: undefined, records: res.rows };
        },
      };
    },
    rules: 'required',
    fieldName: 'replenishSource',
    label: '补货方式',
  },
  {
    component: 'ChcSelect',
    componentProps: () => {
      return {
        autoChooseFirstOption: false,
        dictUrl: '/baseHandleAction/warehouse.do?level1=Y&level2=Y&accessAll=Y',
        // showSearch: true,
        placeholder: '请选择',
        onChange(val: any, option: any) {
          console.warn('replenishWarehouseId', val, option);
        },
        paginate: false,
        showChooseAll: '',
        immediate: true,
        labelField: 'name',
        valueField: 'id',
        afterFetch(res: any) {
          return { ...res, rows: undefined, records: res.rows };
        },
      };
    },
    fieldName: 'replenishWarehouseId',
    label: '补货仓库',
  },
  {
    component: 'ChcSelect',
    componentProps: () => {
      return {
        autoChooseFirstOption: false,
        dictUrl:
          '/baseHandleAction/warehouse.do?level1=Y&level2=Y&accessAll=Y&selectDefault=N',
        // showSearch: true,
        placeholder: '请选择',
        onChange(val: any, option: any) {
          console.warn('agentWarehouseId', val, option);
        },
        paginate: false,
        showChooseAll: '',
        immediate: true,
        labelField: 'name',
        valueField: 'id',
        afterFetch(res: any) {
          return { ...res, rows: undefined, records: res.rows };
        },
      };
    },
    fieldName: 'agentWarehouseId',
    label: '代发仓库',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: '',
      maxlength: 20,
    },
    fieldName: 'invoiceRule',
    // formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
    // labelClass: 'leading-1 mb-[0px] pl-[4px]',
    label: '发票规则',
  },
  {
    component: 'Switch',
    fieldName: 'isPOStop',
    label: '采购停用',
    formItemClass: 'col-start-1',
    componentProps: () => {
      return {
        checkedValue: 'Y',
        unCheckedValue: 'N',
        checkedChildren: '是',
        unCheckedChildren: '否',
        style: {
          width: '40px',
        },
      };
    },
  },
  {
    component: 'Switch',
    fieldName: 'isPMSStop',
    label: '发药停用',
    // formItemClass: 'input-nostyle pb-1',
    componentProps: () => {
      return {
        checkedValue: 'Y',
        unCheckedValue: 'N',
        checkedChildren: '是',
        unCheckedChildren: '否',
        style: {
          width: '40px',
        },
      };
    },
  },
  {
    component: 'Switch',
    fieldName: 'isCrossDocking',
    label: '越库直配',
    componentProps: () => {
      return {
        checkedValue: 'Y',
        unCheckedValue: 'N',
        checkedChildren: '是',
        unCheckedChildren: '否',
        style: {
          width: '40px',
        },
      };
    },
  },
  {
    component: 'Switch',
    fieldName: 'isAutoOut',
    label: '自动出库',
    componentProps: () => {
      return {
        checkedValue: 'Y',
        unCheckedValue: 'N',
        checkedChildren: '是',
        unCheckedChildren: '否',
        style: {
          width: '40px',
        },
      };
    },
  },
  {
    component: 'ChcSelect',
    componentProps: () => {
      return {
        dictUrl:
          '/baseHandleAction/refList.do?id=M_Warehouse_Policy.basePackageType',
        // showSearch: true,
        placeholder: '请选择',
        apiType: 'post',
        requestContentType: 'application/x-www-form-urlencoded',
        paginate: false,
        immediate: true,
        labelField: 'name',
        valueField: 'id',
        afterFetch(res: any) {
          return { ...res, rows: undefined, records: res.rows };
        },
      };
    },
    fieldName: 'basePackageType',
    label: '单件包装方式',
  },
  {
    component: 'Switch',
    fieldName: 'isBasicMedicine',
    label: '是否基药',
    componentProps: () => {
      return {
        checkedValue: 'Y',
        unCheckedValue: 'N',
        checkedChildren: '是',
        unCheckedChildren: '否',
        style: {
          width: '40px',
        },
      };
    },
  },
  {
    component: 'Switch',
    fieldName: 'isInfusion',
    label: '是否大输液',
    componentProps: () => {
      return {
        checkedValue: 'Y',
        unCheckedValue: 'N',
        checkedChildren: '是',
        unCheckedChildren: '否',
        style: {
          width: '40px',
        },
      };
    },
  },
  {
    component: 'Switch',
    fieldName: 'isBloodProduct',
    label: '是否血液制品',
    componentProps: () => {
      return {
        checkedValue: 'Y',
        unCheckedValue: 'N',
        checkedChildren: '是',
        unCheckedChildren: '否',
        style: {
          width: '40px',
        },
      };
    },
  },
];

// 补货策略信息的表单配置
const replenishmentStrategyFormSchemas: VbenFormSchema[] = [
  {
    component: 'Switch',
    fieldName: 'isAutoReplenish',
    label: '自动补货',
    componentProps: () => {
      return {
        checkedValue: 'Y',
        unCheckedValue: 'N',
        checkedChildren: '是',
        unCheckedChildren: '否',
        style: {
          width: '40px',
        },
      };
    },
  },
  // {
  //   component: 'ChcSelect',
  //   fieldName: 'replenishPolicyId',
  //   rules: 'required',
  //   label: '自动补货策略',
  //   componentProps: () => {
  //     return {
  //       dictUrl: '/warehouseAction/replenishPolicyList.do',
  //       placeholder: '请选择',
  //       paginate: false,
  //       // showChooseAll: '',
  //       immediate: true,
  //       labelField: 'name',
  //       valueField: 'id',
  //       autoChooseFirstOption: false,
  //       afterFetch(res: any) {
  //         return { ...res, rows: undefined, records: res.rows || [] };
  //       },
  //     };
  //   },
  // },
  {
    component: 'Input',
    fieldName: 'levelMin',
    label: '安全库存',
    componentProps: () => {
      return {
        allowClear: true,
        placeholder: ' ',
        maxlength: 20,
      };
    },
  },
  {
    component: 'Input',
    fieldName: 'levelMax',
    label: '最高库存',
    componentProps: () => {
      return {
        allowClear: true,
        placeholder: ' ',
        maxlength: 20,
      };
    },
  },
  {
    component: 'Input',
    fieldName: 'levelReplenish',
    label: '补货点',
    componentProps: () => {
      return {
        allowClear: true,
        placeholder: ' ',
        maxlength: 20,
      };
    },
  },
  {
    component: 'ChcSelect',
    fieldName: 'replenishPackageQty',
    label: '补货定数',
    componentProps: () => {
      return {
        dictUrl: '/productAction/productPackList.do',
        extraParams: lotExtraParam2.value,
        // extraParams: {
        //   productId: dynamicParams.productId,
        // },
        placeholder: '请选择',
        paginate: false,
        // showChooseAll: '',
        immediate: true,
        labelField: 'name',
        valueField: 'id',
        autoChooseFirstOption: true,
        afterFetch(res: any) {
          return { ...res, rows: undefined, records: res.rows || [] };
        },
      };
    },
  },
  {
    component: 'Input',
    fieldName: 'levelDay',
    label: '日均销量',
    disabled: true,
    componentProps: () => {
      return {
        allowClear: true,
        placeholder: ' ',
        maxlength: 20,
      };
    },
  },
  {
    component: 'Input',
    fieldName: 'levelDay1',
    label: '前7天消耗均值',
    disabled: true,
    componentProps: () => {
      return {
        allowClear: true,
        placeholder: ' ',
        maxlength: 20,
      };
    },
  },
  {
    component: 'Input',
    fieldName: 'levelDay2',
    label: '前30天消耗均值',
    disabled: true,
    componentProps: () => {
      return {
        allowClear: true,
        placeholder: ' ',
        maxlength: 20,
      };
    },
  },
  {
    component: 'Input',
    fieldName: 'levelDay3',
    label: '前7天消耗最大值',
    disabled: true,
    componentProps: () => {
      return {
        allowClear: true,
        placeholder: ' ',
        maxlength: 20,
      };
    },
  },
  {
    component: 'Input',
    fieldName: 'lastReplenishDate',
    label: '上次补货日期',
    disabled: true,
    componentProps: () => {
      return {
        allowClear: true,
        placeholder: ' ',
        maxlength: 20,
      };
    },
  },
  {
    component: 'Input',
    fieldName: 'monthConsumeMax',
    label: '月消耗上限',
    disabled: true,
    componentProps: () => {
      return {
        allowClear: true,
        placeholder: ' ',
        maxlength: 20,
      };
    },
    dependencies: {
      triggerFields: ['a'],
      show: () => shouldShowField('monthConsumeMax'),
    },
  },
  {
    component: 'Switch',
    fieldName: 'isAutoCalculate',
    label: '自动计算补货点',
    formItemClass: 'col-start-1',
    componentProps: () => {
      return {
        checkedValue: 'Y',
        unCheckedValue: 'N',
        checkedChildren: '是',
        unCheckedChildren: '否',
        style: {
          width: '40px',
        },
      };
    },
  },
  {
    component: 'Input',
    fieldName: 'minimumQty',
    label: '最低库存',
    componentProps: () => {
      return {
        allowClear: true,
        placeholder: ' ',
        maxlength: 20,
      };
    },
  },
  {
    component: 'Textarea',
    componentProps: () => {
      return {
        placeholder: '请输入备注',
        type: 'textarea',
      };
    },
    formItemClass: 'col-span-2',
    fieldName: 'description',
    label: '描述',
  },
];

// 基本信息
const [BaseForm, BaseFormApi] = useVbenForm({
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 在label后显示一个冒号
    colon: true,
    labelClass: 'w-[120px]',
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  // 水平布局，label和input在同一行
  layout: 'horizontal',
  actionWrapperClass: 'formActionAreaStyle',
  // 控制表单是否显示折叠按钮
  showCollapseButton: false,
  submitButtonOptions: {
    show: false,
  },
  resetButtonOptions: {
    show: false,
  },
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
  schema: baseFormSchemas,
  wrapperClass: 'grid-cols-2',
});

// 补货策略信息
const [ReplenishmentStrategyForm, replenishmentStrategyFormApi] = useVbenForm({
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 在label后显示一个冒号
    colon: true,
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
    labelClass: 'w-[120px]',
  },
  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行
  actionWrapperClass: 'formActionAreaStyle',
  layout: 'horizontal',

  showCollapseButton: false,
  showDefaultActions: false,
  schema: replenishmentStrategyFormSchemas,
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-2',
});

const [ModalFirst, modalApi] = useVbenModal({
  showConfirmButton: true,
  confirmDisabled: false,
  showCancelButton: true,
  cancelText: '关闭',
  confirmText: '保存',
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      modalData.value = {};
      modalData.value = modalApi.getData<Record<string, any>>();
      console.warn('onOpenChange modalData', modalData.value);
      modalTitle.value = modalData.value.modalTitle || modalTitle.value;
      hiddenFieldSet.value = new Set(
        modalData.value.hiddenField.split(',').filter(Boolean),
      );
      // console.warn('hiddenFieldSet', hiddenFieldSet.value);
      // 重置所有动态参数
      Object.keys(dynamicParams).forEach((key) => {
        dynamicParams[key as keyof typeof dynamicParams] = '';
      });
      // 解构出需要回显的字段
      const {
        warehouseId,
        productId,
        productCode,
        productName,
        productSpecId,
        productSpec,
        manufacturer,
        zoneId,
        sectionId,
        locatorId,
        pickupLocatorId,
        replenishSource,
        replenishWarehouseId,
        agentWarehouseId,
        invoiceRule,
        isPOStop,
        isPMSStop,
        isCrossDocking,
        isAutoOut,
        basePackageType,
        isAutoReplenish,
        // replenishPolicyId,
        levelMin,
        levelMax,
        levelReplenish,
        replenishPackageQty,
        levelDay,
        levelDay1,
        levelDay2,
        levelDay3,
        lastReplenishDate,
        monthConsumeMax,
        isAutoCalculate,
        minimumQty,
        description,
        isBasicMedicine,
        isInfusion,
        isBloodProduct,
      } = modalData.value.row;
      dynamicParams.warehouseId = warehouseId;
      dynamicParams.productId = productId;
      lotExtraParam.value.warehouseId = warehouseId;
      lotExtraParam2.value.productId = productId;
      setTimeout(() => {
        BaseFormApi.setValues({
          warehouseId,
          productId,
          productCode,
          productName,
          productSpecId,
          productSpec,
          manufacturer,
          replenishSource,
          replenishWarehouseId,
          agentWarehouseId,
          invoiceRule,
          isPOStop,
          isPMSStop,
          isCrossDocking,
          isAutoOut,
          basePackageType,
          isBasicMedicine,
          isInfusion,
          isBloodProduct,
        });
        replenishmentStrategyFormApi.setValues({
          isAutoReplenish,
          // replenishPolicyId,
          levelMin,
          levelMax,
          levelReplenish,
          replenishPackageQty,
          levelDay,
          levelDay1,
          levelDay2,
          levelDay3,
          lastReplenishDate,
          monthConsumeMax,
          isAutoCalculate,
          minimumQty,
          description,
        });
      }, 100);
      nextTick(() => {
        BaseFormApi?.setFieldValue('zoneId', zoneId || '');
        nextTick(() => {
          BaseFormApi?.setFieldValue('sectionId', sectionId || '');
          nextTick(() => {
            BaseFormApi?.setFieldValue('locatorId', locatorId || '');
            BaseFormApi?.setFieldValue(
              'pickupLocatorId',
              pickupLocatorId || '',
            );
          });
        });
      });
    }
  },
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {
    const { valid: baseFormValid } = await BaseFormApi.validate();
    const { valid: replenishmentStrategyValid } =
      await replenishmentStrategyFormApi.validate();
    if (baseFormValid && replenishmentStrategyValid) {
      console.warn('校验通过===>');
      const basicFormValues = await BaseFormApi.getValues();
      const replenishmentStrategyFormValues =
        await replenishmentStrategyFormApi.getValues();
      console.warn(
        'onConfirmformValues',
        basicFormValues,
        replenishmentStrategyFormValues,
      );
      if (
        basicFormValues.warehouseId === '0' ||
        !basicFormValues.warehouseId ||
        basicFormValues.warehouseId === ''
      ) {
        Modal.error({
          title: '错误',
          content: '请选择仓库',
          centered: true,
        });
        return;
      }
      const params: Record<string, any> = {
        warehouseId: basicFormValues.warehouseId,
        productId: dynamicParams.productId,
        // replenishId: modalData.value?.row?.replenishId,
        ...basicFormValues,
        ...replenishmentStrategyFormValues,
      };
      try {
        const res = await saveWarehouseProduct(params);
        if (res && res.success) {
          message.success('成功');
          modalApi.close();
          BaseFormApi.resetForm();
          replenishmentStrategyFormApi.resetForm();
          modalData.value?.callback();
        } else {
          Modal.error({
            title: '错误',
            content: res?.message || '复制失败',
            centered: true,
          });
        }
      } catch (error) {
        console.warn('err', error);
      }
    }
  },
});

onMounted(() => {});
</script>
<template>
  <ModalFirst :title="modalTitle" class="w-[800px]">
    <ChooseProductModal />
    <div class="form-title">基本信息</div>
    <BaseForm />
    <div class="form-title">补货策略信息</div>
    <ReplenishmentStrategyForm />
    <!-- <template #prepend-footer>
      <Button type="primary">保存</Button>
    </template> -->
  </ModalFirst>
</template>

<style scoped lang="less">
::v-deep(.ant-btn > svg) {
  margin-bottom: 4px;
  margin-left: -2px;
}
.form-title {
  margin-bottom: 20px;
  padding: 0 10px;
  font-size: 20px;
  font-weight: 500;
}
</style>
