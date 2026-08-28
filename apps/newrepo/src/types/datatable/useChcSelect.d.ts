type ApiType = 'get' | 'post';
type QueryDataList = {
  current?: number;
  queryParams?: any | null;
  querySql?: any | null;
  records: any[];
  size?: number;
  summaryRecords?: any | null;
  total?: number;
};

type TableScope = {
  $rowIndex: number;
  row: any;
};
type GetAllTableDataParams = {
  pageInfo: {
    current: number;
    size: number;
    total: number;
  };
  params: {
    [key: string]: any;
    cols: { dict?: boolean; id: string };
    sort: string[];
  };
};

type SelectValue = number | number[] | string | string[] | undefined;
// 下拉菜单默认类
type SelectData = {
  [key: string]: any;
  class?: string;
  disabled?: boolean;
  key?: string;
  label: string;
  value: null | number | string | undefined;
};

type SelectList = SelectData[];

type SelectOptionColumns = {
  align?: 'center' | 'left' | 'right';
  header: string;
  name: string;
  width: number;
}[];
type SelectComponentRef = {
  fetchApi?: () => void;
  params?: {
    dependencies?: Record<string, any>;
    dictUrl: string;
  };
};
