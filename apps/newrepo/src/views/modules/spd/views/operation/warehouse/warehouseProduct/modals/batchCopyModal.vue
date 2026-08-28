<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { VbenIcon } from '@vben-core/shadcn-ui';

import { Button, Checkbox, Input, message, Modal } from 'ant-design-vue';

import { getWarehouseList, saveWarehouseProductBatchCopy } from '../api';

// 数据接口定义
interface TransferItem {
  allowPRUpdateVendor: string;
  id: number;
  isBPartnerProductControl: string;
  isLPackageQtyPO: string;
  isNoProtocolPo: string;
  isUseMonthlyWO: string;
  linkBpartnerId: number;
  name: string;
  parentId: number;
  warehouseType: string;
}

const modalData = ref<Record<string, any>>({});
const modalTitle = ref('');

// 左右两侧数据
const leftDataSource = ref<TransferItem[]>([]);
const rightDataSource = ref<TransferItem[]>([]);

// 选中的keys
const leftSelectedKeys = ref<Array<number | string>>([]);
const rightSelectedKeys = ref<Array<number | string>>([]);

// 搜索关键字
const leftSearchValue = ref('');
const rightSearchValue = ref('');

// 计算属性:过滤后的数据
const filteredLeftData = computed(() => {
  if (!leftSearchValue.value) return leftDataSource.value;
  return leftDataSource.value.filter((item) =>
    item.name.toLowerCase().includes(leftSearchValue.value.toLowerCase()),
  );
});

const filteredRightData = computed(() => {
  if (!rightSearchValue.value) return rightDataSource.value;
  return rightDataSource.value.filter((item) =>
    item.name.toLowerCase().includes(rightSearchValue.value.toLowerCase()),
  );
});

// 全选状态
const leftCheckAll = computed({
  get: () =>
    filteredLeftData.value.length > 0 &&
    leftSelectedKeys.value.length === filteredLeftData.value.length,
  set: (val) => {
    leftSelectedKeys.value = val
      ? filteredLeftData.value.map((item) => item.id)
      : [];
  },
});

const rightCheckAll = computed({
  get: () =>
    filteredRightData.value.length > 0 &&
    rightSelectedKeys.value.length === filteredRightData.value.length,
  set: (val) => {
    rightSelectedKeys.value = val
      ? filteredRightData.value.map((item) => item.id)
      : [];
  },
});

// 按钮禁用状态
const moveToRightDisabled = computed(() => leftSelectedKeys.value.length === 0);
const moveToLeftDisabled = computed(() => rightSelectedKeys.value.length === 0);
const moveUpDisabled = computed(() => {
  if (leftSelectedKeys.value.length === 0) return true;
  // 如果第一项被选中,则不能上移
  const firstIndex = leftDataSource.value.findIndex(
    (item) => item.id === leftSelectedKeys.value[0],
  );
  return firstIndex === 0;
});
const moveDownDisabled = computed(() => {
  if (leftSelectedKeys.value.length === 0) return true;
  // 如果最后一项被选中,则不能下移
  const lastKey = leftSelectedKeys.value[leftSelectedKeys.value.length - 1];
  const lastIndex = leftDataSource.value.findIndex(
    (item) => item.id === lastKey,
  );
  return lastIndex === leftDataSource.value.length - 1;
});

// 加载仓库数据
const loadWarehouseData = async () => {
  try {
    const result = await getWarehouseList();
    if (result && result.success) {
      leftDataSource.value = result.rows || [];
      rightDataSource.value = [];
      leftSelectedKeys.value = [];
      rightSelectedKeys.value = [];
      leftSearchValue.value = '';
      rightSearchValue.value = '';
    }
  } catch {
    message.error('加载仓库数据失败');
  }
};

// 向右移动
const handleMoveToRight = () => {
  const selectedItems = leftDataSource.value.filter((item) =>
    leftSelectedKeys.value.includes(item.id),
  );
  rightDataSource.value = [...rightDataSource.value, ...selectedItems];
  leftDataSource.value = leftDataSource.value.filter(
    (item) => !leftSelectedKeys.value.includes(item.id),
  );
  leftSelectedKeys.value = [];
};

// 向左移动
const handleMoveToLeft = () => {
  const selectedItems = rightDataSource.value.filter((item) =>
    rightSelectedKeys.value.includes(item.id),
  );
  leftDataSource.value = [...leftDataSource.value, ...selectedItems];
  rightDataSource.value = rightDataSource.value.filter(
    (item) => !rightSelectedKeys.value.includes(item.id),
  );
  rightSelectedKeys.value = [];
};

