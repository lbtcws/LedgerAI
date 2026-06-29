// src/types/config.ts - 配置相关类型定义

/**
 * AI 服务提供商类型
 */
export type AiProvider = 'openai' | 'deepseek' | 'kimi' | 'custom'

/**
 * AI 配置接口
 */
export interface AiConfig {
  provider: AiProvider      // 提供商
  apiUrl: string            // API 端点 URL
  apiKey: string            // API Key (敏感信息)
  model: string             // 模型名称 (如：gpt-4, deepseek-chat)
  systemPrompt: string      // 系统提示词 (可自定义 AI 人格)
  isEnabled: boolean        // 是否启用 AI 功能
}

/**
 * 应用配置接口
 */
export interface AppConfig {
  // AI 配置
  ai: AiConfig
  
  // 通用设置
  currency: string          // 货币符号 (默认：¥)
  weekStart: 'monday' | 'sunday' // 周起始日
  
  // 数据管理
  dataVersion: number       // 数据版本号 (用于导入导出兼容性)
  lastBackupAt?: number     // 上次备份时间戳
}

/**
 * 默认 AI 配置
 */
export const DEFAULT_AI_CONFIG: AiConfig = {
  provider: 'openai',
  apiUrl: 'https://api.openai.com/v1/chat/completions',
  apiKey: '',
  model: 'gpt-3.5-turbo',
  systemPrompt: `你是一个专业的财务记账助手。你的任务是从用户的自然语言描述中提取记账信息。

请严格按照以下 JSON 格式输出（只输出 JSON，不要其他内容）：
{
  "items": [
    {
      "type": "income" 或 "expense",
      "amount": 数字,
      "category": "分类名称",
      "date": "YYYY-MM-DD",
      "tags": ["标签 1", "标签 2"],
      "remark": "原始描述或备注"
    }
  ]
}

分类参考：
- 支出：餐饮、交通、购物、娱乐、医疗、教育、居住、其他
- 收入：工资、奖金、投资、兼职、其他

如果用户输入包含多笔交易，请全部解析到 items 数组中。
如果信息不完整，请根据上下文合理推断。`,
  isEnabled: false,
}

/**
 * 默认应用配置
 */
export const DEFAULT_APP_CONFIG: AppConfig = {
  ai: DEFAULT_AI_CONFIG,
  currency: '¥',
  weekStart: 'monday',
  dataVersion: 1,
}

/**
 * API 测试响应
 */
export interface ApiTestResult {
  success: boolean
  message: string
  model?: string
}
