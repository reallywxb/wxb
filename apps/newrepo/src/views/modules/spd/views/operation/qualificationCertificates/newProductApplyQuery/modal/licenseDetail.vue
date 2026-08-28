<script lang="ts" setup>
import { computed, h, onMounted, ref } from 'vue';

import { SvgCloseIcon, SvgSaveIcon } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

import { Button, message, Modal } from 'ant-design-vue';

import { applyOrReject, getSyncApplyDetail } from '../api';
import pictureView from './pictureView.vue';

const state = ref<any>();
const productCerts = ref<any[]>([]); // 产品证照
const manufCerts = ref<any[]>([]); // 生产企业证照
const vendorCerts = ref<any[]>([]); // 供应商证照
const authorizes = ref<any[]>([]); // 授权信息
const newProductApply = ref<any[]>([]); // 新品信息
// 新增：用于控制授权书折叠状态
const expandedAuthIds = ref<Set<string>>(new Set());
const [ModalFirst, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },
  draggable: true,
  showConfirmButton: false,
  showCancelButton: false,
  footer: false,
  onOpenChange: async (isOpen: boolean) => {
    if (isOpen) {
      // 清空旧数据
      productCerts.value = [];
      vendorCerts.value = [];
      manufCerts.value = [];
      authorizes.value = [];
      newProductApply.value = [];
      expandedAuthIds.value.clear();
      state.value = modalApi.getData<Record<string, any>>();
      console.warn('state.value', state.value);
      const result: any = await getSyncApplyDetail({
        id: state.value.row.applyId,
      });
      if (result && result.success) {
        const data = result.rows ? result.rows[0] : {};
        const tempProductCerts = data.productCerts || [];
        //  修改：与老系统逻辑一致，将 productMaster 作为第一条产品证照
        if (data.productMaster) {
          tempProductCerts.unshift(data.productMaster);
        }
        productCerts.value = tempProductCerts;
        vendorCerts.value = data.vendorCerts || [];
        manufCerts.value = data.manufCerts || [];
        authorizes.value = data.authorizes || [];
        newProductApply.value = data.newProductApply || [];
        // 检查并默认展开含有逐级授权书的项
        authorizes.value.forEach((auth) => {
          if (auth.lines && auth.lines.length > 0) {
            expandedAuthIds.value.add(auth.authorizeApplyId);
          }
        });
      }
    }
  },
});

// 基础信息配置，适配新品信息
const basicConfig = ref<any[]>([
  { prop: 'bpartnerName', name: '供应商' },
  { prop: 'productName', name: '产品名' },
  { prop: 'medicineName', name: '商品名' },
  { prop: 'productSpec', name: '规格' },
  // { prop: 'modelNo', name: '型号' },
  { prop: 'productStyle', name: '剂型' },
  {
    prop: 'isEssential',
    name: '是否基本药物',
    format: (v: string) => (v === 'Y' ? '是' : '否'),
  },
  {
    prop: 'isOtc',
    name: '是否OTC',
    format: (v: string) => (v === 'Y' ? '是' : '否'),
  },
  {
    prop: 'isInsurance',
    name: '是否医保',
    format: (v: string) => (v === 'Y' ? '是' : '否'),
  },
  { prop: 'MAH', name: '上市许可持有人' },
  { prop: 'insuranceUOMName', name: '医保结算单位' },
  {
    prop: 'priceList',
    name: '零售价',
    format: (v: any) => (v ? `￥${Number(v).toFixed(3)}` : '￥0.000'),
  },
  { prop: 'manufacturer', name: '生产企业' },
  { prop: 'productTypeName', name: '产品类型' },
  { prop: 'bpartnerName', name: '供应商' },
  { prop: 'description', name: '备注' },
]);

// 创建一个计算属性用来过滤没有值的basicConfig项
const filterBasicConfig = computed(() => {
  if (!state.value.row) {
    return [];
  }
  const row = state.value.row;
  return basicConfig.value.filter((item) => {
    const value = row[item.prop];
    return value !== undefined && value !== null && value !== '';
  });
});

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

// 授权书折叠/展开切换
const toggleAuthExpansion = (cert: any) => {
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
  if (expandedAuthIds.value.has(id)) {
    expandedAuthIds.value.delete(id);
  } else {
    expandedAuthIds.value.add(id);
  }
};

