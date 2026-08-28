# Mock数据添加规范与操作指南

## 1. 概述

本文档详细说明在项目中为新增接口添加mock数据的标准流程、文件结构要求及示例代码，确保前后端开发协同效率。

## 2. 适用场景

当开发者在项目中添加新接口后，需要为指定接口提供模拟数据时，应遵循本规范进行操作。

## 3. 操作步骤

### 3.1 添加接口mock数据

1.  打开文件：`apps\newrepo\src\mock\demoData.ts`
2.  按照接口路径和请求方式，添加对应mock数据结构
3.  确保数据格式与接口定义的响应结构完全一致
4.  添加必要的注释说明，包括接口功能、参数说明和返回值说明

### 3.2 更新菜单mock数据

1.  在同一文件中找到`/spd-api/sys/menu`接口的mock数据配置
2.  根据新接口对应的页面需求，在菜单数据中添加相应的菜单项
3.  确保菜单数据包含正确的路由路径、权限标识和显示名称

## 4. 示例代码

### 4.1 新增接口mock数据示例

```typescript
// apps\newrepo\src\mock\demoData.ts

// 导入必要的类型定义
import type { MockMethod } from 'vite-plugin-mock';

export default [
  // 已有的mock数据...

  // 新增接口示例：获取用户列表
  {
    url: '/spd-api/user/list', // 接口路径
    method: 'get', // 请求方法
    response: ({ query }) => {
      // 模拟分页参数处理
      const { page = 1, size = 10 } = query;

      // 返回模拟数据
      return {
        code: 200,
        message: 'success',
        data: {
          total: 100,
          list: Array.from({ length: Number(size) }, (_, i) => ({
            id: (Number(page) - 1) * Number(size) + i + 1,
            name: `用户${(Number(page) - 1) * Number(size) + i + 1}`,
            username: `user${(Number(page) - 1) * Number(size) + i + 1}`,
            email: `user${(Number(page) - 1) * Number(size) + i + 1}@example.com`,
            status: Math.random() > 0.5 ? 'active' : 'inactive',
            createdAt: new Date(
              Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
            ).toISOString(),
          })),
        },
      };
    },
  },

  // 其他新增接口...
] as MockMethod[];
```

### 4.2 菜单数据更新示例

```typescript
// apps\newrepo\src\mock\demoData.ts

// 在/spd-api/sys/menu接口中添加新页面菜单
{
  url: '/spd-api/sys/menu',
  method: 'get',
  response: () => {
    return {
      code: 200,
      message: 'success',
      data: {
        menus: [
          // 已有的菜单数据...

          // 新增页面菜单示例
          {
            id: "spd.web.user",
            text: '用户管理',
            label: '用户管理',
            path: '/user',
            url: 'user',
            component: 'Layout',
            icon: 'carbon:workspace',
            keepAlive: true,
            children: [
              {
                id: "spd.web.user.list",
                text: '用户列表',
                label: '用户列表',
                path: '/list',
                url: 'list',
                component: 'modules/spd/views/user/userList/index',
                icon: 'carbon:workspace',
                keepAlive: true,
              }
            ]
          }
        ]
      }
    };
  }
}
```

## 5. 质量检查清单

- [ ] mock数据结构与接口定义完全一致
- [ ] 包含必要的注释说明
- [ ] 菜单数据已正确添加
- [ ] 文档已正确保存并添加引用
- [ ] mock数据能够正常被前端应用获取和使用
