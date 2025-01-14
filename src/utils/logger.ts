export interface LogMessage {
  message: string;
  level: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  taskType?: string;
  details?: any;
}

export interface LoggerOptions {
  addList: (log: Partial<LogMessage>) => void;
}

export class Logger {
  private addList: (log: Partial<LogMessage>) => void;

  constructor(cb) {
    this.addList = cb;
  }

  private createLog(
    message: string,
    level: LogMessage['level'],
    taskType?: string,
    details?: any
  ): LogMessage {
    return {
      message,
      level,
      timestamp: new Date().toLocaleTimeString(),
      taskType,
      details,
    };
  }

  // 视频任务相关日志
  videoTask = {
    // 开始播放
    start: () => {
      this.addList(this.createLog(`尝试播放视频任务`, 'info', 'video'));
    },
    playing: () => {
      this.addList(this.createLog(`播放成功`, 'success', 'video'));
    },
    // 播放进度
    progress: (current: number, total: number) => {
      this.addList(
        this.createLog(
          `视频播放进度: ${Math.round((current / total) * 100)}%`,
          'info',
          'video',
          { current, total }
        )
      );
    },
    // 视频题目
    videoTitle: () => {
      this.addList(
        this.createLog(`检测题目，跳过，继续播放视频`, 'success', 'video')
      );
    },
    // 暂停播放
    pause: () => {
      this.addList(this.createLog('视频暂停，检测到题目', 'warning', 'video'));
    },
    // 继续播放
    resume: () => {
      this.addList(
        this.createLog('已跳过题目，视频继续播放', 'success', 'video')
      );
    },

    // 完成视频任务
    complete: () => {
      this.addList(this.createLog('视频播放完成', 'success', 'video'));
    },
    // 视频播放出错
    error: (error: any) => {
      this.addList(
        this.createLog(
          `视频播放出错: ${error.message || '未知错误'}`,
          'error',
          'video',
          { error }
        )
      );
    },
  };

  // 答题任务相关日志
  quizTask = {
    // 开始答题
    start: (questionCount: number) => {
      this.addList(
        this.createLog(`开始答题，共 ${questionCount} 道题目`, 'info', 'quiz', {
          questionCount,
        })
      );
    },
    // 开始检索答题
    questionStart: (current: number) => {
      this.addList(
        this.createLog(`第 ${current} 题正在检索`, 'success', 'quiz', {
          current,
        })
      );
    },
    // 检索错误
    retrievalError: (current) => {
      this.addList(
        this.createLog(`第 ${current} 题检索失败`, 'error', 'quiz', {
          current,
        })
      );
    },
    // 答题提交
    answerSubmit: (correct: boolean) => {
      this.addList(
        this.createLog(
          `答题${correct ? '正确' : '错误'}`,
          correct ? 'success' : 'warning',
          'quiz',
          { correct }
        )
      );
    },
    // 完成答题
    complete: (score: number) => {
      this.addList(
        this.createLog(`答题完成，得分: ${score}`, 'success', 'quiz', { score })
      );
    },
    end: () => {
      this.addList(this.createLog(`答题完成`, 'success', 'quiz'));
    },
    // 延迟提交
    delayedSubmission: () => {
      this.addList(
        this.createLog(`答题结束，10分钟后或手动提交`, 'success', 'quiz')
      );
    },
    submit: () => {
      this.addList(this.createLog(`完成提交`, 'success', 'quiz'));
    },
    // 答题出错
    error: (error: any) => {
      this.addList(
        this.createLog(
          `答题出错: ${error.message || '未知错误'}`,
          'error',
          'quiz',
          { error }
        )
      );
    },
  };

  // 章节任务相关日志
  chapterTask = {
    // 开始学习章节
    start: (chapterName: string) => {
      this.addList(
        this.createLog(`开始学习章节: ${chapterName}`, 'info', 'chapter', {
          chapterName,
        })
      );
    },
    // 跳过章节
    skip: () => {
      this.addList(this.createLog(`任务已完成，跳过`, 'warning', 'chapter'));
    },
    // 完成章节
    complete: () => {
      this.addList(
        this.createLog(`章节已完成，进入下一章`, 'success', 'chapter')
      );
    },
    // 任务结束
    end: () => {
      this.addList(this.createLog(`任务已完成`, 'success', 'chapter'));
    },
    // 未找到任务
    noTask: () => {
      this.addList(this.createLog(`未未检测任务，跳过`, 'warning', 'chapter'));
    },
  };
  // 系统状态日志
  system = {
    // 系统初始化完成
    init: () => {
      this.addList(this.createLog('系统初始化完成', 'info', 'system'));
    },
    // 任务点检测
    detection: () => {
      this.addList(this.createLog(`检测到学习任务`, 'info', 'system'));
    },
    //   系统错误
    error: (error: any) => {
      this.addList(
        this.createLog(`系统错误: ${error || '未知错误'}`, 'error', 'system', {
          error,
        })
      );
    },
    //   网络请求失败
    networkError: (error: any) => {
      this.addList(
        this.createLog(
          `网络请求失败: ${error.message || '未知错误'}`,
          'error',
          'system',
          { error }
        )
      );
    },
  };
}
