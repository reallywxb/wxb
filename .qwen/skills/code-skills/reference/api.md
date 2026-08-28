# API 接口封装文档

## 1. 接口封装标准与最佳实践

### 1.1 基本原则

- **统一入口**：所有 API 接口通过统一的 `request` 实例进行调用，确保请求配置的一致性
- **类型安全**：使用 TypeScript 接口定义请求参数和返回数据类型，提高代码可维护性
- **模块化**：按功能模块组织 API 文件，每个模块对应一个独立的 API 文件
- **错误处理**：统一的错误处理机制，确保 API 调用异常能够被正确捕获和处理
- **命名规范**：遵循一致的命名规范，使 API 函数名清晰表达其功能

### 1.2 最佳实践

- **接口分离**：将 API 接口与业务逻辑分离，便于维护和测试
- **参数验证**：在 API 调用前进行参数验证，确保数据的有效性
- **响应处理**：对 API 响应进行统一处理，提取核心数据
- **缓存策略**：对于频繁调用的接口，考虑实现缓存机制
- **请求重试**：对于网络不稳定的场景，实现请求重试机制

## 2. API 文件目录结构约定

### 2.1 目录结构

```
apps/newrepo/src/views/modules/
└── spd/                  # 模块名称
    └── views/            # 视图目录
        └── purchase/     # 根菜单目录
            ├── purchasePlan/     # 子菜单目录
            │   ├── buyPlan/      # 功能页面目录
            │   │   ├── api.ts    # 页面接口封装文件
            │   │   └── index.vue # 页面主文件
            │   └── ...
            └── ...
```

### 2.2 目录命名规则

- **根菜单目录**：对应系统中的一级菜单，使用语义化的英文名称
- **子菜单目录**：对应系统中的二级菜单，使用语义化的英文名称
- **功能页面目录**：对应具体的功能页面，使用语义化的英文名称
- **API 文件**：使用 `api.ts`（TypeScript）或 `api.js`（JavaScript）命名

### 2.3 目录结构示例

以采购模块为例：

```
apps/newrepo/src/views/modules/spd/views/purchase/
├── purchasePlan/     # 采购计划
│   ├── buyPlan/      # 采购计划-购买计划
│   │   ├── api.ts
│   │   └── index.vue
│   ├── salePlan/     # 采购计划-销售计划
│   │   ├── api.ts
│   │   └── index.vue
│   └── ...
├── purchaseOrder/    # 采购订单
│   ├── orderList/    # 采购订单-订单列表
│   │   ├── api.ts
│   │   └── index.vue
│   └── ...
└── ...
```

## 3. 接口实现示例

### 3.1 基础结构

```typescript
import { requestFormClient } from '#/api/request';

// 定义响应数据接口
interface ResponseData {
  // 响应数据结构
}

// 定义 API 函数
export const apiFunction = (params: any) => {
  return requestFormClient.post<ResponseData>('/api/endpoint', params);
};
```

### 3.2 完整示例

参考 `apps/newrepo/src/views/modules/spd/views/purchase/purchasePlan/buyPlan/api.ts` 文件：

