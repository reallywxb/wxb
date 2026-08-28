<script setup lang="ts">
import { reactive, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button, TabPane, Tabs, Textarea } from 'ant-design-vue';

import { copyToBoard } from '#/utils/flow/objutil';
import { genCodeByDataTable } from '#/views/modules/dev/views/datatable/api/datatable';

defineOptions({ name: 'CodeGenerationModal' });

const props = defineProps<{
  dataTableId: string;
  hasWfProcInstId: boolean;
}>();

/* eslint-disable no-unused-vars */
enum Tab {
  Option = 1,
  SingleTable,
  ParentChildTable,
  Menu,
  Approval,
  ApprovalDetail,
}

const activeKey = ref<string>(Tab.Option.toString());

const code = reactive({
  option: '',
  singleTable: '',
  parentChildTable: '',
  approval: '',
  approvalDetail: '',
});

const [Modal, modalApi] = useVbenModal({
  class: 'w-[50%]',
  cancelText: '关闭',
  confirmText: '复制代码',
  onClosed() {
    activeKey.value = Tab.Option.toString();
    Object.assign(code, {
      option: '',
      singleTable: '',
      parentChildTable: '',
      menu: '',
    });
  },
  onOpened() {
    const { searchColumns, gridColumns, optionCode, type } = modalApi.getData();
    if (optionCode) {
      code.option = optionCode;
    } else {
      genCodeByDataTable(props.dataTableId, {
        type: 'template',
        templateCode: `ui.${type}.option`,
        searchColumns,
        gridColumns,
      }).then((data) => (code.option = data));
    }

    genCodeByDataTable(props.dataTableId, {
      type: 'template',
      templateCode: `ui.${type}.indexSingle`,
    }).then((data) => (code.singleTable = data));
    genCodeByDataTable(props.dataTableId, {
      type: 'template',
      templateCode: `ui.${type}.indexTwo`,
    }).then((data) => (code.parentChildTable = data));
    genCodeByDataTable(props.dataTableId, {
      type: 'template',
      templateCode: 'backend.menu.json.menu',
    }).then((data) => {
      code.menu = data;
    });

    // if (props.hasWfProcInstId) {
    //   genCodeByDataTable(props.dataTableId, { type: 'ui.index.approval' }).then(
    //     (data) => (code.approval = data),
    //   );
    //   genCodeByDataTable(props.dataTableId, {
    //     type: 'ui.index.approvalDetail',
    //   }).then((data) => (code.approvalDetail = data));
    // }
  },
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {
    let text: string;

    switch (activeKey.value) {
      case Tab.Option.toString(): {
        text = code.option;
        break;
      }
      case Tab.ParentChildTable.toString(): {
        text = code.parentChildTable;
        break;
      }
      case Tab.SingleTable.toString(): {
        text = code.singleTable;
        break;
      }
      case Tab.Menu.toString(): {
        text = code.menu;
      }
    }

    await copyToBoard(text!);
  },
});

function downLoadComponent(obj: any) {
  const link = document.createElement('a');
  link.href = `/admin${obj.url}`;
  link.download = obj.name;
  document.body.append(link);
  link.click();
  link.remove();
}
function downApijs(type: string) {
  // 获取单页面代码
  genCodeByDataTable(props.dataTableId, {
    type: `ui.index.${type}`,
  }).then((data) => {
    const eleLink = document.createElement('a');
    eleLink.download = 'api.js';
    eleLink.style.display = 'none';
    // 字符内容转变成blob地址
    const blob = new Blob([data]);
    eleLink.href = URL.createObjectURL(blob);
    // 触发点击
    document.body.append(eleLink);
    eleLink.click();
    // 然后移除
    eleLink.remove();
  });
}

defineExpose({ modalApi });
</script>

<template>
  <Modal title="界面预览">
    <Tabs v-model:active-key="activeKey">
      <TabPane :key="Tab.Option.toString()" tab="option.js">
        <Textarea :rows="20" :value="code.option" readonly />
      </TabPane>
      <TabPane :key="Tab.SingleTable.toString()" tab="单表页面">
        <Textarea :rows="20" :value="code.singleTable" readonly />
      </TabPane>
      <TabPane :key="Tab.ParentChildTable.toString()" tab="父子表页面">
        <Textarea :rows="20" :value="code.parentChildTable" readonly />
      </TabPane>
      <TabPane :key="Tab.Menu.toString()" tab="菜单">
        <Textarea :rows="20" :value="code.menu" readonly />
      </TabPane>
      <template v-if="hasWfProcInstId">
        <TabPane :key="Tab.Approval.toString()" tab="审批页面">
          <Textarea :rows="20" :value="code.approval" readonly />
          <div
            style="
              display: flex;
              flex-wrap: wrap;
              gap: 20px;
              padding-bottom: 10px;
            "
          >
            <div style="display: flex">
              <div style="width: 100px; height: 40px; line-height: 40px">
                接口文件下载:
              </div>
              <div>
                <Button type="text" @click="downApijs('approvalJs')">
                  api.js
                </Button>
              </div>
            </div>
          </div>
        </TabPane>
        <TabPane :key="Tab.ApprovalDetail.toString()" tab="审批详情页面">
          <Textarea :rows="20" :value="code.approvalDetail" readonly />
          <div
            style="
              display: flex;
              flex-wrap: wrap;
              gap: 20px;
              padding-bottom: 10px;
            "
          >
            <div style="display: flex">
              <div style="width: 100px; height: 40px; line-height: 40px">
                接口文件下载:
              </div>
              <div>
                <Button type="text" @click="downApijs('approvalDetailJs')">
                  api.js
                </Button>
              </div>
            </div>
            <div style="display: flex">
              <div style="width: 80px; line-height: 40px">组件下载:</div>
              <div
                style="
                  display: flex;
                  flex-wrap: wrap;
                  gap: 10px;
                  width: calc(100% - 80px);
                "
              >
                <Button
                  type="text"
                  @click="
                    downLoadComponent({
                      name: 'approveForm.vue',
                      url: '/components/approvalDetail/approveForm.vue',
                    })
                  "
                >
                  approveForm.vue
                </Button>
                <Button
                  type="text"
                  @click="
                    downLoadComponent({
                      name: 'listApproveConfig.js',
                      url: '/components/approvalDetail/listApproveConfig.js',
                    })
                  "
                >
                  listApproveConfig.js
                </Button>
              </div>
            </div>
          </div>
        </TabPane>
      </template>
    </Tabs>
  </Modal>
</template>

<style scoped lang="scss"></style>
