<script setup lang="ts">
import type { CascaderProps } from 'ant-design-vue';

// import {queryProvince, queryCity, queryDistrict} from './api';
import type {
  CurrentHandleRow,
  PrescriptionActionRow,
  QueryAreaItem,
} from './type';

import { computed, nextTick, onMounted, ref } from 'vue';

import { UploadCloudIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import {
  Button,
  Cascader,
  Descriptions,
  DescriptionsItem,
  message,
} from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { gridDefaultOptions, useSpdGrid } from '#/components/spd';
import Summarize from '#/components/spd/summarize/index.vue';
import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';

import {
  queryCity,
  queryDistrict,
  queryProvince,
  saveDeliveryInfo,
} from './api';
import { getStatusLabel } from './index';
import SectionContainer from './SectionContainer.vue';
// 类型定义
// interface RegionOption {
//   label: string;
//   value: string;
//   isLeaf?: boolean;
//   loading?: boolean;
//   children?: RegionOption[];
// }

interface PrescriptionInfoField {
  label: string;
  field: string;
  value: string;
  formatter?: (value: any) => string;
}
// const emit = defineEmits<{
//   (e: 'back'): void;
// }>();

const currentTab = defineModel<number>('currentTab');
const currentHandleRow = defineModel<CurrentHandleRow<PrescriptionActionRow>>(
  'currentHandleRow',
  {
    required: true,
  },
); // 当前选中行数据
const detailConfig = defineModel<DetailInfo | undefined>('detailConfig'); // 详情页配置信息

// 处方明细字段
const prescriptionInfoFields = [
  { label: '处方号', field: 'presNo' },
  { label: '开方医院', field: 'orgName' },
  { label: '就诊人', field: 'patientName' },
  { label: '就诊卡号', field: 'patientCard' },
  { label: '手机号', field: 'patientPhoneNo' },
  { label: '性别', field: 'sex' },
  { label: '处方时间', field: 'presDate' },
  { label: '诊断', field: 'diagnosis' },
  {
    label: '状态',
    field: 'preStatus',
    formatter: (value: number | string) => getStatusLabel(value),
  }, // 状态需要单独处理
  { label: '关闭理由', field: 'closeReason' },
];
// 处方明细数据
const prescriptionInfo = computed<PrescriptionInfoField[]>(() => {
  return prescriptionInfoFields.map((item) => {
    return {
      ...item,
      value:
        item.formatter?.(currentHandleRow.value.row[item.field]) ||
        currentHandleRow.value.row[item.field],
    };
  });
});

// 表单禁用和按钮禁用(1、签收和发放页面直接禁用 2、编辑页面根据状态禁用，只有待指示状态可以编辑)
const disabledControls = computed(
  () =>
    detailConfig.value?.type === 'view' ||
    ![0, '0'].includes(currentHandleRow.value.row.preStatus),
);
const summarizeRef = ref();
const totalAmount = ref(0); // 处方总金额
const calculateSummarize = () => {
  const totalArr = [
    // {
    //   label: '勾选金额',
    //   value: selectedAmount.value,
    // },
    {
      label: '处方总金额',
      value: totalAmount.value,
    },
  ];
  summarizeRef.value.refreshNumber(totalArr);
};

const [ChcGrid, chcGridApi] = useSpdGrid(
  {
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
      pagerConfig: {
        enabled: false,
      },
    }),
  },
  {
    id: 'extensivePrescriptionDetailGrid',
    queryUrl: '/prescriptionAction/queryLine',
    gridColumns: [
      {
        type: 'radio',
        width: '50',
        align: 'center',
        title: '单选',
        visible: false,
      },
      {
        title: '序号',
        // type: 'seq',
        width: 50,
        align: 'center',
        field: 'index',
        formatter(scope: any) {
          return scope.rowIndex + 1;
        },
      },
      // {
      //   field: 'deliveryNo',
      //   title: '配送单号',
      //   minWidth: '150',
      //   sortable: true,
      //   visible: ['send', 'sign'].includes(detailConfig.value?.pageType), // 签收和发放页面显示该字段
      // },
      {
        field: 'productName',
        title: '药品名称',
        minWidth: '200',
        sortable: true,
      },
      {
        field: 'productCode',
        title: '药品编码',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        minWidth: '130',
        sortable: true,
      },
      {
        field: 'price',
        title: '价格',
        minWidth: '90',
        sortable: true,
        align: 'right',
      },
      {
        field: 'qty',
        title: '数量',
        width: '70',
        sortable: true,
        align: 'right',
      },
      {
        field: 'uomName',
        title: '单位',
        minWidth: '70',
        sortable: true,
      },
      {
        field: 'lineAmt',
        title: '小计',
        minWidth: '70',
        sortable: true,
        align: 'right',
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.lineAmt);
        },
      },
      {
        field: 'usageDescCodeName',
        title: '用法',
        width: '100',
        sortable: true,
      },
      {
        field: 'medDays',
        title: '用药天数',
        width: '70',
        sortable: true,
      },
    ],
    // 表单配置
    formSchema: [],
    gridEvents: {},
    tableSearchExtraParams: {},
    showCustomBtn: false,
    showZoomBtn: false,
    beforeFetchFn: (params: any) => {
      return {
        ...params,
        prescriptionId: currentHandleRow.value.row.prescriptionId, // 处方主记录ID
      };
    },
    afterFetchFn: (params: any) => {
      // 计算处方总金额(保留两位小数)
      // totalAmount.value = handlePriceToFixedTwo(
      //   params.rows.reduce((acc, cur) => acc + cur.subtotal, 0),
      // );
      let totalAmt = 0;
      params.rows.forEach((row: any) => {
        if (row.qty && row.price) {
          totalAmt += Number.parseFloat(String(row.qty * row.price));
        }
      });
      totalAmount.value = Number(totalAmt.toFixed(2));
      setTimeout(() => {
        calculateSummarize();
      }, 200);
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

// 表单
const [BaseForm, formApi] = useVbenForm({
  commonConfig: {
    // 所有表单项
    // disabled: detailConfig.value?.type === 'view',
    colon: true,
    componentProps: {
      class: 'w-full',
    },
    labelClass: 'w-[fit-content]',
  },
  layout: 'horizontal',
  actionWrapperClass: 'formActionAreaStyle',
  // 控制表单是否显示折叠按钮
  showCollapseButton: false,
  submitButtonOptions: {
    show: false,
    content: '保存配送信息',
  },
  resetButtonOptions: {
    show: false,
  },
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
  wrapperClass: 'grid-cols-5',
  schema: [
    {
      component: 'RadioGroup',
      label: '配送方式',
      fieldName: 'deliveryWay',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      componentProps: () => {
        return {
          options: [
            {
              label: '配送到院',
              value: '0',
            },
            {
              label: '配送到家',
              value: '1',
            },
          ],
          // onChange(e: any) {},
          disabled: disabledControls.value,
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'receiverName',
      label: '收货人',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px] col-start-1',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      componentProps: () => {
        return {
          placeholder: '',
          disabled: disabledControls.value,
        };
      },
      dependencies: {
        triggerFields: ['deliveryWay'],
        // 只有当配送方式 为 配送到家的时 才会显示详细地址
        show: (values) => {
          // console.log('values===>', values);
          return values.deliveryWay === '1';
        },
      },
    },
    {
      component: 'Input',
      fieldName: 'receiverPhoneNumber',
      label: '联系电话',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      componentProps: () => {
        return {
          placeholder: '',
          disabled: disabledControls.value,
        };
      },
      dependencies: {
        triggerFields: ['deliveryWay'],
        // 只有当配送方式 为 配送到家的时 才会显示详细地址
        show: (values) => {
          // console.log('values===>', values);
          return values.deliveryWay === '1';
        },
      },
    },
    {
      component: 'Input', // 占位(使用插槽)
      fieldName: 'region',
      label: '收货地址',
      formItemClass: 'col-span-1 col-start-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      componentProps: () => {
        return {
          placeholder: '',
          disabled: disabledControls.value,
        };
      },
      dependencies: {
        triggerFields: ['deliveryWay'],
        // 只有当配送方式 为 配送到家的时 才会显示详细地址
        show: (values) => {
          // console.log('values===>', values);
          return values.deliveryWay === '1';
        },
      },
    },
    {
      component: 'Textarea',
      fieldName: 'receiverAddress',
      label: '详细地址',
      hideLabel: false,
      // hidden col-start-1
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      componentProps: () => {
        return {
          placeholder: '',
          disabled: disabledControls.value,
          // showCount: true,
          // maxlength: 30,
        };
      },
      dependencies: {
        triggerFields: ['deliveryWay'],
        // 只有当配送方式 为 配送到家的时 才会显示详细地址
        show: (values) => {
          // console.log('values===>', values);
          return values.deliveryWay === '1';
        },
      },
    },
  ],
});

