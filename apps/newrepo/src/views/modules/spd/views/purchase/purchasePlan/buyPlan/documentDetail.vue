<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table.js';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import type { SchemaColumnAndOptions } from '#/adapter/chc-ui';
import { useVbenModal } from '@vben/common-ui';
import { Button, message } from 'ant-design-vue';
import dayjs from 'dayjs';
import previewImageModal from '#/views/modules/spd/views/operation/qualificationCertificates/common/modals/previewImage.vue';
import { ChcSelect } from '@vben/chc-ui';
import { requestFormClient } from '#/api/request.js';
import { EditableTable } from '#/components/editableTable';
import { $t } from '#/locales';
import LazySearch from '#/utils/LazySearch';
import {
  handleAllPrice,
  handlePriceToFixedTwo,
  handlePrice,
} from '#/utils/util';

import {
  getOrderPlanStorage,
  queryOrderPlanLineInfo,
  saveDo,
  saveLine,
} from './api';

const route = useRoute();
const urlParams: any = route.meta?.urlParams || {}; // 路由中传递的参数
const currentTab = defineModel<number>('currentTab', { required: true }); // 当前所在tab
const currentHandleRow = defineModel<any>('currentHandleRow', {
  required: true,
}); // 当前正在处理的行数据
const detailConfig = defineModel<DetailInfo | undefined>('detailConfig'); // 详情页配置信息
const editableTableRef = ref<InstanceType<typeof EditableTable>>();
const wareHouseOption = ref<any>({});
const vendorParams = ref({
  productId: '',
  isNoProtocolPo: wareHouseOption.value.isNoProtocolPo,
  isBPartnerProductControl: wareHouseOption.value.isBPartnerProductControl,
  noProtocolPricePoSource: 'M', // 本字段写死为M
});
const applyBPartnerOptions = ref<any[]>([]); // 需求仓库选项列表
const lazySearchInstance = new LazySearch(2, () => {
  if (
    editableTableRef.value &&
    editableTableRef.value.chcSelectRef &&
    typeof editableTableRef.value.chcSelectRef.fetchApi === 'function'
  ) {
    editableTableRef.value.chcSelectRef.fetchApi();
  }
});

const [PreviewImageModal, previewImageModalApi] = useVbenModal({
  connectedComponent: previewImageModal,
});

const selectParams = ref<{ [key: string]: any }>({
  replenishSource: 'P',
  warehouseId: currentHandleRow.value.warehouseId || undefined,
  bpartnerId: currentHandleRow.value.applyBPartnerId || undefined,
});
/**
 * 表格列配置
 */
