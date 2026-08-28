<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';

import { nextTick, onMounted, reactive, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message, Modal } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { requestFormClient } from '#/api/request';

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
}
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
  // replenishPolicyId: '', // 补货策略ID
});

const warehouseObj = ref({
  warehouseId: '', // 仓库ID
});

const locatorObj = ref({
  warehouseId: '', // 仓库ID
  type: 'locator', // 字库ID
  isScatter: '', // 整件库区ID
});

const pickupLocatorObj = ref({
  warehouseId: '', // 仓库ID
  type: 'locator', // 字库ID
  isScatter: '', // 整件库区ID
});

// 基本信息的表单配置
const baseFormSchemas: VbenFormSchema[] = [
  {
    component: 'ChcSelect',
    componentProps: () => {
      return {
        dictUrl: '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
        // showSearch: true,
        apiType: 'post',
        requestContentType: 'application/x-www-form-urlencoded',
        placeholder: '请选择',
        paginate: false,
        immediate: true,
        showChooseAll: false,
        labelField: 'name',
        valueField: 'id',
        afterFetch(res: any) {
          return { ...res, rows: undefined, records: res.rows };
        },
      };
    },
    fieldName: 'departmentId',
    label: '院区',
  },
  {
    component: 'ChcSelect',
    componentProps: () => {
      return {
        dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y',
        // showSearch: true,
        apiType: 'post',
        requestContentType: 'application/x-www-form-urlencoded',
        placeholder: '请选择',
        paginate: false,
        immediate: true,
        labelField: 'name',
        valueField: 'id',
        afterFetch(res: any) {
          return { ...res, rows: undefined, records: res.rows };
        },
      };
    },
    disabled: true,
    rules: 'required',
    fieldName: 'warehouseId',
    label: '仓库',
  },
  {
    component: 'ChcSelect',
    componentProps: () => {
      return {
        autoChooseFirstOption: false,
        dictUrl: '/warehouseAction/zoneList.do',
        extraParams: warehouseObj.value,
        showChooseAll: false,
        // extraParams: {
        //   warehouseId: dynamicParams.warehouseId,
        // },
        // showSearch: true,
        placeholder: '请选择',
        onChange(val: any, option: any) {
          console.warn('zoneId', val, option);
          dynamicParams.zoneId = val;
          locatorObj.value.isScatter = val ? 'N' : '';
          pickupLocatorObj.value.isScatter = val ? 'Y' : '';
        },
        paginate: false,
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
        dictUrl: '/warehouseAction/wareLocatorList.do?type=section',
        extraParams: warehouseObj.value,
        showChooseAll: false,
        // extraParams: {
        //   warehouseId: dynamicParams.warehouseId,
        //   type: 'section',
        // },
        placeholder: '请选择',
        triggerFields: ['zoneId'],
        onChange(val: any, option: any) {
          console.warn('sectionId', val, option);
        },
        paginate: false,
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
            warehouseId: dynamicParams.warehouseId,
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
        extraParams: locatorObj.value,
        showChooseAll: false,
        // extraParams: {
        //   warehouseId: dynamicParams.warehouseId,
        //   type: 'locator',
        //   isScatter: dynamicParams.zoneId ? 'N' : undefined,
        // },
        // showSearch: true,
        placeholder: '请选择',
        triggerFields: ['zoneId', 'sectionId'],
        onChange(val: any, option: any) {
          console.warn('locatorId', val, option);
        },
        paginate: false,

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
        dictUrl: '/warehouseAction/wareLocatorList.do?type=section',
        extraParams: warehouseObj.value,
        showChooseAll: false,
        // extraParams: {
        //   warehouseId: dynamicParams.warehouseId,
        //   type: 'section',
        // },
        // showSearch: true,
        placeholder: '请选择',
        triggerFields: ['zoneId'], // 当zoneId改变时，触发依赖更新
        onChange(val: any, option: any) {
          console.warn('pickupSectionId', val, option);
        },
        paginate: false,

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
            warehouseId: dynamicParams.warehouseId,
            zoneId: values.zoneId,
          };
          (
            BaseFormApi?.getFieldComponentRef(
              'pickupSectionId',
            ) as SelectComponentRef
          ).fetchApi!();
          // BaseFormApi?.setFieldValue('pickupSectionId', undefined);
        }
      },
    },
  },
  {
    fieldName: 'pickupLocatorId',
    label: '默认散件货位',
    component: 'ChcSelect',
    componentProps: () => {
      return {
        autoChooseFirstOption: false,
        dictUrl: '/warehouseAction/wareLocatorList.do',
        extraParams: pickupLocatorObj.value,
        showChooseAll: false,
        // extraParams: {
        //   warehouseId: dynamicParams.warehouseId,
        //   type: 'locator',
        //   isScatter: dynamicParams.zoneId ? 'Y' : undefined,
        // },
        // showSearch: true,
        placeholder: '请选择',
        triggerFields: ['zoneId', 'pickupSectionId', 'sectionId'],
        onChange(val: any, option: any) {
          console.warn('pickupLocatorId', val, option);
        },

        immediate: false,
        paginate: true,
        filterByFrontEnd: false,
        labelField: 'name',
        valueField: 'id',
        filterField: 'productName',
        queryModelValueField: 'locatorId',
        afterFetch(res: any) {
          return { ...res, rows: undefined, records: res.rows };
        },
      };
    },

    dependencies: {
      triggerFields: ['zoneId', 'pickupSectionId', 'sectionId'],
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
            zoneId: values.zoneId,
            sectionId: values.pickupSectionId,
            pickupSectionId: values.pickupSectionId,
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
        dictUrl: '/warehouseAction/wareLocatorList.do?type=section',
        extraParams: warehouseObj.value,
        showChooseAll: false,
        // extraParams: {
        //   warehouseId: dynamicParams.warehouseId,
        //   type: 'section',
        // },
        // showSearch: true,
        placeholder: '请选择',
        triggerFields: ['zoneId'], // 当zoneId改变时，触发依赖更新
        onChange(val: any, option: any) {
          console.warn('poSectionId', val, option);
        },
        paginate: false,

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
      triggerFields: ['zoneId'], // 当zoneId改变时，触发依赖更新
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
            warehouseId: dynamicParams.warehouseId,
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
        dictUrl: '/warehouseAction/wareLocatorList.do?type=locator',
        extraParams: warehouseObj.value,
        showChooseAll: false,
        // extraParams: {
        //   warehouseId: dynamicParams.warehouseId,
        //   type: 'locator',
        // },
        // showSearch: true,
        placeholder: '请选择',
        triggerFields: ['zoneId', 'poSectionId', 'sectionId'],
        onChange(val: any, option: any) {
          console.warn('poLocatorId', val, option);
        },
        paginate: false,

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
            type: values.zoneId ? 'locator' : undefined,
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
        extraParams: warehouseObj.value,
        showChooseAll: false,
        // extraParams: {
        //   warehouseId: dynamicParams.warehouseId,
        // },
        // showSearch: true,
        placeholder: '请选择',
        onChange(val: any, option: any) {
          console.warn('replenishSource', val, option);
        },
        paginate: false,

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
    // rules: 'required',
    fieldName: 'replenishSource',
    label: '补货方式',
  },
  {
    component: 'ChcSelect',
    componentProps: () => {
      return {
        autoChooseFirstOption: false,
        dictUrl: '/baseHandleAction/warehouse.do?level1=Y&level2=Y&accessAll=Y',
        showChooseAll: false,
        // showSearch: true,
        placeholder: '请选择',
        onChange(val: any, option: any) {
          console.warn('replenishWarehouseId', val, option);
        },
        paginate: false,

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
        showChooseAll: false,
        // showSearch: true,
        placeholder: '请选择',
        onChange(val: any, option: any) {
          console.warn('agentWarehouseId', val, option);
        },
        paginate: false,
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
    component: 'ChcSelect',
    componentProps: () => {
      return {
        dictUrl: '/baseHandleAction/customer.do?readWrite=Y&isDepartment=Y',
        // showSearch: true,
        placeholder: '请选择',
        showChooseAll: false,
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
    fieldName: 'billBpartnerId',
    formItemClass: 'col-span-1',
    label: '记账科室',
  },
  {
    component: 'ChcSelect',
    componentProps: () => {
      return {
        autoChooseFirstOption: false,
        defaultValue: '',
        options: [
          // { value: '', label: '全选' },
          { value: 'Y', label: '是' },
          { value: 'N', label: '否' },
        ],
        placeholder: '请选择',
        paginate: false,
        filterByFrontEnd: true,
        showChooseAll: '',
        immediate: true,
      };
    },
    formItemClass: 'col-span-1 col-start-1',
    fieldName: 'isPOStop',
    label: '采购停用',
  },
  {
    component: 'ChcSelect',
    componentProps: () => {
      return {
        autoChooseFirstOption: false,
        defaultValue: '',
        options: [
          // { value: '', label: '全选' },
          { value: 'Y', label: '是' },
          { value: 'N', label: '否' },
        ],
        placeholder: '请选择',
        paginate: false,
        filterByFrontEnd: true,
        showChooseAll: '',
        immediate: true,
      };
    },
    fieldName: 'isPMSStop',
    label: '发药停用',
  },
  {
    component: 'ChcSelect',
    componentProps: () => {
      return {
        autoChooseFirstOption: false,
        defaultValue: '',
        options: [
          // { value: '', label: '全选' },
          { value: 'Y', label: '是' },
          { value: 'N', label: '否' },
        ],
        placeholder: '请选择',
        paginate: false,
        filterByFrontEnd: true,
        showChooseAll: '',
        immediate: true,
      };
    },
    fieldName: 'isCrossDocking',
    label: '越库直配',
  },
  {
    component: 'ChcSelect',
    componentProps: () => {
      return {
        autoChooseFirstOption: false,
        defaultValue: '',
        options: [
          // { value: '', label: '全选' },
          { value: 'Y', label: '是' },
          { value: 'N', label: '否' },
        ],
        placeholder: '请选择',
        paginate: false,
        filterByFrontEnd: true,
        showChooseAll: '',
        immediate: true,
      };
    },
    fieldName: 'isAutoOut',
    label: '自动出库',
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
        showChooseAll: false,
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
    component: 'ChcSelect',
    componentProps: () => {
      return {
        autoChooseFirstOption: false,
        defaultValue: '',
        options: [
          // { value: '', label: '全选' },
          { value: 'Y', label: '是' },
          { value: 'N', label: '否' },
        ],
        placeholder: '请选择',
        paginate: false,
        filterByFrontEnd: true,
        showChooseAll: '',
        immediate: true,
      };
    },
    fieldName: 'isBasicMedicine',
    label: '是否基药',
  },
  {
    component: 'ChcSelect',
    componentProps: () => {
      return {
        autoChooseFirstOption: false,
        defaultValue: '',
        options: [
          // { value: '', label: '全选' },
          { value: 'Y', label: '是' },
          { value: 'N', label: '否' },
        ],
        placeholder: '请选择',
        paginate: false,
        filterByFrontEnd: true,
        showChooseAll: '',
        immediate: true,
      };
    },
    fieldName: 'isInfusion',
    label: '是否大输液',
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
    component: 'ChcSelect',
    componentProps: () => {
      return {
        autoChooseFirstOption: false,
        defaultValue: '',
        options: [
          // { value: '', label: '全选' },
          { value: 'Y', label: '是' },
          { value: 'N', label: '否' },
        ],
        placeholder: '请选择',
        paginate: false,
        filterByFrontEnd: true,
        showChooseAll: '',
        immediate: true,
      };
    },
    fieldName: 'isAutoReplenish',
    label: '自动补货',
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
  //       showChooseAll: false,
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
    componentProps: () => {
      return {
        autoChooseFirstOption: false,
        // defaultValue: '',
        options: [
          // { value: '', label: '全选' },
          { value: 'Y', label: '是' },
          { value: 'N', label: '否' },
        ],
        placeholder: '请选择',
        paginate: false,
        filterByFrontEnd: true,
        showChooseAll: '',
        immediate: true,
      };
    },
    formItemClass: 'col-span-1 col-start-1',
    fieldName: 'isAutoCalculate',
    label: '自动补货',
  },
  {
    component: 'Input',
    fieldName: 'minimumQty',
    label: '最低库存',
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
      dynamicParams.warehouseId = modalData.value?.warehouseId;
      warehouseObj.value.warehouseId = modalData.value?.warehouseId;
      locatorObj.value.warehouseId = modalData.value?.warehouseId;
      pickupLocatorObj.value.warehouseId = modalData.value?.warehouseId;

      setTimeout(async () => {
        BaseFormApi.setValues({
          warehouseId: modalData.value?.warehouseId,
        });
        // nextTick(() => {
        //   BaseFormApi?.setFieldValue('zoneId', zoneId);
        //   nextTick(() => {
        //     BaseFormApi?.setFieldValue('sectionId', sectionId);
        //     BaseFormApi?.setFieldValue('pickupSectionId', pickupSectionId);
        //     BaseFormApi?.setFieldValue('poSectionId', poSectionId);
        //     nextTick(() => {
        //       BaseFormApi?.setFieldValue('locatorId', locatorId);
        //       BaseFormApi?.setFieldValue('pickupLocatorId', pickupLocatorId);
        //       BaseFormApi?.setFieldValue('poLocatorId', poLocatorId);
        //     });
        //   });
        // });
      }, 100);
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
      const params: Record<string, any> = {
        warehouseId: dynamicParams.warehouseId,
        replenishIds: JSON.stringify(modalData.value?.replenishIds),
        ...basicFormValues,
        ...replenishmentStrategyFormValues,
      };
      Modal.confirm({
        title: '提示',
        content: '批量修改库备信息？',
        onOk: async () => {
          try {
            await requestFormClient.post(
              'warehouseAction/saveWarehouseProductBatch.do',
              params,
            );
            message.success('成功');
            modalApi.close();
            BaseFormApi.resetForm();
            replenishmentStrategyFormApi.resetForm();
            modalData.value?.callback();
          } catch (error) {
            console.warn('err', error);
          }
        },
      });
    }
  },
  // async onConfirm() {
  //   const { valid } = await cuFormApi.validate();
  //   console.warn('onConfirm valid', valid);
  //   const formValues = await cuFormApi.getValues();
  //   console.warn('onConfirmformValues', formValues);
  //   if (formValues.productId === '') {
  //     message.warning('请录入商品信息');
  //     return;
  //   }
  //   if (formValues.warehouseId === '') {
  //     message.warning('请录入仓库信息');
  //     return;
  //   }
  //   const params: Record<string, any> = {
  //     changeType: formValues.changeType,
  //     productId: formValues.productId,
  //     productCode: formValues.productCode,
  //     productName: formValues.productName,
  //     productSpec: formValues.productSpec,
  //     modelNo: formValues.modelNo,
  //     manufacturer: formValues.manufacturer,
  //     uomName: formValues.uomName,
  //     warehouseId: formValues.warehouseId,
  //     packUnit: formValues.packUnit,
  //     oldPackUnit: formValues.oldPackUnit,
  //     packageUnitTopLimit: formValues.packageUnitTopLimit,
  //     oldPackageUnitTopLimit: formValues.oldPackageUnitTopLimit,
  //     description: formValues.description,
  //   };

  //   if (
  //     modalType.value === 'EDIT' &&
  //     modalData.value?.row?.packUnitChangeApplyID
  //   ) {
  //     params.packUnitChangeId = modalData.value?.row?.packUnitChangeApplyID;
  //   }
  //   try {
  //     await requestFormClient.post('packUnitChangeApplyAction/save.do', params);
  //     message.success('成功');
  //     modalApi.close();
  //     cuFormApi.resetForm();
  //     modalData.value?.callback();
  //   } catch (error) {
  //     console.warn('err', error);
  //   }
  // },
});

onMounted(() => {});
</script>
<template>
  <ModalFirst :title="modalTitle" class="w-[800px]">
    <div class="form-title">基本信息</div>
    <BaseForm />
    <div class="form-title">补货策略信息</div>
    <ReplenishmentStrategyForm />
    <!-- <template #prepend-footer>
      <Button type="primary">下一步</Button>
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
