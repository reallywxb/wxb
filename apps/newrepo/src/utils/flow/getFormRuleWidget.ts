const gets = {} as any;
const modules = import.meta.glob(
  '../../views/modules/flow/components/form/rule/*.ts',
  { eager: true },
);
for (const each in modules) {
  const split = each.split('/');
  const item = split[split.length - 1];
  gets[item.split('.')[0]] = modules[each];
}

export default gets;
