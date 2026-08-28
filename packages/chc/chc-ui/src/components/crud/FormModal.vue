<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';
import type { RequestClientConfig } from '@vben/request';

import type { Requests } from '../../types/crud';

import { ref } from 'vue';

import { useVbenForm } from '@vben-core/form-ui';
import { useVbenModal } from '@vben-core/popup-ui';

import { message } from 'ant-design-vue';

import { deepClone } from '../../utils/util';

const props = defineProps<{
  afterSubmit?: () => void;
  cols: { dict?: boolean; id: string }[];
  createDataTable: Requests['createDataTable'];
  defaultRequestOptions: RequestClientConfig;
  updateDataTable: Requests['updateDataTable'];
}>();

const data = ref();
const [Form, formApi] = useVbenForm({
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  schema: [],
  resetButtonOptions: {
    show: false,
  },
  submitButtonOptions: {
    show: false,
  },
});

async function submitForm(values: any) {
  try {
    let addData = {};
    if (data.value?.openType === 'edit') {
      await props.updateDataTable(
        data.value.updateUrl,
        {
          ...data.value.formData,
          ...values,
          cols: props.cols,
          ...data.value.extraParams,
        },
        props.defaultRequestOptions,
      );
      data.value.gridApi.query();
      message.success('保存成功');
      modalApi.close();
      props.afterSubmit?.();
    } else {
      addData = await props.createDataTable(
        data.value.addUrl,
        {
          ...data.value.formData,
          ...values,
          cols: props.cols,
          ...data.value.extraParams,
        },
        props.defaultRequestOptions,
      );
      if (data.value.isAddWithInsert) {
        data.value.gridApi.grid.insert([addData]);
      } else {
        data.value.gridApi.query();
      }

      message.success('保存成功');
      modalApi.close();
      props.afterSubmit?.();
    }
    // await (data.value?.openType === 'edit'
    //   ?
    //   : ;
  } catch {}
}

