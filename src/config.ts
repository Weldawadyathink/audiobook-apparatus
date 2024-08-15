// Object.defineProperty()

type GenericConfigType = Record<string, unknown>;

const internalConfig = {
  // TODO: Add needed config options
  a: 8,
  abc: 3,
  b: 4,
};

// @ts-expect-error Missing properties will be added shortly
const config: typeof internalConfig = {};
Object.keys(internalConfig).forEach((key) => {
  Object.defineProperty(config, key, {
    get() {
      return (internalConfig as GenericConfigType)[key];
    },
    set(newValue) {
      // TODO: Dump internalConfig to disk with every change
      console.log(`did the setter for ${key}`);
      (internalConfig as GenericConfigType)[key] = newValue;
    },
  });
});

export { config };
