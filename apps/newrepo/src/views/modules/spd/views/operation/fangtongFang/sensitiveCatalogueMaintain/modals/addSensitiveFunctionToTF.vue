<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { isEmpty } from '@vben/utils';

import {
  Modal as AntModal,
  Tree as AntTree,
  Button,
  Input,
  message,
} from 'ant-design-vue';

import { requestFormClient } from '#/api/request';

type Key = number | string;
interface TreeOption {
  id: string;
  label?: string;
  text: string;
  url?: string;
  disabled?: boolean; // 添加禁用标记(编辑)
  children?: TreeOption[];
  [key: string]: any;
}

const modalData = ref<Record<string, any>>({});
const modalTitle = ref('');
const searchValue = ref('');
const expandedKeys = ref<Key[]>([]); // 展开的节点
const autoExpandParent = ref(true); // 是否自动展开父节点
const treeData: any = ref([]);
const checkedKeys = ref<string[]>([]);
const dataList = ref<Array<{ key: string; title: string }>>([]); // 扁平化的数据列表，用于快速查找
// const editableMenuIds = ref<Set<string>>(new Set()); // 存储编辑模式下允许操作的菜单ID集合

// 查询菜单树
const queryMenuTree = async () => {
  try {
    const res = await requestFormClient.get('/sys/menu/editTree');
    console.warn('queryMenuTree res', res);
    const data = [res];
    iterateData(data);
    treeData.value = data as TreeOption[];
    // 这里生成扁平化列表
    dataList.value = [];
    generateList(treeData.value);
  } catch (error) {
    console.error('获取菜单树失败', error);
  }
};

// 动态添加菜单子节点的操作权限
const iterateData = (data: any) => {
  if (!Array.isArray(data)) return;
  data.forEach((item: any) => {
    if (!item.text) item.text = item.label;
    // 先判断是否有子节点
    if (item.children && item.children.length > 0) {
      // 有子节点，继续递归处理
      iterateData(item.children);
    } else {
      // 只在叶子节点添加操作权限
      const operationArr = [
        { id: `canRead_${item.id}`, text: '查询权限', operationType: 'query' },
        {
          id: `canExport_${item.id}`,
          text: '导出权限',
          operationType: 'export',
        },
        {
          id: `canReport_${item.id}`,
          text: '打印权限',
          operationType: 'print',
        },
      ];
      item.children = operationArr;
    }
  });
};

/**
 * 给树形每个子节添加操作(查询/打印/导出)
 * @param data 树形数据
 */
// const iterateData = (data: TreeOption[]): void => {
//   if (!Array.isArray(data)) return;
//   data.forEach((item: TreeOption) => {
//     if (item.children && item.children.length > 0) {
//       expandedKeys.value.push(item.id);
//       iterateData(item.children);
//     } else {
//       expandedKeys.value.push(item.id);
//       const operationArr = [
//         {
//           id: `canRead_${item.id}`,
//           text: '查询权限',
//         },
//         {
//           id: `canWrite_${item.id}`,
//           text: '修改权限',
//         },
//         {
//           id: `canExport_${item.id}`,
//           text: '导出权限',
//         },
//         {
//           id: `canReport_${item.id}`,
//           text: '打印权限',
//         },
//       ];
//       const keys = ['canRead', 'canWrite', 'canExport', 'canReport'];
//       keys.forEach((key) => {
//         if (item[key]) {
//           console.warn('这个key是true', item[key]);
//           checkedKeys.value.push(`${key}_${item.id}`);
//         }
//       });
//       item.children = operationArr;
//     }
//   });
// };

/**
 * 生成扁平化的数据列表
 * 用于快速查找节点
 */
const generateList = (data: any[]) => {
  for (const node of data) {
    dataList.value.push({ key: node.id, title: node.label });
    if (node.children) {
      generateList(node.children);
    }
  }
};

/**
 * 根据子节点key查找父节点key
 */
