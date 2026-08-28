<script setup lang="ts">
import { onMounted, ref, toRaw } from 'vue';

import {
  AddActionIcon,
  EditActionIcon,
  ExportActionIcon,
  SvgDeleteIcon,
  SvgGetCodeIcon,
  SvgIsStopIcon,
  UploadActionIcon,
} from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { Button, message, Modal } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { handleCommonGridColumns } from '#/utils/param';
import { deepMerge } from '#/utils/util';

import AddModalUi from './addModal/index.vue';
import { delVendor, getRefEntID } from './api';
import { columns } from './gridOptions';
import ImportModalComp from './importModal.vue';
import IsStopComp from './isStopModal.vue';
import { searchFormSchemas } from './searchFormSchemas';

const extParams = ref<{
  approvalStatus?: string;
  commitStatus?: string;
  isGift?: string;
}>({});

const [cols, gridColumns] = handleCommonGridColumns(columns);
const [ChcGrid, ChcGridApi, { handleExport, ImportModal, importModalApi }] =
  useSpdGrid(
    {
      formOptions: deepMerge(formDefaultOptions, {
        showCollapseButton: false,
        fieldMappingTime: [
          ['dateOrdered', ['dateCommitFrom', 'dateCommitTo'], 'YYYY-MM-DD'],
        ],
        commonConfig: {
          labelClass: 'w-[90px]',
        },
        compact: true,
        layout: 'horizontal',
        submitButtonOptions: {
          content: '查询',
        },
        handleSubmit: async (values) => {
          console.warn('values', values);
          const formValues = await ChcGridApi.formApi.getValues();
          ChcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
          ChcGridApi.reload(formValues);
        },
      }),
      gridOptions: deepMerge(gridDefaultOptions, {
        checkboxConfig: {
          highlight: true,
        },
        proxyConfig: {
          autoLoad: false,
        },
        // cellConfig: {
        //   height: 32,
        // },
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
          width: 350,
        },
      ],
      formSchema: searchFormSchemas,
      cols,
      dataTableId: 'vendorAction/query.do?isActive=Y',
      id: 'supplierMaintenance',
      showCustomBtn: true,
      showZoomBtn: true,
      tableSearchExtraParams: extParams.value,
      getTableArrDataFn: (params) => {
        return {
          ...params,
          records: params.rows,
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

const [AddModal, addModalApi] = useVbenModal({
  class: 'w-[500px]',
  closable: true,
  connectedComponent: AddModalUi,
  draggable: true,
});

const [IsStopModal, isStopApi] = useVbenModal({
  class: 'w-[500px]',
  closable: true,
  connectedComponent: IsStopComp,
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
  addModalApi
    .setData({
      ChcGridApi,
      openType: 'add',
      formData: {
        showForm: true,
        showFormLast: false,
      },
    })
    .open();
};

const handleEdit = (row: any) => {
  addModalApi
    .setData({
      ChcGridApi,
      openType: 'edit',
      formData: {
        showForm: true,
        showFormLast: false,
        // orderId: parentTableParams.value.orderId || 1,
        ...row,
      },
    })
    .open();
};

const handleIsStop = (row: any) => {
  isStopApi
    .setData({
      openType: 'isStop',
      formData: {
        showForm: true,
        showFormLast: false,
        vendorId: row.bpartnerID,
      },
    })
    .open();
};

const handleDel = (scope) => {
  Modal.confirm({
    title: '提示',
    content: `确认删除？`,
    onOk: async () => {
      try {
        const { bpartnerID } = scope;
        const params = { bpartnerID };
        const response = await delVendor(params);
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

const handleGetRefEntID = (scope) => {
  Modal.confirm({
    title: '提示',
    content: `确认获取码上放心码？`,
    onOk: async () => {
      try {
        const { bpartnerID } = scope;
        const params = { bpartnerID };
        const response = await getRefEntID(params);
        if (response.success) {
          message.success('获取成功');
          ChcGridApi.query();
        } else {
          message.error(response.msg || '获取失败');
        }
      } catch {
        message.error('获取失败');
      }
    },
  });
};

onMounted(() => {
  console.warn('urlParams');
  ChcGridApi.query();
});
const handleExportExcel = () => {
  handleExport &&
    handleExport({
      // sheetMethod(params) {
      //   const { worksheet } = params;
      //   console.warn('worksheet', worksheet);
      //   worksheet.eachRow((excelRow, rowIndex) => {
      //     // console.log('excelRow', excelRow);
      //     excelRow.eachCell((excelCell, columnIndex) => {
      //       console.log('excelCell.value:', excelCell.value);
      //       // if (columnIndex === 2) {
      //       //   // 设置指定单元格为超链接
      //       //   excelCell.value = {
      //       //     text: `${excelCell.value}`,
      //       //     hyperlink: 'https://vxeui.com',
      //       //     tooltip: 'vxeui.com',
      //       //   };
      //       //   // 设置单元格字体
      //       //   excelCell.font = {
      //       //     color: {
      //       //       argb: '0000ff',
      //       //     },
      //       //   };
      //       // }
      //     });
      //   });
      // },
    });
};
</script>
<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <AddModal :after-submit="refreshTable" />
    <IsStopModal :after-submit="refreshTable" />
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
            <AddActionIcon />
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
          @click="handleExportExcel"
          class="mr-[0.5rem]"
          data-testid="button_export"
        >
          导出
          <template #icon>
            <ExportActionIcon />
          </template>
        </Button>
      </template>
      <template #action="scope">
        <Button
          ghost
          type="primary"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleEdit(scope.row)"
          :data-testid="`button_edit_${scope.$index}`"
        >
          编辑
          <template #icon>
            <EditActionIcon />
          </template>
        </Button>
        <Button
          ghost
          type="primary"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleIsStop(scope.row)"
          :data-testid="`button_isStop_${scope.$index}`"
        >
          启/停
          <template #icon>
            <SvgIsStopIcon class="mt-[2px]" />
          </template>
        </Button>
        <Button
          ghost
          type="primary"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleGetRefEntID(scope.row)"
          :data-testid="`button_getCode_${scope.$index}`"
        >
          获取码上放心
          <template #icon>
            <SvgGetCodeIcon class="mt-[2px]" />
          </template>
        </Button>
        <Button
          danger
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleDel(scope.row)"
          :data-testid="`button_delete_${scope.$index}`"
        >
          删除
          <template #icon>
            <SvgDeleteIcon />
          </template>
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
