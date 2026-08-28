<script setup lang="ts">
import type { AuthorizeItem, licenseDetailType } from './api';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button, Descriptions, DescriptionsItem, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import { queryLicenseDetailInfo } from './api';
import licenseViewPictureUI from './licenseViewPicture.vue';

const state = ref<any>({ tableRow: {} });
const authorizes = ref<any[]>([]); // 企业授权书
const contracts = ref<any[]>([]); // 合同证照
const manufCerts = ref<any[]>([]); // 生产企业证照
const newProductApply = ref<any[]>([]); // 审核新品证照
const productCerts = ref<any[]>([]); // 产品证照
const products = ref<any[]>([]); // 关联医院商品
const vendorCerts = ref<any[]>([]); // 供应商证照

// 新增：用于控制企业授权书折叠状态
const expandedAuthorizes = ref<Record<string, boolean>>({});

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
    ],
    data: [],
    height: 'auto',
    pagerConfig: {
      enabled: false,
    },
    //  proxyConfig: {
    //   ajax: {
    //     query: async (_params) => {
    //       return await 请求函数);
    //     },
    //   },
    // },
    scrollY: {
      enabled: true,
      gt: 0,
    },
    showOverflow: true,
  },
});

// 弹框
const [ModalFirst, modalApi] = useVbenModal({
  onCancel: () => {
    modalApi.close();
  },
  showConfirmButton: false,
  showCancelButton: true,
  onOpenChange: async (isOpen: boolean) => {
    if (isOpen) {
      // 重置状态
      expandedAuthorizes.value = {};
      state.value = modalApi.getData<Record<string, any>>();
      console.warn('state', state.value);
      const result = await queryLicenseDetailInfo({
        id: state.value.tableRow.applyId,
      });
      console.warn('queryLicenseDetailInfo', result);
      if (Array.isArray(result.rows) && result.rows.length > 0) {
        const data: licenseDetailType = result.rows[0]!;
        console.warn('data', data);
        productCerts.value = data.productCerts || [];
        vendorCerts.value = data.vendorCerts || [];
        manufCerts.value = data.manufCerts || [];
        authorizes.value = data.authorizes || [];
        contracts.value = data.contracts || [];
        newProductApply.value = data.newProductApply || [];
        // 特殊处理：productMaster 需要插入到 productCerts 数组的开头
        if (data.productMaster) {
          productCerts.value.unshift(data.productMaster);
        }
        console.warn('productCerts', productCerts.value);
        products.value = data.products || [];
        //  使用 grid 的 API 来加载数据
        chcGridApi.grid?.reloadData(products.value);
        // 企业授权书如果存在子集 lines 就默认展示
        authorizes.value.forEach((item) => {
          if (item.lines && item.lines.length > 0) {
            expandedAuthorizes.value[item.authorizeApplyId] = true;
          }
        });
      }
    }
  },
});

// 基础信息
const basicList = [
  { label: '产品名称', field: 'productName' },
  { label: '产品类型', field: 'productType' },
  { label: '产品企业', field: 'manufacturerName' },
  { label: '供应商', field: 'bpartnerName' },
];

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
const getStatusInfo = (item: any) => {
  const statusMap = {
    WC: { text: '未核对', color: '#ff9800' },
    WA: { text: '预审核', color: '#ff9800' },
    PS: { text: '已核对', color: '#009688' },
    NO: { text: '未通过', color: '#fc0925' },
    NP: { text: '未上传', color: '#000000' },
  };
  return statusMap[item.checkStatus] || { text: '', color: '' };
};

