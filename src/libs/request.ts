/**
 * 基于axios的封装
 */

import Axios, { AxiosInstance } from 'axios';

/**
 * 构建接口
 */
interface constructorParams {
  // 接口基础地址 [接口1, 接口2...]
  baseUrl: Promise<any>;
  // 传输的数据字段是否强制转换成驼峰模式，是的话传入转换的数据根字段 比如 { data: { ... } } 则传 'data'
  forceToCamel?: false | string;
  // 请求为跨域类型时是否在请求中协带 cookie
  withCredentials?: boolean | undefined;
  // 超时时间
  timeout?: number;
  // 设置请求 header 配置
  headers?: object;
  // 对API返回的错误代码处理函数
  APIErrorHandler(responseData: any): Promise<any>;
  // API 观察者
  APIObserver: any;
}

interface sendParams {
  // baseUrl+url 构成的完整请求地址
  url: string;
  // 传输的数据
  data?: object;
  // 接口调用第几个默认：0
  group?: number;
  // 是否要强制变换字段 （toName: 下划线, toCamel: 驼峰）
  transform?: 'toName' | 'toCamel';
}

/**
 * 接口相关事件字典
 * 方便手动触发某个类型的事件或是在需要埋点的地方捕捉对应结果
 */
export const EVENTS = {
  RESPONSE_HTTP_ERROR: 'response.http.error',
  RESPONSE_API_ERROR: 'response.api.error',
  RESPONSE_API_SUCCESS: 'response.api.success'
};

/**
 * 下划线转驼峰
 * @param {String} str 需要下划线转为驼峰的字符串
 */
export const _ToCamel = function(str: string) {
  return str.replace(/\_(\w)/g, (all, letter) => {
    return letter.toUpperCase();
  });
};
// 恢复
export const camelTo_ = function(str: string) {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase();
};

/**
 * object => serialize
 * @param  {Object} obj
 * @return {String}
 */
export const serialize = (obj: any = {}) =>
  Object.keys(obj)
    .map(k => {
      if (~Object.prototype.toString.call(obj[k]).search(/Array|Object/)) {
        obj[k] = JSON.stringify(obj[k]);
      }
      return `${encodeURIComponent(k)}=${encodeURIComponent(obj[k])}`;
    })
    .join('&');

/**
 * 批量改驼峰字段
 */
const keyTransf = (
  store: any,
  obj: any,
  direct: 'toCamel' | 'toName' = 'toCamel'
) => {
  Object.keys(obj).forEach(key => {
    const transFun = direct === 'toCamel' ? _ToCamel : camelTo_;
    store[transFun(key)] = obj[key];
    if (~Object.prototype.toString.call(obj[key]).search('Array')) {
      obj[key].forEach((subObj: any, i: number) => {
        keyTransf(store[transFun(key)][i], subObj, direct);
      });
    }
    key != transFun(key) && delete store[key];
  });
  return store;
};

/**
 * 请求终止控制生成
 */
const CancelToken = Axios.CancelToken.source();

/**
 * Ajax 请求类封装
 */
export class AjaxRequest {
  // 可通过静态方法直接获取
  static Axios = Axios;

  params: constructorParams;
  xhr: AxiosInstance;
  observer: any;

  constructor(params: constructorParams) {
    // 配置参数
    this.params = {
      forceToCamel: false,
      withCredentials: false,
      timeout: 20000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      },
      APIErrorHandler: responseData => {
        return Promise.resolve(responseData);
      },
      ...params
    };

    // 实例化 xhr
    this.xhr = Axios.create();
    this.xhr.defaults.withCredentials = this.params.withCredentials;

    // request 拦截
    this.injectRequest();

    // response 拦截
    this.injectResponse();
  }

  /**
   * 发送请求
   */
  async send(method: 'post' | 'get', sendParams: sendParams) {
    let sendData: any = {};
    let params = {
      url: '',
      data: {},
      group: 0,
      transform: null,
      ...sendParams
    };
    let baseUrl = await this.params.baseUrl;
    let fullUrl = `${baseUrl}${params.url}`;
    if (params.transform) {
      // 强制驼峰的则返回的数据要变回去
      params.data = keyTransf(sendData, params.data, params.transform);
    }
    const result = await this.xhr({
      method,
      url: fullUrl,
      data: serialize(params.data),
      timeout: this.params.timeout,
      maxRedirects: 0,
      cancelToken: CancelToken.token
    });
    return result.data;
  }

  /**
   * 取消请求
   * @param message 取消请求的提示信息
   */
  cancel(message?: string) {
    CancelToken.cancel(message);
  }

  /**
   * 对外发送事件
   */
  emit(...args) {
    return (
      this.params.APIObserver.$emit || this.params.APIObserver.emit
    ).apply(this.params.APIObserver, args);
  }

  /**
   * response 拦截
   */
  injectResponse() {
    this.xhr.interceptors.response.use(
      async response => {
        // 如果需要强制驼峰 循环字段，改为驼峰
        if (this.params.forceToCamel) {
          let responseData: any = {};
          responseData = keyTransf(
            responseData,
            response.data[this.params.forceToCamel]
          );
          response.data = responseData;
          console.log('API 驼峰返回:', responseData);
        }

        // 把得到的返回数据经过错误处理过滤
        try {
          await this.params.APIErrorHandler(response.data);
          // 成功请求发送事件
          this.emit(EVENTS.RESPONSE_API_SUCCESS, response);
        } catch (error) {
          this.emit(EVENTS.RESPONSE_API_ERROR, error);
        } finally {
          return response;
        }
      },
      error => {
        this.emit(EVENTS.RESPONSE_HTTP_ERROR, error);
        Promise.reject(error);
      }
    );
  }

  /**
   * request 相关的拦截处理
   */
  injectRequest() {
    this.xhr.interceptors.request.use(
      config => {
        config.headers = this.params.headers;
        return config;
      },
      error => {
        this.emit(EVENTS.RESPONSE_HTTP_ERROR, error);
        Promise.reject(error);
      }
    );
  }
}
