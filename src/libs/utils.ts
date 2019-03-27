
/**
 * 数组换位
 * @param arr 需要被换位的数组
 * @param from 换位来源
 * @param to 目标
 */
export const arrayMove = (arr, from, to) => {
  arr.splice(to, 0, arr.splice(from, 1)[0]);
  return arr;
}

/**
 * hash search 转对象
 * ?a=a&b=b => {a:'a',b:'b'}
 * @param  {String} hash
 * @return {Object}
 */
export const search2obj: any = (hash = '') => {
  let ret = {},
    seg = decodeURIComponent(hash)
      .replace(/^\?/, '')
      .split('&'),
    len = seg.length,
    i = 0,
    s;
  for (; i < len; i++) {
    if (!seg[i]) {
      continue;
    }
    s = seg[i].split('=');
    ret[s[0]] = s[1];
  }
  return ret;
};