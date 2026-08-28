<script setup lang="ts">
import { h, nextTick, ref } from 'vue';

import { SvgCloseIcon, SvgSaveIcon } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

import { Button, message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import { passLicenseDetail, queryLicenseDetailInfo } from '../api';
import batchAddModal from './batchAddModal.vue';
import licenseViewPictureUI from './licenseViewPictureModal.vue';

type LicenseType =
  | 'authorize'
  | 'authorizeLines'
  | 'contract'
  | 'manufCert'
  | 'productCert'
  | 'vendorCert';

const state = ref<any>();
const authorizes = ref<any[]>([]); // 企业授权书
const contracts = ref<any[]>([]); // 合同证照
const manufCerts = ref<any[]>([]); // 生产企业证照
const newProductApply = ref<any[]>([]); // 审核新品证照
const productCerts = ref<any[]>([]); // 产品证照
const products = ref<any[]>([]); // 关联医院商品
const vendorCerts = ref<any[]>([]); // 供应商证照

// 新增：用于跟踪在本次弹窗操作中被删除的商品的 productCode
const deletedProductCodes = ref<string[]>([]);
// 新增：用于存储初始加载时的商品 productCode，以便判断哪些是后来被删除的
const initialProductCodes = ref<string[]>([]);
// 新增：用于控制企业授权书折叠状态
const expandedAuthorizes = ref<Record<string, boolean>>({});

// 自身弹框
const [ModalFirst, modalApi] = useVbenModal({
  draggable: true,
  showConfirmButton: false,
  cancelText: '关闭',
  destroyOnClose: true,
  footer: false,
  onCancel() {
    modalApi.close();
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },
  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      // state.value = modalApi.getData<Record<string, any>>().record;
      state.value = modalApi.getData<Record<string, any>>();
      console.warn('state.value', state.value);
      const result: any = await queryLicenseDetailInfo({
        id: state.value.row.applyId,
      });
      console.warn('queryLicenseDetailInfo', result);
      // 处理基础信息
      basicList.value.forEach((item: any) => {
        item.value = state.value.row[item.field];
      });
      // 其他展示
      if (result.success) {
        const data = result.rows ? result.rows[0] : {};
        productCerts.value = data.productCerts || [];
        vendorCerts.value = data.vendorCerts || [];
        manufCerts.value = data.manufCerts || [];
        authorizes.value = data.authorizes || [];
        contracts.value = data.contracts || [];
        newProductApply.value = data.newProductApply || [];
        products.value = data.products || [];
        // 特殊处理：productMaster 需要插入到 productCerts 数组的开头
        if (data.productMaster) {
          productCerts.value.unshift(data.productMaster);
        }
        // 存储初始商品 code 列表
        initialProductCodes.value = products.value.map((p) => p.productCode);
        //  使用 grid 的 API 来加载数据
        chcGridApi.grid?.reloadData(products.value);
        // 企业授权书如果存在子集 lines 就默认展示
        authorizes.value.forEach((item) => {
          if (item.lines && item.lines.length > 0) {
            expandedAuthorizes.value[item.authorizeApplyId] = true;
            console.warn('expandedAuthorizes', expandedAuthorizes.value);
          }
        });
      }
    }
  },
});

// 表格
const [ChcGrid, chcGridApi] = useVbenVxeGrid({
  gridOptions: {
    border: true,
    columns: [
      {
        title: '序号',
        type: 'seq',
        width: 40,
        align: 'center',
        sortable: false,
      },
      {
        title: '商品编号',
        field: 'productCode',
        width: 150,
        sortable: true,
      },
      {
        title: '商品名',
        field: 'productName',
        minWidth: 130,
        sortable: true,
      },
      {
        title: '规格',
        field: 'productSpec',
        minWidth: 80,
        sortable: true,
      },
      {
        title: '型号',
        field: 'modelNo',
        minWidth: 80,
        sortable: true,
        visible: false,
      },
      {
        field: 'manufacturer',
        minWidth: 140,
        title: '生产企业',
        sortable: true,
      },
      {
        field: 'isActive',
        minWidth: 140,
        title: '启用状态',
        sortable: true,
        formatter({ row }: any) {
          return row.isActive === 'Y' ? '是' : '否';
        },
      },
      {
        // fixed: 'right',
        title: '操作',
        align: 'center',
        width: 110,
        slots: { default: 'action' },
      },
    ],
  },
});

