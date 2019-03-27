import request from '@config/api';
import { action, observable, runInAction, configure } from 'mobx';

configure({ enforceActions: 'always' });

class Demo {
  @observable configs = [];

  /**
   * 测试获取
   */
  async getConfigList() {
    const configs = await request.send('post', {
      url: '/CRH-WT1006'
    });
    runInAction(() => {
      this.configs = configs;
    });
  }
}

export default new Demo;
