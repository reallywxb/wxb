import { getRandomId, isNotBlank } from './objutil.ts';

function isNode(node) {
  return node && isNotBlank(node.id);
}

/**
 * 判断是否是分支
 * @param type
 * @returns boolean
 */
function isBranch(type) {
  return type === 4 || type === 5 || type === 8;
}

/**
 * 重新设置nodeid
 * @param node
 */
export function resetNodeId(node, parentId) {
  if (!isNode(node)) {
    return;
  }
  node.id = getRandomId();
  node.parentId = parentId;
  const childNode = node.childNode;
  if (!isNode(childNode)) {
    return;
  }
  const type = node.type;

  if (isBranch(type)) {
    const branchs = node.conditionNodes;

    for (const branch of branchs) {
      resetNodeId(branch, node.id);
    }
  }
  resetNodeId(childNode, node.id);
}

/**
 * 获取除了分支之后的所有节点
 * @param node
 */
export function getAllNodeExceptBranch(node) {
  let arr = [];

  if (!isNode(node)) {
    return arr;
  }

  if (isBranch(node.type)) {
    const branchs = node.conditionNodes;

    for (const branch of branchs) {
      const list = getAllNodeExceptBranch(branch.childNode);
      arr = [...arr, ...list];
    }
  } else if (node.type !== 0) {
    arr.push(node);
  }

  const list = getAllNodeExceptBranch(node.childNode);
  return [...arr, ...list];
}