// 基础信息
const basicList = ref([
  { label: '产品名称', field: 'productName', value: '' },
  { label: '产品类型', field: 'productType', value: '' },
  { label: '产品企业', field: 'manufacturerName', value: '' },
  { label: '供应商', field: 'bpartnerName', value: '' },
]);

// 辅助函数：格式化有效期
const formatValidity = (item: any) => {
  const startDate = item.certDate || item.beginDate || '';
  const endDate = item.certValidTo || item.endDate || '';
  if (!startDate && !endDate) {
    return null;
  }
  const value = `${startDate}~${endDate}`;
  if (item.validityType === 'L') {
    return `${value} 长期`;
  }
  if (item.validityType === 'R') {
    return value;
  }
  return null;
};

// 辅助函数：获取状态信息(文本和颜色)
const getStatusInfo = (item: any): { color: string; text: string } => {
  const statusMap: Record<string, { color: string; text: string }> = {
    WC: { text: '未核对', color: '#ff9800' },
    WA: { text: '预审核', color: '#ff9800' },
    PS: { text: '已核对', color: '#009688' },
    NO: { text: '未通过', color: '#fc0925' },
    NP: { text: '未上传', color: '#000000' },
  };
  return statusMap[item.checkStatus] || { text: '', color: '' };
};

// 打开折叠面板
const toggleAuthorize = (cert: any) => {
  console.warn('toggleAuthorize', cert);
  if (!cert.lines || cert.lines.length === 0) {
    Modal.error({
      title: '错误',
      content: '没有逐级授权书！',
      okText: '关闭',
      width: '260px',
      centered: true,
    });
    return;
  }
  const id = cert.authorizeApplyId;
  expandedAuthorizes.value[id] = !expandedAuthorizes.value[id];
};

// 证照核对弹框
const [licenseViewPictureModal, PictureModalApi] = useVbenModal({
  class: 'w-[1300px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: licenseViewPictureUI,
  draggable: true,
});

const viewLicense = (cert: any, btnType: LicenseType, index?: number) => {
  // console.warn('viewLicense', cert, index);
  const processedData = prepareLicenseViewData(cert, btnType, index);
  PictureModalApi.setData({
    openType: 'preview',
    type: btnType,
    data: {
      ...cert,
      processedData,
      // 状态更新回调
      updateStatusCallback: (updateInfo: any) => {
        updateCertificateStatus(cert, btnType, updateInfo);
      },
    },
  }).open();
};

// 辅助函数：根据不同类型预处理参数
const prepareLicenseViewData = (cert: any, btnType: string, index?: number) => {
  let type: string = '';
  let certId: number | string = '';
  switch (btnType) {
    case 'authorize': {
      certId = cert.authorizeApplyId;
      type = 'Authorize';
      break;
    }
    case 'authorizeLines': {
      certId = cert.authorizeApplyId;
      type = 'Authorize';
      break;
    }
    case 'contract': {
      certId = cert.contracteApplyId;
      type = 'Contract';
      break;
    }
    case 'manufCert': {
      certId = cert.companyApplyCertId;
      type = 'Company';
      break;
    }
    case 'newProduct': {
      certId = cert.newProductApplyId;
      type = 'NewProductApply';
      break;
    }
    case 'productCert': {
      certId = index === 0 ? cert.productApplyId : cert.productApplyCertId;
      type = index === 0 ? 'ProductM' : 'ProductO';
      break;
    }
    case 'vendorCert': {
      certId = cert.companyApplyCertId;
      type = 'Company';
      break;
    }
    default: {
      break;
    }
  }
  const { applyId, checkStatus } = state.value.row;
  return {
    applySyncId: applyId, // 外层applyId
    applyCertId: certId,
    type,
    isWA: checkStatus === 'WA', // 是否预审状态
    btnType, // 原始按钮类型，用于回调更新
    index, // 添加索引信息，用于产品证照的特殊处理
  };
};

// 状态更新函数
const updateCertificateStatus = (
  cert: any,
  btnType: string,
  updateInfo: any,
) => {
  // 更新证照状态
  Object.assign(cert, {
    checkStatus: updateInfo.status,
    ...(updateInfo.checkRemark && { checkRemark: updateInfo.checkRemark }),
  });
  nextTick(() => {
    console.warn('证照状态已更新:', cert.checkStatus);
  });
};

