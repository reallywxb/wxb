type OnActionClickParams<T = Recordable<any>> = {
  code: string;
  row: T;
};
type OnActionClickFn<T = Recordable<any>> = (
  params: OnActionClickParams<T>,
) => void;