```typescript
import { requestFormClient } from '#/api/request';

// 存储信息接口
interface OrderPlanStorage {
  level_Day: number;
  level_Max: number;
  level_Min: number;
  level_Replenish: number;
  pricePo: number;
  productId: number;
  qtyOnHand: number;
  qtyOrdered: number;
  qtyOrdering: number;
  success: boolean;
  vendorId: number;
  vendorName: string;
  warehouseId: number;
}

// 获取存储信息
export const getOrderPlanStorage = (params: any) => {
  return requestFormClient.post<OrderPlanStorage>(
    '/orderPlanAction/queryStorage.do',
    params,
  );
};

// 订单计划行信息接口
interface OrderPlanLineInfo {
  rows: {
    [key: string]: any;
    baseUOMQty: string;
    defaultVendorCode: string;
    defaultVendorId: number;
    defaultVendorName: string;
    // 更多字段...
  }[];
  success: boolean;
  msg: string;
}

// 查询订单计划行信息
export const queryOrderPlanLineInfo = (params: any) => {
  return requestFormClient.post<OrderPlanLineInfo>(
    '/orderPlanAction/queryLine.do?page=edit&showStorage=Y&limit=100000',
    params,
  );
};

// 保存行数据
export const saveLine = (params: any) => {
  return requestFormClient.post<any>('/orderPlanAction/saveLine.do', params);
};

// 保存数据
export const saveDo = (params: any) => {
  return requestFormClient.post<any>('/orderPlanAction/save.do', params);
};

// 失效/取消
export const invalidateCancel = (params: any) => {
  return requestFormClient.post<any>('/orderPlanAction/invalidate.do', params);
};

// 数据提交
export const dataCommit = (params: any) => {
  return requestFormClient.post<any>('/orderPlanAction/commit.do', params);
};

// 复制计划
export const copyPlan = (params: any) => {
  return requestFormClient.post<any>(
    '/orderPlanAction/createByOrderPlan.do',
    params,
  );
};

// 创建 MO 计划
export const createMoPlan = (params: any) => {
  return requestFormClient.post<any>('/autoPlanAction/createPoPlan.do', params);
};
```

## 4. API 函数与参数命名规范

### 4.1 函数命名规范

- **使用小驼峰命名法**：例如 `getOrderPlanStorage`、`saveLine`
- **动词+名词结构**：清晰表达函数的功能，例如 `get`、`query`、`save`、`delete` 等
- **语义化**：函数名应准确反映其实现的功能，避免使用模糊的命名

### 4.2 参数命名规范

- **使用小驼峰命名法**：例如 `orderId`、`productCode`
- **语义化**：参数名应清晰表达其含义
- **类型明确**：使用 TypeScript 类型定义参数类型，提高代码可读性和类型安全性

### 4.3 接口命名规范

- **使用大驼峰命名法**：例如 `OrderPlanStorage`、`ProductVendor`
- **语义化**：接口名应准确反映其数据结构
- **后缀**：对于响应数据接口，可以使用 `Response` 或具体业务名称作为后缀

## 5. API 调用错误处理方法

### 5.1 全局错误处理

在 `#/api/request` 中实现全局错误处理，统一处理网络错误、服务器错误等：

```typescript
// 示例：request.ts 中的错误处理
import axios from 'axios';

const requestClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
});

// 请求拦截器
requestClient.interceptors.request.use(
  (config) => {
    // 添加请求头、token 等
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 响应拦截器
requestClient.interceptors.response.use(
  (response) => {
    // 处理成功响应
    return response.data;
  },
  (error) => {
    // 处理错误响应
    if (error.response) {
      // 服务器返回错误状态码
      console.error('API Error:', error.response.data);
      // 可以根据状态码进行不同的处理
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error('Network Error:', error.request);
    } else {
      // 请求配置出错
      console.error('Request Error:', error.message);
    }
    return Promise.reject(error);
  },
);

export { requestClient };
```

### 5.2 局部错误处理

在组件中调用 API 时，使用 try-catch 捕获错误：

```typescript
import { getOrderPlanStorage } from './api';

const fetchStorage = async () => {
  try {
    const params = { productId: 123, warehouseId: 456 };
    const response = await getOrderPlanStorage(params);
    // 处理成功响应
    if (response.success) {
      // 业务逻辑处理
    } else {
      // 业务错误处理
      console.error('Business Error:', response.msg);
    }
  } catch (error) {
    // 捕获网络错误等
    console.error('API Call Error:', error);
    // 显示错误提示
  }
};
```

### 5.3 错误处理最佳实践

- **分层处理**：全局处理网络错误，局部处理业务错误
- **错误提示**：对用户友好的错误提示，避免直接显示技术错误信息
- **错误日志**：记录错误日志，便于问题排查
- **重试机制**：对于网络不稳定的场景，实现请求重试机制
- **超时处理**：设置合理的请求超时时间，避免长时间等待

## 6. 接口封装模板

### 6.1 基础模板

