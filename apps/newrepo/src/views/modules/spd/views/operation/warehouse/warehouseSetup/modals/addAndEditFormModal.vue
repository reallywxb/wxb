<script lang="ts" setup>
import type { VbenFormProps } from '@vben/common-ui';

import { nextTick, ref } from 'vue';

import { useVbenModal, z } from '@vben/common-ui';

import { message, Switch } from 'ant-design-vue';
import { cloneDeep } from 'lodash-es';

import { useVbenForm } from '#/adapter/form';
import { requestFormClient } from '#/api/request';

defineOptions({
  name: 'AddAndEditFormModal',
});

const props = defineProps<{
  afterSubmit?: () => void;
  formOptions?: VbenFormProps;
}>();

interface Param {
  form: any;
  submit: (params: Record<number | string, any>) => Promise<void>;
  title: string;
  type: 'add' | 'edit';
}

interface Dictionary {
  id: number;
  name: string;
  [key: string]: any;
}
const departmentIdDep = ref({ campusId: '' }); // 科室下拉依赖
const param = ref<Param>();
// const [Form, formApi] = useVbenForm({
//   commonConfig: {
//     // 所有表单项
//     componentProps: {
//       class: 'w-full',
//     },
//   },
//   layout: 'horizontal',
//   ...props.formOptions,
//   resetButtonOptions: {
//     show: false,
//   },
//   submitButtonOptions: {
//     show: false,
//   },
// });
// 默认补货仓库下拉
const parentWarehouseOptions = ref([]);
const getParentWarehouseOptions = async () => {
  requestFormClient
    .post('/warehouseAction/queryParentWarehouse.do', {})
    .then((res) => {
      res.rows?.forEach((row: any) => {
        row.id = row.id.toString();
      });
      parentWarehouseOptions.value = res.rows || [];
    });
};
getParentWarehouseOptions();
//  设置补货仓库下拉的值
const setParentWarehouseOptions = async (data?: any) => {
  // 仓库类型
  let warehouseType = data?.warehouseType;
  const formValues = await formApi.getValues();
  warehouseType = warehouseType || formValues?.warehouseType;
  let arr: { label: string; value: string }[] = [];
  switch (warehouseType) {
    case '1':
    case 1: {
      // 一级库 无值
      arr = [];

      break;
    }
    case '2':
    case 2: {
      // 二级库  显示一级库
      arr = parentWarehouseOptions.value
        .filter((item: any) => {
          return item.type === 1 || item.type === '1';
        })
        .map((item) => ({
          label: item.name,
          value: item.id.toString(),
        }));

      break;
    }
    case '3':
    case 3: {
      // 三级库 显示一、二级库
      arr = parentWarehouseOptions.value
        .filter((item: any) => {
          return (
            item.type === 1 ||
            item.type === '1' ||
            item.type === 2 ||
            item.type === '2'
          );
        })
        .map((item) => ({
          label: item.name,
          value: item.id.toString(),
        }));

      break;
    }
    // No default
  }

  formApi.setFieldValue(
    'parentWarehouseId',
    data?.parentWarehouseId || param.value?.form.parentWarehouseId || '',
  );
  console.warn('setParentWarehouseOptions arr', arr);
  console.warn(
    'param.value?.form.parentWarehouseId',
    param.value?.form.parentWarehouseId,
    typeof param.value?.form.parentWarehouseId,
  );
  formApi.updateSchema([
    {
      fieldName: 'parentWarehouseId',
      componentProps: {
        showSearch: true,
        allowClear: true,
        placeholder: '请选择默认补货仓库',
        paginate: false,
        filterByFrontEnd: true,
        options: arr,
        dictUrl: undefined,
        apiType: undefined,
        requestContentType: undefined,
        immediate: undefined,
        afterFetch: undefined,
        showChooseAll: false,
        key: Date.now(),
      },
    },
  ]);
};
const [Form, formApi] = useVbenForm({
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 在label后显示一个冒号
    colon: false,
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  // 提交函数
  handleSubmit: onSubmit,

  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行, 值为horizontal
  layout: 'vertical',
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
      // TODO 禅道2175 去除必填校验
      // rules: z.string().nonempty('请输入仓库搜索码'),
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
          allowClear: false,
          showChooseAll: undefined,
          // onChange(_: any, option: any) {
          //   console.warn(option);
          //   console.warn(formApi?.getFieldComponentRef('warehouseType'));
          // },
          afterFetch(res: any) {
            res.rows?.forEach((row: any) => {
              row.id = row.id.toString();
            });
            return { ...res, rows: undefined, records: res.rows };
          },
          onChange: (val: any) => {
            console.warn('仓库类型', val);
            nextTick(() => {
              setParentWarehouseOptions();
            });
          },
        };
      },
      fieldName: 'warehouseType',
      label: '仓库类型',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      // rules: z.string().nonempty('请选择仓库类型'),
      rules: 'required',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          autoChooseFirstOption: false,
          // dictUrl: '/campusAction/queryCampusList',
          dictUrl: '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          placeholder: '请选择',
          paginate: false,
          showChooseAll: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            // const rows = res.data?.map((row: any) => ({
            //   id: row.value.toString(),
            //   name: row.name,
            // }));
            res.rows?.forEach((row: any) => {
              row.id = row.id.toString();
            });
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'campusId',
      label: '院区',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      // rules: z.string().nonempty('请选择院区'),
      rules: 'selectRequired',
    },
    // TODO:medicine add 科室
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          autoChooseFirstOption: false,
          dictUrl: '/baseHandleAction/departmentList.do?type=1&includeRegion=Y',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择',
          paginate: false,
          filterByFrontEnd: true,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          dependencies: departmentIdDep.value,
          triggerFieldKeys: {
            campusId: 'parentId',
          },
          afterFetch(res: any) {
            const rows = res.rows?.map((row: any) => ({
              id: row.id.toString(),
              name: row.name,
            }));
            return { ...res, rows: undefined, records: rows };
          },
        };
      },
      fieldName: 'departmentId',
      label: '科室',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      rules: 'required',
      dependencies: {
        triggerFields: ['campusId'],
        trigger(values: any) {
          departmentIdDep.value.campusId = values.campusId;
          // 如果院区为空，科室也要清除选项
          if (!values.campusId && values.departmentId) {
            formApi.setFieldValue('departmentId', undefined);
          }
        },
      },
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
          showChooseAll: false,
          afterFetch(res: any) {
            const rows =
              res?.rows?.map((item: Dictionary) => ({
                id: String(item.id),
                name: item.name,
              })) ?? [];
            return { ...res, rows: undefined, records: rows };
          },
        };
      },
      fieldName: 'warehousePolicyId',
      label: '默认作业策略',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      rules: 'required',
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
          showChooseAll: false,
          afterFetch(res: any) {
            const rows =
              res?.rows?.map((item: Dictionary) => ({
                id: String(item.id),
                name: item.name,
              })) ?? [];
            return { ...res, rows: undefined, records: rows };
          },
        };
      },
      fieldName: 'replenishPolicyId',
      label: '默认补货策略',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
    {
      fieldName: 'parentWarehouseId',
      label: '默认补货仓库',
      component: 'ChcSelect',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      componentProps: {
        showSearch: true,
        allowClear: true,
        apiType: 'post',
        requestContentType: 'application/x-www-form-urlencoded',
        placeholder: '请选择默认补货仓库',
        paginate: false,
        filterByFrontEnd: true,
        showChooseAll: false,
        options: [],
      },
      dependencies: {
        triggerFields: ['warehouseType'], // 当warehouseType改变时，触发依赖更新
        // 跟仓库类型联动，只有选择不是id为'1'的仓库类型，才显示默认补货仓库
        show: async () => {
          const result = await formApi?.getValues();
          return result.warehouseType !== '1';
          // if (result.warehouseType !== '1') {
          //   formApi?.setFieldValue('parentWarehouseId', undefined);
          //   return true;
          // }
          // return false;
        },
      },
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/productAction/productCategoryList.do',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          mode: 'multiple',
          showSearch: true,
          placeholder: '请选择商品类别',
          onChange(val: any, option: any) {
            console.warn('productCategory', val, option);
          },
          paginate: false,
          filterByFrontEnd: true,
          // showChooseAll: '',
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            const seen = new Set();
            const dedupedRows = res.rows?.filter((item: any) => {
              if (seen.has(item.id)) return false;
              seen.add(item.id);
              return true;
            });
            // 如果是新增&&rows有值默认选择第一个
            if (param.value?.type === 'add' && res?.rows?.length > 0) {
              formApi?.setFieldValue('productCategoryId', [res?.rows?.[0]?.id]);
            }
            return { ...res, rows: undefined, records: dedupedRows };
          },
        };
      },
      fieldName: 'productCategoryId',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '药品类别',
    },
    {
      component: 'Switch',
      fieldName: 'isActive',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '是否有效',
      // componentProps: () => {
      //   return {
      //     checkedValue: 'Y',
      //     unCheckedValue: 'N',
      //     style: {
      //       width: '40px',
      //     },
      //   };
      // },
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
      component: 'Textarea',
      componentProps: {
        allowClear: true,
        placeholder: '请输入描述',
      },
      fieldName: 'description',
      formItemClass: 'col-span-6 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '描述',
    },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  // wrapperClass: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-4',
  wrapperClass: 'grid-cols-12',
});

