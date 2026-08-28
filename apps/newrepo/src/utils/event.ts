// 手动触发下键
export function triggerArrowDown(el: any = document) {
  const enterEvent = new KeyboardEvent('keydown', {
    key: 'ArrowDown',
    code: 'ArrowDown',
    keyCode: 40,
    which: 40,
    bubbles: true,
    cancelable: true,
  });
  el.dispatchEvent(enterEvent);
}
