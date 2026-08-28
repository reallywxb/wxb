<script lang="ts" setup>
import { onMounted, useTemplateRef } from 'vue';
import { useRoute } from 'vue-router';

import { ChcSelect } from '@vben/chc-ui';
import { Page, useVbenModal } from '@vben/common-ui';
import { VxeUI } from '@vben/plugins/vxe-table';

import { Button, message, Switch } from 'ant-design-vue';
import { cloneDeep } from 'lodash-es';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';
import {
  importAllocation,
  importProduct,
  importSpec,
} from '#/views/modules/spd/views/operation/product/api';
import {
  activationFormOptions,
  addToDepartmentFormOptions,
  approveFormOptions,
  genColumns,
  genFormOptions,
  genSpecAndPackFormSchemas,
  packColumns,
  queryFormOptions,
  specColumns,
  useImportModal,
  useProductHC,
  useProductYP,
} from '#/views/modules/spd/views/operation/product/productAllInOne/index';

import commonFormModalComp from '../common/modals/commonFormModal.vue';
import CommonImportModal from '../common/modals/commonImportModal.vue';
import productCertQueryComp from '../common/modals/productCertQueryModal/index.vue';
import registrationCertificateChangeModalComp from '../common/modals/registrationCertificateChangeModal.vue';
import registrationCertificateViewModalComp from '../common/modals/registrationCertificateViewModal.vue';
import TableModalComp from '../common/modals/tableModal.vue';
import { productSetting } from '../setting';

const VxeSelect = VxeUI.getComponent('VxeSelect');

const route = useRoute();
// const router = useRouter();
console.warn(route.meta.urlParams, '@@@');
const hiddenFields =
  productSetting.hiddenFields[
    (route.meta.urlParams?.type as 'hc' | 'yp') ?? 'yp'
  ];

const modificationModalRef = useTemplateRef<
  InstanceType<typeof commonFormModalComp>
>('modificationModalRef');

const batchModificationModalRef = useTemplateRef<
  InstanceType<typeof commonFormModalComp>
>('batchModificationModalRef');

// 父表
const [ParentGrid, parentGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      commonConfig: {
        labelClass: 'w-[90px]',
      },
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      checkboxConfig: {
        trigger: 'row',
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
      cellClassName({ column, row }: { column: any }) {
        return (column.field === 'productCode' ||
          column.field === 'certificateNo') &&
          row[column.field]
          ? 'highlight'
          : null;
      },
      rowStyle({ row }: { row: any }) {
        if (row.isActive === 'N') {
          return { color: 'gray' };
        } else if (row.certValidTo && new Date(row.certValidTo) < new Date())
          return { color: 'red' };
      },
      cellStyle({ column, row }: any) {
        if (row.isWorkflowEnd === 'N' && column.field === 'isWorkflowEnd') {
          return {
            color: '#F581B1',
          };
        }
        // if (
        //   column.field === 'certValidTo' &&
        //   new Date(row.certValidTo) < new Date()
        // )
        //   return { color: 'red' };
      },
    }),
  },
  {
    id: 'queryProduct',
    // api地址
    queryUrl: `productAction/queryProduct.do?page=${route.meta.urlParams?.page as string}`,
    gridColumns: genColumns(hiddenFields),
    gridEvents: {
      cellClick: async ({ column, row }: any) => {
        if (column.field === 'productCode' && row.productCode) {
          detailModalApi
            .setData({
              title: '查看',
              form: cloneDeep(row),
            })
            .open();
        } else if (column.field === 'certificateNo' && row.certificateNo) {
          if (hiddenFields.includes('hasCert')) {
            registrationCertificateChangeModalApi
              .setData({
                productId: row.productId,
              })
              .open();
          } else {
            if (row.hasCert === 'Y') {
              // router.push({
              //   path: '/operation/qualificationCertificates/productlicenseQuery',
              //   query: {
              //     productCode: row.productCode,
              //   },
              // });
              productCertQueryModalApi
                .setData({
                  productCode: row.productCode,
                })
                .open();
            } else {
              message.warning('没有证照信息');
            }
          }
        }
      },
    },
    // 表单配置
    formSchema: queryFormOptions(hiddenFields),
  },
);

// 详情对话框
const [DetailModal, detailModalApi] = useVbenModal({
  class: 'w-[900px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: commonFormModalComp,
  draggable: true,
  footer: false,
});

