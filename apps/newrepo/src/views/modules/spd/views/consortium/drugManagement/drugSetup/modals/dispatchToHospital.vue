<script setup lang="ts">
import { ref } from 'vue';

import { ChcSelect } from '@vben/chc-ui';
import { useVbenModal } from '@vben/common-ui';
import { isEmpty } from '@vben/utils';

import {
  Modal as AntModal,
  Tree as AntTree,
  // Checkbox,
  // CheckboxGroup,
  message,
} from 'ant-design-vue';

import { requestFormClient } from '#/api/request';
import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

interface WarehouseTreeNode {
  id: number;
  campusId?: number;
  label: string;
  type: 'campus' | 'warehouse' | any;
  children?: WarehouseTreeNode[];
}

const IMPORT_TIMEOUT_MS = 10 * 60 * 1000;

const modalData = ref<Record<string, any>>({});
const treeData = ref<any[]>([]);
const checkedKeys = ref<number[]>([]);
const formData = ref({
  replenishSource: undefined,
});

/**
 * 根据 warehouseType 将扁平的仓库列表分组为层级树结构
 * @param {any[]} warehouses - 原始 children 数组
 * @returns 分组后的层级节点数组
 */
const groupWarehousesByType = (warehouses: any[]) => {
  const typeMap: Record<number, { children: any[]; title: string }> = {
    1: { title: '一级库', children: [] },
    2: { title: '二级库', children: [] },
    3: { title: '三级库', children: [] },
  };

  warehouses.forEach((item: any) => {
    const wType = item.warehouseType;
    if (wType && typeMap[wType]) {
      typeMap[wType].children.push({
        ...item,
        title: item.label,
      });
    }
  });

  // 过滤掉没有子节点的层级，构建层级节点
  return Object.entries(typeMap)
    .filter(([, group]) => group.children.length > 0)
    .map(([type, group]) => ({
      id: `level_${type}`,
      label: group.title,
      type: `level_${type}`,
      children: group.children,
    }));
};

const getWarehouseData = async () => {
  try {
    console.warn('院区ID', modalData.value.campusId);
    const res = await requestFormClient.post(
      '/warehouseAction/getCampusWarehouseTree',
      {
        campusId: modalData.value.campusId,
      },
    );
    console.warn('获取仓库数据成功:', res);
    const rawData = res.data || [];
    // 对每个院区的 children 按 warehouseType 分组
    treeData.value = rawData.map((campus: any) => {
      if (campus.children && campus.children.length > 0) {
        return {
          ...campus,
          children: groupWarehousesByType(campus.children),
        };
      }
      return campus;
    });
    console.warn('treeData.value:', treeData.value);
  } catch (error) {
    console.error('获取仓库数据失败:', error);
    treeData.value = [];
  }
};

/**
 * 根据院区ID 筛选出对应院区下的仓库节点数组
 * @param {number} campusIds - 院区ID
 * @param {any[]} treeNodes - 原始的树形数据 treeData.value
 * @returns 过滤后的仓库节点数组
 */
// const filterWarehouseNodes = (
//   campusId: number,
//   treeNodes: WarehouseTreeNode[],
// ): WarehouseTreeNode[] => {
//   const warehouseNodes: WarehouseTreeNode[] = [];
//   // 使用递归函数来遍历整个树
//   const traverseTree = (nodes: WarehouseTreeNode[]) => {
//     if (!nodes || nodes.length === 0) {
//       return;
//     }
//     nodes.forEach((node: WarehouseTreeNode) => {
//       // 筛选出类型为 'campus' 且campusId匹配的节点
//       if (node.type === 'campus' && node.id === campusId) {
//         warehouseNodes.push(node);
//       }
//       if (node.children && node.children.length > 0) {
//         traverseTree(node.children);
//       }
//     });
//   };
//   traverseTree(treeNodes);
//   return warehouseNodes;
// };

/**
 * 从包含父节点和子节点ID的数组中，只筛选出类型为 'warehouse' 的节点ID
 * @param {number[]} allKeys - 包含所有选中ID的数组 checkedKeys.value
 * @param {any[]} treeNodes - 原始的树形数据 treeData.value
 * @returns {number[]} 只包含仓库ID的数组
 */
const getWarehouseIds = (
  allKeys: number[],
  treeNodes: WarehouseTreeNode[],
): number[] => {
  const idToNodeMap = new Map();
  // 使用递归函数来遍历整个树 set到Map
  const buildMap = (nodes: WarehouseTreeNode[]) => {
    if (!nodes || nodes.length === 0) {
      return;
    }
    nodes.forEach((node: WarehouseTreeNode) => {
      idToNodeMap.set(node.id, node);
      if (node.children && node.children.length > 0) {
        buildMap(node.children);
      }
    });
  };
  buildMap(treeNodes);
  // 从Map中筛选出类型为 'warehouse' 的节点ID
  const warehouseIds = allKeys.filter((key) => {
    const node = idToNodeMap.get(key);
    return node && node.type === 'warehouse';
  });
  return warehouseIds;
};

