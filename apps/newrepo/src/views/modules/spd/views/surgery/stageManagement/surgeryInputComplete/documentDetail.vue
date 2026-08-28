<script setup lang="ts">
import { h, nextTick, onMounted, ref, toRaw, watch } from 'vue';
import { useRoute } from 'vue-router';

import {
  SearchActionIcon,
  SvgDeleteIcon,
  SvgSaveIcon,
  UploadCloudIcon,
} from '@vben/chc-icons';
import { useVbenModal, z } from '@vben/common-ui';
import { VxeUI } from '@vben/plugins/vxe-table';

import { Button, Input, InputGroup, message, Modal, Tag } from 'ant-design-vue';

// import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { requestFormClient } from '#/api/request';
import { useSpdGrid } from '#/components/spd';
import { triggerArrowDown } from '#/utils/event';
import { handlePrice, handlePriceToFixedTwo } from '#/utils/util';

import batchAddModal from './modals/batchAddModal.vue';
import changeProductModalComp from './modals/changeProductModal.vue';
import DoctorAdviceModalComp from './modals/doctorAdviceModal.vue';

const route = useRoute();
const VxeSelect = VxeUI.getComponent('VxeSelect'); // 获取Vxe的select组件
const urlParams: any = route.meta?.urlParams || {}; // 路由中传递的参数
const currentTab = defineModel<number>('currentTab', { required: true }); // 当前所在tab
const currentHandleRow = defineModel<any>('currentHandleRow', {
  required: true,
}); // 当前正在处理的行数据
const detailConfig = defineModel<DetailInfo | undefined>('detailConfig'); // 详情页配置信息
const selectParams = ref<{ [key: string]: any }>({
  isSurgery: 'Y',
  warehouseId: currentHandleRow.value.warehouseId || undefined,
});
const warehouseName = ref(currentHandleRow.value.warehouseName);
const gridData = ref<any[]>([]); // 表格数据
// 生成表格组件和api
// useVbenVxeGrid
const [ChcGrid, chcGridApi, { ChangeProductModal, changeProductApi }] =
  useSpdGrid(
    {
      formOptions: {
        submitOnEnter: false,
        fieldMappingTime: [
          ['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD'],
        ],
        showCollapseButton: false,
        showDefaultActions: false,
        wrapperClass:
          'grid-cols-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  2xl:grid-cols-5',
        // wrapperClass:
        //   'grid-cols-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  2xl:grid-cols-5',
        compact: false,

        commonConfig: {
          labelClass: 'w-[80px]',
        },
      },
      gridOptions: {
        stripe: false,
        keyboardConfig: {
          isEdit: true,
        },
        size: 'small',
        editConfig: {
          enabled: detailConfig.value?.type !== 'view',
          mode: 'row',
          trigger: 'click',
          showStatus: false,
          showIcon: true,
          autoClear: true,
        },
        checkboxConfig: {
          trigger: 'default',
          highlight: false,
          // checkMethod: ({ row }: any) => {
          //   return row.orderPlanLineId;
          // },
        },
        radioConfig: {
          highlight: false,
        },
        keepSource: true,
        height: 'auto',
        pagerConfig: {
          enabled: false,
        },
        showOverflow: true,
        proxyConfig: {
          autoLoad: false,
        },
        border: true,
        cellConfig: {
          height: 32,
        },
        data: gridData.value,
        rowConfig: {
          isCurrent: false,
        },
        cellStyle(scope: any) {
          if (
            scope.column.field === 'qtyOrdered' ||
            scope.column.field === 'lot' ||
            scope.column.field === 'guaranteeDate' ||
            scope.column.field === 'serNo'
          ) {
            return {
              backgroundColor: '#D7FFF5',
            };
          }
          // if (
          //   scope.column.field === 'price' &&
          //   scope.row.price !== scope.row.priceList
          // ) {
          //   return {
          //     color: 'red',
          //   };
          // }
        },
        headerCellStyle({ column }: any) {
          if (
            column.field === 'qtyPlaned' ||
            column.field === 'vendorId' ||
            column.field === 'isGift'
          ) {
            return {
              // backgroundColor: '#D7FFF5',
              // color: '#000',
            };
          }
        },
      },
      gridEvents: {
        editActivated: (scope: any) => {
          vendorParams.value.productId = scope.row.productId;
          // 用于获取当前正在操作行和列的赋值
          currentEditRow.value = scope.row;
          currentField.value = scope.column.field;
        },
        editClosed: (scope: any) => {
          gridData.value[scope.$rowIndex] = toRaw(scope.row);
          // console.log('editClosed:');
          currentEditRow.value = undefined;
          currentField.value = '';
        },
      },
    },
    {
      gridColumns: [
        { type: 'checkbox', title: '', width: 40, align: 'center' },
        {
          title: '序号',
          type: 'seq',
          width: 40,
          align: 'center',
          sortable: true,
        },
        {
          field: 'productCode',
          title: '药品编码',
          minWidth: 120,
          // edit: 'ProductPopWin',
          slots: {
            default: 'productCode',
          },
        },
        { field: 'productName', title: '药品名称', minWidth: 150 },
        { field: 'productSpec', title: '规格', minWidth: 120 },
        { field: 'modelNo', title: '型号', minWidth: 120, visible: false },
        { field: 'uomName', title: '单位', minWidth: 70 },
        { field: 'manufacturer', title: '厂家', minWidth: 120 },
        {
          field: 'qtyOrdered',
          title: '数量',
          minWidth: 100,
          align: 'right',
          editRender: {
            name: 'VxeNumberInput',
            props: {
              type: 'integer',
              min: 0,
            },
            events: {
              change(scope: any, event: any) {
                const priceObj = handlePrice(scope.row.priceActual);
                scope.row.lineAmt =
                  (priceObj.val *
                    10 ** priceObj.numberCountAfterDot *
                    event.value) /
                  10 ** priceObj.numberCountAfterDot;
                // Math.round(scope.row.priceActual * event.value * 100) / 100;
                if (
                  Number.isNaN(scope.row.lineAmt) ||
                  scope.row.lineAmt === ''
                ) {
                  scope.row.lineAmt = 0;
                }
              },
            },
          },
          // edit: 'number',
          // verify: 'required|number',
        },
        {
          field: 'priceActual',
          title: '采购价',
          minWidth: 80,
          align: 'right',
          formatter({ row }: any) {
            return handlePriceToFixedTwo(row.priceActual);
          },
          // format: '0.00##',
        },
        {
          field: 'lineAmt',
          title: '金额',
          minWidth: 80,
          // hiden: true,
          // visible: false,
          align: 'right',
          formatter({ row }: any) {
            return handlePriceToFixedTwo(row.lineAmt);
          },
          // format: '0.00',
        },
        {
          field: 'vendorId',
          title: '供应商',
          minWidth: 120,
          formatter({ row }: any) {
            return row.vendorName;
          },
          editRender: {},
          slots: { edit: 'edit_vendorId' },
          // edit: 'select',
          // autoEdit: 'false',
          // addnull: 'false',
          // url: '/orderPlanAction/productVendor.do',
          // verify: 'required',
        },
        {
          field: 'lot',
          title: '批号',
          minWidth: 100,
          editRender: {
            name: 'VxeInput',
          },
          // edit: 'text'
        },
        {
          field: 'productionDate',
          title: '生产日期',
          minWidth: 100,
          editRender: {
            name: 'ChcDatePicker',
            props: {
              class: 'ChcSelect-productionDate',
              format: ['YYYY-MM-DD', 'YYYYMMDD'],
              valueFormat: 'YYYY-MM-DD', // HH:mm:ss
              getPopupContainer() {
                return document.querySelector(
                  '.editableTable .vxe-table--layout-wrapper', // .vxe-table--row-expanded-wrapper div  .sysUserTable
                );
              },
              onFocus() {
                // 手动触发键盘事件
                setTimeout(() => {
                  const el = document.querySelector(
                    `.ChcSelect-productionDate input`,
                  );
                  triggerArrowDown(el); // 手动触发一次下键，自动打开弹窗
                });
              },
            },
            autofocus: '.ant-picker-input input',
          },
          // edit: 'date',
        },
        {
          field: 'guaranteeDate',
          title: '效期',
          minWidth: 120,
          editRender: {
            name: 'ChcDatePicker',
            props: {
              class: 'ChcSelect-guaranteeDate',
              format: ['YYYY-MM-DD', 'YYYYMMDD'],
              valueFormat: 'YYYY-MM-DD', // HH:mm:ss
              getPopupContainer() {
                return document.querySelector(
                  '.editableTable .vxe-table--layout-wrapper', // .vxe-table--row-expanded-wrapper div  .sysUserTable
                );
              },
              onFocus() {
                // 手动触发键盘事件
                setTimeout(() => {
                  const el = document.querySelector(
                    `.ChcSelect-guaranteeDate input`,
                  );
                  triggerArrowDown(el); // 手动触发一次下键，自动打开弹窗
                });
              },
            },
            autofocus: '.ant-picker-input input',
          },
        },
        {
          field: 'serNo',
          title: 'UDI',
          editRender: {
            name: 'VxeInput',
            props: {
              placeholder: '请输入UDI',
            },
            events: {
              blur(scope: any, event: any) {
                if (event.value === scope.row.serNo) {
                  return null;
                }
                const params = {
                  udi: event.value,
                  productId: scope.row.productId,
                };
                // console.log('params:', scope.row.serNo);
                requestFormClient
                  .post('/uDIAction/saveProductUDI.do', params)
                  .then((result) => {
                    if (result.udi) {
                      // 解析后的UDI
                      if (result.udi.udi) {
                        scope.row.serNo = result.udi.udi;
                      }
                      if (result.udi.pi) {
                        // 批号
                        if (result.udi.lot) {
                          scope.row.lot = result.udi.lot;
                        }
                        // 效期
                        if (result.udi.guaranteeDate) {
                          scope.row.guaranteeDate = result.udi.guaranteeDate;
                        }
                        // 生产日期
                        if (result.udi.productionDate) {
                          scope.row.productionDate = result.udi.productionDate;
                        }
                        scope.row.qtyOrdered = 1;
                      }
                    }
                  });
              },
            },
          },
          // slots: {
          //   edit: 'serNo_edit',
          // },
          // edit: 'text',
          minWidth: 260,
        },
        {
          align: 'center',
          slots: { default: 'action' },
          fixed: 'right',
          headerAlign: 'center',
          showOverflow: false,
          title: '操作',
          width: detailConfig.value?.type === 'view' ? 90 : 85,
        },
      ],
      formSchema: [
        {
          component: 'ChcSelect',
          componentProps: () => {
            return {
              options: [
                { value: 'I', label: '住院' },
                { value: 'O', label: '门诊' },
              ],
              placeholder: '请选择患者类型',
              paginate: false,
              disabled: detailConfig.value?.type === 'view',
            };
          },
          defaultValue:
            detailConfig.value?.type === 'add'
              ? 'I'
              : currentHandleRow.value.patientClass || 'I',
          formItemClass: 'pb-1',
          fieldName: 'patientClass',
          label: '患者类型',
        },
        {
          component: h('div'),
          fieldName: '_divider1',
          formItemClass: 'col-span-full pb-0',
          hideLabel: true,
        },
        {
          component: 'Input',
          fieldName: 'patientCode',
          componentProps: {
            disabled: detailConfig.value?.type === 'view',
          },
          label: '患者编号',
          defaultValue:
            detailConfig.value?.type === 'add'
              ? undefined
              : currentHandleRow.value.patientCode || undefined,
          formItemClass: 'pb-1',
          rules: 'required',
        },
        {
          component: 'Input',
          fieldName: 'patientVisitCode',
          componentProps: {
            disabled: detailConfig.value?.type === 'view',
            async onPressEnter(e: KeyboardEvent) {
              console.warn('onPressEnter e:', e);
              // 无需处理直接改为输入
              // handlePatientVisitCodeEnter(e);
              console.warn(
                'onPressEnter handlePatientVisitCodeEnter',
                handlePatientVisitCodeEnter,
              );
            },
          },
          label: '医保卡号',
          defaultValue:
            detailConfig.value?.type === 'add'
              ? undefined
              : currentHandleRow.value.patientVisitCode || undefined,
          formItemClass: 'pb-1',
        },
        {
          component: 'ChcSelect',
          componentProps: () => {
            return {
              options: [
                { value: 'IP', label: '住院号' },
                { value: 'PI', label: '患者编号' },
                { value: 'OP', label: '就诊卡号' },
              ],
              placeholder: '请选择编号类型',
              paginate: false,
              disabled: detailConfig.value?.type === 'view',
            };
          },
          defaultValue:
            detailConfig.value?.type === 'add'
              ? 'IP'
              : currentHandleRow.value.patientVisitCodeType || 'IP',
          formItemClass: 'pb-1',
          fieldName: 'patientVisitCodeType',
          label: '编号类型',
        },
        {
          component: 'ChcSelect',
          componentProps: () => {
            return {
              options: [
                { value: '', label: '无' },
                { value: '1', label: '临时' },
                { value: '0', label: '长期' },
              ],
              placeholder: '请选择编号类型',
              paginate: false,
              disabled: detailConfig.value?.type === 'view',
            };
          },
          defaultValue:
            detailConfig.value?.type === 'add'
              ? ''
              : currentHandleRow.value.adviceType || '',
          formItemClass: 'pb-1',
          fieldName: 'adviceType',
          label: '医嘱类型',
        },
        {
          component: 'Input',
          fieldName: 'patientName',
          componentProps: {
            disabled: detailConfig.value?.type === 'view',
          },
          label: '患者姓名',
          defaultValue:
            detailConfig.value?.type === 'add'
              ? undefined
              : currentHandleRow.value.patientName || undefined,
          formItemClass: 'pb-1',
          rules: 'required',
        },
        {
          component: 'Input',
          fieldName: 'patientVisitNumber',
          // componentProps: {
          //   disabled: detailConfig.value?.type === 'view',
          // },
          dependencies: {
            triggerFields: ['patientName'],
            show() {
              return false;
            },
          },
          label: '患者姓名',
          defaultValue:
            detailConfig.value?.type === 'add'
              ? '0'
              : currentHandleRow.value.patientVisitNumber || '0',
          formItemClass: 'pb-1',
        },
        {
          component: 'Input',
          fieldName: 'patientPhoneNo',
          componentProps: {
            disabled: detailConfig.value?.type === 'view',
          },
          label: '联系方式',
          defaultValue:
            detailConfig.value?.type === 'add'
              ? undefined
              : currentHandleRow.value.patientPhoneNo || undefined,
          formItemClass: 'pb-1',
        },
        {
          component: 'Input',
          fieldName: 'patientAddress',
          componentProps: {
            disabled: detailConfig.value?.type === 'view',
          },
          label: '联系地址',
          defaultValue:
            detailConfig.value?.type === 'add'
              ? undefined
              : currentHandleRow.value.patientAddress || undefined,
          formItemClass: 'pb-1',
        },
        {
          component: h('div'),
          fieldName: '_divider',
          formItemClass: 'col-span-full pb-1',
          hideLabel: true,
        },
        {
          component: 'ChcSelect',
          componentProps: () => {
            return {
              dictUrl:
                '/baseHandleAction/listDepBpartner.do?accessAll=Y&departmentType=1',
              placeholder: '请选择执行科室',
              paginate: false,
              immediate: true,
              labelField: 'name',
              valueField: 'id',
              showChooseAll: false,
              afterFetch(res: any) {
                return { ...res, rows: undefined, records: res.rows };
              },
              onChange() {
                checkIfCanAddRow();
              },
              allowClear: true,
            };
          },
          defaultValue:
            detailConfig.value?.type === 'add'
              ? undefined
              : currentHandleRow.value.treatmentApplyBpartnerId || undefined,
          fieldName: 'applyBPartnerId',
          label: '执行科室',
          formItemClass: 'pb-1',
          rules: z
            .any()
            .refine((v) => v !== undefined && v !== null && v !== '', {
              message: ' ',
            }),
        },
        {
          component: 'ChcSelect',
          componentProps: () => {
            return {
              dictUrl:
                '/baseHandleAction/listDepBpartner.do?accessAll=Y&departmentType=1',
              placeholder: '请选择开单科室',
              paginate: false,
              // showChooseAll: '',
              immediate: true,
              labelField: 'name',
              valueField: 'id',
              showChooseAll: false,
              afterFetch(res: any) {
                return { ...res, rows: undefined, records: res.rows };
              },
              allowClear: true,
            };
          },
          defaultValue:
            detailConfig.value?.type === 'add'
              ? undefined
              : currentHandleRow.value.treatmentBpatnerId || undefined,
          fieldName: 'surgeryBpartnerId',
          label: '开单科室',
          formItemClass: 'pb-1',
          rules: z
            .any()
            .refine((v) => v !== undefined && v !== null && v !== '', {
              message: ' ',
            }),
        },
        {
          component: h('div'),
          fieldName: '_divider1',
          formItemClass: 'col-span-full pb-1',
          hideLabel: true,
        },
        {
          component: 'ChcSelect',
          componentProps: () => {
            return {
              dictUrl: '/baseHandleAction/warehouse.do?accessAll=Y&level1=N',
              placeholder: '请选择执行仓库',
              paginate: false,
              immediate: true,
              labelField: 'name',
              valueField: 'id',
              showChooseAll: false,
              afterFetch(res: any) {
                return { ...res, rows: undefined, records: res.rows };
              },
              onChange() {
                checkIfCanAddRow();
              },
              allowClear: true,
            };
          },
          defaultValue:
            detailConfig.value?.type === 'add'
              ? undefined
              : currentHandleRow.value.applyWarehouseId || undefined,
          fieldName: 'applyWarehouseId',
          label: '执行仓库',
          formItemClass: 'pb-1',
          rules: z
            .any()
            .refine((v) => v !== undefined && v !== null && v !== '', {
              message: ' ',
            }),
        },
        {
          component: 'ChcSelect',
          componentProps: () => {
            return {
              dictUrl:
                '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
              placeholder: '请选择院区',
              paginate: false,
              showChooseAll: false,
              chooseAllLabel: '请选择',
              immediate: true,
              labelField: 'name',
              valueField: 'id',
              allowClear: true,
              afterFetch(res: any) {
                return { ...res, rows: undefined, records: res.rows };
              },
            };
          },
          defaultValue:
            detailConfig.value?.type === 'add'
              ? undefined
              : currentHandleRow.value.departmentId || undefined,
          fieldName: 'departmentId',
          label: '院区',
          formItemClass: 'pb-1',
        },
        {
          component: 'ChcSelect',
          componentProps: () => {
            return {
              dictUrl:
                '/baseHandleAction/warehouse.do?accessAll=Y&level1=Y&regionId={{departmentId}}',
              placeholder: '请选择采购仓库',
              paginate: false,
              immediate: false,
              labelField: 'name',
              showChooseAll: false,
              onChange(val: any, option: any) {
                selectParams.value.warehouseId = val || undefined;
                warehouseName.value = val ? option.label : '';
                checkIfCanAddRow();
              },
              valueField: 'id',
              afterFetch(res: any) {
                return { ...res, rows: undefined, records: res.rows };
              },
              allowClear: true,
            };
          },
          dependencies: {
            triggerFields: ['departmentId'],
            async trigger(values: any) {
              // console.warn('baseFormApi', baseFormApi);
              await nextTick();
              if (
                chcGridApi.formApi?.getFieldComponentRef &&
                typeof chcGridApi.formApi?.getFieldComponentRef ===
                  'function' &&
                chcGridApi.formApi?.getFieldComponentRef('warehouseId') &&
                (
                  chcGridApi.formApi.getFieldComponentRef(
                    'warehouseId',
                  ) as SelectComponentRef
                ).params
              ) {
                (
                  chcGridApi.formApi.getFieldComponentRef(
                    'warehouseId',
                  ) as SelectComponentRef
                ).params!.dependencies = {
                  departmentId: values.departmentId,
                };
                (
                  chcGridApi.formApi?.getFieldComponentRef(
                    'warehouseId',
                  ) as SelectComponentRef
                ).fetchApi!();
                values.warehouseId &&
                  chcGridApi.formApi?.setFieldValue('warehouseId', undefined);
              }
            },
          },
          // defaultValue:
          //   detailConfig.value?.type === 'add'
          //     ? undefined
          //     : currentHandleRow.value.warehouseId,
          fieldName: 'warehouseId',
          label: '采购仓库',
          formItemClass: 'pb-1',
          rules: z
            .any()
            .refine((v) => v !== undefined && v !== null && v !== '', {
              message: ' ',
            }),
        },
        {
          component: 'DatePicker',
          fieldName: 'surgeryTime',
          label: '手术时间',
          componentProps: () => {
            return {
              valueFormat: 'YYYY-MM-DD',
            };
          },
          defaultValue:
            detailConfig.value?.type === 'add'
              ? undefined
              : currentHandleRow.value.surgeryTime || undefined,
          formItemClass: 'pb-1',
        },
        {
          component: 'Input',
          fieldName: 'surgeryno',
          componentProps: {
            disabled: detailConfig.value?.type === 'view',
          },
          label: '手术编号',
          defaultValue:
            detailConfig.value?.type === 'add'
              ? undefined
              : currentHandleRow.value.surgeryno || undefined,
          formItemClass: 'pb-1',
        },
        {
          component: 'ChcSelect',
          componentProps: () => {
            return {
              dictUrl: '/baseHandleAction/listDepBpartnerAccessUser.do',
              placeholder: '请选择主刀医生',
              paginate: false,
              immediate: true,
              labelField: 'name',
              valueField: 'id',
              showChooseAll: false,
              afterFetch(res: any) {
                return { ...res, rows: undefined, records: res.rows };
              },
              allowClear: true,
            };
          },
          defaultValue:
            detailConfig.value?.type === 'add'
              ? undefined
              : currentHandleRow.value.indicateDoctorUserId || undefined,
          fieldName: 'indicateDoctorUserId',
          label: '主刀医生',
          formItemClass: 'pb-1',
          rules: z
            .any()
            .refine((v) => v !== undefined && v !== null && v !== '', {
              message: ' ',
            }),
        },
        {
          component: 'Input',
          fieldName: 'bedNo',
          componentProps: {
            disabled: detailConfig.value?.type === 'view',
          },
          label: '床位',
          defaultValue:
            detailConfig.value?.type === 'add'
              ? undefined
              : currentHandleRow.value.bedNo || undefined,
          formItemClass: 'pb-1',
        },
        {
          component: 'Input',
          fieldName: 'diagnosis',
          componentProps: {
            disabled: detailConfig.value?.type === 'view',
          },
          label: '医嘱',
          defaultValue:
            detailConfig.value?.type === 'add'
              ? undefined
              : currentHandleRow.value.diagnosis || undefined,
          formItemClass: 'pb-1',
        },
        {
          component: 'Input',
          fieldName: 'description',
          componentProps: {
            disabled: detailConfig.value?.type === 'view',
          },
          label: '备注',
          defaultValue:
            detailConfig.value?.type === 'add'
              ? undefined
              : currentHandleRow.value.description || undefined,
          formItemClass: 'pb-1',
        },
      ],
      customModals: {
        'ChangeProductModal-changeProductApi': {
          connectedComponent: changeProductModalComp,
        },
      },
    },
  );