// 上移
const handleMoveUp = () => {
  const newData = [...leftDataSource.value];
  const selectedSet = new Set(leftSelectedKeys.value);

  for (let i = 1; i < newData.length; i++) {
    if (selectedSet.has(newData[i].id) && !selectedSet.has(newData[i - 1].id)) {
      // 交换位置
      [newData[i], newData[i - 1]] = [newData[i - 1], newData[i]];
    }
  }
  leftDataSource.value = newData;
};

// 下移
const handleMoveDown = () => {
  const newData = [...leftDataSource.value];
  const selectedSet = new Set(leftSelectedKeys.value);

  for (let i = newData.length - 2; i >= 0; i--) {
    if (selectedSet.has(newData[i].id) && !selectedSet.has(newData[i + 1].id)) {
      // 交换位置
      [newData[i], newData[i + 1]] = [newData[i + 1], newData[i]];
    }
  }
  leftDataSource.value = newData;
};

// 复选框变化
const handleLeftCheckChange = (checked: boolean, value: number | string) => {
  if (checked) {
    leftSelectedKeys.value.push(value);
  } else {
    leftSelectedKeys.value = leftSelectedKeys.value.filter(
      (key) => key !== value,
    );
  }
};

const handleRightCheckChange = (checked: boolean, value: number | string) => {
  if (checked) {
    rightSelectedKeys.value.push(value);
  } else {
    rightSelectedKeys.value = rightSelectedKeys.value.filter(
      (key) => key !== value,
    );
  }
};

const [ModalFirst, modalApi] = useVbenModal({
  showConfirmButton: true,
  confirmDisabled: false,
  showCancelButton: true,
  cancelText: '关闭',
  confirmText: '保存',
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      modalData.value = {};
      modalData.value = modalApi.getData<Record<string, any>>();
      console.warn('onOpenChange modalData', modalData.value);
      modalTitle.value = modalData.value.modalTitle;
      // 加载仓库数据
      loadWarehouseData();
    }
  },
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {
    if (rightDataSource.value.length === 0) {
      Modal.error({
        title: '提示',
        content: '请至少选择一个仓库',
        centered: true,
      });
      return;
    }
    const records = modalData.value.rows;
    if (!records || records.length === 0) {
      Modal.error({
        title: '提示',
        content: '未选择库备目录商品',
        centered: true,
      });
      return;
    }
    try {
      // 仓库id
      const warehouseIds = rightDataSource.value.map((item) => item.id);
      // 商品ID
      const replenishIds = records.map((item) => item.replenishId);
      const params = {
        warehouseIds: JSON.stringify(warehouseIds),
        replenishIds: JSON.stringify(replenishIds),
      };
      const result = await saveWarehouseProductBatchCopy(params);
      if (result && result.success) {
        message.success('操作成功');
        modalApi.close();
        // 回调刷新列表
        if (modalData.value.callback) {
          modalData.value.callback();
        }
      }
    } catch {
      message.error('操作失败');
    }
  },
});