// 启停对话框
const [ActivationModal, activationModalApi] = useVbenModal({
  class: 'w-[500px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: commonFormModalComp,
  draggable: true,
});

// 使用规格对话框
const [ProductSpecModal, productSpecModalApi] = useVbenModal({
  class: 'w-[900px] h-[700px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: TableModalComp,
  draggable: true,
});

// 定数对话框
const [ProductPackModal, productPackModalApi] = useVbenModal({
  class: 'w-[900px] h-[700px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: TableModalComp,
  draggable: true,
});

// 新增对话框
const [
  RegistrationCertificateChangeModal,
  registrationCertificateChangeModalApi,
] = useVbenModal({
  class: 'w-[900px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: registrationCertificateChangeModalComp,
  draggable: true,
  footer: false,
});

// 新增对话框
const [RegistrationCertificateViewModal] = useVbenModal({
  class: 'w-[900px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: registrationCertificateViewModalComp,
  draggable: true,
  footer: false,
});

// 添加到科室对话框
const [AddToDepartmentModal, addToDepartmentModalApi] = useVbenModal({
  class: 'w-[900px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: commonFormModalComp,
  draggable: true,
});

// 审批对话框
const [ApproveFromModal, approveFromModalApi] = useVbenModal({
  class: 'w-[500px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: commonFormModalComp,
  draggable: true,
});

// 注册证号信息弹框
const [ProductCertQueryModal, productCertQueryModalApi] = useVbenModal({
  class: 'w-[900px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: productCertQueryComp,
  draggable: true,
  footer: false,
});

const { handleAdd, handleEdit, handleCommit, handleDel, handleApprove } =
  useProductYP({
    approveFromModalApi,
    parentGridApi,
    modificationModalRef,
  });

const {
  uomNameOptions,
  onUomIdChange,
  handleAdd: handleHCAdd,
  handleEdit: handleHCEdit,
  handleBatchEdit,
  handleCopy,
  handleSpec,
  handlePack,
  handleActivation,
  handleSyncCert,
  // addDepartment,
  handleIsStoragePackageChange,
  handleIsBasePackageChange,
} = useProductHC({
  addToDepartmentModalApi,
  activationModalApi,
  productSpecModalApi,
  productPackModalApi,
  parentGridApi,
  modificationModalRef,
  batchModificationModalRef,
});

const {
  drugImportModalRef,
  specImportModalRef,
  allocationImportModalRef,
  importSchemas,
  ypTemplateURL,
  hcTemplateURL,
  specTemplateURL,
  allocationTemplateURL,
} = useImportModal();

