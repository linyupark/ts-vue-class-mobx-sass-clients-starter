/**
 * 纪录路由变化，来判断是向前还是向后
 * @author linyupark@gmail.com
 */

/**
 * 保存在浏览器里的 session 名称
 */
const HISTORY_SESS_NAME = '$$_routerHistory';

/**
 * 获取历史纪录
 */
const _getHistory = () => {
  try {
    return JSON.parse(sessionStorage.getItem(HISTORY_SESS_NAME) || '[]');
  } catch (e) {
    throw `router history session parse error.`;
  }
};

interface routerObject {
  path: string;
  name?: string;
}

interface routerSlideToParams {
  to: routerObject;
  from: routerObject;
  // 是否是容器内点击的跳转，true 则不是
  native: boolean;
}

// 路由 path 纪录缓存
let pathList: string[] = _getHistory();

const routerSlideTo = (routerParams: routerSlideToParams) => {
  // 方向
  let direction = 'forward';

  // 取值
  const { from, to, native } = routerParams;
  const fromIndex = pathList.indexOf(from.path);
  const toIndex = pathList.indexOf(to.path);

  // 存在
  if (~toIndex) {
    direction = toIndex > fromIndex ? 'forward' : 'back';
    if (native) {
      // 包含的是原生的则一律 back （移动端先不考虑前进）
      direction = 'back';
    }
    if (!from.name) {
      // 存在过去，但是第一次刷新
      direction = 'none';
    }
  } else {
    // 第一页没有方向
    if (pathList.length === 0) {
      direction = 'none';
    }
    pathList.push(to.path);
    sessionStorage.setItem(HISTORY_SESS_NAME, JSON.stringify(pathList));
  }

  console.log(`router transition direction: ${direction}`);

  return direction;
};

export default routerSlideTo;
