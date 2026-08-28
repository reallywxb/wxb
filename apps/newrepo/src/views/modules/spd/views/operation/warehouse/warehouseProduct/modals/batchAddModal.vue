<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';

import { nextTick, onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';

import { useVbenModal } from '@vben/common-ui';

import { Button, message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import batchAddFormTwoModalUi from './batchAddFormTwoModal.vue';

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
  replenishPolicyId: string;
}
const route = useRoute();
const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数
console.warn('urlParams', urlParams);
const hiddenField: string = urlParams.hiddenField || '';
const hiddenFieldSet = new Set(hiddenField.split(',').filter(Boolean));
const modalData = ref<Record<string, any>>({});
const modalTitle = ref('');
const modalType = ref('');
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
  replenishPolicyId: '', // 补货策略ID
});
const lotExtraParam = ref({ warehouseId: dynamicParams.warehouseId });
const lotExtraParam2 = ref({ productId: dynamicParams.productId });
/**
 * 判断字段是否应该显示
 * @param fieldName - 字段名
 * @returns 是否显示
 */
const shouldShowField = (fieldName: string): boolean => {
  return !hiddenFieldSet.has(fieldName);
};

// 基本信息的表单配置
const baseFormSchemas: VbenFormSchema[] = [
  {
    component: 'ChcSelect',
    componentProps: () => {
      return {
        dictUrl: '/baseHandleAction/warehouse.do?',
        // showSearch: true,
        apiType: 'post',
        requestContentType: 'application/x-www-form-urlencoded',
        placeholder: '请选择',
        paginate: false,
        immediate: true,
        labelField: 'name',
        valueField: 'id',
        onChange(val: any, option: any) {
          console.warn('warehouseId', val, option);
          dynamicParams.warehouseId = val;
          lotExtraParam.value.warehouseId = val;
        },
        afterFetch(res: any) {
          return { ...res, rows: undefined, records: res.rows };
        },
      };
    },
    disabled: false,
    rules: 'required',
    formItemClass: 'col-span-1',
    fieldName: 'warehouseId',
    label: '仓库',
  },
  {
    component: 'ChcSelect',
    componentProps: () => {
      return {
        autoChooseFirstOption: false,
        dictUrl: '/warehouseAction/zoneList.do',
        // showSearch: true,
        placeholder: '请选择',
        triggerFields: ['warehouseId'],
        onChange(val: any, option: any) {
          console.warn('zoneId', val, option);
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
    fieldName: 'zoneId',
    formItemClass: 'col-span-1 col-start-1',
    label: '默认子库',
    dependencies: {
      triggerFields: ['warehouseId'], // 当warehouseId改变时，触发依赖更新
      async trigger(values) {
        await nextTick();
        console.warn('默认子库trigger', values);
        if (
          BaseFormApi?.getFieldComponentRef &&
          typeof BaseFormApi?.getFieldComponentRef === 'function' &&
          BaseFormApi?.getFieldComponentRef('zoneId') &&
          (BaseFormApi.getFieldComponentRef('zoneId') as SelectComponentRef)
            .params
        ) {
          (
            BaseFormApi.getFieldComponentRef('zoneId') as SelectComponentRef
          ).params!.dependencies = {
            warehouseId: values.warehouseId,
          };
          (BaseFormApi?.getFieldComponentRef('zoneId') as SelectComponentRef)
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
        // showSearch: true,
        placeholder: '请选择',
        triggerFields: ['zoneId', 'type', 'warehouseId'],
        onChange(val: any, option: any) {
          console.warn('sectionId', val, option);
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
        triggerFields: [
          'zoneId',
          'type',
          'warehouseId',
          'isScatter',
          'sectionId',
        ],
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
      triggerFields: [
        'zoneId',
        'type',
        'warehouseId',
        'isScatter',
        'sectionId',
      ],
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
            type: values.zoneId ? 'locator' : undefined,
            isScatter: 'N',
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
        triggerFields: ['zoneId', 'type', 'warehouseId'], // 当zoneId改变时，触发依赖更新
        onChange(val: any, option: any) {
          console.warn('pickupSectionId', val, option);
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
    fieldName: 'pickupSectionId',
    label: '默认散件库区',
    dependencies: {
      triggerFields: ['zoneId', 'type', 'warehouseId'], // 当zoneId改变时，触发依赖更新
      async trigger(values) {
        await nextTick();
        if (
          BaseFormApi?.getFieldComponentRef &&
          typeof BaseFormApi?.getFieldComponentRef === 'function' &&
          BaseFormApi?.getFieldComponentRef('pickupSectionId') &&
          (
            BaseFormApi.getFieldComponentRef(
              'pickupSectionId',
            ) as SelectComponentRef
          ).params
        ) {
          (
            BaseFormApi.getFieldComponentRef(
              'pickupSectionId',
            ) as SelectComponentRef
          ).params!.dependencies = {
            warehouseId: values.warehouseId,
            zoneId: values.zoneId,
            type: values.zoneId ? 'section' : undefined,
          };
          (
            BaseFormApi?.getFieldComponentRef(
              'pickupSectionId',
            ) as SelectComponentRef
          ).fetchApi!();
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
        triggerFields: [
          'zoneId',
          'type',
          'warehouseId',
          'isScatter',
          'pickupSectionId',
          'sectionId',
        ],
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
      triggerFields: [
        'zoneId',
        'type',
        'warehouseId',
        'isScatter',
        'pickupSectionId',
        'sectionId',
      ],
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
            type: values.zoneId ? 'locator' : undefined,
            isScatter: 'Y',
            sectionId: values.pickupSectionId,
            pickupSectionId: values.pickupSectionId,
          };
          (
            BaseFormApi?.getFieldComponentRef(
              'pickupLocatorId',
            ) as SelectComponentRef
          ).fetchApi!();
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
        triggerFields: ['zoneId', 'type', 'warehouseId'], // 当zoneId改变时，触发依赖更新
        onChange(val: any, option: any) {
          console.warn('poSectionId', val, option);
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
    fieldName: 'poSectionId',
    label: '默认采购库区',
    dependencies: {
      triggerFields: ['zoneId', 'type', 'warehouseId'], // 当zoneId改变时，触发依赖更新
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
            warehouseId: values.warehouseId,
            zoneId: values.zoneId,
            type: values.zoneId ? 'section' : undefined,
          };
          (
            BaseFormApi?.getFieldComponentRef(
              'poSectionId',
            ) as SelectComponentRef
          ).fetchApi!();
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
        triggerFields: [
          'zoneId',
          'type',
          'warehouseId',
          'poSectionId',
          'sectionId',
        ],
        onChange(val: any, option: any) {
          console.warn('poLocatorId', val, option);
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
    fieldName: 'poLocatorId',
    label: '默认采购货位',
    dependencies: {
      triggerFields: [
        'zoneId',
        'type',
        'warehouseId',
        'poSectionId',
        'sectionId',
      ],
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
            warehouseId: values.warehouseId,
            zoneId: values.zoneId,
            type: values.zoneId ? 'locator' : undefined,
            sectionId: values.poSectionId,
            poSectionId: values.poSectionId,
          };
          (
            BaseFormApi?.getFieldComponentRef(
              'poLocatorId',
            ) as SelectComponentRef
          ).fetchApi!();
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
];

// 补货策略信息的表单配置
const replenishmentStrategyFormSchemas: VbenFormSchema[] = [
  // {
  //   component: 'ChcSelect',
  //   componentProps: () => {
  //     return {
  //       autoChooseFirstOption: false,
  //       defaultValue: '',
  //       options: [
  //         { value: '', label: '全选' },
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
  //   fieldName: 'isAutoReplenish',
  //   label: '自动补货',
  // },
  {
    component: 'Switch',
    fieldName: 'isAutoReplenish',
    label: '自动补货',
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
    component: 'ChcSelect',
    fieldName: 'replenishPolicyId',
    // formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
    // labelClass: 'leading-1 mb-[0px] pl-[4px]',
    // rules: 'required',
    label: '自动补货策略',
    componentProps: () => {
      return {
        dictUrl: '/warehouseAction/replenishPolicyList.do',
        placeholder: '请选择',
        paginate: false,
        // showChooseAll: '',
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
    formItemClass: 'col-span-1',
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
      triggerFields: ['monthConsumeMax'],
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
  showConfirmButton: false,
  confirmDisabled: false,
  showCancelButton: true,
  cancelText: '关闭',
  confirmText: '确认',
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      modalData.value = {};
      modalData.value = modalApi.getData<Record<string, any>>();
      console.warn('onOpenChange modalData', modalData.value);
      modalTitle.value = modalData.value.modalTitle;
      modalType.value = modalData.value.modalType;
      // 重置所有动态参数
      Object.keys(dynamicParams).forEach((key) => {
        dynamicParams[key as keyof typeof dynamicParams] = '';
      });
    }
  },
  onCancel() {
    modalApi.close();
  },
  onConfirm() {},
});

const [BatchAddFormTwoModal, BatchAddFormTwoModalApi] = useVbenModal({
  class: 'w-[1300px]',
  closable: true,
  draggable: true,
  connectedComponent: batchAddFormTwoModalUi,
});

// 下一步
const save = async () => {
  console.warn('下一步');
  const basicFormValues = await BaseFormApi.getValues();
  const replenishmentStrategyFormValues =
    await replenishmentStrategyFormApi.getValues();
  const { warehouseId, replenishSource } = basicFormValues;
  const { replenishPolicyId } = replenishmentStrategyFormValues;
  if (!warehouseId) {
    message.error('请选择仓库');
    return;
  }
  if (!replenishSource) {
    message.error('请选择补货方式');
    return;
  }
  // if (!replenishPolicyId) {
  //   message.error('请选择自动补货策略');
  //   return;
  // }
  console.warn('校验通过了');
  BatchAddFormTwoModalApi?.setData({
    warehouseId,
    replenishPolicyId,
    replenishSource,
    callback() {
      modalApi.close();
      modalData.value.callback();
    },
  }).open();
};

onMounted(() => {});
</script>
<template>
  <ModalFirst :title="modalTitle" class="w-[800px]">
    <div class="form-title">基本信息</div>
    <BaseForm />
    <div class="form-title">补货策略信息</div>
    <ReplenishmentStrategyForm />
    <template #prepend-footer>
      <Button
        type="primary"
        @click="save"
        data-testid="button_next_batchAddModal"
      >
        下一步
      </Button>
    </template>
    <BatchAddFormTwoModal />
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
