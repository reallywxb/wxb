# useChcGrid 与 useSpdGrid 技术分析

## 核心功能与设计理念

### useChcGrid

**核心功能**：

- 通用表格组件生成器，提供完整的CRUD功能
- 支持搜索表单、数据表格、分页、排序等基础功能
- 集成权限控制、数据处理、参数格式化等高级特性
- 支持自定义表单配置、表格配置和事件监听

**设计理念**：

- 提供通用的表格解决方案，适用于各种业务场景
- 高度可配置，支持灵活的定制化需求
- 集成了项目的权限管理、API调用等基础能力
- 采用函数式编程风格，通过Hook方式提供组件生成能力

### useSpdGrid

**核心功能**：

- 基于useChcGrid的业务表格组件生成器
- 针对SPD业务场景优化的表格解决方案
- 提供默认的表单和表格配置
- 集成了SPD业务特有的API参数处理逻辑

**设计理念**：

- 为SPD业务场景提供开箱即用的表格组件
- 简化SPD业务开发，减少重复配置
- 统一SPD业务的表格样式和行为
- 保持与useChcGrid的兼容性，同时提供业务特定的优化

## 详细差异对比

| 特性 | useChcGrid | useSpdGrid |
| --- | --- | --- |
| **基础定位** | 通用表格组件生成器 | SPD业务专用表格组件生成器 |
| **实现方式** | 直接封装useChcCrud | 封装useChcGrid，添加SPD业务特定配置 |
| **默认配置** | 基础默认配置 | 合并SPD业务默认配置 |
| **API请求头** | 无默认请求头 | 默认设置`Content-Type: application/x-www-form-urlencoded` |
| **参数处理** | 需手动配置 | 自动处理SPD API参数格式 |
| **出参转换** | 需手动配置 | 自动处理records/rows字段转换 |
| **入参转换** | 需手动配置 | 自动处理分页和排序参数 |
| **适用场景** | 通用业务场景 | 特定SPD业务场景 |
| **灵活性** | 高度灵活，可定制性强 | 针对SPD业务优化，配置更简洁 |
| **依赖关系** | 依赖useChcCrud | 依赖useChcGrid |

## 内部实现机制

### useChcGrid 实现流程

1. **配置合并**：合并用户配置与默认配置
2. **表单处理**：处理搜索表单、查看表单、添加表单、编辑表单的配置
3. **权限集成**：集成项目的权限管理系统
4. **API集成**：集成项目的API调用能力
5. **组件生成**：调用useChcCrud生成表格组件
6. **返回结果**：返回生成的表格组件和相关API

### useSpdGrid 实现流程

1. **配置合并**：合并用户配置与SPD业务默认配置
2. **请求配置**：设置默认的请求头和参数处理
3. **调用useChcGrid**：传入SPD特定的配置和参数处理函数
4. **返回结果**：返回useChcGrid的结果

## 应用场景与使用条件

### useChcGrid 适用场景

1. **通用业务场景**：适用于非SPD业务的表格需求
2. **高度定制化需求**：需要高度定制表格行为和样式的场景
3. **跨业务模块**：需要在多个业务模块中使用相同表格逻辑的场景
4. **非标准API**：API参数格式与SPD标准格式不同的场景

### useSpdGrid 适用场景

1. **SPD业务场景**：适用于SPD模块的表格需求
2. **标准SPD API**：使用SPD标准API格式的场景
3. **快速开发**：需要快速搭建SPD业务表格的场景
4. **统一风格**：需要保持SPD业务表格风格一致的场景

## 性能考量与选择建议

### 性能考量

1. **配置复杂度**：useSpdGrid由于提供了默认配置，配置复杂度更低
2. **API处理**：useSpdGrid自动处理API参数，减少手动处理的开销
3. **代码复用**：useSpdGrid在SPD业务中代码复用率更高
4. **维护成本**：useSpdGrid在SPD业务中的维护成本更低

### 选择建议

1. **SPD业务开发**：优先使用useSpdGrid，享受开箱即用的便利
2. **非SPD业务**：使用useChcGrid，获得更大的灵活性
3. **复杂定制需求**：使用useChcGrid，获得更多的定制空间
4. **快速原型开发**：使用useSpdGrid，快速搭建业务表格
5. **跨业务模块**：使用useChcGrid，确保不同业务模块的一致性

