/**
 * @date 2026-08-05
 * @prompt 切换为非流式接口 /spd-api/aIChatAction/chat.do，返回完整 JSON
 * @description 改造 MockSSEResponse，从 SSE 流式改为标准 JSON 请求，参考 Layui 版传参格式
 */
import { useAccessStore } from '@vben/stores';

import { message } from 'ant-design-vue';

import { AI_MODEL_CHECK_URL } from '#/const';
import { useAuthStore } from '#/store';

export class MockSSEResponse {
  abortController: AbortController;

  constructor() {
    this.abortController = new AbortController();
  }

  /**
   * 发送请求并返回完整 JSON 响应
   * @param inputValue 用户输入内容
   * @returns 后端返回的 JSON 数据
   */
  async getResponse(inputValue: string): Promise<any> {
    const accessStore = useAccessStore();
    const authStore = useAuthStore();

    const res = await fetch('/spd-api/aIChatAction/chat.do', {
      signal: this.abortController.signal,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        msg: inputValue,
      }).toString(),
    });

    if (!res.ok) {
      if (res.status === 401) {
        message.error('登录已过期，请重新登录');
        authStore.logout();
      }
      throw new Error(res.statusText);
    }

    return await res.json();
  }
}
