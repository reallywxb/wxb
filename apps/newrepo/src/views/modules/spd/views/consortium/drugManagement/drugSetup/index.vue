<script lang="ts" setup>
import { computed, onMounted, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import {
  AddActionIcon,
  AntdArrowLeftOutlined,
  IconfontBasicView,
} from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';
import { isEmpty } from '@vben/utils';
// import { TreeSelect as AntdTreeSelect, Button } from 'ant-design-vue';

import { Button, message } from 'ant-design-vue';

import { requestFormClient } from '#/api/request';
import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepClone, deepMerge } from '#/utils/util';

import { INITIAL_EDIT_FORM_DATA } from './data';
import EditPage from './editPage.vue';
import addModalUI from './modals/addModal.vue';
import dispatchToHospitalModalUI from './modals/dispatchToHospital.vue';

const route = useRoute();
const orgID = route.query.AD_Org_ID;
console.warn('orgID', orgID);
const extParams = ref<any>({});
// 下方医院的数量
const checkedRowsCount = ref<number>(0);

// 切换页面 LIST-列表 DETAIL-详情
const currentPage = ref<'DETAIL' | 'LIST'>('LIST');
const editForm = ref({ ...INITIAL_EDIT_FORM_DATA });
const isViewMode = computed(() => currentPage.value === 'DETAIL');
// const selectedOrgs = ref<string[]>([]);
const orgOptions = ref<any[]>([]);

// 获取院区数据
const getOrgOptions = async () => {
  try {
    const res = await requestFormClient.post('/mcOrgAction/getOrgTree.do', {});
    if (res && res.success) {
      const data = res.data || res.rows || [];
      orgOptions.value = addUniqueKeyToTree(data);
      console.warn('orgOptions loaded:', orgOptions.value);
    }
  } catch (error) {
    console.error('获取院区数据失败:', error);
  }
  return [];
};

/**
 * 查找树中第一个未禁用的节点
 * @param treeData 树形数据
 * @returns 第一个未禁用的节点，未找到返回 null
 */
const findFirstEnabledNode = (treeData: any[]): any => {
  for (const node of treeData) {
    if (!node.disabled) {
      return node;
    }
    if (node.children && Array.isArray(node.children)) {
      const found = findFirstEnabledNode(node.children);
      if (found) return found;
    }
  }
  return null;
};

/**
 * 重构当前函数(由于院区多选改为单选，所以需要为非叶子节点添加 disabled: true 和 selectable: false)
 * 为树形结构添加唯一的key，避免不同层级存在相同的id造成污染
 * @param treeData 树形结构数据
 * @param parentPath 父节点的路径，用于构建唯一key
 * @returns 处理后的树形结构数据
 */
const addUniqueKeyToTree = (
  treeData: any[],
  parentPath: string = '',
): any[] => {
  return treeData.map((node) => {
    // 构建唯一的key: type-id 或者 parentPath-type-id
    const currentKey = parentPath
      ? `${parentPath}-${node.type}-${node.id}`
      : `${node.type}-${node.id}`;
    const processNodes = {
      ...node,
      key: currentKey, // 唯一的value
      disabled: node.type !== 'campus', // 非院区节点设为禁用
      selectable: node.type === 'campus', // 院区节点设为可选
      originalId: node.id, // 保留原始id
    };
    // 递归处理子节点
    if (node.children && Array.isArray(node.children)) {
      processNodes.children = addUniqueKeyToTree(node.children, currentKey);
    }
    return processNodes;
  });
};

/**
 * 重构当前函数(由于院区多选改成单选，所以需要改为单个值返回)
 * 从 TreeSelect 的值中提取院区 id
 * @param selectedKey 选中的key
 * @param treeData 树形结构数据
 * @returns 提取出的院区id
 */
