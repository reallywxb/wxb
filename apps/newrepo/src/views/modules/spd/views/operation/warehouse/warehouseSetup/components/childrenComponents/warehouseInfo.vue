<script setup lang="ts">
import { inject, nextTick, onMounted, ref } from 'vue';

import { z } from '@vben/common-ui';

import { message, Switch } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { requestFormClient } from '#/api/request';

import { getWarehouseInfo, saveWarehouse } from '../../api';
import { TREE_CONTEXT_KEY } from '../../index';

const treeContext = inject(TREE_CONTEXT_KEY);
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
  const formValues = await baseFormApi.getValues();
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
          value: item.id,
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
          value: item.id,
        }));

      break;
    }
    // No default
  }

  baseFormApi.setFieldValue('parentWarehouseId', data?.parentWarehouseId);
  console.warn('setParentWarehouseOptions arr', arr);
  baseFormApi.updateSchema([
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
        showChooseAll: undefined,
        key: Date.now(),
      },
    },
  ]);
};
// 仓库信息表单
const [BaseForm, baseFormApi] = useVbenForm({
  commonConfig: {
    colon: true,
    componentProps: {
      class: 'w-[50vw]',
    },
    labelClass: 'w-[130px]',
  },
  async handleSubmit(values) {
    console.warn('values===>', values, baseFormApi);
    const validateResult = await baseFormApi.validate();
    if (validateResult.valid) {
      try {
        await saveWarehouse({
          warehouseId: treeContext?.selectedNode.value?.id || '',
          ...values,
        });
        message.success('操作成功');
        // 刷新当前节点数据
        await treeContext?.refreshTree?.();
      } catch {}
    } else {
      message.error('请正确填写表单');
    }
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
          autoChooseFirstOption: false,
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
          onChange: (val: string) => {
            console.warn('仓库类型', val);
            nextTick(() => {
              setParentWarehouseOptions();
            });
          },
          afterFetch(res: any) {
            res.rows?.forEach((row: any) => {
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
      rules: 'required',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          autoChooseFirstOption: true,
          dictUrl: '/baseHandleAction/departmentList.do?includeRegion=Y', // bug 1718 增加入参includeRegion=Y
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
            res.rows?.forEach((row: any) => {
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
      rules: 'required',
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
            res.rows?.forEach((row: any) => {
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
            res.rows?.forEach((row: any) => {
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
      // componentProps: () => {
      //   return {
      //     dictUrl: '/warehouseAction/queryParentWarehouse.do',
      //     apiType: 'post',
      //     requestContentType: 'application/x-www-form-urlencoded',
      //     showSearch: true,
      //     allowClear: true,
      //     placeholder: '请选择默认补货仓库',
      //     paginate: false,
      //     filterByFrontEnd: true,
      //     immediate: true,
      //     labelField: 'name',
      //     valueField: 'id',
      //     afterFetch(res: any) {
      //       res.rows?.forEach((row: any) => {
      //         row.id = row.id.toString();
      //       });

      //       return { ...res, rows: undefined, records: [] };
      //     },
      //   };
      // },
      fieldName: 'parentWarehouseId',
      label: '默认补货仓库',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      componentProps: {
        showSearch: true,
        allowClear: true,
        placeholder: '请选择默认补货仓库',
        paginate: false,
        filterByFrontEnd: true,
        showChooseAll: undefined,
        options: [],
      },
      dependencies: {
        triggerFields: ['warehouseType'],
        disabled: (values) => {
          // 仓库类型为一级库时，禁用默认补货仓库
          if (values?.warehouseType === '1' || values?.warehouseType === 1) {
            baseFormApi?.setFieldValue('parentWarehouseId', undefined);
            return true;
          }
          return false;
        },
      },
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
          placeholder: '请选择默认走账仓库',
          paginate: false,
          filterByFrontEnd: true,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            res.rows?.forEach((row: any) => {
              row.id = row.id.toString();
            });
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'passByWarehouseId',
      label: '默认走账仓库',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入订单自动关闭天数',
      },
      fieldName: 'effectivedays',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '订单自动关闭天数',
      rules: z
        .string()
        .optional() // 可选的
        .refine(
          (value) => {
            // 如果为空或 undefined，通过校验
            if (!value || value.trim() === '') {
              return true;
            }
            // 否则必须是正整数（不包括 0）
            return /^[1-9]\d*$/.test(value);
          },
          {
            message: '订单关闭天数为正整数!',
          },
        ),
    },
    {
      component: 'Switch',
      fieldName: 'isHisWarehouse',
      formItemClass: 'col-span-3 col-start-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: 'his管理仓库',
      componentProps: {
        style: {
          width: '40px',
        },
      },
    },
    {
      component: 'Switch',
      fieldName: 'isStandAlone',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '第三方仓库',
      componentProps: {
        style: {
          width: '40px',
        },
      },
    },
    {
      component: 'Switch',
      fieldName: 'isInventorying',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '盘点中',
      componentProps: {
        style: {
          width: '40px',
        },
      },
    },
    {
      component: 'Switch',
      fieldName: 'isActive',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '是否有效',
      componentProps: {
        style: {
          width: '40px',
        },
      },
    },
    {
      component: 'Textarea',
      componentProps: {
        allowClear: true,
        placeholder: '请输入描述',
      },
      fieldName: 'description',
      formItemClass: 'col-span-4 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '描述',
    },
    {
      component: 'Input',
      fieldName: 'productCategoryId',
      formItemClass: 'hidden',
    },
  ],
  wrapperClass: 'grid-cols-6',
  resetButtonOptions: {
    show: false,
  },
  submitButtonOptions: {
    show: true,
  },
  actionWrapperClass: 'grid-cols-1',
});

// 获取仓库信息
const getWarehouseForm = async () => {
  const warehouseId = treeContext?.selectedNode.value?.id || '';
  const res = await getWarehouseInfo({ warehouseId });
  console.warn('仓库信息===>', res);
  if (res.success) {
    const row = Array.isArray(res.rows) ? res.rows[0] : {};
    baseFormApi.setValues(row);
    // 根据仓库类型设置默认补货仓库
    setParentWarehouseOptions(row);
  }
};

onMounted(async () => {
  // 如果表单存在值 就不调用接口
  const values = await baseFormApi.getValues();
  console.warn('values===>', values);
  let isValue = false;
  for (const key in values) {
    if (values[key] === undefined) {
      values[key] = '';
      isValue = true;
    }
  }
  if (!isValue) {
    return;
  }
  // 调用接口获取库区信息
  await getWarehouseForm();
});
</script>

<template>
  <BaseForm>
    <template #isActive="scope">
      <Switch
        :checked="scope.modelValue"
        @update:checked="scope.setValue($event, false)"
        checked-value="Y"
        un-checked-value="N"
        checked-children="是"
        un-checked-children="否"
        data-testid="switch_isActive_warehouseInfo"
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
        data-testid="switch_isHisWarehouse_warehouseInfo"
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
        data-testid="switch_isStandAlone_warehouseInfo"
      />
    </template>
    <template #isInventorying="scope">
      <Switch
        :checked="scope.modelValue"
        @update:checked="scope.setValue($event, false)"
        checked-value="Y"
        un-checked-value="N"
        checked-children="是"
        un-checked-children="否"
        data-testid="switch_isInventorying_warehouseInfo"
      />
    </template>
  </BaseForm>
</template>

<style lang="scss" scoped></style>
