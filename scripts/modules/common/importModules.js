import { visList } from '../visualisers/registeredVis.js';

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
      visualiserModules[vis.name] = await import(modulePath);
    }
  }
  return await Promise.resolve(visualiserModules);
};

export { importModules };
