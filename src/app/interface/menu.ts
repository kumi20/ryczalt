export interface MainMenu {
  id: string;
  name: string;
  icon?: string;
  url: string | null;
  items?: MainMenu[];
  tooltip?: boolean;
  code?: string | null;
  visible?: boolean;
  signature?: string;
  classCss?: string;
}
