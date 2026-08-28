import type { CrudColsType } from '#/types/datatable/useChcCrud';

/**
 *
 * @param columns 表格展示的列，扩展了dict属性，用于显示字典值和isHide属性，用于控制列的显示隐藏
 * @returns 返回一个数组，第一个元素是用来传给接口用的，第二个元素是用来展示表格列
 */
export const handleDataTabelColumns = (
  columns: CrudColsType,
): [any[], CrudColsType] => {
  const cols = columns
    .filter((item) => item.field)
    .map((e) => {
      return { dict: e.dict, id: e.field };
    });
  const gridColumns = columns
    .filter((item) => !item.isHide)
    .map((e) => {
      return e.dict && e.field
        ? {
            ...e,
            formatter: ({ row }: any) => {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              return row[`${e.field}_name`] || row[e.field!];
            },
          }
        : e;
    });

  return [cols, gridColumns];
};

/**
 *
 * @param columns 新的grid表格展示的列，扩展了dict属性，用于显示字典值和isHide属性，用于控制列的显示隐藏
 * @returns 返回一个数组，第一个元素是用来传给接口用的，第二个元素是用来展示表格列
 */
export const handleCommonGridColumns = (
  columns: CrudColsType,
): [any[], CrudColsType] => {
  const cols = columns
    .filter((item) => item.isHide)
    .map((e) => {
      return { dict: e.dict, id: e.field };
    });
  const gridColumns = columns
    .filter((item) => !item.isHide)
    .map((e) => {
      return e.dict && e.field
        ? {
            ...e,
            formatter: ({ row }: any) => {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              return row[`${e.field}_name`] || row[e.field!];
            },
          }
        : e;
    });

  return [cols, gridColumns];
};
