import { createEditableGrid, useEditableApi } from '@vben/chc-ui';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

const env = import.meta.env.PROD ? 'prod' : 'dev';
const appVersion = import.meta.env.VITE_APP_VERSION;
const namespace = `${import.meta.env.VITE_APP_NAMESPACE}-${appVersion}-${env}`;
const useEditableGrid = createEditableGrid(useVbenVxeGrid, namespace);
export { useEditableApi, useEditableGrid };

// import type { ComputedRef, Ref } from 'vue';

// import type { VbenVxeGridProps } from '#/adapter/vxe-table';

// import { nextTick, ref } from 'vue';

// import { message } from 'ant-design-vue';

// import { useVbenVxeGrid } from '#/adapter/vxe-table';
// import { promiseController } from '#/utils/util';

// export const useEditableApi = <T extends string>({
//   chcGridApi,
//   gridData,
//   dataValidate,
//   saveRow,
//   deleteRow,
//   // openSelect,
//   handleOpenBatchAddModal,
//   batchDel,
//   totalSave,
//   totalSubmit,
//   getAddRowData,
//   validateIfCanAddRow,
//   ROWKEYFIELD = 'id',
//   editFieldArr,
//   hasSavedRowKey = 'orderPlanLineId',
//   beforeDropdownVisible,
// }: {
//   batchDel: () => void; // 批量删除方法
//   beforeDropdownVisible?: () => void;
//   chcGridApi: Ref<any>; // 表格api
//   dataValidate: (scope: any) => Promise<any>; // 校验行数据方法
//   deleteRow: (row: any) => Promise<any>;
//   editFieldArr: ComputedRef<string[]>;
//   getAddRowData: (option: any, formValue: any) => Promise<any>;
//   gridData: Ref<any[]>; // 表格数据
//   handleOpenBatchAddModal: () => void;
//   hasSavedRowKey?: string; // 当前行保存后的行唯一key值
//   // openSelect: () => void;
//   ROWKEYFIELD: string; // 表格行的唯一键
//   saveRow: (row: any) => Promise<any>; // 保存行数据方法
//   totalSave: () => void; // 整体保存方法
//   totalSubmit: () => void;
//   validateIfCanAddRow?: () => Promise<boolean>;
// }) => {
//   const totalHandleLoading = ref(false); // 整体操作loading控制
//   const selectOpen = ref(false); // 商品下拉是否显示
//   const chcSelectRef = ref(); // 商品选择下拉组件
//   const isOut = ref(false); // 编辑项是否越界
//   const currentFocus = ref(''); // 当前正在聚焦项
//   const blackList = ref<any[]>([]); // 用于设置下拉不可选的黑名单列表
//   const currentEditRow = ref<any>(); // 当前正在操作的行
//   const isActive = ref(true); // 当前页面是否是激活状态，用于在keepalive场景下，避免反复触发editClose事件
//   const currentInsertRows = ref<any[]>([]); // 当前插入的临时数据行
//   const currentUpdateRows = ref<any[]>([]); // 当前有更新的数据行
//   const autoSaveController = ref<'error' | 'onSaving' | 'wait'>('wait'); // 自动保存控制字段， error上一轮保存报错了 onSaving上一轮还在保存中 wait上一轮保存结束，等待下一次保存
//   const isOnEnterSave = ref(false); // 是否是回车保存
//   async function handleEditClose({ row }: any) {
//     if (!isActive.value) return;
//     currentInsertRows.value = chcGridApi.value.grid.getInsertRecords();
//     currentUpdateRows.value = chcGridApi.value.grid.getUpdateRecords();
//     if (autoSaveController.value === 'onSaving') {
//       currentEditRow.value = undefined;
//     } else {
//       autoSaveController.value = 'onSaving';
//       if (
//         chcGridApi.value.grid.isInsertByRow(row) ||
//         chcGridApi.value.grid.isUpdateByRow(row)
//       ) {
//         currentEditRow.value = undefined;
//         // 对该行数据进行保存
//         const [res] = await promiseController(handleSaveRow, {
//           $grid: chcGridApi.value.grid,
//           row,
//         });
//         if (res) {
//           autoSaveController.value = 'wait';
//           currentInsertRows.value = [];
//           currentUpdateRows.value = [];
//         } else {
//           autoSaveController.value = 'error';
//           currentInsertRows.value = [];
//           currentUpdateRows.value = [];
//         }
//       } else {
//         autoSaveController.value = 'wait';
//       }
//     }
//   }
//   function handleEditActivated(scope: any) {
//     // 用于获取当前正在操作行和列的赋值
//     currentEditRow.value = scope.row;
//   }
//   async function handleChoose(val: any, option: any) {
//     selectOpen.value = false;
//     if (validateIfCanAddRow && typeof validateIfCanAddRow === 'function') {
//       const result = await validateIfCanAddRow();
//       if (!result) {
//         return;
//       }
//     }
//     if (chcGridApi.value.grid.getInsertRecords().length > 0) {
//       await nextTick();
//       chcSelectRef.value.modelValue = undefined;
//       message.warn('当前表格存在未保存行，请保存后再添加！');
//     } else if (chcGridApi.value.grid.getUpdateRecords().length > 0) {
//       await nextTick();
//       chcSelectRef.value.modelValue = undefined;
//       message.warn('当前表格存在未保存数据，请保存后再添加！');
//     } else {
//       // 先往黑名单里加数据，放后面会造成表格新增数据异常
//       blackList.value.push(val);
//       await nextTick();
//       chcSelectRef.value.modelValue = undefined; // 清空下拉组件
//       const formValue = await chcGridApi.value.formApi.getValues();
//       const record = await getAddRowData(option, formValue);
//       const { row: newRow } = await chcGridApi.value.grid.insertAt(record, -1);
//       chcGridApi.value.grid.setEditRow(newRow, true);
//     }
//   }
//   async function handleBatchChoose(records: any[]) {
//     blackList.value = [
//       ...blackList.value,
//       ...records.map((item) => item[ROWKEYFIELD]),
//     ];
//     const formValue = await chcGridApi.value.formApi.getValues();
//     let newRow = null;
//     for (const [i, record__] of records.entries()) {
//       const record = await getAddRowData(record__, formValue);
//       if (i === 0) {
//         const midRow = await chcGridApi.value.grid.insertAt(record, -1);
//         newRow = midRow.row;
//       } else {
//         await chcGridApi.value.grid.insertAt(record, -1);
//       }
//     }
//     chcGridApi.value.grid.setEditRow(newRow, true);
//   }
//   function handleSaveRow(scope: any) {
//     return new Promise((resolve, reject) => {
//       dataValidate(scope)
//         .then(() => {
//           scope.row.loading = true;
//           saveRow(scope.row)
//             .then(async (res: any) => {
//               scope.row.loading = false;
//               for (const key in res) {
//                 scope.row[key] = res[key];
//               }
//               const insertRows = chcGridApi.value.grid.getInsertRecords();
//               await scope.$grid.clearEdit();
//               // debugger;
//               if (insertRows.length === 0) {
//                 // 当前表格没有插入的临时数据
//                 const index = gridData.value.findIndex(
//                   (item) => item[ROWKEYFIELD] === scope.row[ROWKEYFIELD],
//                 );
//                 gridData.value[index] = scope.row;
//                 isOnEnterSave.value && openSelect();
//                 isOnEnterSave.value = false;
//               } else if (insertRows.length === 1) {
//                 // 当前表格新插入的临时数据只有一条
//                 if (scope.$grid.isInsertByRow(scope.row)) {
//                   // 操作的正是这条临时数据
//                   const newRow = await scope.$grid.createRow(scope.row);
//                   gridData.value.push(newRow);
//                   isOnEnterSave.value && openSelect();
//                   isOnEnterSave.value = false;
//                 } else {
//                   // 操作的不是这条临时数据
//                   const index = gridData.value.findIndex(
//                     (item) => item[ROWKEYFIELD] === scope.row[ROWKEYFIELD],
//                   );
//                   gridData.value[index] = scope.row;
//                   // 再将临时数据插回去
//                   const insertRow = await handleInsertRowsPromise(scope.row);
//                   scope.$grid.setEditRow(insertRow, true);
//                   isOnEnterSave.value = false;
//                 }
//               } else {
//                 // 当前表格有多条插入的临时数据
//                 if (scope.$grid.isInsertByRow(scope.row)) {
//                   // 操作的正是这些临时数据中的一条
//                   const newRow = await scope.$grid.createRow(scope.row);
//                   gridData.value.push(newRow);
//                   // 再将其余临时数据插回去
//                   const insertRow = await handleInsertRowsPromise(scope.row);
//                   scope.$grid.setEditRow(insertRow, true);
//                   isOnEnterSave.value = false;
//                 } else {
//                   // 操作的不是临时数据
//                   const index = gridData.value.findIndex(
//                     (item) => item[ROWKEYFIELD] === scope.row[ROWKEYFIELD],
//                   );
//                   gridData.value[index] = scope.row;
//                   // 再将其余临时数据插回去
//                   const insertRow = await handleInsertRowsPromise(scope.row);
//                   scope.$grid.setEditRow(insertRow, true);
//                   isOnEnterSave.value = false;
//                 }
//               }
//               resolve(res);
//             })
//             .catch(async (error) => {
//               isOnEnterSave.value = false;
//               scope.row.loading = false;
//               await scope.$grid.setEditRow(scope.row, true);
//               // 继续编辑当前行
//               reject(error);
//             });
//         })
//         .catch(async (error) => {
//           isOnEnterSave.value = false;
//           scope.row.loading = false;
//           await scope.$grid.setEditRow(scope.row, true);
//           // 继续编辑当前行
//           reject(error);
//         });
//     });
//   }
//   // 通过promise控制临时数据行重新插入
//   function handleInsertRowsPromise(row: any) {
//     return new Promise((resolve) => {
//       // 将非当前操作行数据，重新插入表格，并开启新的行编辑
//       const insertRows = chcGridApi.value.grid.getInsertRecords();
//       let newRow: any = null;
//       setTimeout(async () => {
//         const midRows = insertRows.filter(
//           (item: any) => item[ROWKEYFIELD] !== row[ROWKEYFIELD],
//         );

