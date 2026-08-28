<script lang="ts" setup>
import type { DetailResponse, VendorRowType } from '../type';

import { onMounted, ref } from 'vue';

import { SvgCloseIcon } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

import { Button } from 'ant-design-vue';

import { requestFormClient } from '#/api/request';

import pictureView from './licenseView.vue';

interface BasicConfigItem {
  prop: string;
  name: string;
  width: string;
  formatter: (val: string) => string;
}

const state = ref<any>();
const manufCerts = ref<any[]>([]); // 生产企业证照
const vendorCerts = ref<any[]>([]); // 供应商证照

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
      state.value = modalApi.getData<Record<string, any>>();
      console.warn('state.value', state.value);
      const result: DetailResponse = await requestFormClient.post(
        '/productSyncAction/getSyncApplyDetail.do',
        {
          id: state.value.row.applyId,
        },
      );
      if (result && result.success) {
        const data = result.rows[0]!;
        vendorCerts.value = data.vendorCerts || [];
        manufCerts.value = data.manufCerts || [];
      }
      // await nextTick();
    }
  },
});

const basicConfig = ref<BasicConfigItem[]>([
  {
    prop: 'bpartnerName',
    name: '供应商',
    width: '100',
    formatter: (val) => val || '-',
  },
  {
    prop: 'companyName',
    name: '企业',
    width: '100',
    formatter: (val) => val || '-',
  },
  {
    prop: 'companyType',
    name: '企业类型',
    width: '100',
    formatter: (val) => val || '-',
  },
  {
    prop: 'isVendor',
    name: '是否供应商',
    width: '100',
    formatter: (val) => (val === 'Y' ? '是' : '否'),
  },
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

// 证照核对弹框
const [pictureViewModal, PictureModalApi] = useVbenModal({
  class: 'w-[1300px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: pictureView,
  draggable: true,
});
const handleViewLicense = (cert: VendorRowType, type: string) => {
  console.warn('handleViewLicense', cert, type);
  PictureModalApi.setData({
    openType: 'preview',
    applyId: state.value.row.applyId, // 传递外层申请信息
    data: {
      ...cert,
    },
  }).open();
};

onMounted(() => {});
</script>
<template>
  <ModalFirst
    class="formatBtnIconPosition h-[650px] w-[1200px]"
    content-class="h-[calc(100%-55px)] overflow-y-hidden flex-none p-1"
    title="授权书详情"
  >
    <div class="h-full">
      <div class="h-[calc(100%-38px)] overflow-y-auto">
        <!-- 基础信息 -->
        <div class="mb-[15px] flex flex-wrap text-sm">
          <div
            v-for="item in basicConfig"
            :key="item.prop"
            class="flex w-1/2 items-center px-[10px] py-[5px]"
          >
            <div :class="`w-[${item.width || 100}px]`" class="text-[#606266]">
              {{ item.name }}
            </div>
            <div
              class="w-[calc(100%-100px)] overflow-x-hidden text-ellipsis whitespace-nowrap font-bold text-[#303033]"
            >
              {{ item.formatter(state.row[item.prop]) }}
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
              </div>
              <Button
                v-if="
                  cert.filePaths && JSON.generalParse(cert.filePaths).length > 0
                "
                type="primary"
                @click="handleViewLicense(cert, 'vendorCert')"
                :data-testid="`button_view_license_vendorCert_${index}_detailView`"
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
              </div>
              <Button
                v-if="
                  cert.filePaths && JSON.generalParse(cert.filePaths).length > 0
                "
                type="primary"
                @click="handleViewLicense(cert, 'manufCert')"
                :data-testid="`button_ViewLicense_manufCert_${index}_detailView`"
              >
                证照查看
              </Button>
            </div>
          </div>
        </div>
      </div>
      <!-- 操作 -->
      <div
        class="flex w-full items-center justify-end border-t border-[hsl(var(--border))] pt-[7px]"
      >
        <div class="flex gap-[10px]">
          <Button
            @click="modalApi.close()"
            data-testid="button_cancel_detailView"
          >
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
