<script lang="ts" setup>
import { ref } from 'vue';

import { SvgCloseIcon, SvgSaveIcon } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';
import { isEmpty } from '@vben/utils';

import { Button, message, Modal } from 'ant-design-vue';

import { requestFormClient } from '#/api/request';
import { useSpdGrid } from '#/components/spd';

const modalOuterData = ref<any>();
const [AddModal, addModalApi] = useVbenModal({
  draggable: true,
  closable: true,
  showConfirmButton: false,
  cancelText: '关闭',
  destroyOnClose: true,
  footer: false,
  onCancel() {
    addModalApi.close();
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      modalOuterData.value = addModalApi.getData<any>();
    }
  },
});

const [ChcGrid, chcGridApi] = useSpdGrid(
  {
    formOptions: {
      showDefaultActions: false,
      showCollapseButton: false,
      commonConfig: {
        labelClass: 'w-[70px]',
      },
      wrapperClass: 'grid-cols-2',
    },
    gridOptions: {
      stripe: false,
      pagerConfig: {
        enabled: false,
      },
      proxyConfig: {
        autoLoad: false,
      },
      radioConfig: {
        highlight: true,
      },
      align: 'center',
    },
  },
  {
    formSchema: [
      {
        component: 'Input',
        fieldName: 'tracCode',
        label: '追溯码',
        formItemClass: 'pb-2 col-span-1 ',
        componentProps: () => {
          return {
            placeholder: '请输入追溯码',
            onPressEnter: async (e: KeyboardEvent) => {
              e.stopPropagation();
              console.warn('追溯码 e', e);
              const tracCode = (e.target as HTMLInputElement).value;
              if (!tracCode) {
                return message.error('请输入追溯码');
              }
              const formValues = await chcGridApi.formApi.getValues();
              if (formValues.revertScan) {
                // 反扫
                const records = chcGridApi.grid.getFullData();
                let removeData;
                records.forEach(async (data: any) => {
                  if (data.tracCode === tracCode) {
                    removeData = data;
                  }
                });
                if (removeData) {
                  chcGridApi.grid.remove(removeData);
                }
                chcGridApi.formApi.setFieldValue('tracCode', '');
              } else {
                // 非反扫
                const records = chcGridApi.grid.getFullData();
                console.warn('当前表格数据：', records);
                // 判断有没有扫过
                let hasScaned = false;
                records.forEach((data: any) => {
                  if (data.tracCode === tracCode) {
                    hasScaned = true;
                    chcGridApi.formApi.setFieldValue('tracCode', '');
                  }
                });
                if (hasScaned) {
                  return false; // false阻止事件冒泡造成页面刷新
                }
                const parentCheckedRow = modalOuterData.value?.row;
                records.push({
                  tracCode,
                  productCode: parentCheckedRow?.productCode,
                  productName: parentCheckedRow?.productName,
                  lot: parentCheckedRow?.lot,
                  guaranteeDate: parentCheckedRow?.guaranteeDate,
                });
                chcGridApi.grid.reloadData(records);
              }
            },
          };
        },
      },
      {
        component: 'Checkbox',
        fieldName: 'revertScan',
        label: '反扫',
        formItemClass: 'pb-2 col-span-1',
        componentProps: () => {
          return {
            onKeydown: (e: KeyboardEvent) => {
              e.stopPropagation();
              e.preventDefault();
            },
          };
        },
      },
    ],
    gridColumns: [
      {
        type: 'radio',
        visible: false,
        width: 50,
      },
      {
        title: '序号',
        width: 50,
        align: 'center',
        formatter(scope: any) {
          return scope.rowIndex + 1;
        },
      },
      {
        field: 'tracCode',
        title: '追溯码',
        width: '200',
        sortable: false,
      },
      {
        field: 'productCode',
        title: '药品编码',
        width: '120',
        sortable: false,
      },
      {
        field: 'productName',
        title: '药品名称',
        width: '220',
        sortable: false,
      },
      {
        field: 'lot',
        title: '批号',
        width: '100',
        sortable: false,
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        width: '110',
        sortable: true,
      },
    ],
    autoSelectFirstRow: true,
    gridEvents: {
      radioChange() {},
    },
    id: 'addAsnTraceCodeModal',
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);
const handleSave = async () => {
  const records = chcGridApi.grid.getFullData();
  if (isEmpty(records)) {
    message.error('没有需要添加的记录！');
    return;
  }

  Modal.confirm({
    title: '提示',
    content: '确认新增吗？',
    okText: '确认',
    cancelText: '取消',
    async onOk() {
      try {
        await requestFormClient.post('/asnAction/addAsnTracCode.do', {
          asnLineId: modalOuterData.value?.row?.asnLineId,
          tracCodes: JSON.stringify(
            (records as any[]).map((item) => item.tracCode),
          ),
        });
        message.success('新增成功！');
        addModalApi.close();
        modalOuterData.value?.callback?.();
      } catch (error) {
        console.error('新增追溯码失败:', error);
      }
    },
    onCancel() {},
  });
};
const handleCancel = () => {
  addModalApi.close();
};
</script>
<template>
  <AddModal
    class="h-[600px] w-[800px]"
    content-class="h-[calc(100%-55px)] overflow-y-hidden flex-none p-1"
    title="新增追溯码"
    title-tooltip="新增追溯码"
  >
    <div class="h-full">
      <ChcGrid>
        <template #bottom>
          <div class="flex items-center justify-center pt-[10px]">
            <div class="flex gap-[10px]">
              <Button
                type="primary"
                @click="handleSave"
                data-testid="button_submit_addAsnTraceCodeModal"
              >
                确认
                <template #icon>
                  <SvgSaveIcon />
                </template>
              </Button>
              <Button
                type="primary"
                danger
                @click="handleCancel"
                data-testid="button_cancel_addAsnTraceCodeModal"
              >
                取消
                <template #icon>
                  <SvgCloseIcon />
                </template>
              </Button>
            </div>
          </div>
        </template>
      </ChcGrid>
    </div>
  </AddModal>
</template>
