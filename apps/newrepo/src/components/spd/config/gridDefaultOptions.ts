import type { VxeTablePropTypes } from 'vxe-table';
export const gridDefaultOptions = {
  checkboxConfig: {
    trigger: 'default',
    highlight: true,
  },
  exportConfig: {
    sheetMethod(params) {
      const { worksheet } = params;
      // 表头列宽：根据表头文字长度计算，防止表头换行；关键字段至少20列宽
      const KEY_COLUMNS = ['品名', '厂家', '规格', '供应商'];
      const headerRow = worksheet.getRow(1);
      let colIndex = 0;
      headerRow.eachCell((cell: any) => {
        const headerText = cell.value?.toString() || '';
        const isKeyColumn = KEY_COLUMNS.some((key) => headerText.includes(key));
        let displayLen = 0;
        for (let i = 0; i < headerText.length; i++) {
          displayLen += headerText.charCodeAt(i) > 127 ? 2 : 1;
        }
        const minWidth = isKeyColumn ? 20.625 : displayLen;
        worksheet.getColumn(colIndex + 1).width = Math.max(
          minWidth,
          displayLen,
        );
        colIndex++;
      });
      // 所有行统一字体：宋体、11号、纯黑色；表头加粗，内容不加粗
      headerRow.eachCell((excelCell: any) => {
        excelCell.font = {
          name: 'Arial',
          size: 10,
          // bold: true,
          color: {
            argb: 'FF000000',
          },
        };
      });
      // 数据行字体
      for (let r = 2; r <= worksheet.rowCount; r++) {
        const dataRow = worksheet.getRow(r);
        dataRow.eachCell((excelCell: any) => {
          excelCell.font = {
            name: 'Arial',
            size: 10,
            bold: false,
            color: {
              argb: 'FF000000',
            },
          };
          // 设置数字格式为文本格式（@），防止数字被当作数值/日期处理
          // 例如：前导零不丢失（如 "001" 不会变成 "1"）
          excelCell.numFmt = '@';
        });
      }
      // 表头行固定居中样式
      headerRow.eachCell((excelCell: any) => {
        excelCell.alignment = {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: false,
        };
      });
      // 数据行：无对齐样式时使用默认（左对齐、垂直居中）
      for (let r = 2; r <= worksheet.rowCount; r++) {
        const dataRow = worksheet.getRow(r);
        dataRow.eachCell((excelCell: any) => {
          if (!excelCell.alignment) {
            excelCell.alignment = {
              horizontal: 'left',
              vertical: 'middle',
              wrapText: false,
            };
          }
        });
      }
      // 统一行高为14
      for (let r = 1; r <= worksheet.rowCount; r++) {
        worksheet.getRow(r).height = 14;
      }
    },
  } as VxeTablePropTypes.ExportConfig,
};
