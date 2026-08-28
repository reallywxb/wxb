import type { Ref } from 'vue';

import type {
  ExtendedFormApi,
  ExtendedModalApi,
  VbenFormProps,
} from '@vben/common-ui';
import type { VxeGridApi } from '@vben/plugins/src/vxe-table/api.ts';

import { computed, reactive, ref } from 'vue';

import { message, Modal } from 'ant-design-vue';

import { encryption } from '#/utils/util';
import {
  useApplicationGridOptions,
  usePrimaryGridOptions,
  useSiteEnterpriseGridOptions,
  useSiteOrganizationGridOptions,
  useSiteUsersGridOptions,
  useSiteWarehouseGridOptions,
} from '#/views/modules/edi/views/site/gridOptions';
import {
  primarySearchFormOptions,
  siteUsersSearchFormOptions,
  siteWarehouseSearchFormOptions,
} from '#/views/modules/edi/views/site/searchFormOptions';
import { useCommonGrid } from '#/views/modules/sys/views/common/grid/commonGrid';

import {
  createSite,
  createSiteApp,
  createSiteCorp,
  createSiteOrg,
  createSiteUser,
  createSiteWarehouse,
  delSite,
  delSiteApp,
  delSiteCorp,
  delSiteOrg,
  delSiteUser,
  delSiteWarehouse,
  updateSite,
  updateSiteApp,
  updateSiteCorp,
  updateSiteOrg,
  updateSiteUser,
  updateSiteWarehouse,
} from './api';

export enum Tab {
  SiteEnterprise,
  SiteOrganization,
  SiteWarehouse,
  SiteUsers,
  Application,
}

const createSubFnMap = {
  [Tab.SiteEnterprise]: createSiteCorp,
  [Tab.SiteOrganization]: createSiteOrg,
  [Tab.SiteWarehouse]: createSiteWarehouse,
  [Tab.SiteUsers]: createSiteUser,
  [Tab.Application]: createSiteApp,
};

const updateSubFnMap = {
  [Tab.SiteEnterprise]: updateSiteCorp,
  [Tab.SiteOrganization]: updateSiteOrg,
  [Tab.SiteWarehouse]: updateSiteWarehouse,
  [Tab.SiteUsers]: updateSiteUser,
  [Tab.Application]: updateSiteApp,
};
const delSubFnMap = {
  [Tab.SiteEnterprise]: delSiteCorp,
  [Tab.SiteOrganization]: delSiteOrg,
  [Tab.SiteWarehouse]: delSiteWarehouse,
  [Tab.SiteUsers]: delSiteUser,
  [Tab.Application]: delSiteApp,
};
enum ModalMode {
  add,
  edit,
  view,
}

