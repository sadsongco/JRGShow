import { visList } from "../visualisers/registeredVis.js";

/**
 * imports all of the registered visualiser modules into global visualiserModules array
 */
export const importModules = async function () {
    const visualiserModules = {};
    for (let visGroup of visList) {
        for (let vis of visGroup.visualisers) {
            const modulePath = `../visualisers/${visGroup.visGroup}/${vis.name}.js`;
            visualiserModules[vis.name] = await import(modulePath)
        }
    }
    return  visualiserModules;
};