// 新增逻辑
// 控制添加商品以及黑名单逻辑
const ROWKEYFIELD = 'productCode'; // 表格行的唯一Id
const blackList = ref<any[]>([]); // 用于设置下拉不可选的黑名单列表
const [BatchAddModal, batchAddModalApi] = useVbenModal({
  connectedComponent: batchAddModal,
  destroyOnClose: true,
});
const handleAdd = () => {
  batchAddModalApi!
    .setData({
      replenishSource: 'P',
      handleBatchChoose,
      blackList: blackList.value,
    })
    .open();
};

// 处理表格添加/删除事件
const handleBatchChoose = async (records: any[]) => {
  console.warn('handleBatchChoose', records);
  // 将新增的商品添加到黑名单中
  blackList.value = [
    ...blackList.value,
    ...records.map((item) => item[ROWKEYFIELD]),
  ];
  // 将新增的商品添加到表格中
  // for (const record of records) {
  //   await chcGridApi.grid.insertAt(record, -1);
  // }
  await chcGridApi.grid.insertAt(records, -1);
};

const handleDelete = (row: any) => {
  Modal.confirm({
    title: '提示',
    content: `确认删除这条数据？`,
    onOk: async () => {
      // 检查这条被删除的商品是否初始化存在
      if (initialProductCodes.value.includes(row[ROWKEYFIELD])) {
        deletedProductCodes.value.push(row[ROWKEYFIELD]);
      }
      // 从表格中删除选中的行
      await chcGridApi.grid.remove(row);
      // 从黑名单中移除选中的行
      blackList.value = blackList.value.filter(
        (item) => item !== row[ROWKEYFIELD],
      );
    },
  });
};

// 操作
// 审核通过
const handlePass = () => {
  // 定义明确的类型接口
  interface WarningItem {
    name: string;
    status: string;
  }
  const warnings: {
    noStr: WarningItem[];
    wpStr: WarningItem[];
  } = {
    wpStr: [], // 待审核 (Warning/Pending)
    noStr: [], // 未通过 (Not Passed)
  };
  // 整合所有需要检查的证照
  const allCerts = [
    ...productCerts.value,
    ...vendorCerts.value,
    ...manufCerts.value,
    ...authorizes.value,
  ];
  // 遍及检查，生成告警信息
  allCerts.forEach((cert: any) => {
    const certName =
      cert.certTypeName || cert.authorizeCompanyName || '未知证照';
    const statusInfo = getStatusInfo(cert);

    if (cert.checkStatus === 'WC' || cert.checkStatus === 'WA') {
      warnings.wpStr.push({ name: certName, status: statusInfo.text });
    } else if (cert.checkStatus === 'NO') {
      warnings.noStr.push({ name: certName, status: statusInfo.text });
    }
  });
  // 构建确认框内容
  let modalTitle = '确认';
  let modalContent: ReturnType<typeof h> | string = '确认通过本次申请？';
  const hasWarnings = warnings.wpStr.length > 0 || warnings.noStr.length > 0;
  if (hasWarnings) {
    modalTitle = '提示';
    modalContent = h('div', null, [
      h('p', null, '您还有'),
      // 渲染所有告警信息
      ...[...warnings.wpStr, ...warnings.noStr].map((content) =>
        h(
          'p',
          {
            style: { textIndent: '1em' },
          },
          [
            h('span', null, content.name),
            h(
              'span',
              { style: { color: '#fc0925' } },
              `证照核对${content.status}`,
            ),
          ],
        ),
      ),
      h('p', { style: { marginTop: '10px' } }, '确认要通过本次申请吗？'),
    ]);
  }
  // 弹出确认框
  Modal.confirm({
    title: modalTitle,
    content: modalContent,
    width: '360px',
    centered: true,
    async onOk() {
      try {
        // 提交逻辑
        const { fullData } = chcGridApi.grid.getTableData();
        const productIds = fullData.map((item) => item.productId);
        const { applyId, checkStatus } = state.value.row;
        // 整合接口入参
        const payload = [
          {
            applySyncId: applyId,
            status: checkStatus === 'WA' ? 'WC' : 'PS',
            checkRemark: '',
            productIds,
            removedProductCodes: deletedProductCodes.value,
          },
        ];
        console.warn('handlePass', payload);
        const prams = {
          ids: JSON.stringify(payload),
        };
        // 调用接口
        const result = await passLicenseDetail(prams);
        if (result && result.success) {
          message.success('操作成功！');
          modalApi.close();
          state.value.callback();
        } else {
          message.error(result?.msg || '操作失败！');
        }
      } catch (error) {
        console.warn('err', error);
      }
    },
    onCancel() {},
  });
};