const originRows = ref<any[]>([]);
const removedRows = ref<any[]>([]);
const currentEditRow = ref<any>(); // 当前正在操作的行
const currentField = ref(''); // 当前正在操作的列field
const [BatchAddModal, batchAddModalApi] = useVbenModal({
  connectedComponent: batchAddModal,
});
console.warn('batchAddModalApi', batchAddModalApi);
// 医保卡号
const handlePatientVisitCodeEnter = async (e: KeyboardEvent) => {
  // e.preventDefault();
  // console.log((e.target as HTMLInputElement).value);

  const formValues = await chcGridApi.formApi.getValues();
  // const patientCode = formValues.patientVisitCode;
  const patientCode = (e.target as HTMLInputElement).value;
  chcGridApi.formApi.setFieldValue('patientCode', patientCode);
  let patientClass = formValues.patientClass;
  const patientVisitCodeType = formValues.patientVisitCodeType;
  const adviceType = formValues.adviceType;
  if (!adviceType) {
    return message.error('请选择医嘱类型');
  }
  const params = {
    queryPriority: patientVisitCodeType,
    queryCode: patientCode,
    adviceType,
    patientClass,
  };
  requestFormClient
    .post('/hisAction/queryDoctorAdvice.do', params)
    .then((result) => {
      const row = result.rows[0];
      if (row && row.patient) {
        if (row.patient.intergration !== false) {
          chcGridApi.formApi.setFieldValue(
            'patientName',
            row.patient.patientName,
          );
          chcGridApi.formApi.setFieldValue(
            'patientCode',
            row.patient.patientId,
          );
          chcGridApi.formApi.setFieldValue(
            'patientAddress',
            row.patient.address,
          );
          chcGridApi.formApi.setFieldValue(
            'patientPhoneNo',
            row.patient.mobile,
          );
          chcGridApi.formApi.setFieldValue('bedNo', row.patient.bedNo);
          chcGridApi.formApi.setFieldValue(
            'patientVisitNumber',
            row.patient.patientVisitNumber,
          );
          patientClass = row.patient.patientClass;
          // 设置开单科室和开单人
          if (row.advice && row.advice.lines && row.advice.lines.length > 0) {
            // cons
            doctorAdviceModalApi
              .setData({
                callback(data: any) {
                  if (formValues.diagnosis) {
                    chcGridApi.formApi.setFieldValue(
                      'diagnosis',
                      data.adviceNo,
                    );
                    chcGridApi.formApi.setFieldValue('adviceNo', data.adviceNo);
                    chcGridApi.formApi.setFieldValue(
                      'doctorName',
                      data.zdysName,
                    );
                    chcGridApi.formApi.setFieldValue('surgeryTime', data.sssj);
                  }
                  if (data.bpartnerId) {
                    // const has = $(
                    //   `#surgeryBpartnerId option[value=${data.bpartnerId}]`,
                    // ).length;
                    // if (has > 0) {
                    //   $('#surgeryBpartnerId').setValue(
                    //     data.bpartnerId,
                    //   );
                    // } else {
                    //   const url =
                    //     '/baseHandleAction/listDepBpartner.do?accessAll=Y';
                    //   $('#surgeryBpartnerId').attr('url', url);
                    //   App.loadSelectData($('#bpartnerId'), () => {
                    //     $('#surgeryBpartnerId').setValue(
                    //       data.bpartnerId,
                    //     );
                    //   });
                    // }
                  }
                },
              })
              .open();
          } else {
            chcGridApi.formApi.setFieldValue('diagnosis', '');
            chcGridApi.formApi.setFieldValue('adviceNo', '');
            chcGridApi.formApi.setFieldValue('doctorName', '');
            chcGridApi.formApi.setFieldValue('surgeryTime', '');
          }
        }
      } else {
        message.error('无患者信息');
      }
    });
};
// 点击删除按钮
const handleDeleteRow = async (scope: any) => {
  // 先同步表格数据
  const handleDelete = () => {
    return new Promise((resolve) => {
      (async () => {
        // 标记 remove 列表
        if (scope.row.orderId) {
          removedRows.value.push(scope.row);
        }
        gridData.value.splice(scope.$rowIndex, 1);

        resolve(true);
      })();
    });
  };
  // 删除的就是当前操作行 或者 在非编辑状态点击删除，直接删
  await handleDelete();
};
// const chcSelectRef = ref(); // 商品选择下拉组件
// const getAddRowByChoosedRow = (record: any) => {
//   // if (urlParams.isPackaged === 'N') {
//   //   const editRow = { ...record };
//   //   editRow.qtyPlaned = record.qtyOnHand;
//   //   return { ...editRow };
//   // } else {
//   //   const editRow = { ...record };
//   //   editRow.qtyPlaned = record.qtyOnHand;
//   //   editRow.packagePlaned = record.packageCount;
//   //   return { ...editRow };
//   // }
//   return { ...record };
// };
// // 批量删除方法
// const handleBatchDel = async () => {
//   if (chcGridApi.grid.getCheckboxRecords().length === 0) {
//     return message.error('请选中行数据');
//   }
//   function batchDel() {
//     const delRows: any[] = chcGridApi.grid
//       .getCheckboxRecords()
//       .map((item: any) => {
//         return toRaw(item);
//       });
//     delRows.forEach((item) => {
//       const index = gridData.value.findIndex((itemIn) => {
//         return itemIn._X_ROW_KEY === item._X_ROW_KEY;
//       });
//       if (item.orderId) {
//         removedRows.value.push(item);
//       }
//       gridData.value.splice(index, 1);
//     });
//   }
//   batchDel();
// };
// // 选择一个商品
// const handleChoose = async (_: any, option: any) => {
//   await nextTick();
//   chcSelectRef.value.modelValue = undefined; // 清空下拉组件
//   handleAddOneRow(option);
// };
// const handleAddOneRow = (option: any) => {
//   return new Promise((resolve) => {
//     const record = getAddRowByChoosedRow(option);
//     const editRecord: { [key: string]: any } = {};
//     editRecord.productId = record.productId;
//     editRecord.productCode = record.productCode;
//     editRecord.productName = record.productName;
//     editRecord.productSpec = record.productSpec;
//     editRecord.modelNo = record.modelNo;
//     editRecord.manufacturer = record.manufacturer;
//     editRecord.lPackageQty = record.lPackageQty;
//     editRecord.mPackageQty = record.mPackageQty;
//     editRecord.uomId = record.uomId;
//     editRecord.uomName = record.uomName;
//     editRecord.markCode = record.markCode;
//     requestFormClient
//       .post('/orderPlanAction/queryStorage.do', {
//         productId: editRecord.productId,
//         warehouseId: selectParams.value.warehouseId,
//       })
//       .then(async (result) => {
//         // console.log(result);
//         // 执行成功会写单据编号
//         editRecord.defaultVendorId = result.vendorId;
//         // F类采购计划采购价固定为0
//         editRecord.pricePo = result.pricePo;
//         editRecord.vendorId = result.vendorId;
//         editRecord.vendorName = result.vendorName;
//         editRecord.priceActual = result.pricePo;
//         editRecord.qtyOnHand = result.qtyOnHand;
//         editRecord.qtyOrdered = result.qtyOrdered;
//         editRecord.level_Day = result.level_Day;
//         editRecord.level_Max = result.level_Max;
//         editRecord.level_Min = result.level_Min;
//         editRecord.level_Replenish = result.level_Replenish;
//         editRecord.lineAmt =
//           Math.round(editRecord.priceActual * editRecord.qtyOrdered * 100) /
//           100;
//         if (Number.isNaN(editRecord.lineAmt) || editRecord.lineAmt === '') {
//           editRecord.lineAmt = 0;
//         }
//         const newRow = await chcGridApi.grid.createRow(editRecord);
//         gridData.value.push(newRow);
//         resolve(newRow);
//       });
//   });
// };
// // 点击批量添加按钮
// const handleBatchAdd = async () => {
//   function handleOpenAddModal() {
//     chcGridApi.formApi.getValues().then((res: any) => {
//       batchAddModalApi!
//         .setData({
//           warehouseId: res.warehouseId,
//           handleBatchChoose,
//         })
//         .open();
//     });
//   }
//   handleOpenAddModal();
// };
// 处理批量添加事件
// const handleBatchChoose = async (records: any[]) => {
//   for (const [, record__] of records.entries()) {
//     await handleAddOneRow(record__);
//     // const record = getAddRowByChoosedRow(record__);
//     // const newRow = await chcGridApi.grid.createRow(record);
//     // gridData.value.push(newRow);
//   }
// };

