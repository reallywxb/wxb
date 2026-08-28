import type {
  ExtendedFormApi,
  ExtendedModalApi,
  VbenFormProps,
} from '@vben/common-ui';

import { h, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message, Modal } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';
import chooseProductModalUi from '#/views/modules/spd/views/operation/packageUnitChange/changeApply/modals/chooseProductModal.vue';
import {
  deleteReagentGroup,
  delReagentGroupProduct,
  saveReagentGroup,
  saveReagentGroupProduct,
} from '#/views/modules/spd/views/operation/product/api';
import OrgChangeLogComp from '#/views/modules/spd/views/operation/product/purchaseAgreementEdit/changeLog.vue';

import commonFormModalComp from '../common/modals/commonFormModal.vue';
import productChangeLogComp from '../common/modals/productChangeLogModal.vue';

export function useGrid() {
  const parentTableParams = ref<{ [key: string]: any }>({});

  // 父表
  const [ParentGrid, parentGridApi] = useSpdGrid(
    {
      formOptions: deepMerge(formDefaultOptions, {
        compact: true,
        commonConfig: {
          labelClass: 'w-[90px]',
        },
        layout: 'horizontal',
        submitButtonOptions: {
          content: '查询',
        },
        showCollapseButton: false,
      }),
      gridOptions: deepMerge(gridDefaultOptions, {
        stripe: false,
        radioConfig: {
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
      queryUrl: `productAction/queryReagentGroup.do`,
      gridColumns: [
        {
          type: 'radio',
          title: '',
          width: 50,
          align: 'center',
          visible: false,
        },
        { title: '序号', type: 'seq', width: 50, align: 'center' },
        {
          field: 'reagentGroupCode',
          title: '试剂组套编码',
          minWidth: '300',
          sortable: true,
        },
        {
          field: 'name',
          title: '试剂组套名称',
          minWidth: '300',
          sortable: true,
        },
        {
          field: 'value',
          title: '搜索码',
          minWidth: '100',
          sortable: true,
        },
        {
          field: 'isActive',
          title: '是否有效',
          minWidth: '100',
          formatter({ cellValue }) {
            return cellValue === 'Y' ? '是' : '否';
          },
        },
        {
          field: 'description',
          title: '备注',
          minWidth: '100',
        },
      ],
      // 表单配置
      formSchema: [
        {
          component: 'Input',
          fieldName: 'reagentGroupName',
          label: '试剂组套',
          componentProps: () => {
            return {
              placeholder: `编码/搜索码/名称`,
              defaultValue: '',
            };
          },
        },
        {
          component: 'Checkbox',
          componentProps: () => {
            return {
              // disabled: true,
            };
          },
          renderComponentContent: () => {
            return {
              default: () => ['活跃'],
            };
          },
          fieldName: 'isActive',
          label: '',
        },
      ],
      gridEvents: {
        radioChange: ({ row }: { row: any }) => {
          if (row?.reagentGroupId) {
            parentTableParams.value.reagentGroupId = row.reagentGroupId;
            childGridApi.query({ reagentGroupId: row.reagentGroupId });
          } else {
            // 父表没数据，子表要清空
            parentTableParams.value.reagentGroupId = undefined;
            childGridApi.grid.remove(childGridApi.grid.getFullData());
          }
        },
      },
      beforeFetchFn: ({ isActive, ...extra }) => {
        return {
          ...extra,
          isActive: isActive ? 'Y' : null,
        };
      },
      afterFetchFn: (params) => {
        childGridApi.grid.reloadData([]);
        return {
          ...params,
          records: params.rows,
        };
      },
    },
  );

  // 子表
  const [ChildGrid, childGridApi] = useSpdGrid(
    {
      gridOptions: {
        columns: [
          {
            type: 'radio',
            title: '',
            width: 50,
            align: 'center',
            visible: false,
          },
          { title: '序号', type: 'seq', width: 50, align: 'center' },
          {
            field: 'productName',
            title: '药品名称',
            minWidth: '150',
            sortable: true,
          },
          {
            field: 'productSpec',
            title: '规格',
            minWidth: '150',
            sortable: true,
          },
          {
            field: 'productCode',
            title: '药品编码',
            minWidth: '150',
            sortable: true,
          },
          {
            field: 'manufacturer',
            title: '厂家',
            minWidth: '150',
            sortable: true,
          },
          {
            field: 'isActive',
            title: '是否有效',
            minWidth: '100',
            formatter({ cellValue }) {
              return cellValue === 'Y' ? '是' : '否';
            },
          },
        ],
        proxyConfig: {
          autoLoad: false,
        },
      },
    },
    {
      parentTableParams,
      id: 'productOrgEdit_son',
      dataTableId: '/productAction/queryReagentGroupProduct.do',
    },
  );

  function refreshChildGrid() {
    childGridApi.query({
      reagentGroupId: parentTableParams.value.reagentGroupId,
    });
  }

  const [ProductChangeLogModal, productChangeLogApi] = useVbenModal({
    class: 'w-[800px]',
    closable: true,
    connectedComponent: productChangeLogComp,
    draggable: true,
  });

  const [OrgChangeLogModal, orgChangeLogApi] = useVbenModal({
    class: 'w-[800px]',
    closable: true,
    connectedComponent: OrgChangeLogComp,
    draggable: true,
  });

  function handleViewChangeLog(row: any) {
    productChangeLogApi
      .setData({
        productId: row.productId,
      })
      .open();
  }

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
    ChildGrid,
    childGridApi,
    refreshChildGrid,
    ProductChangeLogModal,
    OrgChangeLogModal,
    handleViewChangeLog,
    handleViewOrgChangeLog,
  };
}
export function useModificationModal({ parentGridApi, childGridApi }: any) {
  const [ModificationModal, modificationModalApi] = useVbenModal({
    class: 'w-[900px] h-[500px]',
    closable: true,
    // 连接抽离的组件
    connectedComponent: commonFormModalComp,
    draggable: true,
  });

  const reagentGroupCreationModalRef = ref<
    | (Record<string, any> & {
        formApi?: ExtendedFormApi;
        modalApi: ExtendedModalApi;
      })
    | undefined
  >();

  // 选择商品
  const [ChooseProductModal, ChooseProductModalApi] = useVbenModal({
    class: 'w-[1300px]',
    closable: true,
    draggable: true,
    connectedComponent: chooseProductModalUi,
  });

  // const [ReagentGroupCreationModal, reagentGroupCreationModalApi] =
  //   useVbenModal({
  //     class: 'w-[500px] h-[550px]',
  //     closable: true,
  //     // 连接抽离的组件
  //     connectedComponent: commonFormModalComp,
  //     draggable: true,
  //   });

  // const [ProductSelectionModal, productSelectionModalApi] = useVbenModal({
  //   class: 'w-[800px] h-[600px]',
  //   closable: true,
  //   // 连接抽离的组件
  //   connectedComponent: ProductionSelectionTableModalComp,
  //   draggable: true,
  // });

  const modificationFormOptions: VbenFormProps = {
    layout: 'horizontal',
    schema: [
      {
        label: '试剂组套名称',
        component: 'Input',
        fieldName: 'name',
        formItemClass: 'col-span-6',
        componentProps: () => {
          return {
            placeholder: `请输入`,
          };
        },
        rules: 'required',
      },
      {
        label: '试剂组套编码',
        component: 'Input',
        fieldName: 'reagentGroupCode',
        formItemClass: 'col-span-6',
        componentProps: () => {
          return {
            placeholder: `请输入`,
          };
        },
        rules: 'required',
      },
      {
        label: '搜索码',
        component: 'Input',
        fieldName: 'value',
        formItemClass: 'col-span-6',
        componentProps: () => {
          return {
            placeholder: `请输入`,
          };
        },
      },
      {
        component: 'Switch',
        componentProps: {
          checkedChildren: '是',
          checkedValue: 'Y',
          unCheckedChildren: '否',
          unCheckedValue: 'N',
          style: {
            width: '40px',
          },
        },
        fieldName: 'isActive',
        label: '是否有效',
        formItemClass: 'col-span-6',
      },
      {
        label: '描述',
        component: 'Textarea',
        fieldName: 'description',
        formItemClass: 'col-span-12',
        componentProps: () => {
          return {
            placeholder: `请输入`,
          };
        },
      },
    ],
    // 控制表单是否显示折叠按钮
    showCollapseButton: false,
    // 是否在字段值改变时提交表单
    submitOnChange: false,
    // 按下回车时是否提交表单
    submitOnEnter: false,
    wrapperClass: 'grid-cols-12',
  };
  const reagentGroupCreationFormOptions: VbenFormProps = {
    layout: 'horizontal',
    schema: [
      {
        component: (attr: any) => {
          return h(
            'div',
            {
              // style: {
              //   fontWeight: 'bold',
              // },
            },
            attr.modelValue,
          );
        },
        fieldName: 'reagentGroupCode',
        label: '试剂组套编码',
      },
      {
        component: (attr: any) => {
          return h(
            'div',
            {
              // style: {
              //   fontWeight: 'bold',
              // },
            },
            attr.modelValue,
          );
        },
        fieldName: 'name',
        label: '试剂组套名称',
      },
      {
        component: 'InputSearch',
        fieldName: 'productCode',
        label: '品种',
        componentProps: () => ({
          onSearch(productCode: string) {
            ChooseProductModalApi.setData({
              productCode,
              callback({
                productId,
                productCode,
                productName,
                productSpec,
                manufacturer,
                uomName,
              }: Record<string, any> = {}) {
                reagentGroupCreationModalRef.value?.formApi?.setValues({
                  productId,
                  productCode,
                  productName,
                  productSpec,
                  manufacturer,
                  uomName,
                });
              },
            }).open();
          },
        }),
      },

      /* !!!必须保留此对象，防止最终获取表单数据时不返回手动设置的productId*/
      {
        component: 'Input',
        fieldName: 'productId',
        formItemClass: 'hidden',
      },
      {
        component: (attr: any) => {
          return h(
            'div',
            {
              // style: {
              //   fontWeight: 'bold',
              // },
            },
            attr.modelValue,
          );
        },
        fieldName: 'productName',
        label: '品名',
      },
      {
        component: (attr: any) => {
          return h(
            'div',
            {
              // style: {
              //   fontWeight: 'bold',
              // },
            },
            attr.modelValue,
          );
        },
        fieldName: 'productSpec',
        label: '规格',
      },
      {
        component: (attr: any) => {
          return h(
            'div',
            {
              // style: {
              //   fontWeight: 'bold',
              // },
            },
            attr.modelValue,
          );
        },
        fieldName: 'manufacturer',
        label: '厂家',
      },
      {
        component: (attr: any) => {
          return h(
            'div',
            {
              // style: {
              //   fontWeight: 'bold',
              // },
            },
            attr.modelValue,
          );
        },
        fieldName: 'uomName',
        label: '单位',
      },
    ],
    // 控制表单是否显示折叠按钮
    showCollapseButton: false,
    // 是否在字段值改变时提交表单
    submitOnChange: false,
    // 按下回车时是否提交表单
    submitOnEnter: false,
    wrapperClass: 'grid-cols-1',
  };

  function handleAdd() {
    modificationModalApi
      .setData({
        title: '添加',
        submit(params: any) {
          return saveReagentGroup({
            ...params,
          });
        },
      })
      .open();
  }

  function handleEdit() {
    const selectedRow = parentGridApi.grid.getRadioRecord();
    if (!selectedRow) {
      message.error('请选择一条记录！');
      return;
    }

    const {
      reagentGroupId,

      name,
      reagentGroupCode,
      value,
      isActive,
      description,
    } = selectedRow;
    modificationModalApi
      .setData({
        title: '修改',
        form: {
          name,
          reagentGroupCode,
          value,
          isActive,
          description,
        },
        submit(params: any) {
          return saveReagentGroup({
            reagentGroupId,
            ...params,
            isActive: 'Y',
          });
        },
      })
      .open();
  }

  function handleDel() {
    const selectedRow = parentGridApi.grid.getRadioRecord();
    if (!selectedRow) {
      message.error('请选择一条记录！');
      return;
    }

    Modal.confirm({
      title: '提示',
      content: `确定删除吗？`,
      onOk: async () => {
        try {
          await deleteReagentGroup({
            reagentGroupId: selectedRow.reagentGroupId,
          });

          message.success('删除成功');

          parentGridApi.query();
        } catch {
          message.error('删除失败');
        }
      },
    });
  }

  function handleAddReagentGroup() {
    const selectedRow = parentGridApi.grid.getRadioRecord();
    if (!selectedRow) {
      message.error('请选择一条记录！');
      return;
    }

    const { name, reagentGroupCode, reagentGroupId } = selectedRow;
    reagentGroupCreationModalRef.value?.modalApi
      .setData({
        title: '添加品种',
        form: {
          reagentGroupCode,
          name,
        },
        submit: (params: any) =>
          saveReagentGroupProduct({
            reagentGroupId,
            // productId,
            // productCode,
            // isActive,
            // productName,
            // productSpec,
            // manufacturer,
            // uomName,
            ...params,
            isActive: 'Y',
          }),
      })
      .open();
  }

  function handleDelReagentGroup() {
    const selectedRow = childGridApi.grid.getRadioRecord();
    if (!selectedRow) {
      message.error('请选择一条记录！');
      return;
    }

    Modal.confirm({
      title: '提示',
      content: `确定删除品种设置吗？`,
      onOk: async () => {
        try {
          await delReagentGroupProduct({
            reagentGroupProductId: selectedRow.reagentGroupProductId,
          });

          message.success('删除成功');

          childGridApi.query();
        } catch {
          message.error('删除失败');
        }
      },
    });
  }

  return {
    modificationFormOptions,
    ModificationModal,
    handleAdd,
    handleEdit,
    handleDel,
    reagentGroupCreationFormOptions,
    handleAddReagentGroup,
    handleDelReagentGroup,
    reagentGroupCreationModalRef,
    ChooseProductModal,
  };
}
