<script lang="ts" setup>
import { h, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

// import { QuestionOutlined } from '@ant-design/icons-vue';
import { useVbenModal } from '@vben/common-ui';

import { message, RadioButton, RadioGroup } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { requestFormClient } from '#/api/request';

const route = useRoute();
const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数
console.warn('urlParams', urlParams);
const modalData = ref<Record<string, any>>({});
const modalTitle = ref('');
type ModalType = 'ADD' | 'COPY' | 'EDIT';
const modalType = ref<ModalType>('ADD');
const TabVal = {
  // 采购
  Procurement: 1,
  // 请领/调拨
  ClaimAndTransfer: 2,
  // 仓库
  Warehouse: 3,
};
type TabValType = (typeof TabVal)[keyof typeof TabVal];
const tabs = [
  { label: '采购', value: TabVal.Procurement },
  { label: '请领/调拨', value: TabVal.ClaimAndTransfer },
  { label: '仓库', value: TabVal.Warehouse },
];
const currentTab = ref<TabValType>(TabVal.Procurement);
const [CommonForm, commonFormApi] = useVbenForm({
  compact: true,
  commonConfig: {
    colon: true,
    componentProps: {
      class: 'w-full',
    },
    labelWidth: 50,
  },
  popupContainerClass: 'commonForm',
  layout: 'horizontal',
  actionWrapperClass: 'formActionAreaStyle',
  // 控制表单是否显示折叠按钮
  showCollapseButton: false,
  submitButtonOptions: {
    show: false,
  },
  resetButtonOptions: {
    show: false,
  },
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
  wrapperClass: 'grid-cols-2',
  schema: [
    {
      component: 'Input',
      fieldName: 'name',
      label: '名称',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      componentProps: () => {
        return {
          placeholder: '请输入名称',
          maxlength: 20,
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'description',
      label: '备注',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      componentProps: () => {
        return {
          placeholder: '请输入备注',
          maxlength: 20,
        };
      },
    },
  ],
});
// 采购
const [ProcurementForm, procurementFormApi] = useVbenForm({
  commonConfig: {
    colon: true,
    componentProps: {
      class: 'w-full',
    },
    labelWidth: 200,
  },
  popupContainerClass: 'procurementForm',
  layout: 'horizontal',
  actionWrapperClass: 'formActionAreaStyle',
  // 控制表单是否显示折叠按钮
  showCollapseButton: false,
  submitButtonOptions: {
    show: false,
  },
  resetButtonOptions: {
    show: false,
  },
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
  wrapperClass: 'grid-cols-2',
  schema: [
    {
      component: 'ChcSelect',
      fieldName: 'invoiceMethod',
      label: '开票方式',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px] text-[red]',
      help: () => {
        return h('div', {}, [
          h('div', {}, '货票同行：供应商录入配送时，需同时录入发票信息。'),
          h(
            'div',
            {},
            '结算单：供应商录入配送时，不需要录入发票信息；医院创建并提交了结算单之后，供应商根据结算单录入发票信息。',
          ),
          h(
            'div',
            {},
            '后开票：供应商录入配送时，可以选择是否录入发票信息；未录入发票的配送记录，可以使用配送发票录入功能补录发票。',
          ),
        ]);
      },
      componentProps: () => {
        return {
          dictUrl:
            '/baseHandleAction/refList.do?id=M_Warehouse_Policy.invoiceMethod',
          placeholder: '请选择开票方式',
          paginate: false,
          autoChooseFirstOption: true,
          immediate: true,
          showChooseAll: false,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows || [] };
          },
        };
      },
    },
    {
      component: 'ChcSelect',
      fieldName: 'settlementMode',
      label: '发票结算模式',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px] text-[red]',
      help: () => {
        return h('div', {}, [
          h('div', {}, '开票方式为结算单方式时有效；货票同行方式时不起作用。'),
          h(
            'div',
            {},
            '入库结算：此仓库的入库为结算边界，货物入库后即可结算。',
          ),
          h('div', {}, [
            h(
              'span',
              {},
              '使用后结算：此仓库的入库不是结算边界，有两种情况会触发结算：',
            ),
            h('br'),
            h(
              'span',
              {
                class: 'pl-5',
              },
              '1. 货物被消耗，包括患者发药、科室领用、报损等；2 从使用后结算的仓库调入入库结算仓库。',
            ),
            h(
              'span',
              {
                class: 'text-[red]',
              },
              '注意：修改发票结算模式时，仓库不能存在库存。',
            ),
          ]),
        ]);
      },
      componentProps: () => {
        return {
          dictUrl:
            '/baseHandleAction/refList.do?id=M_Warehouse_Policy.settlementMode',
          placeholder: '请选择发票结算模式',
          paginate: false,
          autoChooseFirstOption: true,
          immediate: true,
          labelField: 'name',
          showChooseAll: false,
          valueField: 'id',
          optionFilterProp: 'label',
          // showSearch: true,
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows || [] };
          },
        };
      },
    },
    {
      component: 'ChcSelect',
      fieldName: 'paymentPlanMode',
      label: '付款结算模式',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      help: () => {
        return h(
          'div',
          {
            // class: 'text-[#303303]',
          },
          [
            h('div', {}, [
              h('span', {}, '用于生成付款计划，'),
              h(
                'span',
                {
                  // class: 'text-[#FFFFE0]',
                },
                '*不使用付款计划功能时可忽略*',
              ),
            ]),
            h(
              'div',
              {},
              '在开票方式为货票同行，或者开票方式为结算单且发票结算模式为入库结算时有效。',
            ),
            h(
              'div',
              {},
              '在开票方式为结算单且发票结算模式为使用后结算时无效。',
            ),
            h('div', {}, '入库结算：根据入库数量进行结算。'),
            h('div', {}, '使用后结算：根据出库数量进行结算。'),
            h(
              'div',
              {
                // class: 'text-[yellow]',
              },
              '*要慎重选择，一旦更改，会影响到漏付款，会导致付款对账对不上的问题，如果一定要更改，建议把现有库存全部退货或者全部消耗出库，并生成付款计划之后再更改设置*',
            ),
          ],
        );
      },
      componentProps: () => {
        return {
          dictUrl:
            '/baseHandleAction/refList.do?id=M_Warehouse_Policy.paymentPlanMode',
          placeholder: '请选择付款结算模式',
          paginate: false,
          autoChooseFirstOption: true,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          optionFilterProp: 'label',
          // showSearch: true,
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows || [] };
          },
        };
      },
      dependencies: {
        triggerFields: ['invoiceMethod'],
        show: () => {
          return false;
        },
      },
    },
    {
      component: 'ChcSelect',
      fieldName: 'poPlanApproveWay',
      label: '采购计划审核方式',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      help: () => {
        return h('div', {}, [
          h(
            'div',
            {},
            '按单审核：审核页面采用头行结构展示，选中计划头记录进行审核，将选中计划的所有行一起审核。',
          ),
          h(
            'div',
            {},
            '按行审核：审核页面按计划明细行展示，选中计划明细行进行审核，将选中的计划行一起审核。',
          ),
        ]);
      },
      componentProps: () => {
        return {
          dictUrl:
            '/baseHandleAction/refList.do?id=M_Warehouse_Policy.poPlanApproveWay',
          placeholder: '请选择采购计划审核方式',
          paginate: false,
          autoChooseFirstOption: true,
          showChooseAll: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          optionFilterProp: 'label',
          // showSearch: true,
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows || [] };
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isNoProtocolPO',
      label: '允许无协议采购',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: false,
      help: '勾选此项，在录入采购计划时，可以选择没有维护商品供应商关系的供应商，取消勾选此项时，必须先维护商品供应商关系，然后才能在录入采购计划时选择该供应商',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
          onChange: (val: boolean) => {
            if (!val) {
              // 关闭时需要同步将 '启用供应商商品组控制'开关关闭
              procurementFormApi.setFieldValue(
                'isBPartnerProductControl',
                false,
              );
            }
          },
        };
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'maxPricePODiff',
      label: '允许最大采购价差',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      help: '当配送价格与订单价格/当前协议价格出现差异时，如果差异值大于允许最大采购价格，不允许收货。',
      componentProps: {
        placeholder: '请输入允许最大采购价差',
      },
    },
    {
      component: 'Switch',
      fieldName: 'allowUpdateWOOrderPlan',
      label: '允许修改越库采购计划',
      formItemClass: 'col-span-1 col-start-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: false,
      // help: '勾选上之后，当二级库向大库发起请领的品种在二级库的商品目录中设置为请领自动转直配时，大库的采购计划为待提交状态，可修改，与原请领单无关联关系。否则采购计划为已提交状态，不可修改，大库收货后自动转运，修改计划后会导致转运数量和原请领单不一致无法收货。',
      help: () => {
        return h('div', {}, [
          h(
            'span',
            {},
            '勾选上之后，当二级库向大库发起请领的品种在二级库的商品目录中设置为请领自动转直配时，大库的采购计划为待提交状态，可修改，与原请领单无关联关系。',
          ),
          h('br', {}),
          h(
            'span',
            {},
            '否则采购计划为已提交状态，不可修改，大库收货后自动转运，修改计划后会导致转运数量和原请领单不一致无法收货。',
          ),
        ]);
      },
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isBPartnerProductControl',
      label: '启用供应商商品组控制',
      formItemClass: 'col-span-1 col-start-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: false,
      // help: '勾选此项，根据商品<%管控类型%>，过滤可选择的供应商',
      help: '勾选此项，根据商品商品组，过滤可选择的供应商',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          onChange: (val: boolean) => {
            if (val) {
              // 打开时需要同步将 '允许无协议采购'开关打开
              procurementFormApi.setFieldValue('isNoProtocolPO', true);
            }
          },
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'allowPRUpdateVendor',
      label: '允许采退更换供应商',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: false,
      help: () => {
        return h('div', {}, [
          h('div', {}, '勾选此配置项时，采退申请提交时，可修改供应商'),
          h(
            'div',
            {
              // class:'text-[yellow]'
            },
            '*要慎重选择，一旦勾选，系统就允许将从A供应商采购的商品库存退货给B供应商，结算对账、供应商沟通方面都可能会有一些问题，所以，不建议勾选此项*',
          ),
        ]);
      },
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isUnitPackPO',
      label: '启用定数采购',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: false,
      help: '勾选上之后，系统允许录入定数采购计划。请领转采购时会根据此选项决定转换为定数采购计划还是非定数采购计划。供应商配送定数采购订单时，必须按照要求的定数进行打包和打印标签配送。',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isLPackageQtyPO',
      label: '按大包装采购',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: true,
      help: '勾选此配置项时，在采购计划录入或生成自动计划时会按商品的大包装数量的整数倍进行补货',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isSplitByProductControlLevel',
      label: '结算按商品组分单',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: false,
      // help: '勾选上之后，在生成结算单时，不同的<%管控类型%>将分开生成结算单。',
      help: '勾选上之后，在生成结算单时，不同的商品组将分开生成结算单。',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isSplitByInnovate',
      label: '按是否创新分单',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: true,
      // help: '勾选此项，在生成自动采购计划/自动请领计划/采购转采购订单/结算单/根据请领生成采购计划时，将根据<%是否创新%>拆分到不同单子',
      help: '勾选此项，在生成自动采购计划/自动请领计划/采购转采购订单/结算单/根据请领生成采购计划时，将根据是否创新拆分到不同单子',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isSplitByProductCategory',
      label: '按商品类别分单',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: true,
      // help: '勾选此项，在生成自动采购计划/自动请领计划/采购计划转订单/结算单/根据请领生成采购计划时，将根据<%商品类别%>拆分到不同计划',
      help: '勾选此项，在生成自动采购计划/自动请领计划/采购计划转订单/结算单/根据请领生成采购计划时，将根据商品类别拆分到不同计划',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isSplitNarcoticDrug',
      label: '按是否麻精分单',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: true,
      // help: '勾选此项，在生成自动采购计划/自动请领计划/采购计划转订单/结算单/时，将根据商品<%是否麻精%>拆分到不同计划',
      help: '勾选此项，在生成自动采购计划/自动请领计划/采购计划转订单/结算单/时，将根据商品是否麻精拆分到不同计划',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isSplitByBulkPurchase',
      label: '按是否带量分单',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: true,
      // help: '勾选此项，在生成自动采购计划/自动请领计划/采购转采购订单/结算单/根据请领生成采购计划时，将根据<%是否带量%>拆分到不同单子',
      help: '勾选此项，在生成自动采购计划/自动请领计划/采购转采购订单/结算单/根据请领生成采购计划时，将根据是否带量拆分到不同单子',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isSplitByOnLine',
      label: '按是否线上分单',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: true,
      // help: '勾选此项，在生成自动采购计划/自动请领计划/采购转采购订单/结算单/根据请领生成采购计划时，将根据<%是否线上%>拆分到不同单子',
      help: '勾选此项，在生成自动采购计划/自动请领计划/采购转采购订单/结算单/根据请领生成采购计划时，将根据是否线上拆分到不同单子',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isInvoiceByInnovate',
      label: '按是否创新分票',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: true,
      help: '勾选此项，供应商开发票时必须按是否创新分开开票。不勾选，则可以将开在同一张发票上。',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isInvoiceByOnLine',
      label: '按是否线上分票',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: true,
      help: '勾选此项，供应商开发票时必须按是否线上分开开票。不勾选，则可以将开在同一张发票上。',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isInvoiceByProductCategory',
      label: '按商品类别分票',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: true,
      // help: '勾选上之后，供应商开发票时必须将不同<%商品类别%>的配送分开开票。不勾选，则可以将不同<%商品类别%>的配送开在同一张发票上。',
      help: '勾选上之后，供应商开发票时必须将不同商品类别的配送分开开票。不勾选，则可以将不同商品类别的配送开在同一张发票上。',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isInvoiceByApplyBPartner',
      label: '按直配单位分票',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: true,
      help: '勾选上之后，供应商开发票时必须将不同直配库房的配送分开开票。不勾选，则可以将不同直配库房的配送开在同一张发票上。',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isInvoiceByBulkPurchase',
      label: '按是否带量分票',
      formItemClass: 'col-span-1 col-start-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: true,
      help: '勾选上之后，供应商开发票时必须是否带量分开开票。不勾选，则可以开在同一张发票上。',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isSplitByVBP',
      label: '按是否集采分单',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: false,
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isOrderGenOneDelivery',
      label: '订单单次配送',
      formItemClass: 'col-span-1 col-start-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: false,
      help: '勾选此项，供应商只能对订单配送一次，未配送部分不能再补配送。',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'ChcSelect',
      fieldName: 'basePackageType',
      label: '单件包装方式',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      help: '选项：件码：每件贴件码； 箱码+件码：每件贴件码，外包装贴箱码。',
      componentProps: () => {
        return {
          dictUrl:
            '/baseHandleAction/refList.do?id=M_Warehouse_Policy.basePackageType',
          placeholder: '请选择单件包装方式',
          paginate: false,
          autoChooseFirstOption: true,
          showChooseAll: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows || [] };
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isPOASNApprove',
      label: '采购到货是否审核',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: false,
      help: '勾选此项，采购到货单审核完成后，才允许验收',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'ChcSelect',
      fieldName: 'poReceiveWay',
      label: '采购收货方式',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      help: () => {
        return h('div', {}, [
          h('div', {}, '适用于采购收货。'),
          h(
            'div',
            {},
            '人工验收+人工上架：收货和入库分为两步操作，第一步在收货页面做收货；第二步在入库确认页面做入库确认。入库确认之后才会生成入库单并增加库存。',
          ),
          h(
            'div',
            {},
            '人工验收+按行自动上架：收货和入库只需一步操作，在收货页面做收货，一行完成收货后，即自动完成入库确认，生成入库单并增加库存。',
          ),
          h(
            'div',
            {},
            '人工验收+整单自动上架：收货和入库只需一步操作，在收货页面做收货，一个到货通知单的所有行完成收货后，即自动完成入库确认，生成入库单并增加库存。',
          ),
          h(
            'div',
            {},
            '自动验收+自动上架：不需要做收货和入库操作，在收到到货通知单后，自动完成收货和入库确认，生成入库单并增加库存。',
          ),
        ]);
      },
      componentProps: () => {
        return {
          dictUrl:
            '/baseHandleAction/refList.do?id=M_Warehouse_Policy.poReceiveWay',
          placeholder: '请选择采购收货方式',
          paginate: false,
          showChooseAll: false,
          autoChooseFirstOption: true,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows || [] };
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isAutoPutaway',
      label: '采购验收后自动上架',
      formItemClass: 'col-span-1   pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: true,
      help: '勾选自动上架后，在采购入库环节中无需再做上架操作，不勾选自动上架时，验收操作后，需手工上架，指定或按系统自动分配的默认货位进行手工上架操作。',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isReceiveAfterInvoice',
      label: '票货同行发票审核后入库',
      formItemClass: 'col-span-1   pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: true,
      help: '勾选此项后，票货同行的配送先做验收和上架作业，等发票审核后才入库并增加库存。',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isNeedInspecte',
      label: '是否提示开箱验视',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: false,
      help: '勾选此项，手持验收时，会提示需验视，可点击“开箱验视”按钮。',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isNeedSample',
      label: '需抽样验收',
      formItemClass: 'col-span-1   pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: false,
      help: '勾选此配置项时，到货通知单行会标记新品种、新批号，采购验收时显示橙色，提示需进行抽样。',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      dependencies: {
        triggerFields: [''],
        show: () => {
          return false;
        },
      },
    },
    {
      component: 'Switch',
      fieldName: 'isClosePOOrderRejectASN',
      label: '已关闭订单自动拒收',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: false,
      help: () => {
        return h('div', {}, [
          h(
            'span',
            {},
            '勾选此项，如果采购订单已关闭，供应商继续配送，SPD会自动拒收',
          ),
          h(
            'span',
            {
              // class:'text-[yellow]'
            },
            '注意：如果勾选，可能会发生供应商实物配送到医院之后，医院老师找不到对应的到货通知单记录的场景',
          ),
        ]);
      },
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isPORejectInvoice',
      label: '拒收时自动作废发票',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: false,
      help: '勾选此项，验收产生拒收，自动作废该到货通知单行对应的发票',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      dependencies: {
        triggerFields: [''],
        show: () => {
          return false;
        },
      },
    },
    {
      component: 'Switch',
      fieldName: 'allowReceiptWithoutInvoice',
      label: '允许未到票收货',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: false,
      help: '勾选上之后，允许供应商未开发票的情况下，先进行收货。不勾选，则必须在发票已开的情况下，才可以进行收货。',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isOutStoreAfterInvoice',
      label: '采退发票审核后出库',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: true,
      // TODO:未找到
      help: '',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'poValidDays',
      label: '采购订单有效天数',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      // TODO:未找到
      help: '',
      componentProps: () => {
        return {
          placeholder: '请输入采购订单有效天数',
          maxlength: 20,
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isProductCertPOControl',
      label: '品种证书采购管控',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: true,
      // TODO:未找到
      help: '',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isProductCertAsnControl',
      label: '品种证书验收管控',
      formItemClass: 'col-span-1 col-start-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: false,
      // TODO:未找到
      help: '',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isNewReagentLotNotice',
      label: '试剂新批号入库提醒',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: false,
      help: '',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isNoPickOrderNeedWorkflow',
      label: '直接出库订单需工作流',
      formItemClass: 'col-span-1 col-start-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: true,
      // TODO:未找到
      help: '',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      dependencies: {
        triggerFields: [''],
        show: () => {
          return false;
        },
      },
    },
    {
      component: 'Switch',
      fieldName: 'isNeedPORejectInvoice',
      label: '发票审核需要红冲票',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: true,
      // TODO:未找到
      help: '',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      dependencies: {
        triggerFields: [''],
        show: () => {
          return false;
        },
      },
    },
    {
      component: 'Switch',
      fieldName: 'isAutoIndicator',
      label: '是否自动指示',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: false,
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
  ],
});
// 请领/调拨
const [ClaimAndTransferForm, claimAndTransferFormApi] = useVbenForm({
  commonConfig: {
    colon: true,
    componentProps: {
      class: 'w-full',
    },
    labelWidth: 200,
  },
  popupContainerClass: 'claimAndTransferForm',
  layout: 'horizontal',
  actionWrapperClass: 'formActionAreaStyle',
  // 控制表单是否显示折叠按钮
  showCollapseButton: false,
  submitButtonOptions: {
    show: false,
  },
  resetButtonOptions: {
    show: false,
  },
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
  wrapperClass: 'grid-cols-2',
  schema: [
    {
      component: 'ChcSelect',
      fieldName: 'mvReceiveWay',
      label: '调拨收货方式',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px] ',
      help: () => {
        return h('div', {}, [
          h(
            'div',
            {},
            '适用于库间调拨的收货，包括二级库和科室库向上级仓库请领的收货、二级库和科室库向上级仓库请退的收货、二级库和科室库的平级调拨的收货',
          ),
          h(
            'div',
            {},
            '人工验收+人工上架：收货和入库分为两步操作，第一步在收货页面做收货；第二步在入库确认页面做入库确认。入库确认之后才会生成入库单并增加库存。',
          ),
          h(
            'div',
            {},
            '人工验收+按行自动上架：收货和入库只需一步操作，在收货页面做收货，一行完成收货后，即自动完成入库确认，生成入库单并增加库存。',
          ),
          h(
            'div',
            {},
            '人工验收+整单自动上架：收货和入库只需一步操作，在收货页面做收货，一个到货通知单的所有行完成收货后，即自动完成入库确认，生成入库单并增加库存。',
          ),
          h(
            'div',
            {},
            '"自动验收+自动上架：不需要做收货和入库操作，在收到到货通知单后，自动完成收货和入库确认，生成入库单并增加库存。',
          ),
        ]);
      },
      componentProps: () => {
        return {
          dictUrl:
            '/baseHandleAction/refList.do?id=M_Warehouse_Policy.mvReceiveWay',
          placeholder: '请选择调拨收货方式',
          paginate: false,
          autoChooseFirstOption: true,
          immediate: true,
          showChooseAll: false,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows || [] };
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isMVAutoPutaway',
      label: '调拨验收后自动上架',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: true,
      help: '勾选自动上架后，在调拨入库环节中无需再做上架操作，不勾选自动上架时，验收操作后，需手工上架，指定或按系统自动分配的默认货位进行手工上架操作。',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'allowRepeatPick',
      label: '允许出库申请多次发货',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: true,
      help: '勾选该项后，请领单,允许多次指示和发货，否则只能使用整单指示功能，一次指示，一次发货。当his不支持请领单多次收货时，需设置为不允许多次发货',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isCreateLack',
      label: '是否生成缺货单',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: false,
      help: '勾选此项，系统在出库指示后会自动将缺货品种及数量信息生成缺货单',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isLackAutoApprove',
      label: '是否自动提交缺货转请领单据',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: false,
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      // AI-GENERATED-BEGIN
      // @date 2026-06-17
      // @prompt 根据“是否生成缺货单”控制“是否自动提交缺货转请领单据”的显示
      // @description 当“是否生成缺货单”为“是”时，才显示“是否自动提交缺货转请领单据”
      dependencies: {
        triggerFields: ['isCreateLack'],
        show: (values) => {
          return values.isCreateLack;
        },
      },
      // AI-GENERATED-END
    },
    {
      component: 'Switch',
      fieldName: 'allowPickChangeLot',
      label: '允许拣货更换批号',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: false,
      help: '勾选此项，在进行拣货作业时，非包装拣货，允许更换其它批号才拣货出库，取消此项，在拣货时必须按照系统指定的批号进行拣货',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'allowPickRemnant',
      label: '允许拣货数量为小数',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: true,
      help: '勾选此配置项时，允许小数的采购单位数量，生成拣货单',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'ChcSelect',
      fieldName: 'allocationRule',
      label: '出库分配规则',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px] ',
      help: () => {
        return h('div', {}, [
          h(
            'div',
            {},
            '配规则的选项可以在elink后台的基础数据-分配规则页面进行维护。',
          ),
          h(
            'div',
            {},
            '分配规则维护字段包括：F类先出（是否勾选）、近效期先出（是否勾选）、发货策略（先入先出-FIFO、后入先出-LIFO）、清仓优先、活跃的（是否勾选）、默认（是否勾选）。',
          ),
        ]);
      },
      componentProps: () => {
        return {
          dictUrl:
            '/baseHandleAction/refList.do?id=M_Warehouse_Policy.M_AllocationRule_ID',
          placeholder: '请选择出库分配规则',
          paginate: false,
          autoChooseFirstOption: true,
          immediate: true,
          showChooseAll: false,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows || [] };
          },
        };
      },
    },
    {
      component: 'ChcSelect',
      fieldName: 'packagePickingMehtod',
      label: '包装出库指示方式',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px] ',
      help: () => {
        return h('div', {}, [
          h('div', {}, '指示批号和货位：系统拣货任务中指示批号、货位和数量'),
          h('div', {}, '仅指示数量：系统拣货任务中仅指示数量'),
          h('div', {}, '指示批号：系统拣货任务中仅指示批号和数量'),
        ]);
      },
      componentProps: () => {
        return {
          dictUrl:
            '/baseHandleAction/refList.do?id=M_Warehouse_Policy.packagePickingMehtod',
          placeholder: '请选择包装出库指示方式',
          paginate: false,
          autoChooseFirstOption: true,
          immediate: true,
          showChooseAll: false,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows || [] };
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isMergePickList',
      label: '是否合并拣货单',
      formItemClass: 'col-span-1 col-start-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: false,
      help: () => {
        return h('div', {}, [
          h(
            'div',
            {},
            // '勾选上之后，会在生成拣货任务时，将发往同一仓库或同一<%部门%>的拣货任务合并到一个拣货单上。',
            '勾选上之后，会在生成拣货任务时，将发往同一仓库或同一部门的拣货任务合并到一个拣货单上。',
          ),
          h(
            'div',
            {},
            '不勾选，则不会合并，每次生成拣货任务时，都会生成单独的拣货单。',
          ),
        ]);
      },
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isSplitByproductGroup',
      label: '是否按商品组拆单',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: false,
      help: '勾选此项，在新建库房请领录入和调拨录入时，将根据商品组拆分到不同库房请领录入和调拨录入单。',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'allowSplitPick',
      label: '允许整件拆零拣货',
      formItemClass: 'col-span-1 col-start-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: false,
      help: '勾选该项后，在拣货作业时，若出现没有可满足请领数量的包装时，允许将整包装拆成零包后拣货',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isKeepAsnNoWithPickNo',
      label: '保持拣货号与配送单号一致',
      formItemClass: 'col-span-1 col-start-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: true,
      // help: '勾选此项，出库复核完成后，将拣货单号保存至<%配送单号%>中',
      help: '勾选此项，出库复核完成后，将拣货单号保存至配送单号中',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isReturnInOutApprove',
      label: '退库单是否审核',
      formItemClass: 'col-span-1 col-start-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: false,
      help: '勾选此配置项时，退库单药房需进行确认，消息才会同步至药房系统',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      dependencies: {
        triggerFields: [''],
        show: () => {
          return false;
        },
      },
    },
    {
      component: 'Input',
      fieldName: 'soMaxReturnDays',
      label: '销退允许天数',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      help: '多少天内的销售允许退货',
      componentProps: () => {
        return {
          placeholder: '请输入',
          maxlength: 20,
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isMOTrans',
      label: '启用送货交接流程',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: false,
      help: '勾选此项，请领/调拨出库后需要登记送货人员，收货时要登记收货人员。',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isMVPassbyParent',
      label: '平调从上级库走账',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: true,
      help: '勾选上之后，二级库之间的平级调拨，在调拨入库时，会同时产生发货二级库往上级库的退库出库、发货二级库往上级库的退库入库、上级库往收货二级库的调拨出库、上级库往收货二级库的调拨入库。',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isUseMonthlyWO',
      label: '是否启用月度请领计划',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: false,
      help: '勾选此项，在做请领申请时会检查请领是否超了月度请领计划的数量。',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isAutoCommitAutoMVOrder',
      label: '自动提交自动请领申请',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: false,
      help: () => {
        return h('div', {}, [
          h(
            'div',
            {},
            '勾选上之后，自动计划产生的向上级仓库的请领申请，生成之后即自动置为已提交（待审核）状态。',
          ),
          h(
            'div',
            {},
            '不勾选，则自动计划产生的向上级仓库的请领申请，生成之后是草案状态，需要人工做提交操作才会流转到上级仓库库管的审核页面。',
          ),
        ]);
      },
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isSOInOut',
      label: '科领自动出库',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: false,
      help: '勾选上此配置项，科室请领单据审核后，自动出库，不需要做出库指示、拣货操作。',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      dependencies: {
        triggerFields: [''],
        show: () => {
          return false;
        },
      },
    },
    {
      component: 'Switch',
      fieldName: 'isSOShipment',
      label: '启用科领送货流程',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: false,
      help: () => {
        return h('div', {}, [
          h(
            'div',
            {},
            '勾选上之后，对于科室请领，拣货出库之后，会产生送货单，库存状态是在途，需要科室做收货操作，收货之后扣减库存。',
          ),
          h(
            'div',
            {},
            '不勾选，则拣货出库之后，不产生送货单，科室不需要做收货操作，直接扣减库存。',
          ),
        ]);
      },
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      dependencies: {
        triggerFields: [''],
        show: () => {
          return false;
        },
      },
    },
    {
      component: 'Switch',
      fieldName: 'isBorrowMultiTimes',
      label: '允许多次借出',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: true,
      help: () => {
        return h('div', {}, [
          h(
            'div',
            {},
            '勾选上之后，允许同一个人在本仓库借出某商品之后，没有将剩余量或空瓶做回收登记的情况下，继续借出其他商品。',
          ),
          h(
            'div',
            {},
            '不勾选，则必须将前次领出的剩余量或空瓶做回收登记之后，才可继续借出其他商品。',
          ),
        ]);
      },
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      dependencies: {
        triggerFields: [''],
        show: () => {
          return false;
        },
      },
    },
    {
      component: 'ChcSelect',
      fieldName: 'srReceiveWay',
      label: '科退收货方式',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px] ',
      help: () => {
        return h('div', {}, [
          h('div', {}, '适用于科室请退的收货。'),
          h(
            'div',
            {},
            '人工验收+人工上架：收货和入库分为两步操作，第一步在收货页面做收货；第二步在入库确认页面做入库确认。入库确认之后才会生成入库单并增加库存。',
          ),
          h(
            'div',
            {},
            '人工验收+按行自动上架：收货和入库只需一步操作，在收货页面做收货，一行完成收货后，即自动完成入库确认，生成入库单并增加库存。',
          ),
          h(
            'div',
            {},
            '人工验收+整单自动上架：收货和入库只需一步操作，在收货页面做收货，一个到货通知单的所有行完成收货后，即自动完成入库确认，生成入库单并增加库存。',
          ),
          h(
            'div',
            {},
            '自动验收+自动上架：不需要做收货和入库操作，在收到到货通知单后，自动完成收货和入库确认，生成入库单并增加库存。',
          ),
        ]);
      },
      componentProps: () => {
        return {
          dictUrl:
            '/baseHandleAction/refList.do?id=M_Warehouse_Policy.srReceiveWay',
          placeholder: '请选择科退收货方式',
          paginate: false,
          autoChooseFirstOption: true,
          immediate: true,
          showChooseAll: false,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows || [] };
          },
        };
      },
      dependencies: {
        triggerFields: [''],
        show: () => {
          return false;
        },
      },
    },
    {
      component: 'Switch',
      fieldName: 'isAutoCommitCrossDocking',
      label: '请领转采购自动提交',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: true,
      help: '在勾选“请领转采购自动提交”的前提下，库备目录中请领转直配，生成的采购计划，会自动提交，否则会在待提交界面。',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isScatterAutoPickup',
      label: '散件自动拣货',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: false,
      help: '在勾选“散件自动拣货”的前提下，下达指示，散件无需拣货可直接出库。',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isUseParentWarehouseCatalog',
      label: '使用上级库备目录',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: false,
      help: '请领/调拨时是否启用上级仓库作为当前仓库的库备目录',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isThirdWarehouseAutoConsume',
      label: '无库备是否自动消耗',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: false,
      help: '无库备是否自动消耗',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isRestrictSpecialMVDrug',
      label: '是否限制特殊药品调拨',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: false,
      help: '是否限制特殊药品调拨',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
  ],
});
// 仓库
const [WarehouseForm, warehouseFormApi] = useVbenForm({
  commonConfig: {
    colon: true,
    componentProps: {
      class: 'w-full',
    },
    labelWidth: 200,
  },
  popupContainerClass: `warehouseForm`,
  layout: 'horizontal',
  actionWrapperClass: 'formActionAreaStyle',
  // 控制表单是否显示折叠按钮
  showCollapseButton: false,
  submitButtonOptions: {
    show: false,
  },
  resetButtonOptions: {
    show: false,
  },
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
  wrapperClass: 'grid-cols-2',
  schema: [
    {
      component: 'Switch',
      fieldName: 'isWarehouseProductControl',
      label: '启用仓库商品组控制',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: false,
      // help: '勾选此项，当勾选新品自动新增库备目录，和仓库维护里设置的<%管控类型%>组合起来使用，根据商品<%管控类型%>，自动添加到对应的仓库，新建请领和调拨单，会根据对应的<%管控类型%>过滤对应的品种',
      help: '勾选此项，当勾选新品自动新增库备目录，和仓库维护里设置的商品组组合起来使用，根据商品商品组，自动添加到对应的仓库，新建请领和调拨单，会根据对应的商品组过滤对应的品种',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isAutoAddNewProduct',
      label: '新品自动增加到仓库目录',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: false,
      help: '勾选上之后，对于新增的商品，会自动增加到对应仓库的仓库商品目录中。',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isUniqueProduct',
      label: '一级库品种唯一',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: true,
      help: '勾选此项，商品只允许添加到一个一级库的库备目录',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isMergeCreateInOut',
      label: '合并生成入库单',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: false,
      help: '勾选上此配置项，则在批量收货确认时，会把多个到货通知单产生的入库记录合并生成到一个入库单记录中。',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isBatchPackageReceive',
      label: '允许包装批量收货',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: true,
      help: '勾选上之后，对于包装管理的商品到货记录，允许不扫码收货，直接选中到货通知单行，进行批量收货，即自动将该行所有包装都完成收货。',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isAutoSplitMixed',
      label: '验收拼箱自动拆包',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: true,
      help: '勾选上之后，如果是拼箱的品种，收货的时候将自动拆包。',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      dependencies: {
        triggerFields: [''],
        show: () => {
          return false;
        },
      },
    },
    {
      component: 'Input',
      fieldName: 'emptyInventoryDays',
      label: '零库存动盘天数',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      help: '创建盘点计划时，对于当前库存为零的品种（或品种+批号），在设置天数之内有过库存变更的，会生成盘点任务。',
      componentProps: () => {
        return {
          placeholder: '请输入零库存动盘天数',
          maxlength: 20,
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'latestReceivedDays',
      label: '报溢最近入库天数',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      help: '此项输入天数，是指报溢单录入时，不允许针对该天数以外的入库单记录进行报溢，比如设置为60天，在报溢时，该品种只允许报溢60天以内有过入库记录的数据',
      componentProps: () => {
        return {
          placeholder: '请输入报溢最近入库天数',
          maxlength: 20,
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isAutoIndicator',
      label: '允许自动指示',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: false,
      help: '勾选上此配置项，则在基数药/大输液医嘱摆药单所有行需求数量小于20时,由系统自动执行摆药单指示。',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isAutoCommitInventory',
      label: '自动提交盈亏申请',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: false,
      help: '勾选此项，在盘点结果确认操作后，或在报损申请录入、报溢申请录入后，系统自动提交，无需手工再到报损申请提交和报溢申请提交菜单点提交操作。',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isInventoryByPlan',
      label: '盘点生成损溢单',
      formItemClass: 'col-span-1   pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: false,
      help: '盘点计划确认后，勾选此项的会生成损溢单，反之不会生成。',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isAutoConfirmInventoryPlan',
      label: '自动确认盘点结果',
      formItemClass: 'col-span-1 col-start-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: false,
      help: '勾选此项，在盘点结果录入操作后，系统自动确认，无需手工再到盘点结果确认菜单点确认操作',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'ChcSelect',
      fieldName: 'packageNoType',
      label: '包装号类型',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px] ',
      // TODO:未查询到
      help: '',
      componentProps: () => {
        return {
          dictUrl:
            '/baseHandleAction/refList.do?id=M_Warehouse_Policy.packageNoType',
          placeholder: '请选择包装号类型',
          paginate: false,
          autoChooseFirstOption: true,
          immediate: true,
          showChooseAll: false,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows || [] };
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isInCollect',
      label: '是否住院采集',
      formItemClass: 'col-span-1 col-start-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: false,
      // help: '勾选此项，在盘点结果录入操作后，系统自动确认，无需手工再到盘点结果确认菜单点确认操作',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isOutPatientCollect',
      label: '是否门诊采集',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: false,
      // help: '勾选此项，在盘点结果录入操作后，系统自动确认，无需手工再到盘点结果确认菜单点确认操作',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isMergeSpecialPick',
      label: '特殊医嘱是否合并拣货',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: false,
      // help: '勾选此项，在盘点结果录入操作后，系统自动确认，无需手工再到盘点结果确认菜单点确认操作',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isParentWarehouseInventory',
      label: '是否查看上级仓库库存',
      formItemClass: 'col-span-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: false,
      // help: '勾选此项，在盘点结果录入操作后，系统自动确认，无需手工再到盘点结果确认菜单点确认操作',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
  ],
});
const isSubmiting = ref(false);
const [ModalFirst, modalApi] = useVbenModal({
  showConfirmButton: true,
  confirmDisabled: false,
  showCancelButton: true,
  cancelText: '取消',
  confirmText: '提交',
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      currentTab.value = TabVal.Procurement;
      modalData.value = {};
      modalData.value = modalApi.getData<Record<string, any>>();
      console.warn('onOpenChange modalData', modalData.value);
      modalTitle.value = modalData.value.modalTitle || modalTitle.value;
      modalType.value = modalData.value.modalType || modalType.value;
      if (modalType.value === 'EDIT') {
        const rawRow = toRaw(modalData.value.row);
        for (const [key, value] of Object.entries(rawRow)) {
          if (value === 'Y') {
            rawRow[key] = true;
          } else if (value === 'N') {
            rawRow[key] = false;
          }
        }
        console.warn('rawRow', modalData.value, rawRow);
        setTimeout(() => {
          procurementFormApi.updateSchema([
            {
              fieldName: 'invoiceMethod',
              disabled: true,
            },
            {
              fieldName: 'settlementMode',
              disabled: true,
            },
          ]);
          commonFormApi.setValues({
            ...rawRow,
          });
          procurementFormApi.setValues({
            ...rawRow,
          });
          claimAndTransferFormApi.setValues({
            ...rawRow,
          });
          warehouseFormApi.setValues({
            ...rawRow,
          });
        }, 100);
      } else if (modalType.value === 'COPY') {
        const rawRow = toRaw(modalData.value.row);
        for (const [key, value] of Object.entries(rawRow)) {
          if (value === 'Y') {
            rawRow[key] = true;
          } else if (value === 'N') {
            rawRow[key] = false;
          }
        }
        rawRow.name = '';
        rawRow.description = '';
        setTimeout(() => {
          commonFormApi.setValues({
            ...rawRow,
          });
          procurementFormApi.setValues({
            ...rawRow,
          });
          claimAndTransferFormApi.setValues({
            ...rawRow,
          });
          warehouseFormApi.setValues({
            ...rawRow,
          });
        }, 100);
      } else {
        setTimeout(() => {
          procurementFormApi.updateSchema([
            {
              fieldName: 'invoiceMethod',
              disabled: false,
            },
            {
              fieldName: 'settlementMode',
              disabled: false,
            },
          ]);
        }, 100);
      }
    }
  },
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {
    if (isSubmiting.value) {
      message.warning('正在提交！');
      return false;
    }
    isSubmiting.value = true;
    const commonFormValues = await commonFormApi.getValues();
    console.warn('onConfirm commonFormValues', commonFormValues);
    if (!commonFormValues.name) {
      message.error('请输入名称');
      return;
    }
    // 采购
    const procurementFormValues = await procurementFormApi.getValues();
    //   请领/调拨
    const claimAndTransferFormValues =
      await claimAndTransferFormApi.getValues();
    // 仓库
    const warehouseFormValues = await warehouseFormApi.getValues();

    const params: Record<string, any> = {
      ...commonFormValues,
      ...procurementFormValues,
      ...claimAndTransferFormValues,
      ...warehouseFormValues,
    };
    if (modalType.value === 'EDIT') {
      params.warehousePolicyId = modalData.value?.row?.warehousePolicyId;
    }
    console.warn('params', params);
    try {
      await requestFormClient.post(
        '/warehouseAction/saveWarehousePolicy.do',
        params,
      );
      message.success('成功');
      modalApi.close();
      commonFormApi.resetForm();
      procurementFormApi.resetForm();
      claimAndTransferFormApi.resetForm();
      warehouseFormApi.resetForm();
      modalData.value?.callback();
    } catch (error) {
      console.error(error);
    } finally {
      isSubmiting.value = false;
    }
  },
});
</script>
<template>
  <ModalFirst :title="modalTitle" class="h-[750px] w-[950px]">
    <CommonForm />
    <RadioGroup
      v-model:value="currentTab"
      button-style="solid"
      data-testid="RadioGroup_currentTab_cuModal"
    >
      <template v-for="item in tabs" :key="item.value">
        <RadioButton
          :value="item.value"
          :data-testid="`RadioButton_${item.value}_cuModal`"
        >
          {{ item.label }}
        </RadioButton>
      </template>
    </RadioGroup>
    <div class="relative box-border h-[530px] w-full overflow-auto pt-[10px]">
      <ProcurementForm v-show="currentTab === TabVal.Procurement" />
      <ClaimAndTransferForm v-show="currentTab === TabVal.ClaimAndTransfer" />
      <WarehouseForm v-show="currentTab === TabVal.Warehouse" />
    </div>
  </ModalFirst>
</template>

<style scoped lang="less">
::v-deep(.ant-btn > svg) {
  margin-bottom: 4px;
  margin-left: -2px;
  // position: relative;
}
</style>
