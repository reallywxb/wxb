import { computed } from 'vue';

import { useFlowStore } from '#/store/flow';
import { conditionExpression } from '#/utils/flow/const.js';

import * as util from './objutil.js';
import { isBlank } from './objutil.js';

function All() {}

const flowStore = useFlowStore();
const step2FormList = computed(() => {
  return flowStore.step2;
});

const formIdObj = computed(() => {
  const obj = {};
  for (const item of step2FormList.value) {
    obj[item.id] = item;
  }
  obj.rootUser = {
    name: '发起人',
    type: 'SelectUser',
  };
  return obj;
});

All.prototype = {
  timer: '',
  debounce(fn, delay = 500) {
      const _this = this;
      return function(arg) {
          // 获取函数的作用域和变量
          const that = this;
          const args = arg;
          clearTimeout(_this.timer); // 清除定时器
          _this.timer = setTimeout(() => {
              fn.call(that, args);
          }, delay);
      };
  },
  checkStarter(nodeConfig) {
    // 动态表单检查
    const dynamicFormConfig = nodeConfig.dynamicFormConfig;
    if (dynamicFormConfig?.enable) {
      const r = util.checkHttpSetting(dynamicFormConfig);
      if (!r.ok) {
        return r;
      }

      // 请求结果
      const result = dynamicFormConfig.result;
      for (const it of result) {
        if (
          util.isBlank(it.value) ||
          util.isBlank(it.field) ||
          util.isBlank(it.contentConfig)
        ) {
          return {
            ok: false,
            msg: '动态表单返回值映射不能为空',
          };
        }
      }
    }
    return {
      ok: true,
      msg: '',
    };
  },
  checkApproval(nodeConfig) {
    switch (nodeConfig.assignedType) {
      case 1: {
        // 指定成员--指定部门主管
        if (nodeConfig.nodeUserList.length === 0) {
          return {
            ok: false,
            msg: '请选择成员',
          };
        }

        break;
      }
      case 3: {
        // 指定角色
        if (nodeConfig.nodeUserList.length === 0) {
          return {
            ok: false,
            msg: '请选择角色',
          };
        }

        break;
      }
      case 10: {
        // 指定部门主管
        if (nodeConfig.nodeUserList.length === 0) {
          return {
            ok: false,
            msg: '请选择部门',
          };
        }

        break;
      }
      default: {
        if (
          nodeConfig.assignedType === 8 &&
          nodeConfig.formUserId.length === 0
        ) {
          // 表单-用户
          return {
            ok: false,
            msg: '请选择用户表单',
          };
        } else if (nodeConfig.assignedType === 9) {
          // 表单-部门
          if (nodeConfig.formUserId.length === 0) {
            return {
              ok: false,
              msg: '请选择部门表单',
            };
          }
          // 判断是否选择角色了
          if (
            nodeConfig.deptUserType === 'role' &&
            (!nodeConfig.roleList || nodeConfig.roleList.length === 0)
          ) {
            return {
              ok: false,
              msg: '请选择部门下的角色',
            };
          }
        } else if (nodeConfig.assignedType === 15) {
          // 指定部门
          if (nodeConfig.nodeUserList.length === 0) {
            return {
              ok: false,
              msg: '请选择部门',
            };
          }
          // 判断是否选择角色了
          if (
            nodeConfig.deptUserType === 'role' &&
            (!nodeConfig.roleList || nodeConfig.roleList.length === 0)
          ) {
            return {
              ok: false,
              msg: '请选择部门下的角色',
            };
          }
        } else if (
          nodeConfig.assignedType === 14 && // 其他节点指定
          nodeConfig.fromOtherNodeList.length === 0
        ) {
          return {
            ok: false,
            msg: '请选择其他审批节点',
          };
        }
      }
    }

    // 审批人为空
    if (
      nodeConfig.nobody?.handler === 'TO_USER' &&
      nodeConfig.nobody?.assignedUser?.length === 0
    ) {
      return {
        ok: false,
        msg: '审批人为空时，请选择指定用户',
      };
    }
    // 审批人拒绝
    if (
      nodeConfig.refuse?.handler === 'TO_NODE' &&
      nodeConfig.refuse.nodeId?.length === 0
    ) {
      return {
        ok: false,
        msg: '审批人被拒绝时，请选择驳回的节点',
      };
    }
    // 操作权限
    const operList = nodeConfig.operList;
    const length = operList?.filter((res) => res.checked).length;
    if (length === 0) {
      return {
        ok: false,
        msg: '操作权限不能为空',
      };
    }

    // 检查超时
    if (nodeConfig.expireSetting?.enable) {
      const value = nodeConfig.expireSetting.value;
      if (isBlank(value)) {
        return {
          ok: false,
          msg: '请设置超时时间',
        };
      } else if (!util.isInteger(value)) {
        return {
          ok: false,
          msg: '超时时间只能是整数',
        };
      } else if (Number.parseInt(value) < 1) {
        return {
          ok: false,
          msg: '超时时间不能小于1',
        };
      }
    }
    // 检查监听器
    if (nodeConfig.listener) {
      {
        const httpSetting = nodeConfig.listener.create;
        if (httpSetting?.enable) {
          const r = util.checkHttpSetting(httpSetting);
          if (!r.ok) {
            return r;
          }
        }
      }
      {
        const httpSetting = nodeConfig.listener.assign;
        if (httpSetting?.enable) {
          const r = util.checkHttpSetting(httpSetting);
          if (!r.ok) {
            return r;
          }
        }
      }
      {
        const httpSetting = nodeConfig.listener.complete;
        if (httpSetting?.enable) {
          const r = util.checkHttpSetting(httpSetting);
          if (!r.ok) {
            return r;
          }
        }
      }
      {
        const httpSetting = nodeConfig.listener.change;
        if (httpSetting?.enable) {
          const r = util.checkHttpSetting(httpSetting);
          if (!r.ok) {
            return r;
          }
        }
      }
    }

    return {
      ok: true,
      msg: '',
    };
  },

  starterStr() {
    return '基础信息指定人员可发起';
  },

  checkCopy(nodeConfig) {
    return this.checkApproval(nodeConfig);
  },
  copyerStr(nodeConfig) {
    return this.setApproverStr(nodeConfig);
  },
  checkDelay(nodeConfig) {
    const v = nodeConfig.value;

    return {
      ok: util.isNotBlank(v),
      msg: '请设置延时器数据',
    };
  },
  delayStr(nodeConfig) {
    const value = nodeConfig.value;
    const newVar = value?.length > 0 ? value : '?';

    const mode = nodeConfig.mode;
    const delayUnit = nodeConfig.delayUnit;
    if (mode) {
      const filterElement = delayUnitOpts.find(
        (res) => res.value === delayUnit,
      );
      return `等待${newVar}${filterElement.label}`;
    }

    return `等至${newVar}`;
  },
  checkCondition(conditionsConfig, index) {
    const conditionNodes = conditionsConfig.conditionNodes;
    const conditionNode = conditionNodes[index];
    const groupRelationMode = conditionNode.groupRelationMode;

    const groupRelation = conditionNode.groupRelation;

    if (!groupRelationMode && groupRelation.length === 0) {
      return {
        ok: false,
        msg: '条件组不能为空',
      };
    }

    const conditionList = conditionNode.conditionList;
    if (conditionList.length === 0) {
      return {
        ok: false,
        msg: '条件不能为空',
      };
    }
    if (index !== conditionNodes.length - 1) {
      for (const it of conditionList) {
        if (it.conditionList.length === 0) {
          return {
            ok: false,
            msg: '条件不能为空',
          };
        }

        for (const ite of it.conditionList) {
          if (ite.keyType === 'SelectUser' && ite.userKey.includes('empty')) {
            continue;
          }
          if (
            util.isNull(ite.key) ||
            ite.key.length === 0 ||
            util.isNull(ite.expression) ||
            ite.expression.length === 0 ||
            (!ite.expression.includes('empty') &&
              (util.isNull(ite.value) || ite.value.length === 0))
          ) {
            return {
              ok: false,
              msg: '请正确设置分支条件',
            };
          }
        }
      }
    }
    return {
      ok: true,
    };
  },

  conditionStr(nodeConfig, index) {
    let expObj;
    const conditionNodes = nodeConfig.conditionNodes;
    if (index === conditionNodes.length - 1) {
      return '默认条件';
    }
    const conditionNode = conditionNodes[index];
    const groupRelationMode = conditionNode.groupRelationMode;

    const groupRelation = conditionNode.groupRelation;

    if (!groupRelationMode && groupRelation.length === 0) {
      return '请设置条件组关系';
    }

    const { conditionList } = conditionNode;
    const groupMode = conditionNode.mode;
    if (conditionList.length === 0) {
      return index === conditionNodes.length - 1
        ? '其他条件进入此流程'
        : '请设置条件';
    } else {
      const groupConArr = [];
      for (const groupCondition of conditionList) {
        const mode = groupCondition.mode;

        const conArr = [];

        for (const con of groupCondition.conditionList) {
          const { key, expression, value } = con;
          if (!key) {
            continue;
          }

          let valueElement = formIdObj.value[key];

          let name = valueElement?.name;

          let valueShow = value;
          if (key.includes('||')) {
            // 明细汇总

            const split = key.split('||');
            valueElement = formIdObj.value[split[0]];
            name = con.name;
            if (util.isNull(valueShow)) {
              valueShow = expression.includes('empty') ? '' : '?';
            }
          } else
            switch (valueElement.type) {
              case 'MultiSelect':
              case 'SingleSelect': {
                valueShow = expression.includes('empty')
                  ? ''
                  : value.map((res) => res.value).join(',');

                break;
              }
              case 'SelectDept': {
                if (util.isNull(value)) {
                  valueShow = expression.includes('empty') ? '' : '?';
                } else {
                  valueShow = value.map((res) => res.name).join(',');
                }

                break;
              }
              case 'SelectUser': {
                const userKey = con.userKey;
                const userKeyFieldList = con.userKeyFieldList;

                const ele = userKeyFieldList.find((r) => r.key === userKey);

                const type = ele.type;

                switch (type) {
                  case 'MultiSelect':
                  case 'SingleSelect': {
                    valueShow = value.map((res) => res.value).join(',');

                    break;
                  }
                  case 'Role': {
                    valueShow = value
                      ? value.map((res) => res.name).join(',')
                      : '';

                    break;
                  }
                  case 'SelectDept':
                  case 'SelectUser': {
                    valueShow = value
                      ? value.map((res) => res.name).join(',')
                      : '';

                    break;
                  }
                  default: {
                    if (type && type.length > 0) {
                      if (util.isNull(valueShow)) {
                        valueShow = expression.includes('empty') ? '' : '?';
                      }
                    } else {
                      valueShow = '';
                    }
                  }
                }

                break;
              }
              default: {
                if (util.isNull(valueShow)) {
                  valueShow = expression.includes('empty') ? '' : '?';
                }
              }
            }

          if (valueElement.type === 'SelectUser') {
            const userKey = con.userKey;

            const userKeyFieldList = con.userKeyFieldList;
            const ele = userKeyFieldList.find((r) => r.key === userKey);

            expObj = {};

            const e = conditionExpression.value[ele.type];

            if (e) {
              for (const it of e) {
                expObj[it.key] = it.name;
              }
            }

            conArr.push(
              `${name} ${ele.name} ${expObj[expression] ?? ''} ${valueShow}`,
            );
          } else {
            expObj = {};

            const e = conditionExpression.value[valueElement.type];
            for (const it of e) {
              expObj[it.key] = it.name;
            }
            conArr.push(`${name} ${expObj[expression]} ${valueShow}`);
          }
        }

        if (mode) {
          const s = conArr.join(' 且 ');
          if (conArr.length > 0) {
            groupConArr.push(`(${s})`);
          }
        } else {
          const s = conArr.join(' 或 ');
          if (conArr.length > 0) {
            groupConArr.push(`(${s})`);
          }
        }
      }

      if (groupRelationMode === undefined ? true : groupRelationMode) {
        if (groupConArr.length > 0) {
          return groupConArr.join(groupMode ? ' 且 ' : ' 或 ');
        } else {
          return index === conditionNodes.length - 1
            ? '默认条件'
            : '请设置条件';
        }
      }
      if (groupConArr.length === 0) {
        return '请设置条件';
      }
      let str = '';
      for (const itm of groupRelation) {
        str = str + itm.name;
      }

      for (const [k, element] of groupConArr.entries()) {
        str = str.replaceAll(`条件组${k + 1}`, element);
      }

      return str;
    }
  },
  setApproverStr(nodeConfig) {
    switch (nodeConfig.assignedType) {
      case 1: {
        // 指定成员
        const userList = nodeConfig.nodeUserList.filter(
          (res) => res.type === 'user',
        );
        const deptList = nodeConfig.nodeUserList.filter(
          (res) => res.type === 'dept',
        );
        if (userList.length === 0) {
          return `部门:${deptList.map((res) => res.name).join(',')}`;
        } else if (deptList.length === 0) {
          return `用户:${userList.map((res) => res.name).join(',')}`;
        } else {
          return `用户:${userList.map((res) => res.name).join(',')};部门:${deptList.map((res) => res.name).join(',')}`;
        }
      }
      case 10: {
        // 指定部门主管
        return `指定部门主管：${nodeConfig.nodeUserList.map((res) => res.name).join(',')}`;
      }
      case 2: {
        return nodeConfig.deptLeaderLevel === 1
          ? '直接部门主管'
          : `第${nodeConfig.deptLeaderLevel}级部门主管`;
      }
      case 3: {
        // 指定角色
        return `角色:${nodeConfig.nodeUserList.map((res) => res.name).join(',')}`;
      }
      case 4: {
        // 发起人自选
        return '发起人自选';
      }
      case 5: {
        return '发起人自己';
      }
      case 7: {
        return `到第${nodeConfig.deptLeaderLevel}级部门主管终止`;
      }
      case 11: {
        // 系统自动拒绝
        return '系统自动拒绝';
      }
      case 12: {
        // 系统自动通过
        return '系统自动通过';
      }
      case 13: {
        return '直属领导';
      }
      case 14: {
        const fromOtherNodeList = nodeConfig.fromOtherNodeList;
        const s = fromOtherNodeList.map((res) => res.nodeName).join(',');

        return `${s}节点指定`;
      }
      case 15: {
        // 指定部门
        // 指定部门主管
        const deptNameList = nodeConfig.nodeUserList
          .map((res) => res.name)
          .join(',');

        const deptUserType = nodeConfig.deptUserType;

        const roleList = nodeConfig.roleList;
        let roleNameJoin = '';
        if (roleList) {
          roleNameJoin = roleList.map((res) => res.name).join(';');
        }

        // 表单-部门
        return `指定部门：【${deptNameList}】${
          deptUserType === 'allUser'
            ? ' 的人员'
            : (function () {
                return deptUserType === 'role'
                  ? ` 下的角色是【${roleNameJoin}】的人员`
                  : ' 的主管';
              })()
        }`;
      }
      default: {
        if (nodeConfig.assignedType === 8 && nodeConfig.formUserId.length > 0) {
          // 表单-人员
          return `表单人员：${nodeConfig.formUserName}`;
        } else if (
          nodeConfig.assignedType === 9 &&
          nodeConfig.formUserId.length > 0
        ) {
          const deptUserType = nodeConfig.deptUserType;

          const roleList = nodeConfig.roleList;
          let roleNameJoin = '';
          if (roleList) {
            roleNameJoin = roleList.map((res) => res.name).join(';');
          }
          // 是否包含子级部门
          const containChildrenDept = nodeConfig.containChildrenDept;
          // 表单-部门
          return `表单部门(${
            containChildrenDept ? '当前部门以及下级部门' : '仅限当前部门'
          })：【${nodeConfig.formUserName}】${
            deptUserType === 'allUser'
              ? ' 的人员'
              : (function () {
                  return deptUserType === 'role'
                    ? ` 下的角色是【${roleNameJoin}】的人员`
                    : ' 的主管';
                })()
          }`;
        }
      }
    }
    return '';
  },
};

export default new All();
