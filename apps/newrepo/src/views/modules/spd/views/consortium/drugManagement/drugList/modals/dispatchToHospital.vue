<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { isEmpty } from '@vben/utils';

import { Modal as AntModal, Tree as AntTree, message } from 'ant-design-vue';

import { requestFormClient } from '#/api/request';
import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';



const IMPORT_TIMEOUT_MS = 10 * 60 * 1000;


const modalData = ref<Record<string, any>>({});

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
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'insurance',
        title: '医保编码',
        // width: 150,
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
    id: 'drugList_dispatchToHospital',
    showCustomBtn: false,
    showZoomBtn: false,
  },
);
const treeData: any = ref([]);
const checkedKeys = ref<string[]>([]);
const getTreeData = async () => {
  try {
    const res = await requestFormClient.post('/mcOrgAction/getOrgTree.do');
    // treeData.value = res?.data || [];
    // 添加唯一 key
    treeData.value = addUniqueKeyToTree(res?.data || []);
    console.warn('treeData', treeData.value);
  } catch (error) {
    console.error('获取医院树失败', error);
  }
};

/**
 * 为树形结构添加唯一的key，避免不同层级存在相同的id造成污染
 * @param treeData 树形结构数据
 * @param parentPath 父节点的路径，用于构建唯一key
 * @returns 处理后的树形结构数据
 */
const addUniqueKeyToTree = (
  treeData: any[],
  parentPath: string = '',
): any[] => {
  return treeData.map((node) => {
    // 构建唯一的key: type-id 或者 parentPath-type-id
    const currentKey = parentPath
      ? `${parentPath}-${node.type}-${node.id}`
      : `${node.type}-${node.id}`;
    const processNodes = {
      ...node,
      key: currentKey, // 唯一的id
      originalId: node.id, // 保留原始id
    };
    // 递归处理子节点
    if (node.children && Array.isArray(node.children)) {
      processNodes.children = addUniqueKeyToTree(node.children, currentKey);
    }
    return processNodes;
  });
};

/**
 * 从选中的keys中提取出对应的id
 */
const extractIdsFromKeys = (
  selectedKeys: string[],
  treeData: any[],
): number[] => {
  const result: number[] = [];
  const keyMap = new Map<string, { id: number; type: string }>();
  const buildKeyMap = (nodes: any[]) => {
    nodes.forEach((node) => {
      keyMap.set(node.key, { id: node.originalId || node.id, type: node.type });
      if (node.children) {
        buildKeyMap(node.children);
      }
    });
  };
  buildKeyMap(treeData);
  selectedKeys.forEach((key) => {
    const node = keyMap.get(key);
    // 只添加 type 为 'campus' 的节点
    if (node && node.type === 'campus') {
      result.push(node.id);
    }
  });
  return result;
};

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
    // message.info('onConfirm');
    // modalApi.close();
    console.warn('onConfirm checkedKeys', checkedKeys.value);
    const campusIds = extractIdsFromKeys(checkedKeys.value, treeData.value);
    console.warn('campusIds:', campusIds);
    if (isEmpty(campusIds)) {
      message.error('请选择医共体');
      return;
    }
    AntModal.confirm({
      title: '提示',
      content: '确认下发吗？',
      onOk: async () => {
        modalApi.setState({ loading: true });
        try {
          const params: Record<string, any> = {
            campusIds: JSON.stringify(campusIds),
            productIds: JSON.stringify(
              modalData.value?.rows?.map((item: any) => item.productId),
            ),
          };
          console.warn('onConfirm params', params);
          await requestFormClient.post(
            '/mcProductAction/bindProductToCampus.do',
            params,
            {
               timeout: IMPORT_TIMEOUT_MS
            }
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
      checkedKeys.value = [];
      getTreeData();
      console.warn('modalData', modalData);
      console.warn('onOpenChange modalData', modalData.value);
      setTimeout(() => {
        chcGridApi?.grid?.reloadData(modalData.value?.rows || []);
      }, 200);
    }
  },
});
onMounted(() => {});
</script>
<template>
  <Modal class="h-[800px] w-[80%]">
    <div class="box-border flex h-full w-full items-start justify-between">
      <ChcGrid class="h-full w-2/3">
        <template #toolbar-actions>
          <div>共{{ modalData?.rows?.length || 0 }}条</div>
        </template>
      </ChcGrid>
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
            key: 'key',
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
