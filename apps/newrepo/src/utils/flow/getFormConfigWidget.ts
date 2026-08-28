const gets = {} as any;
const modules = import.meta.glob(
  '../../views/modules/flow/components/form/config/*.vue',
  { eager: true },
);

for (const each in modules) {
  const name = modules[each].default.__name;

  gets[name] = (modules[each] as any).default;
}

export default gets;
