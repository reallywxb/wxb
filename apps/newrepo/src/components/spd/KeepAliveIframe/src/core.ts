/** 创建选项 */
export interface FrameCreateOptions {
  uid: string;
  src: string;
  width: number;
  height: number;
  top: number;
  left: number;
  zIndex: number;
  attrs: Record<string, any>;
  onLoaded?: (event: Event) => void;
  onError?: (event: Event | string) => void;
  keepAlive: boolean;
  container?: HTMLElement;
  parentContainer?: HTMLElement;
}

/** iframe 缓存管理器 - 模块级单例 */
export class FrameManager {
  private static frameMap = new Map<
    string,
    { frame: KAliveFrame; lastUsed: number }
  >();
  private static MAX_CACHE_SIZE = 10;

  private static updateLastUsed(uid: string) {
    const entry = this.frameMap.get(uid);
    if (entry) {
      entry.lastUsed = Date.now();
    }
  }

  private static enforceCacheLimit() {
    if (this.frameMap.size <= this.MAX_CACHE_SIZE) return;
    const entries = Array.from(this.frameMap.entries()).sort(
      ([, a], [, b]) => a.lastUsed - b.lastUsed,
    );
    while (this.frameMap.size > this.MAX_CACHE_SIZE) {
      const [uid] = entries.shift()!;
      this.destroyByUid(uid);
    }
  }

  static get(uid: string): KAliveFrame | undefined {
    const entry = this.frameMap.get(uid);
    if (entry) {
      this.updateLastUsed(uid);
      return entry.frame;
    }
  }

  static create(options: FrameCreateOptions): KAliveFrame {
    const { uid } = options;
    const existing = this.get(uid);
    if (existing) existing.destroy();

    const frame = new KAliveFrame(options);
    this.frameMap.set(uid, { frame, lastUsed: Date.now() });
    this.enforceCacheLimit();
    return frame;
  }

  static destroy(frame: KAliveFrame) {
    frame.destroy();
    for (const [key, entry] of this.frameMap.entries()) {
      if (entry.frame === frame) {
        this.frameMap.delete(key);
        break;
      }
    }
  }

  static destroyByUid(uid: string) {
    const entry = this.frameMap.get(uid);
    if (entry) {
      entry.frame.destroy();
      this.frameMap.delete(uid);
    }
  }

  static setMaxCacheSize(size: number) {
    if (size < 1) {
      console.error('[FrameManager]: 缓存大小必须大于0');
      return;
    }
    this.MAX_CACHE_SIZE = size;
    this.enforceCacheLimit();
  }
}

/** iframe 实例 */
export class KAliveFrame {
  private el: HTMLIFrameElement | null = null;
  private options: FrameCreateOptions | null;
  private originalRect = { width: 0, height: 0, top: 0, left: 0 };
  private scrollHandler: (() => void) | null = null;

  constructor(options: FrameCreateOptions) {
    this.options = options;
    this.init();
  }

  private init() {
    if (!this.options) return;
    const {
      src,
      zIndex,
      attrs,
      onLoaded,
      onError,
      keepAlive,
      container,
      parentContainer,
    } = this.options;

    if (!src) {
      console.error('[KAliveFrame]: 请填写 iframe 的 src');
      return;
    }

    try {
      this.el = document.createElement('iframe');
      this.el.src = src;
      this.el.style.setProperty('z-index', String(zIndex));
      this.el.classList.add('keep-alive-frame');

      if (onLoaded) this.el.onload = onLoaded;
      if (onError) this.el.onerror = onError;

      this.setAttrs(attrs);
      this.resize(this.options);

      if (keepAlive) {
        document.body.appendChild(this.el);
        if (parentContainer) {
          this.addScrollListener(parentContainer);
        }
      } else {
        if (container) {
          container.appendChild(this.el);
        }
      }
    } catch (err) {
      console.error(
        `[KAliveFrame]: 初始化 iframe 失败: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  resize(rect: DOMRect | { width: number; height: number; top: number; left: number }) {
    if (!this.el || !this.options) return;
    const { left, top, width, height } = rect;
    this.originalRect = { width, height, top, left };

    if (this.options.keepAlive) {
      if (this.options.parentContainer) {
        const scrollTop = this.options.parentContainer.scrollTop;
        const scrollLeft = this.options.parentContainer.scrollLeft;
        this.setStyle({
          position: 'fixed',
          left: `${left - scrollLeft}px`,
          top: `${top - scrollTop}px`,
          width: `${width}px`,
          height: `${height}px`,
        });
      } else {
        this.setStyle({
          position: 'fixed',
          left: `${left}px`,
          top: `${top}px`,
          width: `${width}px`,
          height: `${height}px`,
        });
      }
    } else {
      this.setStyle({
        width: '100%',
        height: '100%',
      });
    }
  }

  destroy() {
    if (this.el) {
      this.el.onload = null;
      this.el.onerror = null;
      this.el.remove();
      this.el = null;
    }

    if (this.scrollHandler && this.options?.parentContainer) {
      this.options.parentContainer.removeEventListener(
        'scroll',
        this.scrollHandler,
      );
      this.scrollHandler = null;
    }

    this.options = null;
  }

  show() {
    if (this.el) {
      this.el.classList.remove('is-hidden');
    }
  }

  hide() {
    if (this.el) {
      this.el.classList.add('is-hidden');
    }
  }

  update(src: string) {
    if (this.el) {
      this.el.src = src;
    }
  }

  private setStyle(style: Partial<CSSStyleDeclaration>) {
    if (this.el) {
      Object.assign(this.el.style, style);
    }
  }

  private setAttrs(attrs: Record<string, any>) {
    if (this.el && this.options) {
      Object.entries(attrs).forEach(([key, value]) => {
        this.el!.setAttribute(key, String(value));
      });
    }
  }

  private addScrollListener(parentContainer: HTMLElement) {
    if (!this.el || !this.options) return;
    this.scrollHandler = () => {
      if (!this.el || !this.options?.keepAlive) return;
      const scrollTop = parentContainer.scrollTop;
      const scrollLeft = parentContainer.scrollLeft;
      this.setStyle({
        position: 'fixed',
        left: `${this.originalRect.left - scrollLeft}px`,
        top: `${this.originalRect.top - scrollTop}px`,
        width: `${this.originalRect.width}px`,
        height: `${this.originalRect.height}px`,
      });
    };
    parentContainer.addEventListener('scroll', this.scrollHandler);
  }

  getEl(): HTMLIFrameElement | null {
    return this.el;
  }
}

/** 创建 iframe */
export function createFrame(options: FrameCreateOptions): KAliveFrame {
  return FrameManager.create(options);
}

/** 销毁 iframe */
export function destroyFrame(frame: KAliveFrame): void {
  FrameManager.destroy(frame);
}

/** 显示 iframe */
export function showIframe(frame: KAliveFrame): void {
  frame.show();
}

/** 隐藏 iframe */
export function hideIframe(frame: KAliveFrame): void {
  frame.hide();
}

/** 更新 src */
export function updateIframeSrc(frame: KAliveFrame, src: string): void {
  frame.update(src);
}
