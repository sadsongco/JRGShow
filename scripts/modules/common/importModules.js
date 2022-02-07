import { visList } from "../visualisers/registeredVis.js";
import { hexToRgb } from '../util/utils.js';

/**
 * imports all of the registered visualiser modules into global visualiserModules array
 */
const importModules = async function () {
  const visualiserModules = {};
  const path = '../visualisers/';
  for (let visGroup of visList) {
    for (let vis of visGroup.visualisers) {
      const modulePath = `${path}${visGroup.visGroup}/${vis.name}.js`;
      const currModule = await import(modulePath);
      visualiserModules[vis.name] = new currModule[vis.name]();
      //   rearrange array of parameters into objects for ease of access
      const moduleParams = {};
      for (let param of visualiserModules[vis.name].params) {
        if (param.type === 'colour' && !Array.isArray(param.value)) param.value = hexToRgb(param.value);
        moduleParams[param.name] = param;
      }
      visualiserModules[vis.name].params = moduleParams;
    }
  }
  return await Promise.resolve(visualiserModules);
};

export { importModules }