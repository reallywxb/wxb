import type { InjectionKey, Ref } from 'vue';

import { ref } from 'vue';

import { Modal as AntModal, message } from 'ant-design-vue';

import { deepClone } from '#/utils/util';

import { deleteBatchVBPAction, getBatchVBPActionList } from './api';

export interface TreeContext {
  refreshTree: () => Promise<void>;
  selectedNode: Ref<null | {
    id: string;
    key: string;
    text: string;
    type: string;
    vbpBatchId: string;
  }>;
}

export const TREE_CONTEXT_KEY: InjectionKey<TreeContext> =
  Symbol('TreeContext');

// 批次数据的接口定义
interface BatchItem {
  beginDate: string;
  endDate: string;
  isActive: 'N' | 'Y'; // 是否有效（Y：有效，N：无效）
  name: string;
  productTypeName: string;
  storagePaths?: any[];
  type: 'C' | 'N' | 'O' | 'P'; // 类型（C：市采，N：国采，O：其他，P：省采）
  typeName: string;
  vbpBatchId: string;
  remark?: string;
}

// 树节点的数据结构
interface TreeNode {
  id: string;
  vbpBatchId?: string;
  open?: boolean;
  text: string;
  dateRange?: string;
  remark?: string;
  type: 'C' | 'N' | 'O' | 'P';
  key: string;
  children?: TreeNode[];
  iconSkin?: string;
  [key: string]: any;
}

// 自定义类型定义
type TreeKey = number | string;

interface TreeNodeInfo {
  eventKey: TreeKey;
  dataRef: TreeNode;
  parent?: {
    key: TreeKey;
  };
  children?: TreeNodeInfo[];
}

interface DropInfo {
  event: DragEvent;
  node: TreeNodeInfo;
  dragNode: TreeNodeInfo;
  dragNodesKeys: TreeKey[];
  dropPosition: number;
  dropToGap: boolean;
}