const getParentKey = (key: string, tree: TreeOption[]): string | undefined => {
  let parentKey: string | undefined;
  for (const node of tree) {
    if (node.children && node.children.length > 0) {
      if (node.children.some((item: TreeOption) => item.id === key)) {
        parentKey = node.id;
      } else {
        const foundKey = getParentKey(key, node.children);
        if (foundKey) {
          parentKey = foundKey;
        }
      }
    }
  }
  return parentKey;
};

/**
 * @param tree 树形数据
 * @param targetId 节点 ID
 * @returns 选中的节点
 */
const findNodeById = (
  tree: TreeOption[],
  targetId: string,
): null | TreeOption => {
  for (const node of tree) {
    if (node.id === targetId) {
      return node;
    }
    if (node.children && node.children.length > 0) {
      const found = findNodeById(node.children, targetId);
      if (found) {
        return found;
      }
    }
  }
  return null;
};

/**
 * 从选中的checkKeys中提起菜单访问权限
 * @returns 菜单访问权限数组
 */
const extractMenuAccess = () => {
  // 存储每个菜单的操作权限
  const menuMap = new Map<
    string,
    {
      menuId: string;
      menuName: string;
      operations: Set<string>;
    }
  >();
  checkedKeys.value.forEach((key: string) => {
    const keyStr = key.toString();
    // 判断是否是操作权限节点
    const operationMatch = keyStr.match(/^(canRead|canExport|canReport)_(.+)$/);

    if (!operationMatch) return;

    const [, operationType, menuId] = operationMatch as any;
    const operationMapping: Record<string, string> = {
      canRead: 'query',
      canExport: 'export',
      canReport: 'print',
    };
    const opCode = operationMapping[operationType];
    if (!opCode) return;

    // 确保 map 中有当前菜单
    let menu = menuMap.get(menuId);
    if (!menu) {
      const menuNode = findNodeById(treeData.value, menuId);
      if (!menuNode) return;

      menu = {
        menuId,
        menuName: menuNode.label ?? menuNode.text,
        operations: new Set<string>(),
      };
      menuMap.set(menuId, menu);
    }

    // 追加一个操作
    menu.operations.add(opCode);
  });
  // 转成后端需要的数组格式
  return [...menuMap.values()].map((item) => ({
    menuId: item.menuId,
    menuName: item.menuName,
    operation: [...item.operations].join(','), // "query,print,export"
  }));
};

const onExpand = (keys: Key[]) => {
  expandedKeys.value = keys;
  autoExpandParent.value = false;
};

/**
 * 根据允许的节点ID集合，设置树形数据中节点的禁用状态
 * @param tree 树形数据
 * @param editableIds 可操作的节点ID集合
 */
const setDisabledStatus = (tree: TreeOption[], editableIds: Set<string>) => {
  if (!Array.isArray(tree)) return;
  for (const node of tree) {
    node.disabled = !editableIds.has(node.id);
    if (node.children && node.children.length > 0) {
      setDisabledStatus(node.children, editableIds);
    }
  }
};

/**
 * 获取说有可编辑节点及所有祖先节点的ID集合
 * @param tree 树形数据
 * @param editableIds 可编辑的菜单ID集合
 * @returns 所有可编辑节点及所有祖先节点的ID集合
 */
const getAllowedNodeIds = (
  tree: TreeOption[],
  editableIds: Set<string>,
): Set<string> => {
  // 包含所有可编辑的节点自身
  const allowedIds = new Set<string>(editableIds);
  // 父子映射 用于O(1)时间复杂度的父节点查找，避免重复遍历
  const parentMap = new Map<string, string>();
  const buildParentMap = (
    nodes: TreeOption[],
    parentId: null | string = null,
  ) => {
    for (const node of nodes) {
      if (parentId) {
        parentMap.set(node.id, parentId);
      }
      if (node.children) {
        buildParentMap(node.children, node.id);
      }
    }
  };
  buildParentMap(tree);
  // 从每个可编辑节点开始，向上追溯并添加祖先节点
  for (const id of editableIds) {
    let currentId: string | undefined = parentMap.get(id);
    while (currentId) {
      allowedIds.add(currentId);
      currentId = parentMap.get(currentId) || '';
    }
  }
  // 把所有属于已允许菜单的“操作节点”也加入
  const addOpsForAllowedMenus = (nodes: TreeOption[]) => {
    for (const node of nodes) {
      const m =
        typeof node.id === 'string'
          ? node.id.match(/^(canRead|canExport|canReport)_(.+)$/)
          : null;
      if (m) {
        const menuId = m?.[2]; // 操作节点对应的菜单节点的 ID
        if (allowedIds.has(menuId as string)) {
          allowedIds.add(node.id); // 加入操作权限节点
        }
      }
      if (node.children && node.children.length > 0) {
        addOpsForAllowedMenus(node.children);
      }
    }
  };
  addOpsForAllowedMenus(tree);
  return allowedIds;
};