// 打开折叠面板
const toggleAuthorize = (cert: AuthorizeItem) => {
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

// pictureView
const [licenseViewPictureModal, PictureModalApi] = useVbenModal({
  class: 'w-[1300px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: licenseViewPictureUI,
  draggable: true,
});

// 查看证照图片
const viewLicense = (
  cert,
  type: 'authorize' | 'manufCert' | 'productCert' | 'vendorCert',
) => {
  console.warn('viewLicense', cert);
  PictureModalApi.setData({
    openType: 'preview',
    type,
    data: {
      ...cert,
    },
  }).open();
};
</script>

<template>
  <ModalFirst title="产品证照详情" class="h-[650px] w-[1300px]">
    <Descriptions title="" style="margin-bottom: 15px">
      <DescriptionsItem
        v-for="item in basicList"
        :key="item.field"
        :label="item.label"
      >
        {{ state.tableRow[item.field] }}
      </DescriptionsItem>
    </Descriptions>
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
            <div v-if="cert.certTypeName" class="certNum" style="width: 227px">
              <div class="numValue" :title="cert.certTypeName">
                {{ cert.certTypeName }}
              </div>
            </div>
            <div v-if="cert.certNo" class="certNum" style="min-width: 219px">
              <div class="numLabel">证照号码：</div>
              <div class="numValue" style="color: #009688" :title="cert.certNo">
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
                :title="formatValidity(cert)"
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
            @click="viewLicense(cert, 'productCert')"
            :data-testid="`button_viewLicense_productCert_${index}_licenseDetail`"
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
            <div v-if="cert.certTypeName" class="certNum" style="width: 227px">
              <div class="numValue" :title="cert.certTypeName">
                {{ cert.certTypeName }}
              </div>
            </div>
            <div v-if="cert.certNo" class="certNum" style="min-width: 219px">
              <div class="numLabel">证照号码：</div>
              <div class="numValue" style="color: #009688" :title="cert.certNo">
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
                :title="formatValidity(cert)"
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
            :data-testid="`button_viewLicense_vendorCert_${index}_licenseDetail`"
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
            <div v-if="cert.certTypeName" class="certNum" style="width: 227px">
              <div class="numValue" :title="cert.certTypeName">
                {{ cert.certTypeName }}
              </div>
            </div>
            <div v-if="cert.certNo" class="certNum" style="min-width: 219px">
              <div class="numLabel">证照号码：</div>
              <div class="numValue" style="color: #009688" :title="cert.certNo">
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
                :title="formatValidity(cert)"
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
            :data-testid="`button_viewLicense_manufCert_${index}_licenseDetail`"
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
        <template
          v-for="(cert, certIndex) in authorizes"
          :key="cert.authorizeApplyId"
        >
          <div class="auth-box">
            <div class="cert-item default">
              <div class="first">
                <div class="certNum" style="width: 260px">
                  <div
                    class="checkDetail"
                    :class="{ hasData: cert.lines && cert.lines.length > 0 }"
                    @click="toggleAuthorize(cert)"
                    :data-testid="`button_Authorize_${certIndex}_licenseDetail`"
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
                  <div class="numValue" :title="cert.toAuthorizeCompanyName">
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
                    :title="formatValidity(cert)"
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
                @click="viewLicense(cert, 'authorize')"
                :data-testid="`button_viewLicense_authorize_${certIndex}_licenseDetail`"
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
                  v-for="(line, lineIndex) in cert.lines"
                  :key="line.authorizeLineCode"
                  class="cert-item"
                >
                  <div class="first">
                    <div class="certNum" style="width: 260px">
                      <div class="numLabel">授权企业：</div>
                      <div class="numValue" :title="line.authorizeCompanyName">
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
                        :title="formatValidity(line)"
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
                    @click="viewLicense(line, 'authorize')"
                    :data-testid="`button_viewLicense_line_${lineIndex}_licenseDetail`"
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
    <!-- 关联医院商品 -->
    <div class="tutorial-field">
      <div class="tutorial-field-legend">
        <span>关联医院商品</span>
      </div>
      <div class="tutorial-field-content">
        <ChcGrid />
      </div>
    </div>
    <!-- <template #prepend-footer>
      <Button type="default">取消</Button>
    </template> -->
    <!-- 证照查看 -->
    <licenseViewPictureModal />
  </ModalFirst>
</template>

<style scoped lang="scss">
// 使用更直接的选择器
:deep(.ant-descriptions-item-content) {
  font-weight: bold !important;
  color: #303033 !important;
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
