<script setup lang="ts">
import { createIconifyIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';

/**
 * 暂无权限页面组件
 * 用于显示用户没有访问权限时的提示页面
 */
defineOptions({
  name: 'NoAuthUser',
});

// 创建权限图标组件
const LockIcon = createIconifyIcon('ph:lock-light');
</script>

<template>
  <Page
    content-class="p-[0.5rem] box-border"
    auto-content-height
    header-class="px-3 py-2"
  >
    <div class="box-border flex h-full w-full items-center justify-center">
      <!-- 主要内容区域 -->
      <div class="no-auth-content">
        <!-- 权限图标 -->
        <div class="icon-container">
          <LockIcon class="no-auth-icon" />
        </div>

        <!-- 文字内容 -->
        <div class="text-content">
          <h1 class="title">暂无权限</h1>
          <p class="description">
            抱歉，您没有权限访问此页面。请联系管理员获取相应权限。
          </p>
        </div>
      </div>
    </div>
  </Page>
</template>

<style scoped>
@media (max-width: 768px) {
  .no-auth-content {
    padding: 2rem 1.5rem;
    margin: 1rem;
  }

  .title {
    font-size: 1.5rem;
  }

  .description {
    font-size: 0.9rem;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .no-auth-content {
    background: #2d3748;
    border: 1px solid #4a5568;
  }

  .no-auth-icon {
    color: #a0aec0;
  }

  .title {
    color: #f7fafc;
  }

  .description {
    color: #cbd5e0;
  }
}

.no-auth-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 500px;
  padding: 3rem 2rem;
  text-align: center;
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgb(0 0 0 / 10%);
}

.icon-container {
  margin-bottom: 10px;
}

.no-auth-icon {
  width: 64px;
  height: 64px;
  color: #6c757d;
}

.text-content {
  margin-bottom: 0;
}

.title {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.75rem;
  font-weight: 600;
  color: #343a40;
}

.description {
  margin: 0;
  font-size: 1rem;
  line-height: 1.5;
  color: #6c757d;
}
</style>
