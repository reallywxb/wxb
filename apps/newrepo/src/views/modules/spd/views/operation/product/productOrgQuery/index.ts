import { useVbenModal } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { $t } from '#/locales';
import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';
import OrgChangeLogComp from '#/views/modules/spd/views/operation/product/purchaseAgreementEdit/changeLog.vue';

export function useGrid() {
  const userStore = useUserStore();
  // 父表
  const [ParentGrid, parentGridApi, { handleExport }] = useSpdGrid(
    {
      formOptions: deepMerge(formDefaultOptions, {
        compact: true,
        commonConfig: {
          labelClass: 'w-[90px]',
        },
        layout: 'horizontal',
        showCollapseButton: false,
        submitButtonOptions: {
          content: '查询',
        },
      }),
      gridOptions: deepMerge(gridDefaultOptions, {
        stripe: false,
        checkboxConfig: {
          trigger: 'row',
          highlight: true,
        },
        proxyConfig: {
          autoLoad: false,
        },
      }),
    },
    {
      id: 'productOrgEdit',
      // api地址
      queryUrl: 'productAction/queryProductOrg.do',
      gridColumns: [
        { title: '序号', type: 'seq', width: 50, align: 'center' },
        { field: 'productCode', title: '药品编码', minWidth: '100' },
        { field: 'productName', title: '药品名称', minWidth: '150' },
        { field: 'productSpec', title: '规格', minWidth: '120' },
        {
          field: 'manufacturer',
          title: '厂家',
          minWidth: '150',
          sortable: true,
        },
        { field: 'uomName', title: '采购单位', minWidth: '80', sortable: true },
        {
          field: 'vendorName',
          title: '供应商',
          minWidth: '180',
          sortable: true,
        },
        {
          field: 'pricePO',
          title: '采购价',
          minWidth: '80',
          formatter({ row }: any) {
            return handlePriceToFixedTwo(row.pricePO);
          },
          align: 'right',
          sortable: true,
        },
        {
          field: 'priceList',
          title: '零售价',
          minWidth: '80',
          formatter({ row }: any) {
            return handlePriceToFixedTwo(row.priceList);
          },
          align: 'right',
          sortable: true,
        },
        {
          field: 'guaranteeDaysMin',
          title: '效期预警天数',
          // "<font title='供应商配送的效期低于预警天数时，医院会拒收。'>效期预警天数</font>",
          minWidth: '120',
          align: 'right',
          sortable: true,
        },
        {
          field: 'isDefault',
          title: '默认',
          minWidth: '60',
          formatter({ cellValue }) {
            return cellValue === 'Y' ? '是' : '否';
          },
        },
        {
          field: 'isActive',
          title: '是否有效',
          minWidth: '90',
          formatter({ cellValue }) {
            return cellValue === 'Y' ? '是' : '否';
          },
        },
        {
          field: 'isPurchasePriceUnify',
          title: '是否统一定价',
          minWidth: '110',
          formatter({ cellValue }) {
            return cellValue === 'Y' ? '是' : '否';
          },
        },
        {
          align: 'center',
          field: 'action',
          slots: { default: 'action' },
          fixed: 'right',
          headerAlign: 'center',
          showOverflow: false,
          title: $t('system.menu.operation'),
          width: 90,
        },
      ],
      // 表单配置
      formSchema: [
        {
          component: 'Input',
          fieldName: 'productName',
          label: '药品',
          componentProps: () => {
            return {
              placeholder: `编码/搜索码/名称`,
              defaultValue: '',
            };
          },
        },
        {
          component: 'ChcSelect',
          componentProps: () => {
            return {
              dictUrl: '/baseHandleAction/vendor.do',
              apiType: 'post',
              requestContentType: 'application/x-www-form-urlencoded',
              showSearch: true,
              placeholder: '请选择供应商',
              paginate: false,
              // allowClear: true,
              filterByFrontEnd: true,
              // mode: 'multiple',
              showChooseAll: '',
              immediate: true,
              labelField: 'name',
              valueField: 'id',
              afterFetch(res: any) {
                return { ...res, rows: undefined, records: res.rows };
              },
            };
          },
          defaultValue: '',
          fieldName: 'vendorId',
          label: '供应商',
        },
        // {
        //   component: 'Checkbox',
        //   componentProps: () => {
        //     return {
        //       // disabled: true,
        //     };
        //   },
        //   renderComponentContent: () => {
        //     return {
        //       default: () => ['活跃'],
        //     };
        //   },
        //   fieldName: 'isActive',
        //   label: '',
        // },
        // 禅道2483 更改成ChcSelect组件
        {
          component: 'ChcSelect',
          componentProps: () => {
            return {
              options: [
                { value: '', label: '全部' },
                { value: 'Y', label: '是' },
                { value: 'N', label: '否' },
              ],
              placeholder: '请选择',
              defaultValue: '',
              paginate: false,
              filterByFrontEnd: true,
              immediate: true,
            };
          },
          fieldName: 'isActive',
          label: '是否活跃',
        },
        // {
        //   component: 'Input',
        //   fieldName: 'brandName',
        //   label: '品牌',
        //   componentProps: () => {
        //     return {
        //       placeholder: `请输入`,
        //       defaultValue: '',
        //     };
        //   },
        // },
      ],
      // beforeFetchFn: ({ isActive, ...extra }) => {
      //   return {
      //     ...extra,
      //     isActive: isActive ? 'Y' : null,
      //   };
      // },
      beforeFetchFn: (params: any) => {
        return params;
      },
      tableSearchExtraParams: {
        orgId: userStore.userInfo.orgId,
      },
    },
  );

  const [OrgChangeLogModal, orgChangeLogApi] = useVbenModal({
    class: 'w-[800px]',
    closable: true,
    connectedComponent: OrgChangeLogComp,
    draggable: true,
  });

  function handleViewOrgChangeLog(row: any) {
    orgChangeLogApi
      .setData({
        openType: 'viewChangeLog',
        formData: {
          showForm: true,
          showFormLast: false,
          productOrgId: row.productOrgId,
        },
      })
      .open();
  }

  return {
    ParentGrid,
    parentGridApi,
    handleExport,
    OrgChangeLogModal,
    handleViewOrgChangeLog,
  };
}
