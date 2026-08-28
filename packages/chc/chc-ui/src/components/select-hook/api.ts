import { getApi } from '../../api/request';

interface DictData {
  [key: string]: any;
  code: number | string;
  label: string;
  value: string;
}
function getRequestClient() {
  return getApi();
}
// 获取列表数据get接口
export async function selectListDataGet(params: { [key: string]: any }) {
  let url = '';
  if (params.paginate) {
    url = params.dictUrl.includes('?')
      ? `${params.dictUrl}&`
      : `${params.dictUrl}?`;
    if (params.current) {
      url += `&current=${params.current}`;
    }
    if (params.limit) {
      url += `&limit=${params.limit}`;
    }
    if (params.query) {
      url += `&${params.filterField}=${params.query}`;
    }
    if (params.size > 0) {
      url += `&size=${params.size}`;
    }
    if (params.start > 0) {
      url += `&start=${params.start}`;
    }
    // url = `${params.dictUrl.includes('?') ? `${params.dictUrl}&` : `${params.dictUrl}?`}current=${params.current}&limit=${params.limit}&${params.filterField}=${params.query || ''}&size=${params.size}&start=${params.start}`;
    // 此处兼容通过 value 查询一条数据的场景
    if (params.value) {
      url += `&value=${params.value}`;
    }
  } else {
    url = params.dictUrl.includes('?')
      ? `${params.dictUrl}&`
      : `${params.dictUrl}?`;
    if (params.query) {
      url += `&${params.filterField}=${params.query}`;
    }
    // url = `${params.dictUrl.includes('?') ? `${params.dictUrl}&` : `${params.dictUrl}?${params.filterField}=${params.query || ''}`}`;
  }
  // 正则匹配是否有 {{}} 包裹的内容，有的话替换成 dependencies 对应的内容
  const reg = /\{\{(\w+)\}\}/g;
  const hasDependencies = reg.test(url);
  const linkFields = url.match(reg) as string[];
  if (hasDependencies) {
    for (const goodStr of linkFields) {
      const fieldName = goodStr?.slice(2, -2);
      url = params.dependencies[fieldName]
        ? url.replace(goodStr, params.dependencies[fieldName])
        : url;
    }
  }
  // 包含斜杠表示是列表查询
  return new Promise<QueryDataList>((resolve) => {
    if (reg.test(url)) {
      // 如果依赖项没有被替换，不调接口，直接给个空
      resolve({
        records: [],
      });
    } else {
      // 调用接口
      getRequestClient()
        .get<any | QueryDataList>(`${url}`)
        .then((res) => {
          if (params.formatInterfaceData) {
            resolve(params.formatInterfaceData(res));
          } else {
            resolve(res as QueryDataList);
          }
        });
    }
  });
}
export function useSelectListDataApiGet(
  extraParams: { [key: string]: any },
  request?: (url: string) => Promise<any | QueryDataList>,
) {
  return function (
    paramsOri: { [key: string]: any },
    handleParams?: (params: any) => any,
  ) {
    const params =
      handleParams && typeof handleParams === 'function'
        ? handleParams(paramsOri)
        : paramsOri;
    let url = '';
    if (params.paginate) {
      url = params.dictUrl.includes('?')
        ? `${params.dictUrl}&`
        : `${params.dictUrl}?`;
      if (params.current) {
        url += `&current=${params.current}`;
      }
      if (params.limit) {
        url += `&limit=${params.limit}`;
      }
      if (params.query) {
        url += `&${params.filterField}=${params.query}`;
      }
      if (params.size > 0) {
        url += `&size=${params.size}`;
      }
      if (params.start > 0) {
        url += `&start=${params.start}`;
      }
      // url = `${params.dictUrl.includes('?') ? `${params.dictUrl}&` : `${params.dictUrl}?`}current=${params.current}&limit=${params.limit}&${params.filterField}=${params.query || ''}&size=${params.size}&start=${params.start}`;
      // 此处兼容通过 value 查询一条数据的场景
      if (params.value) {
        url += `&value=${params.value}`;
      }
    } else {
      url = params.dictUrl.includes('?')
        ? `${params.dictUrl}&`
        : `${params.dictUrl}?`;
      if (params.query) {
        url += `&${params.filterField}=${params.query}`;
      }
      // url = `${params.dictUrl.includes('?') ? `${params.dictUrl}&${params.filterField}=${params.query || ''}` : `${params.dictUrl}?${params.filterField}=${params.query || ''}`}`;
    }
    if (url.endsWith('&')) {
      url = url.slice(0, -1);
    }
    for (const key in extraParams) {
      if (extraParams[key]) {
        url += `&${key}=${extraParams[key]}`;
      }
    }
    // 根据 triggerFields 和 triggerFieldKeys 设置依赖数据对应字段
    const triggerHasValue = true;
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
      // !params.dependencies[triggerField] && (triggerHasValue = false);
    }
    for (const key in midParams) {
      if (midParams[key]) {
        url += `&${key}=${midParams[key]}`;
      }
    }
    // 正则匹配是否有 {{}} 包裹的内容，有的话替换成 dependencies 对应的内容
    const reg = /\{\{(\w+)\}\}/g;
    const hasDependencies = reg.test(url);
    const linkFields = url.match(reg) as string[];
    if (hasDependencies) {
      for (const goodStr of linkFields) {
        const fieldName = goodStr?.slice(2, -2);
        url = params.dependencies[fieldName]
          ? url.replace(goodStr, params.dependencies[fieldName])
          : url;
      }
    }
    // 链接参数去重
    // const baseUrl: string = `${url.split('?')[0] as string}?`;
    // const paramsArr: string[] = url.split('?')[1]?.split('&') as string[];
    // const searchStrObj: { [key: string]: any } = {};
    // for (const element of paramsArr) {
    //   const key: string = element.split('=')[0] as string;
    //   const value = element.split('=')[1];
    //   searchStrObj[key] = value;
    // }
    // url = baseUrl;
    // for (const key in searchStrObj) {
    //   url += `${url.endsWith('?') ? '' : '&'}${key}=${searchStrObj[key]}`;
    // }
    url = removeRepeatKey(url);
    // 包含斜杠表示是列表查询
    return new Promise<QueryDataList>((resolve) => {
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
          getRequestClient()
            .get<any | QueryDataList>(`${url}`, paramsOri.requestConfig)
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
  };
}
function removeRepeatKey(url: string): string {
  // 链接参数去重
  const baseUrl: string = `${url.split('?')[0] as string}?`;
  const paramsArr: string[] = url.split('?')[1]?.split('&') as string[];
  const searchStrObj: { [key: string]: any } = {};
  for (const element of paramsArr) {
    const key: string = element.split('=')[0] as string;
    const value = element.split('=')[1];
    searchStrObj[key] = value;
  }
  let finalUrl = baseUrl;
  for (const key in searchStrObj) {
    finalUrl += `${finalUrl.endsWith('?') ? '' : '&'}${key}=${searchStrObj[key]}`;
  }
  return finalUrl;
}
export function useSelectListDataApiPost(
  extraParams: { [key: string]: any },
  request?: (url: string, params: any) => Promise<any | QueryDataList>,
) {
  return function (
    params: { [key: string]: any },
    handleParams?: (params: any) => any,
  ) {
    const midParams: { [key: string]: any } = {
      current: params.paginate ? params.current : undefined,
      limit: params.paginate ? params.limit : undefined,
      [params.filterField]: params.query || undefined,
      size: params.paginate ? params.size : undefined,
      start: params.paginate ? params.start : undefined,
      value: params.value || undefined,
    };
    let url = params.dictUrl;

    const triggerHasValue = true;
    const triggerFields = params.triggerFields || [];
    const triggerFieldKeys = params.triggerFieldKeys || {};
    for (const triggerField of triggerFields) {
      if (triggerFieldKeys[triggerField]) {
        midParams[triggerFieldKeys[triggerField]] =
          params.dependencies[triggerField];
      } else {
        midParams[triggerField] = params.dependencies[triggerField];
      }
      // !params.dependencies[triggerField] && (triggerHasValue = false);
    }

    // 正则匹配是否有 {{}} 包裹的内容，有的话替换成 dependencies 对应的内容
    const reg = /\{\{(\w+)\}\}/g;
    const hasDependencies = reg.test(url);
    const linkFields = url.match(reg) as string[];
    if (hasDependencies) {
      for (const goodStr of linkFields) {
        const fieldName = goodStr?.slice(2, -2);
        url = params.dependencies[fieldName]
          ? url.replace(goodStr, params.dependencies[fieldName])
          : url;
      }
    }

    // 包含斜杠表示是列表查询
    return new Promise<QueryDataList>((resolve) => {
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
  };
}

// 获取字典数据get接口
export async function selectDictDataGet(params: { [key: string]: any }) {
  return new Promise((resolve) => {
    getRequestClient()
      .get<DictData>(`${params.dictUrl}`)
      .then((res) => {
        resolve(res);
      });
  });
}

// 获取字典数据post接口
export async function selectDictDataPost(params: { [key: string]: any }) {
  return new Promise((resolve) => {
    getRequestClient()
      .post<DictData>(`${params.dictUrl}`)
      .then((res) => {
        resolve(res);
      });
  });
}
// 获取字典数据get接口
export async function selectDictDataGetBody(params: { [key: string]: any }) {
  return new Promise((resolve) => {
    getRequestClient()
      .get<DictData>(`${params.dictUrl}`, {
        responseReturn: 'body',
      })
      .then((res) => {
        resolve(res);
      });
  });
}

// 获取字典数据post接口
export async function selectDictDataPostBody(params: { [key: string]: any }) {
  return new Promise((resolve) => {
    getRequestClient()
      .post<DictData>(`${params.dictUrl}`, {
        responseReturn: 'body',
      })
      .then((res) => {
        resolve(res);
      });
  });
}

// 获取字典数据get接口
export async function selectDictDataGetRaw(params: { [key: string]: any }) {
  return new Promise((resolve) => {
    getRequestClient()
      .get<DictData>(`${params.dictUrl}`, {
        responseReturn: 'raw',
      })
      .then((res) => {
        resolve(res);
      });
  });
}

// 获取字典数据post接口
export async function selectDictDataPostRaw(params: { [key: string]: any }) {
  return new Promise((resolve) => {
    getRequestClient()
      .post<DictData>(`${params.dictUrl}`, {
        responseReturn: 'raw',
      })
      .then((res) => {
        resolve(res);
      });
  });
}
export function useChcSelectListDataApi(extraParams?: { [key: string]: any }) {
  return {
    selectListDataGet: useSelectListDataApiGet(extraParams || {}),
    selectListDataPost: useSelectListDataApiPost(extraParams || {}),
  };
}

export function useChcSelectDictDataApi() {
  return {
    selectDictDataGet: selectDictDataGetBody,
    selectDictDataPost: selectDictDataPostBody,
  };
}