// 拒绝
const handleReject = () => {
  let rejectReason = ''; // 用于存储输入的原因

  Modal.confirm({
    title: '请输入驳回原因',
    content: h('textarea', {
      placeholder: '',
      rows: 4,
      style: {
        width: '100%',
        marginTop: '10px',
        padding: '6px 10px',
        border: '1px solid #d9d9d9',
        borderRadius: '4px',
        outline: 'none',
        resize: 'vertical',
      },
      // 监听输入事件，实时更新 rejectReason 变量
      onInput: (e: Event) => {
        rejectReason = (e.target as HTMLTextAreaElement).value;
      },
    }),
    width: '400px',
    centered: true,
    async onOk() {
      // 在确认回调中进行校验
      if (!rejectReason || rejectReason.trim() === '') {
        message.warning('驳回原因不能为空！');
        // 返回 Promise.reject() 可以阻止弹窗关闭
        throw new Error('驳回原因不能为空');
      }

      try {
        // 获取当前表格中的商品ID，与通过逻辑保持一致
        const { fullData } = chcGridApi.grid!.getTableData();
        const productIds = fullData.map((item) => item.productId);
        const { applyId, checkStatus } = state.value.row;
        // 准备接口参数
        const payload = [
          {
            applySyncId: applyId,
            status: checkStatus === 'WA' ? 'NO' : 'PS', // 拒绝的状态是 'NO' (未通过)
            checkRemark: rejectReason.trim(), // 传入用户输入的驳回原因
            productIds, // 同样需要传递当前的 productIds
            removedProductCodes: deletedProductCodes.value, // 同样需要传递已移除的 code
          },
        ];

        const params = {
          ids: JSON.stringify(payload),
        };

        // 调用接口
        const result = await passLicenseDetail(params);
        if (result && result.success) {
          message.success('驳回成功！');
          modalApi.close();
          state.value.callback();
        } else {
          message.error(result?.msg || '操作失败！');
        }
      } catch (error) {
        // 如果 onOk 内部发生错误 (除了 Promise.reject)，弹窗默认会关闭，这里只处理错误提示
        console.error('驳回操作失败:', error);
      }
    },
    onCancel() {},
  });
};
</script>