const [Modal, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {
    const { valid } = await formApi.validate();

    if (valid) {
      try {
        await param.value?.submit(await formApi.getValues());

        message.success('操作成功');

        modalApi.close();
        props.afterSubmit?.();
      } catch (error) {
        console.error(error);
      }
    }
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      param.value = modalApi.getData() as Param;
      console.warn('param.value.form', param.value);
      param.value.form.productCategoryId =
        param.value.form.productCategoryId?.split(',') || [];
      formApi.setValues(cloneDeep(param.value.form));
      if (param.value?.form.warehouseType !== '1') {
        nextTick(() => {
          // 如果仓库类型不是一级库， 就要获取补货仓库数据并进行回显
          setParentWarehouseOptions();
        });
      }
    }
  },
});

function onSubmit(values: Record<string, any>) {
  message.success({
    content: `form values: ${JSON.stringify(values)}`,
  });
}
</script>
<template>
  <Modal :title="param?.title">
    <Form>
      <!-- <template v-for="(value, name) in $slots" :key="name" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps"></slot>
      </template> -->
      <template #isActive="scope">
        <Switch
          :checked="scope.modelValue"
          @update:checked="scope.setValue($event, false)"
          default-value="Y"
          checked-value="Y"
          un-checked-value="N"
          checked-children="是"
          un-checked-children="否"
          data-testid="switch_isActive_addAndEditFormModal"
        />
      </template>
      <template #isHisWarehouse="scope">
        <Switch
          :checked="scope.modelValue"
          @update:checked="scope.setValue($event, false)"
          checked-value="Y"
          un-checked-value="N"
          checked-children="是"
          un-checked-children="否"
          data-testid="switch_isHisWarehouse_addAndEditFormModal"
        />
      </template>
      <template #isStandAlone="scope">
        <Switch
          :checked="scope.modelValue"
          @update:checked="scope.setValue($event, false)"
          checked-value="Y"
          un-checked-value="N"
          checked-children="是"
          un-checked-children="否"
          data-testid="switch_isStandAlone_addAndEditFormModal"
        />
      </template>
    </Form>
  </Modal>
</template>
