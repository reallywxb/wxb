<script setup lang="ts">
import { onMounted, ref, toRaw } from 'vue';

import {
  AntdPlusCircleTwotone,
  EditActionIcon,
  MdiLightDelete,
  SvgCloseIcon,
  SvgSaveIcon,
} from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { isEmpty } from '@vben/utils';

import {
  Button as AntButton,
  Modal as AntModal,
  Switch as AntSwitch,
  message,
} from 'ant-design-vue';
import { Modal as AModal } from 'ant-design-vue/es/components';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';
import { modifyProductOrg } from '#/views/modules/spd/views/operation/product/purchaseAgreementEdit/api';
import CommonFormModal from '#/views/modules/sys/views/common/modals/commonFormModal.vue';

import { delWindowAction, updateStatusApi } from './api';
import { formSchema, gridColumns, useCommonFormModal } from './config.js';

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
      await chcGridApi.query();
    } else {
      message.error(response.msg || '保存失败');
      // 保存失败时可以回滚更改
      chcGridApi.reload();
    }
  } catch (error) {
    console.error('保存失败:', error);
    console.warn('error', error);
    message.error('保存失败');
    // 出错时回滚更改
    chcGridApi.reload();
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

const [ChcGrid, chcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      commonConfig: {
        labelClass: 'w-[90px]',
      },
      showCollapseButton: false,
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      // radioConfig: {
      //   trigger: 'row',
      //   highlight: true,
      // },
      // maxHeight: '100%',
      virtualYConfig: {
        enabled: false,
      },
      checkboxConfig: {
        trigger: 'row',
      },
      proxyConfig: {
        autoLoad: true, // 表格初始化时不自动查询数据
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
      // minHeight: 'calc(100% - 100px)',
      // cellStyle(scope: any) {
      //   // 操作列和手工发药列高亮
      //   if (
      //     scope.column.field === 'op' ||
      //     scope.column.field === 'manualDispense'
      //   ) {
      //     return {
      //       backgroundColor: '#D7FFF5',
      //     };
      //   }
      //   return {};
      // },
    }),
  },
  {
    id: 'windowSetting',
    gridEvents: {
      checkboxChange: onCheckboxChange,
      checkboxAll: onCheckboxChange,
      editActivated: (scope: any) => {
        currentField.value = scope.column.field;
        currentEditVal.value = scope.row[currentField.value];
      },
      editClosed: editClosedHandler,
    },
    dataTableId: '/windowAction/query',
    formSchema,
    gridColumns,
    afterFetchFn: (result: any) => {
      // AI-GENERATED-BEGIN
      // @date 2026-03-23
      // @description 为 rows 数组里的对象定义 status 属性，值取自 windowStatus
      // if (result && Array.isArray(result.rows)) {
      //   result.rows.forEach((row: any) => {
      //     row.status = row.windowStatus;
      //   });
      // }
      console.warn('result===>', result);
      return { ...result, rows: undefined, records: result.rows };
      // AI-GENERATED-END
    },
  },
);

function onCheckboxChange() {}

const handleQuery = () => {
  chcGridApi.formApi.getValues().then((resData: any) => {
    console.warn('getValues', resData);
    chcGridApi.query({ ...resData });
  });
};

// 批量启用
// AI-GENERATED-BEGIN
// @date 2026-03-23
// @description 批量启用窗口，使用 updateStatusApi 接口
const batchEnable = () => {
  console.warn('batchEnable---测试打包');
  const rows = chcGridApi.grid.getCheckboxRecords(true);
  const unProxyRows: any = toRaw(rows);
  if (isEmpty(unProxyRows)) {
    message.warning('请选择一条记录');
    return;
  }
  AntModal.confirm({
    title: '提示',
    content: '确认启用？',
    onOk: async () => {
      try {
        const params = unProxyRows.map((item: any) => ({
          windowId: item.windowId,
          status: item.status,
          isActive: 'Y',
        }));
        const res = await updateStatusApi(params);
        if (res.success) {
          message.success('启用成功');
          handleQuery();
        }
      } catch (error) {
        console.error(error);
      }
    },
  });
};
// AI-GENERATED-END

// 批量停用
// AI-GENERATED-BEGIN
// @date 2026-03-23
// @description 批量停用窗口，使用 updateStatusApi 接口
const batchDisable = () => {
  const rows = chcGridApi.grid.getCheckboxRecords(true);
  const unProxyRows: any = toRaw(rows);
  if (isEmpty(unProxyRows)) {
    message.warning('请选择一条记录');
    return;
  }
  AntModal.confirm({
    title: '提示',
    content: '确认停用？',
    onOk: async () => {
      try {
        const params = unProxyRows.map((item: any) => ({
          windowId: item.windowId,
          status: item.status,
          isActive: 'N',
        }));
        const res = await updateStatusApi(params);
        if (res.success) {
          message.success('停用成功');
          handleQuery();
        }
      } catch (error) {
        console.error(error);
      }
    },
  });
};
// AI-GENERATED-END

