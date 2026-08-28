import type { Recordable } from '@vben/types';

import { h, ref } from 'vue';

import {
  AntdEditOutlined,
  AntdEyeTwotone,
  AntdSolutionOutlined,
  IconifyIcon,
  MdiDotsHorizontal,
  MdiLightDelete,
} from '@vben/chc-icons';
import { ChcSelect } from '@vben/chc-ui';
import { useChcGrid } from '@vben/chc-ui/chc-table';
import { useVbenModal } from '@vben/common-ui';
import { $te } from '@vben/locales';
import { setupVbenVxeTable, useVbenVxeGrid } from '@vben/plugins/vxe-table';
import { get, isFunction, isString } from '@vben/utils';

import { objectOmit } from '@vueuse/core';
import {
  Button,
  DatePicker,
  Dropdown,
  Image,
  Input,
  InputNumber,
  Menu,
  MenuItem,
  Popconfirm,
  Switch,
  Tag,
  Tooltip,
} from 'ant-design-vue';
import ExcelJS from 'exceljs';
import VxeUIPluginExportXLSX from 'vxe-table-plugin-export-xlsx';

import { requestClient } from '#/api/request';
import { IS_FORM_AREA_VERTICAL } from '#/const';
import { $t } from '#/locales';

import { useVbenForm } from './form';
// 手动触发下键
function triggerEnter(el: any = document) {
  const enterEvent = new KeyboardEvent('keydown', {
    key: 'ArrowDown',
    code: 'ArrowDown',
    keyCode: 40,
    which: 40,
    bubbles: true,
    cancelable: true,
  });
  el.dispatchEvent(enterEvent);
}
setupVbenVxeTable({
  configVxeTable: (vxeUI) => {
    vxeUI.use(VxeUIPluginExportXLSX, {
      ExcelJS,
    });
    vxeUI.setConfig({
      grid: {
        headerAlign: 'center',
        align: 'left',
        border: false,
        columnConfig: {
          resizable: true,
        },

        formConfig: {
          // 全局禁用vxe-table的表单配置，使用formOptions
          enabled: false,
        },
        minHeight: 180,
        proxyConfig: {
          autoLoad: true,
          response: {
            result: 'items',
            total: 'total',
            list: '',
          },
          showActiveMsg: true,
          showResponseMsg: false,
        },
        round: true,
        showOverflow: true,
        size: 'mini',
        pagerConfig: {
          className: 'w-full',
          pageSizes: [10, 25, 50, 100, 500, 1000],
          pageSize: 25,
        },
      },
      zIndex: 2000,
    });

    /**
     * 解决vxeTable在热更新时可能会出错的问题
     */
    vxeUI.renderer.forEach((_item, key) => {
      if (key.startsWith('Cell')) {
        vxeUI.renderer.delete(key);
      }
    });
    vxeUI.renderer.add('ChcSelect', {
      renderTableEdit(renderOpts, scope) {
        const { props = {} } = renderOpts;
        const { column, row } = scope;
        const changeTime = ref(Date.now());
        let disabled = false;
        if (
          props.disabled !== undefined &&
          typeof props.disabled === 'function'
        ) {
          disabled = props.disabled(scope);
        } else {
          disabled = props.disabled;
        }
        return h(ChcSelect, {
          allowClear: false,
          ...props,
          disabled,
          class: `w-full ChcSelect-${column.field} ${props && props.class ? props.class : ''}`,
          onChange: (val: any, option: any) => {
            changeTime.value = Date.now();
            props?.onChange?.(val, option, scope);
          },
          onKeydown: (e: KeyboardEvent) => {
            // 通过enter键触发的修改，需要阻止冒泡
            if (e.code === 'Enter' && Date.now() - changeTime.value < 100) {
              e.stopPropagation();
            }
          },
          // extraParams:
          //   props.extraParams && isFunction(props.extraParams)
          //     ? props.extraParams(scope)
          //     : props.extraParams,
          modelValue: row[column.field],
          onFocus() {
            props.handleEditItemFocus &&
              props.handleEditItemFocus(column.field);
            if (props.onFocus && typeof props.onFocus === 'function') {
              props.onFocus();
            }
            // 手动触发键盘事件
            setTimeout(() => {
              const el = document.querySelector(
                `.ChcSelect-${column.field} input`,
              );
              triggerEnter(el);
            });
          },
        });
      },
    });
    vxeUI.renderer.add('ChcInput', {
      renderTableEdit(renderOpts, scope) {
        const { props = {} } = renderOpts;
        let disabled = false;
        if (
          props.disabled !== undefined &&
          typeof props.disabled === 'function'
        ) {
          disabled = props.disabled(scope);
        } else {
          disabled = props.disabled;
        }
        const { column, row } = scope;
        return h(Input, {
          ...props,
          disabled,
          class: `w-full ChcSelect-${column.field} ${props && props.class ? props.class : ''}`,
          value: row[column.field],
          onChange: (val: any) => {
            props?.onChange?.(val, scope);
          },
          'onUpdate:value': (val: any) => {
            row[column.field] = val;
          },
          onFocus() {
            props.handleEditItemFocus &&
              props.handleEditItemFocus(column.field);
            if (props.onFocus && typeof props.onFocus === 'function') {
              props.onFocus();
            }
          },
        });
      },
    });
    vxeUI.renderer.add('ChcInputNumber', {
      renderTableEdit(renderOpts, scope) {
        const { props = {} } = renderOpts;
        const { column, row } = scope;
        let disabled = false;
        if (
          props.disabled !== undefined &&
          typeof props.disabled === 'function'
        ) {
          disabled = props.disabled(scope);
        } else {
          disabled = props.disabled;
        }
        return h(InputNumber, {
          ...props,
          disabled,
          class: `w-full ChcSelect-${column.field} ${props && props.class ? props.class : ''}`,
          value: row[column.field],
          onChange: (val: any) => {
            props?.onChange?.(val, scope);
          },
          'onUpdate:value': (val: any) => {
            row[column.field] = val;
          },
          keyboard: false, //自己实现步进效果
          onKeydown(e: KeyboardEvent) {
            // console.log('InputNumber:onKeydown:', e);
            let step = 1;
            if (props.step !== undefined && typeof props.step === 'string') {
              step = Number(props.step);
            }
            if (props.step !== undefined && typeof props.step === 'number') {
              step = props.step;
            }
            if (e.code === 'ArrowUp' && !e.ctrlKey && !e.shiftKey) {
              e.stopPropagation();
              e.preventDefault();
              if (props.max !== undefined && typeof props.max === 'number') {
                if (row[column.field] + step <= props.max) {
                  row[column.field] = row[column.field] + step;
                  props?.onChange?.(row[column.field], scope);
                }
                // row[column.field] =
                //   row[column.field] + step > props.max
                //     ? row[column.field]
                //     : row[column.field] + step;
              } else {
                row[column.field] = row[column.field] + step;
                props?.onChange?.(row[column.field], scope);
              }
            } else if (e.code === 'ArrowDown' && !e.ctrlKey && !e.shiftKey) {
              e.stopPropagation();
              e.preventDefault();
              if (props.min !== undefined && typeof props.min === 'number') {
                if (row[column.field] - step >= props.min) {
                  row[column.field] = row[column.field] - step;
                  props?.onChange?.(row[column.field], scope);
                }
                // row[column.field] =
                //   row[column.field] - step < props.min
                //     ? row[column.field]
                //     : row[column.field] - step;
              } else {
                row[column.field] = row[column.field] - step;
                props?.onChange?.(row[column.field], scope);
              }
            }
          },
          onFocus() {
            props.handleEditItemFocus &&
              props.handleEditItemFocus(column.field);
            if (props.onFocus && typeof props.onFocus === 'function') {
              props.onFocus();
            }
          },
        });
      },
    });
    vxeUI.renderer.add('ChcDatePicker', {
      renderTableEdit(renderOpts, scope) {
        const { props = {} } = renderOpts;
        const { column, row } = scope;
        let disabled = false;
        if (
          props.disabled !== undefined &&
          typeof props.disabled === 'function'
        ) {
          disabled = props.disabled(scope);
        } else {
          disabled = props.disabled;
        }
        return h(DatePicker, {
          ...props,
          disabled,
          class: `w-full DatePicker-${column.field} ${props && props.class ? props.class : ''}`,
          value: row[column.field],
          onChange: (val: any) => {
            props?.onChange?.(val, scope);
          },
          'onUpdate:value': (val: any) => {
            row[column.field] = val;
          },
          onFocus: () => {
            props.handleEditItemFocus &&
              props.handleEditItemFocus(column.field);
            if (props.onFocus && typeof props.onFocus === 'function') {
              props.onFocus();
            }
            // 手动触发键盘事件
            setTimeout(() => {
              const el = document.querySelector(
                `.DatePicker-${column.field} input`,
              );
              triggerEnter(el);
            });
          },
        });
      },
    });

    // 表格配置项可以用 cellRender: { name: 'CellImage' },
    vxeUI.renderer.add('CellImage', {
      renderTableDefault(_renderOpts, scope) {
        const { column, row } = scope;
        return h(Image, { src: row[column.field] });
      },
    });

    // 表格配置项可以用 cellRender: { name: 'CellLink' },
    vxeUI.renderer.add('CellLink', {
      renderTableDefault(renderOpts) {
        const { props } = renderOpts;
        return h(
          Button,
          {
            size: 'small',
            type: 'link',
            ...props,
          },
          { default: () => props?.text },
        );
      },
    });

    // 单元格渲染： Tag
    vxeUI.renderer.add('CellTag', {
      renderTableDefault({ options, props }, { column, row }) {
        const value = get(row, column.field);
        const tagOptions = options ?? [
          { color: 'success', label: $t('common.enabled'), value: 1 },
          { color: 'error', label: $t('common.disabled'), value: 0 },
        ];
        const tagItem = tagOptions.find((item) => item.value === value);
        return h(
          Tag,
          {
            ...props,
            ...objectOmit(tagItem ?? {}, ['label']),
          },
          { default: () => tagItem?.label ?? value },
        );
      },
    });

    vxeUI.renderer.add('CellSwitch', {
      renderTableDefault({ attrs, props }, { column, row }) {
        const loadingKey = `__loading_${column.field}`;
        const finallyProps = {
          checkedChildren: $t('common.enabled'),
          checkedValue: 1,
          unCheckedChildren: $t('common.disabled'),
          unCheckedValue: 0,
          ...props,
          checked: row[column.field],
          loading: row[loadingKey] ?? false,
          'onUpdate:checked': onChange,
        };
        async function onChange(newVal: any) {
          row[loadingKey] = true;
          try {
            const result = await attrs?.beforeChange?.(newVal, row);
            if (result !== false) {
              row[column.field] = newVal;
            }
          } finally {
            row[loadingKey] = false;
          }
        }
        return h(Switch, finallyProps);
      },
    });

    /**
     * 注册表格的操作按钮渲染器
     */
    vxeUI.renderer.add('CellOperation', {
      renderTableDefault({ attrs, options, props }, { column, row }) {
        const defaultProps = { size: 'small', type: 'link', ...props };
        let align = 'end';
        switch (column.align) {
          case 'center': {
            align = 'center';
            break;
          }
          case 'left': {
            align = 'start';
            break;
          }
          default: {
            align = 'end';
            break;
          }
        }
        const presets: Recordable<Recordable<any>> = {
          delete: {
            danger: true,
            text: $t('common.delete'),
          },
          edit: {
            text: $t('common.edit'),
          },
        };
        const operations: Array<Recordable<any>> = (
          options || ['edit', 'delete']
        )
          .map((opt) => {
            if (isString(opt)) {
              return presets[opt]
                ? { code: opt, ...presets[opt], ...defaultProps }
                : {
                    code: opt,
                    text: $te(`common.${opt}`) ? $t(`common.${opt}`) : opt,
                    ...defaultProps,
                  };
            } else {
              return { ...defaultProps, ...presets[opt.code], ...opt };
            }
          })
          .map((opt) => {
            const optBtn: Recordable<any> = {};
            Object.keys(opt).forEach((key) => {
              optBtn[key] = isFunction(opt[key]) ? opt[key](row) : opt[key];
            });
            return optBtn;
          })
          .filter((opt) => opt.show !== false);

        function renderBtn(opt: Recordable<any>, listen = true) {
          return h(
            Button,
            {
              ...props,
              ...opt,
              icon: undefined,
              onClick: listen
                ? () =>
                    attrs?.onClick?.({
                      code: opt.code,
                      row,
                    })
                : undefined,
            },
            {
              default: () => {
                const content = [];
                if (opt.icon) {
                  content.push(
                    h(IconifyIcon, { class: 'size-5', icon: opt.icon }),
                  );
                }
                content.push(opt.text);
                return content;
              },
            },
          );
        }

        function renderConfirm(opt: Recordable<any>) {
          let viewportWrapper: HTMLElement | null = null;
          return h(
            Popconfirm,
            {
              /**
               * 当popconfirm用在固定列中时，将固定列作为弹窗的容器时可能会因为固定列较窄而无法容纳弹窗
               * 将表格主体区域作为弹窗容器时又会因为固定列的层级较高而遮挡弹窗
               * 将body或者表格视口区域作为弹窗容器时又会导致弹窗无法跟随表格滚动。
               * 鉴于以上各种情况，一种折中的解决方案是弹出层展示时，禁止操作表格的滚动条。
               * 这样既解决了弹窗的遮挡问题，又不至于让弹窗随着表格的滚动而跑出视口区域。
               */
              getPopupContainer(el) {
                viewportWrapper = el.closest('.vxe-table--viewport-wrapper');
                return document.body;
              },
              placement: 'topLeft',
              title: $t('ui.actionTitle.delete', [attrs?.nameTitle || '']),
              ...props,
              ...opt,
              icon: undefined,
              onOpenChange: (open: boolean) => {
                // 当弹窗打开时，禁止表格的滚动
                if (open) {
                  viewportWrapper?.style.setProperty('pointer-events', 'none');
                } else {
                  viewportWrapper?.style.removeProperty('pointer-events');
                }
              },
              onConfirm: () => {
                attrs?.onClick?.({
                  code: opt.code,
                  row,
                });
              },
            },
            {
              default: () => renderBtn({ ...opt }, false),
              description: () =>
                h(
                  'div',
                  { class: 'truncate' },
                  $t('ui.actionMessage.deleteConfirm', [
                    row[attrs?.nameField || 'name'],
                  ]),
                ),
            },
          );
        }

        const btns = operations.map((opt) =>
          opt.code === 'delete' ? renderConfirm(opt) : renderBtn(opt),
        );
        return h(
          'div',
          {
            class: 'flex table-operations',
            style: { justifyContent: align },
          },
          btns,
        );
      },
    });

    /**
     * 注册表格的操作区域渲染器
     */
    vxeUI.renderer.add('CellMenu', {
      renderTableDefault({ attrs, options, props }, { column, row }) {
        const defaultProps = { size: 'small', type: 'link', ...props };
        let align = 'end';
        switch (column.align) {
          case 'center': {
            align = 'center';
            break;
          }
          case 'left': {
            align = 'start';
            break;
          }
          default: {
            align = 'end';
            break;
          }
        }
        const presets: Recordable<Recordable<any>> = {
          delete: {
            danger: true,
            icon: MdiLightDelete,
            // icon: 'mdi-light:delete',
            text: '删除',
          },
          edit: {
            icon: AntdEditOutlined,
            // icon: 'ant-design:edit-outlined',
            text: '编辑',
          },
          view: {
            icon: AntdEyeTwotone,
            // icon: 'ant-design:eye-twotone',
            text: '查看',
          },
          log: {
            icon: AntdSolutionOutlined,
            text: '履历',
          },
        };
        // 将 options 配置分成 默认配置 和 额外配置
        const defaultOptions: Array<Recordable<any>> = [];
        const extraOptions: Array<Recordable<any>> = [];
        if (options && options.length > 0) {
          for (const option of options) {
            if (isString(option)) {
              if (presets[option]) {
                defaultOptions.push({
                  code: option,
                  ...presets[option],
                  ...defaultProps,
                });
              } else {
                extraOptions.push({
                  code: option,
                  text: option,
                  ...defaultProps,
                });
              }
            } else {
              if (presets[option.code]) {
                defaultOptions.push({
                  ...defaultProps,
                  ...presets[option.code],
                  ...option,
                });
              } else {
                extraOptions.push({
                  ...defaultProps,
                  ...option,
                });
              }
            }
          }
        }

        // 控制显示隐藏
        const defaultOperations: Array<Recordable<any>> = defaultOptions
          .map((opt) => {
            const optBtn: Recordable<any> = {};
            Object.keys(opt).forEach((key) => {
              optBtn[key] = isFunction(opt[key]) ? opt[key](row) : opt[key];
            });
            return optBtn;
          })
          .filter((opt) => opt.show !== false);
        const extraOperations: Array<Recordable<any>> = extraOptions
          .map((opt) => {
            const optBtn: Recordable<any> = {};
            Object.keys(opt).forEach((key) => {
              optBtn[key] = isFunction(opt[key]) ? opt[key](row) : opt[key];
            });
            return optBtn;
          })
          .filter((opt) => opt.show !== false);

        function renderBtn(opt: Recordable<any>, listen = true) {
          return h(
            Tooltip,
            { title: opt.text },
            {
              default: () => {
                return h(
                  Button,
                  {
                    ...props,
                    ...opt,
                    icon: undefined,
                    onClick: listen
                      ? (event) => {
                          event.stopPropagation();
                          attrs?.onClick?.({
                            code: opt.code,
                            row,
                          });
                        }
                      : undefined,
                  },
                  {
                    default: () => {
                      const content = [];
                      if (opt.icon) {
                        content.push(
                          h(opt.icon, { class: 'text-[1.125rem]' }),
                          // h(IconifyIcon, {
                          //   class: 'text-[18px]',
                          //   icon: opt.icon,
                          // }),
                        );
                      }
                      // content.push(opt.text);
                      return content;
                    },
                  },
                );
              },
            },
          );
        }
        function renderDropdown(listen = true) {
          return h(
            Dropdown,
            {
              placement: 'bottomRight',
              // ...props,
            },
            {
              default: () => {
                const content = h(
                  Button,
                  {
                    icon: undefined,
                    size: 'small',
                    type: 'link',
                  },
                  {
                    default: () => {
                      return h(MdiDotsHorizontal, { class: 'text-[1.125rem]' });
                      // return h(IconifyIcon, {
                      //   class: 'text-[18px]',
                      //   icon: 'mdi:dots-horizontal',
                      // });
                    },
                  },
                );
                return content;
              },
              overlay: () => {
                return h(
                  Menu,
                  {
                    onClick: listen
                      ? ({ key }) => {
                          return attrs?.onClick?.({
                            code: key,
                            row,
                          });
                        }
                      : undefined,
                  },
                  {
                    default: () => {
                      const content = [];
                      for (const opt of extraOperations) {
                        content.push(
                          h(
                            MenuItem,
                            {
                              key: opt.code,
                              ...opt,
                            },
                            {
                              default: () => {
                                return opt.text;
                              },
                            },
                          ),
                        );
                      }
                      return content;
                    },
                  },
                );
              },
            },
          );
        }
        const btns =
          extraOperations.length > 0
            ? [
                ...defaultOperations.map(
                  (opt) => renderBtn(opt),
                  // opt.code === 'delete' ? renderConfirm(opt) : renderBtn(opt),
                ),
                renderDropdown(),
              ]
            : defaultOperations.map(
                (opt) => renderBtn(opt),
                // opt.code === 'delete' ? renderConfirm(opt) : renderBtn(opt),
              );
        return h(
          'div',
          {
            class: 'flex table-operations',
            style: { justifyContent: align },
          },
          btns,
        );
      },
    });

    // 这里可以自行扩展 vxe-table 的全局配置，比如自定义格式化
    // vxeUI.formats.add
  },
  useVbenForm,
});

export { useVbenVxeGrid };
export type OnActionClickParams<T = Recordable<any>> = {
  code: string;
  row: T;
};
export type OnActionClickFn<T = Recordable<any>> = (
  params: OnActionClickParams<T>,
) => void;
export const ChcGrid = useChcGrid({
  useVbenForm,
  isFormAreaVertical: IS_FORM_AREA_VERTICAL,
  requestClient,
  useVbenModal,
});

export type * from '@vben/chc-ui/chc-table';
export type * from '@vben/plugins/chc-table';
export { VbenChcTable, VxeGrid } from '@vben/plugins/chc-table';
export type * from '@vben/plugins/vxe-table';
