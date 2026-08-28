interface RawColumn {
  prop: string;
  label: string;
  type?: string;
  dicUrl: string;
}

export function transformComponentType(type?: string) {
  let component: string;
  switch (type) {
    case 'datetime': {
      component = 'DatePicker';
      break;
    }
    case 'Int':
    case 'number': {
      component = 'InputNumber';
      break;
    }
    case 'select': {
      component = 'ChcSelect';
      break;
    }
    case 'switch': {
      component = 'Switch';
      break;
    }
    case 'textarea': {
      component = 'Textarea';
      break;
    }
    default: {
      component = 'Input';
    }
  }

  return component;
}
export function transformComponent(
  { prop: fieldName, label, type, dicUrl: dictUrl }: RawColumn,
  show: () => boolean,
) {
  if (dictUrl) {
    return {
      component: 'ChcSelect',
      componentProps: () => ({
        dictUrl,
        paginate: false,
        afterFetch: (records: any[]) => ({ records }),
      }),
      dependencies: {
        triggerFields: ['a'],
        show,
      },
      fieldName,
      label,
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[1px] pl-[4px]',
    };
  } else
    switch (type?.toLowerCase()) {
      case 'boolean':
      case 'switch': {
        return {
          component: 'Switch',
          componentProps: () => ({
            checkedValue: true,
            checkedChildren: '是',
            unCheckedValue: false,
            unCheckedChildren: '否',

            style: {
              width: '40px',
            },
          }),
          dependencies: {
            triggerFields: ['a'],
            show,
          },
          fieldName,
          label,
          formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
          labelClass: 'leading-1 mb-[1px] pl-[4px]',
          defaultValue: false,
        };
      }
      case 'byte':
      case 'decimal':
      case 'double':
      case 'float':
      case 'int':
      case 'long':
      case 'number':
      case 'short': {
        return {
          component: 'InputNumber',
          componentProps: {
            placeholder: '请输入',
          },
          dependencies: {
            triggerFields: ['a'],
            show,
          },
          fieldName,
          label,
          formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
          labelClass: 'leading-1 mb-[1px] pl-[4px]',
        };
      }
      case 'date': {
        return {
          component: 'DatePicker',
          componentProps: () => {
            return {
              valueFormat: 'YYYY-MM-DD',
            };
          },
          dependencies: {
            triggerFields: ['a'],
            show,
          },
          fieldName,
          label,
          formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
          labelClass: 'leading-1 mb-[1px] pl-[4px]',
        };
      }
      case 'datetime': {
        return {
          component: 'DatePicker',
          componentProps: () => {
            return {
              showTime: true,
              valueFormat: 'YYYY-MM-DD HH:mm:ss',
            };
          },
          dependencies: {
            triggerFields: ['a'],
            show,
          },
          fieldName,
          label,
          formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
          labelClass: 'leading-1 mb-[1px] pl-[4px]',
        };
      }
      case 'longtext':
      case 'textarea': {
        return {
          component: 'Textarea',
          componentProps: {
            placeholder: '请输入',
            rows: 1,
          },
          dependencies: {
            triggerFields: ['a'],
            show,
          },
          fieldName,
          label,
          formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
          labelClass: 'leading-1 mb-[1px] pl-[4px]',
        };
      }
      case 'time': {
        return {
          component: 'TimePicker',
          componentProps: () => {
            return {
              valueFormat: 'HH:mm:ss',
            };
          },
          dependencies: {
            triggerFields: ['a'],
            show,
          },
          fieldName,
          label,
          formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
          labelClass: 'leading-1 mb-[1px] pl-[4px]',
        };
      }
      default: {
        return {
          component: 'Input',
          componentProps: {
            placeholder: '请输入',
          },
          dependencies: {
            triggerFields: ['a'],
            show,
          },
          fieldName,
          label,
          formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
          labelClass: 'leading-1 mb-[1px] pl-[4px]',
        };
      }
    }
}