const [ChcGrid, chcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
    }),

    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      checkboxConfig: {
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
      pagerConfig: {
        enabled: false,
      },
    }),
    // 添加表格事件监听
    gridEvents: {},
  },
  {
    gridColumns: [
      {
        title: '序号',
        width: 50,
        align: 'center',
        field: 'index',
        formatter(scope: any) {
          return scope.rowIndex + 1;
        },
      },
      {
        field: 'insurance',
        title: '医保编码',
        width: 150,
      },
      {
        field: 'productCode',
        title: '药品编码',
        width: 80,
      },
      {
        field: 'name',
        title: '药品名称',
        width: 120,
      },
      {
        title: '通用名称',
        field: 'medicineName',
        width: 100,
      },
      {
        title: '拼音码',
        field: 'value',
        width: 50,
      },
      {
        title: '规格',
        field: 'productSpec',
        width: 50,
      },
      {
        title: '单位',
        field: 'uomName',
        width: 80,
      },
      {
        title: '最小单位',
        field: 'uomPrecision',
        width: 100,
      },
      {
        title: '最小单位转换比',
        field: 'baseUOMQty',
        width: 120,
      },
    ],
    formSchema: [],
    id: 'dispatchToHospitalGrid',
    showCustomBtn: false,
    showZoomBtn: false,
  },
);

const [Modal, modalApi] = useVbenModal({
  draggable: true,
  showConfirmButton: true,
  cancelText: '取消',
  confirmText: '确认',
  title: '药品目录下发',
  onCancel() {
    modalApi.close();
  },
  onClosed() {
    // message.info('onClosed：关闭动画结束');
  },
  onConfirm() {
    const warehouseIds = getWarehouseIds(checkedKeys.value, treeData.value);
    console.warn('选中的所有ID:', checkedKeys.value);
    console.warn('处理后只含仓库的ID:', warehouseIds);
    if (isEmpty(checkedKeys.value)) {
      message.error('请选择要下发的仓库');
      return;
    }
    if (!formData.value?.replenishSource) {
      message.error('请选择补货方式');
      return;
    }
    AntModal.confirm({
      title: '提示',
      content: '确认下发吗？',
      onOk: async () => {
        modalApi.setState({ loading: true });
        try {
          const params: Record<string, any> = {
            warehouseId: warehouseIds.join(','),
            productIds: modalData.value?.rows
              ?.map((item: any) => item.productId)
              .join(','),
            replenishSource: formData.value?.replenishSource,
          };
          console.warn('onConfirm params', params);
          await requestFormClient.post(
            '/warehouseAction/createWarehouseProductBatch',
            params,
            {
              timeout: IMPORT_TIMEOUT_MS,
            },
          );
          message.success('下发成功');
          modalApi.close();
          modalData.value?.callback?.();
        } catch (error) {
          console.error('下发失败', error);
        } finally {
          modalApi.setState({ loading: false });
        }
      },
    });
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const mData = modalApi.getData<Record<string, any>>();

      modalData.value = {};
      modalData.value = mData;
      console.warn('onOpenChange modalData', modalData.value);
      checkedKeys.value = [];
      getWarehouseData();
      setTimeout(() => {
        chcGridApi?.grid?.reloadData(modalData.value?.rows || []);
      }, 200);
    }
  },
});
</script>

<template>
  <Modal class="h-[800px] w-[80%]">
    <div class="box-border flex h-full w-full items-start justify-between">
      <div class="h-full w-2/3">
        <ChcGrid>
          <template #toolbar-actions>
            <div class="flex items-center">
              <span class="mr-2 whitespace-nowrap">
                共{{ modalData?.rows?.length || 0 }}条
              </span>
              <ChcSelect
                v-model="formData.replenishSource"
                dict-url="/warehouseAction/replenishSourceList.do"
                placeholder="请选择补货方式"
                class="box-border w-[200px]"
                :paginate="false"
                :immediate="true"
                :filter-by-front-end="true"
                :show-search="true"
                filter-field="label"
                label-field="name"
                value-field="id"
                :after-fetch="
                  (res: any) => {
                    // 将id和name为空的过滤掉
                    res.rows = res.rows.filter(
                      (item: any) => item.id && item.name,
                    );
                    return { ...res, rows: undefined, records: res.rows };
                  }
                "
              />
            </div>
          </template>
        </ChcGrid>
      </div>
      <div
        class="hospital-tree h-full w-1/3 border-l border-solid border-[#e5e5e5]"
      >
        <AntTree
          class="hospital-tree"
          v-model:checked-keys="checkedKeys"
          checkable
          :tree-data="treeData"
          :field-names="{
            children: 'children',
            title: 'label',
            key: 'id',
          }"
        />
      </div>
    </div>
  </Modal>
</template>

<style lang="less" scoped>
.ant-tree.hospital-tree {
  .ant-tree-treenode {
    align-items: center;
    width: 100%;
    padding: 2px;

    .ant-tree-switcher {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ant-tree-checkbox {
      margin-block-start: 0;
    }

    .ant-tree-node-content-wrapper {
      display: inline-block;
      width: 100%;
      height: 24px;
      line-height: 24px;
    }
  }
}
</style>
