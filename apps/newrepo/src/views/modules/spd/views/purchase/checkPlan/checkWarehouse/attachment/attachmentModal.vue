<script lang="ts" setup>
import { computed, nextTick, ref, useTemplateRef } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { RadioButton, RadioGroup } from 'ant-design-vue';

import actionDeliveryLogCom from './actionDeliveryLogModal.vue';
import actionLotLogCom from './actionLotLogModal.vue';
import actionVarietyLogCom from './actionVarietyLogModal.vue';

const modalOuterData = ref();
const visible = ref<boolean>(false);

const [Modal, modalApi] = useVbenModal({
  draggable: true,
  showConfirmButton: false,
  cancelText: '关闭',
  onCancel() {
    modalApi.close();
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },

  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const modalData = modalApi.getData<Record<string, any>>();
      modalOuterData.value = modalData;
      visible.value = false;
      searchForm.value = modalData;
      currentTab.value = TabVal.actionVarietyLogModal;
      setTimeout(() => {
        radioChange();
      }, 200);
    }
  },
});

// 子表组件隐射
const TabVal = {
  actionVarietyLogModal: 'actionVarietyLogModal', // 品种附件
  actionLotLogModal: 'actionLotLogModal', // 批次附件
  actionDeliveryLogModal: 'actionDeliveryLogModal', // 配送附件
} as const;

// 子表头部切换
const headerTabs = ref([
  {
    label: '品种附件',
    value: 'actionVarietyLogModal',
    disabled: false,
  },
  {
    label: '批次附件',
    value: 'actionLotLogModal',
    disabled: false,
  },
  {
    label: '配送附件',
    value: 'actionDeliveryLogModal',
    disabled: false,
  },
]);

// 子表头部切换默认值
const currentTab = ref<(typeof TabVal)[keyof typeof TabVal]>(
  TabVal.actionVarietyLogModal,
);

const actionVarietyLogComRef = useTemplateRef<
  InstanceType<typeof actionVarietyLogCom>
>('actionVarietyLogComRef');

const actionLotLogComRef =
  useTemplateRef<InstanceType<typeof actionLotLogCom>>('actionLotLogComRef');

const actionDeliveryLogComRef = useTemplateRef<
  InstanceType<typeof actionDeliveryLogCom>
>('actionDeliveryLogComRef');

const searchForm = ref({});


// 获取当前组件的引用
// const currentComponentRef =

// 修改 radioChange 函数
const radioChange = () => {
  // 完全移除 currentComponentRef 计算属性
  console.warn('currentTab.value', currentTab.value);
  nextTick(() => {
    let componentRef = null;
    switch (currentTab.value) {
      case TabVal.actionDeliveryLogModal: {
        componentRef = actionDeliveryLogComRef.value;
        break;
      }
      case TabVal.actionLotLogModal: {
        componentRef = actionLotLogComRef.value;
        break;
      }
      case TabVal.actionVarietyLogModal: {
        componentRef = actionVarietyLogComRef.value;
        break;
      }
    }
    if (componentRef?.handleQuery) {
      componentRef.handleQuery(searchForm.value);
    }
  });
};

// const radioChange  = () => {
//   console.warn('currentTab.value', currentTab.value);
//   nextTick(() => {
//     switch (currentTab.value) {
//       case TabVal.actionVarietyLogModal:
//         actionVarietyLogComRef.value?.handleQuery(searchForm.value);
//         break;
//       case TabVal.actionLotLogModal:
//         actionLotLogComRef.value?.handleQuery(searchForm.value);
//         break;
//       case TabVal.actionDeliveryLogModal:
//         actionDeliveryLogComRef.value?.handleQuery(searchForm.value);
//         break;
//     }
//   })
// }
</script>
<template>
  <Modal
    class="h-[800px] w-[80%]"
    content-class="h-[calc(100%-100px)] overflow-y-hidden flex-none p-1 mt-2"
    title="附件"
  >
    <div class="h-full">
      <RadioGroup
        v-model:value="currentTab"
        button-style="solid"
        @change="radioChange"
      >
        <template v-for="item in headerTabs" :key="item.value">
          <RadioButton
            :value="item.value"
            :disabled="item.disabled"
            :data-testid="`radio_tab_${item.value}_child`"
          >
            {{ item.label }}
          </RadioButton>
        </template>
      </RadioGroup>
      <div
        class="bg-pink relative box-border h-[calc(100%-48px)] w-full flex-1"
      >
        <div class="absolute box-border h-full w-full">
          <actionVarietyLogCom
            v-if="currentTab === TabVal.actionVarietyLogModal"
            ref="actionVarietyLogComRef"
          />
          <actionLotLogCom
            v-if="currentTab === TabVal.actionLotLogModal"
            ref="actionLotLogComRef"
          />
          <actionDeliveryLogCom
            v-if="currentTab === TabVal.actionDeliveryLogModal"
            ref="actionDeliveryLogComRef"
          />
          <!-- <actionVarietyLogCom
                  ref="actionVarietyLogComRef"
                  v-show="currentTab === TabVal.actionVarietyLogModal"
                  v-model:current-tab="currentTab"
                  :this-tab="headerTabs[0] as PageTab"
                />
                <actionLotLogCom
                  ref="actionLotLogComRef"
                  v-show="currentTab === TabVal.actionLotLogModal"
                  v-model:current-tab="currentTab"
                  :this-tab="headerTabs[2] as PageTab"
                />
                <actionDeliveryLogCom
                  ref="actionDeliveryLogComRef"
                  v-show="currentTab === TabVal.actionDeliveryLogModal"
                  v-model:current-tab="currentTab"
                  :this-tab="headerTabs[1] as PageTab"
                /> -->
        </div>
      </div>
      <!-- <ChcGrid>
        <template #action="scope">
          <Button
            type="primary"
            @click.prevent="() => setVisible(true, scope.row)"
            data-testid="button_view_actionVarietyLogModal"
          >
            查看
          </Button>
        </template>
      </ChcGrid> -->
    </div>
  </Modal>
</template>
