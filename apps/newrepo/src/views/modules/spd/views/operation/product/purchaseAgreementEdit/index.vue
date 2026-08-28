<script setup lang="ts">
import { onMounted, ref } from 'vue';

import {
  AddActionIcon,
  ExportActionIcon,
  SvgDeleteIcon,
  UploadActionIcon,
} from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { VxeUI } from '@vben/plugins/vxe-table';

import { Button, InputNumber, message, Modal, Switch } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { handleCommonGridColumns } from '#/utils/param';
import { deepMerge } from '#/utils/util';

import AddModalUi from './addModal/index.vue';
import { delProductOrg, modifyProductOrg } from './api';
import ChangeLogComp from './changeLog.vue';
import { columns } from './gridOptions';
import ImportModalComp from './importModal.vue';
import { searchFormSchemas } from './searchFormSchemas';

// const VxeDatePicker = VxeUI.getComponent('VxeDatePicker');

const currentEditVal = ref<any[]>([]);
// const currentEditRow = ref<any>(); // 当前正在操作的行
const currentField = ref(''); // 当前正在操作的列field

// 修改editClosed事件处理
const editClosedHandler = async (scope: any) => {
  let isSame;
  isSame =
    scope.row[currentField.value] &&
    !['contractDateFrom', 'contractDateTo'].includes(currentField.value)
      ? currentEditVal.value === scope.row[currentField.value].toString()
      : currentEditVal.value === scope.row[currentField.value];
  // 对于日期字段，使用更宽松的比较
  if (['contractDateFrom', 'contractDateTo'].includes(currentField.value)) {
    isSame =
      String(currentEditVal.value) === String(scope.row[currentField.value]);
  }
  if (!isSame) {
    await handleEditComplete({ row: scope.row, column: scope.column });
  }
};
const [cols, gridColumns] = handleCommonGridColumns(columns);
const [ChcGrid, ChcGridApi, { handleExport, ImportModal, importModalApi }] =
  useSpdGrid(
    {
      formOptions: deepMerge(formDefaultOptions, {
        fieldMappingTime: [
          ['dateOrderedStart', ['startDateFrom', 'startDateTo'], 'YYYY-MM-DD'],
          ['dateOrderedEnd', ['endDateFrom', 'endDateTo'], 'YYYY-MM-DD'],
        ],
        commonConfig: {
          labelClass: 'w-[90px]',
        },
        compact: true,
        layout: 'horizontal',
        submitButtonOptions: {
          content: '查询',
        },
        // handleSubmit: async (values) => {
        //   console.warn('values', values);
        //   const formValues = await ChcGridApi.formApi.getValues();
        //   ChcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
        //   ChcGridApi.reload(
        //     JSON.stringify({
        //       ...formValues,
        //       productCategory: formValues.productCategory?.length
        //         ? formValues.productCategory.join(',')
        //         : null,
        //     }),
        //   );
        // },
      }),
      gridOptions: deepMerge(gridDefaultOptions, {
        checkboxConfig: {
          highlight: true,
        },
        proxyConfig: {
          autoLoad: false,
        },
        pagerConfig: {
          enabled: true,
        },
        editConfig: {
          enabled: true,
          trigger: 'dblclick',
          mode: 'cell',
          autoClear: true,
        },
        cellStyle(scope: any) {
          if (
            scope.column.field === 'discountRate' ||
            scope.column.field === 'discountPrice' ||
            scope.column.field === 'guaranteeDaysMin' ||
            scope.column.field === 'contractDateFrom' ||
            scope.column.field === 'contractDateTo'
          ) {
            return {
              backgroundColor: '#D7FFF5',
            };
          }
        },
        cellConfig: {
          height: 32,
        },
      }),
      // 添加表格事件监听
      gridEvents: {
        // // 单个复选框变化事件
        // checkboxChange: ({ records }: { records: any[] }) => {
        //   calculateSelectedAmount(records);
        // },
        // // 全选/全不选事件
        // checkboxAll: ({ records }: { records: any[] }) => {
        //   calculateSelectedAmount(records);
        // },
        editActivated: (scope: any) => {
          currentField.value = scope.column.field;
          currentEditVal.value = scope.row[currentField.value];
        },
        editClosed: editClosedHandler,
      },
    },
    {
      gridColumns: [
        ...gridColumns,
        {
          align: 'center',
          field: 'action',
          slots: { default: 'action' },
          fixed: 'right',
          headerAlign: 'center',
          showOverflow: false,
          title: $t('system.menu.operation'),
          width: 100,
        },
      ],
      formSchema: searchFormSchemas,
      cols,
      dataTableId: 'productAction/queryPurchaseAgreement.do',
      id: 'purchaseAgreementEdit',
      showCustomBtn: true,
      showZoomBtn: true,
      tableSearchExtraParams: { isActive: 'Y' },
      beforeFetchFn: ({ productCategoryId, ...extra }: any) => {
        return {
          ...extra,
          productCategoryId: productCategoryId?.length
            ? productCategoryId.join(',')
            : null,
        };
      },
      customModals: {
        'ImportModal-importModalApi': {
          class: 'w-[600px]',
          closable: true,
          connectedComponent: ImportModalComp,
          draggable: true,
        },
      },
    },
  );