```typescript
import { requestFormClient } from '#/api/request';

// 定义响应数据接口
interface ApiResponse {
  success: boolean;
  msg?: string;
  // 其他字段...
}

// API 函数
export const apiFunction = (params: any) => {
  return requestFormClient.post<ApiResponse>('/api/endpoint', params);
};
```

### 6.2 完整模板

```typescript
import { requestFormClient } from '#/api/request';

// 定义请求参数接口
interface RequestParams {
  // 参数定义
}

// 定义响应数据接口
interface ResponseData {
  // 响应数据定义
}

/**
 * 接口描述
 * @param params 请求参数
 * @returns 响应数据
 */
export const apiFunction = (params: RequestParams) => {
  return requestFormClient.post<ResponseData>('/api/endpoint', params);
};
```

## 7. 常见问题与解决方案

### 7.1 跨域问题

**问题**：API 调用时出现跨域错误

**解决方案**：

- 在后端配置 CORS 允许跨域请求
- 使用代理服务器转发请求
- 在开发环境中配置 Vite 代理

### 7.2 认证问题

**问题**：API 调用时出现认证失败

**解决方案**：

- 确保在请求头中添加正确的认证信息
- 检查 token 是否过期，实现 token 刷新机制
- 统一处理认证失败的情况

### 7.3 性能问题

**问题**：API 调用响应缓慢

**解决方案**：

- 优化 API 接口，减少响应数据大小
- 实现请求缓存，避免重复请求
- 使用异步请求，避免阻塞主线程
- 合理设置请求超时时间

### 7.4 错误处理问题

**问题**：API 错误处理不当，导致用户体验差

**解决方案**：

- 实现全局错误处理机制
- 对用户友好的错误提示
- 记录详细的错误日志
- 实现错误重试机制

## 8. requestFormClient 与 requestClient 的区别

### 8.1 核心差异对比

| 特性 | requestFormClient | requestClient |
| --- | --- | --- |
| Content-Type | `application/x-www-form-urlencoded; charset=UTF-8` | `application/json; charset=UTF-8` |
| 数据格式 | 键值对形式 (key1=value1&key2=value2) | JSON 格式 ({"key1": "value1", "key2": "value2"}) |
| 适用场景 | 传统表单提交、后端接口要求 form-data 格式 | 现代 RESTful API、前后端分离架构 |
| 参数传递 | 自动转换为 URL 编码的字符串 | 保持 JSON 格式不变 |
| 数据大小限制 | 受 URL 长度限制（通常 2048 字符） | 无明显限制 |

### 8.2 请求头配置差异

**requestFormClient**：

```typescript
export const requestFormClient = createRequestClient(apiURL, {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
  },
  responseReturn: 'data',
});
```

**requestClient**：

```typescript
export const requestClient = createRequestClient(apiURL, {
  headers: {
    'Content-Type': 'application/json; charset=UTF-8',
  },
  responseReturn: 'data',
});
```

### 8.3 数据格式处理方式

**requestFormClient**：

- 数据会被转换为 URL 编码的键值对形式
- 适合提交简单的表单数据
- 后端需要使用相应的解析方式处理这种格式

**requestClient**：

- 数据保持 JSON 格式不变
- 适合提交复杂的嵌套数据结构
- 后端需要使用 JSON 解析器处理这种格式

### 8.4 适用场景分析

**requestFormClient 适用场景**：

1. 与传统后端系统集成，特别是使用 Java Servlet、PHP 等传统技术栈的后端
2. 后端接口明确要求使用 `application/x-www-form-urlencoded` 格式
3. 提交简单的表单数据，没有复杂的嵌套结构
4. 与第三方支付接口、认证接口等集成，这些接口通常要求 form-data 格式

**requestClient 适用场景**：

1. 现代 RESTful API 接口
2. 前后端分离架构，使用 JSON 作为数据交换格式
3. 提交复杂的嵌套数据结构，如包含数组、对象等
4. 需要传递大量数据的场景

### 8.5 参数传递机制

**requestFormClient**：

- 参数会被自动转换为 URL 编码的字符串
- 对于复杂数据结构，需要手动处理嵌套关系
- 示例：
  ```typescript
  // 输入
  const params = { name: 'John', age: 30, address: { city: 'Beijing' } };
  // 转换后发送的数据
  ('name=John&age=30&address%5Bcity%5D=Beijing');
  ```