<template>
  <ModalFirst
    class="formatBtnIconPosition h-[650px] w-[1200px]"
    content-class="h-[calc(100%-55px)] overflow-y-hidden flex-none p-1"
    title="产品证照详情"
    title-tooltip="产品证照详情"
  >
    <div class="h-full">
      <div class="h-[calc(100%-38px)] overflow-y-auto">
        <!-- 基础信息 -->
        <div class="pro-box">
          <div v-for="(item, index) in basicList" :key="index" class="pro-item">
            <div class="label">{{ item.label }}</div>
            <div class="text">{{ item.value }}</div>
          </div>
        </div>
        <!-- 产品证照 -->
        <div v-if="productCerts.length > 0" class="tutorial-field">
          <div class="tutorial-field-legend"><span>产品证照</span></div>
          <div class="tutorial-field-content">
            <div
              v-for="(cert, index) in productCerts"
              :key="cert.productApplyCertId || cert.productApplyId"
              class="cert-item"
              :class="{ default: index % 2 === 0 }"
            >
              <div class="first">
                <div
                  v-if="cert.certTypeName"
                  class="certNum"
                  style="width: 227px"
                >
                  <div class="numValue" :title="cert.certTypeName">
                    {{ cert.certTypeName }}
                  </div>
                </div>
                <div
                  v-if="cert.certNo"
                  class="certNum"
                  style="min-width: 219px"
                >
                  <div class="numLabel">证照号码：</div>
                  <div
                    class="numValue"
                    style="color: #009688"
                    :title="cert.certNo"
                  >
                    {{ cert.certNo }}
                  </div>
                </div>
                <div
                  v-if="formatValidity(cert)"
                  class="certNum"
                  style="min-width: 205px"
                >
                  <div class="numLabel">有效期：</div>
                  <div
                    class="numValue"
                    style="color: #009688"
                    :title="formatValidity(cert) || void 0"
                  >
                    {{ formatValidity(cert) }}
                  </div>
                </div>
                <div
                  v-if="index === 0 && cert.oldCertNo"
                  class="certNum"
                  style="min-width: 220px"
                >
                  <div class="numLabel">原证照号：</div>
                  <div class="numValue" :title="cert.oldCertNo">
                    {{ cert.oldCertNo }}
                  </div>
                </div>
                <div
                  v-if="cert.description"
                  class="certNum"
                  style="flex: 1; min-width: 130px"
                >
                  <div class="numLabel">备注：</div>
                  <div class="numValue" :title="cert.description">
                    {{ cert.description }}
                  </div>
                </div>
                <div
                  v-if="getStatusInfo(cert).text"
                  class="certNum"
                  style="min-width: 60px; text-align: right"
                >
                  <div
                    class="numValue"
                    :style="{ color: getStatusInfo(cert).color }"
                  >
                    {{ getStatusInfo(cert).text }}
                  </div>
                </div>
              </div>
              <Button
                v-if="
                  cert.filePaths && JSON.generalParse(cert.filePaths).length > 0
                "
                type="primary"
                @click="viewLicense(cert, 'productCert', index)"
              >
                证照查看
              </Button>
            </div>
          </div>
        </div>
        <!-- 供应商证照 -->
        <div v-if="vendorCerts.length > 0" class="tutorial-field">
          <div class="tutorial-field-legend"><span>供应商证照</span></div>
          <div class="tutorial-field-content">
            <div
              v-for="(cert, index) in vendorCerts"
              :key="cert.companyApplyCertId"
              class="cert-item"
              :class="{ default: index % 2 === 0 }"
            >
              <div class="first">
                <div
                  v-if="cert.certTypeName"
                  class="certNum"
                  style="width: 227px"
                >
                  <div class="numValue" :title="cert.certTypeName">
                    {{ cert.certTypeName }}
                  </div>
                </div>
                <div
                  v-if="cert.certNo"
                  class="certNum"
                  style="min-width: 219px"
                >
                  <div class="numLabel">证照号码：</div>
                  <div
                    class="numValue"
                    style="color: #009688"
                    :title="cert.certNo"
                  >
                    {{ cert.certNo }}
                  </div>
                </div>
                <div
                  v-if="formatValidity(cert)"
                  class="certNum"
                  style="min-width: 205px"
                >
                  <div class="numLabel">有效期：</div>
                  <div
                    class="numValue"
                    style="color: #009688"
                    :title="formatValidity(cert) || void 0"
                  >
                    {{ formatValidity(cert) }}
                  </div>
                </div>
                <div
                  v-if="cert.description"
                  class="certNum"
                  style="flex: 1; min-width: 130px"
                >
                  <div class="numLabel">备注：</div>
                  <div class="numValue" :title="cert.description">
                    {{ cert.description }}
                  </div>
                </div>
                <div
                  v-if="getStatusInfo(cert).text"
                  class="certNum"
                  style="min-width: 60px; text-align: right"
                >
                  <div
                    class="numValue"
                    :style="{ color: getStatusInfo(cert).color }"
                  >
                    {{ getStatusInfo(cert).text }}
                  </div>
                </div>
              </div>
              <Button
                v-if="
                  cert.filePaths && JSON.generalParse(cert.filePaths).length > 0
                "
                type="primary"
                @click="viewLicense(cert, 'vendorCert')"
              >
                证照查看
              </Button>
            </div>
          </div>
        </div>
        <!-- 生产企业证照 -->
        <div v-if="manufCerts.length > 0" class="tutorial-field">
          <div class="tutorial-field-legend"><span>生产企业证照</span></div>
          <div class="tutorial-field-content">
            <div
              v-for="(cert, index) in manufCerts"
              :key="cert.companyApplyCertId"
              class="cert-item"
              :class="{ default: index % 2 === 0 }"
            >
              <div class="first">
                <div
                  v-if="cert.certTypeName"
                  class="certNum"
                  style="width: 227px"
                >
                  <div class="numValue" :title="cert.certTypeName">
                    {{ cert.certTypeName }}
                  </div>
                </div>
                <div
                  v-if="cert.certNo"
                  class="certNum"
                  style="min-width: 219px"
                >
                  <div class="numLabel">证照号码：</div>
                  <div
                    class="numValue"
                    style="color: #009688"
                    :title="cert.certNo"
                  >
                    {{ cert.certNo }}
                  </div>
                </div>
                <div
                  v-if="formatValidity(cert)"
                  class="certNum"
                  style="min-width: 205px"
                >
                  <div class="numLabel">有效期：</div>
                  <div
                    class="numValue"
                    style="color: #009688"
                    :title="formatValidity(cert) || void 0"
                  >
                    {{ formatValidity(cert) }}
                  </div>
                </div>
                <div
                  v-if="cert.description"
                  class="certNum"
                  style="flex: 1; min-width: 130px"
                >
                  <div class="numLabel">备注：</div>
                  <div class="numValue" :title="cert.description">
                    {{ cert.description }}
                  </div>
                </div>
                <div
                  v-if="getStatusInfo(cert).text"
                  class="certNum"
                  style="min-width: 60px; text-align: right"
                >
                  <div
                    class="numValue"
                    :style="{ color: getStatusInfo(cert).color }"
                  >
                    {{ getStatusInfo(cert).text }}
                  </div>
                </div>
              </div>
              <Button
                v-if="
                  cert.filePaths && JSON.generalParse(cert.filePaths).length > 0
                "
                type="primary"
                @click="viewLicense(cert, 'manufCert')"
                data-testid="button_viewLicenseManufCert_certificatesDetailModal"
              >
                证照查看
              </Button>
            </div>
          </div>
        </div>
        <!-- 企业授权书 -->
        <div v-if="authorizes.length > 0" class="tutorial-field">
          <div class="tutorial-field-legend"><span>企业授权书</span></div>
          <div class="tutorial-field-content">
            <template v-for="cert in authorizes" :key="cert.authorizeApplyId">
              <div class="auth-box">
                <div class="cert-item default">
                  <div class="first">
                    <div class="certNum" style="width: 260px">
                      <div
                        class="checkDetail"
                        :class="{
                          hasData: cert.lines && cert.lines.length > 0,
                        }"
                        @click="toggleAuthorize(cert)"
                      >
                        <i
                          class="arrow"
                          :class="{
                            down: !expandedAuthorizes[cert.authorizeApplyId],
                            up: expandedAuthorizes[cert.authorizeApplyId],
                          }"
                        ></i>
                      </div>
                      <div class="numLabel">授权企业：</div>
                      <div class="numValue" :title="cert.authorizeCompanyName">
                        {{ cert.authorizeCompanyName }}
                      </div>
                    </div>
                    <div class="certNum" style="width: 260px">
                      <div class="numLabel">被授权企业：</div>
                      <div
                        class="numValue"
                        :title="cert.toAuthorizeCompanyName"
                      >
                        {{ cert.toAuthorizeCompanyName }}
                      </div>
                    </div>
                    <div
                      v-if="formatValidity(cert)"
                      class="certNum"
                      style="min-width: 205px"
                    >
                      <div class="numLabel">有效期：</div>
                      <div
                        class="numValue"
                        style="color: #009688"
                        :title="formatValidity(cert) || void 0"
                      >
                        {{ formatValidity(cert) }}
                      </div>
                    </div>
                    <div
                      v-if="cert.description"
                      class="certNum"
                      style="flex: 1; min-width: 130px"
                    >
                      <div class="numLabel">备注：</div>
                      <div class="numValue" :title="cert.description">
                        {{ cert.description }}
                      </div>
                    </div>
                    <div
                      v-if="getStatusInfo(cert).text"
                      class="certNum"
                      style="min-width: 60px; text-align: right"
                    >
                      <div
                        class="numValue"
                        :style="{ color: getStatusInfo(cert).color }"
                      >
                        {{ getStatusInfo(cert).text }}
                      </div>
                    </div>
                  </div>
                  <Button
                    v-if="
                      cert.filePaths &&
                      JSON.generalParse(cert.filePaths).length > 0
                    "
                    type="primary"
                    @click="viewLicense(cert, 'authorize')"
                    data-testid="button_viewLicenseAuthorize_certificatesDetailModal"
                  >
                    证照查看
                  </Button>
                </div>
                <div
                  v-if="expandedAuthorizes[cert.authorizeApplyId]"
                  class="sub-authorize-container"
                >
                  <div class="line-title">企业逐级授权书</div>
                  <div class="line-content">
                    <div
                      v-for="line in cert.lines"
                      :key="line.authorizeLineCode"
                      class="cert-item"
                    >
                      <div class="first">
                        <div class="certNum" style="width: 260px">
                          <div class="numLabel">授权企业：</div>
                          <div
                            class="numValue"
                            :title="line.authorizeCompanyName"
                          >
                            {{ line.authorizeCompanyName }}
                          </div>
                        </div>
                        <div class="certNum" style="width: 260px">
                          <div class="numLabel">被授权企业：</div>
                          <div
                            class="numValue"
                            :title="line.toAuthorizeCompanyName"
                          >
                            {{ line.toAuthorizeCompanyName }}
                          </div>
                        </div>
                        <div
                          v-if="formatValidity(line)"
                          class="certNum"
                          style="min-width: 205px"
                        >
                          <div class="numLabel">有效期：</div>
                          <div
                            class="numValue"
                            style="color: #009688"
                            :title="formatValidity(line) || void 0"
                          >
                            {{ formatValidity(line) }}
                          </div>
                        </div>
                        <div
                          v-if="line.description"
                          class="certNum"
                          style="flex: 1; min-width: 130px"
                        >
                          <div class="numLabel">备注：</div>
                          <div class="numValue" :title="line.description">
                            {{ line.description }}
                          </div>
                        </div>
                      </div>
                      <Button
                        v-if="
                          line.filePaths &&
                          JSON.generalParse(line.filePaths).length > 0
                        "
                        type="primary"
                        @click="viewLicense(line, 'authorizeLines')"
                        data-testid="button_viewLicenseAuthorizeLines_certificatesDetailModal"
                      >
                        证照查看
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
        <!-- 合同证照 -->
        <div v-if="contracts.length > 0" class="tutorial-field">
          <div class="tutorial-field-legend"><span>合同证照</span></div>
          <div class="tutorial-field-content">
            <div
              v-for="(cert, index) in contracts"
              :key="cert.contracteApplyId"
              class="cert-item"
              :class="{ default: index % 2 === 0 }"
            >
              <div class="first">
                <div
                  v-if="cert.contractNo"
                  class="certNum"
                  style="width: 227px"
                >
                  <div class="numLabel">合同名：</div>
                  <div class="numValue" :title="cert.contractNo">
                    {{ cert.contractNo }}
                  </div>
                </div>
                <div
                  v-if="formatValidity(cert)"
                  class="certNum"
                  style="min-width: 205px"
                >
                  <div class="numLabel">有效期：</div>
                  <div class="numValue" style="color: #009688">
                    {{ formatValidity(cert) }}
                  </div>
                </div>
                <div
                  v-if="cert.description"
                  class="certNum"
                  style="min-width: 219px"
                >
                  <div class="numLabel">备注：</div>
                  <div
                    class="numValue"
                    style="color: #009688"
                    :title="cert.certNo"
                  >
                    {{ cert.certNo }}
                  </div>
                </div>
                <div
                  v-if="getStatusInfo(cert).text"
                  class="certNum"
                  style="min-width: 60px; text-align: right"
                >
                  <div
                    class="numValue"
                    :style="{ color: getStatusInfo(cert).color }"
                  >
                    {{ getStatusInfo(cert).text }}
                  </div>
                </div>
              </div>
              <Button
                v-if="
                  cert.filePaths && JSON.generalParse(cert.filePaths).length > 0
                "
                type="primary"
                @click="viewLicense(cert, 'contract')"
                data-testid="button_viewLicenseContract_certificatesDetailModal"
              >
                证照查看
              </Button>
            </div>
          </div>
        </div>
        <!-- 关联医院商品 -->
        <div class="tutorial-field">
          <div class="tutorial-field-legend">
            <span>关联医院商品</span>
          </div>
          <div class="tutorial-field-content">
            <Button
              type="primary"
              class="mx-2"
              @click="handleAdd"
              data-testid="button_addProduct_certificatesDetailModal"
            >
              新增
            </Button>
            <ChcGrid>
              <template #action="scope">
                <Button
                  type="primary"
                  @click="handleDelete(scope.row)"
                  :data-testid="`button_delete_${scope.rowIndex}_certificatesDetailModal`"
                >
                  删除
                </Button>
              </template>
            </ChcGrid>
          </div>
        </div>
      </div>
      <!-- 操作按钮 -->
      <div
        class="flex w-full items-center justify-center border-t border-[hsl(var(--border))] pt-[7px]"
      >
        <div class="flex gap-[10px]">
          <Button
            type="primary"
            @click="handlePass"
            data-testid="button_pass_certificatesDetailModal"
          >
            通过
            <template #icon>
              <SvgSaveIcon />
            </template>
          </Button>
          <Button
            type="primary"
            danger
            @click="handleReject"
            data-testid="button_reject_certificatesDetailModal"
          >
            拒绝
            <template #icon>
              <SvgCloseIcon />
            </template>
          </Button>
          <Button
            @click="modalApi.close()"
            data-testid="button_cancel_certificatesDetailModal"
          >
            取消
            <template #icon>
              <SvgCloseIcon />
            </template>
          </Button>
        </div>
      </div>
      <!-- 查看 -->
      <licenseViewPictureModal />
      <!-- 新增 -->
      <BatchAddModal />
    </div>
  </ModalFirst>
