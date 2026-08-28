# 新增功能实现 - Drawer模式

## 功能模块概述

Drawer模式是一种从屏幕边缘滑出的面板，用于展示新增表单。它相比弹窗模式，具有更大的空间来展示复杂表单，同时保持页面上下文可见，提供更好的用户体验。

### 应用场景

- 新增表单字段较多，需要较大空间展示
- 希望保持主页面上下文可见
- 操作流程需要与主页面有更紧密的联系
- 移动端设备上的新增操作

### 业务价值

- 提供更大的表单填写空间，减少滚动
- 保持用户操作上下文，提高操作连贯性
- 响应式设计，适配不同屏幕尺寸
- 减少页面跳转，提升用户体验

## 核心实现原理

### 技术架构

- 基于Ant Design Vue的Drawer组件
- 结合Vben框架的Form组件实现表单功能
- 使用ref管理Drawer的显示/隐藏状态
- 利用computed计算属性处理表单状态
- 通过事件机制与父组件通信

### 数据流程

1. 用户点击新增按钮，触发Drawer显示
2. 初始化表单数据，设置默认值
3. 用户填写表单数据
4. 点击提交按钮，触发表单验证
5. 验证通过后，调用API提交数据
6. 提交成功后，关闭Drawer并刷新表格数据
7. 提交失败后，显示错误信息

### 关键算法

- 表单验证算法：使用Vben的Form组件内置验证规则
- 数据提交算法：封装API调用，处理成功/失败回调
- 状态管理算法：使用ref和computed管理Drawer和表单状态

## 标准实现步骤

### 前置条件与环境要求

- 项目已集成Ant Design Vue组件库
- 项目已集成Vben框架的Form组件
- 已配置好API接口

### 实现步骤

1. **引入必要组件**

   - 引入Ant Design Vue的Drawer组件
   - 引入Vben的Form组件和相关表单控件

2. **定义Drawer状态**

   - 使用ref定义Drawer的显示/隐藏状态
   - 使用ref定义表单数据

3. **配置Drawer属性**

   - 设置Drawer的标题、宽度、遮罩等属性
   - 配置Drawer的关闭事件处理

4. **构建表单结构**

   - 使用Vben的Form组件构建表单
   - 定义表单项和验证规则

5. **实现提交逻辑**

   - 编写提交按钮的点击事件处理函数
   - 实现表单验证和API调用

6. **处理回调事件**
   - 实现提交成功后的回调处理
   - 实现关闭Drawer后的清理工作

## 完整代码示例

### 基本Drawer配置

```vue
<template>
  <div class="app-container">
    <!-- 新增按钮 -->
    <Button type="primary" @click="openDrawer"> 新增 </Button>

    <!-- 新增Drawer -->
    <Drawer
      v-model:visible="drawerVisible"
      title="新增数据"
      placement="right"
      :width="800"
      :mask="true"
      :mask-closable="false"
      @close="handleClose"
    >
      <BasicForm
        :model="formData"
        :schema="formSchema"
        :show-action-button-group="false"
      >
        <template #action>
          <Button @click="handleClose">取消</Button>
          <Button type="primary" @click="handleSubmit">提交</Button>
        </template>
      </BasicForm>
    </Drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { BasicForm } from '@/components/ui/basic-form';
import { Button, Drawer } from '@/components/ui';

// Drawer状态
const drawerVisible = ref(false);

// 表单数据
const formData = reactive({
  name: '',
  code: '',
  status: 1,
  description: '',
});

// 表单配置
const formSchema = [
  {
    field: 'name',
    component: 'Input',
    label: '名称',
    required: true,
    rules: [
      {
        required: true,
        message: '请输入名称',
      },
    ],
  },
  {
    field: 'code',
    component: 'Input',
    label: '编码',
    required: true,
    rules: [
      {
        required: true,
        message: '请输入编码',
      },
    ],
  },
  {
    field: 'status',
    component: 'Select',
    label: '状态',
    required: true,
    defaultValue: 1,
    props: {
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 },
      ],
    },
  },
  {
    field: 'description',
    component: 'Input.TextArea',
    label: '描述',
    props: {
      rows: 4,
    },
  },
];

// 打开Drawer
const openDrawer = () => {
  // 重置表单数据
  Object.keys(formData).forEach((key) => {
    formData[key] = '';
  });
  formData.status = 1;
  drawerVisible.value = true;
};

// 关闭Drawer
const handleClose = () => {
  drawerVisible.value = false;
};

// 提交表单
const handleSubmit = async () => {
  try {
    // 这里应该调用API提交数据
    console.log('提交表单数据:', formData);

    // 模拟API调用成功
    setTimeout(() => {
      drawerVisible.value = false;
      // 这里可以触发父组件的刷新方法
      console.log('提交成功');
    }, 1000);
  } catch (error) {
    console.error('提交失败:', error);
  }
};
</script>

<style scoped>
.app-container {
  padding: 20px;
}
</style>
```

