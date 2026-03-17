import { defineStore } from "pinia";
const useConfigStore = defineStore("configStore", {
  state: () => {
    const scriptInfo = getScriptInfo();
    const defaultConfig = {
      version: scriptInfo.version,
      isMinus: false,
      position: {
        x: "800px",
        y: "200px"
      },
      menuIndex: "0",
      platformName: "cx",
      platformParams: {
        cx: {
          name: "超星网课助手",
          parts: [
            {
              name: "章节设置",
              params: [
                //     {
                //     name: '视频速率',
                //     value: 1,
                //     type: 'number',
                // },
                {
                  name: "章节作业自动提交",
                  value: true,
                  type: "boolean"
                },
                {
                  name: "是否自动下一章节",
                  value: true,
                  type: "boolean"
                },
                {
                  name: "只答题，不做其他",
                  value: false,
                  type: "boolean"
                }
              ]
            },
            {
              name: "考试设置",
              params: [{
                name: "是否自动切换",
                value: true,
                type: "boolean"
              }]
            }
          ]
        },
        zhs: {
          name: "智慧树网课助手",
          parts: [{
            name: "答题设置",
            params: [{
              name: "是否自动切换",
              value: true,
              type: "boolean"
            }]
          }]
        },
        unknown: {
          name: "未知平台",
          parts: [{
            name: "答题设置",
            params: [{
              name: "是否自动切换",
              value: true,
              type: "boolean"
            }]
          }]
        }
      },
      // 没答案自动选择
      otherParams: {
        name: "其他参数",
        params: [
          //     {
          //     name: '没答案随机选择',
          //     value: true,
          //     type: 'boolean',
          // },
          {
            name: "答题间隔，单位秒",
            value: 1,
            type: "number"
          },
          {
            name: "正确率达到多少自动提交",
            value: 85,
            type: "number"
          },
          {
            name: "不完全匹配时选择高相似度答案",
            value: true,
            type: "boolean"
          }
        ]
      },
      queryApis: [
        {
          name: "题库",
          token: "",
          url: "http://api.tikuhai.com"
        }
        // {
        //     name: '一之题库',
        //     token: '',
        //     url: "http://api.tikuhai.com"
        // }
      ]
    };
    let globalConfig = defaultConfig;
    const storedConfig = _GM_getValue("config");
    if (storedConfig) {
      try {
        const parsedStoredConfig = JSON.parse(storedConfig);
        if (scriptInfo.version === parsedStoredConfig.version) {
          globalConfig = parsedStoredConfig;
        } else {
          globalConfig = defaultConfig;
          globalConfig.version = scriptInfo.version;
          if (parsedStoredConfig.position) {
            globalConfig.position = parsedStoredConfig.position;
          }
          if (parsedStoredConfig.menuIndex) {
            globalConfig.menuIndex = parsedStoredConfig.menuIndex;
          }
          if (parsedStoredConfig.queryApis && parsedStoredConfig.queryApis.length > 0) {
            parsedStoredConfig.queryApis.forEach((oldApi, index) => {
              if (globalConfig.queryApis[index] && oldApi.token) {
                globalConfig.queryApis[index].token = oldApi.token;
              }
            });
          }
          if (parsedStoredConfig.platformParams) {
            Object.keys(parsedStoredConfig.platformParams).forEach((platformKey) => {
              const oldPlatform = parsedStoredConfig.platformParams[platformKey];
              const newPlatform = globalConfig.platformParams[platformKey];
              if (oldPlatform && newPlatform && oldPlatform.parts) {
                oldPlatform.parts.forEach((oldPart, partIndex) => {
                  if (newPlatform.parts[partIndex] && oldPart.params) {
                    oldPart.params.forEach((oldParam, paramIndex) => {
                      if (newPlatform.parts[partIndex].params[paramIndex]) {
                        newPlatform.parts[partIndex].params[paramIndex].value = oldParam.value;
                      }
                    });
                  }
                });
              }
            });
          }
          if (parsedStoredConfig.otherParams && parsedStoredConfig.otherParams.params) {
            parsedStoredConfig.otherParams.params.forEach((oldParam, index) => {
              if (globalConfig.otherParams.params[index]) {
                globalConfig.otherParams.params[index].value = oldParam.value;
              }
            });
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
    _GM_setValue("globalConfig", JSON.stringify(globalConfig));
    return globalConfig;
  },
  actions: {}
});