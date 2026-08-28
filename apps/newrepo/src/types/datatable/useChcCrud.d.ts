type TableData<T> = {
  records: T[];
  total: number;
};

type FormatterObj = {
  cellValue: boolean | Date | number | string;
  column: any;
  columnIndex: number;
  row: any;
  rowIndex: number;
};

type CrudColType = ColumnType & {
  dict?: boolean;
  isHide?: boolean;
};

type CrudColsType = CrudColType[];