</template>

<style scoped lang="scss">
.pro-box {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 15px;
  font-size: 14px;

  .pro-item {
    display: flex;
    align-items: center;
    width: 50%;
    padding: 5px 10px;

    .label {
      width: 65px;
      color: #606266;
    }

    .text {
      width: calc(100% - 80px);
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: bold;
      color: #303033;
      white-space: nowrap;
    }
  }
}

.tutorial-field {
  padding-bottom: 10px;
  margin-bottom: 15px;
  border: 1px solid rgb(177 177 177);
  border-top: none;

  .tutorial-field-legend {
    font-size: 14px;
    font-weight: 500;
    color: #9a9a9a;

    span {
      float: left;
      padding: 0 10px;
      transform: translateY(-50%);
    }

    &::before {
      float: left;
      width: 20px;
      content: ' ';
      border-top: 1px solid rgb(177 177 177);
    }

    &::after {
      position: relative;
      top: 0;
      // height: 24px;
      left: 3px;
      display: block;
      margin: 0 1px 0 0;
      overflow: hidden;
      content: ' ';
      border-top: 1px solid rgb(177 177 177);
    }
  }

  .tutorial-field-content {
    padding-top: 16px;
  }
}

.cert-item {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: space-between;
  padding: 3px 10px 3px 5px;
  line-height: 20px;

  &.default {
    background: rgb(245 245 245);
  }

  .first {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    width: calc(100% - 70px);

    .certNum {
      display: flex;
      padding: 5px 3px;
      font-size: 13px;
      line-height: 20px;

      .numLabel {
        color: #606266;
      }

      .numValue {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        font-weight: bold;
        color: #303033;
        white-space: nowrap;
      }
      // 最后一个certNum占剩余空间
      &:last-child {
        flex: 1;
      }
    }
  }
}