const extractCampusId = (selectedKey: string, treeData: any[]): number => {
  let campusId: number = 0;
  const keyMap = new Map<string, { id: number; type: string }>();

  const buildKeyMap = (nodes: any[]) => {
    nodes.forEach((node) => {
      keyMap.set(node.key, {
        id: node.originalId || node.id,
        type: node.type,
      });
      if (node.children) {
        buildKeyMap(node.children);
      }
    });
  };

  buildKeyMap(treeData);

  const nodeInfo = keyMap.get(selectedKey);
  // 只添加 type 为 'campus' 的节点
  if (nodeInfo && nodeInfo.type === 'campus') {
    campusId = nodeInfo.id;
  }
  // selectedKeys.forEach((key) => {
  //   const nodeInfo = keyMap.get(key);
  //   // 只添加 type 为 'campus' 的节点
  //   if (nodeInfo && nodeInfo.type === 'campus') {
  //     result.push(nodeInfo.id);
  //   }
  // });

  return campusId;
};

// 父表
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      showCollapseButton: false,
      submitButtonOptions: {
        content: '查询',
      },
      commonConfig: {
        labelClass: 'w-[90px]',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: true,
      checkboxConfig: {
        trigger: 'row',
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
      pagerConfig: {
        enabled: true,
      },
      cellStyle(scope: any) {
        if (scope.row.IsActive === 'N') {
          return {
            color: 'gray',
          };
        }
      },
    }),
  },
  {
    id: 'drugSetupGrid',
    queryUrl: '/mcProductAction/queryProductByCampus.do',
    gridColumns: [
      { title: '多选', type: 'checkbox', width: 50, align: 'center' },
      {
        title: '序号',
        width: 50,
        type: 'seq',
        align: 'center',
        field: 'index',
      },
      {
        field: 'campusName',
        title: '院区',
        minWidth: '160px',
        sortable: true,
      },
      {
        field: 'insurance',
        title: '医保编码',
        minWidth: '160px',
        sortable: true,
      },
      {
        field: 'productCode',
        title: '药品编码',
        minWidth: '120px',
        sortable: true,
      },
      {
        field: 'name',
        title: '药品名称',
        minWidth: '120px',
        sortable: true,
      },
      {
        field: 'medicineName',
        title: '通用名称',
        width: '120px',
        sortable: true,
      },
      {
        field: 'value',
        title: '拼音码',
        width: '100px',
      },
      {
        field: 'productSpec',
        title: '规格',
        width: '90px',
      },
      {
        field: 'uomName',
        title: '单位',
        width: '90px',
      },
      {
        field: 'baseUOMName',
        title: '最小单位',
        width: '100px',
      },
      {
        field: 'baseUOMQty',
        title: '最小单位转换比',
        width: '140px',
        align: 'right',
      },
      {
        field: 'baseUOMPrecision',
        title: '最小单位精度',
        width: '120px',
        align: 'right',
      },
      {
        field: 'manufacturerName',
        title: '生产厂家',
        width: '160px',
      },
      {
        field: 'certificateNo',
        title: '批准文号',
        width: '120px',
      },
      {
        field: 'markCode',
        title: '省标编码',
        width: '120px',
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
    formSchema: [
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        componentProps: {
          placeholder: '请输入编码/名称/搜索码',
        },
      },
      {
        component: 'TreeSelect',
        componentProps: {
          allowClear: true,
          placeholder: '请选择院区',
          showSearch: true,
          // showCheckedStrategy: 'SHOW_CHILD', // 只显示子节点
          treeData: [],
          treeNodeFilterProp: 'label',
          onChange: (value: any) => {
            console.warn('campusId onChange', value);
          },
        },
        fieldName: 'campusIds',
        label: '院区',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: false,
            dictUrl: '/baseHandleAction/refList.do?id=1000244',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择药品组',
            paginate: false,
            allowClear: true,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            defaultValue: '',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'productControlLevel',
        label: '药品组',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            options: [
              { value: '', label: '全部' },
              { value: 'Y', label: '是' },
              { value: 'N', label: '否' },
            ],
            placeholder: '请选择启用状态',
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
          };
        },
        defaultValue: '',
        fieldName: 'isActive',
        label: '启用状态',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            options: [
              { value: '', label: '全部' },
              { value: 'Y', label: '是' },
              { value: 'N', label: '否' },
            ],
            placeholder: '请选择带量采购',
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
          };
        },
        defaultValue: '',
        fieldName: 'isBulkPurchase',
        label: '带量采购',
      },
    ],

    tableSearchExtraParams: extParams.value,
    gridEvents: {
      // 单个复选框触发的事件
      checkboxChange: ({ records }: { records: any[] }) => {
        //  calculateSelectedAmount(records);
        checkedRowsCount.value = records.length || 0;
      },
      // 全选/全不选触发的事件
      checkboxAll: ({ records }: { records: any[] }) => {
        checkedRowsCount.value = records.length || 0;
      },
    },
    afterFetchFn: (params) => {
      // 清空下发仓库选中数量
      checkedRowsCount.value = 0;
      const rows =
        params.rows?.map((item: any) => {
          return {
            ...item,
          };
        }) || [];

      return {
        ...params,
        records: rows,
      };
    },
    beforeFetchFn: (params) => {
      // console.warn('params', params);
      const campusKey = params.campusIds;
      // console.warn('campusKeys', campusKey, typeof campusKey);
      // 多院区 修改成单院区了
      const campusId = campusKey
        ? extractCampusId(campusKey, orgOptions.value)
        : undefined;
      console.warn('campusId', campusId);
      // const newCampusIds =
      //   campusKeys && Array.isArray(campusKeys)
      //     ? extractCampusIds(campusKeys, orgOptions.value)
      //     : [];
      // console.warn('提取出来的院区IDS', newCampusIds);
      // const campusIdsStr =
      //   newCampusIds.length > 0 ? newCampusIds.join(',') : undefined;
      // console.warn('campusIdsStr', campusIdsStr, typeof campusIdsStr);
      return {
        ...params,
        campusIds: campusId,
      };
    },
  },
);

