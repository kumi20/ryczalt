export interface ICustomSearchItem {
  value: string;
  label: string;
  type?: ICustomSearchItemType;
  autoEmit?: boolean;
}

export type ICustomSearchItemType = 'data' | 'string' | 'number';

export interface ICustomDropDownBoxValueChanged {
  selectedItem: ICustomSearchItem;
  filterValue: string | number;
  autoEmit?: boolean;
}
