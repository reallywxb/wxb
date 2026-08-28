import type { CrudGridOptions } from '#/components/datatable';
import type { CrudColsType } from '#/types/datatable/useChcCrud';

const columns: CrudColsType = [
  { fixed: 'left', title: '选择', type: 'radio', width: 50, visible: false },
  { fixed: 'left', title: '序号', type: 'seq', width: 50 },
  { type: 'radio', visible: false },
  { field: 'id', title: '编码', minWidth: 100 },
  { field: 'title', title: '名称', minWidth: 100 },
  { field: 'tableName', title: '表名', minWidth: 100 },
  { field: 'from', title: 'from语句', minWidth: 100 },
  { field: 'where', title: 'where语句', minWidth: 100 },
  { field: 'groupBy', title: '分组语句', minWidth: 100 },
  { field: 'orderBy', title: '排序语句', minWidth: 100 },
  {
    field: 'readOnly',
    title: '只读',
    minWidth: 40,
    formatter: ({ cellValue }: any) => (cellValue ? '是' : '否'),
  },
  { field: 'version', title: '版本', minWidth: 60 },
  { field: 'remark', title: '备注', minWidth: 100 },
  {
    align: 'center',
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    width: 140,
    title: '操作',
  },
];

export const gridOptions: CrudGridOptions<any> = {
  proxyConfig: {
    autoLoad: true,
  },
  columns,
};

export const colGridOptions: CrudGridOptions<any> = {
  proxyConfig: {
    autoLoad: false,
  },
  pagerConfig: {
    enabled: false,
  },
  columns: [
    { fixed: 'left', title: '序号', type: 'seq', width: 50 },
    { field: 'id', title: '字段名', minWidth: 100 },
    {
      field: 'keyField',
      title: '关键字段',
      minWidth: 90,
      formatter: ({ cellValue }: any) => (cellValue ? '是' : '否'),
    },
    { field: 'fieldType', title: '字段类型', minWidth: 90 },
    { field: 'label', title: '字段标签', minWidth: 90 },
    { field: 'identifier', title: '标识字段', minWidth: 90 },
    { field: 'column', title: '列语句', minWidth: 120 },
    { field: 'precision', title: '字段精度', minWidth: 90, align: 'right' },
    {
      field: 'versionField',
      title: '版本字段',
      minWidth: 90,
      formatter: ({ cellValue }: any) => (cellValue ? '是' : '否'),
    },
    {
      field: 'multiValue',
      title: '多选',
      minWidth: 60,
      formatter: ({ cellValue }: any) => (cellValue ? '是' : '否'),
    },
    { field: 'defaultValue', title: '默认值', minWidth: 100 },
    {
      field: 'required',
      title: '是否必填',
      minWidth: 90,
      formatter: ({ cellValue }: any) => (cellValue ? '是' : '否'),
    },
    { field: 'dictId', title: '字典编码', minWidth: 100 },
    { field: 'dictUrl', title: '字典Url', minWidth: 100 },
    {
      field: 'dictPageSize',
      title: '字典分页数',
      minWidth: 100,
      align: 'right',
    },
    { field: 'maxLength', title: '最大长度', minWidth: 90, align: 'right' },
    { field: 'minLength', title: '最小长度', minWidth: 90, align: 'right' },
    { field: 'maxValue', title: '最大值', minWidth: 70, align: 'right' },
    { field: 'minValue', title: '最小值', minWidth: 70, align: 'right' },
    {
      field: 'sortable',
      title: '可排序',
      minWidth: 70,
      formatter: ({ cellValue }: any) => (cellValue ? '是' : '否'),
    },
    {
      field: 'virtual',
      title: '虚拟字段',
      minWidth: 90,
      formatter: ({ cellValue }: any) => (cellValue ? '是' : '否'),
    },
    { field: 'filterOperator', title: '查询操作符', minWidth: 100 },
    {
      field: 'filterMultiValue',
      title: '查询多选',
      minWidth: 90,
      formatter: ({ cellValue }: any) => (cellValue ? '是' : '否'),
    },
    { field: 'filterSql', title: '查询语句', minWidth: 90 },
    { field: 'remark', title: '备注', minWidth: 120 },
    {
      field: 'relationTable',
      title: '关系表名',
      minWidth: 100,
      visible: false,
    },
    {
      field: 'relationKeyColumn',
      title: '关系表我方主键',
      minWidth: 100,
      visible: false,
    },
    {
      field: 'relationMapKeyColumn',
      title: '关系表对方主键',
      minWidth: 100,
      visible: false,
    },
    { field: 'mapTable', title: '对方表名', minWidth: 100, visible: false },
    {
      field: 'mapTableKeyColumn',
      title: '对方表关键字段',
      minWidth: 100,
      visible: false,
    },
    {
      field: 'mapTableNameColumn',
      title: '对方表显示字段',
      minWidth: 100,
      visible: false,
    },
  ],
};

export const actionGridOptions: CrudGridOptions<any> = {
  proxyConfig: {
    autoLoad: false,
  },
  pagerConfig: {
    enabled: false,
  },
  columns: [
    { fixed: 'left', title: '序号', type: 'seq', width: 50 },
    { field: 'id', title: '编码', minWidth: 100 },
    { field: 'title', title: '名称', minWidth: 100 },
    {
      field: 'type',
      title: '类型',
      minWidth: 100,
      formatter({ cellValue }: any) {
        switch (cellValue) {
          case 'DOWNLOAD': {
            return '下载';
          }
          case 'PROCESS': {
            return '处理';
          }
          case 'UPLOAD': {
            return '上传';
          }
          default: {
            return cellValue;
          }
        }
      },
    },
    { field: 'actionUrl', title: '请求路径', minWidth: 100 },
    {
      field: 'inputParameters',
      title: '输入参数',
      minWidth: 100,
      formatter: ({ cellValue }: any) => cellValue?.length,
      align: 'right',
    },
    {
      field: 'outputParameter',
      title: '返回参数',
      minWidth: 100,
      formatter: ({ cellValue }: any) => cellValue?.fieldType,
    },
    { field: 'remark', title: '备注', minWidth: 100 },
    {
      align: 'center',
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      width: 100,
      title: '操作',
    },
  ],
};
