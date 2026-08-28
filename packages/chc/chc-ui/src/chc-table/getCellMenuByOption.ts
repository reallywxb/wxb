import type { Recordable } from '@vben/types';

import type { BtnType } from '../types/crud';

import { h } from 'vue';

import {
  AntdSolutionOutlined,
  EditActionIcon,
  MdiDotsHorizontal,
  SvgDeleteIcon,
  viewActionIcon,
} from '@vben/chc-icons';
import { isFunction, isString } from '@vben/utils';

import { Button, Dropdown, Menu, MenuItem, Tooltip } from 'ant-design-vue';

export function getCellMenuByOption({
  attrs,
  options,
  props,
  column,
  row,
  dataTableId,
  hasAccessByCodes,
  showCellMenuIconBtn,
  handleView,
  handleEdit,
  handleDel,
  permissions,
  handleLog,
}: Recordable<any>) {
  function hasBtnAccessByCode(code: BtnType) {
    if (permissions?.[code]) {
      return hasAccessByCodes([permissions?.[code]]);
    } else if (dataTableId) {
      return hasAccessByCodes([`${dataTableId}.${code}`]);
    } else {
      return true;
    }
  }
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
  const defaultBtnCodes = new Set(['delete', 'edit', 'log', 'view']);
  let presets: Recordable<Recordable<any>> = {
    delete: {
      danger: true,
      icon: SvgDeleteIcon,
      // icon: 'mdi-light:delete',
      text: '删除',
    },
    edit: {
      icon: EditActionIcon,
      // icon: 'ant-design:edit-outlined',
      text: '编辑',
    },
    view: {
      icon: viewActionIcon,
      // icon: 'ant-design:eye-twotone',
      text: '查看',
    },
    log: {
      icon: AntdSolutionOutlined,
      text: '操作记录',
    },
  };
  options.forEach((option: any) => {
    if (!option.dropdown) {
      presets = Object.assign(presets, {
        [option.code]: {
          danger: option.danger,
          icon: option.icon,
          text: option.text,
        },
      });
    }
  });
  // debugger;
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
      // 没有show字段的情况下，直接添加默认权限控制
      if (
        opt.show === undefined &&
        opt.code !== 'view' &&
        defaultBtnCodes.has(opt.code)
      ) {
        opt.show = () => {
          return hasBtnAccessByCode(opt.code);
        };
      }
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
    // console.log('renderBtn---attrs:', props, opt, showCellMenuIconBtn);
    return showCellMenuIconBtn
      ? h(
          Tooltip,
          { title: opt.text },
          {
            default: () => {
              return h(
                Button,
                {
                  ...props,
                  ...opt,
                  class: 'leading-none',
                  icon: undefined,
                  onClick: listen
                    ? (event) => {
                        event.stopPropagation();
                        switch (opt.code) {
                          case 'delete': {
                            handleDel(row);
                            break;
                          }
                          case 'edit': {
                            handleEdit(row);
                            break;
                          }
                          case 'log': {
                            handleLog(row);
                            break;
                          }
                          case 'view': {
                            handleView(row);
                            break;
                          }
                        }
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
                        h(opt.icon, {
                          class: 'text-[1.125rem] align-baseline',
                        }),
                      );
                    } else {
                      content.push(h('span', {}, opt.text));
                    }
                    return content;
                  },
                },
              );
            },
          },
        )
      : h(
          Button,
          {
            ghost: true,

            class: 'mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0',
            ...props,
            ...opt,
            size: 'middle',
            type: 'primary',
            icon: undefined,
            onClick: listen
              ? (event) => {
                  event.stopPropagation();
                  switch (opt.code) {
                    case 'delete': {
                      handleDel(row);
                      break;
                    }
                    case 'edit': {
                      handleEdit(row);
                      break;
                    }
                    case 'log': {
                      handleLog(row);
                      break;
                    }
                    case 'view': {
                      handleView(row);
                      break;
                    }
                  }
                  attrs?.onClick?.({
                    code: opt.code,
                    row,
                  });
                }
              : undefined,
          },
          {
            default: () => opt.text,
            icon: opt.icon
              ? () =>
                  h(opt.icon, {
                    style: {
                      marginRight: '-3px',
                      marginBottom: '2px',
                    },
                  })
              : undefined,
          },
        );
  }
  function renderDropdown(listen = true) {
    return h(
      Dropdown,
      {
        placement: 'bottomRight',
      },
      {
        default: () => {
          const content = h(
            Button,
            {
              icon: undefined,
              size: 'small',
              class: showCellMenuIconBtn ? 'leading-none' : '',
              type: 'link',
            },
            {
              default: () => {
                return h(MdiDotsHorizontal, { class: 'text-[1.125rem]' });
              },
              // default: showCellMenuIconBtn
              //   ? () => {
              //       return h(MdiDotsHorizontal, { class: 'text-[1.125rem]' });
              //     }
              //   : () => '更多',
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
  // const btns =
  //   extraOperations.length > 0
  //     ? [
  //         ...defaultOperations.map(
  //           (opt) => renderBtn(opt),
  //           // 是否弹出确认气泡
  //           // opt.code === 'delete' ? renderConfirm(opt) : renderBtn(opt),
  //         ),
  //         renderDropdown(),
  //       ]
  //     : defaultOperations.map(
  //         (opt) => renderBtn(opt),
  //         // 是否弹出确认气泡
  //         // opt.code === 'delete' ? renderConfirm(opt) : renderBtn(opt),
  //       );
  return h(
    'div',
    {
      class: showCellMenuIconBtn
        ? 'flex table-operations'
        : 'flex table-operations',
      style: { justifyContent: align },
    },
    extraOperations.length > 0
      ? [...defaultOperations.map((opt) => renderBtn(opt)), renderDropdown()]
      : defaultOperations.map((opt) => renderBtn(opt)),
  );
}
