<script lang="ts" setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';

import { useAccess } from '@vben/access'; // 权限相关的hook
import { SearchActionIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { useUserStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, Input, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import { createPick, createPurchase } from './api';

const { hasAccessByCodes } = useAccess(); // 用于添加权限判断

const userStore: any = useUserStore();
// console.log(userStore.userInfo, 'userStore.userInfo');

const route = useRoute();
const urlParamsObj: any = route.meta?.urlParams;
// console.log(urlParamsObj, 'urlParamsObj');

const urlParams: any = {
  specShowType: urlParamsObj?.specShowType || '',
};

const parentTableParams = ref<{ [key: string]: any }>({
  applyPlanId: undefined,
  productName: undefined,
});

// 选择行
const selectRow = ref<any>({});
const CHILD_EDITABLE_FIELDS = new Set(['qtyPoProcess', 'qtyWoProcess']);
// 子表
const [RoleGrid, roleGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {}),
    gridOptions: deepMerge(gridDefaultOptions, {
      proxyConfig: {
        autoLoad: false,
      },
      pagerConfig: {
        enabled: true,
      },
      // keyboardConfig: {
      //   isEdit: true,
      // },
      // size: 'small',
      editConfig: {
        enabled: true,
        mode: 'row',
        trigger: 'dblclick',
        showStatus: false,
        showIcon: true,
        autoClear: true,
      },
      cellStyle: ({ column }: { column: any }) => {
        if (CHILD_EDITABLE_FIELDS.has(column.field)) {
          return {
            backgroundColor: '#D7FFF5',
          };
        }
        return {};
      },
      keepSource: true,
    }),
  },
  {
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      { field: 'productCode', title: '药品编码', width: '120', sortable: true },
      { field: 'productName', title: '药品名称', width: '200', sortable: true },

      { field: 'productSpec', title: '规格', width: '200', sortable: true },
      { field: 'manufacturer', title: '厂家', width: '150', sortable: true },
      { field: 'uomName', title: '单位', width: '72', sortable: true },
      {
        field: 'qtyApplied',
        title: '计划数量',
        width: '100',
        sortable: true,
        align: 'right',
      },
      {
        field: 'qtyWoProcess',
        title: '请领数量',
        width: '130',
        sortable: true,
        align: 'right',
        editRender: {
          name: 'VxeNumberInput',
          props: {
            type: 'integer',
            min: 0,
            onChange() {
              // const currentRow = chcGridApi.grid.getEditCell()!.row;
              // if (!currentRow) return null;
              // if (currentRow.isGift === 'Y') {
              //   currentRow.lineAmt = handlePrice(currentRow.qtyOrdered) * 0;
              //   currentRow.currentPriceAmt = 0;
              // } else {
              //   currentRow.currentPriceAmt = handlePrice(
              //     currentRow.currentPricePo || currentRow.pricePO,
              //   );
              //   currentRow.lineAmt =
              //     handlePrice(currentRow.qtyOrdered) *
              //     handlePrice(currentRow.price);
              // }
            },
          },
        },
      },
      {
        field: 'qtyOrdered',
        title: '已请领数量',
        width: '100',
        align: 'right',
      },
      {
        field: 'qtyLeft',
        title: '请领剩余数量',
        width: '120',
        align: 'right',
      },
      {
        field: 'qtyPoProcess',
        title: '采购数量',
        width: '130',
        sortable: true,
        align: 'right',
        editRender: {
          name: 'VxeNumberInput',
          props: {
            type: 'integer',
            min: 0,
            onChange() {
              // const currentRow = chcGridApi.grid.getEditCell()!.row;
              // if (!currentRow) return null;
              // if (currentRow.isGift === 'Y') {
              //   currentRow.lineAmt = handlePrice(currentRow.qtyOrdered) * 0;
              //   currentRow.currentPriceAmt = 0;
              // } else {
              //   currentRow.currentPriceAmt = handlePrice(
              //     currentRow.currentPricePo || currentRow.pricePO,
              //   );
              //   currentRow.lineAmt =
              //     handlePrice(currentRow.qtyOrdered) *
              //     handlePrice(currentRow.price);
              // }
            },
          },
        },
      },
      {
        field: 'qtyPOPlaned',
        title: '已采购数量',
        width: '100',
        sortable: true,
        align: 'right',
      },
      {
        field: 'qtyPOLeft',
        title: '采购剩余数量',
        width: '120',
        align: 'right',
      },
    ],
    id: 'applyplanProcessChildGrid',
    // tableSearchExtraParams: parentTableParams.value,
    queryUrl: `/applyPlanAction/queryLine.do?specShowType=${urlParams.specShowType}`,
    beforeFetchFn: (params) => {
      if (isEmpty(parentTableParams.value?.applyPlanId)) {
        return false;
      }
      return { ...params, ...parentTableParams.value };
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);
const departmentId = ref('');
// 父表
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      // fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      proxyConfig: {
        autoLoad: false,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      // sortConfig: {
      //   defaultSort: {
      //     field: 'priorityRuleName',
      //     order: 'desc',
      //   },
      // },
      pagerConfig: {
        enabled: true,
      },
    }),
    //  gridEvents: {
    //   checkBoxChange: ({ row }: { row: any }) => {
    //     if (!row.qtyApply) {
    //       message.warn('请输入申请数量');
    //       ChcGridApi.grid.clearCheckboxRow(row);
    //     }
    //   },
    // },
  },
  {
    id: 'applyplanProcessParentGrid',
    queryUrl: '/applyPlanAction/query.do?page=create',
    gridColumns: [
      {
        type: 'radio',
        width: 120,
        fixed: 'left',
        visible: false,
      },
      { title: '序号', type: 'seq', width: 50, align: 'center' },

      {
        field: 'applyPlanNo',
        minWidth: 120,
        sortable: true,
        title: '申请单号',
      },
      {
        field: 'dateApplied',
        minWidth: 160,
        sortable: true,
        title: '申请时间',
      },
      {
        field: 'applyPlanMonth',
        minWidth: 100,
        sortable: true,
        title: '计划月份',
      },
      {
        field: 'departmentName',
        minWidth: 150,
        sortable: true,
        title: '院区',
      },
      {
        field: 'warehouseName',
        minWidth: 150,
        sortable: true,
        title: '上级仓库',
      },
      {
        field: 'toWarehouseName',
        minWidth: 160,
        sortable: true,
        title: '申请仓库',
      },
      {
        field: 'productControlLevelName',
        minWidth: 120,
        sortable: true,
        title: '商品组',
        visible: userStore.userInfo.isProductControlLevel,
      },
      {
        field: 'createdByName',
        title: '创建人',
        width: '100',
        sortable: true,
      },
      {
        field: 'created',
        title: '创建时间',
        width: '160',
        sortable: true,
      },
      {
        field: 'approveUserName',
        title: '审核人',
        width: '110',
        sortable: true,
      },
      {
        field: 'approveTime',
        title: '审核时间',
        width: '160',
        sortable: true,
      },
      {
        field: 'description',
        minWidth: 150,
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
        title: $t('system.menu.operation'),
        width: 150,
        visible: false,
      },
    ],
    formSchema: [
      {
        component: 'DatePicker',
        fieldName: 'applyPlanDate',
        label: '计划月份',
        componentProps: () => {
          return {
            picker: 'month',
            format: 'YYYY-MM',
            valueFormat: 'YYYY-MM-DD',
          };
        },
        defaultValue: dayjs(dayjs().format('YYYY-MM-DD')).format('YYYY-MM-DD'),
        formItemClass: 'col-span-1',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y&level1=N',
            // showSearch: true,
            placeholder: '请选择申请仓库',
            paginate: false,
            allowClear: true,
            showChooseAll: '',
            // onChange(val: any, option: any) {
            //   extParams.value.bpartnerId_text = option.name;
            // },
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },

        // defaultValue: 1_000_007,
        fieldName: 'toWarehouseId',
        formItemClass: 'pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[1px] pl-[4px]',
        label: '申请仓库',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            placeholder: '请选择院区',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            allowClear: true,
            onChange(val: any, option: any) {
              console.warn('departmentId', val, option);
              departmentId.value = val;
            },
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              if (!departmentId.value) {
                ChcGridApi.formApi.getFieldComponentRef(
                  'warehouseId',
                ).params.dependencies = {
                  regionId: -1,
                  departmentId: -1,
                };
                ChcGridApi.formApi
                  ?.getFieldComponentRef('warehouseId')
                  ?.fetchApi();
              }
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        // defaultValue: '',
        fieldName: 'departmentId',
        label: '院区',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/warehouse.do?accessAll=Y&level1=Y',
            // showSearch: true,
            triggerFields: ['departmentId', 'regionId'],
            placeholder: '请选择上级仓库',
            allowClear: true,
            paginate: false,
            // showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['departmentId', 'regionId'],
          trigger(values: any) {
            if (
              ChcGridApi.formApi?.getFieldComponentRef &&
              typeof ChcGridApi.formApi?.getFieldComponentRef === 'function' &&
              ChcGridApi.formApi?.getFieldComponentRef('warehouseId')
            ) {
              ChcGridApi.formApi.getFieldComponentRef(
                'warehouseId',
              ).params.dependencies = {
                regionId: values.departmentId,
                departmentId: values.departmentId,
              };
              console.warn(
                ChcGridApi.formApi.getFieldComponentRef('warehouseId'),
                55,
              );
              ChcGridApi.formApi
                ?.getFieldComponentRef('warehouseId')
                ?.fetchApi();
              // ChcGridApi.formApi?.setFieldValue('warehouseId', undefined);
            }
          },
        },
        fieldName: 'warehouseId',
        label: '上级仓库',
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        componentProps: {
          placeholder: '请输入编码/拼音码/名称',
          maxLength: 50,
        },
      },
    ],
    gridEvents: {
      radioChange: ({ row }: { row: any }) => {
        if (row && row.applyPlanId) {
          parentTableParams.value.applyPlanId = row.applyPlanId;
          selectRow.value = row;
          roleGridApi.query({ applyPlanId: row.applyPlanId });
        } else {
          // 父表没数据，子表要清空
          parentTableParams.value.applyPlanId = undefined;
          roleGridApi.grid.remove();
          selectRow.value = {};
        }
      },
    },
    afterFetchFn: (params) => {
      roleGridApi.grid.reloadData([]);
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

// 查询
const handleSearch = () => {
  roleGridApi.query({
    applyPlanId: parentTableParams.value.applyPlanId,
    productName: parentTableParams.value.productName,
  });
};

// 创建采购
const createOrderPlan = async () => {
  console.warn(selectRow.value, 'selectRow.value');
  const formData = await ChcGridApi.formApi.getValues();
  const tableData = roleGridApi.grid.getTableData().tableData;
  console.warn(tableData, 'tableData');
  console.warn(formData, 'formData');
  if (!formData.applyPlanDate) {
    message.error('请选择计划月份');
    return;
  }
  if (!selectRow.value) {
    message.error({
      content: '请选择一条记录',
    });
    return;
  }
  if (tableData.length === 0) {
    message.error({
      content: '缺少行数据',
    });
    return;
  }
  const submitLines: any[] = [];
  let hasError = false;
  for (const record of tableData) {
    // 检查采购数量
    const qtyPoProcess = Number(record.qtyPoProcess) || 0;
    const qtyPOLeft = Number(record.qtyPOLeft) || 0;
    if (qtyPoProcess > 0) {
      // 校验采购数量不能大于剩余采购数量
      if (qtyPoProcess > qtyPOLeft) {
        // message.error(
        //   `商品"${record.productName}"的采购数量不能大于采购剩余数量(${qtyPOLeft})`,
        // );
        Modal.error({
          title: '错误',
          content: `商品"${record.productName}"的采购数量不能大于采购剩余数量(${qtyPOLeft})`,
          centered: true,
        });
        hasError = true;
        break;
      }
      submitLines.push({
        applyPlanLineId: record.applyPlanLineId,
        qtyPoProcess,
        productId: record.productId,
      });
    }
  }
  if (hasError) {
    return;
  }
  console.warn('判断条件都通过了');
  // 检查是否有需要提交的数据
  if (submitLines.length === 0) {
    message.warning('请至少填写一条采购数量大于0的记录');
    return;
  }
  Modal.confirm({
    title: '提醒',
    content: '确定要创建采购计划吗?',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        // 8. 提交数据
        const params = {
          applyPlanId: selectRow.value.applyPlanId,
          lines: JSON.stringify(submitLines),
        };

        const result = await createPurchase(params);
        if (result && result.success) {
          message.success('采购计划生成成功!');
          // 刷新子表
          roleGridApi.query({ applyPlanId: selectRow.value.applyPlanId });
          // 跳转到采购计划录入页面
          // router.push({
          //   path: '/spd/web/w1/po/poPlanInput',
          //   query: {
          //     autoLoad: 'Y',
          //     dateFrom: dayjs().format('YYYY-MM-DD'),
          //     isReload: 'Y',
          //   },
          // });
        } else {
          message.error(result.msg || '失败');
        }
      } catch (error: any) {
        message.error(error.message || '创建采购计划失败');
      }
    },
  });
};

