---
title: "从 tools 初步理解缓存命中"
date: 2026-05-29
description: "从一次 API 请求的协议格式出发，理解前缀缓存命中的原理和工程实践。"
tags: ["agent"]
---

起因在于昨天一直纠结为什么一轮对话里多次调用llm，每次llm可以用的tool不同还能保持高缓存命中。
## 缓存命中是什么
当推理引擎处理一个 prompt 时，它会把每个 token 对应的中间计算结果暂存下来，和这个 prompt 的 token 序列绑定。当新请求到来，引擎发现新 prompt 的开头部分和之前某个暂存序列的开头逐个 token 完全一致，就直接拿出对应的中间结果复用，跳过这部分计算。这个过程就是前缀缓存命中。

简单来说：**新 Prompt 的开头如果和之前某个 Prompt 的开头完全相同（前缀匹配），就直接复用那一段的 KV Cache，跳过对这一段的计算**

## 一次普通的LLM请求例子（Chat Completions API 协议格式）
```
{
  "model": "deepseek-v4-flash",
  "max_tokens": 512,
  "messages": [
	{"role": "system", "content": "你是一个ai助手"},
    {"role": "user", "content": "帮我看看项目结构"},
  ],
  "tools": [
    {
        "type": "function",          
        "function": {
            "name": "shell",             // 工具名
            "description": "在终端中执行 shell 命令并返回输出。",      // 工具描述
		    "parameters": {            // JSON Schema 格式的参数定义
		        "type": "object",
		        "properties": {
			        "command": {
						"type": "string",
						"description": "要执行的 shell 命令"
					}
		        },
		        "required": [
			        "command"
			    ]
            }
        }
	}
  ],
  "tool_choice": "auto"
}
```
在协议规定的字段写入参数发给API，llm 供应商的推理引擎在服务端会把这些参数按自己的模板拼接成一个完整的文本，分词后形成 token 序列。

## [ClaudeCode官方文档](https://claude.com/blog/lessons-from-building-claude-code-prompt-caching-is-everything)
根据文档，我们可以获取一些工程上的方法论。
- **Prompt caching is a prefix match**
- **Use messages instead of system prompt changes**
- **Don't change tools or models mid-conversation**
- **Monitor your cache hit rate like you monitor uptime**
- **Fork operations need to share the parent's prefix**
翻译一下大概就是：
- 静态在前，动态在后，最大化前缀复用
- 用消息传递更新，不修改系统提示词
- 不在会话中途切换模型或增删工具
- 监控缓存命中率，把这个当件重要的事做
- 子会话需要共享父会话前缀
Prompt caching 不是一个性能优化手段，它是整个系统的架构约束。提示词布局、工具管理、模型选择、会话生命周期——所有这些设计决策都围绕一个目标：让前缀不变

## 回到一开始的问题
一次 API 请求从前到后由三部分组成： system prompt → tools 数组 → messages，任何一个工具的 schema 发生变化，整个 tools 层及之后所有层的缓存全部失效。回到一开始的问题，为什么每次llm可以用的tool不同且保持高缓存命中。

### 以Anthropic为例
把工具 schema 从前缀里抽走。Anthropic 用 defer_loading: true 标记工具，让前缀只留工具名，schema 在模型调用 ToolSearch 后通过 tool_reference内容块从消息区注入。核心思路——schema不再写死在缓存前缀里，而是按需从动态消息层面注入。

##### 流程示例：
用户在某个对话中途，给 IDE 装了一个新的 MCP 工具 get_weather，它的完整 schema 有 500 字节。

  Step 1：客户端发送请求
  
  tools 数组里新增了这个工具，带有 defer_loading: true：
  ```
   {
   "name": "get_weather",
   "description": "Get current weather for a city",
   "input_schema": {
     "type": "object",
      "properties": {
        "city": { "type": "string" },
        "unit": { "type": "string", "enum": ["celsius", "fahrenheit"] }
      },
     "required": ["city"]
   },
   "defer_loading": true
  }
  ```
  
  Step 2：服务器处理

  服务器收到了完整 schema（500 字节全传了），自己存下来。但在构造模型的输入上下文时，前缀里放进 get_weather 的只是一行名字，schema 内容不进前缀。
  对比：

  - 没有 defer_loading：前缀里塞进 500 字节的 schema → 前缀变化 500 字节 → 缓存失效
  - 有 defer_loading：前缀里只有"name": "get_weather"。工具名没变，schema 变了但不在前缀里 → 前缀没变 → 缓存继续命中。

  Step 3：模型需要这个工具

  模型在上下文里知道有 get_weather 这个工具，但没有参数定义，无法直接调用。它调 ToolSearch，搜索 "weather"。ToolSearch 返回一个 tool_reference 块，内容是 "tool_name": "get_weather"。

  服务器看到这个块，从自己保存的 schema 里取出 get_weather 的完整定义，在当前轮次的上下文中注入。

  Step 4：模型调用工具

  模型拿到了完整参数，在同一轮里构造出合法的调用：
```
  {
    "name": "get_weather",
    "arguments": { "city": "Tokyo", "unit": "celsius" }
  }
```

至此，单轮对话内tool加载导致的缓存失效问题得以解决。
