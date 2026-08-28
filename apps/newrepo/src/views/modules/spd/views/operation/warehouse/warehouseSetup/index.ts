import type { InjectionKey, Ref } from 'vue';

import { nextTick, ref } from 'vue';

import { message } from 'ant-design-vue';

import { getWarehouseTree, moveUserDepartmentPermission } from './api';

export interface TreeContext {
  // queryWarehouseTree: () => Promise<void> | void;
  refreshTree: () => Promise<void>;
  selectedNode: Ref<null | {
    id: string;
    key: string;
    text: string;
    type: string;
  }>;
  getNodePathIds: () => {
    rootId?: string;
    sectionId?: string;
    warehouseId?: string;
    zoneId?: string;
  };
}

export const TREE_CONTEXT_KEY: InjectionKey<TreeContext> =
  Symbol('TreeContext');

// 树节点的数据结构
interface TreeNode {
  id: string;
  open?: boolean;
  isParent?: boolean;
  leaf?: boolean;
  text: string;
  type: 'root' | 'section' | 'warehouse' | 'warehouseType' | 'zone';
  key?: string;
  children?: TreeNode[];
  [key: string]: any;
}

// 左树
export function useTree({
  treeRootRef,
}: {
  treeRootRef?: Ref<HTMLElement | undefined>;
} = {}) {
  const keyword = ref('');
  const treeData = ref<any[]>([]);
  const expandedKeys = ref<string[]>([]);
  const nodeKeys = new Set();
  const selectedNode = ref<null | {
    id: string;
    key: string;
    text: string;
    type: string;
  }>({
    id: '0',
    text: '全部仓库',
    type: 'root',
    key: 'root-0', // root节点的key必须是唯一且固定的
  });

  // 标记是否是首次加载
  const isFirstLoad = ref(true);

  /**
   * 根据节点 key 查找节点路径（从根到目标节点的完整路径）
   */
  function findNodePathByKey(
    nodes: TreeNode[],
    targetKey: string,
    currentPath: TreeNode[] = [],
  ): null | TreeNode[] {
    for (const node of nodes) {
      const newPath = [...currentPath, node];
      if (node.key === targetKey) {
        return newPath;
      }
      if (node.children?.length) {
        const found = findNodePathByKey(node.children, targetKey, newPath);
        if (found) return found;
      }
    }
    return null;
  }
  /**
   *  getNodePathIds
   * 直接基于 selectedNode 的 key 和树结构来获取完整路径
   * 思路：通过 findNodePathByKey 找到完整路径，然后提取 ID
   */
  function getNodePathIds() {
    if (!selectedNode.value?.key) {
      return {};
    }

    const path = findNodePathByKey(treeData.value, selectedNode.value.key);

    const result: {
      rootId?: string;
      sectionId?: string;
      warehouseId?: string;
      zoneId?: string;
    } = {};

    if (path) {
      path.forEach((node: TreeNode) => {
        if (node.type === 'root') result.rootId = node.id;
        if (node.type === 'warehouseType') result.rootId = node.id;
        if (node.type === 'warehouse') result.warehouseId = node.id;
        if (node.type === 'zone') result.zoneId = node.id;
        if (node.type === 'section') result.sectionId = node.id;
      });
    }

    return result;
  }
  // 查找函数：根据 type 和 id 查找节点
  // function findNode(
  //   nodes: TreeNode[],
  //   targetType: string,
  //   targetId: string,
  // ): null | TreeNode {
  //   for (const node of nodes) {
  //     // 先检查节点层级和id是否一致
  //     if (node.type === targetType && node.id === targetId) {
  //       return node;
  //     }
  //     // 递归检查子节点
  //     if (node.children?.length) {
  //       const found = findNode(node.children, targetType, targetId);
  //       if (found) return found;
  //     }
  //   }
  //   return null;
  // }
  /**
   * 根据 key 查找节点
   * key 格式为 "type-id"，在整个树中保证唯一性
   */
  function findNodeByKey(
    nodes: TreeNode[],
    targetKey: string,
  ): null | TreeNode {
    for (const node of nodes) {
      if (node.key === targetKey) {
        return node;
      }
      if (node.children?.length) {
        const found = findNodeByKey(node.children, targetKey);
        if (found) return found;
      }
    }
    return null;
  }
  /**
   * @param nodes 当前要处理的节点数组
   * @returns {string[]} 需要展开的所有父节点 key 数组
   */
  function getAllExpandableKeys(nodes: TreeNode[]): string[] {
    const keys: string[] = [];
    for (const node of nodes) {
      // 只收集type为root和warehouse的节点
      if (
        node.type === 'root' ||
        node.type === 'warehouseType' ||
        node.type === 'warehouse'
      ) {
        keys.push(node.key as string);
      }
      if (node.children && node.children.length > 0) {
        keys.push(...getAllExpandableKeys(node.children));
      }
    }
    return keys;
  }
  // 收集所有目录的key，用来做展开所有功能
  function loop(nodes: Array<any>) {
    for (const node of nodes) {
      if (node.children?.length) {
        nodeKeys.add(node.key);
        loop(node.children);
      }
    }
  }

  // 递归删除expandedKeys中已关闭目录下的子目录key
  function recurrent(children?: Array<any>): Set<string> | undefined {
    return children?.reduce(
      (pre, cur) =>
        cur.children?.length
          ? new Set([...(recurrent(cur.children) ?? []), ...pre]).add(cur.key)
          : pre,
      new Set(),
    );
  }
  // 处理树节点的拖拽事件
  async function onDrop({
    dropToGap,
    node: { eventKey: targetId },
    dragNode: { eventKey: ids, parent },
    dropPosition,
  }: {
    dragNode: { eventKey: string; parent: TreeNode };
    dropPosition: number;
    dropToGap: boolean;
    node: { eventKey: string };
  }) {
    if (
      (dropToGap && targetId === 'root-0') ||
      (!dropToGap && targetId === parent.key)
    ) {
      return;
    }
    try {
      await moveUserDepartmentPermission({
        ids,
        targetId,
        moveType: dropToGap ? (dropPosition > 0 ? 'next' : 'prev') : 'inner',
      });

      message.success('操作成功');

      queryWarehouseTree();
    } catch {}
  }
  // 展开或收起所有目录
  function expand() {
    // 这个函数依赖一个收集所有 key 的逻辑，我们可以复用 getAllParentKeys
    expandedKeys.value =
      expandedKeys.value.length > 0 ? [] : getAllExpandableKeys(treeData.value);
  }
  // 处理树节点的展开事件
  function onExpand(
    keys: Array<string>,
    { expanded, node }: { expanded: boolean; node: any },
  ) {
    if (expanded) {
      expandedKeys.value = [...keys];
    } else {
      const keySet = recurrent(node.children);
      expandedKeys.value = keys.filter((key) => !keySet?.has(key));
    }
  }

  // 手动添加一个唯一的key，作为选中当前项的默认值
  function addKeysToTree(data: any[]) {
    return data.map((node) => {
      // 生成当前节点的key
      const currentKey = `${node.type}-${node.id}`; // 组合 key 确保唯一性
      // 创建新的节点对象，保留原始属性
      const newNode = {
        ...node,
        key: currentKey,
      };
      // 如果有子节点，递归添加key
      if (node.children?.length) {
        newNode.children = addKeysToTree(node.children);
      }
      return newNode;
    });
  }
  // 在树中查找所有匹配关键词的节点
  function findMatchedNodes(
    nodes: TreeNode[],
    kw: string,
  ): TreeNode[] {
    const matched: TreeNode[] = [];
    function walk(nodeList: TreeNode[]) {
      for (const node of nodeList) {
        if (node.text.includes(kw)) {
          matched.push(node);
        }
        if (node.children?.length) {
          walk(node.children);
        }
      }
    }
    walk(nodes);
    return matched;
  }

  /**
   * 滚动树到指定节点 - 原生 DOM 方式
   */
  function scrollToNode(nodeKey: string) {
    const rootEl = treeRootRef?.value;
    if (!rootEl) return;

    const targetNode = findNodeByKey(treeData.value, nodeKey);
    if (!targetNode) return;

    const nodeText = targetNode.text;

    // 查找所有树节点
    const treeNodes = rootEl.querySelectorAll('.ant-tree-treenode');
    for (const nodeEl of treeNodes) {
      const titleEl = nodeEl.querySelector('.ant-tree-title');
      if (titleEl) {
        const textContent = titleEl.textContent?.trim();
        if (textContent === nodeText) {
          (nodeEl as HTMLElement).scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
          return;
        }
      }
    }
  }

  // 获取节点到根的所有父级 key，用于展开路径
  function getParentKeys(
    nodes: TreeNode[],
    targetKey: string,
    path: string[] = [],
  ): string[] {
    for (const node of nodes) {
      if (node.key === targetKey) {
        return path;
      }
      if (node.children?.length) {
        const found = getParentKeys(node.children, targetKey, [...path, node.key as string]);
        if (found.length > 0 || node.children.some((c) => c.key === targetKey)) {
          return [...path, node.key as string];
        }
      }
    }
    return [];
  }

  // 查询/刷新树 并处理首次加载和后续刷新的逻辑
  async function queryWarehouseTree() {
    try {
      const { rows } = await getWarehouseTree(
        keyword.value ? { keyword: keyword.value } : undefined,
      );
      const arr = [rows];
      treeData.value = addKeysToTree(arr);
      console.warn('处理过key之后的数组===>', treeData.value);
      loop(treeData.value);
      console.warn('所有目录的key===>', getAllExpandableKeys(treeData.value));

      // 如果有搜索关键词，查找匹配节点并选中第一个
      if (keyword.value) {
        const matchedNodes = findMatchedNodes(treeData.value, keyword.value);
        if (matchedNodes.length > 0) {
          // 选中第一个匹配节点
          const firstMatch = matchedNodes[0]!;
          selectedNode.value = {
            id: firstMatch.id,
            key: firstMatch.key as string,
            text: firstMatch.text,
            type: firstMatch.type,
          };
          // 展开到第一个匹配节点的路径（包含节点自身以便展开其子级）
          const parentKeys = getParentKeys(treeData.value, firstMatch.key as string);
          const pathKeys = [treeData.value[0]?.key, ...parentKeys, firstMatch.key].filter(Boolean);
          expandedKeys.value = [...new Set(pathKeys)];
          // 等待 DOM 更新后滚动
          await nextTick();
          setTimeout(() => scrollToNode(firstMatch.key as string), 150);
        } else {
          // 没有匹配项，回退到根节点
          if (treeData.value.length > 0) {
            const rootNode = treeData.value[0] as TreeNode;
            selectedNode.value = {
              id: rootNode.id,
              key: rootNode.key as string,
              text: rootNode.text,
              type: rootNode.type,
            };
          }
          expandedKeys.value = getAllExpandableKeys(treeData.value);
        }
      } else if (isFirstLoad.value && treeData.value.length > 0) {
        // 首次加载时选择根节点
        const rootNode = treeData.value[0] as TreeNode;
        selectedNode.value = {
          id: rootNode.id,
          key: rootNode.key as string,
          text: rootNode.text,
          type: rootNode.type,
        };
        isFirstLoad.value = false;
        expandedKeys.value = getAllExpandableKeys(treeData.value);
      } else {
        // 后续刷新时，尝试保持选中的节点
        if (selectedNode.value?.key) {
          const foundNode = findNodeByKey(
            treeData.value,
            selectedNode.value.key,
          );
          if (foundNode) {
            // 节点仍存在，保持选中
            selectedNode.value = {
              id: foundNode.id,
              key: foundNode.key as string,
              text: foundNode.text,
              type: foundNode.type,
            };
          } else {
            // 节点被删除，回退到根节点
            if (treeData.value.length > 0) {
              const rootNode = treeData.value[0] as TreeNode;
              selectedNode.value = {
                id: rootNode.id,
                key: rootNode.key as string,
                text: rootNode.text,
                type: rootNode.type,
              };
            }
          }
        }
        expandedKeys.value = getAllExpandableKeys(treeData.value);
      }
    } catch (error) {
      console.error('刷新失败:', error);
      message.error('刷新失败');
      throw error;
    }
  }

  return {
    keyword,
    treeData,
    selectedNode, // 导出 selectedNode
    expandedKeys,
    queryWarehouseTree,
    expand,
    onExpand,
    onDrop,
    refreshTree: queryWarehouseTree, // 导出
    getNodePathIds, // 导出 getNodePathIds
  };
}