// 审核通过
const handlePass = () => {
  interface WarningItem {
    name: string;
    status: string;
  }
  const warnings: {
    noStr: WarningItem[];
    wpStr: WarningItem[];
  } = {
    wpStr: [],
    noStr: [],
  };

  // 修改：检查所有类型的证照
  const allCerts = [
    ...(productCerts.value || []),
    ...(vendorCerts.value || []),
    ...(manufCerts.value || []),
    ...(authorizes.value || []),
  ];

  allCerts.forEach((cert: any) => {
    // 授权书的名称字段是 authorizeCompanyName
    const certName =
      cert.certTypeName || cert.authorizeCompanyName || '未知证照';
    const statusInfo = getStatusInfo(cert);

    if (cert.checkStatus === 'WC' || cert.checkStatus === 'WA') {
      warnings.wpStr.push({ name: certName, status: statusInfo.text });
    } else if (cert.checkStatus === 'NO') {
      warnings.noStr.push({ name: certName, status: statusInfo.text });
    }
  });

  // 构建确认框内容 (逻辑保持不变)
  let modalTitle = '确认';
  let modalContent: ReturnType<typeof h> | string = '确认通过本次申请？';
  const hasWarnings = warnings.wpStr.length > 0 || warnings.noStr.length > 0;
  if (hasWarnings) {
    modalTitle = '提示';
    modalContent = h('div', null, [
      h('p', null, '您还有'),
      ...[...warnings.wpStr, ...warnings.noStr].map((content) =>
        h('p', { style: { textIndent: '1em' } }, [
          h('span', null, content.name),
          h(
            'span',
            { style: { color: '#fc0925' } },
            `证照核对${content.status}`,
          ),
        ]),
      ),
      h('p', { style: { marginTop: '10px' } }, '确认要通过本次申请吗？'),
    ]);
  }
  // 弹出确认框 (逻辑保持不变)
  Modal.confirm({
    title: modalTitle,
    content: modalContent,
    width: '360px',
    centered: true,
    async onOk() {
      try {
        const { applyId, checkStatus } = state.value.row;
        const payload = [
          {
            applySyncId: applyId,
            status: checkStatus === 'WA' ? 'WC' : 'PS',
            checkRemark: '',
            productIds: [],
            removedProductCodes: [],
          },
        ];
        const params = {
          ids: JSON.stringify(payload),
        };
        const result = await applyOrReject(params);
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
  let rejectReason = '';

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
      onInput: (e: Event) => {
        rejectReason = (e.target as HTMLTextAreaElement).value;
      },
    }),
    width: '400px',
    centered: true,
    async onOk() {
      if (!rejectReason || rejectReason.trim() === '') {
        message.warning('驳回原因不能为空！');
        throw new Error('驳回原因不能为空');
      }

      try {
        const { applyId } = state.value.row;
        const payload = [
          {
            applySyncId: applyId,
            status: 'NO', // 拒绝的状态是 'NO' (未通过)
            checkRemark: rejectReason.trim(),
            productIds: [],
            removedProductCodes: [],
          },
        ];

        const params = {
          ids: JSON.stringify(payload),
        };
        const result = await applyOrReject(params);
        if (result && result.success) {
          message.success('驳回成功！');
          modalApi.close();
          state.value.callback();
        } else {
          message.error(result?.msg || '操作失败！');
        }
      } catch (error) {
        console.error('驳回操作失败:', error);
      }
    },
    onCancel() {},
  });
};

// 证照核对弹框
const [pictureViewModal, PictureModalApi] = useVbenModal({
  class: 'w-[1300px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: pictureView,
  draggable: true,
});
const handlehandleViewLicense = (cert: any, type: string) => {
  console.warn('handlehandleViewLicense', cert, type);
  let apiType = '';
  switch (type) {
    case 'authorize':
    case 'authorizeLines': {
      apiType = 'Authorize';
      break;
    }
    case 'manufCert':
    case 'vendorCert': {
      apiType = 'Company';
      break;
    }
    case 'productCert': {
      // 老代码逻辑：第一条是主数据，用ProductM，其余用ProductO
      apiType =
        productCerts.value.indexOf(cert) === 0 ? 'ProductM' : 'ProductO';
      break;
    }
  }

  PictureModalApi.setData({
    openType: 'preview',
    applyId: state.value.row.applyId, // 传递外层申请信息
    apiType,
    data: {
      ...cert,
      // 状态更新回调
      updateStatusCallback: (updateInfo: any) => {
        // 更新当前证书的状态
        Object.assign(cert, {
          checkStatus: updateInfo.status,
          ...(updateInfo.checkRemark && {
            checkRemark: updateInfo.checkRemark,
          }),
        });
      },
    },
  }).open();
};

