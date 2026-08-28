<script lang="ts" setup>
import { ref } from 'vue';
import { Button, Image, Modal } from 'ant-design-vue';
import { useSpdGrid } from '#/components/spd';

const visible = ref<boolean>(false);
const pdfVisible = ref<boolean>(false);
const currentRow = ref<any>(null);
const pdfUrl = ref<string>('');

const setVisible = (value, row = null): void => {
  visible.value = value;
  if (row) {
    currentRow.value = row;
  }
};

const setPdfVisible = (value: boolean): void => {
  pdfVisible.value = value;
};

// 获取当前请求的基础 URL
const getBaseUrl = () => {
  return window.location.origin;
};

// 获取文件 URL
const getFileUrl = () => {
  if (!currentRow.value?.siteAttachId) return '';
  return `${getBaseUrl()}${import.meta.env.VITE_GLOB_API_URL}/attachAction/viewScpAttach.do?type=lot&siteAttachId=${currentRow.value.siteAttachId}`;
};

// 判断文件类型并选择预览方式
const handlePreview = async () => {
  const fileUrl = getFileUrl();
  if (!fileUrl) return;

  try {
    // 使用 HEAD 请求获取文件类型
    const response = await fetch(fileUrl, { method: 'HEAD' });
    const contentType = response.headers.get('Content-Type') || '';

    if (contentType.includes('application/pdf')) {
      // PDF 文件，使用 iframe 预览
      pdfUrl.value = fileUrl;
      setPdfVisible(true);
    } else if (contentType.includes('image/')) {
      // 图片文件，使用 Image 组件预览
      setVisible(true);
    } else {
      // 其他文件类型，直接下载
      window.open(fileUrl, '_blank');
    }
  } catch (error) {
    console.error('获取文件类型失败:', error);
    // 失败时尝试根据文件扩展名判断
    const fileName = currentRow.value?.name || '';
    if (fileName.toLowerCase().endsWith('.pdf')) {
      pdfUrl.value = fileUrl;
      setPdfVisible(true);
    } else {
      setVisible(true);
    }
  }
};
// 获取当前请求的基础URL

const getImageUrl = () => {
  if (!currentRow.value?.siteAttachId) return '';
  // return 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png';
  return `${getBaseUrl()}${import.meta.env.VITE_GLOB_API_URL}/attachAction/viewScpAttach.do?type=lot&siteAttachId=${currentRow.value.siteAttachId}`;
};

const searchForm = ref({
  Record_ID: undefined,
  productId: undefined,
  vendorId: undefined,
  lot: undefined,
  // AD_Table_ID: 1_000_292,
});
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    showSearchForm: false,
    gridOptions: {
      proxyConfig: {
        // autoLoad: false,
      },
      // checkboxConfig: {
      //   checkMethod: (scope: any) => {
      //     return !modalOuterData.value.blackList.includes(
      //       scope.row.productCode,
      //     );
      //   },
      // },
    },
  },
  {
    gridColumns: [
      // { type: 'checkbox', title: '', width: 50, align: 'center' },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'productLotAttachId',
        minWidth: 90,
        sortable: true,
        title: '附件编码',
      },
      {
        field: 'name',
        minWidth: 100,
        sortable: true,
        title: '附件名称',
        align: 'right',
      },
      {
        field: 'serverName',
        minWidth: 120,
        sortable: true,
        title: '来源站点',
        align: 'right',
      },
      {
        field: 'siteAttachId',
        minWidth: 100,
        sortable: true,
        title: '来源编号',
      },
      {
        field: 'created',
        minWidth: 180,
        sortable: true,
        title: '创建日期',
      },
      {
        field: 'confirmUser',
        minWidth: 100,
        sortable: true,
        title: '复核人',
      },
      {
        field: 'confirmStatusName',
        minWidth: 100,
        sortable: true,
        title: '确认状态',
      },
      {
        field: 'description',
        minWidth: 110,
        sortable: true,
        title: '备注',
      },
      {
        align: 'center',
        field: 'action',
        slots: { default: 'action' },
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: '操作',
        width: 100,
      },
    ],
    dataTableId: '/productAction/queryProductLotAttach.do',
    id: 'checkHasActionDeliveryLog',
    tableSearchExtraParams: searchForm.value,
  },
);

const handleQuery = (data: any) => {
  searchForm.value.productId = data.productId;
  searchForm.value.vendorId = data.vendorId;
  searchForm.value.lot = data.lot;

  ChcGridApi.query();
};
defineExpose({ handleQuery });
// function handleSearch() {
//   ChcGridApi.query();
// }
</script>
<template>
  <!-- <Modal
    class="h-[800px] w-[80%]"
    content-class="h-[calc(100%-100px)] overflow-y-hidden flex-none p-1"
    title="批号附件"
    title-tooltip="批号附件列表"
  > -->

  <div class="h-full">
    <ChcGrid>
      <template #action="scope">
        <Button
          type="primary"
          @click="() => {
            currentRow = scope.row;
            handlePreview();
          }"
          data-testid="button_view_actionLotLogModal"
        >
          查看
        </Button>
      </template>
    </ChcGrid>
  </div>
  <Image
    :width="0"
    :height="0"
    :style="{
      position: 'absolute',
      top: '0',
      left: '0',
      width: '0',
      height: '0',
      opacity: '0',
      pointerEvents: 'none',
      zIndex: '-1',
      visibility: 'hidden',
      display: 'none',
    }"
    :preview="{
      visible,
      onVisibleChange: setVisible,
    }"
    :src="getImageUrl()"
  />
  <!-- 图片预览 -->
  <Image
    :width="0"
    :height="0"
    :style="{
      position: 'absolute',
      top: '0',
      left: '0',
      width: '0',
      height: '0',
      opacity: '0',
      pointerEvents: 'none',
      zIndex: '-1',
      visibility: 'hidden',
      display: 'none',
    }"
    :preview="{
      visible,
      onVisibleChange: setVisible,
    }"
    :src="getFileUrl()"
  />

  <!-- PDF 预览弹窗 -->
  <Modal
    v-model:visible="pdfVisible"
    title="PDF 预览"
    width="80%"
    :body-style="{ height: '75vh', padding: '0' }"
    :footer="null"
  >
    <iframe
      :src="pdfUrl"
      width="100%"
      height="100%"
      frameborder="0"
    />
  </Modal>
</template>
