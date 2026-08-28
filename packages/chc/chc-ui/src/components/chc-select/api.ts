import { getApi } from '../../api/request';
import { MapCache } from '../../utils/cache';

const reqCache = new MapCache();
function getRequestClient() {
  return getApi();
}
export function useSelectListDataApiGet(
  extraParams: { [key: string]: any },
  request?: (url: string) => Promise<any | QueryDataList>,
) {
  return function (
    paramsOri: { [key: string]: any },
    handleParams?: (params: any) => any,
  ) {
    const paramsStr = `GET-${JSON.stringify({ ...extraParams, ...paramsOri })}`;
    // 如果命中请求缓存，直接使用缓存数据
    if (reqCache.has(paramsStr)) {
      return reqCache.get(paramsStr);
    }
    const params =
      handleParams && typeof handleParams === 'function'
        ? handleParams(paramsOri)
        : paramsOri;
    let url = params.dictUrl;
    const urlSearchParams = new URLSearchParams();
    // params内新增paramsMap字段，用于映射params内参数
    // 大致规则如下 例如 params.paramsMap={apiKey:'valueDemo'}
    // 则会将 apiKey作为键, params 内 valueDemo 属性的值作为值，拼接到url后
    if (params.paramsMap && Object.keys(params.paramsMap).length > 0) {
      for (const key in params.paramsMap) {
        if (params[params.paramsMap[key]] === undefined) {
          console.warn('[ChcSelect]: params中无法获取paramsMap映射的参数');
        } else {
          urlSearchParams.set(key, params[params.paramsMap[key]]);
          params[params.paramsMap[key]] = undefined; // 原字段置为undefined，防止后续处理还存在
        }
      }
    }
    if (params.paginate) {
      if (params.current) {
        urlSearchParams.set('current', params.current);
      }
      if (params.limit) {
        urlSearchParams.set('limit', params.limit);
      }
      if (params.query) {
        urlSearchParams.set(params.filterField, params.query);
      }
      if (params.size > 0) {
        urlSearchParams.set('size', params.size);
      }
      if (params.start > 0) {
        urlSearchParams.set('start', params.start);
      }
      // 此处兼容通过 value 查询一条数据的场景
      if (params.value) {
        urlSearchParams.set(params.valueField, params.value);
      }
    } else {
      if (params.query) {
        urlSearchParams.set(params.filterField, params.query);
      }
    }

    for (const key in extraParams) {
      // get接口不管值什么样，都要带进去，让开发看到问题
      // if (extraParams[key]) {
      urlSearchParams.set(key, extraParams[key]);
      // url += `&${key}=${extraParams[key]}`;
      // }
    }
    // 根据 triggerFields 和 triggerFieldKeys 设置依赖数据对应字段
    let triggerHasValue = true;
    // 正则匹配是否有 {{}} 包裹的内容，有的话替换成 dependencies 对应的内容
    const reg = /\{\{(\w+)\}\}/g;
    const hasDependencies = reg.test(url);
    const linkFields = url.match(reg) as string[];
    if (hasDependencies) {
      // 有{{}}表示依赖走这里
      for (const goodStr of linkFields) {
        const fieldName = goodStr?.slice(2, -2);
        url = params.dependencies[fieldName]
          ? url.replace(goodStr, params.dependencies[fieldName])
          : url;
      }
    } else {
      // 其他情况下的依赖走这里
      const midParams: { [key: string]: any } = {};
      const triggerFields = params.triggerFields || [];
      const triggerFieldKeys = params.triggerFieldKeys || {};
      for (const triggerField of triggerFields) {
        if (triggerFieldKeys[triggerField]) {
          midParams[triggerFieldKeys[triggerField]] =
            params.dependencies[triggerField];
        } else {
          midParams[triggerField] = params.dependencies[triggerField];
        }
        !params.dependencies[triggerField] && (triggerHasValue = false);
      }
      for (const key in midParams) {
        if (midParams[key]) {
          urlSearchParams.set(key, midParams[key]);
        }
      }
    }

    if (url.includes('?') && (url.endsWith('?') || url.endsWith('&'))) {
      url = url + urlSearchParams.toString();
    } else if (url.includes('?')) {
      url = `${url}&${urlSearchParams.toString()}`;
    } else if (urlSearchParams.toString().length > 0) {
      url = `${url}?${urlSearchParams.toString()}`;
    }
    // 包含斜杠表示是列表查询
    const promise = new Promise<QueryDataList>((resolve) => {
      if (reg.test(url)) {
        // 如果依赖项没有被替换，不调接口，直接给个空
        resolve({
          records: [],
        });
      } else if (triggerHasValue) {
        if (request) {
          request(`${url}`).then((res) => {
            if (params.formatInterfaceData) {
              resolve(params.formatInterfaceData(res));
            } else {
              resolve(res as QueryDataList);
            }
          });
        } else {
          // 调用接口
          // console.log('url', params.requestConfig);
          getRequestClient()
            .get<any | QueryDataList>(`${url}`, params.requestConfig)
            .then((res) => {
              if (params.formatInterfaceData) {
                resolve(params.formatInterfaceData(res));
              } else {
                resolve(res as QueryDataList);
              }
            })
            .catch(() => {
              resolve({
                records: [],
              });
            });
        }
      } else {
        // 如果依赖项没有被替换，不调接口，直接给个空
        resolve({
          records: [],
        });
      }
    });
    reqCache.set(paramsStr, promise, 1000);
    return promise;
  };
}
// function removeRepeatKey(url: string): string {
//   if (url.endsWith('?')) {
//     return url.slice(0, -1);
//   }
//   // 链接参数去重
//   const baseUrl: string = `${url.split('?')[0] as string}?`;
//   const paramsArr: string[] = url.split('?')[1]?.split('&') as string[];
//   const searchStrObj: { [key: string]: any } = {};
//   for (const element of paramsArr) {
//     const key: string = element.split('=')[0] as string;
//     const value = element.split('=')[1];
//     searchStrObj[key] = value;
//   }
//   let finalUrl = baseUrl;
//   for (const key in searchStrObj) {
//     finalUrl += `${finalUrl.endsWith('?') ? '' : '&'}${key}=${searchStrObj[key]}`;
//   }
//   return finalUrl;
// }
export function useSelectListDataApiPost(
  extraParams: { [key: string]: any },
  request?: (url: string, params: any) => Promise<any | QueryDataList>,
) {
  return function (
    params: { [key: string]: any },
    handleParams?: (params: any) => any,
  ) {
    const paramsStr = `POST-${JSON.stringify({ ...extraParams, ...params })}`;
    if (reqCache.has(paramsStr)) {
      return reqCache.get(paramsStr);
    }
    const preParams: { [key: string]: any } = {};
    // params内新增paramsMap字段，用于映射params内参数
    // 大致规则如下 例如 params.paramsMap={apiKey:'valueDemo'}
    // 则会将 params 内 valueDemo 属性对应的值取出来，给到在 midParams 内新建的 apiKey 属性
    if (params.paramsMap && Object.keys(params.paramsMap).length > 0) {
      for (const key in params.paramsMap) {
        if (params[params.paramsMap[key]] === undefined) {
          console.warn('[ChcSelect]: params中无法获取paramsMap映射的参数');
        } else {
          preParams[key] = params[params.paramsMap[key]];
          params[params.paramsMap[key]] = undefined; // 原字段置为undefined，防止后续处理还存在
        }
      }
    }
    const midParams: { [key: string]: any } = {
      ...preParams,
      current: params.paginate ? params.current : undefined,
      limit: params.paginate ? params.limit : undefined,
      [params.filterField]: params.query || undefined,
      size: params.paginate ? params.size : undefined,
      start: params.paginate ? params.start : undefined,
      [params.valueField]: params.value || undefined,
    };

    let url = params.dictUrl;

    let triggerHasValue = true;
    // 正则匹配是否有 {{}} 包裹的内容，有的话替换成 dependencies 对应的内容
    const reg = /\{\{(\w+)\}\}/g;
    const hasDependencies = reg.test(url);
    const linkFields = url.match(reg) as string[];
    if (hasDependencies) {
      // {{}}表示依赖时，就不再将triggerFields字段添加到params里
      for (const goodStr of linkFields) {
        const fieldName = goodStr?.slice(2, -2);
        url = params.dependencies[fieldName]
          ? url.replace(goodStr, params.dependencies[fieldName])
          : url;
      }
    } else {
      const triggerFields = params.triggerFields || [];
      const triggerFieldKeys = params.triggerFieldKeys || {};
      for (const triggerField of triggerFields) {
        if (triggerFieldKeys[triggerField]) {
          midParams[triggerFieldKeys[triggerField]] =
            params.dependencies[triggerField];
        } else {
          midParams[triggerField] = params.dependencies[triggerField];
        }
        !params.dependencies[triggerField] && (triggerHasValue = false);
      }
    }

    // 包含斜杠表示是列表查询
    const promise = new Promise<QueryDataList>((resolve) => {
      if (triggerHasValue) {
        if (request) {
          request(
            `${url}`,
            handleParams && typeof handleParams === 'function'
              ? handleParams({ ...midParams, ...extraParams })
              : { ...midParams, ...extraParams },
          ).then((res) => {
            if (params.formatInterfaceData) {
              resolve(params.formatInterfaceData(res));
            } else {
              resolve(res as QueryDataList);
            }
          });
        } else {
          getRequestClient()
            .post<any | QueryDataList>(
              `${url}`,
              handleParams && typeof handleParams === 'function'
                ? handleParams({ ...midParams, ...extraParams })
                : { ...midParams, ...extraParams },
              params.requestConfig,
            )
            .then((res) => {
              if (params.formatInterfaceData) {
                resolve(params.formatInterfaceData(res));
              } else {
                resolve(res as QueryDataList);
              }
            })
            .catch(() => {
              resolve({
                records: [],
              });
            });
        }
      } else {
        // 如果依赖项没有被替换，不调接口，直接给个空
        resolve({
          records: [],
        });
      }
    });
    reqCache.set(paramsStr, promise, 1000);
    return promise;
  };
}

export function useChcSelectListDataApi(extraParams?: { [key: string]: any }) {
  return {
    selectListDataGet: useSelectListDataApiGet(extraParams || {}),
    selectListDataPost: useSelectListDataApiPost(extraParams || {}),
  };
}
