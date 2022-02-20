let randGrey, randRgb, malloc, free, mem;

(async () => {
  const fetchPromise = fetch('../../wasm/randomCols.wasm');
  const { instance } = await WebAssembly.instantiateStreaming(fetchPromise, {
    env: {
      malloc: (len) => wasmMalloc(len),
      free: (addr) => wasmFree(addr),
      emscripten_resize_heap: (arg) => console.log(arg),
    },
  });
  randGrey = instance.exports.rand_grey;
  randRgb = instance.exports.rand_rgb;
  malloc = instance.exports.malloc;
  free = instance.exports.free;
  mem = instance.exports.memory;
})();

export const getRandGrey = () => {
  return randGrey();
};

export const getRandRGB = () => {
  var output_ptr = malloc(6);
  randRgb(output_ptr);
  const result = new Uint16Array(mem.buffer, output_ptr, 3);
  // dealloc memory to avoid memory leaks
  free(output_ptr);
  return [...result];
};