const gridColumns = ref<VxeGridProps['columns']>([
  { type: 'checkbox', title: '', width: 40, align: 'center' },
  {
    title: '序号',
    type: 'seq',
    width: 40,
    align: 'center',
    sortable: true,
  },
  {
    // TODO: medicine change 药品编码
    field: 'productCode',
    minWidth: 100,
    title: $t('purchasePlan.buyPlan.productCode'),
    align: 'center',
    sortable: true,
  },
  {
    // TODO: medicine change 药品名称
    field: 'productName',
    minWidth: 160,
    title: $t('purchasePlan.buyPlan.productName1'),
    sortable: true,
  },
  {
    field: 'productSpec',
    minWidth: 60,
    title: $t('purchasePlan.buyPlan.productSpec'),
    sortable: true,
  },
  // {
  //   field: 'modelNo',
  //   minWidth: 80,
  //   title: $t('purchasePlan.buyPlan.modelNo'),
  //   sortable: true,
  // },
  {
    field: 'uomName',
    minWidth: 60,
    title: $t('purchasePlan.buyPlan.uomName'),
    sortable: true,
  },
  {
    // TODO: medicine add 最小单位
    field: 'minUomName',
    minWidth: 90,
    title: $t('purchasePlan.buyPlan.minUomName'),
    sortable: true,
  },
  {
    field: 'qtyPlaned',
    minWidth: 90,
    editRender: {
      name: 'ChcInputNumber',
      props: {
        min: 0,
        onChange(_: any, scope: any) {
          const currentRow = scope.row;
          if (currentRow.isGift === 'Y') {
            currentRow.lineAmt = 0;
          } else {
            currentRow.lineAmt = handleAllPrice(
              currentRow.price,
              currentRow.qtyPlaned,
            );
          }
        },
      },
    },
    title: $t('purchasePlan.buyPlan.qtyPlaned'),
    sortable: true,
    align: 'right',
  },

  {
    field: 'price',
    minWidth: 90,
    title: $t('purchasePlan.buyPlan.price'),
    formatter({ row }: any) {
      return handlePriceToFixedTwo(row.price);
    },
    editRender: {
      name: 'ChcInputNumber',
      props: {
        min: 0,
        onChange(_: any, scope: any) {
          const currentRow = scope.row;
          if (currentRow.isGift === 'Y') {
            currentRow.lineAmt = 0;
          } else {
            currentRow.lineAmt = handleAllPrice(
              currentRow.price,
              currentRow.qtyPlaned,
            );
          }
        },
      },
    },
    sortable: true,
    align: 'right',
  },
  {
    field: 'lineAmt',
    minWidth: 80,
    title: $t('purchasePlan.buyPlan.lineAmt'),
    sortable: true,
    formatter({ row }: any) {
      return handlePriceToFixedTwo(row.lineAmt);
    },
    align: 'right',
  },
  {
    field: 'vendorId',
    minWidth: 180,
    title: $t('purchasePlan.buyPlan.vendorId'),
    sortable: true,
    formatter: ({ row }: any) => {
      return row.vendorName;
    },
    editRender: {
      name: 'ChcSelect',
      props: {
        // 现场需求（序号95）可选院内所有活跃的供应商
        dictUrl: '/orderPlanAction/productVendor.do',
        extraParams: vendorParams.value,
        onChange(val: any, option: any, scope: any) {
          scope.row.vendorId = val;
          scope.row.vendorName = option.label;
        },
        getPopupContainer: () =>
          document.querySelector('.buyPlanEditable .vxe-table--main-wrapper'),
        labelField: 'name',
        valueField: 'id',
        afterFetch(data: any) {
          return data.rows;
        },
      },
    },
  },
  {
    field: 'isGift',
    minWidth: 90,
    title: `是否${$t('purchasePlan.buyPlan.isGift')}`,
    sortable: true,
    editRender: {
      name: 'ChcSelect',
      props: {
        getPopupContainer: () =>
          document.querySelector('.buyPlanEditable .vxe-table--main-wrapper'),
        options: [
          { label: '是', value: 'Y' },
          { label: '否', value: 'N' },
        ],
        class: 'driver_isGift',
        onChange(val: any, _: any, scope: any) {
          scope.row.isGift = val;
          const currentRow = scope.row;
          if (currentRow && currentRow.isGift === 'Y') {
            currentRow.lineAmt = 0;
          } else {
            currentRow.price =
              currentRow.price || currentRow.pricePo || currentRow.pricePO;
            const priceObj = handlePrice(currentRow.price);
            currentRow.lineAmt =
              priceObj.numberCountAfterDot > 0
                ? (priceObj.val *
                    10 ** priceObj.numberCountAfterDot *
                    handlePrice(currentRow.qtyPlaned).val) /
                  10 ** priceObj.numberCountAfterDot
                : handlePrice(currentRow.qtyPlaned).val * priceObj.val;
          }
        },
        onVisibleChange(e: any) {
          console.warn('onVisibleChange:', e);
        },
      },
    },
    formatter: ({ row }: any) => {
      return row.isGift === 'Y' ? '是' : '否';
    },
  },
  {
    field: 'isShortPo',
    minWidth: 100,
    title: `是否临采`,
    sortable: true,
    formatter: ({ row }: any) => {
      return row.isShortPo === 'Y' ? '是' : '否';
    },
  },
  {
    field: 'manufacturer',
    minWidth: 120,
    title: $t('purchasePlan.buyPlan.manufacturer'),
    sortable: true,
  },
  {
    field: 'qtyMoveing',
    title: '采购在途数量',
    minWidth: 110,
    align: 'right',
    sortable: true,
  },
  {
    field: 'lPackageQty',
    title: $t('purchasePlan.buyPlan.lPackageQty'),
    minWidth: 90,
    align: 'right',
    sortable: true,
  },
  {
    field: 'mPackageQty',
    title: $t('purchasePlan.buyPlan.mPackageQty'),
    minWidth: 90,
    align: 'right',
    sortable: true,
  },
  {
    field: 'qtyOnHand',
    minWidth: 140,
    title: $t('purchasePlan.buyPlan.qtyOnHand'),
    align: 'right',
    sortable: true,
  },
  {
    field: 'qtyOnHandAllWarehouse',
    title: '全院库存数量',
    minWidth: 110,
    align: 'right',
    sortable: true,
  },
  {
    field: 'allWarehouseLevelDay',
    title: $t('purchasePlan.buyPlan.level_Day'),
    minWidth: 110,
    sortable: true,
    align: 'right',
  },
  {
    field: 'supportDays',
    title: '维持天数',
    minWidth: 110,
    align: 'right',
    sortable: true,
  },
  {
    field: 'level_Max',
    title: $t('purchasePlan.buyPlan.level_Max'),
    minWidth: 130,
    sortable: true,
    align: 'right',
  },
  {
    field: 'level_Min',
    title: $t('purchasePlan.buyPlan.level_Min'),
    minWidth: 130,
    sortable: true,
    align: 'right',
  },
  {
    field: 'kf_Day',
    title: $t('purchasePlan.buyPlan.kf_Day'),
    minWidth: 140,
    sortable: true,
    align: 'right',
  },
  {
    field: 'kf_Max',
    title: $t('purchasePlan.buyPlan.kf_Max'),
    minWidth: 140,
    sortable: true,
    align: 'right',
  },
  {
    field: 'kf_Min',
    title: $t('purchasePlan.buyPlan.kf_Min'),
    minWidth: 140,
    sortable: true,
    align: 'right',
  },
  {
    field: 'priceList',
    title: $t('purchasePlan.buyPlan.priceList'),
    minWidth: 85,
    sortable: true,
    formatter({ row }: any) {
      return handlePriceToFixedTwo(row.priceList);
    },
    align: 'right',
  },
  {
    field: 'viewPic',
    minWidth: 90,
    sortable: true,
    title: '证照',
    align: 'center',
    slots: {
      default: ({ row }: any) => {
        return h(
          Button,
          {
            type: 'primary',
            // size: 'small',
            'data-testid': 'viewPicBtn',
            onClick: () => {
              requestFormClient
                .post('/companyAction/queryCert.do', {
                  isVendor: 'Y',
                  vendorId: row.vendorId,
                  bpartnerId: row.vendorId,
                  certName: '营业执照',
                })
                .then((res) => {
                  console.warn('营业执照数据:', res);
                  previewImageModalApi
                    .setData({
                      imageList: res.rows?.[0]?.filePaths || [],
                      callback() {},
                    })
                    .open();
                });
            },
          },
          () => '查看',
        );
      },
    },
  },
  {
    // TODO: medicine change 医保药品编码
    field: 'insurance',
    minWidth: 140,
    title: $t('purchasePlan.buyPlan.ybhcCode'),
    sortable: true,
  },
  {
    align: 'center',
    field: 'action',
    slots: { default: 'action' },
    fixed: 'right',
    headerAlign: 'center',
    showOverflow: false,
    title: '操作',
    width: detailConfig.value?.type === 'view' ? 90 : 85,
  },
]);
/**
 * 表格表单配置
 */
