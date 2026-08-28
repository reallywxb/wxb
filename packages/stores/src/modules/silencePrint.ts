import type { Socket } from 'socket.io-client';

import type { Router } from 'vue-router';

import { message } from 'ant-design-vue';
import CryptoJS from 'crypto-js';
import dayjs from 'dayjs';
import { acceptHMRUpdate, defineStore } from 'pinia';
import { io } from 'socket.io-client';

import { notSilencePrintPdf } from '../utils/print';

const ENCRYPT_KEY = 'chcitchcitchcitx';
const encryptStr = (data: string, key: string) => {
  const newKey = CryptoJS.enc.Latin1.parse(key);
  const iv = newKey;
  // 加密
  const encrypted = CryptoJS.AES.encrypt(data, newKey, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.ZeroPadding,
  });
  const result = encrypted.toString();

  return result;
};
type PrinterDefaultOptions = {
  /**
   * 纸张方向
   * @default landscape
   * @enum landscape横向 portrait竖向
   */
  orientation?: 'landscape' | 'portrait';
  /**
   * 纸张类型
   */
  paperName?: string;
  /**
   * 纸张类型
   */
  paperSize?: string;
  /**
   * 打印机名称
   */
  printer?: string;
  /**
   * 缩放
   * @default noscale
   * @enum fit 适应 noscale 不缩放 shrink 缩小
   */
  scale?: 'fit' | 'noscale' | 'shrink';
  /**
   * 打印类型
   * @default url_pdf
   * @enum url_pdf pdf链接打印 pdf html转pdf打印 undefined html打印
   */
  type?: 'pdf' | 'url_pdf' | undefined;
};
type printOpt = {
  [key: string]: any;
  pdf_path: string;
};
type ClientInfo = null | {
  arch: string;
  clientUrl: string;
  hostname: string;
  ip: string;
  ipv6: string;
  mac: string;
  machineId: string;
  nickName: string;
  platform: string;
  version: string;
};
type Printer = {
  isDefault: boolean;
  name: string;
};

interface AppState {
  /**
   * 客户端信息
   *{
   * "hostname": "DESKTOP-UV4JSS8",
   * "version": "1.0.12-beta9",
   * "platform": "win32",
   * "arch": "x64",
   * "mac": "00:ff:cd:bf:b2:6c",
   * "ip": "2.0.0.1",
   * "ipv6": "fe80::a270:8f1e:b194:1d2f",
   * "clientUrl": "http://2.0.0.1:17521",
   * "machineId": "865ac181-4227-44a2-a7c0-738dea343a0b",
   * "nickName": ""
   *}
   */
  clientInfo: ClientInfo | null;
  /**
   * 是否之前打开过应用链接
   */
  hasOpenSchemaUrl: boolean;
  /**
   * 是否已打开静默打印功能
   * @default false
   */
  isOpenSilencePrint: boolean;

  /**
   * 用于存储本地数据
   */
  namespace?: string;
  /**
   * 非静默 打印pdf方法
   */
  // notSilencePrintPdfFn?: (
  //   url: string,
  //   params?: any,
  // ) => Promise<null> | undefined;
  /**
   * 打印准备中
   * @default true
   */
  onPreparing?: boolean;
  /**
   * 打印中
   */
  onPrinting?: boolean;
  /**
   * 打印机默认配置
   */
  printerDefaultOptions: PrinterDefaultOptions;
  /**
   * 可使用的打印机列表
   * @default []
   */
  printers: Printer[];
  /**
   * 当前打印socket实例
   * @default false
   */
  printSocket: null | Socket<any, any>;
  /**
   * 路由实例
   */
  routerInstance: null | Router;
}