const reginLoading = ref<boolean>(false);
const regionValue = ref<string[]>([]);
const regionOptions = ref<CascaderProps['options']>([]);

// 初始化省份数据
const initProvinceData = async () => {
  try {
    reginLoading.value = true;
    const res = await queryProvince();
    if (res && Array.isArray(res.data)) {
      regionOptions.value = res.data.map((item: QueryAreaItem) => ({
        label: item.name,
        value: item.code,
        isLeaf: false, // 标记为叶子节点，可继续加载
      }));
    }
  } catch (error) {
    console.error('initProvinceData error', error);
  } finally {
    reginLoading.value = false;
  }
};

// 动态加载城市和区县数据
const loadRegionData: CascaderProps['loadData'] = async (selectedOptions) => {
  console.warn('selectedOptions', selectedOptions);
  const targetOption = selectedOptions[selectedOptions.length - 1];
  // 确保 targetOption 存在
  if (!targetOption) {
    console.error('targetOption is undefined');
    return;
  }
  console.warn('targetOption', targetOption);
  try {
    targetOption.loading = true;
    // 加载城市数据
    if (selectedOptions.length === 1) {
      const provinceCode = targetOption?.value as string;
      const res = await queryCity({ provinceCode });
      if (res && Array.isArray(res.data)) {
        targetOption.children = res.data.map((city: QueryAreaItem) => ({
          label: city.name,
          value: city.code,
          isLeaf: false, // 还有区县需要懒加载
        }));
      }
    } else if (selectedOptions.length === 2) {
      const cityCode = targetOption?.value as string;
      const res = await queryDistrict({ cityCode });
      if (res && Array.isArray(res.data)) {
        targetOption.children = res.data.map((district: QueryAreaItem) => ({
          label: district.name,
          value: district.code,
          isLeaf: true, // 没有子节点了
        }));
      }
    }
  } catch (error) {
    console.error('loadRegionData error', error);
  } finally {
    targetOption.loading = false;
  }
};

