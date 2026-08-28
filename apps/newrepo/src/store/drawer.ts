/*
 * @Date: 2022-08-25 14:13:11
 * @LastEditors: StavinLi 495727881@qq.com
 * @LastEditTime: 2023-05-24 15:00:32
 * @FilePath: /Workflow-Vue3/src/store/drawer.js
 */
import { defineStore } from 'pinia';

export const useStore = defineStore('drawerStore', {
  state: () => ({
    promoterDrawer: false,

    approverDrawer: false,

    delayDrawer: false,

    approverConfigData: {},

    delayConfigData: {},
    starterConfigData: {},
    copyerDrawer: false,

    copyerConfig1: {},

    conditionDrawer: false,
    conditionsConfig1: {
      conditionNodes: [],
    },
  }),
  actions: {
    setPromoter(payload: any) {
      this.promoterDrawer = payload;
    },

    setApprover(payload: any) {
      this.approverDrawer = payload;
    },

    setDelay(payload: any) {
      this.delayDrawer = payload;
    },

    setApproverConfig(payload: any) {
      this.approverConfigData = payload;
    },

    setDelayConfig(payload: any) {
      this.delayConfigData = payload;
    },

    setStarterConfig(payload: any) {
      this.starterConfigData = payload;
    },
    setCopyer(payload: any) {
      this.copyerDrawer = payload;
    },

    setCopyerConfig(payload: any) {
      this.copyerConfig1 = payload;
    },
    setCondition(payload: any) {
      this.conditionDrawer = payload;
    },
    setConditionsConfig(payload: any) {
      this.conditionsConfig1 = payload;
    },
  },
});