//         for (const [i, midRow_] of midRows.entries()) {
//           const midRow = await chcGridApi.value.grid.insertAt(midRow_, -1);
//           if (i === 0) {
//             newRow = midRow.row;
//           }
//         }
//         resolve(newRow);
//       }, 0);
//     });
//   }
//   // 点击删除按钮
//   async function handleDeleteRow(scope: any) {
//     const handleDelete = () => {
//       return new Promise((resolve) => {
//         (async () => {
//           const insertRows = chcGridApi.value.grid.getInsertRecords();
//           if (scope.row[hasSavedRowKey]) {
//             scope.row.loading = true;
//             // 先调接口删行
//             await deleteRow(scope.row);
//             scope.row.loading = false;
//           }
//           function handleInsertRows() {
//             // 将非当前操作行数据，重新插入表格，并开启新的行编辑
//             return new Promise((resolve) => {
//               let newRow: any = null;
//               setTimeout(async () => {
//                 const midRows = insertRows.filter(
//                   (item: any) => item[ROWKEYFIELD] !== scope.row[ROWKEYFIELD],
//                 );
//                 if (midRows.length > 0) {
//                   for (const [i, midRow_] of midRows.entries()) {
//                     const midRow = await chcGridApi.value.grid.insertAt(
//                       midRow_,
//                       -1,
//                     );
//                     if (i === 0) {
//                       newRow = midRow.row;
//                     }
//                   }
//                   // 聚焦到新插入的数据继续编辑
//                   chcGridApi.value.grid.setEditRow(newRow, true);
//                 }
//                 resolve(true);
//               }, 200);
//             });
//           }

