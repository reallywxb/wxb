import type { PageProps } from '../page/types';

export interface ColPageProps extends PageProps {
  type?: 'LR' | 'LRtRb' | 'LtLbR' | 'LtLbRtRb' | 'TB' | 'TBlBr' | 'TlTrB';
  horizontalSizeUnit?: '%' | 'px';
  /**
   * 左侧宽度
   * @default 30
   */
  leftWidth?: number;
  leftMinWidth?: number;
  leftMaxWidth?: number;
  leftCollapsedWidth?: number;
  leftCollapsible?: boolean;
  /**
   * 右侧宽度
   * @default 70
   */
  rightWidth?: number;
  rightMinWidth?: number;
  rightCollapsedWidth?: number;
  rightMaxWidth?: number;
  rightCollapsible?: boolean;

  resizable?: boolean;
  splitLine?: boolean;
  splitHandle?: boolean;

  rightTopHeight?: number;
  rightTopMinHeight?: number;
  rightTopCollapsedHeight?: number;
  rightTopMaxHeight?: number;
  rightTopCollapsible?: boolean;

  rightBottomHeight?: number;
  rightBottomMinHeight?: number;
  rightBottomCollapsedHeight?: number;
  rightBottomMaxHeight?: number;
  rightBottomCollapsible?: boolean;

  topHeight?: number;
  topMinHeight?: number;
  topCollapsedHeight?: number;
  topMaxHeight?: number;
  topCollapsible?: boolean;

  bottomHeight?: number;
  bottomMinHeight?: number;
  bottomCollapsedHeight?: number;
  bottomMaxHeight?: number;
  bottomCollapsible?: boolean;
}