const handleActiveSwitchChange = async (record: any, isDefault: 'N' | 'Y') => {
  try {
    const params = {
      ...record,
      isDefault,
    };
    const response = await modifyProductOrg(params);
    if (response.success) {
      message.success('状态更新成功');
      await ChcGridApi.query();
    } else {
      message.error(response.message || '更新失败');
    }
  } catch (error) {
    console.error('更新有效状态失败:', error);
    message.error('更新失败');
  }
};

const handleFieldSpecificEdit = (row: any, field: string) => {
  const editRecord = { ...row };
  switch (field) {
    case 'contractDateFrom':
    case 'contractDateTo': {
      return editRecord;
    }
    case 'discountPrice': {
      if (
        editRecord.discountPrice !== undefined &&
        editRecord.pricePO !== undefined &&
        editRecord.pricePO !== 0
      ) {
        editRecord.discountRate =
          Math.round((editRecord.discountPrice / editRecord.pricePO) * 100) /
          100;
      }
      return editRecord;
    }
    case 'discountRate': {
      if (
        editRecord.discountRate !== undefined &&
        editRecord.pricePO !== undefined
      ) {
        editRecord.discountPrice =
          Math.round(editRecord.pricePO * editRecord.discountRate * 1000) /
          1000;
      }
      return editRecord;
    }
    case 'guaranteeDaysMin': {
      return editRecord;
    }
    // No default
  }
  return null;
};

const handleEditComplete = async ({
  row,
  column,
}: {
  column?: any;
  row: any;
}) => {
  const field = column?.field || currentField.value;
  const processedRecord = handleFieldSpecificEdit(row, field);
  try {
    const params = {
      ...processedRecord,
      discountRate: processedRecord.discountRate?.toString() || '',
      discountPrice: processedRecord.discountPrice?.toString() || '',
      guaranteeDaysMin: processedRecord.guaranteeDaysMin?.toString() || '',
    };
    const response = await modifyProductOrg(params);
    if (response.success) {
      message.success('保存成功');
      await ChcGridApi.query();
    } else {
      message.error(response.msg || '保存失败');
      // 保存失败时可以回滚更改
      ChcGridApi.reload();
    }
  } catch (error) {
    console.error('保存失败:', error);
    message.error('保存失败');
    // 出错时回滚更改
    ChcGridApi.reload();
  }
};

const [AddModal, addModalApi] = useVbenModal({
  class: 'w-[800px]',
  closable: true,
  connectedComponent: AddModalUi,
  draggable: true,
});

const [ChangeLogModal, changeLogApi] = useVbenModal({
  class: 'w-[800px]',
  closable: true,
  connectedComponent: ChangeLogComp,
  draggable: true,
});

// 新增 编辑 表单提交之后执行
function refreshTable() {
  ChcGridApi.query();
}

const handleImport = () => {
  importModalApi?.open();
};

const handleAdd = () => {
  const selectedRows = ChcGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0 || selectedRows.length > 1) {
    message.warning('请选择一条商品');
    return;
  }
  addModalApi
    .setData({
      ChcGridApi,
      openType: 'add',
      formData: {
        showForm: true,
        showFormLast: false,
        ...selectedRows[0],
        productId: selectedRows[0].productId,
      },
    })
    .open();
};

const handleViewChangeLog = (row: any) => {
  changeLogApi
    .setData({
      openType: 'viewChangeLog',
      formData: {
        showForm: true,
        showFormLast: false,
        productOrgId: row.productOrgId,
      },
    })
    .open();
};

