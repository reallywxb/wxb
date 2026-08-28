import type {
  AdvSearchField,
  VbenFormSchema as FormSchema,
  VbenFormProps,
} from '@vben/common-ui';

import type { ComponentType } from './component';

import { setupVbenForm, useVbenForm as useForm, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { addFormItemProps, packageFnOrObj } from './utils';

setupVbenForm<ComponentType>({
  config: {
    // ant design vue组件库默认都是 v-model:value
    baseModelPropName: 'value',
    // 一些组件是 v-model:checked 或者 v-model:fileList
    modelPropNameMap: {
      Checkbox: 'checked',
      Radio: 'checked',
      Switch: 'checked',
      Upload: 'fileList',
    },
  },
  defineRules: {
    // 输入项目必填国际化适配
    required: (value, _params, ctx) => {
      if (value === undefined || value === null || value.length === 0) {
        return $t('ui.formRules.required', [ctx.label]);
      }
      return true;
    },
    // 选择项目必填国际化适配
    selectRequired: (value, _params, ctx) => {
      if (value === undefined || value === null) {
        return $t('ui.formRules.selectRequired', [ctx.label]);
      }
      return true;
    },
  },
});

// const useVbenForm = useForm<ComponentType>;
// 给schema添加标准的form属性，自动的依赖
const useVbenForm = (options: VbenFormProps<ComponentType>) => {
  // 自动为form添加类名，用于select的下拉弹窗定位
  if (options.popupContainerClass) {
    options.wrapperClass = options.wrapperClass
      ? `${options.wrapperClass} popCon-${options.popupContainerClass}`
      : `popCon-${options.popupContainerClass}`;
  } else if (options.id) {
    console.warn(
      '[Deprecated]：formOptions的id属性原用于在有滚动条的表单内让select的下拉弹窗自动定位。\n由于id属性未来可能拓展其他用途，现新增popupContainerClass字段用于实现同样动能。\n看到这个报错，请将form表单的id字段改为popupContainerClass字段。\n后续id属性有别的用途时，将不再兼容',
    );
    options.wrapperClass = options.wrapperClass
      ? `${options.wrapperClass} popCon-${options.id}`
      : `popCon-${options.id}`;
  }
  options.schema &&
    options.schema?.forEach((field) => {
      if (!field.componentProps) {
        field.componentProps = {};
      }
      field.componentProps = packageFnOrObj(field.componentProps, (obj) => {
        return addFormItemProps(
          field,
          obj,
          options.popupContainerClass || options.id,
        );
      });
    });
  return useForm<ComponentType>(options);
};
export { useVbenForm, z };
export type VbenFormSchema = FormSchema<ComponentType>;
export type { AdvSearchField, VbenFormProps };
