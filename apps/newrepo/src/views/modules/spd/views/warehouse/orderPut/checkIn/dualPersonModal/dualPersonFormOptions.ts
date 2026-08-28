/**
 * 双人作业验证弹窗表单配置
 */
import type { VbenFormProps } from '#/adapter/form';

export const dualPersonFormOptions: VbenFormProps = {
  layout: 'vertical',
  schema: [
    {
      component: 'ChcSelect',
      fieldName: 'checkUser2',
      label: '第二人',
      rules: 'required',
      componentProps: () => {
        return {
          dictUrl: '/warehouseAction/warehouseUserList.do',
          extraParams: {
            readWrite: 'Y',
            excludeSelf: 'Y',
            userType: '',
            warehouseId: '', // 这个值会在组件中动态设置
          },
          placeholder: '请选择第二人',
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
    },
    {
      component: 'Input',
      fieldName: 'password',
      label: '密码',
      rules: 'required',
      componentProps: {
        type: 'password',
        placeholder: '请输入密码',
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
