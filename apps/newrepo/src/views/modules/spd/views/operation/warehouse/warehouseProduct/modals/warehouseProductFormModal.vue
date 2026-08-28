<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';

import { h, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { SearchActionIcon } from '@vben/chc-icons';
import { useVbenModal, z } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { requestFormClient } from '#/api/request';
import { ChcSelect } from '@vben/chc-ui';
import chooseProductModalUi from './chooseProductModal.vue'; // 药品编码弹框
import locatorSearchModalUi from './locatorSearchModal.vue'; // 散件货位选择弹框

type ModalType = 'ADD' | 'EDIT';

interface DynamicParams {
  warehouseId: string;
  zoneId: string;
  sectionId: string;
  pickupSectionId: string;
  poSectionId: string;
  locatorId: string;
  pickupLocatorId: string;
  poLocatorId: string;
  productId: string;
  // replenishPolicyId: string;
  productCategoryValue: string;
}
const route = useRoute();
const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数
const hiddenField: string = urlParams.hiddenField || '';
const hiddenFieldSet = new Set(hiddenField.split(',').filter(Boolean));
const modalData = ref<Record<string, any>>({});
const modalTitle = ref('');
const modalType = ref<ModalType>('ADD');
// 默认散件货位信息
const pickupLocatorInfo = ref<Record<string, any>>({});
// 新选中的散件货位信息
const newPickupLocatorInfo = ref<Record<string, any>>({});
// 创建响应式的参数对象
const dynamicParams = reactive<DynamicParams>({
  warehouseId: '', // 仓库基础参数
  zoneId: '', // 字库ID
  sectionId: '', // 整件库区ID
  pickupSectionId: '', // 散件库区ID
  poSectionId: '', // 采购库区ID
  locatorId: '', // 整件货位ID
  pickupLocatorId: '', // 散件货位ID
  poLocatorId: '', // 采购货位ID
  productId: '', // 商品ID(用于规格、补货定数等)
  // replenishPolicyId: '', // 补货策略ID
  productCategoryValue: '',
});
// 商品规格额外参数
const productSpecIdExtraParams = ref<{
  productId?: number | string | undefined;
}>({
  productId: '',
});
// 默认子库
const zoneIdExtraParams = ref<{
  warehouseId?: number | string | undefined;
}>({
  warehouseId: '',
});
// 默认整件库区
const sectionIdExtraParams = ref<{
  type: string;
  warehouseId?: number | string | undefined;
}>({
  type: 'section',
  warehouseId: '',
});
// 默认整件货位
const locatorIdExtraParams = ref<{
  isScatter: string;
  type: string;
  warehouseId?: number | string | undefined;
}>({
  type: 'locator',
  isScatter: 'N',
  warehouseId: '',
});
// 默认散件库区
const pickupSectionIdExtraParams = ref<{
  type: string;
  warehouseId?: number | string | undefined;
}>({
  type: 'section',
  warehouseId: '',
});
// 默认散件货位
const pickupLocatorIdExtraParams = ref<{
  isScatter: string;
  type: string;
  warehouseId?: number | string | undefined;
}>({
  type: 'locator',
  isScatter: 'Y',
  warehouseId: '',
});
// 默认采购库区
const poSectionIdExtraParams = ref<{
  type: string;
  warehouseId?: number | string | undefined;
}>({
  type: 'section',
  warehouseId: '',
});
// 默认采购货位
const poLocatorIdExtraParams = ref<{
  type: string;
  warehouseId?: number | string | undefined;
}>({
  type: 'locator',
  warehouseId: '',
});

// 补货方式
const replenishPolicyIdExtraParams = ref<{
  warehouseId?: number | string | undefined;
}>({
  warehouseId: '',
});
// 补货定数
const replenishPackageQtyExtraParams = ref<{
  productId?: number | string | undefined;
}>({
  productId: '',
});

watch(
  () => dynamicParams,
  (newVal) => {
    productSpecIdExtraParams.value.productId = newVal.productId;
    zoneIdExtraParams.value.warehouseId = newVal.warehouseId;
    sectionIdExtraParams.value.warehouseId = newVal.warehouseId;
    locatorIdExtraParams.value.warehouseId = newVal.warehouseId;
    pickupSectionIdExtraParams.value.warehouseId = newVal.warehouseId;
    pickupLocatorIdExtraParams.value.warehouseId = newVal.warehouseId;
    poSectionIdExtraParams.value.warehouseId = newVal.warehouseId;
    poLocatorIdExtraParams.value.warehouseId = newVal.warehouseId;
    replenishPolicyIdExtraParams.value.warehouseId = newVal.warehouseId;
    replenishPackageQtyExtraParams.value.productId = newVal.productId;
  },
  {
    immediate: true,
    deep: true,
  },
);

const [ChooseProductModal, ChooseProductModalApi] = useVbenModal({
  class: 'w-[1300px]',
  closable: true,
  draggable: true,
  connectedComponent: chooseProductModalUi,
});

const [LocatorSearchModal, LocatorSearchModalApi] = useVbenModal({
  class: 'w-[500px]',
  closable: true,
  draggable: true,
  connectedComponent: locatorSearchModalUi,
});

/**
 * 判断字段是否应该显示
 * @param fieldName - 字段名
 * @returns 是否显示
 */
const shouldShowField = (fieldName: string): boolean => {
  return !hiddenFieldSet.has(fieldName);
};

/**
 * 散件货位选择确认回调
 */
const handleLocatorConfirm = (row: any) => {
  if (row?.id) {
    newPickupLocatorInfo.value = row;
    BaseFormApi?.setFieldValue('pickupLocatorId', row.locatorName || row.name);
    BaseFormApi?.setFieldValue('pickupLocatorId_value', row.id);
    BaseFormApi?.setFieldValue('isAutoMove', row.isAutoMove);
  }
};

/**
 * 打开散件货位选择弹窗
 */
const openLocatorSearchModal = async () => {
  const locatorInfo = newPickupLocatorInfo.value.id
    ? newPickupLocatorInfo.value
    : pickupLocatorInfo.value.id
      ? pickupLocatorInfo.value
      : {};
  LocatorSearchModalApi.setData({
    warehouseId: dynamicParams.warehouseId,
    locatorInfo,
  }).open();
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
    component: 'Input',
    fieldName: 'warehouseName',
    label: '仓库',
    rules: 'required',
    // help: '来源于SCP的该机构的机构编码',
    disabled: true,
    componentProps: () => {
      return {
        placeholder: '请输入仓库名称',
      };
    },
  },
  {
    component: 'Input',
    fieldName: 'productCategoryValue',
    label: '商品类别值',
    componentProps: () => ({ placeholder: '' }),
    dependencies: {
      triggerFields: ['a'],
      show: () => false,
    },
  },
  {
    fieldName: 'productCode', // 药品编码 productCode
    // formItemClass: 'col-start-1 col-start-1  pl-[10px] pr-[10px]',
    // labelClass: 'leading-1 mb-[0px] pl-[4px]',
    label: '药品编码',
    rules: 'required',
    component: 'Input',
    componentProps: () => {
      return {
        allowClear: false,
        placeholder: ' ',
        maxlength: 20,
        disabled: modalType.value === 'EDIT',
      };
    },
    renderComponentContent: () => ({
      suffix: () =>
        h(SearchActionIcon, {
          onClick: async () => {
            const formValues = await BaseFormApi.getValues();
            ChooseProductModalApi.setData({
              productCode: formValues.productCode,
              productCategoryValue: modalData.value.productCategoryValue || '',
              callback: (row: any) => {
                dynamicParams.productId = row.productId;
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
                  BaseFormApi?.setFieldValue('productCode', row.productCode);
                  BaseFormApi?.setFieldValue('productName', row.productName);
                  BaseFormApi?.setFieldValue('manufacturer', row.manufacturer);
                  BaseFormApi?.setFieldValue('productSpec', row.productSpec);
                  replenishmentStrategyFormApi?.setFieldValue(
                    'levelMin',
                    row.levelMin,
                  );
                  replenishmentStrategyFormApi?.setFieldValue(
                    'levelMax',
                    row.levelMax,
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
        showChooseAll: false,
        immediate: true,
        labelField: 'name',
        valueField: 'id',
        autoChooseFirstOption: true,
        extraParams: productSpecIdExtraParams.value,
        afterFetch(res: any) {
          // 选中第一项
          BaseFormApi?.setFieldValue('productSpecId', res.rows?.[0]?.id);
          return { ...res, rows: undefined, records: res.rows || [] };
        },
      };
    },
  },
  {
    component: 'Input',
    fieldName: 'productSpec',
    // formItemClass: ' col-span-1 col-start-1  pl-[10px] pr-[10px]',
    // labelClass: 'leading-1 mb-[0px] pl-[4px]',
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
    fieldName: 'zoneId',
    formItemClass: 'col-span-1',
    label: '默认子库',
    component: 'ChcSelect',
    componentProps: () => {
      return {
        autoChooseFirstOption: false,
        dictUrl: '/warehouseAction/zoneList.do',
        extraParams: zoneIdExtraParams.value,
        placeholder: '请选择',
        onChange(val: any, option: any) {
          dynamicParams.zoneId = val;
        },
        paginate: false,
        showChooseAll: '',
        chooseAllLabel: '请选择',
        immediate: true,
        labelField: 'name',
        valueField: 'id',
        afterFetch(res: any) {
          // 选中第一项
          BaseFormApi.getValues().then(async (values) => {
            await nextTick();
            if (!values.zoneId && modalType.value === 'EDIT') {
              setTimeout(() => {
                BaseFormApi?.setFieldValue('zoneId', res.rows?.[0]?.id);
              }, 200);
            }
          });

          return { ...res, rows: undefined, records: res.rows || [] };
        },
      };
    },
  },
  {
    component: 'ChcSelect',
    componentProps: () => {
      return {
        autoChooseFirstOption: false,
        dictUrl: '/warehouseAction/wareLocatorList.do',
        apiType: 'post',
        requestContentType: 'application/x-www-form-urlencoded',
        extraParams: sectionIdExtraParams.value,
        // dictUrl: '/warehouseAction/sectionList.do',
        // showSearch: true,
        placeholder: '请选择',
        triggerFields: ['zoneId'],
        onChange(_val: any, _option: any) {},
        paginate: false,
        showChooseAll: '',
        chooseAllLabel: '请选择',
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
      triggerFields: ['zoneId'], // 当zoneId改变时，触发依赖更新
      async trigger(values) {
        await nextTick();
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
            zoneId: values.zoneId,
          };
          (BaseFormApi?.getFieldComponentRef('sectionId') as SelectComponentRef)
            .fetchApi!();
          // BaseFormApi?.setFieldValue('sectionId', undefined);
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
        apiType: 'post',
        requestContentType: 'application/x-www-form-urlencoded',
        extraParams: locatorIdExtraParams.value,
        placeholder: '请选择',
        triggerFields: ['zoneId', 'sectionId'],
        onChange(_val: any, _option: any) {},
        paginate: false,
        showChooseAll: '',
        chooseAllLabel: '请选择',
        immediate: true,
        labelField: 'name',
        valueField: 'id',
        afterFetch(res: any) {
          return {
            ...res,
            rows: undefined,
            records: (res?.rows || []).map((it) => {
              return {
                ...it,
                id: String(it.id),
              };
            }),
          };
        },
      };
    },
    fieldName: 'locatorId',
    label: '默认整件货位',
    dependencies: {
      triggerFields: ['zoneId', 'sectionId'],
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
            zoneId: values.zoneId,
            sectionId: values.sectionId,
          };
          (BaseFormApi?.getFieldComponentRef('locatorId') as SelectComponentRef)
            .fetchApi!();
          // BaseFormApi?.setFieldValue('locatorId', undefined);
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
        apiType: 'post',
        requestContentType: 'application/x-www-form-urlencoded',
        extraParams: pickupSectionIdExtraParams.value,
        placeholder: '请选择',
        triggerFields: ['zoneId'],
        onChange(_val: any, _option: any) {},
        paginate: false,
        showChooseAll: '',
        chooseAllLabel: '请选择',
        immediate: true,
        labelField: 'name',
        valueField: 'id',
        afterFetch(res: any) {
          return { ...res, rows: undefined, records: res.rows };
        },
      };
    },
    fieldName: 'pickupSectionId',
    label: '默认散件库区',
    dependencies: {
      triggerFields: ['zoneId'], // 当zoneId改变时，触发依赖更新
      async trigger(values) {
        await nextTick();
        if (BaseFormApi?.getFieldComponentRef) {
          const pickupSectionIdRef =
            BaseFormApi?.getFieldComponentRef<InstanceType<typeof ChcSelect>>(
              'pickupSectionId',
            );
          if (pickupSectionIdRef) {
            pickupSectionIdRef.params!.dependencies = {
              zoneId: values.zoneId,
            };
            await pickupSectionIdRef.fetchApi!();
            if (!initData.value.pickupSectionId) {
              pickupSectionIdRef.selectFirstOption();
            }
            initData.value.pickupSectionId = '';
          }
        }
      },
    },
  },
  {
    fieldName: 'pickupLocatorId',
    label: '默认散件货位',
    component: 'Input',
    componentProps: () => {
      return {
        placeholder: '请选择散件货位',
        allowClear: true,
        readonly: true,
        onFocus: openLocatorSearchModal,
      };
    },
    renderComponentContent: () => ({
      suffix: () =>
        h(SearchActionIcon, {
          onClick: openLocatorSearchModal,
        }),
    }),
  },
  {
    component: 'Input',
    fieldName: 'pickupLocatorId_value',
    label: '',
    dependencies: {
      triggerFields: ['a'],
      show: () => false,
    },
  },
  {
    component: 'Switch',
    fieldName: 'isAutoMove',
    label: '',
    dependencies: {
      triggerFields: ['a'],
      show: () => false,
    },
  },
  {
    component: 'ChcSelect',
    componentProps: () => {
      return {
        autoChooseFirstOption: false,
        dictUrl: '/warehouseAction/wareLocatorList.do',
        apiType: 'post',
        requestContentType: 'application/x-www-form-urlencoded',
        extraParams: poSectionIdExtraParams.value,
        placeholder: '请选择',
        triggerFields: ['zoneId'],
        onChange(_val: any, _option: any) {},
        paginate: false,
        showChooseAll: '',
        chooseAllLabel: '请选择',
        immediate: true,
        labelField: 'name',
        valueField: 'id',
        afterFetch(res: any) {
          return { ...res, rows: undefined, records: res.rows };
        },
      };
    },
    fieldName: 'poSectionId',
    label: '默认采购库区',
    dependencies: {
      triggerFields: ['zoneId'],
      show: () => {
        return false;
      },
      async trigger(values) {
        await nextTick();
        if (
          BaseFormApi?.getFieldComponentRef &&
          typeof BaseFormApi?.getFieldComponentRef === 'function' &&
          BaseFormApi?.getFieldComponentRef('poSectionId') &&
          (
            BaseFormApi.getFieldComponentRef(
              'poSectionId',
            ) as SelectComponentRef
          ).params
        ) {
          (
            BaseFormApi.getFieldComponentRef(
              'poSectionId',
            ) as SelectComponentRef
          ).params!.dependencies = {
            zoneId: values.zoneId,
          };
          (
            BaseFormApi?.getFieldComponentRef(
              'poSectionId',
            ) as SelectComponentRef
          ).fetchApi!();
          // BaseFormApi?.setFieldValue('poSectionId', undefined);
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
        apiType: 'post',
        requestContentType: 'application/x-www-form-urlencoded',
        extraParams: poLocatorIdExtraParams.value,
        placeholder: '请选择',
        triggerFields: ['zoneId', 'poSectionId', 'sectionId'],
        onChange(_val: any, _option: any) {},
        paginate: false,
        showChooseAll: '',
        chooseAllLabel: '请选择',
        immediate: true,
        labelField: 'name',
        valueField: 'id',
        afterFetch(res: any) {
          return { ...res, rows: undefined, records: res.rows };
        },
      };
    },
    fieldName: 'poLocatorId',
    label: '默认采购货位',
    dependencies: {
      triggerFields: ['zoneId', 'poSectionId', 'sectionId'],
      show: () => {
        return false;
      },
      async trigger(values) {
        await nextTick();
        if (
          BaseFormApi?.getFieldComponentRef &&
          typeof BaseFormApi?.getFieldComponentRef === 'function' &&
          BaseFormApi?.getFieldComponentRef('poLocatorId') &&
          (
            BaseFormApi.getFieldComponentRef(
              'poLocatorId',
            ) as SelectComponentRef
          ).params
        ) {
          (
            BaseFormApi.getFieldComponentRef(
              'poLocatorId',
            ) as SelectComponentRef
          ).params!.dependencies = {
            zoneId: values.zoneId,
            sectionId: values.poSectionId,
            poSectionId: values.poSectionId,
          };
          (
            BaseFormApi?.getFieldComponentRef(
              'poLocatorId',
            ) as SelectComponentRef
          ).fetchApi!();
          // BaseFormApi?.setFieldValue('poLocatorId', undefined);
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
        extraParams: replenishPolicyIdExtraParams.value,
        // showSearch: true,
        placeholder: '请选择',
        onChange(_val: any, _option: any) {},
        paginate: false,
        showChooseAll: false,
        chooseAllLabel: '请选择',
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
        onChange(_val: any, _option: any) {},
        paginate: false,
        showChooseAll: '',
        chooseAllLabel: '请选择',
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
        placeholder: '请选择',
        onChange(_val: any, _option: any) {},
        paginate: false,
        showChooseAll: '',
        chooseAllLabel: '请选择',
        // allowClear: true,
        immediate: true,
        labelField: 'name',
        valueField: 'id',
        afterFetch(res: any) {
          return { ...res, rows: undefined, records: res.rows };
        },
      };
    },
    fieldName: 'agentWarehouseId',
    label: '走账仓库', // #4108
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
    component: 'ChcSelect',
    componentProps: () => {
      return {
        dictUrl: '/baseHandleAction/customer.do?readWrite=Y&isDepartment=Y',
        // showSearch: true,
        placeholder: '请选择',
        apiType: 'post',
        requestContentType: 'application/x-www-form-urlencoded',
        paginate: false,
        immediate: true,
        showChooseAll: '',
        chooseAllLabel: '请选择',
        labelField: 'name',
        valueField: 'id',
        afterFetch(res: any) {
          return { ...res, rows: undefined, records: res.rows };
        },
      };
    },
    fieldName: 'billBpartnerId',
    formItemClass: 'col-span-1',
    label: '记账科室',
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
    label: '请领自动转直配',
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
    fieldName: 'isAutoOut',
    label: '自动出库',
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
    fieldName: 'isReportDrug',
    label: '报告药',
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
        showChooseAll: '',
        chooseAllLabel: '请选择',
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
    fieldName: 'isSplitZero',
    label: '是否拆零',
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
  {
    component: 'Switch',
    fieldName: 'isPeritonealDialysis',
    label: '是否腹膜透析',
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
    component: 'Input',
    fieldName: 'basicMedicineQty',
    label: '基数数量',
    componentProps: () => {
      return {
        placeholder: '请输入基数数量',
      };
    },
    rules: z.coerce
      .number({ message: '请输入基数数量' })
      .min(0, '基数数量不能为负数')
      .optional(),
    dependencies: {
      triggerFields: ['isBasicMedicine'],
      if: (values) => {
        return values?.isBasicMedicine === 'Y';
      },
    },
  },
];

// 补货策略信息的表单配置
const replenishmentStrategyFormSchemas: VbenFormSchema[] = [
  {
    component: 'Switch',
    fieldName: 'isAutoReplenish',
    label: '自动补货',
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
  // {
  //   component: 'ChcSelect',
  //   fieldName: 'replenishPolicyId',
  //   // formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
  //   // labelClass: 'leading-1 mb-[0px] pl-[4px]',
  //   label: '自动补货策略',
  //   componentProps: () => {
  //     return {
  //       dictUrl: '/warehouseAction/replenishPolicyList.do',
  //       placeholder: '请选择',
  //       paginate: false,
  //       showChooseAll: '',
  //       chooseAllLabel: '请选择',
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
        extraParams: replenishPackageQtyExtraParams.value,
        placeholder: '请选择',
        paginate: false,
        showChooseAll: '',
        chooseAllLabel: '请选择',
        immediate: true,
        labelField: 'name',
        valueField: 'id',
        autoChooseFirstOption: false,
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
    component: 'Input',
    fieldName: 'reportDrugQty',
    label: '报告总量',
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
    fieldName: 'thisReportDrugQty',
    label: '本次报告量',
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
    fieldName: 'shortPoQtyMax',
    label: '临采量上限',
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
    fieldName: 'dispenseType',
    // formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
    // labelClass: 'leading-1 mb-[0px] pl-[4px]',
    label: '发药方式',
    rules: 'required',
    componentProps: () => {
      return {
        dictUrl: '/baseHandleAction/refList.do?id=1000418',
        placeholder: '请选择',
        paginate: false,
        showChooseAll: false,
        chooseAllLabel: '请选择',
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

/**
 * 处理值为0的字段，将其转换为undefined
 * @param data  原始数据对象
 * @param fields  需要处理的字段列表
 * @returns 处理后的对象
 */
const normalizeZeroValues = (
  data: Record<string, any>,
  fields: readonly string[],
) => {
  const result = { ...data };
  fields.forEach((field) => {
    if (result[field] === 0 || result[field] === '0') {
      result[field] = undefined;
    }
  });
  return result;
};
const initData = ref<{
  pickupSectionId?: number | string | undefined;
}>({
  pickupSectionId: '',
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
      newPickupLocatorInfo.value = {};
      pickupLocatorInfo.value = {};
      initData.value.pickupSectionId = undefined;
      modalData.value = modalApi.getData<Record<string, any>>();
      modalTitle.value = modalData.value.modalTitle || modalTitle.value;
      modalType.value = modalData.value.modalType || modalType.value;
      // 重置所有动态参数
      Object.keys(dynamicParams).forEach((key) => {
        dynamicParams[key as keyof typeof dynamicParams] = '';
      });
      // 同步商品类别值到表单隐藏字段，以驱动依赖显示逻辑
      BaseFormApi?.setFieldValue(
        'productCategoryValue',
        modalData.value.productCategoryValue || '',
      );
      if (modalType.value === 'ADD') {
        dynamicParams.warehouseId = modalData.value.warehouseId;
        setTimeout(() => {
          BaseFormApi.setValues({
            warehouseId: dynamicParams.warehouseId,
            warehouseName: modalData.value.warehouseName,
            productCategoryValue: modalData.value.productCategoryValue,
          });
        }, 100);
      }
      if (modalType.value === 'EDIT') {
        // 解构出需要回显的字段
        const {
          warehouseId,
          productId,
          // warehouseName,
          // productCode,
          // productName,
          // productSpecId,
          // productSpec,
          // manufacturer,
          // replenishSource,
          // replenishWarehouseId,
          // agentWarehouseId,
          // invoiceRule,
          // billBpartnerId,
          // isPOStop,
          // isPMSStop,
          // isCrossDocking,
          // isAutoOut,
          // isReportDrug,
          // basePackageType,
          // isAutoReplenish,
          // replenishPolicyId,
          // levelMin,
          // levelMax,
          // levelReplenish,
          // replenishPackageQty,
          // levelDay,
          // levelDay1,
          // levelDay2,
          // levelDay3,
          // lastReplenishDate,
          // monthConsumeMax,
          // isAutoCalculate,
          // minimumQty,
          // reportDrugQty,
          // thisReportDrugQty,
          // shortPoQtyMax,
          // description,
          // sectionId,
          // zoneId,
          // pickupSectionId,
          // poSectionId,
          // locatorId,
          // pickupLocatorId,
          // poLocatorId,
        } = modalData.value.row;
        // dynamicParams.warehouseId = warehouseId;
        // dynamicParams.productId = productId;
        // setTimeout(async () => {
        //   BaseFormApi.setValues({
        //     // ...toRaw(modalData.value.row),
        //     // packUnit: isEmpty(modalData.value?.row?.packUnit)
        //     //   ? 0
        //     //   : Number.parseFloat(modalData.value?.row?.packUnit),
        //     warehouseName,
        //     productCode,
        //     productName,
        //     productSpecId,
        //     productSpec,
        //     manufacturer,
        //     replenishSource,
        //     replenishWarehouseId: replenishWarehouseId || undefined,
        //     agentWarehouseId,
        //     invoiceRule,
        //     billBpartnerId,
        //     isPOStop,
        //     isPMSStop,
        //     isCrossDocking,
        //     isAutoOut,
        //     isReportDrug,
        //     basePackageType,
        //   });
        //   nextTick(() => {
        //     BaseFormApi?.setFieldValue('zoneId', zoneId || undefined);
        //     nextTick(() => {
        //       BaseFormApi?.setFieldValue('sectionId', sectionId || undefined);
        //       BaseFormApi?.setFieldValue('pickupSectionId', pickupSectionId);
        //       BaseFormApi?.setFieldValue('poSectionId', poSectionId);
        //       nextTick(() => {
        //         BaseFormApi?.setFieldValue('locatorId', locatorId);
        //         BaseFormApi?.setFieldValue('pickupLocatorId', pickupLocatorId);
        //         BaseFormApi?.setFieldValue('poLocatorId', poLocatorId);
        //       });
        //     });
        //   });
        //   replenishmentStrategyFormApi.setValues({
        //     isAutoReplenish,
        //     replenishPolicyId,
        //     levelMin,
        //     levelMax,
        //     levelReplenish,
        //     replenishPackageQty,
        //     levelDay,
        //     levelDay1,
        //     levelDay2,
        //     levelDay3,
        //     lastReplenishDate,
        //     monthConsumeMax,
        //     isAutoCalculate,
        //     minimumQty,
        //     reportDrugQty,
        //     thisReportDrugQty,
        //     shortPoQtyMax,
        //     description,
        //   });
        // }, 100);

        // 定义需要处理0值的字段列表
        const zeroToUndefinedFields = [
          'zoneId',
          'sectionId',
          'locatorId',
          'pickupSectionId',
          'pickupLocatorId',
          'poSectionId',
          'poLocatorId',
          'replenishWarehouseId',
          'agentWarehouseId',
          'replenishPackageQty',
        ] as const;

        const normalizedRow = normalizeZeroValues(
          modalData.value.row,
          zeroToUndefinedFields,
        );
        dynamicParams.warehouseId = warehouseId;
        dynamicParams.productId = productId;
        setTimeout(() => {
          BaseFormApi.setValues({
            warehouseName: normalizedRow.warehouseName,
            productCode: normalizedRow.productCode,
            productName: normalizedRow.productName,
            productSpecId: normalizedRow.productSpecId,
            productSpec: normalizedRow.productSpec,
            manufacturer: normalizedRow.manufacturer,
            replenishSource: normalizedRow.replenishSource,
            replenishWarehouseId: normalizedRow.replenishWarehouseId,
            agentWarehouseId: normalizedRow.agentWarehouseId,
            invoiceRule: normalizedRow.invoiceRule,
            billBpartnerId: normalizedRow.billBpartnerId,
            isPOStop: normalizedRow.isPOStop,
            isPMSStop: normalizedRow.isPMSStop,
            isCrossDocking: normalizedRow.isCrossDocking,
            isAutoOut: normalizedRow.isAutoOut,
            isReportDrug: normalizedRow.isReportDrug,
            basePackageType: normalizedRow.basePackageType,
            productCategoryValue: modalData.value.productCategoryValue,
            isSplitZero: normalizedRow.isSplitZero,
            isBasicMedicine: normalizedRow.isBasicMedicine,
            isInfusion: normalizedRow.isInfusion,
            isBloodProduct: normalizedRow.isBloodProduct,
            isPeritonealDialysis: normalizedRow.isPeritonealDialysis,
            // 基数数量
            basicMedicineQty: normalizedRow?.basicMedicineQty,
          });
          initData.value.pickupSectionId =
            normalizedRow.pickupSectionId || undefined;
          nextTick(() => {
            BaseFormApi?.setFieldValue('zoneId', normalizedRow.zoneId);
            nextTick(() => {
              BaseFormApi?.setFieldValue('sectionId', normalizedRow.sectionId);
              BaseFormApi?.setFieldValue(
                'pickupSectionId',
                normalizedRow.pickupSectionId
                  ? Number(normalizedRow.pickupSectionId)
                  : undefined,
              );
              BaseFormApi?.setFieldValue(
                'poSectionId',
                normalizedRow.poSectionId,
              );
              nextTick(() => {
                BaseFormApi?.setFieldValue(
                  'locatorId',
                  normalizedRow.locatorId,
                );
                BaseFormApi?.setFieldValue(
                  'pickupLocatorId',
                  normalizedRow.pickupLocatorId
                    ? Number(normalizedRow.pickupLocatorId)
                    : undefined,
                );
                BaseFormApi?.setFieldValue(
                  'poLocatorId',
                  normalizedRow.poLocatorId,
                );
                // 如果散件货位ID存在，查询货位信息

                if (normalizedRow.pickupLocatorId) {
                  const params = {
                    ...pickupLocatorIdExtraParams.value,
                    locatorId: normalizedRow.pickupLocatorId,
                  };
                  requestFormClient
                    .post('/warehouseAction/wareLocatorList.do', params)
                    .then((res: any) => {
                      if (res?.rows?.length > 0) {
                        pickupLocatorInfo.value = res.rows[0];

                        BaseFormApi?.setFieldValue(
                          'pickupLocatorId',
                          res.rows[0].name,
                        );
                        BaseFormApi?.setFieldValue(
                          'pickupLocatorId_value',
                          res.rows[0].id,
                        );
                      }
                    });
                }
              });
            });
          });
          replenishmentStrategyFormApi.setValues({
            isAutoReplenish: normalizedRow.isAutoReplenish,
            // replenishPolicyId: normalizedRow.replenishPolicyId,
            levelMin: normalizedRow.levelMin,
            levelMax: normalizedRow.levelMax,
            levelReplenish: normalizedRow.levelReplenish,
            replenishPackageQty: normalizedRow.replenishPackageQty,
            levelDay: normalizedRow.levelDay,
            levelDay1: normalizedRow.levelDay1,
            levelDay2: normalizedRow.levelDay2,
            levelDay3: normalizedRow.levelDay3,
            lastReplenishDate: normalizedRow.lastReplenishDate,
            monthConsumeMax: normalizedRow.monthConsumeMax,
            isAutoCalculate: normalizedRow.isAutoCalculate,
            minimumQty: normalizedRow.minimumQty,
            reportDrugQty: normalizedRow.reportDrugQty,
            thisReportDrugQty: normalizedRow.thisReportDrugQty,
            shortPoQtyMax: normalizedRow.shortPoQtyMax,
            dispenseType: normalizedRow.dispenseType,
            description: normalizedRow.description,
          });
        }, 100);
      }
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
      const basicFormValues = await BaseFormApi.getValues();
      const replenishmentStrategyFormValues =
        await replenishmentStrategyFormApi.getValues();
      const params: Record<string, any> = {
        warehouseId: dynamicParams.warehouseId,
        productId: dynamicParams.productId,
        replenishId:
          modalType.value === 'EDIT'
            ? modalData.value?.row?.replenishId
            : undefined,
        ...basicFormValues,
        ...replenishmentStrategyFormValues,
        pickupLocatorId:
          newPickupLocatorInfo.value.id ||
          pickupLocatorInfo.value.id ||
          undefined,
        isAutoMove: newPickupLocatorInfo.value.isAutoMove,
      };
      // if (
      //   modalType.value === 'EDIT' &&
      //   modalData.value?.row?.packUnitChangeApplyID
      // ) {
      //   params.packUnitChangeId = modalData.value?.row?.packUnitChangeApplyID;
      // }
      try {
        await requestFormClient.post(
          'warehouseAction/saveWarehouseProduct.do',
          params,
        );
        message.success('成功');
        modalApi.close();
        BaseFormApi.resetForm();
        replenishmentStrategyFormApi.resetForm();
        modalData.value?.callback();
      } catch (error) {}
    }
  },
});

onMounted(() => {});
</script>
<template>
  <ModalFirst :title="modalTitle" class="w-[800px]">
    <ChooseProductModal />
    <LocatorSearchModal @confirm="handleLocatorConfirm" />
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