function uuid() {
  const s = [];
  const hexDigits = '0123456789abcdef';
  for (let i = 0; i < 36; i++) {
    // eslint-disable-next-line unicorn/prefer-string-slice
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = '4'; // bits 12-15 of the time_hi_and_version field to 0010
  // eslint-disable-next-line unicorn/prefer-string-slice
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = '-';

  const uuid = s.join('');
  return uuid;
}

export function useGrid() {
  const parentTableParams = reactive({
    siteId: '',
  });

  // 主表
  const [Grid, gridApi] = useCommonGrid(
    {
      formOptions: primarySearchFormOptions,
      gridOptions: usePrimaryGridOptions(),
      gridEvents: {
        radioChange({ row }: any) {
          parentTableParams.siteId = row?.id;

          siteEnterpriseGridApi?.query();
          siteOrganizationGridApi?.query();
          siteWarehouseGridApi?.query();
          siteUsersGridApi?.query();
          applicationGridApi?.query();
        },
      },
    },
    {
      dataTableId: '/datatable/data/page/edi.site',
    },
  );

  // 子表
  const [SiteEnterpriseGrid, siteEnterpriseGridApi] = useCommonGrid(
    {
      gridOptions: useSiteEnterpriseGridOptions(),
    },
    {
      id: 'SiteEnterpriseGrid',
      dataTableId: '/datatable/data/page/edi.siteCorp',
      parentTableParams,
    },
  );

  const [SiteOrganizationGrid, siteOrganizationGridApi] = useCommonGrid(
    {
      gridOptions: useSiteOrganizationGridOptions(),
    },
    {
      id: 'SiteOrganizationGrid',
      dataTableId: '/datatable/data/page/edi.siteOrg',
      parentTableParams,
    },
  );

  const [SiteWarehouseGrid, siteWarehouseGridApi] = useCommonGrid(
    {
      formOptions: siteWarehouseSearchFormOptions,
      gridOptions: useSiteWarehouseGridOptions(),
    },
    {
      id: 'SiteWarehouseGrid',
      dataTableId: '/datatable/data/page/edi.siteWarehouse',
      parentTableParams,
    },
  );
  const [SiteUsersGrid, siteUsersGridApi] = useCommonGrid(
    {
      formOptions: siteUsersSearchFormOptions,
      gridOptions: useSiteUsersGridOptions(),
    },
    {
      id: 'SiteUsersGrid',
      dataTableId: '/datatable/data/page/edi.siteUser',
      parentTableParams,
    },
  );
  const [ApplicationGrid, applicationGridApi] = useCommonGrid(
    {
      gridOptions: useApplicationGridOptions(),
    },
    {
      id: 'ApplicationGrid',
      dataTableId: '/datatable/data/page/edi.siteApp',
      parentTableParams,
    },
  );

  return {
    Grid,
    gridApi,
    SiteEnterpriseGrid,
    siteEnterpriseGridApi,
    SiteOrganizationGrid,
    siteOrganizationGridApi,
    SiteWarehouseGrid,
    siteWarehouseGridApi,
    SiteUsersGrid,
    siteUsersGridApi,
    ApplicationGrid,
    applicationGridApi,
    parentTableParams,
  };
}

export function useCommonModal(
  gridApi: VxeGridApi,
  subApiList: Array<VxeGridApi>,
  {
    activeKey,
  }: {
    activeKey: Ref<string>;
  },
) {
  const modificationModalRef = ref<
    | (Record<string, any> & {
        formApi?: ExtendedFormApi;
        modalApi: ExtendedModalApi;
      })
    | undefined
  >();

  const subModificationModalRef = ref<
    | (Record<string, any> & {
        formApi?: ExtendedFormApi;
        modalApi: ExtendedModalApi;
      })
    | undefined
  >();

  const encryptionModalRef = ref<
    | (Record<string, any> & {
        formApi?: ExtendedFormApi;
        modalApi: ExtendedModalApi;
      })
    | undefined
  >();

  const formMode = ref<ModalMode>(ModalMode.add);

  const formOption: VbenFormProps = {
    layout: 'vertical',
    schema: [
      {
        component: 'Input',
        fieldName: 'name',
        label: '站点名称',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        // rules: 'required',
      },
      {
        component: 'Input',
        fieldName: 'siteCode',
        label: '站点编码',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        // rules: 'required',
      },
      {
        component: 'ChcSelect',
        componentProps: computed(() => ({
          dictUrl: '/datatable/dict/entity:sys.org',
          placeholder: '请选择',
          paginate: false,
        })),
        fieldName: 'orgId',
        label: '机构',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        rules: 'required',
      },
      {
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl: '/datatable/getDict/edi.site.siteType',
          placeholder: '请选择',
          paginate: false,
          showSearch: true,
          filterByFrontEnd: true,
          showChooseAll: '',
          afterFetch: (records: any[]) => ({ records }),
        }),
        fieldName: 'siteType',
        label: '站点类型',
        formItemClass: 'pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        defaultValue: '',
        rules: 'required',
      },
      {
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl: '/datatable/getDict/edi.site.siteCategory',
          placeholder: '请选择',
          paginate: false,
          showSearch: true,
          filterByFrontEnd: true,
          showChooseAll: '',
          afterFetch: (records: any[]) => ({ records }),
        }),
        fieldName: 'siteCategory',
        label: '站点类别',
        formItemClass: 'pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        defaultValue: '',
        rules: 'required',
      },

      {
        component: 'Textarea',
        fieldName: 'receiveAppSecret',
        label: '访问密钥',
        formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'Switch',
        componentProps: () => ({
          checkedValue: true,
          checkedChildren: '是',
          unCheckedValue: false,
          unCheckedChildren: '否',

          style: {
            width: '40px',
          },
        }),
        rules: 'required',
        fieldName: 'isPush',
        label: '是否推送',
        formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
        defaultValue: false,
      },

      {
        component: 'Input',
        fieldName: 'url',
        label: '推送地址',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        // rules: 'required',
      },
      {
        component: 'Input',
        fieldName: 'sendAppId',
        label: '推送账号',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        // rules: 'required',
      },
      {
        component: 'Textarea',
        fieldName: 'sendAppSecret',
        label: '推送密钥',
        formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'Input',
        fieldName: 'authHost',
        label: '推送认证域名',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        // rules: 'required',
      },
      {
        component: 'Input',
        fieldName: 'param1',
        label: '自定义参数1',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        // rules: 'required',
      },
      {
        component: 'Input',
        fieldName: 'param2',
        label: '自定义参数2',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        // rules: 'required',
      },
      {
        component: 'Input',
        fieldName: 'param3',
        label: '自定义参数3',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        // rules: 'required',
      },
      {
        component: 'Input',
        fieldName: 'namespace',
        label: '命名空间',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        // rules: 'required',
      },
      {
        component: 'Switch',
        componentProps: () => ({
          checkedValue: true,
          checkedChildren: '是',
          unCheckedValue: false,
          unCheckedChildren: '否',

          style: {
            width: '40px',
          },
        }),
        rules: 'required',
        fieldName: 'isActive',
        label: '是否有效',
        formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
        defaultValue: false,
      },
      {
        component: 'Textarea',
        fieldName: 'remark',
        label: '备注',
        formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
    ],
    // 控制表单是否显示折叠按钮
    showCollapseButton: false,
    // 是否在字段值改变时提交表单
    submitOnChange: false,
    // 按下回车时是否提交表单
    submitOnEnter: false,
    wrapperClass: 'grid-cols-2',
  };

  const subFormOption: VbenFormProps = {
    layout: 'vertical',
    schema: computed(() => {
      const tab = Number.parseInt(activeKey.value) as Tab;

      switch (tab) {
        case Tab.Application: {
          return ApplicationSchema;
        }
        case Tab.SiteEnterprise:
        case Tab.SiteOrganization:
        case Tab.SiteWarehouse: {
          return useSubFormOption(tab);
        }
        case Tab.SiteUsers: {
          return siteUsersFormSchema;
        }
        default: {
          return [];
        }
      }
    }),
    // 控制表单是否显示折叠按钮
    showCollapseButton: false,
    // 是否在字段值改变时提交表单
    submitOnChange: false,
    // 按下回车时是否提交表单
    submitOnEnter: false,
    wrapperClass: 'grid-cols-2',
  };

  const encryptionFormOption: VbenFormProps = {
    layout: 'horizontal',
    schema: [
      {
        component: 'Textarea',
        fieldName: 'password',
        label: '',
        componentProps: () => ({
          rows: 8,
          readonly: true,
        }),
        formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
        hideLabel: true,
      },
    ],
    showDefaultActions: false,
  };

  const useSubFormOption = (type: Tab) =>
    [
      {
        component: 'Input',
        fieldName: 'siteName',
        label: '站点',
        componentProps: () => ({
          placeholder: '请输入',
          disabled: true,
        }),
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        rules: 'required',
        visible: type !== Tab.Application,
      },
      {
        component: 'ChcSelect',
        componentProps: computed(() => ({
          dictUrl: '/datatable/pageDict/entity:md.corporation',
          placeholder: '请选择',
          paginate: false,
        })),
        fieldName: 'corporationId',
        label: '企业',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        rules: 'required',
        visible: type === Tab.SiteEnterprise,
      },
      {
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl: '/sys/org/orgList',
          placeholder: '请选择',
          paginate: false,
          showSearch: true,
          filterByFrontEnd: true,
          showChooseAll: '',
          afterFetch: (records: any[]) => ({ records }),
        }),
        fieldName: 'orgId',
        label: '机构',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        defaultValue: '',
        visible: type === Tab.SiteOrganization || type === Tab.SiteWarehouse,
        rules: 'required',
      },
      {
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl: '/datatable/getDict/entity:md.warehouse',
          placeholder: '请选择',
          paginate: false,
          showSearch: true,
          filterByFrontEnd: true,
          showChooseAll: '',
          afterFetch: (records: any[]) => ({ records }),
        }),
        fieldName: 'warehouseId',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        label: '仓库',
        defaultValue: '',
        visible: type === Tab.SiteWarehouse,
        rules: 'required',
      },
      {
        component: 'Switch',
        componentProps: () => ({
          checkedValue: true,
          checkedChildren: '是',
          unCheckedValue: false,
          unCheckedChildren: '否',

          style: {
            width: '40px',
          },
        }),
        rules: 'required',
        fieldName: 'isActive',
        label: '是否有效',
        formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        defaultValue: false,
        visible: true,
      },
      {
        component: 'Input',
        fieldName: 'siteCorpCode',
        label: '外部企业编码',
        componentProps: () => ({
          placeholder: '请输入',
        }),
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        visible: type === Tab.SiteEnterprise,
      },
      {
        component: 'Input',
        fieldName: 'siteOrgCode',
        label: '站点机构编码',
        componentProps: () => ({
          placeholder: '请输入',
        }),
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        visible: type === Tab.SiteOrganization,
      },
      {
        component: 'Input',
        fieldName: 'siteWarehouseCode',
        label: '站点仓库编码',
        componentProps: () => ({
          placeholder: '请输入',
        }),
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        visible: type === Tab.SiteWarehouse,
      },
    ].filter((item) => item.visible) as VbenFormProps['schema'];
  const siteUsersFormSchema = [
    {
      component: 'Input',
      fieldName: 'siteName',
      label: '站点',
      componentProps: () => ({
        placeholder: '请输入',
        disabled: true,
      }),
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',

      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'code',
      label: '用户编码',
      componentProps: () => ({
        placeholder: '请输入',
      }),
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',

      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'openId',
      label: 'Open',
      componentProps: () => ({
        placeholder: '请输入',
      }),
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',

      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'type',
      label: '用户类型',
      componentProps: () => ({
        placeholder: '请输入',
      }),
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',

      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: '姓名',
      componentProps: () => ({
        placeholder: '请输入',
      }),
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
    {
      component: 'Input',
      fieldName: 'nickName',
      label: '昵称',
      componentProps: () => ({
        placeholder: '请输入',
      }),
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
    {
      component: 'Input',
      fieldName: 'sex',
      label: '性别',
      componentProps: () => ({
        placeholder: '请输入',
      }),
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
    {
      component: 'Input',
      fieldName: 'deptCode',
      label: '部门编码',
      componentProps: () => ({
        placeholder: '请输入',
      }),
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',

      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'mobile',
      label: '手机',
      componentProps: () => ({
        placeholder: '请输入',
      }),
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',

      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'country',
      label: '国家',
      componentProps: () => ({
        placeholder: '请输入',
      }),
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
    {
      component: 'Input',
      fieldName: 'province',
      label: '省',
      componentProps: () => ({
        placeholder: '请输入',
      }),
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
    {
      component: 'Input',
      fieldName: 'city',
      label: '城市',
      componentProps: () => ({
        placeholder: '请输入',
      }),
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
    {
      component: 'Input',
      fieldName: 'headImgUrl',
      label: '头像图片地址',
      componentProps: () => ({
        placeholder: '请输入',
      }),
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
    {
      component: 'Input',
      fieldName: 'language',
      label: '语言',
      componentProps: () => ({
        placeholder: '请输入',
      }),
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
    {
      component: 'Input',
      fieldName: 'remark',
      label: '备注',
      componentProps: () => ({
        placeholder: '请输入',
      }),
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
  ] as VbenFormProps['schema'];
  const ApplicationSchema = [
    {
      component: 'ChcSelect',
      componentProps: computed(() => ({
        dictUrl: '/datatable/dict/entity:sys.org',
        placeholder: '请选择',
        paginate: false,
      })),
      fieldName: 'orgId',
      label: '机构',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: '用户名称',
      componentProps: () => ({
        placeholder: '请输入',
      }),
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
    {
      component: 'ChcSelect',
      componentProps: computed(() => ({
        dictUrl: '/datatable/getDict/edi.siteApp.appType',
        placeholder: '请选择',
        paginate: false,
      })),
      fieldName: 'appType',
      label: '应用类型',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'appCode',
      label: '应用编码',
      componentProps: () => ({
        placeholder: '请输入',
      }),
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
    {
      component: 'Input',
      fieldName: 'receiveSecret',
      label: '访问密钥',
      componentProps: () => ({
        placeholder: '请输入',
      }),
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
    {
      component: 'Switch',
      componentProps: () => ({
        checkedValue: true,
        checkedChildren: '是',
        unCheckedValue: false,
        unCheckedChildren: '否',

        style: {
          width: '40px',
        },
      }),
      rules: 'required',
      fieldName: 'isPush',
      label: '是否推送',
      formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: false,
    },
    {
      component: 'Input',
      fieldName: 'url',
      label: '推送地址',
      componentProps: () => ({
        placeholder: '请输入',
      }),
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
    {
      component: 'Input',
      fieldName: 'sendAppId',
      label: '推送账号',
      componentProps: () => ({
        placeholder: '请输入',
      }),
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
    {
      component: 'Input',
      fieldName: 'sendSecret',
      label: '推送密钥',
      componentProps: () => ({
        placeholder: '请输入',
      }),
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
    {
      component: 'Input',
      fieldName: 'params',
      label: '参数',
      componentProps: () => ({
        placeholder: '请输入',
      }),
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
    {
      component: 'Switch',
      componentProps: () => ({
        checkedValue: true,
        checkedChildren: '是',
        unCheckedValue: false,
        unCheckedChildren: '否',

        style: {
          width: '40px',
        },
      }),
      rules: 'required',
      fieldName: 'isActive',
      label: '是否有效',
      formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: false,
    },
    {
      component: 'Input',
      fieldName: 'remark',
      label: '备注',
      componentProps: () => ({
        placeholder: '请输入',
      }),
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
  ] as VbenFormProps['schema'];

  function handleAdd() {
    formMode.value = ModalMode.add;
    modificationModalRef.value?.modalApi
      .setData({
        title: '新增',
        submit: (params: any) => createSite(params),
      })
      .open();
  }
  function handleEdit({ id, ...form }: any) {
    formMode.value = ModalMode.edit;
    modificationModalRef.value?.modalApi
      .setData({
        title: '编辑 ',
        form,
        submit: (params: any) =>
          updateSite({
            ...params,
            id,
          }),
      })
      .open();
  }

  function handleDel({ id }: any) {
    Modal.confirm({
      title: '提示',
      content: '此操作将永久删除选中的记录, 是否继续?',
      centered: true,
      okType: 'danger',
      onOk: async () => {
        try {
          await delSite(id);
          message.success('操作成功');

          gridApi.reload();
        } catch {}
      },
    });
  }

  function handleKey() {
    const { password } = encryption({
      data: {
        password: uuid(),
      },
      key: 'chcitchcitchcitx',
      param: ['password'],
    });

    encryptionModalRef.value?.modalApi
      .setData({
        title: '生成密钥',
        form: {
          password,
        },
      })
      .open();
  }

  function handleSubAdd(tab: Tab) {
    formMode.value = ModalMode.add;

    const record = gridApi.grid.getRadioRecord();

    subModificationModalRef.value?.modalApi
      .setData({
        title: '新增',
        form: {
          siteName: record.name,
        },
        submit: (params: any) =>
          createSubFnMap[tab]({
            siteId: record.id,
            ...params,
          }),
      })
      .open();
  }
  function handleSubEdit({ id, ...form }: any, tab: Tab) {
    formMode.value = ModalMode.edit;

    const record = gridApi.grid.getRadioRecord();

    subModificationModalRef.value?.modalApi
      .setData({
        title: '编辑',
        form: {
          ...form,
          siteName: record.name,
        },
        submit: (params: any) =>
          updateSubFnMap[tab]({
            ...params,
            id,
          }),
      })
      .open();
  }
  function handleSubDel({ id }: any, tab: Tab) {
    Modal.confirm({
      title: '提示',
      content: '此操作将永久删除选中的记录, 是否继续?',
      centered: true,
      okType: 'danger',
      onOk: async () => {
        try {
          await delSubFnMap[tab](id);
          message.success('操作成功');

          reloadSubGrid(tab);
        } catch {}
      },
    });
  }

  function reloadSubGrid(tab: Tab) {
    subApiList[tab]?.reload();
  }

  return {
    subModificationModalRef,
    modificationModalRef,
    encryptionModalRef,
    formOption,
    subFormOption,
    encryptionFormOption,
    reloadSubGrid,
    handleKey,
    handleAdd,
    handleEdit,
    handleDel,
    handleSubAdd,
    handleSubEdit,
    handleSubDel,
  };
}
