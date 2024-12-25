export interface LogItem {
  value: string;
  type: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  time?: string;
}

export type TabName = string;

export interface TaskElement extends HTMLElement {
  onclick?: () => void;
}