onMounted(() => {
  parentGridApi.formApi.getValues().then((res: any) => {
    parentGridApi.query({ ...res });
  });
});
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <DetailModal disabled :form-options="genFormOptions(hiddenFields)" />
    <commonFormModalComp
      ref="modificationModalRef"
      class="w-[900px]"
      close-on-click-modal
      :form-options="genFormOptions(hiddenFields)"
      :after-submit="parentGridApi.query"
    >
      <template #isStoragePackage="scope">
        <Switch
          :checked="scope.modelValue"
          @update:checked="scope.setValue($event, false)"
          @change="(checked: any) => handleIsStoragePackageChange(checked)"
          checked-children="是"
          un-checked-children="否"
          checked-value="Y"
          un-checked-value="N"
          data-testid="switch_isStoragePackage_ModificationModal"
        />
      </template>
      <template #isBasePackage="scope">
        <Switch
          :checked="scope.modelValue"
          @update:checked="scope.setValue($event, false)"
          @change="(checked: any) => handleIsBasePackageChange(checked)"
          checked-children="是"
          un-checked-children="否"
          checked-value="Y"
          un-checked-value="N"
          data-testid="switch_isBasePackage_ModificationModal"
        />
      </template>
    </commonFormModalComp>
    <commonFormModalComp
      ref="batchModificationModalRef"
      class="w-[900px]"
      close-on-click-modal
      :form-options="genFormOptions(hiddenFields, true)"
      :after-submit="parentGridApi.query"
    >
      <template #isStoragePackage="scope">
        <!-- <Switch
          :checked="scope.modelValue"
          @update:checked="scope.setValue($event, false)"
          @change="
            (checked: any) => handleIsStoragePackageChange(checked, 'batch')
          "
          checked-children="是"
          un-checked-children="否"
          checked-value="Y"
          un-checked-value="N"
          data-testid="switch_isStoragePackage_BatchModificationModal"
        /> -->
        <ChcSelect
          v-model="scope.modelValue"
          class="w-full"
          allow-clear
          placeholder="请选择"
          :paginate="false"
          :immediate="false"
          :options="[
            {
              label: '是',
              value: 'Y',
            },
            {
              label: '否',
              value: 'N',
            },
          ]"
          @change="(value: any) => handleIsStoragePackageChange(value, 'batch')"
          data-testid="select_isStoragePackage_BatchModificationModal"
        />
      </template>
      <template #isBasePackage="scope">
        <!-- <Switch
          :checked="scope.modelValue"
          @update:checked="scope.setValue($event, false)"
          @change="
            (checked: any) => handleIsBasePackageChange(checked, 'batch')
          "
          checked-children="是"
          un-checked-children="否"
          checked-value="Y"
          un-checked-value="N"
          data-testid="switch_isBasePackage_BatchModificationModal"
        /> -->
        <ChcSelect
          v-model="scope.modelValue"
          class="w-full"
          allow-clear
          placeholder="请选择"
          :paginate="false"
          :immediate="false"
          :options="[
            {
              label: '是',
              value: 'Y',
            },
            {
              label: '否',
              value: 'N',
            },
          ]"
          @change="(value: any) => handleIsBasePackageChange(value, 'batch')"
          data-testid="select_isBasePackage_BatchModificationModal"
        />
      </template>
    </commonFormModalComp>
    <ActivationModal
      :form-options="activationFormOptions"
      :after-submit="parentGridApi.query"
    />
    <ProductSpecModal
      :form-schemas="genSpecAndPackFormSchemas(hiddenFields)"
      :grid-columns="specColumns"
      :after-submit="parentGridApi.query"
    >
      <template #edit_uomName="scope">
        <VxeSelect
          v-model="scope.row.uomId"
          :options="uomNameOptions"
          @change="({ value }) => onUomIdChange(value, scope)"
          :data-testid="`VxeSelect_uomName_${scope.rowIndex}_ProductSpecModal`"
        />
      </template>
      <template #edit_isActive="scope">
        <Switch
          v-model:checked="scope.row.isActive"
          checked-children="是"
          un-checked-children="否"
          checked-value="Y"
          un-checked-value="N"
          data-testid="switch_isActive_ProductSpecModal"
        />
      </template>
    </ProductSpecModal>
    <ProductPackModal
      :form-schemas="genSpecAndPackFormSchemas(hiddenFields)"
      :grid-columns="packColumns"
      :after-submit="parentGridApi.query"
    >
      <template #edit_isActive="scope">
        <Switch
          v-model:checked="scope.row.isActive"
          checked-children="是"
          un-checked-children="否"
          checked-value="Y"
          un-checked-value="N"
          data-testid="switch_isActive_ProductPackModal"
        />
      </template>
      <template #edit_isDefault="scope">
        <Switch
          v-model:checked="scope.row.isDefault"
          checked-children="是"
          un-checked-children="否"
          checked-value="Y"
          un-checked-value="N"
          data-testid="switch_isDefault_ProductPackModal"
        />
      </template>
    </ProductPackModal>
    <RegistrationCertificateChangeModal />
    <RegistrationCertificateViewModal />
    <AddToDepartmentModal
      :form-options="addToDepartmentFormOptions"
      :after-submit="parentGridApi.query"
    />
    <!--  商品 - 耗材导入-->
    <CommonImportModal
      :form-schemas="importSchemas"
      keyword="商品"
      :http-request="
        (params: any) =>
          importProduct(params, {
            isApproved: 'Y',
          })
      "
      :template-url="
        route.meta.urlParams?.type === 'hc' ? hcTemplateURL : ypTemplateURL
      "
      :after-submit="parentGridApi.query"
      ref="drugImportModalRef"
    />

    <!--  使用规格导入-->
    <CommonImportModal
      keyword="使用规格"
      :http-request="(params: any) => importSpec(params)"
      :template-url="specTemplateURL"
      :after-submit="parentGridApi.query"
      ref="specImportModalRef"
    />

    <!--  定数货位导入-->
    <CommonImportModal
      keyword="定数货位"
      :http-request="(params: any) => importAllocation(params)"
      :template-url="allocationTemplateURL"
      :after-submit="parentGridApi.query"
      ref="allocationImportModalRef"
    />
    <!-- 审批对话框 -->
    <ApproveFromModal
      :form-options="approveFormOptions"
      :after-submit="parentGridApi.query"
    />
    <!-- 证号信息弹框 -->
    <ProductCertQueryModal />
    <ParentGrid>
      <template #toolbar-actions>
        <template v-if="route.meta.urlParams?.page === 'firstBusiness'">
          <Button
            type="primary"
            @click="handleAdd()"
            class="mr-[0.5rem]"
            data-testid="button_add"
          >
            新增
          </Button>
          <Button
            type="primary"
            @click="handleEdit()"
            class="mr-[0.5rem]"
            data-testid="button_edit"
          >
            修改
          </Button>
          <Button
            type="primary"
            @click="handleCommit()"
            class="mr-[0.5rem]"
            data-testid="button_commit"
          >
            提交
          </Button>
          <Button
            danger
            type="primary"
            @click="handleDel()"
            class="mr-[0.5rem]"
            data-testid="button_delete"
          >
            批量删除
          </Button>
          <Button
            type="primary"
            @click="drugImportModalRef?.open()"
            class="mr-[0.5rem]"
            data-testid="button_import"
          >
            药品导入
          </Button>
        </template>
        <template v-if="route.meta.urlParams?.page === 'firstApprove'">
          <Button
            type="primary"
            @click="handleApprove()"
            class="mr-[0.5rem]"
            data-testid="button_approve"
          >
            审批
          </Button>
        </template>

        <template
          v-if="
            route.meta.urlParams?.page === 'manage' &&
            route.meta.urlParams?.readOnly !== 'true'
          "
        >
          <Button
            type="primary"
            @click="handleHCAdd()"
            class="mr-[0.5rem]"
            data-testid="button_add"
          >
            新增
          </Button>
          <Button
            type="primary"
            @click="handleHCEdit()"
            class="mr-[0.5rem]"
            data-testid="button_edit"
          >
            修改
          </Button>
          <Button
            type="primary"
            @click="handleBatchEdit()"
            class="mr-[0.5rem]"
            data-testid="button_batchEdit"
          >
            批量修改
          </Button>
          <Button
            type="primary"
            @click="handleCopy()"
            class="mr-[0.5rem]"
            data-testid="button_copy"
          >
            复制
          </Button>
          <Button
            type="primary"
            @click="handleActivation()"
            class="mr-[0.5rem]"
            data-testid="button_activation"
          >
            启用/停用
          </Button>
          <Button
            type="primary"
            @click="handleSpec()"
            class="mr-[0.5rem]"
            data-testid="button_spec"
          >
            使用规格
          </Button>
          <Button
            type="primary"
            @click="handlePack()"
            class="mr-[0.5rem]"
            data-testid="button_pack"
          >
            定数
          </Button>
          <Button
            type="primary"
            @click="handleSyncCert()"
            class="mr-[0.5rem]"
            data-testid="button_syncCert"
          >
            同步证照
          </Button>
          <Button
            type="primary"
            @click="drugImportModalRef?.open()"
            class="mr-[0.5rem]"
            data-testid="button_import"
          >
            商品导入
          </Button>
          <Button
            type="primary"
            @click="specImportModalRef?.open()"
            class="mr-[0.5rem]"
            data-testid="button_specImport"
          >
            使用规格导入
          </Button>
          <Button
            type="primary"
            @click="allocationImportModalRef?.open()"
            class="mr-[0.5rem]"
            data-testid="button_allocationImport"
          >
            定数货位导入
          </Button>
          <Button
            type="primary"
            class="mr-[0.5rem]"
            v-if="false"
            data-testid="button_billing"
          >
            计费项维护
          </Button>
          <!-- <Button
            type="primary"
            @click="addDepartment()"
            class="mr-[0.5rem]"
            data-testid="button_addDepartment"
          >
            添加到科室
          </Button> -->
        </template>
        <Button
          type="primary"
          @click="handleExport"
          class="mr-[0.5rem]"
          v-if="route.meta.urlParams?.canExport === 'true'"
          data-testid="button_export"
        >
          导出
        </Button>
      </template>
    </ParentGrid>
  </Page>
</template>

<style lang="scss" scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  display: none;
}

::v-deep(.vxe-grid--table-container .vxe-table--column.highlight) {
  color: #006afc;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}
</style>
