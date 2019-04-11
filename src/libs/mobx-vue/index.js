import { Reaction } from 'mobx';
import Vue, { ComponentOptions } from 'vue';
import collectDataForVue from './collectData';

const noop = () => {};
const disposerSymbol = Symbol('disposerSymbol');
function observer(Component) {
  const name =
    Component.name ||
    Component._componentTag ||
    (Component.constructor && Component.constructor.name) ||
    '<component>';
  const originalOptions =
    typeof Component === 'object' ? Component : Component.options;
  // To not mutate the original component options, we need to construct a new one
  const dataDefinition = originalOptions.data;
  const options = {
    ...originalOptions,
    name,
    data: vm => collectDataForVue(vm, dataDefinition),
    // overrider the cached constructor to avoid extending skip
    // @see https://github.com/vuejs/vue/blob/6cc070063bd211229dff5108c99f7d11b6778550/src/core/global-api/extend.js#L24
    _Ctor: {}
  };

  // we couldn't use the Component as super class when Component was a VueClass, that will invoke the lifecycle twice after we called Component.extend
  const superProto =
    typeof Component === 'function' &&
    Object.getPrototypeOf(Component.prototype);
  const Super = superProto instanceof Vue ? superProto.constructor : Vue;
  const ExtendedComponent = Super.extend(options);

  const { $mount, $destroy } = ExtendedComponent.prototype;

  ExtendedComponent.prototype.$mount = function() {
    let mounted = false;
    this[disposerSymbol] = noop;

    let nativeRenderOfVue;
    const reactiveRender = (...args) => {
      reaction.track(() => {
        if (!mounted) {
          $mount.apply(this, args);
          mounted = true;
          nativeRenderOfVue = this._watcher.getter;
          // rewrite the native render method of vue with our reactive tracker render
          // thus if component updated by vue watcher, we could re track and collect dependencies by mobx
          this._watcher.getter = reactiveRender;
        } else {
          nativeRenderOfVue.call(this, this);
        }
      });

      return this;
    };

    const reaction = new Reaction(`${name}.render()`, reactiveRender);

    this[disposerSymbol] = reaction.getDisposer();

    return reactiveRender();
  };

  ExtendedComponent.prototype.$destroy = function() {
    this[disposerSymbol]();
    $destroy.apply(this);
  };

  const extendedComponentNamePropertyDescriptor =
    Object.getOwnPropertyDescriptor(ExtendedComponent, 'name') || {};
  if (extendedComponentNamePropertyDescriptor.configurable === true) {
    Object.defineProperty(ExtendedComponent, 'name', {
      writable: false,
      value: name,
      enumerable: false,
      configurable: false
    });
  }

  return ExtendedComponent;
}

export { observer, observer as Observer };
