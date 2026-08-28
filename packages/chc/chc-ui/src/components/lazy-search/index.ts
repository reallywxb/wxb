export default class LazySearch {
  callBack;
  count;
  nowNum = 0;
  constructor(count: number, callBack: () => void) {
    this.count = count;
    this.callBack = callBack;
  }
  sign() {
    this.nowNum++;
    if (this.nowNum === this.count) {
      this.callBack();
    }
  }
}