### 自定义Drawer配置

```vue
<template>
  <div class="app-container">
    <!-- 新增按钮 -->
    <Button type="primary" @click="openDrawer">
      新增
    </Button>

    <!-- 自定义新增Drawer -->
    <Drawer
      v-model:visible="drawerVisible"
      title="新增数据"
      placement="right"
      :width="900"
      :mask="true"
      :mask-closable="false"
      :closable="true"
      :destroy-on-close="true"
      @close="handleClose"
    >
      <div class="drawer-content">
        <BasicForm
          :model="formData"
          :schema="formSchema"
          :show-action-button-group="false"
          @submit="handleSubmit"
        >
          <template #action>
            <Space>
              <Button @click="handleClose">取消</Button>
              <Button type="primary" html-type="submit">提交</Button>
            </a-space>
          </template>
        </BasicForm>
      </div>
    </Drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { BasicForm } from '@/components/ui/basic-form';
import { Button, Drawer, Space } from '@/components/ui';

// Drawer状态
const drawerVisible = ref(false);

// 表单数据
const formData = reactive({
  name: '',
  code: '',
  status: 1,
  category: '',
  price: 0,
  description: ''
});

// 表单配置
const formSchema = [
  {
    field: 'name',
    component: 'Input',
    label: '名称',
    required: true,
    rules: [
      {
        required: true,
        message: '请输入名称'
      }
    ]
  },
  {
    field: 'code',
    component: 'Input',
    label: '编码',
    required: true,
    rules: [
      {
        required: true,
        message: '请输入编码'
      }
    ]
  },
  {
    field: 'category',
    component: 'Select',
    label: '分类',
    required: true,
    props: {
      options: [
        { label: '分类1', value: 'category1' },
        { label: '分类2', value: 'category2' },
        { label: '分类3', value: 'category3' }
      ]
    }
  },
  {
    field: 'price',
    component: 'InputNumber',
    label: '价格',
    required: true,
    props: {
      min: 0,
      precision: 2
    },
    rules: [
      {
        required: true,
        message: '请输入价格'
      }
    ]
  },
  {
    field: 'status',
    component: 'Switch',
    label: '状态',
    defaultValue: true
  },
  {
    field: 'description',
    component: 'Input.TextArea',
    label: '描述',
    props: {
      rows: 4
    }
  }
];

// 打开Drawer
const openDrawer = () => {
  // 重置表单数据
  Object.keys(formData).forEach(key => {
    formData[key] = '';
  });
  formData.status = true;
  formData.price = 0;
  drawerVisible.value = true;
};

// 关闭Drawer
const handleClose = () => {
  drawerVisible.value = false;
};

// 提交表单
const handleSubmit = async (values: any) => {
  try {
    // 这里应该调用API提交数据
    console.log('提交表单数据:', values);

    // 模拟API调用成功
    setTimeout(() => {
      drawerVisible.value = false;
      // 这里可以触发父组件的刷新方法
      console.log('提交成功');
    }, 1000);
  } catch (error) {
    console.error('提交失败:', error);
  }
};
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.drawer-content {
  padding: 0 24px 24px;
}
</style>
```

## 组件/API说明

### 核心组件

#### 1. a-drawer

- **类型**: 组件
- **说明**: Ant Design Vue的抽屉组件，用于从屏幕边缘滑出的面板
- **主要属性**:
  - `v-model:visible`: 控制Drawer的显示/隐藏
  - `title`: Drawer的标题
  - `placement`: Drawer的弹出方向，可选值：`left`, `right`, `top`, `bottom`
  - `width`: Drawer的宽度，默认300px
  - `mask`: 是否显示遮罩，默认true
  - `mask-closable`: 点击遮罩是否可关闭，默认true
  - `closable`: 是否显示关闭按钮，默认true
  - `destroy-on-close`: 关闭时是否销毁Drawer内容，默认false
