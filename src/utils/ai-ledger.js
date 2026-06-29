/**
 * AI API 调用工具
 * 从本地存储读取配置，支持多服务商
 * 注意：只有 AI 分析功能需要联网，基础记账功能完全本地运行
 */

import { getAiConfig, AI_PROVIDERS } from './ai-config'

/**
 * 通用 AI 对话调用（流式输出）
 * @param {string} prompt - 提示词
 * @param {object} options - 额外选项
 * @param {function} onChunk - 流式回调，接收每个 chunk 的文本
 * @returns {Promise<string>} - AI 返回完整文本
 */
export async function callAiStream(prompt, options = {}, onChunk) {
  const config = getAiConfig()
  
  if (!config.enabled) {
    throw new Error('AI 功能未启用，请先在设置中配置 API Key')
  }
  
  if (!config.baseUrl || !config.apiKey) {
    throw new Error('AI 配置不完整：缺少 Base URL 或 API Key，请先在设置中配置')
  }

  // 检查 API Key 格式
  if (!config.apiKey.startsWith('sk-')) {
    console.warn('API Key 格式可能不正确，应该以 sk- 开头')
  }

  try {
    let fullText = ''
    
    // H5 环境下使用 fetch 处理流式响应，小程序环境下使用 uni.request
    const isH5 = typeof window !== 'undefined' && typeof fetch !== 'undefined'
    
    if (isH5) {
      // 使用 fetch 处理流式响应
      const response = await fetch(config.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: config.model || 'qwen-plus',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 500,
          stream: true
        })
      })
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        if (response.status === 401) {
          throw new Error('API Key 无效或已过期，请检查设置')
        } else if (response.status === 429) {
          throw new Error('请求过于频繁，请稍后再试')
        } else if (response.status >= 500) {
          throw new Error('AI 服务暂时不可用，请稍后重试')
        } else {
          throw new Error(error.error?.message || `API 请求失败：${response.status}`)
        }
      }
      
      // 处理流式响应
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content || ''
              if (content) {
                fullText += content
                if (onChunk) onChunk(content)
              }
            } catch (e) {
              console.warn('SSE 解析错误:', e)
            }
          }
        }
      }
      
      return fullText
    } else {
      // 小程序环境使用 uni.request
      return await new Promise((resolve, reject) => {
        uni.request({
          url: config.baseUrl,
          method: 'POST',
          header: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`
          },
          data: {
            model: config.model || 'qwen-plus',
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: options.temperature || 0.7,
            max_tokens: options.maxTokens || 500,
            stream: true
          },
          timeout: 15000,
          success: (res) => {
            console.log('AI 响应状态码:', res.statusCode)
            console.log('AI 响应数据类型:', typeof res.data)
            
            if (res.statusCode !== 200) {
              console.error('AI 响应错误:', res.data)
              if (res.statusCode === 401) {
                reject(new Error('API Key 无效或已过期，请检查设置'))
              } else if (res.statusCode === 429) {
                reject(new Error('请求过于频繁，请稍后再试'))
              } else if (res.statusCode >= 500) {
                reject(new Error('AI 服务暂时不可用，请稍后重试'))
              } else {
                reject(new Error(`API 请求失败：${res.statusCode}`))
              }
              return
            }
            
            // 处理流式响应
            let streamData = res.data
            
            // H5 环境下，uni.request 可能自动解析了 JSON
            if (streamData && typeof streamData === 'object') {
              const content = streamData.choices?.[0]?.message?.content || ''
              if (content) {
                fullText = content
                if (onChunk) onChunk(content)
              }
              resolve(fullText)
              return
            }
            
            if (streamData && typeof streamData === 'string') {
              const lines = streamData.split('\n')
              let hasContent = false
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6)
                  if (data === '[DONE]') continue
                  try {
                    const parsed = JSON.parse(data)
                    const content = parsed.choices?.[0]?.delta?.content || ''
                    if (content) {
                      fullText += content
                      hasContent = true
                      if (onChunk) onChunk(content)
                    }
                  } catch (e) {
                    console.warn('SSE 解析错误:', e)
                  }
                }
              }
              if (!hasContent && fullText.length === 0) {
                console.warn('未解析到任何 AI 响应内容')
              }
            }
            resolve(fullText)
          },
          fail: (err) => {
            console.error('AI 流式请求失败:', err)
            console.error('错误详情:', JSON.stringify(err))
            if (err.errMsg && err.errMsg.includes('timeout')) {
              reject(new Error('网络连接超时，请检查网络或稍后重试'))
            } else if (err.errMsg && err.errMsg.includes('fail')) {
              reject(new Error('网络连接失败，请检查网络设置'))
            } else {
              reject(new Error('网络请求失败：' + (err.errMsg || '未知错误')))
            }
          }
        })
      })
    }
  } catch (error) {
    console.error('AI 调用失败:', error)
    throw error
  }
}

/**
 * 通用 AI 对话调用（非流式）
 * @param {string} prompt - 提示词
 * @param {object} options - 额外选项
 * @returns {Promise<string>} - AI 返回文本
 */
export async function callAi(prompt, options = {}) {
  const config = getAiConfig()
  
  if (!config.enabled) {
    throw new Error('AI 功能未启用')
  }
  
  if (!config.baseUrl || !config.apiKey) {
    throw new Error('请先配置 AI 服务')
  }

  try {
    const response = await fetch(config.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model || 'qwen-plus',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 500
      })
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || `API 请求失败：${response.status}`)
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || ''
  } catch (error) {
    console.error('AI 调用失败:', error)
    // 网络错误时给出友好提示
    if (error.name === 'TypeError' || error.message.includes('fetch')) {
      throw new Error('网络连接失败，请检查网络设置')
    }
    throw error
  }
}

/**
 * AI 记账提示词模板
 */
const LEDGER_PROMPT = `# Role
你是一个精通财务数据提取的记账助手。你的唯一任务是分析用户输入的记账文本，并将其转换为标准结构化的 JSON 格式。

# Constraints
1. 必须且只能输出 JSON 数据，严禁包含任何前言、后记或 Markdown 包裹块（如 \`\`\`json）。
2. 如果用户输入的信息不完整（例如缺少金额），请结合常识进行合理解释，或将无法提取的字段设为 null。
3. 当前年份为 2026 年，请根据用户提到的"昨天"、"上周"等时间词，精准计算出具体的 YYYY-MM-DD 日期。

# Output Format
严格按照以下 JSON 格式输出：
{
  "amount": 0.00,       // 数字类型，账单金额
  "type": "EXPENSE",    // 字符串类型，分类：EXPENSE(支出) 或 INCOME(收入)
  "category": "餐饮",   // 字符串类型，可选：餐饮、交通、购物、娱乐、居住、其他
  "date": "2026-06-02", // 字符串类型，格式统一为 YYYY-MM-DD
  "remark": "具体商品或事件备注" // 字符串类型，简短摘要
}

# Examples
User: 昨天中午吃火锅花了 188 元
Assistant: {"amount": 188.00, "type": "EXPENSE", "category": "餐饮", "date": "2026-06-01", "remark": "中午吃火锅"}

User: 收到本月工资 15000
Assistant: {"amount": 15000.00, "type": "INCOME", "category": "其他", "date": "2026-06-02", "remark": "收到本月工资"}`

/**
 * 解析记账文本
 * @param {string} text - 用户输入的记账文本
 * @returns {Promise<object>} - 解析后的 JSON 对象
 */
export async function parseLedgerText(text) {
  const content = await callAi(LEDGER_PROMPT + '\n\nUser: ' + text, {
    temperature: 0.1,
    maxTokens: 300
  })

  // 处理可能的 Markdown 包裹
  let jsonStr = content.trim()
  if (jsonStr.startsWith('```json')) {
    jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '')
  } else if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '')
  }

  const result = JSON.parse(jsonStr)
  
  if (typeof result.amount !== 'number' || !result.type || !result.category || !result.date) {
    throw new Error('AI 返回的 JSON 格式不完整')
  }

  return result
}

/**
 * 获取即时财务点评
 * @param {object} bill - 账单对象 {amount, type, category, note}
 * @returns {Promise<string>} - AI 点评文本
 */
export async function getInstantAnalysis(bill) {
  const prompt = `你是一个理性克制、偶尔幽默的个人财务顾问。
用户记录了：${bill.amount}元${bill.type === 'EXPENSE' ? '支出' : '收入'}，
类别「${bill.category}」，备注「${bill.note || '无'}」。
用 2-3 句话点评：是否合理、同类消费参考均值、一个实用建议。
语气轻松专业，禁止说教，直接输出纯文字，不超过 80 字。`

  return await callAi(prompt, {
    temperature: 0.7,
    maxTokens: 150
  })
}

/**
 * AI 自动分类 - 根据用户输入的备注文本自动识别分类
 * @param {string} text - 用户输入的记账文本
 * @returns {Promise<{category: string, type: string}>} - 自动识别的分类和收支类型
 */
export async function autoCategorize(text) {
  const prompt = `你是一个智能记账分类助手。分析用户的记账文本，自动识别收支类型和分类。

收支类型只能是：EXPENSE（支出）或 INCOME（收入）
分类只能是：餐饮、交通、购物、娱乐、居住、医疗、教育、其他

直接输出 JSON，不要任何其他文字：
{"type": "EXPENSE", "category": "餐饮"}

示例：
"中午吃火锅花了 188 元" -> {"type": "EXPENSE", "category": "餐饮"}
"收到工资 15000 元" -> {"type": "INCOME", "category": "其他"}
"地铁充值 100 元" -> {"type": "EXPENSE", "category": "交通"}
"买了一件衣服 399 元" -> {"type": "EXPENSE", "category": "购物"}

用户输入：${text}`

  try {
    const content = await callAi(prompt, {
      temperature: 0.1,
      maxTokens: 100
    })
    
    // 处理可能的 Markdown 包裹
    let jsonStr = content.trim()
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }
    
    const result = JSON.parse(jsonStr)
    return {
      type: result.type || 'EXPENSE',
      category: result.category || '其他'
    }
  } catch (error) {
    console.error('AI 自动分类失败:', error)
    return { type: 'EXPENSE', category: '其他' }
  }
}

/**
 * 获取月度深挖分析报告（流式输出）
 * @param {Array} bills - 账单数组
 * @param {function} onChunk - 流式回调，接收每个 chunk 的文本
 * @returns {Promise<string>} - AI 报告文本
 */
export async function getDeepAnalysisStream(bills, onChunk) {
  const billsJSON = JSON.stringify(bills, null, 2)
  const prompt = `你是严肃但有温度的个人财务分析师。
用户本月账单：${billsJSON}

请输出以下 4 个角度，每个角度 2-3 句，总计不超过 200 字。
用「【异常】【习惯】【建议】【总结】」作为分隔标记（保留这 4 个标记，用于前端解析分段展示）。
直接输出纯文字，不用 markdown，语气理性直接，可带黑色幽默。

【异常】找出金额异常偏高的消费
【习惯】发现用户未意识到的消费规律（时段/周期/类别聚集）
【建议】2 条最具操作性的节流建议，具体到分类和金额
【总结】一句有个性的话总结本月财务`

  return await callAiStream(prompt, {
    temperature: 0.7,
    maxTokens: 600
  }, onChunk)
}

/**
 * 获取月度深挖分析报告
 * @param {Array} bills - 账单数组
 * @returns {Promise<string>} - AI 报告文本
 */
export async function getDeepAnalysis(bills) {
  const billsJSON = JSON.stringify(bills, null, 2)
  const prompt = `你是严肃但有温度的个人财务分析师。
用户本月账单：${billsJSON}

请输出以下 4 个角度，每个角度 2-3 句，总计不超过 200 字。
用「【异常】【习惯】【建议】【总结】」作为分隔标记（保留这 4 个标记，用于前端解析分段展示）。
直接输出纯文字，不用 markdown，语气理性直接，可带黑色幽默。

【异常】找出金额异常偏高的消费
【习惯】发现用户未意识到的消费规律（时段/周期/类别聚集）
【建议】2 条最具操作性的节流建议，具体到分类和金额
【总结】一句有个性的话总结本月财务`

  return await callAi(prompt, {
    temperature: 0.7,
    maxTokens: 600
  })
}

/**
 * 解析 AI 报告文本为结构化数据
 * @param {string} text - AI 返回的报告文本
 * @returns {Array} - 分段后的报告 [{tag, content}]
 */
export function parseAiReport(text) {
  const sections = ['异常', '习惯', '建议', '总结']
  return sections.map(tag => {
    const regex = new RegExp(`【${tag}】([\\s\\S]*?)(?=【|$)`, 'g')
    const match = regex.exec(text)
    return { tag, content: match?.[1]?.trim() || '' }
  })
}