//           if (scope.$grid.isInsertByRow(scope.row)) {
//             // 当前删除的是插入的临时行
//             blackList.value = blackList.value.filter(
//               (item) => item !== scope.row[ROWKEYFIELD],
//             );
//             scope.$grid.remove(scope.row);
//             // scope.$grid.remove(scope.row);
//             await handleInsertRows();
//           } else {
//             // 当前删除的不是临时行
//             blackList.value = blackList.value.filter(
//               (item) => item !== scope.row[ROWKEYFIELD],
//             );
//             gridData.value.splice(scope.$rowIndex, 1);
//             await handleInsertRows();
//           }
//           resolve(true);
//         })();
//       });
//     };
//     // 删除的就是当前操作行 或者 在非编辑状态点击删除，直接删
//     autoSaveController.value = 'onSaving';
//     await scope.$grid.clearEdit();
//     await handleDelete();
//     autoSaveController.value = 'wait';
//     return null;
//   }
//   // 监听一个简单ref数据值的变化，变化后才能继续往下走
//   const listenDataChangePromise = (
//     listenData: Ref, // 监听的数据
//     timeout: number = 2000, // 超时时间
//     interval: number = 33, // 轮询间隔
//   ) => {
//     return new Promise((resolve, reject) => {
//       // console.log('初始值：', listenData.value);
//       const originData = listenData.value;
//       if (originData === 'onSaving') {
//         let nowUseTime = 0;
//         // 轮询监控某个响应数据是否改变，改变了就resolve(true)，2s钟内未改变，resolve(false)
//         const timer = setInterval(() => {
//           nowUseTime += interval;
//           if (originData !== listenData.value && listenData.value === 'wait') {
//             clearInterval(timer);
//             resolve(true);
//           } else if (
//             originData !== listenData.value &&
//             listenData.value === 'error'
//           ) {
//             clearInterval(timer);
//             reject(new Error('保存失败'));
//           } else if (nowUseTime > timeout) {
//             listenData.value = 'wait';
//             clearInterval(timer);
//             resolve(false);
//             // reject(new Error('超时'));
//             // listenData.value = 'wait';
//           }
//         }, interval);
//       } else {
//         resolve(true);
//       }
//     });
//   };
//   const handleBatchAdd = async () => {
//     if (
//       chcGridApi.value.grid.getInsertRecords().length === 1 ||
//       currentInsertRows.value.length === 1
//     ) {
//       // 此时在保存后直接整个保存
//       chcGridApi.value.grid.clearEdit();
//       await listenDataChangePromise(autoSaveController); // 此处监听autoSave变成true的节点，也就是行保存结束的节点
//       // console.log('开始整体保存');
//       handleOpenBatchAddModal();
//     } else if (
//       chcGridApi.value.grid.getUpdateRecords().length === 1 ||
//       currentUpdateRows.value.length === 1
//     ) {
//       // 此时在保存后直接整个保存
//       chcGridApi.value.grid.clearEdit();
//       await listenDataChangePromise(autoSaveController); // 此处监听autoSave变成true的节点，也就是行保存结束的节点
//       // console.log('开始整体保存');
//       handleOpenBatchAddModal();
//     } else {
//       if (
//         chcGridApi.value.grid.getInsertRecords().length > 0 ||
//         currentInsertRows.value.length > 0
//       ) {
//         await nextTick();
//         // chcSelectRef.value.modelValue = undefined;
//         message.warn('当前表格存在未保存行，请保存后再添加！');
//       } else if (
//         chcGridApi.value.grid.getUpdateRecords().length > 0 ||
//         currentUpdateRows.value.length > 0
//       ) {
//         await nextTick();
//         // chcSelectRef.value.modelValue = undefined;
//         message.warn('当前表格存在未保存数据，请保存后再添加！');
//       } else {
//         handleOpenBatchAddModal();
//       }
//     }
//   };
//   function handleEditItemFocus(field: T) {
//     // console.log('handleEditItemFocus', field);
//     currentFocus.value = field;
//     // if (isOnDriving.value) {
//     //   switch (field) {
//     //     case 'isGift': {
//     //       driverObj.value!.drive(5);

