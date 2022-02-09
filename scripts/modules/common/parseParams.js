import { hexToRgb } from '../util/utils.js';

const parseParams = (visualiser, slim = false) => {
  // rearrange array of parameters into objects for ease of access
  const moduleParams = {};
  for (let param of visualiser.params) {
    if (param.type === 'colour' && !Array.isArray(param.value)) param.value = hexToRgb(param.value);
    if (slim) moduleParams[param.name] = param.value;
    else moduleParams[param.name] = param;
  }
  visualiser.params = moduleParams;
};

export default parseParams;
