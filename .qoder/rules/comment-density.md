# 代码注释率要求

## 优先级：P0（必须遵守）

## 适用场景

所有 AI 生成的 `.vue`、`.ts`、`.tsx` 文件。

## 规则描述

- 代码注释量应达到约 **30%**
- 注释使用**中文**编写
- 注释应覆盖：
  - 函数/方法的功能说明
  - 复杂逻辑的解释
  - 关键变量的用途
  - 配置项的含义
  - 业务规则的背景

## 示例

```typescript
// 定义表单依赖关系，用于部门下拉框根据机构选择动态加载
const deptIdDependencies = ref({ orgId: '' });

/**
 * 处理操作列按钮点击事件
 * @param code 操作编码（view/edit/delete/log 或自定义编码）
 * @param row 当前行数据
 */
function onActionClick({ code, row }: OnActionClickParams) {
  switch (code) {
    // 重置密码为自定义操作，需调用独立接口
    case 'resetPassword': {
      handleResetPassword(row);
      break;
    }
    default: {
      break;
    }
  }
}
```

## 注意事项

- 避免无意义的注释（如 `// 定义变量`）
- 注释应解释"为什么"而非"是什么"
- 配置对象中的每个关键字段都应有注释说明其用途
