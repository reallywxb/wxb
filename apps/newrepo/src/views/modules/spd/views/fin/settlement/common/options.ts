export const priceAdjustmentFormOptions = {
  layout: 'vertical',
  schema: [
    {
      component: 'Input',
      disabled: true,
      fieldName: 'price',
      label: '原结算价',
    },
    {
      component: 'Input',
      fieldName: 'new_price',
      label: '新结算价',
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