const [Modal, modalApi] = useVbenModal({
  draggable: true,
  showConfirmButton: true,
  cancelText: '取消',
  confirmText: '确认',
  onCancel() {
    modalApi.close();
  },
  onClosed() {
    // message.info('onClosed：关闭动画结束');
  },
  onConfirm() {
    // message.info('onConfirm');
    // modalApi.close();
    console.warn('onConfirm checkedKeys', checkedKeys.value);
    const menuAccess = extractMenuAccess();
    console.warn('onConfirm menuAccess', menuAccess);
    if (isEmpty(menuAccess)) {
      message.error('请选择菜单');
      return;
    }
    AntModal.confirm({
      title: '提示',
      content: `确认执行该操作吗？`,
      onOk: async () => {
        try {
          const params: Record<string, any> = {
            menuAccess: JSON.stringify(menuAccess),
          };
          console.warn('onConfirm params', params);
          await requestFormClient.post('/aptAction/saveMenu', params);
          message.success('操作成功');
          modalApi.close();
          modalData.value?.callback?.();
        } catch (error) {
          console.error('操作失败', error);
        }
      },
    });
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },
  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      modalData.value = modalApi.getData<Record<string, any>>();
      const type = modalData.value?.type;
      modalTitle.value =
        type === 'ADD' ? '新增统方敏感功能' : '编辑统方敏感功能';
      // 重置状态
      checkedKeys.value = [];
      searchValue.value = '';
      expandedKeys.value = [];
      autoExpandParent.value = true;
      console.warn('onOpenChange modalData', modalData.value);
      await queryMenuTree();
      const menuIdStr = modalData.value?.menuId as string | undefined;
      const operationStr = modalData.value?.operation as string | undefined;
      if (type === 'EDIT' && menuIdStr && operationStr) {
        // 获取可编辑的叶子节点
        const editableIds = new Set(menuIdStr.split(',').filter(Boolean));
        // 计算出所有允许操作的节点ID(包括祖先)
        const allowedNodeIds = getAllowedNodeIds(treeData.value, editableIds);
        console.warn('onOpenChange allowedNodeIds', allowedNodeIds);
        // 根据允许的ID集合来设置禁用状态
        setDisabledStatus(treeData.value, allowedNodeIds);
        // 记录可编辑的菜单ID
        // editableIds.forEach((id) => editableMenuIds.value.add(id));
        // setDisabledStatus(treeData.value, editableMenuIds.value);
        const operationIds = operationStr.split(',').filter(Boolean);
        // 操作类型映射
        const operationMapping: Record<string, string> = {
          query: 'canRead',
          export: 'canExport',
          print: 'canReport',
        };
        // 生成选中操作权限节点ID
        const operationKeys: string[] = [];
        editableIds.forEach((id) => {
          operationIds.forEach((op) => {
            const opkey = operationMapping[op];
            if (opkey) {
              operationKeys.push(`${opkey}_${id}`);
            }
          });
        });
        console.warn('onOpenChange operationKeys', operationKeys);
        checkedKeys.value = operationKeys;
        // 默认展开这些节点的父节点
        const parents = new Set<string>();
        const collectParents = (nodeId: string) => {
          const parentId = getParentKey(nodeId, treeData.value);
          if (parentId) {
            parents.add(parentId);
            collectParents(parentId);
          }
        };
        editableIds.forEach((id) => collectParents(id));
        // 将可编辑节点自身也添加到展开列表中
        editableIds.forEach((id) => parents.add(id));
        expandedKeys.value = [...parents];
        autoExpandParent.value = true;
      }
    }
  },
});

