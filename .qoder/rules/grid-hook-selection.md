# 表格 Hook 选择规范

## 优先级：P1（推荐实践）

## 适用场景

创建包含表格的页面时。

## 规则描述

项目提供两个表格 Hook，根据业务场景选择：

| Hook | 导入路径 | 适用场景 |
|------|----------|----------|
| `useSpdGrid` | `#/components/spd` | SPD 业务接口（Content-Type 为 x-www-form-urlencoded） |
| `useChcGrid` | `#/adapter/chc-ui` | 通用场景、非标准 API、高度定制需求 |

### 选择决策

```
是否为 SPD 业务模块？
├── 是 → 使用 useSpdGrid
│   - 自动设置 Content-Type: application/x-www-form-urlencoded
│   - 自动处理 SPD API 入参/出参格式转换
│   - 配置更简洁
└── 否 → 使用 useChcGrid
    - 需手动配置请求头和参数处理
    - 灵活性更高
```

### useSpdGrid 基本用法

```typescript
import { useSpdGrid } from '#/components/spd';
import { deepMerge } from '#/utils/util';
import { formDefaultOptions, gridDefaultOptions } from '#/components/spd';

const [ParentGrid, parentGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, { /* 表单配置 */ }),
    gridOptions: deepMerge(gridDefaultOptions, { /* 表格配置 */ }),
  },
  {
    id: 'module.entity',
    queryUrl: 'entityAction/query.do?page=query',
    gridColumns: [ /* 列配置 */ ],
    formSchema: [ /* 搜索表单配置 */ ],
  },
);
```

### useChcGrid 基本用法

```typescript
import { useChcGrid } from '#/adapter/chc-ui';

const [ChcGrid, ChcGridApi] = useChcGrid(
  { formOptions: { /* 表单配置 */ } },
  {
    id: 'module.entity',
    queryUrl: 'entityAction/query.do',
    gridColumns: [ /* 列配置 */ ],
    formSchema: [ /* 搜索表单配置 */ ],
  },
  // 可选：自定义出参处理
  (res) => ({ total: res.total, records: res.data }),
  // 可选：自定义入参处理
  (params) => ({ ...params, page: params.current }),
);
```

## 注意事项

- 若无法判断使用哪个 Hook，**必须询问用户**
- 两者返回值结构相同：`[GridComponent, gridApi, extraMethods]`
- useSpdGrid 内部封装了 useChcGrid，二者不可嵌套使用
