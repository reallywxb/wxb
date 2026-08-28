type PageTab = {
  disabled?: boolean;
  label: string;
  value: any;
};
type DetailInfo = {
  [key: string]: any;
  detailTitle: string;
  sourcePage: Tab['value'];
  type: 'add' | 'edit' | 'view';
};
interface JSON extends JSON {
  generalParse: (obj: any) => any;
}