onMounted(() => {});
</script>
<template>
  <ModalFirst :title="modalTitle" class="h-[500px] w-[800px]">
    <!--
    <Transfer
    v-model:target-keys="targetKeys"
    :data-source="mockData"
    :titles="['待选仓库', '已选仓库']"
    show-search
     :list-style="{
      width: '45%',
      height: '350px',
    }"
    :filter-option="filterOption"
    :render="item => item.title"
    class="custom-transfer"
    @change="handleChange"
    @search="handleSearch"
  />
  -->
    <div class="custom-transfer-container">
      <!-- 左侧面板 -->
      <div class="transfer-panel">
        <div class="panel-header">
          <Checkbox
            v-model:checked="leftCheckAll"
            class="select-all"
            data-testid="checkbox_leftCheckAll_batchCopyModal"
          >
            待选仓库
          </Checkbox>
          <span class="count-text">{{ leftDataSource.length }}项</span>
        </div>
        <div class="panel-search">
          <Input
            v-model:value="leftSearchValue"
            placeholder="请输入搜索关键词"
            allow-clear
            data-testid="input_leftSearch_batchCopyModal"
          />
        </div>
        <div class="panel-body">
          <div
            v-for="(item, index) in filteredLeftData"
            :key="item.id"
            class="transfer-item"
            :class="{ selected: leftSelectedKeys.includes(item.id) }"
          >
            <Checkbox
              :checked="leftSelectedKeys.includes(item.id)"
              @change="
                (e: any) => handleLeftCheckChange(e.target.checked, item.id)
              "
              :data-testid="`checkbox_leftItem_${index}_batchCopyModal`"
            >
              {{ item.name }}
            </Checkbox>
          </div>
          <div v-if="filteredLeftData.length === 0" class="empty-text">
            暂无数据
          </div>
        </div>
      </div>

      <!-- 中间操作按钮 -->
      <div class="transfer-operations">
        <Button
          class="operation-btn"
          :disabled="moveToRightDisabled"
          @click="handleMoveToRight"
          size="small"
          data-testid="button_moveToRight_batchCopyModal"
        >
          <VbenIcon
            icon="ep:arrow-right"
            class="size-7 transition-all duration-300 group-hover:scale-125"
          />
        </Button>
        <Button
          class="operation-btn"
          :disabled="moveToLeftDisabled"
          @click="handleMoveToLeft"
          size="small"
          data-testid="button_moveToLeft_batchCopyModal"
        >
          <VbenIcon
            icon="ep:arrow-left"
            class="size-7 transition-all duration-300 group-hover:scale-125"
          />
        </Button>
        <Button
          class="operation-btn"
          :disabled="moveUpDisabled"
          @click="handleMoveUp"
          size="small"
          data-testid="button_moveUp_batchCopyModal"
        >
          <VbenIcon
            icon="ep:arrow-up"
            class="size-7 transition-all duration-300 group-hover:scale-125"
          />
        </Button>
        <Button
          class="operation-btn"
          :disabled="moveDownDisabled"
          @click="handleMoveDown"
          size="small"
          data-testid="button_moveDown_batchCopyModal"
        >
          <VbenIcon
            icon="ep:arrow-down"
            class="size-7 transition-all duration-300 group-hover:scale-125"
          />
        </Button>
      </div>

      <!-- 右侧面板 -->
      <div class="transfer-panel">
        <div class="panel-header">
          <Checkbox
            v-model:checked="rightCheckAll"
            class="select-all"
            data-testid="Checkbox_rightCheckAll_batchCopyModal"
          >
            已选仓库
          </Checkbox>
          <span class="count-text">{{ rightDataSource.length }}项</span>
        </div>
        <div class="panel-search">
          <Input
            v-model:value="rightSearchValue"
            placeholder="请输入搜索关键词"
            allow-clear
            data-testid="input_rightSearch_batchCopyModal"
          />
        </div>
        <div class="panel-body">
          <div
            v-for="(item, index) in filteredRightData"
            :key="item.id"
            class="transfer-item"
            :class="{ selected: rightSelectedKeys.includes(item.id) }"
          >
            <Checkbox
              :checked="rightSelectedKeys.includes(item.id)"
              @change="
                (e: any) => handleRightCheckChange(e.target.checked, item.id)
              "
              :data-testid="`checkbox_rightItem_${index}_batchCopyModal`"
            >
              {{ item.name }}
            </Checkbox>
          </div>
          <div v-if="filteredRightData.length === 0" class="empty-text">
            暂无数据
          </div>
        </div>
      </div>
    </div>
  </ModalFirst>
</template>

<style scoped lang="less">
// ::v-deep(.ant-btn > svg) {
//   margin-bottom: 4px;
//   margin-left: -2px;
// }

// .custom-transfer{
//   justify-content: space-around;
//   ::v-deep(.ant-btn-sm) {
//     width: 30px;
//     height: 30px;
//   }
// }
//
.custom-transfer-container {
  display: flex;
  justify-content: space-around;
  align-items: stretch;
  height: 350px;
  padding: 20px 0;
}

.transfer-panel {
  width: 45%;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  background: #fff;

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px solid #f0f0f0;
    background: #fafafa;

    .select-all {
      font-weight: 500;
    }

    .count-text {
      color: rgba(0, 0, 0, 0.45);
      font-size: 12px;
    }
  }

  .panel-search {
    padding: 8px 12px;
    border-bottom: 1px solid #f0f0f0;
  }

  .panel-body {
    flex: 1;
    overflow-y: auto;
    padding: 4px 0;

    .transfer-item {
      padding: 4px 12px;
      cursor: pointer;
      transition: background-color 0.3s;
      :deep(.ant-checkbox-wrapper) {
        display: flex;
        // 第二个span标签
        span:nth-child(2) {
          flex: 1;
          text-align: end;
        }
      }

      &:hover {
        background-color: #f5f5f5;
      }

      &.selected {
        background-color: #e6f7ff;
      }
    }

    .empty-text {
      text-align: center;
      color: rgba(0, 0, 0, 0.25);
      padding: 32px 0;
    }
  }
}

.transfer-operations {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 0 16px;

  .operation-btn {
    width: 32px;
    height: 32px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    .icon {
      font-size: 14px;
      line-height: 1;
    }

    &:disabled {
      .icon {
        color: rgba(0, 0, 0, 0.25);
      }
    }
  }
}

// 滚动条美化
.panel-body::-webkit-scrollbar {
  width: 6px;
}

.panel-body::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.panel-body::-webkit-scrollbar-track {
  background-color: #f0f0f0;
}
</style>
