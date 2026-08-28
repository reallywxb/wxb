import type { Ref } from 'vue';

import type { ExtendedModalApi } from '@vben/common-ui';

import type { VbenFormProps } from '@vben-core/form-ui';

import { nextTick, reactive, ref, watch } from 'vue';

import { useVbenModal, z } from '@vben/common-ui';

import { message, Modal } from 'ant-design-vue';
import { cloneDeep } from 'lodash-es';

import { useVbenForm } from '#/adapter/form';
import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge, usePersistentLoading } from '#/utils/util';
import {
  delDepartmentUser,
  getDepartmentTree,
  getDepartmentTreeWithPermission,
  modifyDepartmentUser,
  moveUserDepartmentPermission,
  saveDepartment,
  saveDepartmentUser,
  saveUserDepartmentPermission,
} from '#/views/modules/spd/views/operation/system/api';
import commonFormModalComp from '#/views/modules/spd/views/operation/system/common/modals/commonFormModal.vue';

import { delDepartment, modifyDepartment } from '../api';

// 树节点类型定义
interface TreeNode {
  id: string | number;
  text: string;
  key?: string | number;
  children?: TreeNode[];
  [key: string]: any;
}

export function useTree({
  onTabChange,
  queryRootEndemic,
  orgId,
  treeRootRef,
}: {
  onTabChange: () => void;
  orgId: string | undefined;
  queryRootEndemic: () => void;
  treeRootRef: Ref<HTMLElement | undefined>;
}) {
  const keyword = ref('');
  const treeData = ref<any[]>([]);
  const expandedKeys = ref<Array<number | string>>([]);
  const departmentId = ref<string>('0');

  const nodeKeys = new Set<number | string>();

  // 收集所有目录的key，用来做展开所有功能
  function loop(nodes: Array<any>) {
    for (const node of nodes) {
      if (node.children?.length) {
        nodeKeys.add(node.id);
        loop(node.children);
      }
    }
  }

  // 递归删除expandedKeys中已关闭目录下的子目录key
  function recurrent(children?: Array<any>): Set<string> | undefined {
    return children?.reduce(
      (pre, cur) =>
        cur.children?.length
          ? new Set([...(recurrent(cur.children) ?? []), ...pre]).add(cur.id)
          : pre,
      new Set(),
    );
  }

  async function onDrop({
    dropToGap,
    node: { eventKey: targetId },
    dragNode: { eventKey: ids, parent },
    dropPosition,
  }) {
    if (
      (dropToGap && targetId === '0') ||
      (!dropToGap && targetId === parent.key)
    ) {
      return;
    }
    try {
      await moveUserDepartmentPermission({
        ids,
        targetId,
        moveType: dropToGap ? (dropPosition > 0 ? 'next' : 'prev') : 'inner',
      });

      message.success('操作成功');

      queryDepartmentTree();
    } catch {}
  }

  function expand() {
    expandedKeys.value = expandedKeys.value.length > 0 ? [] : [...nodeKeys];
  }

  function expandAll() {
    expandedKeys.value = [...nodeKeys];
  }

  function onExpand(
    keys: Array<string>,
    { expanded, node }: { expanded: boolean; node: any },
  ) {
    if (expanded) {
      expandedKeys.value = [...keys];
    } else {
      const keySet = recurrent(node.children);
      expandedKeys.value = keys.filter((key) => !keySet?.has(key));
    }
  }

  /**
   * 在树中查找所有匹配关键词的节点
   */
  function findMatchedNodes(nodes: TreeNode[], kw: string): TreeNode[] {
    const matched: TreeNode[] = [];
    function walk(nodeList: TreeNode[]) {
      for (const node of nodeList) {
        if (node.text?.includes(kw)) {
          matched.push(node);
        }
        if (node.children?.length) {
          walk(node.children);
        }
      }
    }
    walk(nodes);
    return matched;
  }

  /**
   * 获取节点到根的所有父级 key，用于展开路径
   */
  function getParentKeys(
    nodes: TreeNode[],
    targetId: string | number,
    path: (string | number)[] = [],
  ): (string | number)[] {
    for (const node of nodes) {
      if (node.id === targetId) {
        return path;
      }
      if (node.children?.length) {
        const found = getParentKeys(node.children, targetId, [
          ...path,
          node.id,
        ]);
        if (found.length > 0 || node.children.some((c) => c.id === targetId)) {
          return [...path, node.id];
        }
      }
    }
    return [];
  }

  /**
   * 回车搜索功能：匹配第一个符合条件的节点，展开路径并选中
   */
  async function searchAndSelectFirst() {
    if (!keyword.value || !treeData.value.length) return;

    const matchedNodes = findMatchedNodes(treeData.value, keyword.value);
    if (matchedNodes.length > 0) {
      const firstMatch = matchedNodes[0]!;
      // 展开到匹配节点的路径
      const parentKeys = getParentKeys(treeData.value, firstMatch.id);
      expandedKeys.value = [...new Set([...parentKeys, firstMatch.id])];

      // 选中匹配的节点
      departmentId.value = String(firstMatch.id);

      // 等待 DOM 更新后滚动到可视区域
      await nextTick();
      scrollToNode(firstMatch.id);
    }
  }

  /**
   * 滚动树到指定节点 - 原生 DOM 方式
   */
  function scrollToNode(nodeId: string | number) {
    // 从 treeData 中找到匹配节点的文本
    function findNodeText(
      nodes: TreeNode[],
      id: string | number,
    ): string | null {
      for (const node of nodes) {
        if (String(node.id) === String(id)) {
          return node.text || null;
        }
        if (node.children?.length) {
          const found = findNodeText(node.children, id);
          if (found) return found;
        }
      }
      return null;
    }

    const nodeText = findNodeText(treeData.value, nodeId);
    if (!nodeText) return;

    // 使用传入的 treeRootRef 查找树容器
    const treeContainer = treeRootRef.value;
    if (!treeContainer) return;

    // 查找所有树节点
    const treeNodes = treeContainer.querySelectorAll('.ant-tree-treenode');

    for (let i = 0; i < treeNodes.length; i++) {
      const nodeEl = treeNodes[i];
      const titleEl = nodeEl.querySelector('.ant-tree-title');
      if (titleEl) {
        const textContent = titleEl.textContent?.trim();
        if (textContent === nodeText) {
          // 找到滚动容器
          const scrollContainer =
            treeContainer.querySelector('.ant-tree') || treeContainer;
          const containerRect = (
            scrollContainer as HTMLElement
          ).getBoundingClientRect();
          const nodeRect = nodeEl.getBoundingClientRect();
          const offsetTop =
            nodeRect.top -
            containerRect.top +
            (scrollContainer as HTMLElement).scrollTop;

          (scrollContainer as HTMLElement).scrollTo({
            top: offsetTop - containerRect.height / 2,
            behavior: 'smooth',
          });
          return;
        }
      }
    }
  }

  function queryDepartmentTree() {
    return getDepartmentTree({ orgId: orgId || undefined }).then(({ rows }) => {
      treeData.value = [rows];
      loop(treeData.value);
    });
  }

  const endemicGridParams: any = reactive({
    parentId: departmentId.value,
  });

  const userGridParams: any = reactive({
    departmentId: departmentId.value,
  });

  watch(
    departmentId,
    (newVal) => {
      endemicGridParams.parentId = userGridParams.departmentId =
        newVal === '0' ? undefined : newVal;
      if (newVal === '0') {
        nextTick(queryRootEndemic);
      } else {
        onTabChange();
      }
    },
    { immediate: true },
  );

  return {
    keyword,
    treeData,
    departmentId,
    expandedKeys,
    queryDepartmentTree,
    expand,
    expandAll,
    onExpand,
    onDrop,
    endemicGridParams,
    userGridParams,
    searchAndSelectFirst,
  };
}