interface UpdateStatusParams {
  windowId: number | string;
  status: number | string;
  isActive: string;
  [key: string]: any;
}
// 切换状态
// AI-GENERATED-BEGIN
// @date 2026-03-23
// @description 定义 UpdateStatusParams 接口和切换状态函数
// @date 2026-03-30
// @description 切换状态函数，根据 field 和 checked 值显示对应的提示信息
const onSwitchChange = async (row: any, field: string, checked: string) => {
  const params: UpdateStatusParams = {
    windowId: row.windowId,
    status: row.status,
    isActive: row.isActive,
  };

  params[field] = checked;
  try {
    const res = await updateStatusApi([params]);
    if (res.success) {
      let actionText = '';
      if (field === 'isActive') {
        actionText = checked === 'Y' ? '启用' : '停用';
      } else {
        actionText = checked === '1' ? '开启' : '关闭';
      }
      message.success(`${actionText}成功`);

      handleQuery();
    }
  } catch (error) {
    console.error(error);
  }
};
// AI-GENERATED-END

onMounted(() => {
  // chcGridApi?.grid?.reloadData(
  //   Array.from({ length: 10 })
  //     .fill(1)
  //     .map((o, index) => ({
  //       windowNumber: `窗口${index}`,
  //       medicineDepartment: `药房${index}`,
  //       department: `科室${index}`,
  //       hospital: `院区${index}`,
  //       status: index % 2 === 0 ? 1 : 0,
  //       op: index % 2 === 0 ? 1 : 0,
  //       manualDispense: index % 2 === 0 ? 1 : 0,
  //     })),
  // );
});

const { modificationModalRef, formOption, handleAdd, handleEdit } =
  useCommonFormModal();

function handleDelete({ windowId }: Record<string, any>) {
  AModal.confirm({
    title: '提示',
    content: '此操作将永久删除选中的记录, 是否继续?',
    centered: true,
    okType: 'danger',
    onOk: async () => {
      try {
        await delWindowAction(windowId);
        message.success('操作成功');

        handleQuery();
      } catch (error) {
        console.warn(error);
      }
    },
  });
}
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <div class="h-full">
      <ChcGrid class="flex-1 overflow-hidden">
        <template #toolbar-actions>
          <AntButton
            type="primary"
            class="mr-[6px]"
            data-testid="button_handleAdd"
            @click="handleAdd"
          >
            新增
            <template #icon>
              <AntdPlusCircleTwotone />
            </template>
          </AntButton>
          <AntButton
            type="primary"
            class="mr-[6px]"
            data-testid="button_batchEnable"
            @click="batchEnable"
          >
            批量启用
            <template #icon>
              <SvgSaveIcon />
            </template>
          </AntButton>
          <AntButton
            type="primary"
            class="mr-[6px]"
            data-testid="button_batchDisable"
            @click="batchDisable"
          >
            批量停用
            <template #icon>
              <SvgCloseIcon />
            </template>
          </AntButton>
        </template>
        <!-- 手工发药 -->
        <template #manualDispense="scope">
          <AntSwitch
            :checked="scope.row.status"
            class="w-2/3"
            checked-value="1"
            un-checked-value="0"
            checked-children="开启"
            un-checked-children="关闭"
            :data-testid="`switch_manualDispense_${scope.rowIndex}`"
            @change="
              (checked: any) => onSwitchChange(scope.row, 'status', checked)
            "
          />
        </template>
        <!-- 操作 -->
        <template #actionDefault="{ row }">
          <!--          <AntSwitch-->
          <!--            :checked="scope.row.isActive"-->
          <!--            class="w-2/3"-->
          <!--            checked-value="Y"-->
          <!--            un-checked-value="N"-->
          <!--            checked-children="启用"-->
          <!--            un-checked-children="停用"-->
          <!--            @change="-->
          <!--              (checked: any) => onSwitchChange(scope.row, 'isActive', checked)-->
          <!--            "-->
          <!--            :data-testid="`switch_op_${scope.rowIndex}`"-->
          <!--          />-->
          <AntButton
            type="primary"
            ghost
            class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
            data-testid="button_handleEdit"
            @click="handleEdit(row)"
          >
            编辑
            <template #icon>
              <EditActionIcon />
            </template>
          </AntButton>

          <AntButton
            type="primary"
            danger
            ghost
            class="h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
            data-testid="button_handleEdit"
            @click="handleDelete(row)"
          >
            删除
            <template #icon>
              <MdiLightDelete class="mb-[2px] text-[16px]" />
            </template>
          </AntButton>
        </template>
      </ChcGrid>
    </div>
  </Page>
  <CommonFormModal
    ref="modificationModalRef"
    :form-option="formOption"
    :after-submit="handleQuery"
  />
</template>

<style scoped lang="less">
::v-deep(.ant-btn > svg) {
  margin-right: -2px;
  margin-bottom: 3px;
  margin-left: 2px;
}

::v-deep(.vxe-grid--toolbar-wrapper .vxe-tools--wrapper .ant-btn > svg) {
  margin-right: -1px;
  margin-bottom: 4px;
  margin-left: -5px;
}
</style>
