// AI-GENERATED-BEGIN
// @date 2026-03-30
// @prompt 创建病区组配置页面的表格列配置
// @description 封装病区组列表、已绑定病区列表、病区列表的表格列配置
import type { VxeGridProps } from '#/adapter/vxe-table';

/**
 * 病区组列表的表格列配置
 * @returns 表格列配置数组
 */
export function getWardGroupColumns(): VxeGridProps['columns'] {
  return [
    {
      type: 'radio',
      title: '单选',
      width: '50',
      align: 'center',
      visible: false,
    },
    { field: 'groupName', title: '病区组名称', minWidth: 100 },
    {
      field: 'deptCount',
      title: '已绑定病区数量',
      minWidth: 130,
      align: 'right',
      slots: { default: 'deptCount' },
    },
  ];
}

/**
 * 已绑定病区列表的表格列配置
 * @returns 表格列配置数组
 */
export function getBoundWardColumns(): VxeGridProps['columns'] {
  return [
    { fixed: 'left', title: '', type: 'checkbox', width: 50, align: 'center' },
    { field: 'deptName', title: '病区名称', minWidth: 150 },
    { field: 'deptCode', title: '编码', minWidth: 120 },
    { field: 'value', title: '病区号', minWidth: 120 },
  ];
}

/**
 * 病区列表的表格列配置
 * @returns 表格列配置数组
 */
export function getWardColumns(): VxeGridProps['columns'] {
  return [
    { fixed: 'left', title: '', type: 'checkbox', width: 50, align: 'center' },
    { field: 'deptName', title: '病区名称', minWidth: 150 },
    { field: 'deptCode', title: '病区编码', minWidth: 120 },
    { field: 'value', title: '病区号', minWidth: 120 },
  ];
}
// AI-GENERATED-END
