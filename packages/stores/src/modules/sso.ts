import { defineStore } from 'pinia';

interface AppState {
  /**
   * 是否从门户网站打开
   * @default false
   */
  isFromPortal?: boolean;
  /**
   * 是否隐藏头部
   * @default false
   */
  isHideHeader?: boolean;
  /**
   * 是否在门户网站内,一般情况下是iframe嵌套进的门户网站
   * @default false
   */
  isInPortal?: boolean;
  /**
   * menuRoot
   */
  menuRoot?: string;
}

export const useSsoStore = defineStore('chc-sso', {
  actions: {
    setIsInPortal(isInPortal: boolean) {
      this.isInPortal = isInPortal;
    },
    setIsFromPortal(isFromPortal: boolean) {
      this.isFromPortal = isFromPortal;
    },
    setIsHideHeader(isHideHeader: boolean) {
      this.isHideHeader = isHideHeader;
    },
    setMenuRoot(menuRoot: string) {
      this.menuRoot = menuRoot;
    },
  },
  persist: {
    pick: ['isInPortal', 'isHideHeader', 'isFromPortal', 'menuRoot'],
  },
  state: (): AppState => ({
    isInPortal: false,
    isHideHeader: false,
    isFromPortal: false,
    menuRoot: '',
  }),
});
