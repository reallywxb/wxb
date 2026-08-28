export function genVbenGridOption(option) {
  const vbenCols = [
    { align: 'center', fixed: 'left', minWidth: 50, type: 'checkbox' },
    { fixed: 'left', minWidth: 50, title: '序号', type: 'seq' },
  ];

  /*      "label": "消息时间",
      "prop": "msgTime",
      "searchOperator": "between",
      "type": "datetime",
      "sortable": true,
      "overHidden": true,
      "width": 150,
      "format": "yyyy-MM-dd HH:mm:ss",
      "valueFormat": "yyyy-MM-dd HH:mm:ss",
      "fieldType": "Date",
      "rules": [
        {
          "required": true,
          "message": "请选择消息时间",
          "trigger": "blur"
        }
      ],
      search: true,
      more: true //显示时间范围
    },
    {
      "label": "消息类型",
      "prop": "msgType",
      "searchOperator": "like",
      "type": "select",
      "sortable": true,
      "overHidden": true,
      "width": 120,
      "dicUrl": "/dict/itemList/edi.message.msgType",
      "optionColumns":
            [
                {
                    "name": 'label',
                    "header": '名称',
                    "width" : 150
                },
                {
                "name": 'value',
                "header": '编码',
                "width" : 300
                }
        ],
      "fieldType": "String",
      "rules": [
        {
          "required": true,
          "message": "请选择消息类型",
          "trigger": "blur"
        }
      ],
      "searchFilterable": true,
      search: true
*/

  option.column.forEach((column) => {
    const vbenCol = {};
    vbenCol.field = column.prop;
    vbenCol.title = column.label;
    vbenCol.component = column.type;
    vbenCol.sortable = column.sortable;
    vbenCol.width = column.width;
    if (column.labelProp) {
      vbenCol.formatter = (params) => {
        return params.row[column.labelProp];
      };
    } else if (column.type == 'switch') {
      vbenCol.formatter = (params) => {
        return params.cellValue ? '是' : '否';
      };
    }
    if (column.hide) vbenCol.visible = false;
    vbenCol.showOverflow = column.overHidden;
    vbenCols.push(vbenCol);
  });
  vbenCols.push([
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'name',
          // onClick: onActionClick,
        },
        name: 'CellMenu',
        options: [
          'view',
          {
            code: 'edit',
            text: '编辑',
          },
          {
            code: 'delete',
            text: '删除',
          },
        ],
      },
      field: 'action',
      fixed: 'right',
      width: 150,
      title: '操作',
    },
  ]);
  const vbenOption = {
    checkboxConfig: {
      highlight: true,
      labelField: 'name',
    },
    columnConfig: {
      drag: true,
    },
    columns: vbenCols,
    proxyConfig: {
      ajax: {
        query: async ({ page }, queryParams) => {
          const res = await queryData({
            current: page.currentPage,
            size: page.pageSize,
            ...queryParams,
          });
          currentParams.value = {
            pageInfo: {
              current: page.currentPage,
              size: page.pageSize,
              total: res.total,
            },
            params: {
              ...queryParams,
            },
          };
          return {
            total: res.total,
            items: res.records,
          };
        },
      },
    },
  };
  return vbenOption;
}

export function genVbenSearchOption(option, schema = []) {
  const vbenCols = [];

  /*      "label": "消息时间",
      "prop": "msgTime",
      "searchOperator": "between",
      "type": "datetime",
      "sortable": true,
      "overHidden": true,
      "width": 150,
      "format": "yyyy-MM-dd HH:mm:ss",
      "valueFormat": "yyyy-MM-dd HH:mm:ss",
      "fieldType": "Date",
      "rules": [
        {
          "required": true,
          "message": "请选择消息时间",
          "trigger": "blur"
        }
      ],
      search: true,
      more: true //显示时间范围
    },
    {
      "label": "消息类型",
      "prop": "msgType",
      "searchOperator": "like",
      "type": "select",
      "sortable": true,
      "overHidden": true,
      "width": 120,
      "dicUrl": "/dict/itemList/edi.message.msgType",
      "optionColumns":
            [
                {
                    "name": 'label',
                    "header": '名称',
                    "width" : 150
                },
                {
                "name": 'value',
                "header": '编码',
                "width" : 300
                }
        ],
      "fieldType": "String",
      "rules": [
        {
          "required": true,
          "message": "请选择消息类型",
          "trigger": "blur"
        }
      ],
      "searchFilterable": true,
      search: true
*/

  option.column.forEach((column) => {
    const vbenCol = {};
    vbenCol.field = column.prop;
    vbenCol.title = column.label;
    vbenCol.component = column.type;
    vbenCol.sortable = column.sortable;
    vbenCol.width = column.width;
    if (column.labelProp) {
      vbenCol.formatter = (params) => {
        return params.row[column.labelProp];
      };
    }
    if (column.hide) vbenCol.visible = false;
    vbenCol.showOverflow = column.overHidden;
    vbenCols.push(vbenCol);
  });
  const vbenOption = {
    checkboxConfig: {
      highlight: true,
      labelField: 'name',
    },
    columnConfig: {
      drag: true,
    },
    columns: vbenCols.filter(({ field }) =>
      schema.some(({ fieldName, label }) => fieldName === field && label),
    ),
  };
  return vbenOption;
}

export function genVbenFormOption(option) {
  const vbenCols = [];

  /*      "label": "消息时间",
      "prop": "msgTime",
      "searchOperator": "between",
      "type": "datetime",
      "sortable": true,
      "overHidden": true,
      "width": 150,
      "format": "yyyy-MM-dd HH:mm:ss",
      "valueFormat": "yyyy-MM-dd HH:mm:ss",
      "fieldType": "Date",
      "rules": [
        {
          "required": true,
          "message": "请选择消息时间",
          "trigger": "blur"
        }
      ],
      search: true,
      more: true //显示时间范围
    },
    {
      "label": "消息类型",
      "prop": "msgType",
      "searchOperator": "like",
      "type": "select",
      "sortable": true,
      "overHidden": true,
      "width": 120,
      "dicUrl": "/dict/itemList/edi.message.msgType",
      "optionColumns":
            [
                {
                    "name": 'label',
                    "header": '名称',
                    "width" : 150
                },
                {
                "name": 'value',
                "header": '编码',
                "width" : 300
                }
        ],
      "fieldType": "String",
      "rules": [
        {
          "required": true,
          "message": "请选择消息类型",
          "trigger": "blur"
        }
      ],
      "searchFilterable": true,
      search: true
*/

  option.column.forEach((column) => {
    const vbenCol = {};
    vbenCol.field = column.prop;
    vbenCol.title = column.label;
    vbenCol.component = column.type;
    vbenCol.sortable = column.sortable;
    vbenCol.width = column.width;
    if (column.labelProp) {
      vbenCol.formatter = (params) => {
        return params.row[column.labelProp];
      };
    }
    if (column.hide) vbenCol.visible = false;
    vbenCol.showOverflow = column.overHidden;
    vbenCols.push(vbenCol);
  });
  const vbenOption = {
    checkboxConfig: {
      highlight: true,
      labelField: 'name',
    },
    columnConfig: {
      drag: true,
    },
    columns: vbenCols,
  };
  return vbenOption;
}
