export interface LogItem {
  value: string;
  type: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  time?: string;
}

export type TabName = string;

export interface TaskElement extends HTMLElement {
  onclick?: () => void;
}

export interface VideoElement extends HTMLVideoElement {
  muted: boolean;
}

export interface TaskResponse {
  type: 'single' | 'multiple' | 'true_false';
  question: string;
  answer: string[] | boolean;
}

export interface QuestionData {
  question: string;
  options: string[];
}


// 定义单个参数的类型
interface Param {
  value: boolean | number | string; // 参数值可以是布尔值、数字或字符串
  name?: string; // 参数名称（可选）
  type?: string; // 参数类型（可选）
}

// 定义 parts 的类型
interface Part {
  params: Param[]; // 每个 part 包含多个参数
}

// 定义平台参数的类型
interface PlatformParams {
  [key: string]: { // 动态键名（如 'cx'）
    parts: Part[]; // 每个平台包含多个 parts
  };
}

// 定义其他参数的类型
interface OtherParams {
  name: string; // 其他参数的名称
  params: Param[]; // 其他参数的列表
}
interface LogEntry {
  time: string; // 时间
  value: string; // 日志值
  type: 'success' | 'warning' | 'error' | 'primary' | 'danger'; // 日志类型
}

// 定义 configStore 的类型
export interface ConfigStore {
  platformParams: PlatformParams; // 平台参数
  otherParams: OtherParams; // 其他参数
  rate: number; // 完成率
  currentPageTabs: string[]; // 当前任务章节 tab
  nowIdx: number; // 当前 tab 索引
  title: string; // 标题
  logData: LogEntry[]; // 日志数据

}