//     //       break;
//     //     }
//     //     case 'qtyPlaned': {
//     //       driverObj.value!.drive(3);

//     //       break;
//     //     }
//     //     case 'vendorId': {
//     //       driverObj.value!.drive(4);

//     //       break;
//     //     }
//     //     // No default
//     //   }
//     // }
//   }
//   const openSelect = () => {
//     chcSelectRef.value.focus();
//     chcSelectRef.value.fetchApi(true);
//   };
//   // 添加自定义的键盘事件
//   const handleKeyBoard = async (e: KeyboardEvent) => {
//     if (e.ctrlKey && e.code === 'KeyF') {
//       e.preventDefault();
//       if (chcGridApi.value.grid.getInsertRecords().length > 0) {
//         chcGridApi.value.grid.setEditRow(
//           chcGridApi.value.grid.getInsertRecords()[0],
//           true,
//         );
//       } else if (chcGridApi.value.grid.getUpdateRecords().length > 0) {
//         chcGridApi.value.grid.setEditRow(
//           chcGridApi.value.grid.getUpdateRecords()[0],
//           true,
//         );
//       } else {
//         return openSelect();
//       }
//     }
//     // 当前有正在编辑行，然后点击delete按钮，删除该行
//     if (
//       e.code === 'Delete' &&
//       currentEditRow.value &&
//       chcGridApi.value.grid.isEditByRow(currentEditRow.value)
//     ) {
//       e.preventDefault();
//       handleDeleteRow({
//         row: currentEditRow.value,
//         $grid: chcGridApi.value.grid,
//       });
//     }
//     // 当前有正在编辑行，然后点击enter按钮，退出编辑
//     if (
//       e.key === 'Enter' &&
//       currentEditRow.value &&
//       chcGridApi.value.grid.isEditByRow(currentEditRow.value)
//     ) {
//       e.preventDefault();
//       isOnEnterSave.value = true;
//       await chcGridApi.value.grid.clearEdit();
//     }
//     const $grid = chcGridApi.value.grid;
//     if (
//       e.code === 'Tab' &&
//       currentEditRow.value &&
//       $grid?.isEditByRow(currentEditRow.value)
//     ) {
//       if (
//         currentFocus.value ===
//           editFieldArr.value[editFieldArr.value.length - 1] &&
//         !e.shiftKey &&
//         !isOut.value
//       ) {
//         e.preventDefault();
//         isOut.value = true;
//         // 越界了，处理再次打开编辑逻辑
//       } else if (
//         currentFocus.value === editFieldArr.value[0] &&
//         e.shiftKey &&
//         !isOut.value
//       ) {
//         e.preventDefault();
//         // 越界了，处理再次打开编辑逻辑
//         isOut.value = true;
//       } else if (
//         currentFocus.value ===
//           editFieldArr.value[editFieldArr.value.length - 1] &&
//         !e.shiftKey &&
//         isOut.value
//       ) {
//         $grid.setEditCell(
//           currentEditRow.value,
//           editFieldArr.value[0] as string,
//         );
//         isOut.value = false;
//       } else if (
//         currentFocus.value === editFieldArr.value[0] &&
//         e.shiftKey &&
//         isOut.value
//       ) {
//         $grid.setEditCell(
//           currentEditRow.value,
//           editFieldArr.value[editFieldArr.value.length - 1] as string,
//         );
//         isOut.value = false;
//       }
//     }
//     // 当前没在做编辑操作
//     // if (e.key === 'Enter' && !currentEditRow.value && !searchFocus.value) {
//     //   e.preventDefault();
//     //   chcSelectRef.value.focus();
//     // }
//     // 物资下拉打开时点击右箭头
//     if (e.code === 'ArrowRight' && selectOpen.value) {
//       e.preventDefault();
//       chcSelectRef.value.pageChange(chcSelectRef.value.params.current + 1);
//     }
//     // 物资下拉打开时点击左箭头
//     if (e.code === 'ArrowLeft' && selectOpen.value) {
//       e.preventDefault();
//       chcSelectRef.value.pageChange(chcSelectRef.value.params.current - 1);
//     }
//   };
//   async function handleTotalSave() {
//     if (
//       chcGridApi.value.grid.getInsertRecords().length === 1 ||
//       currentInsertRows.value.length === 1
//     ) {
//       // 此时在保存后直接整个保存
//       chcGridApi.value.grid.clearEdit();
//       await listenDataChangePromise(autoSaveController); // 此处监听autoSave变成true的节点，也就是行保存结束的节点
//       // console.log('开始整体保存');
//       totalSave();
//     } else if (
//       chcGridApi.value.grid.getUpdateRecords().length === 1 ||
//       currentUpdateRows.value.length === 1
//     ) {
//       // 此时在保存后直接整个保存
//       chcGridApi.value.grid.clearEdit();
//       await listenDataChangePromise(autoSaveController); // 此处监听autoSave变成true的节点，也就是行保存结束的节点
//       // console.log('开始整体保存');
//       totalSave();
//     } else {
//       chcGridApi.value.grid.clearEdit();
//       if (
//         chcGridApi.value.grid.getInsertRecords().length > 0 ||
//         currentInsertRows.value.length > 0
//       ) {
//         return message.error('当前表格存在新增行未保存，请保存后再操作！');
//       } else if (
//         chcGridApi.value.grid.getUpdateRecords().length > 0 ||
//         currentUpdateRows.value.length > 0
//       ) {
//         return message.error('当前表格存在未保存信息，请保存后再操作！');
//       }
//       totalSave();
//     }
//   }
//   async function handleTotalSubmit() {
//     if (
//       chcGridApi.value.grid.getInsertRecords().length === 1 ||
//       currentInsertRows.value.length === 1
//     ) {
//       // 此时在保存后直接整个保存
//       chcGridApi.value.grid.clearEdit();
//       await listenDataChangePromise(autoSaveController); // 此处监听autoSave变成true的节点，也就是行保存结束的节点
//       // console.log('开始整体提交');
//       totalSubmit();
//     } else if (
//       chcGridApi.value.grid.getUpdateRecords().length === 1 ||
//       currentUpdateRows.value.length === 1
//     ) {
//       // 此时在保存后直接整个保存
//       chcGridApi.value.grid.clearEdit();
//       await listenDataChangePromise(autoSaveController); // 此处监听autoSave变成true的节点，也就是行保存结束的节点
//       // console.log('开始整体提交');
//       totalSubmit();
//     } else {
//       chcGridApi.value.grid.clearEdit();
//       if (
//         chcGridApi.value.grid.getInsertRecords().length > 0 ||
//         currentInsertRows.value.length > 0
//       ) {
//         return message.error('当前表格存在新增行未保存，请保存后再操作！');
//       } else if (
//         chcGridApi.value.grid.getUpdateRecords().length > 0 ||
//         currentUpdateRows.value.length > 0
//       ) {
//         return message.error('当前表格存在未保存信息，请保存后再操作！');
//       }
//       if (gridData.value.length === 0) {
//         return message.error('请添加数据后再提交！');
//       }
//       totalSubmit();
//     }
//   }
//   async function handleBatchDel() {
//     if (chcGridApi.value.grid.getCheckboxRecords().length === 0) {
//       return message.error('请选中行数据');
//     }