export function useBaseForm(
  departmentId: Ref<string>,
  queryDepartmentTree: () => void,
  isConsortium: boolean,
) {
  const { loading, showLoading } = usePersistentLoading();

  const [BaseForm, baseFormApi] = useVbenForm({
    commonConfig: {
      colon: true,
      componentProps: {
        class: 'w-[50vw]',
      },
      labelClass: 'w-[120px]',
    },
    async handleSubmit(values) {
      const stopLoading = showLoading();
      const validateResult = await baseFormApi.validate();
      if (validateResult.valid) {
        try {
          await saveDepartment({
            departmentId: departmentId.value,
            ...values,
          });

          message.success('操作成功');
          queryDepartmentTree();
        } catch (error) {
          console.error(error);
        } finally {
          stopLoading();
        }
      } else {
        message.error('请正确填写表单');
      }
    },
    layout: 'vertical',
    schema: [
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入科室病区名称',
        },
        fieldName: 'name', // 批准文号
        formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        label: '科室病区名称',
        rules: z.string().nonempty('请输入科室病区名称'),
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入简称',
        },
        fieldName: 'name2', // 批准文号
        formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        label: '简称',
      },

      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入科室病区编码',
        },
        fieldName: 'departmentCode', // 批准文号
        formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        label: '科室病区编码',
        rules: z.string().nonempty('请输入科室病区编码'),
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入科室病区搜索码',
        },
        fieldName: 'value', // 批准文号
        formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        label: '搜索码',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/refList.do?id=1000458',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择',
            paginate: false,
            filterByFrontEnd: true,
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              if (!isConsortium) {
                res.rows = res.rows?.filter((row: any) => row.id !== '0');
              }
              res.rows?.forEach((row) => {
                row.id = row.id.toString();
              });
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'departmentType', // 暂无字段
        label: '科室病区类型',
        formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        rules: z.string().nonempty('请选择科室病区类型'),
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/depHandleAction/departmentList.do',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            allowClear: true,
            placeholder: '请选择上级科室病区',
            paginate: false,
            showChooseAll: false,
            filterByFrontEnd: true,
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            showChooseAll: false,
            afterFetch(res: any) {
              res.rows?.forEach((row) => {
                row.id = row.id.toString();
              });
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'parentId', // 暂无字段
        label: '上级科室病区',
        formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        // rules: z.string().nonempty('请选择上级科室病区'),
      },
      // {
      //   component: 'Input',
      //   componentProps: {
      //     allowClear: true,
      //     placeholder: '请选择请领仓库',
      //   },
      //   fieldName: 'replenishWarehouseId', // 批准文号
      //   formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      //   labelClass: 'leading-1 mb-[0px] pl-[4px]',
      //   label: '请领仓库',
      // },
      // {
      //   component: 'ChcSelect',
      //   componentProps: () => {
      //     return {
      //       dictUrl: '/baseHandleAction/warehouse.do?accessAll=Y&level3=N',
      //       apiType: 'post',
      //       requestContentType: 'application/x-www-form-urlencoded',
      //       showSearch: true,
      //       allowClear: true,
      //       placeholder: '请选择请领仓库',
      //       paginate: false,
      //       filterByFrontEnd: true,
      //       immediate: true,
      //       labelField: 'name',
      //       valueField: 'id',
      //       afterFetch(res: any) {
      //         return { ...res, rows: undefined, records: res.rows };
      //       },
      //     };
      //   },
      //   fieldName: 'replenishWarehouseId', // 暂无字段
      //   label: '请领仓库',
      //   formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      //   labelClass: 'leading-1 mb-[0px] pl-[4px]',
      //   // rules: z.string().nonempty('请选择请领仓库'),
      // },
      {
        component: 'InputNumber',
        componentProps: {
          allowClear: true,
          placeholder: '请输入科室年预算金额',
        },
        fieldName: 'departmentYearPrice', // 批准文号
        formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        label: '科室年预算金额',
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入备注',
        },
        fieldName: 'description', // 批准文号
        formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        label: '备注',
      },
      {
        component: 'Switch',
        fieldName: 'isActive', // 批准文号
        formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        componentProps: {
          style: {
            width: '40px',
          },
        },
        label: '是否有效',
      },
      {
        component: 'Switch',
        fieldName: 'IsPurchase_allocate',
        formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        componentProps: {
          style: {
            width: '40px',
          },
        },
        label: '不参与集采分配',
      },
    ],
    wrapperClass: 'grid-cols-6',
    resetButtonOptions: {
      show: false,
    },
    actionWrapperClass: 'grid-cols-1',
  });

  return {
    loading,
    BaseForm,
    baseFormApi,
  };
}

