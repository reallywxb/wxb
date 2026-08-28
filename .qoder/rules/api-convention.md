# API 封装规范

## 优先级：P1（推荐实践）

## 适用场景

编写 API 接口文件（`api.ts`）时。

## 规则描述

### 请求客户端选择

| 客户端 | Content-Type | 适用场景 |
|--------|-------------|----------|
| `requestFormClient` | `application/x-www-form-urlencoded` | SPD 业务接口（绝大多数场景） |
| `requestClient` | `application/json` | 现代 RESTful 接口、复杂嵌套数据 |

**SPD 业务统一使用 `requestFormClient`**。

### 导入方式

```typescript
import { requestFormClient } from '#/api/request';
// 或
import { requestClient } from '#/api/request';
```

### 命名规范

- **函数名**：小驼峰，动词+名词结构（`getOrderList`、`saveLine`、`deleteUser`）
- **接口类型**：大驼峰（`OrderPlanStorage`、`UserListResponse`）
- **参数**：小驼峰，语义化（`orderId`、`productCode`）

### 文件模板

```typescript
import { requestFormClient } from '#/api/request';

// 响应数据接口定义
interface ResponseData {
  success: boolean;
  msg?: string;
  // 业务字段...
}

/**
 * 接口功能描述
 * @param params 请求参数说明
 */
export const apiFunction = (params: any) => {
  return requestFormClient.post<ResponseData>('/xxxAction/method.do', params);
};
```

### SPD 接口 URL 特征

- 通常以 `Action` 结尾的类名 + `.do` 后缀
- 示例：`/orderPlanAction/queryStorage.do`、`/invoiceAction/query.do?page=query`
- 分页查询常带 `?page=query` 参数

## 注意事项

- 接口与业务逻辑分离，api.ts 中只放接口定义
- 为响应数据定义 TypeScript 接口类型
- 错误处理：全局由拦截器处理网络错误，业务错误在调用处 try-catch
