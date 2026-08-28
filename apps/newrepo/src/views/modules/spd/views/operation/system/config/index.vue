<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { getLocalServer, saveDo } from './api';

const [BaseForm, baseFormApi] = useVbenForm({
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 在label后显示一个冒号
    colon: true,
    // 所有表单项
    labelWidth: 120,
    componentProps: {
      class: 'w-full',
      formItemClass: 'col-start-1',
    },
  },

  // 提交函数
  handleSubmit: onSubmit,

  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行
  actionWrapperClass: 'text-center',
  layout: 'horizontal',
  resetButtonOptions: {
    show: false,
  },
  submitButtonOptions: {
    content: '保存',
  },
  showCollapseButton: false,
  showDefaultActions: true,
  // actionLayout: 'newLine',
  schema: [
    {
      component: 'Input',
      fieldName: 'name',
      label: '系统名称',
      formItemClass: 'col-start-1',
      componentProps: () => {
        return {
          placeholder: '请输入系统名称',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'value',
      label: '系统编码',
      formItemClass: 'col-start-1',
      componentProps: () => {
        return {
          placeholder: '请输入系统编码',
        };
      },
    },
    // {
    //   component: 'Input',
    //   fieldName: 'value',
    //   label: '编码',

    //   componentProps: () => {
    //     return {
    //       placeholder: '请输入编码',
    //     };
    //   },
    // },
    // {
    //   component: 'Switch',
    //   fieldName: 'isStockup',
    //   label: '是否预备货',
    //   formItemClass: 'col-start-1',
    //   componentProps: () => {
    //     return {
    //       checkedValue: 'Y',
    //       unCheckedValue: 'N',

    //       style: {
    //         width: '40px',
    //       },
    //     };
    //   },
    // },
    // {
    //   component: 'Input',
    //   fieldName: 'value',
    //   label: '编码',
    //   formItemClass: 'col-start-1',
    //   componentProps: () => {
    //     return {
    //       placeholder: '请输入编码',
    //     };
    //   },
    // },
    // {
    //   component: 'Switch',
    //   fieldName: 'isActive',
    //   label: '是否有效',
    //   formItemClass: 'col-start-1',
    //   componentProps: () => {
    //     return {
    //       checkedValue: 'Y',
    //       unCheckedValue: 'N',
    //       style: {
    //         width: '40px',
    //       },
    //     };
    //   },
    // },
    // {
    //   component: 'Switch',
    //   fieldName: 'isActive',
    //   label: '是否有效',
    //   formItemClass: 'col-start-1',
    //   componentProps: () => {
    //     return {
    //       checkedValue: 'Y',
    //       unCheckedValue: 'N',
    //       style: {
    //         width: '40px',
    //       },
    //     };
    //   },
    // },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-2',
});

onMounted(() => {
  getConfigData();
});

const serverId = ref('');
const getConfigData = async () => {
  const res: any = await getLocalServer();
  if (res && res.success) {
    serverId.value = res.result.ad_server_id;
    const newSchema: any = [
      {
        component: 'Input',
        fieldName: 'name',
        label: '系统名称',
        formItemClass: 'col-start-1',
        componentProps: () => {
          return {
            placeholder: '请输入系统名称',
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'value',
        label: '系统编码',
        formItemClass: 'col-start-1',
        componentProps: () => {
          return {
            placeholder: '请输入系统编码',
          };
        },
      },
    ];
    const fieldData: any = {
      name: res.result.name,
      value: res.result.value,
    };
    if (res.result.sysConfigItem?.length > 0) {
      res.result.sysConfigItem.forEach((item: any) => {
        const name = `config_${item.configItemId}`;
        fieldData[name] = item.value || item.defaultValue;
        switch (item.itemType) {
          case 'checkbox': {
            newSchema.push({
              component: 'Switch',
              fieldName: name,
              label: item.itemName,
              formItemClass: 'col-start-1',
              componentProps: () => {
                return {
                  checkedValue: 'Y',
                  unCheckedValue: 'N',
                  style: {
                    width: '40px',
                  },
                };
              },
            });

            break;
          }
          case 'date':
          case 'datetime': {
            newSchema.push({
              component: 'DatePicker',
              fieldName: name,
              label: item.itemName,
              formItemClass: 'col-start-1',
              componentProps: () => {
                return {
                  showTime: item.itemType === 'datetime',
                  valueFormat:
                    item.itemType === 'datetime'
                      ? 'YYYY-MM-DD HH:mm'
                      : 'YYYY-MM-DD',
                  format:
                    item.itemType === 'datetime'
                      ? 'YYYY-MM-DD HH:mm'
                      : 'YYYY-MM-DD',
                };
              },
            });

            break;
          }
          case 'lookup': {
            newSchema.push({
              component: 'ChcSelect',
              fieldName: name,
              label: item.itemName,
              formItemClass: 'col-start-1',
              componentProps: () => {
                return {
                  placeholder: item.placeholder,
                  dictUrl: `/baseHandleAction/refList.do?id=${item.referenceValueId}`,
                  apiType: 'post',
                  requestContentType: 'application/x-www-form-urlencoded',
                  paginate: false,
                  filterByFrontEnd: true,
                  immediate: true,
                  filterField: 'name',
                  labelField: 'name',
                  valueField: 'id',
                  afterFetch(res: any) {
                    return { ...res, rows: undefined, records: res.rows };
                  },
                };
              },
            });

            break;
          }
          case 'time': {
            newSchema.push({
              component: 'TimePicker',
              fieldName: name,
              label: item.itemName,
              formItemClass: 'col-start-1',
              componentProps: () => {
                return {
                  valueFormat: 'HH:mm',
                  format: 'HH:mm',
                };
              },
            });

            break;
          }
          default: {
            newSchema.push({
              component: 'Input',
              fieldName: name,
              label: item.itemName,
              formItemClass: 'col-start-1',
              componentProps: () => {
                return {
                  placeholder: item.placeholder,
                };
              },
            });
          }
        }
      });
    }
      if (newSchema.length > 0) {
        baseFormApi.setState(() => {
          return {
            schema: newSchema,
          };
        });
      }
      baseFormApi.setValues(fieldData);
  }
};
function onSubmit() {
  baseFormApi.getValues().then((res: any) => {
    if (!res.name) {
      message.warn('请填写系统名称');
      return;
    }
    if (!res.value) {
      message.warn('请填写系统编码');
      return;
    }
    // ChcGridApi.query({ ...res });
    saveDo({
      ...res,
      serverId: serverId.value,
    }).then((res) => {
      if (res && res.success) {
        message.success({
          content: '保存成功',
        });
        getConfigData();
      }
    });
  });
}
</script>
<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <BaseForm class="form-box" />
  </Page>
</template>

<style lang="less" scoped>
.form-box {
  padding: 10px;
  // margin: 10px;
  background-color: #fff;
}
</style>
