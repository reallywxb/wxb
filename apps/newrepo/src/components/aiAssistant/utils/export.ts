/**
 * @date 2026-08-05
 * @prompt 实现表格导出 Excel 功能，参考 Layui 版实现
 * @description 通过隐藏表单 POST 提交到后端导出接口，下载 Excel 文件
 */

/**
 * 导出表格数据到 Excel
 * 通过隐藏表单 POST 提交到后端导出接口
 *
 * @param data 表格数据数组
 * @param columns 列名数组
 * @param title 导出文件名
 */
export function exportToExcel(
  data: Record<string, any>[],
  columns: string[],
  title: string,
): void {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = '/spd-api/aIChatAction/exportExcel.do';
  form.style.display = 'none';

  const dataInput = document.createElement('input');
  dataInput.type = 'hidden';
  dataInput.name = 'data';
  dataInput.value = JSON.stringify(data);
  form.appendChild(dataInput);

  const columnsInput = document.createElement('input');
  columnsInput.type = 'hidden';
  columnsInput.name = 'columns';
  columnsInput.value = JSON.stringify(columns);
  form.appendChild(columnsInput);

  const titleInput = document.createElement('input');
  titleInput.type = 'hidden';
  titleInput.name = 'title';
  titleInput.value = title;
  form.appendChild(titleInput);

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}
