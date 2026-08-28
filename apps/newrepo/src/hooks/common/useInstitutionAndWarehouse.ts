import type { Component } from 'vue';

import { h } from 'vue';

import { Modal } from 'ant-design-vue';

import { switchOrg } from '#/api';

type ChooseInstitutionAndWarehouseForm = {
  form: {
    orgId?: number | string;
    orgName?: string;
    warehouseId?: number | string;
    warehouseName?: string;
  };
  isOrgChange: boolean;
  isWarehouseChange: boolean;
};

/**
 * 获取机构和仓库选择方法，该方法会自动弹出机构和仓库选择弹窗，并在关闭时返回选择的机构信息和仓库信息
 * @param comp 选择机构仓库弹窗内的渲染组件
 * @param options modal指令组件的配置项
 * @param showWarehouse 是否显示仓库选择
 */
export function useInstitutionAndWarehouse(
  comp: Component,
  options: any,
  showWarehouse: boolean = true,
) {
  /**
   * 弹出机构仓库弹窗方法
   * @param userInfo 用户信息
   * @param token 用户token 如果是在登录前操作，则不传token，登录后操作则需要传token
   */
  function openModal(
    userInfo: UserInfoExt,
    token?: string,
  ): Promise<ChooseInstitutionAndWarehouseForm> {
    return new Promise<ChooseInstitutionAndWarehouseForm>((resolve) => {
      async function submitModal(changeData: any) {
        // 如果机构id有变化，就需要调用切换机构的方法
        if (changeData.form.orgId && userInfo.orgId !== changeData.form.orgId) {
          await switchOrg(changeData.form.orgId, token);
        }
        _modal.destroy();
        resolve(changeData);
      }
      const _modal = Modal.confirm({
        title: h('span', { style: { display: 'none' } }, '1'),
        content: h(comp, {
          orgs: userInfo.orgs,
          orgId: userInfo.orgId,
          orgName: userInfo.orgName,
          warehouseId: userInfo.warehouseId || undefined,
          warehouseName: userInfo.warehouseName || undefined,
          username: userInfo.username,
          token,
          showWarehouse,
          onSubmit: submitModal,
        }),
        closable: true,
        wrapClassName: 'chooseInstitutionAndWarehouse-modal',
        okText: '确定',
        cancelText: '取消',
        mask: true,
        icon: h('span', { style: { display: 'none' } }, '1'),
        centered: true,
        footer: null,
        keyboard: false,
        width: '500px',
        ...options,
      });
    });
  }
  return { openModal };
}
