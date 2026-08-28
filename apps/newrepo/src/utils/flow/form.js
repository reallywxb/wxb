import { computed } from 'vue';

import { useFlowStore } from '../../store/flow.ts';
import * as util from './objutil.ts';

const flowStore = useFlowStore();
const step2FormList = computed(() => {
  const step2 = flowStore.step2;

  return step2;
});

export function getAboveSameTypeFormList(
  aboveFormId,
  type,
  autoAddStarter = false,
) {
  const value = step2FormList.value;

  let fList = [];

  if (util.isNotBlank(aboveFormId)) {
    for (const it of value) {
      if (it.id === aboveFormId) {
        break;
      }
      fList.push(it);
    }
  } else {
    fList = value;
  }

  const $deepCopy = util.deepCopy(
    fList.filter(
      (res) =>
        res.type !== 'SelectMultiUser' &&
        res.type !== 'SelectMultiDept' &&
        res.type !== 'Description' &&
        res.type !== 'UploadImage' &&
        res.type !== 'UploadFile',
    ),
  );

  // 自动添加发起人信息
  if (autoAddStarter) {
    $deepCopy.push({
      id: 'rootUser',
      name: '发起人',
      type: 'SelectUser',
      typeName: '用户',
    });
  }

  // 判断类型
  if (util.isNotBlank(type)) {
    return $deepCopy.filter((res) => res.type === type);
  }

  return $deepCopy;
}