- **事件**:
  - `close`: Drawer关闭时触发

#### 2. BasicForm

- **类型**: 组件
- **说明**: Vben框架的基础表单组件，用于快速构建表单
- **主要属性**:
  - `model`: 表单数据对象
  - `schema`: 表单配置 schema
  - `show-action-button-group`: 是否显示默认操作按钮组，默认true
- **事件**:
  - `submit`: 表单提交时触发

### 工具函数

#### 1. ref

- **类型**: 函数
- **说明**: Vue 3的响应式API，用于创建响应式引用
- **参数**: 初始值
- **返回值**: 响应式引用对象

#### 2. reactive

- **类型**: 函数
- **说明**: Vue 3的响应式API，用于创建响应式对象
- **参数**: 普通对象
- **返回值**: 响应式对象

## 常见问题与解决方案

### 1. Drawer关闭后表单数据未重置

**问题**: 关闭Drawer后，再次打开时表单数据仍然保持上次的值 **解决方案**: 在打开Drawer时手动重置表单数据

```javascript
// 打开Drawer
const openDrawer = () => {
  // 重置表单数据
  Object.keys(formData).forEach((key) => {
    formData[key] = '';
  });
  // 设置默认值
  formData.status = 1;
  drawerVisible.value = true;
};
```

### 2. Drawer内容高度超出屏幕

**问题**: 当表单字段较多时，Drawer内容可能超出屏幕高度 **解决方案**: 设置Drawer的`body-style`属性，添加滚动

```vue
<Drawer
  v-model:visible="drawerVisible"
  title="新增数据"
  placement="right"
  :width="800"
  :body-style="{ height: 'calc(100vh - 100px)', overflow: 'auto' }"
>
  <!-- 表单内容 -->
</Drawer>
```

### 3. 表单验证失败后Drawer自动关闭

**问题**: 表单验证失败后，Drawer自动关闭 **解决方案**: 确保在提交函数中正确处理验证失败的情况

```javascript
const handleSubmit = async () => {
  try {
    // 验证表单
    const valid = await formRef.value?.validate();
    if (!valid) return;

    // 提交数据
    // ...
  } catch (error) {
    console.error('验证失败:', error);
    // 不要关闭Drawer
  }
};
```

### 4. Drawer打开时遮罩层闪烁

**问题**: Drawer打开时遮罩层出现闪烁现象 **解决方案**: 使用CSS优化遮罩层的过渡效果

```css
/* 在全局样式中添加 */
.ant-drawer-mask {
  transition: opacity 0.3s ease;
}

.ant-drawer-content-wrapper {
  transition: transform 0.3s ease;
}
```

### 5. 移动端适配问题

**问题**: 在移动端设备上，Drawer可能显示不正常 **解决方案**: 使用响应式设计，根据屏幕尺寸调整Drawer宽度

```javascript
import { ref, onMounted, onUnmounted } from 'vue';

const drawerWidth = ref(800);

const handleResize = () => {
  if (window.innerWidth < 768) {
    drawerWidth.value = window.innerWidth;
  } else {
    drawerWidth.value = 800;
  }
};

onMounted(() => {
  handleResize();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
```

## 最佳实践

1. **合理设置Drawer宽度**: 根据表单复杂度和屏幕尺寸，设置合适的Drawer宽度
2. **使用destroy-on-close**: 对于复杂表单，设置`destroy-on-close`为true，避免内存泄漏
3. **添加加载状态**: 在提交表单时，显示加载状态，提升用户体验
4. **表单验证**: 充分利用Vben的表单验证功能，确保数据合法性
5. **错误处理**: 完善的错误处理机制，确保提交失败时能给用户明确的反馈
6. **响应式设计**: 针对不同屏幕尺寸，优化Drawer的显示效果
7. **键盘导航**: 支持键盘操作，如Enter提交、Esc关闭
8. **无障碍访问**: 确保Drawer组件支持无障碍访问标准

## 总结

Drawer模式是一种灵活、用户友好的新增功能实现方式，特别适合处理复杂的表单操作。通过合理的配置和优化，可以为用户提供流畅、直观的操作体验。在实际开发中，应根据具体业务场景选择合适的新增模式，以达到最佳的用户体验效果。
