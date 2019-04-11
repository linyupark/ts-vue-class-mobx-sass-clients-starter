
import { isObservable } from 'mobx';
import Vue from 'vue';

export default function collectData(vm, data) {
  const dataDefinition =
    typeof data === 'function' ? data.call(vm, vm) : data || {};
  const filteredData = Object.keys(dataDefinition).reduce(
    (result, field) => {
      const value = dataDefinition[field];
      if (isObservable(value)) {
        Object.defineProperty(vm, field, {
          configurable: true,
          get() {
            return value;
          },
          set() {}
        });
      } else {
        result[field] = value;
      }

      return result;
    },
    {}
  );

  return filteredData;
}
