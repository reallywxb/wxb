/**
 * 页面弹窗表单配置
 */
import type { VbenFormProps } from '#/adapter/form';

export const temFormOptions: VbenFormProps = {
  layout: 'vertical',
  schema: [
    {
      component: 'Input',
      fieldName: 'serNo',
      label: '厂家码',
      rules: 'required',
      componentProps: {
        placeholder: '请输入厂家码',
      },
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: false,
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
  wrapperClass: 'grid-cols-1',
};
