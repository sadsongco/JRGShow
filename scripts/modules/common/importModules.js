import { visList } from "../visualisers/registeredVis.js";
import { visualiserModules } from "../../creator.js";

/**
 * imports all of the registered visualiser modules into global visualiserModules array
 */
export const importModules = async function () {
    for (let visGroup of visList) {
        for (let vis of visGroup.visualisers) {
            const modulePath = `../visualisers/${visGroup.visGroup}/${vis.name}.js`;
            import(modulePath)
                .then((module) => {
                    visualiserModules[vis.name] = module;
                });
        }
    }
};
