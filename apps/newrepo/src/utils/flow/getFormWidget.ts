const gets = {} as any;
const modules = import.meta.glob(
  '../../views/modules/flow/components/form/*.vue',
  { eager: true },
);

for (const each in modules) {
  // var str = (modules[each] as any).default.__file;
  // var obj = str.lastIndexOf("/");
  //
  // const name = str.substr(obj + 1, str.lastIndexOf(".") - obj - 1);
  const name = modules[each].default.__name;

  gets[name] = (modules[each] as any).default;
}

export default gets;