const formSchema: VbenFormProps['schema'] = [
  {
    component: 'Input',
    fieldName: 'orderPlanNo',
    componentProps: () => {
      return {
        disabled: true,
      };
    },
    defaultValue: currentHandleRow.value?.orderPlanNo || undefined,
    label: $t('purchasePlan.buyPlan.orderNo'),
    formItemClass: 'pb-2',
  },
  {
    component: 'DatePicker',
    fieldName: 'deliveryPlanDate',
    label: $t('purchasePlan.buyPlan.deliveryPlanDate'),
    componentProps: () => {
      return {
        showTime: true,
        format: 'YYYY-MM-DD HH:mm',
        valueFormat: 'YYYY-MM-DD HH:mm',
        disabled: detailConfig.value?.type === 'view',
      };
    },
    defaultValue:
      detailConfig.value?.type === 'add'
        ? dayjs(dayjs().format('YYYY-MM-DD'))
            .add(1, 'day')
            .add(10, 'hour')
            .format('YYYY-MM-DD HH:mm')
        : currentHandleRow.value.deliveryPlanDate,
    formItemClass: 'pb-2',
  },
  {
    component: 'ChcSelect',
    componentProps: {
      autoChooseFirstOption: detailConfig.value?.type === 'add', // 只有新增场景，才会自动选择第一个
      dictUrl: '/baseHandleAction/warehouse.do?level1=Y&readWrite=Y',
      placeholder: `请选择${$t('purchasePlan.buyPlan.warehouseName')}`,
      onChange(val: any, option: any) {
        wareHouseOption.value = option;
        selectParams.value.warehouseId = val;
      },
      showSearch: true,
      paginate: false,
      disabled: !!currentHandleRow.value!.orderPlanId,
      immediate: true,
      labelField: 'name',
      valueField: 'id',
      allowClear: true,
      afterFetch(res: any) {
        if (currentHandleRow.value!.warehouseId) {
          wareHouseOption.value = res.rows.find(
            (item: any) => String(item.id) === String(currentHandleRow.value!.warehouseId),
          ) || {};
          console.warn(
            'wareHouseOption0777777777777777:',
            wareHouseOption.value,
          );
        }
        return { ...res, rows: undefined, records: res.rows };
      },
    },
    // defaultValue:
    //   detailConfig.value?.type === 'add'
    //     ? undefined
    //     : currentHandleRow.value.warehouseId,
    formItemClass: 'pb-2',
    fieldName: 'warehouseId',
    label: $t('purchasePlan.buyPlan.warehouseName'),
  },
  {
    component: 'ChcSelect',
    componentProps: {
      dictUrl: '/baseHandleAction/bpartner.do?type=4&readWrite=Y',
      placeholder: `请选择${$t('purchasePlan.buyPlan.applyBPartnerName')}`,
      onChange(val: any) {
        selectParams.value.bpartnerId = val;
      },
      triggerFields: ['warehouseId'],
      showSearch: true,
      paginate: false,
      immediate: false,
      labelField: 'name',
      valueField: 'id',
      allowClear: false,
      disabled:
        detailConfig.value?.type === 'edit' ||
        detailConfig.value?.type === 'view' ||
        !!currentHandleRow.value!.orderPlanId,
      afterFetch(res: any) {
        // console.log("需求仓库查询:",res)
        return { ...res, rows: undefined, records: res.rows };
      },
    },
    dependencies: {
      triggerFields: ['warehouseId'],
      async trigger(values) {
        // console.log("触发trigger");
        const applyBPartnerIdRef =
          editableTableRef.value?.formApi.getFieldComponentRef<
            InstanceType<typeof ChcSelect>
          >('applyBPartnerId');
        if (applyBPartnerIdRef) {
          if (detailConfig.value!.type === 'add') {
            // 新增时，支持自由编辑
            if (values.warehouseId) {
              applyBPartnerIdRef.params.dependencies = {
                warehouseId: values.warehouseId,
              };
              // 根据option对应的需求仓库信息，设置需求仓库值
              const applyBPartnerOptions = await applyBPartnerIdRef.fetchApi();
              if (wareHouseOption.value.id) {
                const matched = applyBPartnerOptions.find(
                  (item: any) =>
                    Number(item.warehouseId) ===
                    Number(wareHouseOption.value.id),
                );
                if (matched) {
                  applyBPartnerIdRef.setModelValue(matched.id);
                }
              }
            } else {
              // applyBPartnerIdRef.params.dependencies = {
              //   warehouseId: values.warehouseId,
              // };
              // await applyBPartnerIdRef.fetchApi();
              editableTableRef.value?.formApi.setFieldValue(
                'applyBPartnerId',
                undefined,
              );
            }
          } else {
            applyBPartnerIdRef.params.dependencies = {
              warehouseId: values.warehouseId,
            };
            await applyBPartnerIdRef.fetchApi();
            // 编辑查看时回显 只在初始化时会运行一次
            editableTableRef.value?.formApi.setFieldValue(
              'applyBPartnerId',
              Number(currentHandleRow.value.applyBPartnerId),
            );
          }
        }
      },
    },
    // defaultValue:
    //   detailConfig.value?.type === 'add'
    //     ? undefined
    //     : currentHandleRow.value.applyBPartnerId,
    formItemClass: 'pb-2',
    fieldName: 'applyBPartnerId',
    label: $t('purchasePlan.buyPlan.applyBPartnerName'),
  },
  {
    component: 'ChcSelect',
    componentProps: () => {
      return {
        dictUrl: '/baseHandleAction/refList.do?id=154',
        apiType: 'post',
        requestContentType: 'application/x-www-form-urlencoded',
        showSearch: true,
        placeholder: `请选择${$t('purchasePlan.buyPlan.priorityRuleName')}`,
        paginate: false,
        filterByFrontEnd: true,
        immediate: true,
        labelField: 'name',
        valueField: 'id',
        disabled: detailConfig.value?.type === 'view',
        afterFetch(res: any) {
          return { ...res, rows: undefined, records: res.rows };
        },
      };
    },
    formItemClass: 'pb-2',
    fieldName: 'priorityRule',
    defaultValue:
      detailConfig.value?.type === 'add'
        ? '5'
        : currentHandleRow.value.priorityRule,
    label: $t('purchasePlan.buyPlan.priorityRuleName'),
  },
  {
    component: 'ChcSelect',
    componentProps: () => {
      return {
        dictUrl: '/baseHandleAction/vendor.do',
        apiType: 'post',
        requestContentType: 'application/x-www-form-urlencoded',
        showSearch: true,
        placeholder: `请选择供应商`,
        paginate: false,
        filterByFrontEnd: true,
        showChooseAll: '',
        immediate: true,
        labelField: 'name',
        valueField: 'id',
        onChange(val: any) {
          // 供应商变化时，更新药品下拉的额外参数
          selectParams.value.vendor = val;
        },
        disabled: detailConfig.value?.type === 'view',
        afterFetch(res: any) {
          return { ...res, rows: undefined, records: res.rows };
        },
      };
    },
    fieldName: 'vendor',
    label: '供应商',
    formItemClass: 'pb-2 col-span-1',
  },
  {
    component: 'Input',
    fieldName: 'description',
    componentProps: {
      disabled: detailConfig.value?.type === 'view',
    },
    label: $t('purchasePlan.buyPlan.description'),
    defaultValue:
      detailConfig.value?.type === 'add'
        ? undefined
        : currentHandleRow.value.description,
    formItemClass: 'pb-2 col-span-1',
  },
];
/**
 * 表格行进入编辑时的回调
 * 行存在chc-select时，更新下拉查询对象的productId
 * 用于每一行根据当前行的数据查询下拉列表
 */
