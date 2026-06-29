// src/types/ledger.ts - 账单相关类型定义

/**
 * 账单类型枚举
 */
export type LedgerType = 'income' | 'expense'

/**
 * 账单数据接口
 */
export interface LedgerItem {
  id: string              // 唯一标识 (UUID)
  type: LedgerType        // 收入/支出
  amount: number          // 金额 (正数)
  category: string        // 分类 (如：餐饮、交通、工资等)
  date: string            // 日期 (ISO 8601 格式：YYYY-MM-DD)
  tags: string[]          // 标签数组
  remark: string          // 备注/原始文本
  isAiGenerated: boolean  // 是否由 AI 生成
  createdAt: number       // 创建时间戳
  updatedAt: number       // 更新时间戳
}

/**
 * 月度汇总数据
 */
export interface MonthlySummary {
  month: string           // 月份 (YYYY-MM)
  income: number          // 总收入
  expense: number         // 总支出
  balance: number         // 结余 (收入 - 支出)
  transactionCount: number // 交易笔数
}

/**
 * 分类统计数据
 */
export interface CategoryStat {
  category: string
  amount: number
  percentage: number
  count: number
}

/**
 * AI 解析请求参数
 */
export interface AiParseRequest {
  text: string            // 用户输入的自然语言文本
  mode?: 'single' | 'batch' // 解析模式：单笔/批量
}

/**
 * AI 解析响应数据
 */
export interface AiParseResponse {
  success: boolean
  data?: LedgerItem[]     // 解析后的账单数据
  error?: string          // 错误信息
}

/**
 * 分类预设 (用于快速选择)
 */
export interface CategoryPreset {
  id: string
  name: string
  type: LedgerType
  icon?: string
}

/**
 * 常用分类预设列表
 */
export const DEFAULT_CATEGORIES: CategoryPreset[] = [
  // 支出分类
  { id: 'expense_food', name: '餐饮', type: 'expense' },
  { id: 'expense_transport', name: '交通', type: 'expense' },
  { id: 'expense_shopping', name: '购物', type: 'expense' },
  { id: 'expense_entertainment', name: '娱乐', type: 'expense' },
  { id: 'expense_health', name: '医疗', type: 'expense' },
  { id: 'expense_education', name: '教育', type: 'expense' },
  { id: 'expense_housing', name: '居住', type: 'expense' },
  { id: 'expense_other', name: '其他', type: 'expense' },
  // 收入分类
  { id: 'income_salary', name: '工资', type: 'income' },
  { id: 'income_bonus', name: '奖金', type: 'income' },
  { id: 'income_investment', name: '投资', type: 'income' },
  { id: 'income_parttime', name: '兼职', type: 'income' },
  { id: 'income_other', name: '其他', type: 'income' },
]