## 实际使用示例

### useSpdGrid 使用示例

```vue
<template>
  <ParentGrid>
    <template #toolbar-actions>
      <Button
        type="primary"
        @click="handleExport"
        class="mr-[0.5rem]"
        data-testid="button_export"
      >
        导出
        <template #icon>
          <ExportActionIcon />
        </template>
      </Button>
    </template>
  </ParentGrid>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { Button } from 'ant-design-vue';
import { ExportActionIcon } from '@vben/chc-icons';
import { useSpdGrid } from '#/components/spd';
import { deepMerge } from '#/utils/util';
import { formDefaultOptions, gridDefaultOptions } from '#/components/spd';

// 初始化表格，从useSpdGrid返回值中解构出handleExport函数
const [ParentGrid, parentGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      commonConfig: {
        labelClass: 'w-[90px]',
      },
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
    }),
  },
  {
    id: 'invoiceQuery',
    queryUrl: 'invoiceAction/query.do?page=query',
    gridColumns: [
      // 列配置...
    ],
    formSchema: [
      // 表单配置...
    ],
  },
);
</script>
```

### useChcGrid 使用示例

```typescript
import { useChcGrid } from '#/adapter/chc-ui';
import { deepMerge } from '#/utils/util';
import { formDefaultOptions, gridDefaultOptions } from '#/adapter/config';

// 初始化表格
const [CustomGrid, customGridApi, { handleExport }] = useChcGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      // 表单配置...
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      // 表格配置...
    }),
  },
  {
    id: 'customGrid',
    queryUrl: 'customAction/query.do',
    gridColumns: [
      // 列配置...
    ],
    formSchema: [
      // 表单配置...
    ],
  },
  (res: any) => {
    // 自定义出参处理
    return {
      total: res.total,
      records: res.data,
    };
  },
  (params: any) => {
    // 自定义入参处理
    return {
      ...params,
      page: params.current,
      size: params.size,
    };
  },
);
```

## 最佳实践

### useSpdGrid 最佳实践

1. **标准配置**：使用默认的formDefaultOptions和gridDefaultOptions作为基础
2. **API格式**：遵循SPD标准API格式，确保queryUrl正确
3. **权限配置**：根据业务需求配置permissions.export等权限
4. **事件处理**：合理使用gridEvents处理表格事件
5. **自定义按钮**：使用#toolbar-actions插槽添加自定义按钮

### useChcGrid 最佳实践

1. **配置管理**：合理组织表单和表格配置，保持代码清晰
2. **参数处理**：根据API要求实现合适的入参和出参处理函数
3. **权限集成**：正确配置权限，确保功能安全性
4. **组件复用**：抽象通用配置，提高代码复用率
5. **性能优化**：合理使用缓存和懒加载，提高表格性能

## 总结

useChcGrid和useSpdGrid是项目中用于生成表格组件的两个核心Hook，它们各有特点和适用场景：

- **useChcGrid**：通用表格组件生成器，提供高度的灵活性和定制性，适用于各种业务场景。
- **useSpdGrid**：SPD业务专用表格组件生成器，提供开箱即用的配置和优化，适用于SPD业务场景。

在选择使用哪个Hook时，应根据具体的业务需求和场景来决定：

- 对于SPD业务模块，且API请求头需要设置`Content-Type: application/x-www-form-urlencoded`，必须使用useSpdGrid，享受其开箱即用的便利和针对SPD业务的优化。
- 对于非SPD业务模块或需要高度定制的场景，推荐使用useChcGrid，获得更大的灵活性和定制空间。

若根据用户需求无法直接判断使用哪个Hook，请使用以下格式向开发者提问：

> 您希望使用哪种网格组件？
>
> - `useChcGrid`：适合通用的表格场景。
> - `useSpdGrid`：适合spd相关业务接口逻辑，且API请求头需要设置`Content-Type: application/x-www-form-urlencoded`的场景。
>
> 请告知您的选择，或者提供更多关于数据复杂度、交互需求的信息，以便我为您推荐。

无论选择哪个Hook，都应遵循项目的编码规范和最佳实践，确保代码的可维护性和可扩展性。