// 设置省市区回显
const setRegionValue = async (
  provinceCode?: string,
  cityCode?: string,
  areaCode?: string,
) => {
  // regionValue.value = region.split('/');
  if (!provinceCode) return;
  try {
    // 确保省份数据已经加载完成
    if (!regionOptions.value || regionOptions.value.length === 0) {
      await initProvinceData();
    }
    // 查找省份数据
    const province = regionOptions.value?.find(
      (item: any) => item.value === provinceCode,
    );
    if (!province) return;
    const regionValueTemp: string[] = [province.value as string];
    // 如果存在城市, 加载城市数据并查找
    if (cityCode) {
      const cityRes = await queryCity({ provinceCode });
      if (cityRes && Array.isArray(cityRes.data)) {
        province.children = cityRes.data.map((city: QueryAreaItem) => ({
          label: city.name,
          value: city.code,
          isLeaf: false, // 还有区县需要懒加载
        }));
        const city = province.children?.find(
          (item: any) => item.value === cityCode,
        );
        if (city) {
          regionValueTemp.push(city.value as string);
          // 如果有区县 加载区县数据并查找
          if (areaCode) {
            const districtRes = await queryDistrict({ cityCode });
            if (districtRes && Array.isArray(districtRes.data)) {
              city.children = districtRes.data.map(
                (district: QueryAreaItem) => ({
                  label: district.name,
                  value: district.code,
                  isLeaf: true, // 没有子节点了
                }),
              );
              const district = city.children?.find(
                (item: any) => item.value === areaCode,
              );
              if (district) {
                regionValueTemp.push(district.value as string);
              }
            }
          }
        }
      }
    }
    console.warn('regionValueTemp', regionValueTemp);
    // 设置回显值
    regionValue.value = regionValueTemp;
    // 刷新选项列表，触发回显更新
    regionOptions.value = [...(regionOptions.value ?? [])];
  } catch (error) {
    console.error('setRegionValue error', error);
  }
};

