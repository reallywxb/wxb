/**
 * 深拷贝一个普通js对象
 */
export function deepClone(source: any, hash = new WeakMap()) {
  // 基础类型直接返回
  if (source === null || typeof source !== 'object') return source;

  // 处理循环引用
  if (hash.has(source)) return hash.get(source);

  // 处理 Date
  if (source instanceof Date) return new Date(source);

  // 处理 RegExp
  if (source instanceof RegExp) return new RegExp(source);

  // 初始化拷贝对象（保留原型链）
  const clone = Object.create(Object.getPrototypeOf(source));

  hash.set(source, clone); // 记录已拷贝对象

  // 遍历属性
  for (const key of Reflect.ownKeys(source)) {
    clone[key] = deepClone(source[key], hash);
  }

  return clone;
}

/**
 * 封装promise，返回一个promise，promise成功返回[res, null]，失败返回[null, error]
 * @param fn
 * @param args
 * @returns Promise
 */
export const promiseController = <T extends any[] = any[]>(
  fn: (...args: T) => Promise<any>,
  ...args: T
) => {
  return new Promise<[any, null] | [null, any]>((resolve) => {
    fn(...args)
      .then((res) => {
        resolve([res, null]);
      })
      .catch((error) => {
        resolve([null, error]);
      });
  });
};

/**
 * 对一个有可能是对象或函数的数据进行封装
 * 为对象时，直接添加或修改一些属性
 * 为函数时，为函数的返回值添加或修改一些属性
 * @param ori 源对象或函数
 * @param fn 包装方法
 */
export function packageFnOrObj<T extends object>(
  ori: (() => T) | T, // 一个返回对象的函数或者一个对象
  fn: (obj: T) => T, // 针对ori或者ori返回值的处理函数
) {
  if (typeof ori === 'function') {
    // 原场景--不保留数据响应式
    const original = ori();
    const newObj = fn(original);
    return () => newObj;

    // 如果ori返回的对象内有响应式数据，怎么做能在改变返回对象结构的同时保持原来的响应式
    // 保留数据响应式写法--会出现循环调用的问题
    // // let count: null | number = 1;
    // const original = ori;
    // let newObj: T;
    // // 修改函数的行为
    // const wrappedFunction = (...args: any[]) => {
    //   // count = null;
    //   const result = Reflect.apply(original, undefined, args);
    //   const finalResult = fn(result);
    //   newObj = Object.assign(newObj || {}, finalResult); // 定义一个新的对象，每次执行都会根据最新的对象来修改，保证了第二次运行不会丢失原有属性
    //   return newObj;
    // };
    // wrappedFunction();
    // // count === 1 && wrappedFunction();
    // return wrappedFunction;
  } else {
    return fn(ori);
  }
}
