<script setup lang="ts">
import { inject, onMounted } from 'vue';

import { z } from '@vben/common-ui';

import { message, Switch } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { querySectionFormInfo, saveSectionFormInfo } from '../../api';
import { TREE_CONTEXT_KEY } from '../../index';

const treeContext = inject(TREE_CONTEXT_KEY);

// 库房信息表单
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
      const sectionId = treeContext?.selectedNode.value?.id || '';
      const pathIds = treeContext?.getNodePathIds?.();
      console.warn('pathIds===>', pathIds);
      try {
        await saveSectionFormInfo({
          warehouseId: pathIds?.warehouseId || '',
          zoneId: pathIds?.zoneId || '',
          sectionId,
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
        disabled: true,
      },
      fieldName: 'warehouseName',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '仓库名称',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入库房名称',
        disabled: true,
      },
      fieldName: 'zoneName',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '库房名称',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入库区名称',
      },
      fieldName: 'name',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '库区名称',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入仓库搜索码',
      },
      fieldName: 'value',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '库区搜索码',
      rules: z.string().nonempty('请输入仓库搜索码'),
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          autoChooseFirstOption: false,
          dictUrl: '/warehouseAction/userList.do',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择责任人',
          paginate: false,
          filterByFrontEnd: true,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            const rows =
              res?.rows?.map((item: { id: number; name: string }) => ({
                id: String(item.id),
                name: item.name,
              })) ?? [];
            return { ...res, rows: undefined, records: rows };
          },
        };
      },
      fieldName: 'managerId',
      label: '责任人',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
    {
      component: 'Switch',
      fieldName: 'isSmart',
      formItemClass: 'col-span-1 col-start-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '是否智能库区',
      componentProps: {
        style: {
          width: '40px',
        },
      },
    },
    {
      component: 'Switch',
      fieldName: 'isActive',
      formItemClass: 'col-span-1 col-start-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '是否有效',
      componentProps: {
        style: {
          width: '40px',
        },
      },
    },
  ],
  wrapperClass: 'grid-cols-2',
  resetButtonOptions: {
    show: false,
  },
  submitButtonOptions: {
    show: true,
  },
  actionWrapperClass: 'grid-cols-1',
});

// 获取库房信息的函数
const getSectionInfo = async () => {
  const sectionId = treeContext?.selectedNode.value?.id || '';
  const res = await querySectionFormInfo({ sectionId });
  console.warn('库区信息===>', res);
  if (res.success) {
    const row = Array.isArray(res.rows) ? res.rows[0] : {};
    baseFormApi.setValues(row);
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
  await getSectionInfo();
});
</script>

<template>
  <BaseForm>
    <template #isSmart="scope">
      <Switch
        :checked="scope.modelValue"
        @update:checked="scope.setValue($event, false)"
        checked-value="Y"
        un-checked-value="N"
        checked-children="是"
        un-checked-children="否"
        data-testid="switch_isSmart_sectionInfo"
      />
    </template>
    <template #isActive="scope">
      <Switch
        :checked="scope.modelValue"
        @update:checked="scope.setValue($event, false)"
        checked-value="Y"
        un-checked-value="N"
        checked-children="是"
        un-checked-children="否"
        data-testid="switch_isActive_sectionInfo"
      />
    </template>
  </BaseForm>
</template>

<style lang="scss" scoped></style>