const handleEditActivated = (scope: any) => {
  // 行进入编辑时，更新下拉查询对象
  vendorParams.value.productId = scope.row.productId;
  // 修复供应商下拉参数未同步仓库配置的问题
  //  同步 wareHouseOption 中的协议外采购和供应商管控标识到 vendorParams
  vendorParams.value.isNoProtocolPo = wareHouseOption.value.isNoProtocolPo;
  vendorParams.value.isBPartnerProductControl =
    wareHouseOption.value.isBPartnerProductControl;
};
/**
 * 初始化表格数据
 */
onMounted(() => {
  if (currentHandleRow.value.orderPlanId) {
    editableTableRef.value!.showLoading = true;
    queryOrderPlanLineInfo({
      orderPlanId: currentHandleRow.value.orderPlanId,
      isActive: 'Y',
    }).then(async (res) => {
      if (res.success) {
        editableTableRef.value?.initRows(res.rows);
        editableTableRef.value!.showLoading = false;
      } else {
        message.error(res.msg);
      }
    });
  }
  editableTableRef.value?.formApi.setFieldValue(
    'warehouseId',
    currentHandleRow.value.warehouseId,
  );
});
const validateIfCanAddRow = () => {
  return new Promise<boolean>((resolve) => {
    // 验证必填字段
    editableTableRef.value?.formApi.getValues().then((temFormData) => {
      const formValues: { [key: string]: any } = {
        applyBPartnerId:
          temFormData.applyBPartnerId || currentHandleRow.value.applyBPartnerId,
        warehouseId:
          temFormData.warehouseId || currentHandleRow.value.warehouseId,
      };
      // console.warn('验证必填字段:', formValues);
      const requiredFields = [
        {
          field: 'applyBPartnerId',
          label: $t('purchasePlan.buyPlan.applyBPartnerName'),
        },
        {
          field: 'warehouseId',
          label: $t('purchasePlan.buyPlan.warehouseName'),
        },
      ];
      let errorMsg: string = '';
      for (const { field, label } of requiredFields) {
        if (!formValues[field]) {
          errorMsg = label;
          break;
        }
      }
      if (errorMsg) {
        message.warning(`请先选择${errorMsg}`);
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};
/**
 * 根据用户选择的项获取新增行数据
 */
const getAddRowData = (option: any, formValue: any) => {
  return new Promise((resolve) => {
    getOrderPlanStorage({
      warehouseId: formValue.warehouseId,
      productId: option.productId,
    }).then((response) => {
      resolve({
        ...option,
        ...response,
        isGift: 'N',
        qtyPlaned: 0,
      });
    });
  });
};
function rowDataValidate(row: any) {
  return new Promise<boolean>((resolve, reject) => {
    if (
      wareHouseOption.value.isLPackageQtyPO === 'Y' &&
      row.lPackageQty > 0 &&
      row.qtyPlaned % row.lPackageQty > 0
    ) {
      message.error('采购数量不是大包装的倍数!');
      reject(new Error('采购数量不是大包装的倍数!'));
    } else if (row.qtyPlaned <= 0) {
      message.error('采购数量必须大于零!');
      reject(new Error('采购数量必须大于零!'));
    } else if (row.vendorId) {
      resolve(true);
    } else {
      message.error('请选择供应商！!');
      reject(new Error('请选择供应商！!'));
    }
  });
}
/**
 * 构建查询参数
 */
const queryparams = (
  type: 'saveDo' | 'saveLine',
  formValues: any,
  rows: any[],
) => {
  let lineData = null;
  rows.forEach((item) => {
    Object.keys(item).forEach((key) => {
      if (item[key] === undefined || item[key] === null) {
        delete item[key];
      }
    });
  });
  lineData =
    type === 'saveDo'
      ? JSON.stringify({ created: [], updated: [], removed: [...rows] })
      : JSON.stringify(rows[0]);
  return {
    orderPlanId: currentHandleRow.value.orderPlanId || 0,
    warehouseId: formValues.warehouseId,
    priorityRule: formValues.priorityRule,
    deliveryPlanDate: formValues.deliveryPlanDate,
    applyBPartnerId: formValues.applyBPartnerId,
    description: formValues.description,
    isCrossDocking: urlParams.isCrossDocking,
    isPackaged: urlParams.isPackaged,
    receiptType: urlParams.receiptType,
    isShortPo: urlParams.isShortPo,
    type: urlParams.type,
    lineData,
  };
};

/**
 * 保存行数据,单行保存
 */
const saveRow = (row: any) => {
  return new Promise((resolve, reject) => {
    editableTableRef.value?.formApi
      .getValues()
      .then((res: any) => {
        const params = queryparams('saveLine', res, [row]);
        saveLine(params)
          .then((res) => {
            // 如果原先的 currentHandleRow.value.orderPlanId 没值，说明是新增进来的
            // 此时需要更新 currentHandleRow.value.orderPlanId
            if (!currentHandleRow.value.orderPlanId) {
              currentHandleRow.value = { orderPlanId: res.id };
              editableTableRef.value?.formApi.setFieldValue(
                'orderPlanNo',
                res.orderPlanNo,
              );
            }
            queryOrderPlanLineInfo({ orderPlanId: res.id, isActive: 'Y' })
              .then((resIn) => {
                const newRow = resIn.rows.find(
                  (item: any) => item.orderPlanLineId === res.lineId,
                );
                resolve(newRow);
              })
              .catch((error) => {
                row.loading = false;
                reject(error);
              });
          })
          .catch((error) => {
            row.loading = false;
            reject(error);
          });
      })
      .catch((error: any) => {
        row.loading = false;
        reject(error);
      });
  });
};
/**
 * 删除行数据，支持多行删除
 */
const deleteRows = (rows: any[]) => {
  return new Promise((resolve) => {
    editableTableRef.value?.formApi.getValues().then((res: any) => {
      const params = queryparams('saveDo', res, rows);
      saveDo(params).then((res) => {
        resolve(res);
      });
    });
  });
};
/**
 * 表格额外的配置项
 */
const gridOptions: VxeGridProps = {
  toolbarConfig: {
    zoom: true,
    custom: true,
  },
  rowStyle: ({ row }: any) => {
    if (row.isShortPo === 'Y') {
      return { color: 'red' };
    }
    return {};
  },
  cellStyle: (scope: any) => {
    const finalStyle: { [key: string]: number | string } = {
      color: '',
      backgroundColor: '',
    };
    if (
      editableTableRef.value?.editFieldArr?.includes(scope.column.field) &&
      detailConfig.value?.type !== 'view'
    ) {
      finalStyle.backgroundColor = '#D7FFF5';
      // Object.defineProperty(finalStyle, 'backgroundColor', '#D7FFF5');
    }
    if (
      scope.column.field === 'price' &&
      scope.row.price !== scope.row.priceList
    ) {
      finalStyle.color = 'red';
      // Object.defineProperty(finalStyle, 'color', 'red');
    }
    return finalStyle;
  },
};

/**
 * 整体保存接口调用
 */
const totalSave = () => {
  return new Promise((resolve, reject) => {
    editableTableRef.value?.formApi.getValues().then((res: any) => {
      const params = queryparams('saveDo', res, []);
      saveDo(params)
        .then(() => {
          currentTab.value = 0;
          resolve(true);
        })
        .catch((error) => {
          console.error(error.msg);
          reject(error);
        });
    });
  });
};
/**
 * 整体提交接口调用
 */
const totalSubmit = () => {
  return new Promise((resolve, reject) => {
    editableTableRef.value?.formApi.getValues().then((res: any) => {
      const params = queryparams('saveDo', res, []);
      saveDo({ ...params, doCommit: 'Y' })
        .then(() => {
          currentTab.value = 1;
          resolve(true);
        })
        .catch((error) => {
          console.error(error.msg);
          reject(error);
        });
    });
  });
};
const batchAddModalGridOptions: SchemaColumnAndOptions = {
  gridColumns: [
    { type: 'checkbox', title: '', width: 50, align: 'center' },
    {
      field: 'productCode',
      minWidth: 110,
      sortable: true,
      title: '药品编码',
    },
    {
      field: 'productName',
      minWidth: 135,
      sortable: true,
      title: '药品名称',
    },
    {
      field: 'productSpec',
      minWidth: 80,
      sortable: true,
      title: '规格',
    },
    {
      field: 'manufacturer',
      minWidth: 120,
      sortable: true,
      title: '厂家',
    },
    {
      field: 'uomName',
      minWidth: 60,
      sortable: true,
      title: '单位',
    },
    {
      field: 'price',
      minWidth: 100,
      sortable: true,
      align: 'right',
      title: '采购价',
    },
    {
      field: 'vendorName',
      minWidth: 180,
      sortable: true,
      title: '供应商',
    },
    {
      field: 'storageQty',
      minWidth: 70,
      sortable: true,
      align: 'right',
      title: '库存',
    },
  ],
  dataTableId: '/productAction/query.do',
};
const batchAddModalFormOptions: VbenFormProps = {
  schema: [
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Input',
      // 对应组件的参数
      componentProps: {
        placeholder: '编码、名称、拼首码、规格',
        allowClear: true,
      },
      fieldName: 'productCode',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '生产厂家',
        allowClear: true,
      },
      fieldName: 'manufacturer',
    },
    {
      component: 'ChcSelect',
      componentProps: {
        placeholder: '供应商',
        allowClear: true,
        dictUrl: '/baseHandleAction/vendor.do',
        apiType: 'post',
        requestContentType: 'application/x-www-form-urlencoded',
        showSearch: true,
        paginate: false,
        filterByFrontEnd: true,
        labelField: 'name',
        valueField: 'id',
        immediate: true,
        afterFetch: (res: any) => {
          return { ...res, rows: undefined, records: res.rows };
        },
      },
      fieldName: 'vendor',
    },
  ],
};
const queryActionLogParams = (row: any) => {
  return {
    AD_Table_ID: 1_000_359,
    Record_ID: row.orderPlanLineId,
  };
};
const handleBlackListChange = (blackList: string[]) => {
  editableTableRef.value?.formApi.updateSchema([
    {
      fieldName: 'warehouseId',
      componentProps: {
        disabled: !!currentHandleRow.value!.orderPlanId || blackList.length > 0,
      },
    },
    {
      fieldName: 'applyBPartnerId',
      componentProps: {
        disabled:
          detailConfig.value?.type === 'edit' ||
          detailConfig.value?.type === 'view' ||
          !!currentHandleRow.value!.orderPlanId ||
          blackList.length > 0,
      },
    },
  ]);
};
</script>
<template>
  <div class="h-full">
    <PreviewImageModal />
    <EditableTable
      class="buyPlanEditable"
      ref="editableTableRef"
      id="buyPlanEditableTable"
      :row-data-validate="rowDataValidate"
      :grid-columns="gridColumns"
      :grid-options="gridOptions"
      :view-type="detailConfig?.type"
      :form-schema="formSchema"
      @edit-activated="handleEditActivated"
      :single-select-props="{
        extraParams: selectParams,
        filterField: 'productCode',
        queryModelValueField: 'model',
        refreshOptionsWhenOpenDropdown: true,
        optionColumns: [
          { header: '药品编码', name: 'productCode', width: 80 },
          { header: '药品名称', name: 'productName', width: 240 },
          { header: '规格', name: 'productSpec', width: 180 },
          { header: '厂家', name: 'manufacturer', width: 100 },
          { header: '单位', name: 'uomName', width: 80 },
          { header: '采购价', name: 'price', width: 80 },
          { header: '库存', name: 'storageQty', width: 80 },
        ],
      }"
      :validateIfCanAddRow="validateIfCanAddRow"
      :get-final-add-row-data="getAddRowData"
      :save-row="saveRow"
      :delete-rows="deleteRows"
      :totalSave="totalSave"
      :totalSubmit="totalSubmit"
      :batchAddModalGridOptions="batchAddModalGridOptions"
      :batchAddModalFormOptions="batchAddModalFormOptions"
      :queryActionLogParams="queryActionLogParams"
      @blackListChange="handleBlackListChange"
    >
    </EditableTable>
  </div>
</template>
<style scoped></style>
