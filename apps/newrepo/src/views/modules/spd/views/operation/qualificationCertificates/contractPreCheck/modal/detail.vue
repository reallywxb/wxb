<script lang="ts" setup>
import type { ContractDetailType, DetailResponse } from '../api';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { SvgCloseIcon, SvgSaveIcon } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

import { Button, message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import { applyOrReject, getSyncApplyDetail } from '../api';
import pictureView from './pictureView.vue';

const route = useRoute();
const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数
const hiddenField: string = urlParams?.hiddenField || '';

const state = ref<any>();
const contracts = ref<ContractDetailType[]>([]); // 合同信息
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
      const result: DetailResponse = await getSyncApplyDetail({
        id: state.value.row.applyId,
      });
      if (result && result.success) {
        if (result.rows.length === 0) return;
        const data = result.rows[0];
        contracts.value = data?.contracts || [];
        // 表格数据应该来自第一个合同的商品
        const contractProducts = contracts.value[0]?.products || [];
        ChcGridApi.grid.reloadData(contractProducts);
      }
      // await nextTick();
    }
  },
});

const [ChcGrid, ChcGridApi] = useVbenVxeGrid({
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
        visible: !hiddenField.includes('modelNo'),
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
        visible: false,
      },
    ],
    cellStyle(scope: any) {
      if (
        scope.column.field === 'productCode' ||
        scope.column.field === 'productName' ||
        scope.column.field === 'productSpec' ||
        scope.column.field === 'manufacturer' ||
        scope.column.field === 'isActive'
      ) {
        if (scope.row.isHasRef === 'N') {
          return {
            color: 'orange',
          };
        }
        if (scope.row.isActive) {
          return {
            color: 'gray',
          };
        }
      }
    },
  },
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
  // 遍及检查(供应商、生产企业)，生成告警信息
  contracts.value.forEach((cert: ContractDetailType) => {
    const certName = cert.contractNo || '未知合同';
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
        const { applyId, checkStatus } = state.value.row;
        // 整合接口入参
        const payload = [
          {
            applySyncId: applyId,
            status: checkStatus === 'WA' ? 'WC' : 'PS',
            checkRemark: '',
            productIds: [],
            removedProductCodes: [],
          },
        ];
        console.warn('handlePass', payload);
        const params = {
          ids: JSON.stringify(payload),
        };
        // 调用接口
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
      'data-testid': 'textarea_rejectReason_detail',
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
        const { applyId, checkStatus } = state.value.row;
        // 准备接口参数
        const payload = [
          {
            applySyncId: applyId,
            status: checkStatus === 'WA' ? 'NO' : 'PS', // 拒绝的状态是 'NO' (未通过)
            checkRemark: rejectReason.trim(), // 传入用户输入的驳回原因
            productIds: [], // 同样需要传递当前的 productIds
            removedProductCodes: [], // 同样需要传递已移除的 code
          },
        ];

        const params = {
          ids: JSON.stringify(payload),
        };

        // 调用接口
        const result = await applyOrReject(params);
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

// 证照核对弹框
const [pictureViewModal, PictureModalApi] = useVbenModal({
  class: 'w-[1300px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: pictureView,
  draggable: true,
});
const handlehandleViewLicense = (cert: ContractDetailType, type: string) => {
  console.warn('handlehandleViewLicense', cert, type);
  PictureModalApi.setData({
    openType: 'preview',
    applyId: state.value.row.applyId, // 传递外层申请信息
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

const handleDelete = (row: any) => {
  console.warn('handleDelete', row);
  // chcGridApi.removeRow(row);
};

onMounted(() => {});
</script>
<template>
  <ModalFirst
    class="formatBtnIconPosition h-[650px] w-[1200px]"
    content-class="h-[calc(100%-55px)] overflow-y-hidden flex-none p-1"
    title="合同详情"
  >
    <div class="h-full">
      <div class="h-[calc(100%-38px)] overflow-y-auto">
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
                  <div class="numValue" :title="cert.certNo">
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
                @click="handlehandleViewLicense(cert, 'contract')"
                :data-testid="`button_contract_${index}_detail`"
              >
                证照核对
              </Button>
            </div>
          </div>
        </div>
        <!-- 合同商品(表格) -->
        <div class="tutorial-field">
          <div class="tutorial-field-legend"><span>合同商品</span></div>
          <div class="tutorial-field-content">
            <Button type="primary" class="mx-2" v-if="false">新增</Button>
            <div
              class="flex items-center px-[10px] py-[10px] font-bold text-[#ff9800]"
            >
              <div
                class="h-4 w-4 rounded-full border-2 border-solid border-[#ff9800] text-center leading-4"
              >
                i
              </div>
              <span class="ml-[5px]">黄色代表该商品在spd系统未找到</span>
            </div>
            <ChcGrid>
              <template #action="scope">
                <Button
                  type="primary"
                  @click="handleDelete(scope.row)"
                  :data-testid="`button_delete_${scope.rowIndex}_detail`"
                >
                  删除
                </Button>
              </template>
            </ChcGrid>
          </div>
        </div>
      </div>
      <!-- 操作 -->
      <div
        class="flex w-full items-center justify-center border-t border-[hsl(var(--border))] pt-[7px]"
      >
        <div class="flex gap-[10px]">
          <Button
            type="primary"
            @click="handlePass"
            data-testid="button_pass_detail"
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
            data-testid="button_reject_detail"
          >
            拒绝
            <template #icon>
              <SvgCloseIcon />
            </template>
          </Button>
          <Button @click="modalApi.close()" data-testid="button_cancel_detail">
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
