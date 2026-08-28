import { useAccessStore } from '../modules/access';

function formatToken(token: null | string) {
  return token ? `Bearer ${token}` : null;
}
export function notSilencePrintPdf(url: string) {
  if (!url) {
    console.error('无法打印：URL为空~~!');
    return;
  }
  return new Promise<null>((resolve, reject) => {
    const accessStore = useAccessStore();
    fetch(
      url,
      accessStore.accessToken
        ? {
            headers: {
              Authorization: formatToken(accessStore.accessToken) as string,
            },
          }
        : {},
    )
      .then((res: any) => {
        return res.status === 200 ? res.arrayBuffer() : res.json();
      })
      .then((res: any) => {
        if (res.success === false) {
          throw new Error(res.msg);
        }
        const blob = new Blob([res], { type: 'application/pdf' });
        let objectUrl: null | string = URL.createObjectURL(blob);
        if (window.top?.document.querySelector('#print_iframe')) {
          (
            window.top?.document.querySelector(
              '#print_iframe',
            ) as HTMLIFrameElement
          ).remove();
        }
        const iframe: HTMLIFrameElement = window.top?.document.createElement(
          'IFRAME',
        ) as HTMLIFrameElement;
        iframe.id = 'print_iframe';
        iframe.src = 'about:blank';
        iframe.height = '0';
        iframe.width = '0';
        iframe.style = 'height: 0px; width: 0px; display: none;';
        window.top?.document.body.append(iframe);
        iframe.setAttribute('src', objectUrl);
        (iframe as HTMLIFrameElement).addEventListener('load', () => {
          setTimeout(() => {
            if ((iframe as HTMLIFrameElement).src !== 'about:blank') {
              (iframe as HTMLIFrameElement).contentWindow?.print();
              if (objectUrl) {
                window.URL.revokeObjectURL(objectUrl); // 只要映射存在，Blob就不能进行垃圾回收，因此一旦不再需要引用，就必须小心撤销URL，释放掉blob对象。
                objectUrl = null;
              }
              resolve(null);
            }
          }, 0);
        });
      })
      .catch((error: any) => {
        reject(error);
      });
  });
}
