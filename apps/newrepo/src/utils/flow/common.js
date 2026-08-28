/*
 * @Date: 2022-08-29 14:00:42
 * @LastEditors: StavinLi 495727881@qq.com
 * @LastEditTime: 2023-03-29 15:53:05
 * @FilePath: /Workflow-Vue3/src/components/dialog/common.js
 */

import { ref } from 'vue';

import {
  orgTree,
  orgTreeSearcheUser,
} from '#/views/modules/flow/api/dept/index';

import $func from './index.js';

export const searchVal = ref('');
export const departments = ref({
  titleDepartments: [],
  childDepartments: [],
  roleList: [],
  employees: [],
});
export const roles = ref({});

export const getDepartmentList = async (parentId = 0, type = 'org') => {
  // let { data } = await getDepartments({ parentId })

  const data = await orgTree(type, parentId);

  departments.value = data;
};
export const getDebounceData = (event) => {
  $func.debounce(async () => {
    if (event) {
      const data = {
        userName: event,
        pageNum: 1,
        pageSize: 30,
      };
      departments.value.childDepartments = [];

      departments.value.employees = await orgTreeSearcheUser(data);
    } else {
      await getDepartmentList();
    }
  })();
};