// 保存配送信息
const handleSave = async () => {
  const formValues = await formApi.getValues();
  const params = {
    ...formValues,
    prescriptionId: currentHandleRow.value.row.prescriptionId, // 处方ID
    provinceCode: regionValue.value[0] ?? '', // 省份编码
    cityCode: regionValue.value[1] ?? '', // 城市编码
    areaCode: regionValue.value[2] ?? '', // 区县编码
  };
  console.warn('handleSave formValues', {
    params,
    region: regionValue.value.join('/'),
  });
  const result = await saveDeliveryInfo(params);
  if (result && result.success) {
    message.success('配送信息保存成功');
    currentTab.value = 0;
    currentHandleRow.value?.callback?.();
  } else {
    message.error(result?.msg || '配送信息保存失败');
  }
};

onMounted(async () => {
  console.warn('currentHandleRow', currentHandleRow.value);
  console.warn('detailConfig', detailConfig.value);
  // 初始化省份数据
  await initProvinceData();
  // 查询表格数据
  chcGridApi.query();
  nextTick(() => {
    // 设置配送方式回显
    formApi.setFieldValue('deliveryWay', currentHandleRow.value.deliveryMode);
    formApi.setFieldValue(
      'receiverName',
      currentHandleRow.value.row.receiverName,
    );
    formApi.setFieldValue(
      'receiverPhoneNumber',
      currentHandleRow.value.row.receiverPhoneNumber,
    );
    formApi.setFieldValue(
      'receiverAddress',
      currentHandleRow.value.row.receiverAddress,
    );
    // 回显省市区数据
    const rowData = currentHandleRow.value.row;
    if (rowData.provinceCode) {
      setRegionValue(rowData.provinceCode, rowData.cityCode, rowData.areaCode);
    }
  });
});
</script>

<template>
  <Page content-class="p-[0.5rem]" class="h-full bg-white">
    <PageSplitLazy
      :distribute="0.2"
      :line-thickness="6"
      :is-vertical="false"
      background-color="#f1f3f6"
      hover-color="#c0c4cc"
      :has-line-tip="true"
    >
      <template #first>
        <div class="h-full w-full">
          <Descriptions title="处方明细" :column="4">
            <DescriptionsItem
              v-for="item in prescriptionInfo"
              :key="item.field"
              :label="item.label"
            >
              <!-- {{ item.formatter?.(item.value) || item.value }} -->
              {{ item.value }}
            </DescriptionsItem>
            <!-- <template #extra>
              <Button
                type="primary"
                @click="handleBack"
                data-testid="button_back_detailPage"
              >
                返回
                <AntdArrowLeftOutlined class="mb-[4px]" />
              </Button>
            </template> -->
          </Descriptions>
        </div>
      </template>
      <template #second>
        <PageSplitLazy
          :distribute="0.6"
          :line-thickness="6"
          :is-vertical="false"
          background-color="#f1f3f6"
          hover-color="#c0c4cc"
          :has-line-tip="true"
        >
          <template #first>
            <SectionContainer title="药品明细">
              <template #extra>
                <Summarize ref="summarizeRef" />
                <!-- <a
                  data-testid="button_add_drug"
                  href="javascript:void(0);"
                  class="text-primary ml-2"
                  >查看处方笺
                </a> -->
              </template>
              <ChcGrid />
            </SectionContainer>
          </template>
          <template #second>
            <SectionContainer title="配送方式">
              <template #extra>
                <Button
                  v-if="!disabledControls"
                  type="primary"
                  data-testid="button_save_editPage"
                  @click="handleSave"
                >
                  保存配送信息
                  <template #icon>
                    <UploadCloudIcon />
                  </template>
                </Button>
              </template>
              <BaseForm class="min-h-0 flex-1">
                <template #region>
                  <Cascader
                    v-model:value="regionValue"
                    :options="regionOptions"
                    placeholder="请选择地区"
                    class="w-[240px]"
                    :disabled="disabledControls"
                    :loading="reginLoading"
                    :load-data="loadRegionData"
                    change-on-select
                  />
                </template>
              </BaseForm>
            </SectionContainer>
          </template>
        </PageSplitLazy>
      </template>
    </PageSplitLazy>
  </Page>
</template>

<style scoped lang="less">
::v-deep(.ant-btn > svg) {
  margin-right: -2px;
  margin-bottom: 3px;
  margin-left: 2px;
}
</style>