// const calculateSelectedAmount = (selectedRows: any[]) => {
//   const total = selectedRows.reduce((sum, row) => {
//     return sum + (Number.parseFloat(row.totalAmt) || 0);
//   }, 0);
//   selectedAmount.value = total;
// };

// 详情
const handleDetail = (scope: any) => {
  console.warn('详情:', scope.row);
  const row = scope.row || {};
  currentPage.value = 'DETAIL';
  Object.assign(editForm.value, {
    productCode: row.productCode || '', // 药品编码
    name: row.name || '', // 药品名称
    productSpec: row.productSpec || '', // 药品规格
    productStyle: row.productStyle || '', // 药品剂型
    isActive: row.isActive || '', // 物资状态
    medicineName: row.medicineName || '', // 通用名
    productUserCode: row.productUserCode || '', // 自定义编码
    certValidTo: row.certValidTo || '', // 注册证有效期
    isLong: row.isLong || undefined, // 长期有效
    photoUrl: row.photoUrl || '', // 物资图片
    value: row.value || '', // 拼音码
    productName: row.productName || '', // 品牌
    manufacturerId: row.manufacturerId || '', // 生产企业
    isForeign: row.isForeign || undefined, // 药品来源
    certificateNo: row.certificateNo || '', // 批准文号
    uomId: row.uomId, // 单位
    baseUOMId: row.baseUOMId, // 最小单位
    baseUOMQty: row.baseUOMQty, // 转换比
    essentialDrugType: row.essentialDrugType || undefined, // 基本药物分类
    insurance: row.insurance || '', // 医保药品编码
    zlType: row.zlType || undefined, // 医保分类
    insurancePaymentType: row.insurancePaymentType || undefined, // 医保支付方式
    isConsistent: row.isConsistent || undefined, // 是否一致性评价
    isIntensive: row.isIntensive || undefined, // 是否重点监控
    storageCondition: row.storageCondition || undefined, // 存储条件
    defaultVendorId: row.defaultVendorId || '', // 默认供应商
    isShortPo: row.isShortPo || undefined, // 是否临采
    isBulkPurchase: row.isBulkPurchase || undefined, // 是否带量采购
    bulkPurchaseType: row.bulkPurchaseType || undefined, // 带量采购分类
    isNew: row.isNew || undefined, // 是否新品
    description: row.description || '', // 备注
    isLot: row.isLot || undefined, // 批次管理
    isGuaranteeDateMandatory: row.isGuaranteeDateMandatory || undefined, // 有效期必填
    isProductionDateMandatory: row.isProductionDateMandatory || undefined, // 生产日期必填
    guaranteeDaysMin: row.guaranteeDaysMin || '', // 近效期天数
    isProductAreaMandatory: row.isProductAreaMandatory || undefined, // 产地必填
    isStoragePackage: row.isStoragePackage || undefined, // 包装管理
    isBasePackage: row.isBasePackage || undefined, // 是否单包
    isControlledProduct: row.isControlledProduct || undefined, // 是否双人作业
    narcoticType: row.narcoticType || undefined, //  毒麻分类
    antiDrugType: row.antiDrugType || undefined, //  抗菌药物类型
    productControlLevel: row.productControlLevel || undefined, // 药品组
    isAntitumor: row.isAntitumor || undefined, // 是否 抗肿瘤
    antitumorType: row.antitumorType || undefined, //  抗肿瘤分类
    skinTestType: row.skinTestType || undefined, // 皮试类型
    isInnovate: row.isInnovate || undefined, // 是否生物创新药
    isPurchasePriceUnify: row.isPurchasePriceUnify || undefined, // 是否统一定价
    isFee: row.isFee || undefined, // 是否计价
    settlementPriceMode: row.settlementPriceMode || undefined, // 后结算价格模式
    value2: row.value2 || '', // 计费编码
    priceList: row.priceList || '', // 价格列表
    pricePO: row.pricePO || '', // 采购价格
    isBid: row.isBid || undefined, // 是否上传省平台
    markCode: row.markCode || '', // 省平台编码
    isCityBid: row.isCityBid || undefined, // 是否上传市平台
    cityBidCode: row.cityBidCode || '', // 市平台编码
    mpackageQty: row.mpackageQty || '', // 中包装数
    lpackageQty: row.lpackageQty || '', // 大包装数
  });
};