// 右下角全部 保存 提交 返回功能
const totalHandleLoading = ref(false); // 整体操作loading控制
// 整体保存
const handleTotalSave = async (doCommit: boolean) => {
  const formValues = await chcGridApi.formApi.getValues();
  if (!formValues.applyWarehouseId || formValues.applyWarehouseId === '') {
    return message.error('执行仓库不可为空!');
  }
  if (!formValues.applyBPartnerId || formValues.applyBPartnerId === '') {
    return message.error('执行科室不可为空!');
  }
  if (!formValues.surgeryBpartnerId || formValues.surgeryBpartnerId === '') {
    return message.error('开单科室不可为空!');
  }
  if (!formValues.warehouseId || formValues.warehouseId === '') {
    return message.error('采购仓库不可为空!');
  }
  if (
    !formValues.indicateDoctorUserId ||
    formValues.indicateDoctorUserId === ''
  ) {
    return message.error('主刀医生不可为空!');
  }
  if (
    formValues.adviceNo && // 如果存在医嘱，则需要判断手术时间和主刀医生
    !formValues.surgeryTime
  ) {
    return message.error('手术时间不可为空!');
  }
  if (!formValues.patientCode) {
    return message.error('请在患者编号输入框输入回车后获取患者信息!');
  }
  if (!formValues.patientName) {
    return message.error('患者姓名不可为空!');
  }

  const params = {
    ...formValues,
    // warehouseId: formValues.applyWarehouseId,
    // fromWarehouseId: formValues.warehouseId,
  };
  console.warn('提交 params', params);
  console.warn('提交 formValues', formValues);
  let error = false;
  const created: any[] = [];
  const updated: any[] = [];
  const records = chcGridApi.grid.getFullData();
  let total = 0;
  console.warn('提交 records', records);
  records.forEach((record: any, index: number) => {
    if (!record.qtyOrdered) {
      error = true;
      return message.error(`第${index + 1}行: 缺少数量！`);
    }
    if (record.qtyOrdered <= 0) {
      error = true;
      return message.error(`第${index + 1}行: 数量不能小于0！`);
    }
    if (record.qtyOrdered > 1e6) {
      error = true;
      return message.error(`第${index + 1}行: 数量不能大于100万！`);
    }
    if (!record.priceActual) {
      error = true;
      return message.error(`第${index + 1}行: 缺少价格！`);
    }
    if (urlParams.isFree && record.priceActual !== 0) {
      error = true;
      return message.error(`第${index + 1}行: 价格不等于0！`);
    } else if (!urlParams.isFree && record.priceActual < 0) {
      error = true;
      return message.error(`第${index + 1}行: 价格不能小于0！`);
    }
    if (record.priceActual > 1e6) {
      error = true;
      return message.error(`第${index + 1}行: 价格不能大于100万！`);
    }
    if (!record.vendorId) {
      error = true;
      return message.error(`第${index + 1}行缺少供应商！`);
    }
    if (!record.lot) {
      error = true;
      return message.error(`第${index + 1}行: 缺少批号！`);
    }
    if (!record.serNo) {
      error = true;
      return message.error(`第${index + 1}行: 缺少厂家码！`);
    }

    if (record.orderLineId) {
      updated.push(toRaw(record));
    } else {
      created.push(toRaw(record));
    }
    total += record.lineAmt;
  });
  if (error) {
    return false;
  }
  if (
    created.length === 0 &&
    updated.length === 0 &&
    removedRows.value.length === 0
  ) {
    return message.error('请输入商品明细！');
  }
  const lineData = {
    created,
    updated,
    removed: removedRows.value,
  };
  console.warn('提交 lineData', lineData);
  params.receiptType = currentHandleRow.value.receiptType || '1';
  params.orderId = currentHandleRow.value.orderId || 0;
  params.type = 'warehouse';
  params.doctorOrderNo = formValues.adviceNo;
  params.billType = formValues.patientClass;
  params.surgeryBpartnerId = formValues.surgeryBpartnerId;
  params.patientVisitCode = formValues.patientVisitCode;
  params.orderType = 'PO';
  params.isSurgery = 'Y';
  params.bpartnerId = getVendorId();
  if (!params.bpartnerId) {
    return;
  }
  params.lineData = JSON.stringify(lineData);
  console.warn('提交 params', params);
  if (doCommit) {
    params.doCommit = 'Y';
    Modal.confirm({
      title: '提示',
      content: [
        h('p', {}, `仓库：${warehouseName.value}`),
        h('p', {}, `行数：${records.length}`),
        h('p', {}, `金额:${total}元`),
      ],
      okText: '确认',
      cancelText: '取消',
      onOk() {
        totalHandleLoading.value = true;
        requestFormClient
          .post('orderAction/save.do', params)
          .then(() => {
            message.success('提交成功');
            totalHandleLoading.value = false;
            currentTab.value = 0;
          })
          .catch(() => {
            totalHandleLoading.value = false;
          });
      },
      onCancel() {},
    });
  } else {
    totalHandleLoading.value = true;
    requestFormClient
      .post('orderAction/save.do', params)
      .then(() => {
        message.success('保存成功');
        totalHandleLoading.value = false;
        currentTab.value = 0;
      })
      .catch(() => {
        totalHandleLoading.value = false;
      });
  }
};
const getVendorId = () => {
  const records = chcGridApi.grid.getFullData();
  const vendorJson: { [key: string]: any } = {};
  records.forEach((record: any) => {
    if (record.vendorId) {
      vendorJson[record.vendorId] = 1;
    }
  });
  const len = Object.keys(vendorJson).length;
  if (len > 1) {
    return message.error('存在多个供应商！');
  }
  return records[0].vendorId;
};

