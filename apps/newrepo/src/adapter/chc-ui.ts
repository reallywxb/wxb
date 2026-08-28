import type { VxeGridProps } from '@vben//plugins/src/vxe-table/types';
import type { SchemaColumnAndOptions } from '@vben/chc-ui';
import type { VbenFormProps } from '@vben/common-ui';

import type { ComponentType } from './component';

import { useAccess } from '@vben/access';
import { useChcCrud, useCrudApis } from '@vben/chc-ui';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
// import { cloneDeep } from '@vben/utils';
import { requestClient } from '#/api/request';
import { IS_FORM_AREA_VERTICAL } from '#/const';
import { deepClone, deepMerge } from '#/utils/util';

import { formDefaultOptions } from './config/formDefaultOptions';
import { gridDefaultOptions } from './config/gridDefaultOptions';
import { addFormItemProps, packageFnOrObj } from './utils';

export * from '@vben/chc-ui';
const { hasAccessByCodes } = useAccess();
const env = import.meta.env.PROD ? 'prod' : 'dev';
const appVersion = import.meta.env.VITE_APP_VERSION;
const namespace = `${import.meta.env.VITE_APP_NAMESPACE}-${appVersion}-${env}`;
// 使用项目内的request实例生成接口对象
const crudApis = useCrudApis(requestClient);
/** crudApis.saveDataTableColumnConfig = function saveDataTableColumnConfig(
  tabelId: string,
  type: string,
  obj: any,
) {
  return requestClient.post(
    `/userPageAction/save.do`,
    {
      gridContent: JSON.stringify(obj),
      gridId: type,
      menuId: `${tabelId}`, // 后端接口必须要加这个.html才能查到数据
    },
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
    },
  );
};
crudApis.queryDataTableColumnConfig = function queryDataTableColumnConfig(
  tabelId: string,
  type: string,
) {
  return new Promise((resolve) => {
    requestClient
      .post(
        `/userPageAction/query.do`,
        {
          gridId: type,
          menuId: `${tabelId}`, // 后端接口必须要加这个.html才能查到数据.html
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          },
        },
      )
      .then((res) => {
        // console.log(res);
        if (res && res.rows && res.rows.length > 0) {
          resolve({ data: res.rows[0].Grid_Content });
        } else {
          resolve(null);
        }
      });
  });
};
*/
function addWrapperClass(options: VbenFormProps<ComponentType>) {
  if (options.popupContainerClass) {
    options.wrapperClass = options.wrapperClass
      ? `${options.wrapperClass} popCon-${options.popupContainerClass}`
      : `popCon-${options.popupContainerClass}`;
  } else if (options.id) {
    console.warn(
      '[Deprecated]：formOptions的id属性原用于在有滚动条的表单内让select的下拉弹窗自动定位。\n由于id属性未来可能拓展其他用途，现新增popupContainerClass字段用于实现同样动能。\n看到这个报错，请将form表单的id字段改为popupContainerClass字段。\n后续id属性有别的用途时，将不再兼容',
    );
    options.wrapperClass = options.wrapperClass
      ? `${options.wrapperClass} popCon-${options.id}`
      : `popCon-${options.id}`;
  }
}
// useChcGrid方法用于生成表格组件，拥有很多默认基础功能
const useChcGrid = function (
  options: VxeGridProps,
  chcOptions?: SchemaColumnAndOptions,
  handleTableDataFn?: (res: any) => TableData<any>, // 处理接口查询返参为统一格式的方法
  serachParamsFormat?: (params: any) => any, // 查询参数格式化方法
  defaultConfig?: SchemaColumnAndOptions,
  isFormAreaVertical?: boolean,
) {
  const originFormOptions = options.formOptions || {};
  options.formOptions = deepMerge(formDefaultOptions, originFormOptions);
  const originGridOptions = options.gridOptions || {};
  options.gridOptions = deepMerge(gridDefaultOptions, originGridOptions);
  if (options.formOptions?.showCollapseButton === undefined) {
    options.formOptions = options.formOptions || {};
    options.formOptions.showCollapseButton = !!(
      chcOptions?.formSchema && chcOptions?.formSchema?.length > 4
    );
  }
  chcOptions = chcOptions || {};
  // 表格上面的查询表单
  if (chcOptions?.formSchema) {
    chcOptions?.formSchema.forEach((field) => {
      if (!field.componentProps) {
        field.componentProps = {};
      }
      field.componentProps = packageFnOrObj(field.componentProps, (obj) => {
        return addFormItemProps(field, obj);
      });
    });
  }

  if (!chcOptions.viewFormOptions && chcOptions.commonFormOptions) {
    // 沒有传viewFormOptions的情况下，用commonFormOptions生成viewFormOptions
    chcOptions.viewFormOptions = deepClone(chcOptions.commonFormOptions);
    // 将viewFormOptions的schema内的item项的componentProps方法返回值拿出来，避免和commonFormOptions共用
    if (chcOptions.viewFormOptions) {
      chcOptions.viewFormOptions.schema =
        chcOptions.viewFormOptions?.schema?.map((item) => {
          if (typeof item.componentProps === 'function') {
            const itemComponentProps = { ...item.componentProps() };
            return {
              ...item,
              componentProps: itemComponentProps,
            };
          }
          return item;
        });
    }
  }
  if (chcOptions?.viewFormOptions) {
    // 自动为form添加类名，用于select的下拉弹窗定位
    addWrapperClass(chcOptions.viewFormOptions);
    // 对componentProps进行包装，添加修改一些属性
    chcOptions?.viewFormOptions?.schema?.forEach((field) => {
      if (!field.componentProps) {
        field.componentProps = {};
      }
      field.componentProps = packageFnOrObj(field.componentProps, (obj) => {
        obj.disabled = true;
        return addFormItemProps(
          field,
          obj,
          chcOptions?.viewFormOptions?.popupContainerClass ||
            chcOptions?.viewFormOptions?.id,
        );
      });
    });
  }
  if (chcOptions?.addFormOptions) {
    // 自动为form添加类名，用于select的下拉弹窗定位
    addWrapperClass(chcOptions.addFormOptions);
    // 对componentProps进行包装，添加修改一些属性
    chcOptions?.addFormOptions?.schema?.forEach((field) => {
      if (!field.componentProps) {
        field.componentProps = {};
      }
      field.componentProps = packageFnOrObj(field.componentProps, (obj) => {
        return addFormItemProps(
          field,
          obj,
          chcOptions?.addFormOptions?.popupContainerClass ||
            chcOptions?.addFormOptions?.id,
        );
      });
    });
  }
  if (chcOptions?.editFormOptions) {
    // 自动为form添加类名，用于select的下拉弹窗定位
    addWrapperClass(chcOptions.editFormOptions);
    // 对componentProps进行包装，添加修改一些属性
    chcOptions?.editFormOptions?.schema?.forEach((field) => {
      if (!field.componentProps) {
        field.componentProps = {};
      }
      field.componentProps = packageFnOrObj(field.componentProps, (obj) => {
        return addFormItemProps(
          field,
          obj,
          chcOptions?.editFormOptions?.popupContainerClass ||
            chcOptions?.editFormOptions?.id,
        );
      });
    });
  }
  if (chcOptions?.commonFormOptions) {
    // 自动为form添加类名，用于select的下拉弹窗定位
    addWrapperClass(chcOptions.commonFormOptions);
    // 对componentProps进行包装，添加修改一些属性
    chcOptions?.commonFormOptions?.schema?.forEach((field) => {
      if (!field.componentProps) {
        field.componentProps = {};
      }
      field.componentProps = packageFnOrObj(field.componentProps, (obj) => {
        return addFormItemProps(
          field,
          obj,
          chcOptions?.commonFormOptions?.popupContainerClass ||
            chcOptions?.commonFormOptions?.id,
        );
      });
    });
  }
  // 将接口对象和项目内的useVbenVxeGrid给到hook，生成一个拥有自动接口调用能力的表格组件
  const chcCrud = useChcCrud(
    useVbenVxeGrid, // 基于此方法做二次封装
    crudApis, // 自动接口调用需要
    namespace, // 自动存储数据需要
    hasAccessByCodes, // 添加权限控制需要
    handleTableDataFn, // 返回数据前置处理
    serachParamsFormat, // 查询参数格式化方法
    defaultConfig === undefined
      ? { autoLoadColumnConfig: true }
      : defaultConfig, // 默认配置
    isFormAreaVertical === undefined
      ? IS_FORM_AREA_VERTICAL
      : isFormAreaVertical, // 表格搜索区是否上下布局
  );
  return chcCrud.useChcGrid(options, chcOptions);
};

// 导出
export { crudApis, useChcGrid };