watch(searchValue, (value) => {
  const trimmedValue = value?.trim() || '';
  if (!trimmedValue) {
    expandedKeys.value = [];
    autoExpandParent.value = false;
    return;
  }

  // 找出所有匹配节点的父节点
  const expanded = dataList.value
    .filter((item) =>
      item.title.toLowerCase().includes(trimmedValue.toLowerCase()),
    )
    .map((item) => {
      const parentId = getParentKey(item.key, treeData.value);
      return parentId ?? item.key; // 如果没有父节点，返回当前节点的key
    })
    .filter(
      (item, i, self): item is string =>
        item !== undefined && self.indexOf(item) === i,
    );

  expandedKeys.value = expanded;
  autoExpandParent.value = true;
});

onMounted(() => {});
</script>
<template>
  <Modal class="h-[600px] w-[600px]" :title="modalTitle">
    <div class="tree-container">
      <div class="tree-container--header pb-2">
        <label class="text-[rgba(16, 16, 16, 1)] w-[90px] text-lg">
          菜单名称:
        </label>
        <!-- @press-enter="searchValue && queryMenuTree" -->
        <Input
          allow-clear
          v-model:value.lazy="searchValue"
          placeholder="回车搜索"
          style="width: 240px"
        />
        <Button type="primary" @click="queryMenuTree"> 查询 </Button>
      </div>
      <!-- title: 'label', -->
      <AntTree
        class="custom-tree"
        v-model:checked-keys="checkedKeys"
        v-model:expanded-keys="expandedKeys"
        checkable
        :auto-expand-parent="autoExpandParent"
        :tree-data="treeData"
        :field-names="{
          children: 'children',
          title: 'text',
          key: 'id',
        }"
        @expand="onExpand"
        data-testid="tree_department_addSensitiveFunctionToTF"
      >
        >
        <!-- 高亮搜索关键词 -->
        <!-- <template #title="{ text }">
          <span
            v-text="text"
            :style="
              searchTree && text.includes(searchTree)
                ? {
                    padding: '0 4px',
                    borderRadius: '4px',
                    backgroundColor: '#FFE6B0',
                  }
                : null
            "
          ></span>
        </template> -->
        <template #title="{ text }">
          <span
            v-if="
              searchValue &&
              text.toLowerCase().includes(searchValue.toLowerCase())
            "
          >
            {{
              text.substring(
                0,
                text.toLowerCase().indexOf(searchValue.toLowerCase()),
              )
            }}
            <span class="highlight-text">
              {{
                text.substring(
                  text.toLowerCase().indexOf(searchValue.toLowerCase()),
                  text.toLowerCase().indexOf(searchValue.toLowerCase()) +
                    searchValue.length,
                )
              }}
            </span>
            {{
              text.substring(
                text.toLowerCase().indexOf(searchValue.toLowerCase()) +
                  searchValue.length,
              )
            }}
          </span>
          <span v-else>{{ text }}</span>
        </template>
      </AntTree>
    </div>
  </Modal>
</template>
<style lang="less" scoped>
.tree-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  &--header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  ::v-deep(.ant-tree) {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }
}
.highlight-text {
  color: #f50;
  font-weight: 600;
  background-color: #ffe6b0;
  padding: 0 2px;
  border-radius: 2px;
}
</style>

<style lang="less">
.ant-tree.custom-tree {
  .ant-tree-treenode {
    align-items: center;
    max-width: 100%;
    padding: 2px;

    .ant-tree-switcher {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0; // 防止收缩
    }

    .ant-tree-checkbox {
      margin-block-start: 0;
    }

    .ant-tree-node-content-wrapper {
      // display: inline-block;
      // width: 100%;
      flex: 1; // 使用 flex 替代 width: 100%
      min-width: 0; // 允许文本省略
      height: 24px;
      line-height: 24px;
    }
  }
}
</style>