onMounted(() => {});
</script>
<template>
  <ModalFirst
    class="formatBtnIconPosition h-[650px] w-[1200px]"
    content-class="h-[calc(100%-55px)] overflow-y-hidden flex-none p-1"
    title="新品证照详情"
  >
    <div class="h-full">
      <div class="h-[calc(100%-38px)] overflow-y-auto">
        <!-- 基础信息 -->
        <div class="mb-[15px] flex flex-wrap text-sm">
          <div
            v-for="item in filterBasicConfig"
            :key="item.prop"
            class="flex w-1/3 items-center px-[10px] py-[5px]"
          >
            <div :class="`w-[${item.width || 100}px]`" class="text-[#606266]">
              {{ item.name }}
            </div>
            <div
              class="w-[calc(100%-100px)] overflow-x-hidden text-ellipsis whitespace-nowrap font-bold text-[#303033]"
            >
              {{
                item.format
                  ? item.format(state.row[item.prop])
                  : state.row[item.prop] || '-'
              }}
            </div>
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
                  v-if="cert.oldCertNo && index === 0"
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
                @click="handlehandleViewLicense(cert, 'productCert')"
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
                @click="handlehandleViewLicense(cert, 'vendorCert')"
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
                @click="handlehandleViewLicense(cert, 'manufCert')"
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
            <div
              v-for="(auth, index) in authorizes"
              :key="auth.authorizeApplyId"
              class="auth-box"
              :class="{ default: index % 2 === 0 }"
            >
              <div class="cert-item">
                <div class="first">
                  <div
                    class="checkDetail"
                    :class="{ hasData: auth.lines && auth.lines.length > 0 }"
                    @click="toggleAuthExpansion(auth)"
                  >
                    <i
                      class="arrow"
                      :class="
                        expandedAuthIds.has(auth.authorizeApplyId)
                          ? 'up'
                          : 'down'
                      "
                    ></i>
                  </div>

                  <div class="certNum" style="width: 260px">
                    <div class="numLabel">授权企业：</div>
                    <div class="numValue" :title="auth.authorizeCompanyName">
                      {{ auth.authorizeCompanyName }}
                    </div>
                  </div>
                  <div class="certNum" style="width: 260px">
                    <div class="numLabel">被授权企业：</div>
                    <div class="numValue" :title="auth.toAuthorizeCompanyName">
                      {{ auth.toAuthorizeCompanyName }}
                    </div>
                  </div>
                  <div
                    v-if="formatValidity(auth)"
                    class="certNum"
                    style="min-width: 205px"
                  >
                    <div class="numLabel">有效期：</div>
                    <div
                      class="numValue"
                      :title="formatValidity(auth) || void 0"
                    >
                      {{ formatValidity(auth) }}
                    </div>
                  </div>
                  <div v-if="auth.description" class="certNum" style="flex: 1">
                    <div class="numLabel">备注：</div>
                    <div class="numValue" :title="auth.description">
                      {{ auth.description }}
                    </div>
                  </div>
                  <div
                    v-if="getStatusInfo(auth).text"
                    class="certNum"
                    style="min-width: 60px; text-align: right"
                  >
                    <div
                      class="numValue"
                      :style="{ color: getStatusInfo(auth).color }"
                    >
                      {{ getStatusInfo(auth).text }}
                    </div>
                  </div>
                </div>
                <Button
                  v-if="
                    auth.filePaths &&
                    JSON.generalParse(auth.filePaths).length > 0
                  "
                  type="primary"
                  @click="handlehandleViewLicense(auth, 'authorize')"
                >
                  证照查看
                </Button>
              </div>
              <div
                v-if="expandedAuthIds.has(auth.authorizeApplyId)"
                class="sub-authorize-container"
              >
                <div class="line-title">企业逐级授权书</div>
                <div
                  v-for="(line, lineIndex) in auth.lines"
                  :key="line.authorizeApplyId"
                  class="cert-item"
                  :class="{ default: lineIndex % 2 === 0 }"
                >
                  <div class="first">
                    <div class="certNum" style="width: 260px">
                      <div class="numLabel">授权企业：</div>
                      <div class="numValue" :title="line.authorizeCompanyName">
                        {{ line.authorizeCompanyName }}
                      </div>
                    </div>
                  </div>
                  <Button
                    v-if="
                      line.filePaths &&
                      JSON.generalParse(line.filePaths).length > 0
                    "
                    type="primary"
                    @click="handlehandleViewLicense(line, 'authorizeLines')"
                  >
                    证照查看
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 操作 -->
      <div
        class="flex w-full items-center justify-end border-t border-[hsl(var(--border))] pt-[7px]"
      >
        <div class="flex gap-[10px]">
          <Button v-if="false" type="primary" @click="handlePass">
            通过
            <template #icon>
              <SvgSaveIcon />
            </template>
          </Button>
          <Button v-if="false" type="primary" danger @click="handleReject">
            拒绝
            <template #icon>
              <SvgCloseIcon />
            </template>
          </Button>
          <Button @click="modalApi.close()">
            取消
            <template #icon>
              <SvgCloseIcon />
            </template>
          </Button>
        </div>
      </div>
      <pictureViewModal />
    </div>
  </ModalFirst>
</template>

<style scoped lang="scss">
.tutorial-field {
  padding-bottom: 15px;
  margin-top: 15px;
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