// 创建请领
const createOrder = async () => {
  try {
    // 获取表单数据
    const formData = await ChcGridApi.formApi.getValues();

    // 验证计划月份
    if (!formData.applyPlanDate) {
      message.error('请选择计划月份');
      return;
    }

    //  验证是否选中主表记录
    if (!selectRow.value || !selectRow.value.applyPlanId) {
      message.error('请选择一条申请计划记录');
      return;
    }

    // 获取子表数据
    const tableData = roleGridApi.grid.getTableData().tableData;
    if (!tableData || tableData.length === 0) {
      message.error('缺少行数据');
      return;
    }

    //  校验并构建提交数据
    const submitLines: any[] = [];
    let hasError = false;

    for (const record of tableData) {
      // 检查请领数量
      const qtyWoProcess = Number(record.qtyWoProcess) || 0;
      const qtyLeft = Number(record.qtyLeft) || 0;

      if (qtyWoProcess > 0) {
        // 校验请领数量不能大于剩余请领数量
        if (qtyWoProcess > qtyLeft) {
          // message.error(
          //   `商品"${record.productName}"的请领数量不能大于请领剩余数量(${qtyLeft})`,
          // );
          Modal.error({
            title: '错误',
            content: `商品"${record.productName}"的请领数量不能大于请领剩余数量(${qtyLeft})`,
            centered: true,
          });
          hasError = true;
          break;
        }

        // 添加到提交列表
        submitLines.push({
          applyPlanLineId: record.applyPlanLineId,
          qtyWoProcess,
          productId: record.productId,
        });
      }
    }

    if (hasError) {
      return;
    }

    // 检查是否有需要提交的数据
    if (submitLines.length === 0) {
      message.warning('请至少填写一条请领数量大于0的记录');
      return;
    }

    // 确认提示
    Modal.confirm({
      title: '提醒',
      content: '确定要创建请领单吗?',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          // 8. 提交数据
          const params = {
            applyPlanId: selectRow.value.applyPlanId,
            lines: JSON.stringify(submitLines),
          };

          await createPick(params);

          // 9. 成功处理
          message.success('请领单创建成功!');

          // 刷新子表
          roleGridApi.query({ applyPlanId: selectRow.value.applyPlanId });

          // 跳转到请领单录入页面
          // router.push({
          //   path: '/spd/web/w1/wms/mvApplyInput',
          //   query: {
          //     autoLoad: 'Y',
          //     dateFrom: dayjs().format('YYYY-MM-DD'),
          //     isReload: 'Y',
          //   },
          // });
        } catch (error: any) {
          message.error(error.message || '创建请领单失败');
        }
      },
    });
  } catch (error: any) {
    message.error(error.message || '操作失败');
  }
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <div class="h-full">
      <PageSplitLazy
        :distribute="0.6"
        :line-thickness="6"
        :is-vertical="false"
        background-color="#f1f3f6"
        hover-color="#c0c4cc"
        :has-line-tip="true"
      >
        <template #first>
          <ChcGrid class="flex-1 overflow-hidden">
            <template #toolbar-actions>
              <Button
                v-if="hasAccessByCodes(['spd.web.w3.applyPlan.manage.addPlan'])"
                type="primary"
                @click="createOrderPlan"
                class="mr-[0.5rem]"
                data-testid="button_createPurchase"
              >
                创建采购
              </Button>
              <Button
                type="primary"
                v-if="
                  hasAccessByCodes(['spd.web.w3.applyPlan.manage.addManage'])
                "
                @click="createOrder"
                data-testid="button_createPick"
              >
                创建请领
              </Button>
            </template>
          </ChcGrid>
        </template>
        <template #second>
          <RoleGrid>
            <template #toolbar-actions>
              <label for="productName" style="margin-top: 10px">药品：</label>
              <Input
                v-model:value="parentTableParams.productName"
                class="mr-[0.5rem] w-[240px]"
                style="margin-top: 10px"
                placeholder="编码/拼音码/名称"
                @keyup.enter="handleSearch"
                allow-clear
                data-testid="input_productName"
              />
              <Button
                type="primary"
                @click="handleSearch"
                style="margin-top: 10px"
                data-testid="button_search"
              >
                搜索
                <template #icon>
                  <SearchActionIcon />
                </template>
              </Button>
            </template>
          </RoleGrid>
        </template>
      </PageSplitLazy>
    </div>
  </Page>
</template>

<style scoped>
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