// 用来处理select下拉框的数据
// 在编辑新增提交表单时，将component为ChcSelect，且值为数组的值转换成字符串 val1,val2
const handleSelectItemMultiData = (
  formVals: Record<string, any>,
  type: 'review' | 'submit',
) => {
  if (type === 'review') {
    // 用于编辑回显时，将component为ChcSelect，且componentProps.mode为multiple的项的值转换成数组
    const finalValues: Record<string, any> = deepClone(formVals);

    // 回显时
    Object.entries(finalValues).forEach(([key, value]) => {
      const schemaItem = data.value.formOptions.schema.find(
        (item: VbenFormSchema) => item.fieldName === key,
      );

      if (
        schemaItem &&
        (schemaItem.component === 'ChcSelect' ||
          schemaItem.component === 'ChcSelectNew')
      ) {
        const comProps =
          typeof schemaItem.componentProps === 'function'
            ? schemaItem.componentProps()
            : schemaItem.componentProps;
        if (comProps.mode === 'multiple' && typeof value === 'string') {
          finalValues[key] = value.split(',').map((data) => {
            return data;
          });
        } else if (comProps.mode === 'multiple' && !value) {
          finalValues[key] = [];
        }
      }
    });
    return finalValues;
  } else if (type === 'submit') {
    // 提交时，将component为ChcSelect，且值为数组的值转换成字符串 val1,val2
    const finalValues: Record<string, any> = deepClone(formVals);
    Object.entries(finalValues).forEach(([key, value]) => {
      const schemaItem = data.value.formOptions.schema.find(
        (item: VbenFormSchema) => item.fieldName === key,
      );

      if (
        schemaItem &&
        (schemaItem.component === 'ChcSelect' ||
          schemaItem.component === 'ChcSelectNew')
      ) {
        const comProps =
          typeof schemaItem.componentProps === 'function'
            ? schemaItem.componentProps()
            : schemaItem.componentProps;
        if (comProps.mode === 'multiple' && Array.isArray(value)) {
          finalValues[key] = value.join(',');
        } else if (
          comProps.mode === 'multiple' &&
          Array.isArray(Object.getPrototypeOf(value))
        ) {
          const valArr: string[] = [];
          Object.entries(value).forEach(([key, val]) => {
            if (key !== 'length') {
              valArr.push(val as string);
            }
          });
          finalValues[key] = valArr.join(',');
        }
      }
    });
    return finalValues;
  } else {
    const finalValues: Record<string, any> = deepClone(formVals);
    return finalValues;
  }
};
const [Modal, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },
  onConfirm() {
    if (data.value.openType === 'edit') {
      formApi.getValues().then((values) => {
        formApi.validate().then((res) => {
          if (res.valid) {
            const finalValues = handleSelectItemMultiData(values, 'submit');
            if (
              data.value.formOptions &&
              data.value.formOptions.handleSubmit &&
              typeof data.value.formOptions.handleSubmit === 'function'
            ) {
              data.value.formOptions.handleSubmit(
                finalValues,
                formApi,
                data.value.formData,
              );
            } else {
              submitForm({ ...data.value.formData, ...finalValues });
            }
          }
        });
      });
    } else if (data.value.openType === 'add') {
      formApi.getValues().then((values) => {
        formApi.validate().then((res) => {
          if (res.valid) {
            const finalValues = handleSelectItemMultiData(values, 'submit');
            if (
              data.value.formOptions &&
              data.value.formOptions.handleSubmit &&
              typeof data.value.formOptions.handleSubmit === 'function'
            ) {
              data.value.formOptions.handleSubmit(finalValues, formApi);
            } else {
              submitForm(finalValues);
            }
          }
        });
      });
    } else {
      modalApi.close();
    }
  },
  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      data.value = modalApi.getData<Record<string, any>>();
      data.value.formOptions &&
        (await formApi.setState(data.value.formOptions));

      // await formApi.updateSchema(data.value.formOptions.schema);
      // 此处在某些场景下，表单会出现第一次调用无法获取最终formOptions的情况，因此再调一次setState
      // data.value.formOptions &&
      //   (await formApi.setState(data.value.formOptions));
      // 处理有依赖项的情况下 给有依赖的item项延迟赋值
      const hasDependenciesItems = data.value.formOptions.schema.filter(
        (item: VbenFormSchema) => {
          return item.dependencies;
        },
      );
      // 根据 triggerFields 获取所有依赖字段
      const triggerFields = [];
      const dependenciesKeys = [];
      for (const hasDependenciesItem of hasDependenciesItems) {
        triggerFields.push(...hasDependenciesItem.dependencies.triggerFields);
        dependenciesKeys.push(hasDependenciesItem.fieldName);
      }

      const midFormData =
        data.value?.openType === 'edit' || data.value?.openType === 'view'
          ? handleSelectItemMultiData({ ...data.value.formData }, 'review')
          : { ...data.value.formData };
      // 根据 triggerFields 重新排列item项
      // 先给无依赖项赋值
      for (const key in midFormData) {
        !dependenciesKeys.includes(key) &&
          (await formApi.setFieldValue(key, midFormData[key]));
      }

      for (const item of dependenciesKeys) {
        await formApi.setFieldValue(item, midFormData[item]);
      }
      // 如果是新增，由于依赖会出现某些选项出现必填提示，影响用户体验，这里将提示去掉
      if (data.value.openType === 'add' || data.value.openType === 'view') {
        formApi.resetValidate();
      }
      // 根据parentTableParams给父级id项赋值
      if (
        data.value.parentTableParams &&
        Object.keys(data.value.parentTableParams).length > 0
      ) {
        data.value.formOptions.schema.forEach((column: any) => {
          if (data.value.parentTableParams?.[column.fieldName] !== undefined) {
            formApi.setFieldValue(
              column.fieldName,
              data.value.parentTableParams?.[column.fieldName],
            );
          }
        });
      }
    }
  },
});
</script>
<template>
  <Modal
    :title="
      data?.openType === 'edit'
        ? '编辑'
        : data?.openType === 'add'
          ? '新增'
          : data?.openType === 'view'
            ? '查看'
            : ''
    "
  >
    <Form />
    <!-- <EditForm v-if="data.openType === 'edit'" />
    <AddForm v-else-if="data.openType === 'add'" />
    <ViewForm v-else-if="data.openType === 'view'" /> -->
  </Modal>
</template>
