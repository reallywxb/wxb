<script setup lang="ts">
import { inject, onMounted } from 'vue';

import { z } from '@vben/common-ui';

import { message, Switch } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { queryZoneInfo, saveZoneInfo } from '../../api';
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
      const zoneId = treeContext?.selectedNode.value?.id || '';
      try {
        await saveZoneInfo({
          warehouseId: treeContext?.selectedNode.value?.id || '',
          zoneId,
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
      },
      fieldName: 'name',
      formItemClass: 'col-span-1 col-start-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '库房名称',
      rules: z.string().nonempty('请输入库房名称'),
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入仓库搜索码',
      },
      fieldName: 'value',
      formItemClass: 'col-span-1 col-start-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '仓库搜索码',
      rules: z.string().nonempty('请输入仓库搜索码'),
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
const getZoneInfo = async () => {
  const zoneId = treeContext?.selectedNode.value?.id || '';
  const res = await queryZoneInfo({ zoneId });
  console.warn('库房信息res===>', res);
  if (res.success) {
    const row = Array.isArray(res.rows) ? res.rows[0] : {};
    baseFormApi.setValues(row);
  }
};

onMounted(() => {
  getZoneInfo();
});

defineExpose({
  queryZoneInfo: getZoneInfo,
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
        :data-testid="`switch_isActive_${scope.fieldName}_zoneInfo`"
      />
    </template>
  </BaseForm>
</template>

<style lang="scss" scoped></style>