export function useUserGrid(tableSearchExtraParams: { departmentId: string }) {
  const [UserGrid, userGridApi] = useSpdGrid(
    {
      formOptions: deepMerge(formDefaultOptions, {
        compact: true,
        layout: 'horizontal',
        submitButtonOptions: {
          content: '查询',
        },
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
      id: 'queryDepartmentUser',
      // api地址
      queryUrl: 'depHandleAction/queryDepartmentUser.do',
      gridColumns: [
        {
          type: 'radio',
          width: 50,
          align: 'center',
          visible: false,
        },
        { title: '序号', type: 'seq', width: 50, align: 'center' },
        {
          field: 'userName',
          title: '用户',
          sortable: true,
        },
        {
          field: 'userCode',
          title: '用户工号',
          align: 'right',
          sortable: true,
        },
        // {
        //   field: 'userId',
        //   title: '用户ID',
        //   hidden: true,
        // },
        {
          field: 'isReadWrite',
          title: '可读写',
          slots: { default: 'isReadWrite' },
        },
        {
          field: 'isActive',
          title: '活跃的',
          slots: { default: 'isActive' },
        },
        {
          field: 'description',
          title: '描述',
          sortable: true,
        },
      ],
      // 表单配置
      formSchema: [
        {
          component: 'Input',
          fieldName: 'userName',
          label: '用户',
          componentProps: () => {
            return {
              placeholder: `请输入`,
              defaultValue: '',
            };
          },
        },
      ],
      tableSearchExtraParams,
    },
  );

  // 父表 - 拒绝对话框
  const [UserModificationModal, userModificationModalApi] = useVbenModal({
    class: 'w-[400px]',
    closable: true,
    // 连接抽离的组件
    connectedComponent: commonFormModalComp,
    draggable: true,
  });

  /**
   * 页面弹窗表单配置
   */
  const userModificationFormOptions: VbenFormProps = {
    layout: 'vertical',
    schema: [
      {
        component: 'ChcSelect',
        placeholder: '请选择',
        componentProps: () => {
          return {
            dictUrl: '/warehouseAction/userList.do',
            // showSearch: true,
            paginate: false,
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'userId',
        label: '用户',
        rules: 'required',
      },
      {
        component: 'Switch',
        fieldName: 'isReadWrite',
        componentProps: {
          style: {
            width: '40px',
          },
        },
        label: '可读写',
      },
      {
        component: 'Switch',
        fieldName: 'isActive',
        componentProps: {
          style: {
            width: '40px',
          },
        },
        label: '是否有效',
      },
      {
        component: 'Textarea',
        fieldName: 'description',
        componentProps: () => {
          return {
            rows: 5,
          };
        },
        label: '描述',
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

  function createUser() {
    userModificationModalApi
      .setData({
        title: '添加科室病区用户',
        form: {
          userId: '',
          isReadWrite: 'Y',
          isActive: 'Y',
          description: '',
        },
        submit: (params: any) =>
          saveDepartmentUser({
            departmentId: tableSearchExtraParams.departmentId,
            ...params,
          }),
      })
      .open();
  }

  function modifyUser() {
    const selectedRow = userGridApi.grid.getRadioRecord();
    if (!selectedRow) {
      message.error('请选择一条记录！');
      return;
    }

    const { departmentUserId, departmentId, ...form } = selectedRow;

    userModificationModalApi
      .setData({
        title: '修改科室病区用户',
        form,
        submit: (params: any) =>
          modifyDepartmentUser({
            departmentUserId,
            departmentId,
            ...params,
          }),
      })
      .open();
  }

  function delUser() {
    const selectedRow = userGridApi.grid.getRadioRecord();
    if (!selectedRow) {
      message.error('请选择一条记录！');
      return;
    }

    const { departmentUserId } = selectedRow;

    Modal.confirm({
      title: '提示',
      content: `确认删除吗？`,
      onOk: async () => {
        try {
          await delDepartmentUser({ departmentUserId });

          message.success('删除成功');

          userGridApi.query();
        } catch {
          message.error('删除失败');
        }
      },
    });
  }

  return {
    UserGrid,
    userGridApi,
    UserModificationModal,
    userModificationFormOptions,
    createUser,
    modifyUser,
    delUser,
  };
}

export function useEndemicGrid(
  tableSearchExtraParams: { parentId: string },
  queryDepartmentTree: () => void,
  orgId: any,
  isConsortium: boolean | undefined,
) {
  const [EndemicGrid, endemicGridApi] = useSpdGrid(
    {
      formOptions: deepMerge(formDefaultOptions, {
        compact: true,
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
      id: 'queryDepartmentUser',
      // api地址
      queryUrl: 'depHandleAction/queryDepartment.do',
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
          field: 'name',
          title: '名称',
          minWidth: '100',
          sortable: true,
        },
        {
          field: 'name2',
          title: '简称',
          minWidth: '100',
          sortable: true,
        },
        {
          field: 'departmentCode',
          title: '编码',
          minWidth: '80',
          sortable: true,
        },
        {
          field: 'value',
          title: '搜索码',
          minWidth: '80',
          sortable: true,
        },
        {
          field: 'departmentTypeName',
          title: '科室病区类型',
          minWidth: '120',
          sortable: true,
        },
        {
          field: 'parentName',
          title: '院区',
          minWidth: '100',
          sortable: true,
        },
        {
          field: 'replenishWarehouseName',
          title: '请领仓库',
          minWidth: '100',
          sortable: true,
        },
        {
          field: 'seqNo',
          title: '序号',
          minWidth: '60',
          sortable: true,
          align: 'right',
        },
        {
          field: 'isActive',
          title: '有效',
          minWidth: '60',
          formatter({ cellValue }) {
            return cellValue === 'Y' ? '是' : '否';
          },
        },
        {
          field: 'IsPurchase_allocate',
          title: '不参与集采分配',
          minWidth: '120',
          formatter({ cellValue }) {
            return cellValue === 'Y' ? '是' : '否';
          },
        },
        {
          field: 'description',
          title: '描述',
          minWidth: '100',
        },
      ],
      beforeFetchFn: (params) => {
        params.orgId = orgId || undefined;
        return params;
      },
      // 表单配置
      formSchema: [
        {
          component: 'Input',
          fieldName: 'departmentName',
          label: '科室病区',
          componentProps: () => {
            return {
              placeholder: `请输入`,
              defaultValue: '',
            };
          },
        },
      ],
      tableSearchExtraParams,
    },
  );

  // 科室病区类型 - 院区 0
  const DEPARTMENT_TYPE_AREA = '0';

  const [DepartmentModificationModal, departmentModificationModalApi] =
    useVbenModal({
      class: 'w-[900px]',
      closable: true,
      // 连接抽离的组件
      connectedComponent: commonFormModalComp,
      draggable: true,
    });

  /**
   * 页面弹窗表单配置
   */
  const departmentModificationFormOptions: VbenFormProps = {
    commonConfig: {
      // 所有表单项
      componentProps: {
        class: 'w-[20vw]',
      },
      labelClass: 'w-[120px]',
    },
    layout: 'horizontal',
    schema: [
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入科室病区名称',
        },
        fieldName: 'name', // 批准文号
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        label: '科室病区名称',
        rules: z.string().nonempty('请输入科室病区名称'),
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入简称',
        },
        fieldName: 'name2', // 批准文号
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        label: '简称',
      },

      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入科室病区编码',
        },
        fieldName: 'departmentCode', // 批准文号
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        label: '科室病区编码',
        rules: z.string().nonempty('请输入科室病区编码'),
      },
      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入科室病区搜索码',
        },
        fieldName: 'value', // 批准文号
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        label: '搜索码',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/refList.do?id=1000458',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择',
            paginate: false,
            filterByFrontEnd: true,
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              // TOOD 新增需求 isConsortium 为 false 时，不展示"院区"选项
              if (!isConsortium) {
                res.rows = res.rows?.filter(
                  (row: { id: string; name: string }) =>
                    row.id !== DEPARTMENT_TYPE_AREA && row.name !== '院区',
                );
              }
              res.rows?.forEach((row: any) => {
                row.id = row.id.toString();
              });
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'departmentType', // 暂无字段
        label: '科室病区类型',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        rules: z.string().nonempty('请选择科室病区类型'),
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/depHandleAction/departmentList.do',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            allowClear: true,
            placeholder: '请选择上级科室病区',
            paginate: false,
            filterByFrontEnd: true,
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            showChooseAll: false,
            afterFetch(res: any) {
              res.rows?.forEach((row) => {
                row.id = row.id.toString();
              });
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          rules: (values: any) => {
            /* 科室病区类型为 [院区] 时必填*/
            return values.departmentType === DEPARTMENT_TYPE_AREA
              ? null
              : 'required';
          },
          triggerFields: ['departmentType'],
        },
        fieldName: 'parentId', // 暂无字段
        label: '上级科室病区',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      // {
      //   component: 'Input',
      //   componentProps: {
      //     allowClear: true,
      //     placeholder: '请选择请领仓库',
      //   },
      //   fieldName: 'replenishWarehouseId', // 批准文号
      //   formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      //   labelClass: 'leading-1 mb-[0px] pl-[4px]',
      //   label: '请领仓库',
      // },
      // {
      //   component: 'ChcSelect',
      //   componentProps: () => {
      //     return {
      //       dictUrl: '/baseHandleAction/warehouse.do?accessAll=Y&level3=N',
      //       apiType: 'post',
      //       requestContentType: 'application/x-www-form-urlencoded',
      //       showSearch: true,
      //       allowClear: true,
      //       placeholder: '请选择请领仓库',
      //       paginate: false,
      //       filterByFrontEnd: true,
      //       immediate: true,
      //       labelField: 'name',
      //       valueField: 'id',
      //       showChooseAll: false,
      //       afterFetch(res: any) {
      //         return { ...res, rows: undefined, records: res.rows };
      //       },
      //     };
      //   },
      //   fieldName: 'replenishWarehouseId', // 暂无字段
      //   label: '请领仓库',
      //   formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      //   labelClass: 'leading-1 mb-[0px] pl-[4px]',
      //   // rules: z.string().nonempty('请选择请领仓库'),
      // },
      {
        component: 'Switch',
        fieldName: 'isActive', // 批准文号
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        label: '是否有效',
      },

      {
        component: 'Input',
        componentProps: {
          allowClear: true,
          placeholder: '请输入备注',
        },
        fieldName: 'description', // 批准文号
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        label: '备注',
      },
      {
        component: 'Switch',
        fieldName: 'IsPurchase_allocate',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        componentProps: {
          style: {
            width: '40px',
          },
        },
        label: '不参与集采分配',
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

  function createEndemic() {
    departmentModificationModalApi
      .setData({
        title: '添加科室病区',
        form: {
          parentId: tableSearchExtraParams.parentId,
          isActive: 'Y',
          IsPurchase_allocate: 'N',
        },
        submit: (params: any) =>
          saveDepartment({
            ...params,
          }).then(queryDepartmentTree),
      })
      .open();
  }

  function modifyEndemic() {
    const selectedRow = endemicGridApi.grid.getRadioRecord();
    if (!selectedRow) {
      message.error('请选择一条记录！');
      return;
    }

    const {
      departmentUserId,
      departmentId,
      name,
      departmentCode,
      departmentType,
      name2,
      value,
      parentId,
      replenishWarehouseId,
      isActive,
      IsPurchase_allocate,
      description,
    } = selectedRow;

    departmentModificationModalApi
      .setData({
        title: '修改科室病区',
        form: {
          name,
          departmentCode,
          departmentType,
          name2,
          value,
          parentId,
          replenishWarehouseId,
          isActive,
          IsPurchase_allocate,
          description,
        },
        submit: (params: any) =>
          modifyDepartment({
            departmentUserId,
            departmentId,
            ...params,
          }).then(queryDepartmentTree),
      })
      .open();
  }

  function delEndemic() {
    const selectedRow = endemicGridApi.grid.getRadioRecord();
    if (!selectedRow) {
      message.error('请选择一条记录！');
      return;
    }

    const { departmentId } = selectedRow;

    Modal.confirm({
      title: '提示',
      content: `确认删除吗？`,
      onOk: async () => {
        try {
          await delDepartment({ departmentId });

          message.success('删除成功');

          endemicGridApi.query();
          queryDepartmentTree();
        } catch {
          message.error('删除失败');
        }
      },
    });
  }

  return {
    EndemicGrid,
    endemicGridApi,
    DepartmentModificationModal,
    departmentModificationFormOptions,
    createEndemic,
    modifyEndemic,
    delEndemic,
  };
}

export function usePermissionModal() {
  const permissionTreeData = ref();

  const defaultCheckedKeys = ref<Array<string> | undefined>();
  const checkedKeys = ref<Array<string> | undefined>();

  // 处理重复id
  function recurrent(children?: any[], parent?: any): void {
    children?.forEach((child) => {
      recurrent(child.children, child);
      if (child.id === parent?.id) {
        child.id += '#';
      }
    });
  }

  // 获取checkedKey
  function walkCheckedKeys(children?: any): Set<string> | undefined {
    return children?.reduce((pre, cur) => {
      // if (cur.children?.length) {
      //   walkCheckedKeys(cur.children);
      // }
      //
      // if (cur.checked) pre.add(cur.id);

      pre = cur.children?.length
        ? new Set([...(walkCheckedKeys(cur.children) ?? []), ...pre])
        : pre;

      return cur.checked && cur.leaf ? pre.add(cur.id) : pre;
    }, new Set());
  }

  function onCheckNode() {}

  const [PermissionModal, permissionModalApi] = useVbenModal({
    draggable: true,
    class: 'w-[700px]',
    onCancel() {
      permissionModalApi.close();
    },
    async onConfirm() {
      // defaultCheckedKeys.value.map((key) => key.replace('#', ''));
      // checked
      const newCheckedKeys = checkedKeys.value?.filter(
        (key) => !defaultCheckedKeys.value?.includes(key),
      );

      const uncheckedKeys = defaultCheckedKeys.value?.filter(
        (key) => !checkedKeys.value?.includes(key),
      );

      const {
        user: { userId },
      } = permissionModalApi.getData<{ user: any }>();

      try {
        await saveUserDepartmentPermission({
          departmentUserAccess: JSON.stringify([
            ...(newCheckedKeys?.map((key) => ({
              userId,
              departmentId: key.replace('#', ''),
              isChecked: true,
            })) ?? []),
            ...(uncheckedKeys?.map((key) => ({
              userId,
              departmentId: key.replace('#', ''),
              isChecked: false,
            })) ?? []),
          ]),
        });

        message.success('操作成功');
        permissionModalApi.close();
      } catch {}
    },
    onOpenChange(isOpen: boolean) {
      if (isOpen) {
        const {
          user: { userId },
        } = permissionModalApi.getData<{ user: any }>();
        getDepartmentTreeWithPermission({
          userId,
        }).then(({ rows }) => {
          recurrent([rows]);
          defaultCheckedKeys.value = [...(walkCheckedKeys([rows]) ?? [])];

          checkedKeys.value = cloneDeep(defaultCheckedKeys.value);

          // console.debug('defaultCheckedKeys', defaultCheckedKeys.value);

          permissionTreeData.value = [rows];
        });
      }
    },
  });

  return {
    permissionTreeData,
    PermissionModal,
    permissionModalApi,
    checkedKeys,
    defaultCheckedKeys,
    onCheckNode,
  };
}

export function useImportModal() {
  const importModalRef = ref<ExtendedModalApi | undefined>();
  const templateUrl = new URL(
    '#/assets/excels/department.xls',
    import.meta.url,
  ).toString();

  return {
    importModalRef,
    templateUrl,
  };
}