const [addModal, addModalApi] = useVbenModal({
  closeOnClickModal: false,
  connectedComponent: addModalUI,
});

const [dispatchToHospitalModal, dispatchToHospitalModalApi] = useVbenModal({
  closeOnClickModal: false,
  connectedComponent: dispatchToHospitalModalUI,
});

// 批量新增
const handleBatchAdd = async () => {
  const formData = await ChcGridApi.formApi.getValues();
  const unProxyCampusKeys = toRaw(formData.campusIds);
  const campusId = extractCampusId(unProxyCampusKeys, orgOptions.value);
  console.warn('handleBatchAdd campusId', campusId);
  // 需要先进行院区的校验
  if (isEmpty(campusId)) {
    message.error('请选择院区再进行操作');
    return;
  }
  addModalApi
    .setData({
      campusId,
      campusKeys: unProxyCampusKeys, // 用于回显
    })
    .open();
};

// 下发
const handleDispatchToHospital = async () => {
  const formData = await ChcGridApi.formApi.getValues();
  const unProxyCampusKeys = toRaw(formData.campusIds); // 解除Proxy包裹
  const campusId = extractCampusId(unProxyCampusKeys, orgOptions.value);
  if (isEmpty(campusId)) {
    message.error('请选择院区再进行操作');
    return;
  }
  const records = ChcGridApi.grid.getCheckboxRecords(true) as any[];
  if (isEmpty(records)) {
    message.error('请选择要下发医院的药品');
    return;
  }
  // const invalidIndexes: number[] = [];
  // records.forEach((record: any, index: number) => {
  //   if (isEmpty(record.campusId)) {
  //     invalidIndexes.push(index + 1);
  //   }
  // });
  // if (invalidIndexes.length > 0) {
  //   message.error(
  //     `您勾选的第${invalidIndexes.join('、')}项药品没有院区，请取消勾选或者修改后再试`,
  //   );
  //   return;
  // }
  dispatchToHospitalModalApi
    ?.setData({
      rows: deepClone(records),
      campusId,
      callback: () => {
        checkedRowsCount.value = 0;
        handleQuery();
      },
    })
    .open();
};

