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
  showCollapseButton: false,
  submitOnChange: false,
  submitOnEnter: false,
  wrapperClass: 'grid-cols-1',
};
