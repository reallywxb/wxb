<script lang="ts" setup>
import type { NodeCheckerItem } from '../api';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { VbenIcon } from '@vben-core/shadcn-ui';

import { Button, Checkbox, Input, message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { queryNodeChecker, saveWorkFlow } from '../api';

const emit = defineEmits(['close']);
const modalData = ref<any>({});
const modalTitle = ref('');
// const AD_WF_Responsible_ID = ref<number>(0);

// 节点审核人穿梭框数据
const leftDataSource = ref<NodeCheckerItem[]>([]);
const rightDataSource = ref<NodeCheckerItem[]>([]);

// 选中的keys
const leftSelectedKeys = ref<Array<number | string>>([]);
const rightSelectedKeys = ref<Array<number | string>>([]);

// 搜索关键字
const leftSearchValue = ref('');
const rightSearchValue = ref('');

// 计算属性(存储过滤后的数据)
const filteredLeftData = computed(() => {
  if (!leftSearchValue.value) return leftDataSource.value;
  return leftDataSource.value.filter((item) =>
    item.title.toLowerCase().includes(leftSearchValue.value.toLowerCase()),
  );
});

const filteredRightData = computed(() => {
  if (!rightSearchValue.value) return rightDataSource.value;
  return rightDataSource.value.filter((item) =>
    item.title.toLowerCase().includes(rightSearchValue.value.toLowerCase()),
  );
});

// 全选
const leftCheckAll = computed({
  get: () =>
    filteredLeftData.value.length > 0 &&
    leftSelectedKeys.value.length === filteredLeftData.value.length,
  set: (val) => {
    leftSelectedKeys.value = val
      ? filteredLeftData.value.map((item) => item.value)
      : [];
  },
});

const rightCheckAll = computed({
  get: () =>
    filteredRightData.value.length > 0 &&
    rightSelectedKeys.value.length === filteredRightData.value.length,
  set: (val) => {
    rightSelectedKeys.value = val
      ? filteredRightData.value.map((item) => item.value)
      : [];
  },
});

// 中间按钮禁用状态
const moveToRightDisabled = computed(() => leftSelectedKeys.value.length === 0);
const moveToLeftDisabled = computed(() => rightSelectedKeys.value.length === 0);
const moveUpDisabled = computed(() => {
  if (rightSelectedKeys.value.length === 0) return true;
  // 如果第一项被选中,则不能上移
  const firstIndex = rightDataSource.value.findIndex(
    (item) => item.value === rightSelectedKeys.value[0],
  );
  return firstIndex === 0;
});
const moveDownDisabled = computed(() => {
  if (rightSelectedKeys.value.length === 0) return true;
  // 如果最后一项被选中,则不能下移
  const lastKey = rightSelectedKeys.value[rightSelectedKeys.value.length - 1];
  const lastIndex = rightDataSource.value.findIndex(
    (item) => item.value === lastKey,
  );
  return lastIndex === rightDataSource.value.length - 1;
});

// 向右移动
const handleMoveToRight = () => {
  const selectedItems = leftDataSource.value.filter((item) =>
    leftSelectedKeys.value.includes(item.value),
  );
  rightDataSource.value = [...rightDataSource.value, ...selectedItems];
  leftDataSource.value = leftDataSource.value.filter(
    (item) => !leftSelectedKeys.value.includes(item.value),
  );
  leftSelectedKeys.value = [];
};

// 向左移动
const handleMoveToLeft = () => {
  const selectedItems = rightDataSource.value.filter((item) =>
    rightSelectedKeys.value.includes(item.value),
  );
  leftDataSource.value = [...leftDataSource.value, ...selectedItems];
  rightDataSource.value = rightDataSource.value.filter(
    (item) => !rightSelectedKeys.value.includes(item.value),
  );
  rightSelectedKeys.value = [];
};

// 上移
const handleMoveUp = () => {
  const newData: NodeCheckerItem[] = [...rightDataSource.value];
  const selectedSet = new Set<number | string>(rightSelectedKeys.value);

  for (let i = 1; i < newData.length; i++) {
    // const currentItem = newData[i];
    // const prevItem = newData[i]
    if (
      selectedSet.has(newData[i].value) &&
      !selectedSet.has(newData[i - 1].value)
    ) {
      // 交换位置
      [newData[i], newData[i - 1]] = [newData[i - 1], newData[i]];
    }
  }
  rightDataSource.value = newData;
};

// 下移
const handleMoveDown = () => {
  const newData = [...rightDataSource.value];
  const selectedSet = new Set(rightSelectedKeys.value);

  for (let i = newData.length - 2; i >= 0; i--) {
    if (
      selectedSet.has(newData[i].value) &&
      !selectedSet.has(newData[i + 1].value)
    ) {
      // 交换位置
      [newData[i], newData[i + 1]] = [newData[i + 1], newData[i]];
    }
  }
  rightDataSource.value = newData;
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

// 加载审核人数据
const loadNodeCheckerData = async () => {
  try {
    // 如果是编辑模式，传入 AD_WF_Responsible_ID
    const AD_WF_Responsible_ID =
      modalData.value.modalType === 'EDIT' &&
      modalData.value.row?.AD_WF_Responsible_ID
        ? modalData.value.row.AD_WF_Responsible_ID
        : 0;
    const result = await queryNodeChecker({ AD_WF_Responsible_ID });
    if (result && result.success && result.rows) {
      const allData: NodeCheckerItem[] = result.rows || [];
      // 分离已选和未选的数据
      const selectedData: NodeCheckerItem[] = [];
      const unselectedData: NodeCheckerItem[] = [];
      allData.forEach((item) => {
        if (item.check && item.check === 'Y') {
          selectedData.push(item);
        } else {
          unselectedData.push(item);
        }
      });
      // 清空已选和未选数据
      leftDataSource.value = unselectedData;
      rightDataSource.value = selectedData;
      leftSelectedKeys.value = [];
      rightSelectedKeys.value = [];
      leftSearchValue.value = '';
      rightSearchValue.value = '';
    }
  } catch (error) {
    message.error('加载审核人数据失败');
    console.error('loadNodeCheckerData error:', error);
  }
};

const [Modal, modalApi] = useVbenModal({
  showConfirmButton: false,
  cancelText: '关闭',
  onCancel() {
    modalApi.close();
  },
  onClosed() {
    // 关闭时清空数据
    leftDataSource.value = [];
    rightDataSource.value = [];
    leftSelectedKeys.value = [];
    rightSelectedKeys.value = [];
    leftSearchValue.value = '';
    rightSearchValue.value = '';
  },
  onConfirm() {
    // 使用自定义按钮
  },

  onOpenChange(isOpen) {
    if (isOpen) {
      modalData.value = modalApi.getData<Record<string, any>>();
      console.warn('modalData:', modalData.value);
      modalTitle.value = modalData.value.modalTitle;
      if (!modalData.value.row.Value) {
        message.error('未获取到工作流编码！');
        return;
      }
      if (!modalData.value.row.Name) {
        message.error('未获取到工作流名称！');
        return;
      }
      // 设置表单初始值
      setTimeout(() => {
        const formValues: any = {
          WorkflowName: modalData.value.row.Name,
        };
        // 如果是编辑模式，填充节点名称和ID
        if (modalData.value.modalType === 'EDIT' && modalData.value.row) {
          formValues.Name = modalData.value.row.ApprovalName;
          formValues.AD_WF_Node_ID = modalData.value.row.AD_WF_Node_ID;
        }
        baseFormApi.setValues(formValues);
      }, 100);
      // 加载审核人数据
      loadNodeCheckerData();
    }
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },
});
const [BaseForm, baseFormApi] = useVbenForm({
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 在label后显示一个冒号
    colon: true,
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },

  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行
  actionWrapperClass: 'formActionAreaStyle',
  layout: 'horizontal',

  showCollapseButton: false,
  showDefaultActions: false,
  schema: [
    {
      component: 'Input',
      fieldName: 'WorkflowName',
      label: '工作流',
      rules: 'required',
      formItemClass: 'input-nostyle pb-1',
      componentProps: () => {
        return {
          placeholder: '',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'Name',
      label: '节点名称',
      rules: 'required',
      componentProps: () => {
        return {
          placeholder: '请输入节点名称',
        };
      },
    },
    // 隐藏字段，仅用于编辑时传递ID
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入',
        maxlength: 60,
      },
      fieldName: 'AD_WF_Node_ID',
      formItemClass: 'pl-[10px] pr-[10px] hidden',
      labelClass: 'leading-1 mb-[0px] pl-[4px] w-[90px]',
      label: 'AD_WF_Node_ID',
    },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-1',
});

// 保存
async function onSubmit() {
  try {
    // 验证表单
    const validateResult = await baseFormApi.validate();
    if (!validateResult.valid) return;
    // 验证是否选择了审核人
    if (!rightDataSource.value || rightDataSource.value.length === 0) {
      message.error('请选择审核人');
      return;
    }
    // 获取表单数据
    const formData = await baseFormApi.getValues();
    // 拼接审核人ID字符串
    const nodeChecker = rightDataSource.value
      .map((item) => item.value)
      .join(',');
    // 组装入参
    const params: any = {
      NodeChecker: nodeChecker,
      WfValue: modalData.value.row.Value,
      NodeName: formData.Name,
    };
    if (modalData.value.modalType === 'EDIT' && formData.AD_WF_Node_ID) {
      params.AD_WF_Node_ID = formData.AD_WF_Node_ID;
    }
    console.warn('params:', params);
    const result = await saveWorkFlow(params);
    if (result && result.success) {
      message.success('保存成功');
      modalApi.close();
      if (modalData.value.callback) {
        modalData.value.callback();
      }
      emit('close');
    } else {
      message.error(result?.message || '保存失败');
    }
  } catch (error) {
    console.error('onSubmit error:', error);
    message.error('保存失败');
  }
}
</script>
<template>
  <Modal class="w-[650px]" :title="modalTitle" title-tooltip="">
    <BaseForm />
    <div class="custom-form-item">
      <label for="" class="custom-label">
        <!-- custom-label -->
        <span>*</span>节点审核人:&nbsp;
      </label>
      <div class="custom-transfer-container">
        <!-- 左侧面板 -->
        <div class="transfer-panel">
          <div class="panel-header">
            <Checkbox
              v-model:checked="leftCheckAll"
              class="select-all"
              data-testid="checkbox_leftCheckAll_workflowFormModal"
            >
              待选审核人
            </Checkbox>
            <span class="count-text">{{ leftDataSource.length }}项</span>
          </div>
          <div class="panel-search">
            <Input
              v-model:value="leftSearchValue"
              placeholder="请输入搜索关键词"
              allow-clear
              data-testid="input_leftSearch_workflowFormModal"
            >
              <template #prefix>
                <VbenIcon icon="ion:search-outline" class="search-icon" />
              </template>
            </Input>
          </div>
          <div class="panel-body">
            <div
              v-for="(item, index) in filteredLeftData"
              :key="item.value"
              class="transfer-item"
              :class="{ selected: leftSelectedKeys.includes(item.value) }"
            >
              <Checkbox
                :checked="leftSelectedKeys.includes(item.value)"
                @change="
                  (e: any) =>
                    handleLeftCheckChange(e.target.checked, item.value)
                "
                :data-testid="`checkbox_leftItem_${index}_workflowFormModal`"
              >
                {{ item.title }}
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
            data-testid="button_moveToRight_workflowFormModal"
          >
            <!-- <span class="icon">▶</span> -->
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
            data-testid="button_moveToLeft_workflowFormModal"
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
            data-testid="button_moveUp_workflowFormModal"
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
            data-testid="button_moveDown_workflowFormModal"
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
              data-testid="checkbox_rightCheckAll_workflowFormModal"
            >
              已选审核人
            </Checkbox>
            <span class="count-text">{{ rightDataSource.length }}项</span>
          </div>
          <div class="panel-search">
            <Input
              v-model:value="rightSearchValue"
              placeholder="请输入搜索关键词"
              allow-clear
              data-testid="input_rightSearch_workflowFormModal"
            >
              <template #prefix>
                <VbenIcon icon="ion:search-outline" class="search-icon" />
              </template>
            </Input>
          </div>
          <div class="panel-body">
            <div
              v-for="(item, index) in filteredRightData"
              :key="item.value"
              class="transfer-item"
              :class="{ selected: rightSelectedKeys.includes(item.value) }"
            >
              <Checkbox
                :checked="rightSelectedKeys.includes(item.value)"
                @change="
                  (e: any) =>
                    handleRightCheckChange(e.target.checked, item.value)
                "
                :data-testid="`checkbox_rightItem_${index}_workflowFormModal`"
              >
                {{ item.title }}
              </Checkbox>
            </div>
            <div v-if="filteredRightData.length === 0" class="empty-text">
              暂无数据
            </div>
          </div>
        </div>
      </div>
    </div>
    <template #prepend-footer>
      <Button
        type="primary"
        @click="onSubmit"
        data-testid="button_save_workflowFormModal"
      >
        保存
      </Button>
    </template>
  </Modal>
</template>
<style scoped lang="scss">
::v-deep(.input-nostyle .ant-input) {
  pointer-events: none;
  cursor: default;
  background-color: transparent !important;
  border: none !important;
}

.custom-form-item {
  display: flex;
  margin-bottom: 16px;

  .custom-label {
    flex-shrink: 0;
    width: 100px;
    margin-right: 8px;
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
    text-align: right;

    span {
      color: red;
    }
  }
}

.custom-transfer-container {
  display: flex;
  flex: 1;
  align-items: stretch;
  justify-content: space-between;
  height: 300px;
}

.transfer-panel {
  display: flex;
  flex-direction: column;
  width: 45%;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: #fafafa;
    border-bottom: 1px solid #f0f0f0;

    .select-all {
      display: flex;
      flex: 1;
      align-items: center;
      font-weight: 500;
      color: #ff5722;
      // 第二个span标签
      ::v-deep(span:nth-child(2)) {
        flex: 1;
        text-align: end;
      }
    }

    .count-text {
      font-size: 12px;
      color: rgb(0 0 0 / 45%);
    }
  }

  .panel-search {
    padding: 8px 12px;
    border-bottom: 1px solid #f0f0f0;
  }

  .panel-body {
    flex: 1;
    padding: 4px 0;
    overflow-y: auto;

    .transfer-item {
      padding: 4px 12px;
      cursor: pointer;
      transition: background-color 0.3s;

      :deep(.ant-checkbox-wrapper) {
        display: flex;
        width: 100%;
        // 第二个span标签
        span:nth-child(2) {
          flex: 1;
          text-align: end;
        }
      }
      // 文字样式
      .item-title {
        flex: 1;
        margin-left: 8px;
        overflow: hidden;
        text-overflow: ellipsis;
        text-align: right; // 文字右对齐
        white-space: nowrap;
      }

      &:hover {
        background-color: #f5f5f5;
      }

      &.selected {
        background-color: #e6f7ff;
      }
    }

    .empty-text {
      padding: 32px 0;
      color: rgb(0 0 0 / 25%);
      text-align: center;
    }
  }
}

.transfer-operations {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  justify-content: center;
  padding: 0 16px;

  .operation-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;

    &:disabled {
      opacity: 0.4;
    }
  }
}

// 滚动条美化
.panel-body::-webkit-scrollbar {
  width: 6px;
}

.panel-body::-webkit-scrollbar-thumb {
  background-color: rgb(0 0 0 / 20%);
  border-radius: 3px;
}

.panel-body::-webkit-scrollbar-track {
  background-color: #f0f0f0;
}
</style>
