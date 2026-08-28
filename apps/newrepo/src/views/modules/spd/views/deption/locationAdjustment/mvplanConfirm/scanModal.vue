<script lang="ts" setup>
import type { SchemaColumnAndOptions } from '#/adapter/chc-ui';

import { ref } from 'vue';
// import { useRoute } from 'vue-router';

import { SvgCloseIcon, SvgSaveIcon } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';
import { isEmpty } from '@vben/utils';

import { Button, message, Modal } from 'ant-design-vue';

import { requestFormClient } from '#/api/request';
import { useSpdGrid } from '#/components/spd';
import { deepClone } from '#/utils/util';

// const route = useRoute();

// const urlParams: { [key: string]: any } = route.meta?.urlParams || {}; // 路由给过来的参数
const modalOuterData = ref<any>();
const [ScanModal, scanModalApi] = useVbenModal({
  draggable: true,
  closable: false,
  showConfirmButton: false,
  cancelText: '关闭',
  destroyOnClose: true,
  footer: false,
  onCancel() {
    const records = chcGridApi.grid.getFullData();
    if (records && records.length > 0) {
      Modal.confirm({
        title: '提示',
        content: '已扫包装码将丢弃，确认取消吗？',
        okText: '确认',
        cancelText: '取消',
        onOk() {
          scanModalApi.close();
        },
        onCancel() {},
      });
    } else {
      scanModalApi.close();
    }
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      modalOuterData.value = scanModalApi.getData<any>();
    }
  },
});
const chcGridOption: SchemaColumnAndOptions = {
  formSchema: [
    {
      component: 'Input',
      componentProps: () => {
        return {
          onPressEnter: async (e: KeyboardEvent) => {
            // console.log((e.target as HTMLInputElement).value);
            const packageNo = (e.target as HTMLInputElement).value;
            if (!packageNo) {
              return message.error('请输入包装号');
            }
            const formValues = await chcGridApi.formApi.getValues();
            if (formValues.revertScan) {
              // 反扫
              const records = chcGridApi.grid.getFullData();
              let removeData;
              records.forEach(async (data: any) => {
                if (data.packageNo === packageNo) {
                  removeData = data;
                }
              });
              if (removeData) {
                chcGridApi.grid.remove(removeData);
              }
              chcGridApi.formApi.setFieldValue('packageNo', undefined);
              chcGridApi.formApi.setFieldValue(
                'scanedPackageCount',
                chcGridApi.grid.getFullData().length,
              );
            } else {
              // 非反扫
              const records = chcGridApi.grid.getFullData();
              // console.log('当前表格数据：', records);
              // 判断有没有扫过
              let hasScaned = false;
              records.forEach((data: any) => {
                if (data.packageNo === packageNo) {
                  hasScaned = true;
                }
              });
              if (hasScaned) {
                message.error(`包装号重复：${packageNo}`);
                return false; // false阻止事件冒泡造成页面刷新
              }
              console.warn('modalOuterData', modalOuterData.value);
              const warehouseId = isEmpty(modalOuterData.value?.warehouseId)
                ? modalOuterData.value?.warehouseId
                : Number(modalOuterData.value?.warehouseId);
              console.warn('warehouseId', warehouseId);
              requestFormClient
                .post('packageAction/query.do', { packageNo })
                .then((result) => {
                  if (result.rows && result.rows.length > 0) {
                    const record = result.rows[0];
                    const recordWarehouseId = isEmpty(record.warehouseId)
                      ? record.warehouseId
                      : Number(record.warehouseId);
                    if (record.packageStatus !== 'S') {
                      message.error(`扫码失败，包装不在库：${packageNo}`);
                    } else if (
                      warehouseId !== recordWarehouseId ||
                      isEmpty(recordWarehouseId) ||
                      isEmpty(warehouseId)
                    ) {
                      message.error(`扫码失败，包装不在当前仓库：${packageNo}`);
                    } else {
                      records.unshift(record);
                      chcGridApi.grid.reloadData(records);
                      chcGridApi.formApi.setFieldValue('packageNo', undefined);
                      chcGridApi.formApi.setFieldValue(
                        'scanedPackageCount',
                        records.length,
                      );
                    }
                  } else {
                    message.error(`扫码失败，包装未找到：${packageNo}`);
                  }
                });
            }
          },
        };
      },
      fieldName: 'packageNo',
      label: '包装号',
      formItemClass: 'pb-2 col-span-1 ',
    },
    {
      component: 'Input',
      componentProps: () => {
        return {
          disabled: true,
        };
      },
      fieldName: 'scanedPackageCount',
      label: '已扫包数',
      formItemClass: 'pb-2 col-span-1 readOnly',
    },
    {
      component: 'Checkbox',
      componentProps: () => {
        return {
          // disabled: true,
        };
      },
      fieldName: 'revertScan',
      label: '反扫',
      formItemClass: 'pb-2 col-span-1',
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
      field: 'packageNo',
      title: '包装号',
      minWidth: '200',
      sortable: false,
    },
    {
      field: 'productCode',
      title: '药品编码',
      width: '120',
      sortable: true,
    },
    {
      field: 'productName',
      title: '药品名称',
      minWidth: '250',
      sortable: false,
    },
    {
      field: 'productSpec',
      title: '规格',
      minWidth: '150',
      sortable: false,
    },
    {
      field: 'modelNo',
      title: '型号',
      minWidth: '150',
      sortable: false,
      visible: false,
    },
    {
      field: 'manufacturer',
      title: '厂家',
      minWidth: '150',
      sortable: false,
    },
    {
      field: 'qty',
      title: '数量',
      minWidth: '70',
      sortable: false,
    },
    {
      field: 'uomName',
      title: '单位',
      minWidth: '70',
      sortable: false,
    },
    {
      field: 'lot',
      title: '批号',
      minWidth: '100',
      sortable: false,
    },
    {
      field: 'guaranteeDate',
      title: '效期',
      minWidth: '90',
      sortable: false,
    },
    {
      field: 'locatorName',
      title: '货位',
      minWidth: '90',
      sortable: false,
    },
  ],
  autoSelectFirstRow: true,
  gridEvents: {
    radioChange() {},
  },
  getTableId: () => modalOuterData.value?.tableId,
  // tableSearchExtraParams: searchForm.value,
  afterFetchFn: (params) => {
    originRows.value = params.rows.map((item: any) => {
      return deepClone(item);
    });
    return {
      ...params,
      records: params.rows,
    };
  },
};
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
  chcGridOption,
);
const originRows = ref<any[]>([]);
const handleSave = async () => {
  const records = chcGridApi.grid.getFullData();
  const paramRecords: any[] = [];
  records.forEach((data: any) => {
    if (data.packageNo) {
      paramRecords.push(data.packageNo);
    }
  });
  if (paramRecords.length === 0) {
    return message.error('包装号不可为空！');
  }
  const params: { [key: string]: any } = {};
  params.packageNo = JSON.stringify(paramRecords);
  params.movementPlanId = modalOuterData.value.movementPlanId;
  Modal.confirm({
    title: '提示',
    content: '确认移库？',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      requestFormClient
        .post('/movementPlanAction/movePackage.do', params)
        .then((result) => {
          message.success('移库确认成功!');
          modalOuterData.value.reloadParentTable(
            !!(result.data && result.data.isCompleted),
          );
          scanModalApi.close();
        });
    },
    onCancel() {},
  });
};
const handleCancel = () => {
  const records = chcGridApi.grid.getFullData();
  if (records && records.length > 0) {
    Modal.confirm({
      title: '提示',
      content: '已扫包装码将丢弃，确认取消吗？',
      okText: '确认',
      cancelText: '取消',
      onOk() {
        scanModalApi.close();
      },
      onCancel() {},
    });
  } else {
    scanModalApi.close();
  }
};
</script>
<template>
  <ScanModal
    class="formatBtnIconPosition h-[800px] w-[80%]"
    content-class="h-[calc(100%-55px)] overflow-y-hidden flex-none p-1"
    title="扫码"
    title-tooltip="扫码"
  >
    <div class="h-full">
      <ChcGrid>
        <template #bottom>
          <div class="flex items-center justify-center pt-[10px]">
            <div class="flex gap-[10px]">
              <Button
                type="primary"
                @click="handleSave"
                data-testid="button_confirm_scanModal"
              >
                确认入库
                <template #icon>
                  <SvgSaveIcon />
                </template>
              </Button>
              <Button
                type="primary"
                danger
                @click="handleCancel"
                data-testid="button_cancel_scanModal"
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
  </ScanModal>
</template>
