/**
 * 页面弹窗表单配置
 */
import type { VbenFormProps } from '#/adapter/form';

export const addFormOptions: VbenFormProps = {
  layout: 'vertical',
  schema: [
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          autoChooseFirstOption: true,
          dictUrl: '/baseHandleAction/refList.do?id=1000546',
          // showSearch: true,
          placeholder: '请选择关闭原因',
          onChange(val: any, option: any) {
            console.warn('closeReason', val, option);
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
      fieldName: 'closeReason',
      label: '关闭原因',
      rules: 'required',
    },
    {
      component: 'Textarea',
      fieldName: 'comments',
      label: '描述',
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