//     if (
//       chcGridApi.value.grid.getInsertRecords().length === 1 ||
//       currentInsertRows.value.length === 1
//     ) {
//       // 此时在保存后直接整个保存
//       chcGridApi.value.grid.clearEdit();
//       await listenDataChangePromise(autoSaveController); // 此处监听autoSave变成true的节点，也就是行保存结束的节点
//       // console.log('开始整体提交');
//       batchDel();
//     } else if (
//       chcGridApi.value.grid.getUpdateRecords().length === 1 ||
//       currentUpdateRows.value.length === 1
//     ) {
//       // 此时在保存后直接整个保存
//       chcGridApi.value.grid.clearEdit();
//       await listenDataChangePromise(autoSaveController); // 此处监听autoSave变成true的节点，也就是行保存结束的节点
//       // console.log('开始整体提交');
//       batchDel();
//     } else {
//       chcGridApi.value.grid.clearEdit();
//       if (
//         chcGridApi.value.grid.getInsertRecords().length > 0 ||
//         currentInsertRows.value.length > 0
//       ) {
//         return message.error('当前表格存在新增行未保存，请保存后再操作！');
//       } else if (
//         chcGridApi.value.grid.getUpdateRecords().length > 0 ||
//         currentUpdateRows.value.length > 0
//       ) {
//         return message.error('当前表格存在未保存信息，请保存后再操作！');
//       }
//       if (gridData.value.length === 0) {
//         return message.error('请添加数据后再提交！');
//       }
//       batchDel();
//     }
//   }
//   const handleDropdownVisibleChange = (open: boolean) => {
//     selectOpen.value = !!open;
//     beforeDropdownVisible?.();
//   };
//   function getVxeNumIptProps(field: T, cb: (currentRow: any) => void) {
//     return {
//       type: 'integer',
//       min: 0,
//       controlConfig: {
//         enabled: false,
//         isArrow: false,
//       },
//       class: 'driver_qtyPlaned',
//       controls: true,
//       onFocus() {
//         handleEditItemFocus(field);
//       },
//       onKeydown(e: KeyboardEvent) {
//         (e.code === 'ArrowUp' || e.code === 'ArrowDown') && e.preventDefault();
//         if (
//           chcGridApi.value.grid.getEditCell() &&
//           chcGridApi.value.grid.getEditCell().row
//         ) {
//           const currentRow = chcGridApi.value.grid.getEditCell().row;
//           if (!currentRow) return null;
//           if (e.code === 'ArrowUp') {
//             currentRow[field] = currentRow[field] + 1;
//           } else if (e.code === 'ArrowDown') {
//             currentRow[field] = currentRow[field] - 1;
//             if (currentRow[field] <= 0) {
//               currentRow[field] = 0;
//             }
//           }
//           cb(currentRow);
//         }
//       },
//       onChange() {
//         if (
//           chcGridApi.value.grid.getEditCell() &&
//           chcGridApi.value.grid.getEditCell().row
//         ) {
//           const currentRow = chcGridApi.value.grid.getEditCell().row;
//           if (!currentRow) return null;
//           cb(currentRow);
//         }
//       },
//     };
//   }
//   return {
//     handleEditClose, // 处理编辑结束事件
//     handleEditActivated, // 处理激活编辑事件
//     handleChoose, // 处理下拉选择添加一行
//     handleBatchChoose, // 处理批量添加
//     handleDeleteRow, // 处理删除行事件
//     isActive, // 在开启keepalive场景下，当前页面是否是激活状态
//     blackList, // 下拉列表的黑名单，处在该名单中的项无法被重复选择
//     currentEditRow, // 当前正在编辑的行
//     autoSaveController, // 自动保存控制字段， error上一轮保存报错了 onSaving上一轮还在保存中 wait上一轮保存结束，等待下一次保存
//     handleBatchAdd, // 点击批量添加按钮回调方法
//     currentFocus, // 当前正在编辑的field项
//     handleEditItemFocus, // field项的聚焦回调
//     handleKeyBoard, // 键盘事件回调
//     chcSelectRef, // 下拉组件实例
//     selectOpen, // 下拉组件是否处于下拉打开状态
//     isOut, // 聚焦情况是否越界
//     totalHandleLoading, // 整体保存和提交按钮loading状态
//     handleTotalSave, // 点击整体保存按钮回调
//     handleTotalSubmit, // 点击整体提交按钮回调
//     handleBatchDel, // 点击批量删除按钮回调
//     handleDropdownVisibleChange, // 处理下拉组件打开状态改变事件
//     getVxeNumIptProps, // 获取数字输入框属性
//   };
// };

// export const useEditableGrid = (params: VbenVxeGridProps) => {
//   return useVbenVxeGrid({
//     ...params,
//     formOptions: {
//       fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
//       showCollapseButton: false,
//       showDefaultActions: false,
//       wrapperClass:
//         'grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  2xl:grid-cols-5',
//       compact: false,
//       ...params.formOptions,
//     },
//     gridOptions: {
//       keyboardConfig: {
//         isEdit: true,
//       },
//       size: 'small',

//       keepSource: true,
//       height: 'auto',
//       pagerConfig: {
//         enabled: false,
//       },
//       showOverflow: true,
//       proxyConfig: {
//         autoLoad: false,
//       },
//       border: true,
//       cellConfig: {
//         height: 32,
//       },
//       rowConfig: {
//         isCurrent: false,
//       },
//       ...params.gridOptions,
//       editConfig: {
//         mode: 'row',
//         trigger: 'click', // dblclick
//         showStatus: false,
//         showIcon: false,
//         autoClear: true,
//         ...params.gridOptions?.editConfig,
//       },
//     },
//   });
// };