.checkDetail {
  width: 20px;
  height: 20px;
  margin-right: 3px;
  text-align: center;
  background: #dfdfdf;
  border-radius: 3px;

  .arrow {
    display: inline-block;
    padding: 4px;
    border: solid #fff;
    border-width: 0 2px 2px 0;
  }

  .down {
    margin-bottom: 3px;
    transform: rotate(45deg);
  }

  .up {
    margin-top: 8px;
    transform: rotate(-135deg);
  }

  .disabled {
    cursor: not-allowed;
    border-color: #c0c4cc;
  }

  &:hover .arrow {
    border-color: #777;
  }
}

.hasData {
  color: #fff;
  background: #009688;

  .certNum {
    display: flex;
    padding: 5px 3px;
    font-size: 13px;
    line-height: 20px;

    .numLabel {
      color: #606266;
    }

    .numValue {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: bold;
      color: #303033;
      white-space: nowrap;
    }
  }
}

.auth-box {
  margin: 10px 5px;
  border: 1px solid #f0f0f0;
}

// 逐级授权书样式
.sub-authorize-container {
  padding: 5px 0;

  .line-title {
    padding: 4px 5px;
    margin-bottom: 5px;
    font-size: 13px;
    font-weight: bold;
    color: #077066;
    border-bottom: 1px solid #e4e7ed;
  }
}
</style>
