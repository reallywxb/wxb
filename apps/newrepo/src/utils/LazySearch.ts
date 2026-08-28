// 表单区域延迟查询控制类
export default class LazySearch {
  callBack; // 当已等待的组件数达到需等待的组件数时，调用此回调
  count; // 当前需要等待的组件数
  currentFlagArr: number[] = [];
  nowNum = 0; // 目前已经等待的组件数
  constructor(count: number, callBack: () => void) {
    this.count = count;
    this.callBack = callBack;
  }
  sign(flag?: number) {
    const handle = (flag?: number) => {
      flag && this.currentFlagArr.push(flag);
      this.nowNum++;
      if (this.nowNum === this.count) {
        this.callBack();
      }
    };
    if (flag) {
      this.currentFlagArr.includes(flag) ? null : handle(flag);
    } else {
      handle();
    }
  }
}
