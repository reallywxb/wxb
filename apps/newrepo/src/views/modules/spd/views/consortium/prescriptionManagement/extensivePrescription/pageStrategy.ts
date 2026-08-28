import type { ActionContent, ActionKey, PageStrategy, PageType } from './type';

// 策略映射表
const pageStrategies = new Map<PageType, PageStrategy>();

// 注册页面策略
export const registerPageStrategy = (
  type: PageType,
  strategy: PageStrategy,
) => {
  pageStrategies.set(type, strategy);
};

// 获取页面策略
export function getPageStrategy(type: PageType): PageStrategy {
  const strategy = pageStrategies.get(type);
  if (!strategy) {
    console.error(`No strategy registered for page type: ${type}`);
    return { actions: {} };
  }
  return strategy;
}

// 执行操作
export async function executeAction(
  pageType: PageType,
  actionKey: ActionKey,
  content: ActionContent,
) {
  const strategy = getPageStrategy(pageType);
  const handler = strategy.actions[actionKey];
  if (!handler) {
    console.error(`No handler for action ${actionKey} on page ${pageType}`);
    return;
  }
  await handler(content);
}
