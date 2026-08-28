import type { Component } from 'vue';

import { h } from 'vue';

import { Modal } from 'ant-design-vue';

export function useAsyncModal() {
  /**
   * 获取机构和仓库选择方法，该方法会自动弹出机构和仓库选择弹窗，并在关闭时返回选择的机构信息和仓库信息
   * @param comp 选择机构仓库弹窗内的渲染组件
   * @param compOptions modal内部自定义组件的配置项
   * @param options modal指令组件的配置项
   */
  function openModal<T = any>(
    comp: Component,
    compOptions: any,
    options: any,
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const _modal = Modal.confirm({
        title: h('span', { style: { display: 'none' } }, '1'),
        content: h(comp, {
          ...compOptions,
          onSubmit: (val) => {
            compOptions.onSubmit && compOptions.onSubmit(resolve, _modal, val);
            _modal.destroy();
            resolve(val);
          },
          onCancel: (val) => {
            compOptions.onCancel && compOptions.onCancel(resolve, _modal, val);
            _modal.destroy();
            resolve(val);
          },
        }),
        closable: true,
        wrapClassName: 'async-modal',
        okText: '确定',
        cancelText: '取消',
        mask: true,
        icon: h('span', { style: { display: 'none' } }, '1'),
        centered: true,
        footer: null,
        keyboard: false,
        width: '600px',
        ...options,
        onCancel: () => {
          options.onCancel && options.onCancel(reject);
        },
      });
    });
  }
  return { openModal };
}