// 左树
export function useHCTree({
  addAndEditBatchFormModalApi,
  copyFormModalApi,
  rightViewComponentRef,
}: any) {
  const treeState = ref({
    name: '', // 名称
    status: '', // 状态
  });
  const batchList = ref<BatchItem[]>([]);
  const treeData = ref<any[]>([]);
  const expandedKeys = ref<string[]>([]);
  const selectedNode = ref<null | {
    id: string;
    key: string;
    text: string;
    type: string;
    vbpBatchId: string;
  }>(null);
  /**
   * @param nodes 当前要处理的节点数组
   * @returns {string[]} 需要展开的所有父节点 key 数组
   */
  function getAllExpandableKeys(nodes: TreeNode[]): string[] {
    const keys: string[] = [];
    for (const node of nodes) {
      keys.push(node.key);
      if (node.children && node.children.length > 0) {
        keys.push(...getAllExpandableKeys(node.children));
      }
    }
    return keys;
  }
  // 递归删除expandedKeys中已关闭目录下的子目录key
  // function recurrent(children?: Array<any>): Set<string> | undefined {
  //   return children?.reduce(
  //     (pre, cur) =>
  //       cur.children?.length
  //         ? new Set([...(recurrent(cur.children) ?? []), ...pre]).add(cur.key)
  //         : pre,
  //     new Set(),
  //   );
  // }
  // 处理树节点的拖拽事件
  async function onDrop(info: DropInfo) {
    const { dropToGap, node, dragNode, dropPosition } = info;

    const dragNodeKey = String(dragNode.eventKey);
    const dropNodeKey = String(node.eventKey);

    // 判断是否是根节点(国采/省采/市采/其他)
    const isRootNode = (key: string) => {
      return ['parent-C', 'parent-N', 'parent-O', 'parent-P'].includes(key);
    };

    // 从节点 key 中提取父节点类型
    const getParentType = (nodeKey: string, nodeDataRef: any): string => {
      // 如果是根节点,返回自身类型
      if (isRootNode(nodeKey)) {
        return nodeKey;
      }
      // 如果是批次节点(batch-xxx),从 dataRef 中获取 type
      if (nodeDataRef && nodeDataRef.type) {
        return `parent-${nodeDataRef.type}`;
      }
      // 兜底:从 key 中解析(虽然 batch-xxx 格式无法直接解析)
      return '';
    };

    const dragParentType = getParentType(dragNodeKey, dragNode.dataRef);
    const dropParentType = getParentType(dropNodeKey, node.dataRef);

    console.warn('拖拽调试信息:', {
      dragNodeKey,
      dropNodeKey,
      dragParentType,
      dropParentType,
      dragDataRef: dragNode.dataRef,
      dropDataRef: node.dataRef,
    });

    // 禁止拖拽根节点
    if (isRootNode(dragNodeKey)) {
      message.warning('不能拖拽根节点');
      return;
    }

    // 禁止拖拽到根节点内部(除非是同类型)
    if (
      !dropToGap &&
      isRootNode(dropNodeKey) && // 检查是否是同类型
      dragParentType !== dropNodeKey
    ) {
      message.warning('不能将节点拖拽到不同类型的根节点内部');
      return;
    }
    // 同类型判断
    if (dropToGap) {
      // 拖拽到间隙:检查是否同类型
      const targetParentType = isRootNode(dropNodeKey)
        ? dropNodeKey
        : dropParentType;

      if (dragParentType !== targetParentType) {
        message.warning('不能跨类型拖拽,只能在同一类型内排序');
        return;
      }
    } else {
      // 拖拽到节点内部:目标必须是根节点且与拖拽节点同类型
      if (!isRootNode(dropNodeKey)) {
        message.warning('只能拖拽到根节点内部');
        return;
      }
      if (dragParentType !== dropNodeKey) {
        message.warning('不能跨类型拖拽');
        return;
      }
    }

    // 执行拖拽排序逻辑
    const dropKey = dropNodeKey;
    const dragKey = dragNodeKey;
    const dropPos = (node as any).pos.split('-');
    const dropPositionCalc = dropPosition - Number(dropPos[dropPos.length - 1]);

    const loop = (
      data: TreeNode[],
      key: string,
      callback: (item: TreeNode, index: number, arr: TreeNode[]) => void,
    ) => {
      data.forEach((item, index, arr) => {
        if (item.key === key) {
          return callback(item, index, arr);
        }
        if (item.children) {
          return loop(item.children, key, callback);
        }
      });
    };

    const data = deepClone(treeData.value);

    let dragObj: TreeNode | undefined;
    loop(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1);
      dragObj = item;
    });

    if (!dragObj) {
      message.error('拖拽失败:未找到拖拽节点');
      return;
    }

    if (!dropToGap) {
      loop(data, dropKey, (item) => {
        item.children = item.children || [];
        item.children.unshift(dragObj as TreeNode);
      });
    } else if (
      (node.dataRef.children || []).length > 0 &&
      (node as any).expanded &&
      dropPositionCalc === 1
    ) {
      loop(data, dropKey, (item) => {
        item.children = item.children || [];
        item.children.unshift(dragObj as TreeNode);
      });
    } else {
      let targetArr: TreeNode[] = [];
      let targetIndex = 0;
      loop(data, dropKey, (_item, index, arr) => {
        targetArr = arr;
        targetIndex = index;
      });

      if (dropPositionCalc === -1) {
        targetArr.splice(targetIndex, 0, dragObj);
      } else {
        targetArr.splice(targetIndex + 1, 0, dragObj);
      }
    }

    treeData.value = data;
    message.success('排序成功');

    console.warn('新的树结构:', data);
    // TODO: 调用后端保存排序
  }
  // 展开或收起所有目录
  function expand() {
    // 这个函数依赖一个收集所有 key 的逻辑，我们可以复用 getAllParentKeys
    expandedKeys.value =
      expandedKeys.value.length > 0 ? [] : getAllExpandableKeys(treeData.value);
  }
  // 处理树节点的展开事件
  function onExpand(
    keys: string[],
    { expanded, node }: { expanded: boolean; node: any },
  ) {
    console.warn(
      'onExpand - keys:',
      keys,
      'expanded:',
      expanded,
      'node:',
      node,
    );
    if (expanded) {
      // 使用新的keys更新展开状态
      expandedKeys.value = [...keys];
    } else {
      // 收起节点:移除当前节点的key
      const nodeKey = node.key;
      expandedKeys.value = keys.filter((key) => key !== nodeKey);
      // 如果节点有子节点,也收起它们
      if (node.children && node.children.length > 0) {
        const childKeys = getAllExpandableKeys(node.children);
        expandedKeys.value = expandedKeys.value.filter(
          (key) => !childKeys.includes(key),
        );
      }
    }
  }
  // 查询查询批次列表
  async function batchQuery() {
    try {
      const params = {
        ...treeState.value,
        pageNum: 1,
        pageSize: 100,
        productType: 'H', // 这个直接写死代表是耗材页面
        dir: 'desc',
        sort: 'beginDate',
      };
      console.warn('查询批次列表_params:', params);
      const res = await getBatchVBPActionList(params);
      console.warn('查询批次列表_batchQuery:', res);
      const records = res.rows || [];
      batchList.value = records;
      // 构建树数据
      buildTreeData(records);
    } catch (error) {
      console.error('查询失败:', error);
      message.error('查询失败');
      throw error;
    }
  }
  // 树节点构建
  function buildTreeData(records: BatchItem[]) {
    let zNodes: TreeNode[] = [];
    if (records.length > 0) {
      // 创建四个固定的父节点,对应老系统的 N/P/C/O
      const parentNodes = [
        {
          id: 'N',
          text: '国采',
          iconSkin: 'q0',
          open: true,
          type: 'N' as const,
          key: 'parent-N',
        },
        {
          id: 'P',
          text: '省采',
          iconSkin: 'q0',
          open: true,
          type: 'P' as const,
          key: 'parent-P',
        },
        {
          id: 'C',
          text: '市采',
          iconSkin: 'q0',
          open: true,
          type: 'C' as const,
          key: 'parent-C',
        },
        {
          id: 'O',
          text: '其他',
          iconSkin: 'q0',
          open: true,
          type: 'O' as const,
          key: 'parent-O',
        },
      ];
      // 初始化父节点,添加 children 数组
      const parentNodesMap: Record<string, TreeNode> = {};
      parentNodes.forEach((node) => {
        parentNodesMap[node.id] = { ...node, children: [], open: true };
      });
      // 初始化父节点,添加 children 数组
      records.forEach((item: BatchItem) => {
        // 找到对应的父节点
        const parentNode = parentNodesMap[item.type];
        if (parentNode) {
          // 创建子节点
          const childNode: TreeNode = {
            id: item.vbpBatchId as string,
            vbpBatchId: item.vbpBatchId as string,
            // text: `${item.name}<span class="fontNormal">(${item.beginDate}~${item.endDate})</span>`,
            text: item.name,
            dateRange: `${item.beginDate}~${item.endDate}`,
            remark: item.remark ? `备注:${item.remark}` : '',
            type: item.type,
            iconSkin: 'q1',
            open: true,
            key: `batch-${item.vbpBatchId}`,
          };
          // 添加到父节点的 children 数组
          parentNode && parentNode.children?.push(childNode);
        }
      });
      // 只添加有子节点的父节点到树中
      // Object.values(parentNodesMap).forEach((node) => {
      //   if (node.children && node.children.length > 0) {
      //     zNodes.push(node);
      //   }
      // });
      // 始终添加所有四个父节点（保持顺序）
      zNodes = parentNodes.map((node) => ({
        ...parentNodesMap[node.id],
      })) as TreeNode[];
      treeData.value = zNodes;
      console.warn('树数据:', treeData.value);
      // 默认展开所有节点
      const allKeys = getAllExpandableKeys(zNodes);
      // const allParentKeys = parentNodes.map((node) => node.key);
      expandedKeys.value = allKeys;
      // 默认选中第一个批次节点(按顺序找第一个有子节点的父节点的第一个子节点)
      selectFirstBatchNode(zNodes);
    } else {
      treeData.value = [];
      selectedNode.value = null;
    }
  }
  /**
   * 默认选中第一个批次节点
   * 对应老系统的 onClickRoot 函数逻辑
   */
  function selectFirstBatchNode(nodes: TreeNode[]) {
    // 按照 N->P->C->O 的顺序查找
    if (!nodes || nodes.length === 0) {
      return;
    }
    for (const node of nodes) {
      if (node.children && node.children.length > 0) {
        const firstChild = node.children[0] as TreeNode;
        selectedNode.value = {
          id: firstChild.id,
          key: firstChild.key,
          text: firstChild.text,
          type: firstChild.type,
          vbpBatchId: firstChild.vbpBatchId as string,
        };
        // 在这里初始化调用右侧视图的数据
        rightViewComponentRef.value?.initData(selectedNode.value);
        return;
      }
    }
    // 如果没有任何子节点，清空选中状态
    selectedNode.value = null;
  }
  /**
   * 新增操作
   */
  function handleAdd() {
    addAndEditBatchFormModalApi
      .setData({
        title: '新增集采批次',
        type: 'add',
        callback: (data: any) => {
          console.warn('新增批次:', data);
          // 刷新树数据
          batchQuery();
        },
      })
      .open();
  }

  /**
   * 编辑操作
   */
  function handleEdit() {
    console.warn('handleEdit:', selectedNode.value);
    if (!selectedNode.value || !selectedNode.value.vbpBatchId) {
      message.warning('请选择批次');
      return;
    }
    // 这里需要打开编辑弹窗,根据实际业务补充
    addAndEditBatchFormModalApi
      .setData({
        title: '编辑集采批次',
        type: 'edit',
        callback: (data: any) => {
          console.warn('编辑批次:', data);
        },
        vbpBatchId: selectedNode.value.vbpBatchId,
      })
      .open();
  }

  /**
   * 删除操作
   */
  function handleDelete() {
    if (!selectedNode.value || !selectedNode.value.vbpBatchId) {
      message.warning('请先选择一个批次节点');
      return;
    }
    AntModal.confirm({
      title: '提示',
      content: `确认删除${selectedNode.value.text}吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteBatchVBPAction({
            id: selectedNode.value?.vbpBatchId || '',
          });

          message.success('删除成功');
          // 刷新树数据
          batchQuery();
        } catch {
          message.error('删除失败');
        }
      },
    });
  }

  /**
   * 复制操作
   */
  function handleCopy() {
    if (!selectedNode.value || !selectedNode.value.vbpBatchId) {
      message.warning('请先选择一个批次');
      return;
    }
    copyFormModalApi
      .setData({
        title: '复制批次目录',
        vbpBatchId: selectedNode.value.vbpBatchId,
        callback: (data: any) => {
          console.warn('复制批次:', data);
          // 刷新树数据
          batchQuery();
        },
      })
      .open();
  }
  return {
    treeState,
    treeData,
    selectedNode, // 导出 selectedNode
    expandedKeys,
    batchList,
    batchQuery,
    expand,
    onExpand,
    onDrop,
    refreshTree: batchQuery, // 导出
    handleAdd, // 新增
    handleEdit, // 编辑
    handleDelete, // 删除
    handleCopy, // 复制
  };
}