const [DoctorAdviceModal, doctorAdviceModalApi] = useVbenModal({
  connectedComponent: DoctorAdviceModalComp,
});

// 页面初始化加载行数据以及黑名单数据
onMounted(async () => {
  if (currentHandleRow.value.orderId) {
    requestFormClient
      .post(
        `/orderAction/queryLine.do?orderId=${currentHandleRow.value.orderId}`,
        {},
      )
      .then((res) => {
        originRows.value = res.rows;
        gridData.value.push(...res.rows);
      });
  }
  await nextTick();
  if (detailConfig.value?.type !== 'add') {
    chcGridApi.formApi.setFieldValue(
      'warehouseId',
      currentHandleRow.value.warehouseId,
    );
  }
  checkIfCanAddRow();
});
// 一下处理是否能添加逻辑
const canAddRow = ref(false);
const checkIfCanAddRow = async () => {
  await nextTick();
  const formValues = await chcGridApi.formApi.getValues();
  // 判断 采购仓库 执行仓库 执行科室这仨是否有值，有值才能添加
  canAddRow.value = !!(
    formValues.warehouseId &&
    formValues.applyWarehouseId &&
    formValues.applyBPartnerId
  );
};
// 供应商下拉数据源
const vendorOptions = ref<any[]>([]);
const vendorParams = ref<any>({
  productId: undefined,
}); // 用于查询供应商下拉列表的入参
// 监控供应商下拉值改变 同时改变该行数据的 vendorName 字段
const handleVendorChange = (val: any, scope: any) => {
  scope.row.vendorName = vendorOptions.value.find((item) => {
    return item.value === val.value;
  }).label;
};
// 监听当前编辑行的变化，只要当前编辑行发生改变，就重新查询供应商下拉数据
watch(
  () => currentEditRow.value,
  (val) => {
    if (val) {
      requestFormClient
        .post('/orderPlanAction/productVendor.do', vendorParams.value)
        .then((res) => {
          vendorOptions.value = res.rows.map((item: any) => {
            return {
              ...item,
              label: item.name,
              value: item.id,
            };
          });
        });
    }
  },
);
const scanUdiRef = ref();
const productMsg = ref('');
const lotInfo = ref('');
const handleScanUDI = async (e: KeyboardEvent) => {
  // console.log((e.target as HTMLInputElement).value);
  const formValues = await chcGridApi.formApi.getValues();
  if (!formValues.applyBPartnerId) {
    return message.error('请选择执行科室');
  }
  const udiCode = (e.target as HTMLInputElement).value;
  const params: { [key: string]: any } = { udi: udiCode };
  params.warehouseId = formValues.applyWarehouseId;
  params.isSurgery = 'Y';
  requestFormClient.post('uDIAction/queryUDIInfo.do', params).then((result) => {
    refreshRecord(result.udi, result.product, result.storage);
    if (result.productMsg) {
      productMsg.value = result.productMsg;
    }
  });
};
const refreshRecord = async (udi: any, product: any, storage: any) => {
  const tableData = chcGridApi.grid.getFullData();
  if (tableData.length >= 0) {
    // 取第一行，看看是不是信息不全
    let record = tableData[0];
    // 行为空，或者行信息全都需要新增行
    if (
      tableData.length === 0 ||
      (record.productId && record.pi) ||
      (record.serNo && record.serNo.length > 0)
    ) {
      // 新增一行
      record = {};
    }
    if (!record.productId && product) {
      record.di = udi.preDi || udi.di;
      record.productId = product.productId;
      record.productCode = product.productCode;
      record.productName = product.productName;
      record.productSpec = product.productSpec;
      record.modelNo = product.modelNo;
      record.manufacturer = product.manufacturer;
      record.lPackageQty = product.lPackageQty;
      record.mPackageQty = product.mPackageQty;
      record.uomId = product.uomId;
      record.uomName = product.uomName;
      record.markCode = product.markCode;
    }
    if (!record.vendorId && storage) {
      record.defaultVendorId = storage.vendorId;
      // F类采购计划采购价固定为0
      record.pricePo = storage.pricePo;
      record.priceActual = storage.pricePo;
      record.vendorId = storage.vendorId;
      record.vendorName = storage.vendorName;
      record.price = urlParams.isFree ? 0 : storage.pricePo;
      record.qtyOnHand = storage.qtyOnHand;
      record.qtyOrdered = storage.qtyOrdered;
      record.level_Day = storage.level_Day;
      record.level_Max = storage.level_Max;
      record.level_Min = storage.level_Min;
      record.level_Replenish = storage.level_Replenish;
      if (Number.isNaN(record.lineAmt) || record.lineAmt === '') {
        record.lineAmt = 0;
      }

      if (record.productId && !record.vendorId) {
        return message.error(`${record.productName}缺少协议供应商！`);
        // App.errorMsg(`${record.productName}缺少协议供应商！`, true, () => {
        //   $('#udiCode').select();
        // });
      }
    }
    if (udi.pi && udi) {
      record.pi = udi.prePi || udi.pi;
      record.lot = udi.lot || '';
      record.guaranteeDate = udi.guaranteeDate || '';
      record.productionDate = udi.productionDate || '';
      record.sn = udi.sn;
    }
    record.qtyOrdered = 1;
    if (record.priceActual) {
      record.lineAmt =
        Math.round(record.priceActual * record.qtyOrdered * 100) / 100;
    }
    let thisUdi = '';
    if (record.di && record.pi) {
      thisUdi = record.di + record.pi;
    }
    if (udi.di && udi.pi) {
      thisUdi = udi.udi;
    }
    if (!record.pi && !udi.pi) {
      productMsg.value = '请继续扫描PI码';
    }
    if (!record.di && !udi.di) {
      productMsg.value = '请继续扫描DI码';
    }
    if (record.di && record.pi) {
      productMsg.value = '';
      record.serNo = thisUdi;
    }
    if (record.lot || record.guaranteeDate || record.productionDate) {
      let info = '';
      if (!record.lot) {
        record.lot = '';
      }
      if (!record.guaranteeDate) {
        record.guaranteeDate = '';
      }
      if (!record.productionDate) {
        record.productionDate = '';
      }
      info = `批号：${record.lot},效期：${record.guaranteeDate},生产日期：${
        record.productionDate
      }`;
      lotInfo.value = info;
    }
    // 只输入了商品信息
    if (record.productId && !record.pi) {
      lotInfo.value = '';
    }
    //  $('#udiCode').select();
    if (!record._X_ROW_KEY) {
      const newRow = await chcGridApi.grid.createRow(record);
      gridData.value.unshift(newRow);
    }
  }
};
// 修改商品
const handleChangeProduct = async (row: any) => {
  const formValues = await chcGridApi.formApi.getValues();
  console.warn('handleChangeProduct formValues', formValues);
  if (!formValues.warehouseId || formValues.warehouseId === '0') {
    message.error('请选择采购仓库');
    return;
  }
  if (!formValues.applyWarehouseId || formValues.applyWarehouseId === '0') {
    message.error('请选择执行仓库');
    return;
  }
  if (!formValues.applyBPartnerId) {
    message.error('请选择执行科室');
    return;
  }
  console.warn('handleChangeProduct row', row);

  changeProductApi
    ?.setData({
      tableQueryExtraParams: {
        warehouseId: formValues.warehouseId,
        fromWarehouseId: formValues.warehouseId,
        isSurgery: 'Y',
      },
      callback(checkedRow: any) {
        modifyGridDataAfterChangeProduct(row, checkedRow);
      },
    })
    .open();
};
const modifyGridDataAfterChangeProduct = async (row: any, checkedRow: any) => {
  console.warn('modifyGridDataAfterChangeProduct row', row);
  console.warn('modifyGridDataAfterChangeProduct checkedRow', checkedRow);

  const d1: Record<string, any> = {
    productId: checkedRow.productId,
    productCode: checkedRow.productCode,
    productName: checkedRow.productName,
    productSpec: checkedRow.productSpec,
    modelNo: checkedRow.modelNo,
    manufacturer: checkedRow.manufacturer,
    lPackageQty: checkedRow.lPackageQty,
    mPackageQty: checkedRow.mPackageQty,
    uomId: checkedRow.uomId,
    uomName: checkedRow.uomName,
    markCode: checkedRow.markCode,
  };
  const formValues = await chcGridApi.formApi.getValues();
  try {
    const res = await requestFormClient.post(
      '/orderPlanAction/queryStorage.do',
      {
        productId: checkedRow.productId,
        warehouseId: formValues.warehouseId,
      },
    );
    const lineAmt = Math.round(res.priceActual * res.qtyOrdered * 100) / 100;
    const vendorId = res.vendorId;
    const productName = d1.productName;
    const d2: Record<string, any> = {
      ...d1,
      defaultVendorId: res.vendorId,
      // F类采购计划采购价固定为0
      pricePo: res.pricePo,
      vendorId: res.vendorId,
      vendorName: res.vendorName,
      priceActual: res.pricePo,
      qtyOnHand: res.qtyOnHand,
      qtyOrdered: res.qtyOrdered,
      level_Day: res.level_Day,
      level_Max: res.level_Max,
      level_Min: res.level_Min,
      level_Replenish: res.level_Replenish,
      lineAmt: Number.isNaN(lineAmt) ? 0 : lineAmt,
    };
    Object.keys(d2).forEach((key) => {
      row[key] = d2[key];
    });
    if (!vendorId) {
      message.error(`${productName}缺少协议供应商！`);
    }
  } catch (error) {
    console.error('modifyGridDataAfterChangeProduct error', error);
  }
};
</script>
<template>
  <div class="h-full">
    <DoctorAdviceModal />
    <BatchAddModal />
    <ChangeProductModal />
    <ChcGrid class="editableTable">
      <template #productCode="scope">
        <InputGroup compact>
          <Input
            v-model:value="scope.row.productCode"
            class="readOnly"
            disabled
            style="width: calc(100% - 28px)"
            :data-testid="`input_productCode_${scope.rowIndex}_documentDetail`"
          />
          <Button
            @click="handleChangeProduct(scope.row)"
            :data-testid="`button_changeProduct_${scope.rowIndex}_documentDetail`"
          >
            <template #icon>
              <SearchActionIcon />
            </template>
          </Button>
        </InputGroup>
      </template>
      <template #edit_vendorId="scope">
        <VxeSelect
          v-model="scope.row.vendorId"
          :options="vendorOptions"
          @change="handleVendorChange($event, scope)"
          :data-testid="`select_vendorChange_${scope.rowIndex}_documentDetail`"
        />
      </template>
      <template #toolbar-actions v-if="detailConfig?.type !== 'view'">
        <!-- <ChcSelect
          :autofocus="true"
          ref="chcSelectRef"
          :disabled="!canAddRow"
          placeholder="请输入物资编码、产品名称、规格、型号"
          class="mr-[0.5rem] w-[380px]"
          dict-url="/productAction/query.do"
          popup-class-name="productSelection"
          api-type="post"
              request-content-type="application/x-www-form-urlencoded"
          :page-size="10"
          :immediate="false"
          :extra-params="selectParams"
          :filter-by-front-end="false"
          :show-search="true"
          @change="handleChoose"
          filter-field="productName"
          :handle-params="
            (params: any) => {
              return {
                ...params,
                current: undefined,
                pageNum: params.current,
                pageSize: params.size,
                size: undefined,
              };
            }
          "
          label-field="productName"
          value-field="productCode"
          :after-fetch="
            (res: any) => {
              return { ...res, rows: undefined, records: res.rows };
            }
          "
          :option-columns="[
            {
              header: '商品编码',
              name: 'productCode',
              width: 80,
            },
            {
              header: '商品名称',
              name: 'productName',
              width: 140,
            },
            {
              header: '规格',
              name: 'productSpec',
              width: 60,
            },
            {
              header: '型号',
              name: 'modelNo',
              width: 80,
            },
            {
              header: '厂家',
              name: 'manufacturer',
              width: 100,
            },
            {
              header: '单位',
              name: 'uomName',
              width: 60,
            },
            {
              header: '采购价',
              name: 'pricePO',
              width: 90,
            },
            {
              header: '库存',
              name: 'storageQty',
              width: 60,
            },
            {
              header: '商品组',
              name: 'productControlLevelName',
              width: 80,
            },
          ]"
        /> -->
        <Input
          placeholder="请扫描UDI编码"
          @press-enter="handleScanUDI"
          ref="scanUdiRef"
          class="mr-[0.5rem] w-[240px]"
          data-testid="input_scanUdi_documentDetail"
        />
        <Tag v-if="productMsg" color="#f50">{{ productMsg }}</Tag>
        <Tag v-if="lotInfo" color="#87d068">{{ lotInfo }}</Tag>
        <!-- <Button
          type="primary"
          @click="handleBatchAdd"
          class="mr-[0.5rem]"
          :disabled="!canAddRow"
        >
          批量添加
          <template #icon>
            <AddActionIcon />
          </template>
        </Button>
        <Button type="primary" @click="handleBatchDel" class="mr-[0.5rem]">
          批量删除
          <template #icon>
            <SvgDeleteIcon />
          </template>
        </Button> -->
      </template>
      <template #action="scope">
        <Button
          type="primary"
          ghost
          danger
          @click="handleDeleteRow(scope)"
          :loading="scope.row.loading"
          class="h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          v-if="detailConfig?.type !== 'view'"
          :data-testid="`button_deleteRow_${scope.rowIndex}_documentDetail`"
        >
          删行
          <template #icon>
            <SvgDeleteIcon />
          </template>
        </Button>
      </template>
      <template #bottom>
        <div class="flex items-center justify-center pt-[10px]">
          <div class="flex gap-[10px]">
            <Button
              type="primary"
              @click="handleTotalSave(false)"
              :loading="totalHandleLoading"
              v-if="detailConfig?.type !== 'view'"
              data-testid="button_save_documentDetail"
            >
              保存
              <template #icon>
                <SvgSaveIcon />
              </template>
            </Button>
            <Button
              type="primary"
              @click="handleTotalSave(true)"
              :loading="totalHandleLoading"
              v-if="detailConfig?.type !== 'view'"
              data-testid="button_submit_documentDetail"
            >
              提交
              <template #icon>
                <UploadCloudIcon />
              </template>
            </Button>
          </div>
        </div>
      </template>
    </ChcGrid>
  </div>
</template>
<style scoped>
::v-deep(.vxe-grid--form-wrapper form div.grid) {
  padding-bottom: 0.5rem;
}

::v-deep(.vxe-tools--wrapper .ant-input) {
  padding: 2px 7px;
}
</style>