**requestClient**：

- 参数保持 JSON 格式不变
- 直接发送原始 JSON 数据
- 示例：
  ```typescript
  // 输入
  const params = { name: 'John', age: 30, address: { city: 'Beijing' } };
  // 发送的数据
  {"name": "John", "age": 30, "address": {"city": "Beijing"}}
  ```

### 8.6 响应处理逻辑

两个客户端的响应处理逻辑相同，都使用了相同的响应拦截器：

1. **默认响应拦截器**：处理响应数据格式，提取核心数据
2. **认证响应拦截器**：处理 token 过期、刷新等认证相关逻辑
3. **错误消息响应拦截器**：处理错误消息，显示错误提示

### 8.7 选择指南

**优先选择 requestFormClient 的情况**：

1. 后端接口明确要求使用 `application/x-www-form-urlencoded` 格式
2. 与传统后端系统集成
3. 提交简单的表单数据
4. 与第三方支付接口、认证接口等集成

**优先选择 requestClient 的情况**：

1. 现代 RESTful API 接口
2. 前后端分离架构
3. 提交复杂的嵌套数据结构
4. 需要传递大量数据的场景
5. 后端使用 JSON 解析器处理数据

### 8.8 代码示例

**使用 requestFormClient**：

```typescript
import { requestFormClient } from '#/api/request';

// 定义响应数据接口
interface LoginResponse {
  success: boolean;
  token: string;
  userInfo: {
    id: number;
    name: string;
  };
}

// 登录接口
export const login = (params: { username: string; password: string }) => {
  return requestFormClient.post<LoginResponse>('/auth/login.do', params);
};

// 使用示例
const handleLogin = async () => {
  try {
    const response = await login({ username: 'admin', password: '123456' });
    if (response.success) {
      // 处理登录成功
      localStorage.setItem('token', response.token);
    }
  } catch (error) {
    // 处理错误
  }
};
```

**使用 requestClient**：

```typescript
import { requestClient } from '#/api/request';

// 定义响应数据接口
interface UserListResponse {
  success: boolean;
  data: {
    list: {
      id: number;
      name: string;
      email: string;
    }[];
    total: number;
    page: number;
    pageSize: number;
  };
}

// 获取用户列表
export const getUserList = (params: {
  page: number;
  pageSize: number;
  keyword?: string;
  filters?: {
    status: number;
    roleId: number;
  };
}) => {
  return requestClient.post<UserListResponse>('/user/list', params);
};

// 使用示例
const fetchUserList = async () => {
  try {
    const response = await getUserList({
      page: 1,
      pageSize: 10,
      keyword: 'John',
      filters: {
        status: 1,
        roleId: 2,
      },
    });
    if (response.success) {
      // 处理用户列表数据
      console.log(response.data.list);
    }
  } catch (error) {
    // 处理错误
  }
};
```

### 8.9 最佳实践建议

1. **根据后端要求选择**：优先根据后端接口的要求选择合适的客户端
2. **保持一致性**：在同一项目中，尽量保持使用相同的客户端类型，减少混用
3. **明确接口文档**：在 API 文档中明确标注接口使用的 Content-Type
4. **错误处理**：无论使用哪种客户端，都要实现完善的错误处理机制
5. **数据验证**：在发送请求前，对数据进行验证，确保数据格式正确
6. **性能考虑**：对于大量数据的传输，优先使用 requestClient
7. **安全性**：对于敏感数据，确保使用 HTTPS 协议传输

## 9. 总结

API 接口封装是前端开发中的重要环节，良好的接口封装可以提高代码的可维护性、可读性和可测试性。通过遵循统一的规范和最佳实践，可以确保 API 调用的一致性和可靠性，从而提升整个应用的质量和用户体验。

在实际开发中，应根据具体的业务需求和技术栈，选择合适的接口封装方式，并不断优化和改进，以适应不断变化的业务需求。同时，要根据后端接口的要求，正确选择使用 requestFormClient 或 requestClient，确保数据传输的正确性和效率。
