import { AjaxRequest, EVENTS } from '@lib/request';
import Vue from 'vue';

// 所有客户的接口组合集合
const API_LISTS = {
  default: {
    development: [`https://sjwtuf.cfzqtest.com`]
  }
}[__CLIENT__];

// API外部获取的缓存
let Cache: any = null;

/**
 * 获取当前环境的接口组
 */
export const getBaseUrl = async () => {
  if (!API_LISTS[__ENV__]) {
    // 如果本地没有的话就尝试ajax获取 config.json 里的 api 字段
    try {
      // 返回缓存
      if (!Cache) {
        const configJSON = await AjaxRequest.Axios({
          method: 'get',
          url: `./config.json?_=${Date.now()}`
        });
        Cache = configJSON.data;
      }
      return Cache.api;
    } catch (e) {
      throw new Error(
        `没有找到 ${__CLIENT__}(${__ENV__}) 对应的接口地址，尝试创建config.json 文件，配置 api: ['接口地址']`
      );
    }
  }
  return API_LISTS[__ENV__];
};

export const Observer = new Vue();

Observer.$on(EVENTS.RESPONSE_API_SUCCESS, response => {
  console.log('api 成功', response);
});

/**
 * 实例化接口请求类
 */
export default new AjaxRequest({
  baseUrl: getBaseUrl(),
  forceToCamel: 'data',
  APIObserver: Observer,
  APIErrorHandler: function(responseData) {
    return new Promise((resolve, reject) => {
      if (!responseData.error || responseData.error.errorNo == 0) {
        return resolve();
      }
      else {
        reject({
          code: responseData.error.errorNo,
          msg: responseData.error.errorInfo
        });
      }
    });
  }
});