// 返回
const handleBack = () => {
  currentPage.value = 'LIST';
  checkedRowsCount.value = 0;
};
// 查询
const handleQuery = () => {
  ChcGridApi.formApi.getValues().then((resData: any) => {
    console.warn('handleQuery', resData);
    ChcGridApi.query({ ...resData });
  });
};

onMounted(async () => {
  // 加载院区数据
  await getOrgOptions();

  // 更新 TreeSelect 的 treeData
  if (ChcGridApi.formApi?.updateSchema) {
    // console.log('updateSchema', ChcGridApi.formApi?.updateSchema);
    ChcGridApi.formApi.updateSchema([
      {
        fieldName: 'campusIds',
        componentProps: {
          treeData: orgOptions.value,
          treeCheckable: false, // 新修改(去除复选框) 要求只能选择一个院区
          fieldNames: {
            // 这里重新更新 解决 展开状态不同步问题
            label: 'label',
            value: 'key',
            children: 'children',
          },
          dropdownStyle: {
            minWidth: '240px',
          },
          // maxTagCount: 1,
          // maxTagPlaceholder(omittedValues: any[]) {
          //   const labels = omittedValues.map((item) => item.label);
          //   const tooltipLabel = labels.join('、');
          //   return h(
          //     Tooltip,
          //     { title: tooltipLabel },
          //     {
          //       default: () => h('span', {}, `+ ${omittedValues.length}`),
          //     },
          //   );
          // },
        },
      },
    ]);
    // 默认选中第一个未禁用的院区节点
    const firstEnabled = findFirstEnabledNode(orgOptions.value);
    if (firstEnabled) {
      ChcGridApi.formApi.setValues({ campusIds: firstEnabled.key });
    }
  }
  handleQuery();
});
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <addModal :org-options="orgOptions" @close="handleQuery" />
    <dispatchToHospitalModal />
    <div v-show="currentPage === 'LIST'" class="h-full">
      <ChcGrid class="flex-1 overflow-hidden">
        <template #toolbar-actions>
          <Button type="primary" @click="handleBatchAdd" class="mr-[0.5rem]">
            批量添加
            <template #icon>
              <AddActionIcon />
            </template>
          </Button>
          <Button
            type="primary"
            class="mr-[0.5rem]"
            @click="handleDispatchToHospital"
            data-testid="button_dispatchToHospital"
          >
            下发仓库 {{ checkedRowsCount || '' }}
          </Button>
        </template>
        <template #action="scope">
          <Button
            ghost
            type="primary"
            class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
            @click="handleDetail(scope)"
          >
            详情
            <template #icon>
              <IconfontBasicView />
            </template>
          </Button>
        </template>
      </ChcGrid>
    </div>
    <EditPage
      v-show="currentPage === 'DETAIL'"
      v-model:form-data="editForm"
      :current-page="currentPage"
      :is-view-mode="isViewMode"
      @back="handleBack"
    />
    <template #footer v-if="currentPage !== 'LIST'">
      <div
        class="box-border flex h-full flex-1 items-center justify-center gap-[10px] bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.1)]"
      >
        <Button @click="handleBack">
          返回
          <AntdArrowLeftOutlined class="mb-[4px]" />
        </Button>
      </div>
    </template>
  </Page>
</template>

<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  display: none;
}

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