const handleDel = () => {
  const selectedRows = ChcGridApi.grid.getCheckboxRecords();
  // 验证是否选择了记录
  if (!selectedRows || selectedRows.length === 0) {
    message.error('请选择记录');
    return;
  }
  for (const content of selectedRows) {
    if (!content.productOrgId) {
      message.error('未登记采购协议');
      return;
    }
  }
  Modal.confirm({
    title: '提示',
    content: `确认删除？`,
    onOk: async () => {
      try {
        const productOrgIds = selectedRows.map(
          (item: any) => item.productOrgId,
        );
        const params = {
          productOrgId: productOrgIds.join(','),
        };
        const response = await delProductOrg(params);
        if (response.success) {
          message.success('删除成功');
          ChcGridApi.query();
        } else {
          message.error(response.msg || '删除失败');
        }
      } catch {
        message.error('删除失败');
      }
    },
  });
};

onMounted(() => {
  console.warn('urlParams');
  ChcGridApi.query();
});
</script>
<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <AddModal :after-submit="refreshTable" />
    <ChangeLogModal :after-submit="refreshTable" />
    <ImportModal :after-submit="refreshTable" />
    <ChcGrid>
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="handleAdd"
          class="mr-[0.5rem]"
          data-testid="button_add"
        >
          新增
          <template #icon>
            <AddActionIcon class="mt-[2px]" />
          </template>
        </Button>
        <Button
          type="primary"
          danger
          @click="handleDel"
          class="mr-[0.5rem]"
          data-testid="button_delete"
        >
          删除
          <template #icon>
            <SvgDeleteIcon class="mt-[-2px]" />
          </template>
        </Button>
        <Button
          type="primary"
          @click="handleImport"
          class="mr-[0.5rem]"
          data-testid="button_import"
        >
          导入
          <template #icon>
            <UploadActionIcon />
          </template>
        </Button>
        <Button
          type="primary"
          @click="handleExport"
          class="mr-[0.5rem]"
          data-testid="button_export"
        >
          导出
          <template #icon>
            <ExportActionIcon />
          </template>
        </Button>
      </template>
      <template #activeSwitch="{ row, rowIndex }">
        <Switch
          :checked="row.isDefault"
          @change="(checked: any) => handleActiveSwitchChange(row, checked)"
          checked-value="Y"
          un-checked-value="N"
          checked-children="是"
          un-checked-children="否"
          :data-testid="`switch_isDefault_${rowIndex}`"
        />
      </template>
      <template #discountRateEdit="scope">
        <InputNumber
          v-model:value="scope.row.discountRate"
          class="w-full"
          placeholder="请输入折扣率"
          :data-testid="`input_discountRate_${scope.rowIndex}`"
        />
      </template>
      <template #discountPriceEdit="scope">
        <InputNumber
          v-model:value="scope.row.discountPrice"
          class="w-full"
          placeholder="请输入折扣价"
          :data-testid="`input_discountPrice_${scope.rowIndex}`"
        />
      </template>
      <template #guaranteeDaysMinEdit="scope">
        <InputNumber
          v-model:value="scope.row.guaranteeDaysMin"
          class="w-full"
          placeholder="请输入效期预警天数"
          :data-testid="`input_guaranteeDaysMin_${scope.rowIndex}`"
        />
      </template>
      <!-- <template #contractDateFromEdit="scope">
        <VxeDatePicker
          v-model="scope.row.contractDateFrom"
          :data-testid="`VxeDatePicker_contractDateFromEdit_${scope.rowIndex}`"
        />
      </template>
      <template #contractDateToEdit="scope">
        <VxeDatePicker
          v-model="scope.row.contractDateTo"
          :data-testid="`VxeDatePicker_contractDateToEdit_${scope.rowIndex}`"
        />
      </template> -->
      <template #action="scope">
        <Button
          type="primary"
          ghost
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleViewChangeLog(scope.row)"
          :data-testid="`button_changeLog_${scope.rowIndex}`"
        >
          变更日志
          <!-- <template #icon>
            <SvgDeleteIcon class="mt-[2px]" />
          </template> -->
        </Button>
      </template>
    </ChcGrid>
  </Page>
</template>
<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  /* visibility: hidden; */
  display: none;
}

::v-deep(.ant-btn > svg) {
  margin-bottom: 4px;
  margin-left: -2px;
}
</style>
