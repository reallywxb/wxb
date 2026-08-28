// import type { GridColumn } from '@vben/chc-ui';
import type { VbenFormSchema } from '@vben/common-ui';

import type { PageType, PrescriptionActionRow, StatusItem } from './type';

import { handlePriceToFixedTwo } from '#/utils/util';
import dayjs from 'dayjs';
import { PageEnum } from './type';
// 查询页面表单
export const queryCommonFormOptions = (
  pageType: PageType,
): VbenFormSchema[] => {
  // 公共查询表单项
  const commonFormOptions: VbenFormSchema[] = [
    {
      component: 'DateGroup',
      fieldName: 'dateRange',
      label: '处方时间',
      defaultValue: [
        dayjs().subtract(7, 'day').format('YYYY-MM-DD'), // 七天前
        dayjs().format('YYYY-MM-DD'),
      ],
      formItemClass: 'col-span-1',
      componentProps: () => {
        return {
          format: 'YYYY-MM-DD',
          valueFormat: 'YYYY-MM-DD',
        };
      },
    },
    {
      component: 'ChcSelect',
      fieldName: 'extHospitalId',
      label: '外延医院',
      defaultValue: '',
      componentProps: () => {
        return {
          dictUrl: 'prescriptionAction/queryAllHospital',
          placeholder: '请选择外延医院',
          paginate: false,
          showChooseAll: '',
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            // 需兼容数据格式 可能是数组 也可能是对象
            let rows: any[] = [];
            if (Array.isArray(res.data)) {
              rows = res.data.map((item: { code: number; name: string }) => ({
                id: item.code,
                name: item.name,
              }));
            } else if (res.data && typeof res.data === 'object') {
              rows = [
                {
                  id: res.data.code,
                  name: res.data.name,
                },
              ];
            } else {
              rows = [];
            }
            // const rows = res.data.map(
            //   (item: { code: number; name: string }) => ({
            //     id: item.code,
            //     name: item.name,
            //   }),
            // );
            return {
              ...res,
              rows: undefined,
              records: rows,
            };
          },
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'patientName',
      label: '就诊人',
      componentProps: () => {
        return {
          placeholder: '请输入就诊人',
          allowClear: true,
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'presNo',
      label: '处方号',
      componentProps: () => {
        return {
          placeholder: '请输入处方号',
          allowClear: true,
        };
      },
    },
    {
      component: 'ChcSelect',
      fieldName: 'deliveryWay',
      label: '配送方式',
      componentProps: () => {
        return {
          placeholder: '请选择配送方式',
          paginate: false,
          showChooseAll: '',
          options: [
            { value: '0', label: '配送到院' },
            { value: '1', label: '配送到家' },
          ],
        };
      },
    },
  ];
  // 编辑页特有
  const editFormOptions: VbenFormSchema[] = [
    {
      component: 'Input',
      fieldName: 'patientCard',
      label: '就诊卡号',
      componentProps: () => {
        return {
          placeholder: '请输入就诊卡号',
          allowClear: true,
        };
      },
    },
  ];
  return pageType === PageEnum.EDIT
    ? [...commonFormOptions, ...editFormOptions]
    : commonFormOptions;
};

// 查询页面表格列
// VxeTableGridOptions['columns']
export const queryGridColumns = (queryType: PageType): any[] => {
  // 公共查询表格列
  return [
    { title: '序号', type: 'seq', width: 50, align: 'center' },
    {
      field: 'deliveryNo',
      title: '配送单号',
      minWidth: '150',
      sortable: true,
      visible: queryType !== PageEnum.EDIT, // 签收和发放页面显示该字段
      // visible: ['sign', 'send'].includes(queryType), // 签收和发放页面显示该字段
    },
    {
      field: 'presNo',
      title: '处方号',
      minWidth: '120',
      sortable: true,
    },

    {
      title: '外延医院',
      field: 'extOrgName',
      minWidth: '150',
      sortable: true,
    },
    {
      title: '外延药房',
      field: 'extWarehouseName',
      minWidth: '150',
      sortable: true,
    },
    {
      title: '就诊人',
      field: 'patientName',
      minWidth: '100',
      sortable: true,
    },
    {
      title: '就诊卡号',
      field: 'patientCard',
      minWidth: '130',
      sortable: true,
      visible: queryType === PageEnum.EDIT, // 编辑页面显示该字段
    },
    {
      title: '性别',
      field: 'sex',
      minWidth: 70,
      sortable: true,
    },
    {
      title: '年龄',
      field: 'age',
      minWidth: 70,
      sortable: true,
      align: 'right',
      formatter: ({ cellValue }: { cellValue: number | string }) => {
        // 如果是string 并且包含'岁' 去除掉'岁' 只展示数字
        if (typeof cellValue === 'string' && cellValue.includes('岁')) {
          return cellValue.replace('岁', '');
        }
        return cellValue;
      },
    },
    {
      title: '处方金额',
      field: 'totalAmt',
      minWidth: '100',
      sortable: true,
      align: 'right',
      formatter: ({ cellValue }: { cellValue: number | string }) => {
        return handlePriceToFixedTwo(cellValue);
      },
    },
    {
      title: '处方类型',
      field: 'presTypeName',
      minWidth: '100',
      sortable: true,
    },
    {
      title: '开方医院',
      field: 'orgName',
      minWidth: '200',
      sortable: true,
      visible: queryType === PageEnum.EDIT, // 编辑页面显示该字段
    },
    {
      title: '处方时间',
      field: 'presDate',
      minWidth: 150,
      sortable: true,
    },
    {
      title: '配送方式',
      field: 'deliveryWay',
      minWidth: 110,
      sortable: true,
      formatter: ({ row }: { row: PrescriptionActionRow }) => {
        const deliveryWayMap = {
          '0': '配送到院',
          '1': '配送到家',
        };
        return (
          deliveryWayMap[row.deliveryWay as keyof typeof deliveryWayMap] ||
          row.deliveryWayName
        );
      },
    },
    {
      title: '状态', // 这个字段需要单独处理
      field: 'preStatus',
      minWidth: 100,
      sortable: true,
      formatter: ({ row }: { row: any }) => {
        const code = row.preStatus;
        const configLabel = getStatusLabel(code);
        return configLabel || row.preStatusName || code;
      },
      // formatter: ({ row }: { row: any }) => {
      //   const code = row.preStatus || row.status || row.statusName;
      //   const configLabel = getStatusLabel(queryType, code);
      //   return configLabel || row.statusName || code;
      // },
    },
  ];
};

/**
 * 状态模块
 */
// export const STATUS_MODULE = {
//   EDIT: 'edit', // 外延处方编辑
//   RECEIVE: 'sign', // 外延处方签收
//   DISTRIBUTE: 'send', // 外延处方发放
// } as const;

/**
 * 统一状态配置表
 */
// export const STATUS_MAP: Record<string, Record<number | string, StatusItem>> = {
//   // 编辑页面
//   [PageEnum.EDIT]: {
//     WAITING: { label: '待指示', color: '#F56C6C' },
//     CLOSED: { label: '关闭', color: '#67C23A' },
//     SENT: { label: '已发送', color: '#E6A23C' },
//   },
//   // 签收页面
//   [PageEnum.RECEIVE]: {
//     0: { label: '待签收', color: '#F56C6C' },
//     1: { label: '已签收', color: '#67C23A' },
//   },
//   // 发放页面
//   [PageEnum.DISTRIBUTE]: {
//     0: { label: '待取', color: '#F56C6C' },
//     1: { label: '已取', color: '#67C23A' },
//   },
// };

/**
 * 获取状态颜色
 */
// export const getStatusColor = (
//   pageType: PageType,
//   code: number | string,
// ): string => {
//   return STATUS_MAP[pageType]?.[code]?.color || '';
// };

/**
 * 获取状态文案
 */
// export const getStatusLabel = (
//   pageType: PageType,
//   code: number | string,
// ): string => {
//   return STATUS_MAP[pageType]?.[code]?.label || '';
// };

/**
 * 获取状态信息的通用函数
 * @param{string} moduleType - 业务模块类型
 * @param{string | number} code - 接口返回的状态码
 * @returns{object} {label: string, color: string}
 */
// export const getStatusInfo = (moduleType: PageType, code: number | string) => {
//   // 检查模块是否存在
//   const moduleConfig = STATUS_MAP[moduleType as keyof typeof STATUS_MAP];
//   if (!moduleConfig) {
//     throw new Error(`未找到模块 ${moduleType} 的状态配置`);
//   }
//   const statusItem = moduleConfig[code as keyof typeof moduleConfig];
//   if (!statusItem) {
//     return { label: '', color: '' };
//   }
//   return statusItem;
// };

/**
 * 统一状态配置 - 简化版
 */
export const STATUS_MAP: Record<number | string, StatusItem> = {
  0: { label: '待指示', color: '#09090b' },
  1: { label: '已发送', color: '#09090b' },
  2: { label: '待收', color: '#67c23a' },
  3: { label: '待取', color: '#e6a23c' },
  4: { label: '完成', color: '#09090b' },
  '-1': { label: '关闭', color: '#09090b' },
};

/**
 * 获取状态颜色
 * @param{number | string} code - 状态码
 * @returns{string} 状态颜色
 */
export const getStatusColor = (code: number | string): string => {
  return STATUS_MAP[code]?.color || '';
};

/**
 * 获取状态文案
 * @param{number | string} code - 状态码
 * @returns{string} 状态文案
 */
export const getStatusLabel = (code: number | string): string => {
  return STATUS_MAP[code]?.label || '';
};

/**
 * 获取状态信息
 * @param code - 状态码
 * @returns {label: string, color: string}
 */
export const getStatusInfo = (code: number | string): StatusItem => {
  const statusItem = STATUS_MAP[code];
  if (!statusItem) {
    return { label: '', color: '' };
  }
  return statusItem;
};