export const useGlobalPrintStore = defineStore('core-global-print', {
  actions: {
    initPrintStatus(
      namespace: string,
      CAN_USE_SILENCE_PRINT: boolean = false,
      routerInstance: null | Router,
    ) {
      this.routerInstance = routerInstance;
      this.namespace = namespace;
      if (CAN_USE_SILENCE_PRINT) {
        // 初始化是否静默打印字段
        this.isOpenSilencePrint =
          sessionStorage.getItem(`${namespace}-isOpenSilencePrint`) === '1';
        // 初始化是否打开过跳转链接字段
        this.hasOpenSchemaUrl =
          sessionStorage.getItem(`${namespace}-hasOpenSchemaUrl`) === '1';
        // 初始化打印默认配置字段
        const printerDefaultOptionsStr = sessionStorage.getItem(
          `${namespace}-printerDefaultOptions`,
        );
        const options = printerDefaultOptionsStr
          ? JSON.parse(printerDefaultOptionsStr)
          : {};
        this.setPrinterDefaultOptions(options);

        if (this.isOpenSilencePrint) {
          this.onPrinting = false;
          this.openPrintSocket();
        } else {
          this.onPreparing = false;
          this.onPrinting = false;
        }
      } else {
        // 初始化是否静默打印字段
        sessionStorage.setItem(`${namespace}-isOpenSilencePrint`, '0');
        this.isOpenSilencePrint = false;
        // 初始化是否打开过跳转链接字段
        sessionStorage.setItem(`${namespace}-hasOpenSchemaUrl`, '0');
        this.hasOpenSchemaUrl = false;
        this.onPreparing = false;
        this.onPrinting = false;
      }
    },
    async openPrintSocket(isToToggle?: boolean) {
      this.onPreparing = true;
      return new Promise((resolve) => {
        this.printSocket = io('http://localhost:17521') as Socket<any, any>;

        this.printSocket.on('connect_error', this.handleConnectError);
        this.printSocket.on('connect', () => {
          if (isToToggle) {
            message.success('静默打印功能已开启，正在准备打印服务！');
          }
          if (this.onPreparing) {
            this.printSocket?.once('printerList', (printers: Printer[]) => {
              this.printers = printers;
              // 此时根据默认打印机配置内是否有打印机选项，如果没有就使用默认打印机
              if (
                this.printers &&
                this.printers.length > 0 &&
                !this.printerDefaultOptions.printer
              ) {
                this.setPrinterDefaultOptions({
                  printer: this.printers.find((printer) => printer.isDefault)
                    ?.name,
                });
              }
              this.printSocket?.once('clientInfo', (clientInfo: ClientInfo) => {
                this.onPreparing = false;
                this.onPrinting = false;
                this.clientInfo = clientInfo;
                message.success('打印服务已准备完毕，可以开始打印！');
                resolve({
                  clientInfo,
                  printers,
                  printSocket: this.printSocket,
                });
              });
            });
          } else {
            message.success('打印服务已连接');
          }
        });
        this.printSocket.on('disconnect', () => {
          this.onPreparing = true;
          this.onPrinting = false;
          message.warn('打印服务已断连，请检查hiprint应用状态');
        });
      });
    },
    handleConnectError() {
      if (this.printSocket?.active) {
        message.error('打印服务连接失败，请检查hiprint应用状态');
        // 打开app,只提醒一次
        if (!this.hasOpenSchemaUrl) {
          this.setHasOpenSchemaUrl(true);
          setTimeout(() => {
            window.open('hiprint://');
          }, 1000);
        }
        // temporary failure, the socket will automatically try to reconnect
      } else {
        message.error('打印链接请求被拒绝，请检查打印服务配置');
        // the connection was denied by the server
        // in that case, `socket.connect()` must be manually called in order to reconnect
      }
    },
    closePrintSocket() {
      return new Promise((resolve) => {
        this.onPreparing = false;
        this.onPrinting = false;
        this.printSocket?.removeAllListeners();
        this.printSocket?.close();
        this.printSocket = null;
        message.success('静默打印功能已关闭！');
        resolve(true);
      });
    },
    print(opt: printOpt) {
      if (!opt || !opt.pdf_path) {
        return console.error('打印参数异常', opt);
      }
      if (this.isOpenSilencePrint) {
        this.onPrinting = true;
        this.singlePrintTask(opt)
          .then((res) => {
            message.success(`${res.msg}`);
            this.onPrinting = false;
          })
          .catch((error) => {
            message.error(`${error.message}`);
            this.onPrinting = false;
          });
      } else {
        this.onPrinting = true;
        this.notSilenceSinglePrintTask(opt)
          .then(() => {
            this.onPrinting = false;
          })
          .catch((error) => {
            message.error(`${error.message}`);
            this.onPrinting = false;
          });
        // console.warn(
        //   '当前用户未开启静默打印!!!\nglobalPrintStore.print属于静默打印方法，需配合静默打印功能使用，用户未打开静默打印的场景下请自行定义打印方法！\n就是根据globalPrintStore.isOpenSilencePrint判断下，如果为true，使用globalPrintStore.print方法，否则使用自定义的打印方法',
        // );
      }
    },
    async batchPrint(optArr: printOpt[]) {
      if (this.isOpenSilencePrint) {
        if (!optArr || optArr.length <= 0) {
          console.error('批量打印参数传递错误', optArr);
          return;
        }
        this.onPrinting = true;
        try {
          for (const [i, element] of optArr.entries()) {
            await this.singlePrintTask(element, optArr.length !== 1, i);
          }
          optArr.length === 1
            ? message.success(`打印成功`)
            : message.success(`批量打印完成`);
          this.onPrinting = false;
        } catch {
          this.onPrinting = false;
        }
      } else {
        if (!optArr || optArr.length <= 0) {
          console.error('批量打印参数传递错误', optArr);
          return;
        }
        this.onPrinting = true;
        try {
          for (const [, element] of optArr.entries()) {
            await this.notSilenceSinglePrintTask(element);
          }
          this.onPrinting = false;
        } catch {
          this.onPrinting = false;
        }
        // console.warn(
        //   '当前用户未开启静默打印!!!\nglobalPrintStore.batchPrint属于静默打印方法，需配合静默打印功能使用，用户未打开静默打印的场景下请自行定义打印方法！\n就是根据globalPrintStore.isOpenSilencePrint判断下，如果为true，使用globalPrintStore.batchPrint方法，否则使用自定义的打印方法',
        // );
      }
    },
    singlePrintTask(
      opt: printOpt,
      isBatchPrint: boolean = false,
      index: number = -1,
    ) {
      const nowStamp = dayjs().format('YYYY-MM-DD HH:mm:ss');
      const pdfPath = `${opt.pdf_path}${opt.pdf_path.includes('?') ? '&' : '?'}timestamp=${encodeURIComponent(nowStamp)}&sign=${encodeURIComponent(encryptStr(nowStamp, ENCRYPT_KEY))}`;
      const defaultOpt = {
        client: this.printSocket?.id,
        ...this.printerDefaultOptions,
      };
      const defaultPrinter = this.printers.find((item) => item.isDefault);
      return new Promise<{ msg: string }>((resolve, reject) => {
        // console.log('打印参数', {
        //   printer: defaultPrinter?.name,
        //   ...defaultOpt,
        //   ...opt,
        //   pdf_path: pdfPath,
        // });
        this.printSocket?.emit('news', {
          printer: defaultPrinter?.name,
          ...defaultOpt,
          ...opt,
          pdf_path: pdfPath,
        });
        this.printSocket?.once('success', (res: { msg: string }) => {
          if (isBatchPrint) {
            message.success(`第${index + 1}条标签打印成功`);
          }
          resolve(res);
        });
        this.printSocket?.once('error', (res: { msg: string }) => {
          if (isBatchPrint) {
            message.error(
              `第${index + 1}条标签打印失败，失败原因为：${res.msg}`,
            );
          }
          reject(res);
        });
      });
    },
    notSilenceSinglePrintTask(opt: printOpt) {
      return new Promise((resolve, reject) => {
        const nowStamp = dayjs().format('YYYY-MM-DD HH:mm:ss');
        const handleUrl = (tableId: string) => {
          return tableId.includes('?')
            ? `${tableId}&_menuPageAction=print&_menuPageId=${this.routerInstance?.currentRoute.meta.menuPageId}`
            : `${tableId}?_menuPageAction=print&_menuPageId=${this.routerInstance?.currentRoute.meta.menuPageId}`;
        };
        const pdfPath = `${opt.pdf_path}${opt.pdf_path.includes('?') ? '&' : '?'}timestamp=${encodeURIComponent(nowStamp)}&sign=${encodeURIComponent(encryptStr(nowStamp, ENCRYPT_KEY))}`;
        notSilencePrintPdf(handleUrl(pdfPath))
          ?.then((res) => {
            resolve(res);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    setIsOpenSilencePrint(isOpenSilencePrint: boolean) {
      this.isOpenSilencePrint = isOpenSilencePrint;
      sessionStorage.setItem(
        `${this.namespace}-isOpenSilencePrint`,
        String(isOpenSilencePrint ? 1 : 0),
      );
    },
    setHasOpenSchemaUrl(hasOpenSchemaUrl: boolean) {
      this.hasOpenSchemaUrl = hasOpenSchemaUrl;
      sessionStorage.setItem(
        `${this.namespace}-hasOpenSchemaUrl`,
        String(hasOpenSchemaUrl ? 1 : 0),
      );
    },
    setPrinterDefaultOptions(options: PrinterDefaultOptions) {
      this.printerDefaultOptions = {
        ...this.printerDefaultOptions,
        ...options,
      };
      sessionStorage.setItem(
        `${this.namespace}-printerDefaultOptions`,
        JSON.stringify(this.printerDefaultOptions),
      );
    },
  },
  persist: {
    pick: [
      'printSocket',
      'printers',
      'clientInfo',
      'isOpenSilencePrint',
      'hasOpenSchemaUrl',
    ],
  },
  state: (): AppState => ({
    printSocket: null,
    printers: [],
    onPreparing: true,
    clientInfo: null,
    onPrinting: false,
    hasOpenSchemaUrl: false,
    isOpenSilencePrint: false,
    printerDefaultOptions: {
      type: 'url_pdf',
      orientation: 'landscape',
      scale: 'noscale',
    },
    namespace: '',
    routerInstance: null,
  }),
});
// 解决热更新问题
const hot = import.meta.hot;
if (hot) {
  hot.accept(acceptHMRUpdate(useGlobalPrintStore, hot));
}
