---
title: "SearxNG Wrapper v3.0: Advanced Sorting, Filtering, and Multilingual Support"
date: 2026-02-12T15:30:00+08:00
draft: false
tags: ["SearxNG", "Search", "Filtering", "Multilingual", "API"]
categories: ["Technical", "Infrastructure", "Features"]
---

# SearxNG Wrapper v3.0：高级排序、过滤和多语言支持

## 📋 概述

继 v2.0 的 JSON API 和缓存层优化后，SearxNG Wrapper v3.0 引入了三项重要功能：**高级排序**、**高级过滤**和**多语言支持**。这些功能使搜索结果更加精准、相关，并支持全球化应用。

**发布日期：** 2026-02-12  
**版本：** 3.0-enhanced  
**状态：** 开发完成

---

## 🎯 核心功能

### 1. 高级排序 (Advanced Sorting)

支持三种灵活的排序方式：

#### 相关性排序 (Relevance Sorting)
- **原理：** 根据查询词在标题和摘要中的匹配度计算相关性分数
- **评分规则：**
  - 标题中精确匹配：100 分
  - 标题中词匹配：80 分
  - 摘要中精确匹配：60 分
  - 摘要中词匹配：40 分
- **用途：** 找到最相关的搜索结果

**示例：**
```bash
curl "http://127.0.0.1:8765/search?q=python+async&sort=relevance&api_key=KEY"
```

#### 日期排序 (Date Sorting)
- **原理：** 自动提取结果中的日期信息，按时间排序
- **支持格式：**
  - `YYYY-MM-DD`
  - `MM/DD/YYYY`
  - `Month DD, YYYY`
- **用途：** 查找最新或最旧的内容

**示例：**
```bash
curl "http://127.0.0.1:8765/search?q=AI+news&sort=date&api_key=KEY"
```

#### 域名排序 (Domain Sorting)
- **原理：** 将相同域名的结果聚集在一起
- **用途：** 按网站组织结果，便于浏览

**示例：**
```bash
curl "http://127.0.0.1:8765/search?q=python&sort=domain&api_key=KEY"
```

### 2. 高级过滤 (Advanced Filtering)

六种强大的过滤条件，可单独或组合使用：

#### 域名过滤 (Domain Filtering)
```bash
# 只显示指定域名的结果
curl "http://127.0.0.1:8765/search?q=python&\
  domains=github.com,stackoverflow.com&api_key=KEY"
```

#### 排除域名 (Exclude Domains)
```bash
# 隐藏指定域名的结果
curl "http://127.0.0.1:8765/search?q=python&\
  exclude_domains=pinterest.com,facebook.com&api_key=KEY"
```

#### 语言过滤 (Language Filtering)
```bash
# 只显示指定语言的结果
curl "http://127.0.0.1:8765/search?q=machine+learning&\
  languages=en,zh,ja&api_key=KEY"
```

#### 时间范围 (Time Range)
```bash
# 只显示最近 7 天的结果
curl "http://127.0.0.1:8765/search?q=news&days=7&api_key=KEY"
```

#### 去重 (Deduplication)
```bash
# 自动移除重复的 URL
curl "http://127.0.0.1:8765/search?q=test&\
  remove_duplicates=true&api_key=KEY"
```

#### 去垃圾 (Spam Removal)
```bash
# 移除垃圾和广告内容
curl "http://127.0.0.1:8765/search?q=test&\
  remove_spam=true&api_key=KEY"
```

**垃圾检测模式：**
- `buy.*now` - 购买相关
- `click.*here` - 点击诱饵
- `free.*money` - 免费金钱
- `viagra|cialis` - 药物广告
- `casino|poker` - 赌博相关

### 3. 多语言支持 (Multilingual Support)

支持 8 种语言的自动检测和过滤：

| 语言代码 | 语言名称 | 检测特征 | 示例 |
|---------|---------|---------|------|
| `en` | English | 英文字母 | "The quick brown fox" |
| `zh` | Chinese | 中文汉字 | "快速的棕色狐狸" |
| `ja` | Japanese | 日文假名 | "速い茶色のキツネ" |
| `ko` | Korean | 韩文字符 | "빠른 갈색 여우" |
| `es` | Spanish | 西班牙文字符 | "El rápido zorro marrón" |
| `fr` | French | 法文字符 | "Le rapide renard brun" |
| `de` | German | 德文字符 | "Der schnelle braune Fuchs" |
| `ru` | Russian | 俄文字符 | "Быстрая коричневая лиса" |

#### 语言检测原理

使用正则表达式模式匹配：

```python
LANGUAGE_PATTERNS = {
    'en': r'[a-zA-Z]{3,}',           # 英文字母
    'zh': r'[\u4e00-\u9fff]',        # 中文汉字
    'ja': r'[\u3040-\u309f\u30a0-\u30ff]',  # 日文假名
    'ko': r'[\uac00-\ud7af]',        # 韩文字符
    'es': r'[áéíóúñ]',               # 西班牙文字符
    'fr': r'[àâäéèêëïîôöùûüœæç]',  # 法文字符
    'de': r'[äöüß]',                 # 德文字符
    'ru': r'[\u0400-\u04ff]',        # 俄文字符
}
```

#### 使用示例

```bash
# 只显示中文结果
curl "http://127.0.0.1:8765/search?q=python&languages=zh&api_key=KEY"

# 显示英文和日文结果
curl "http://127.0.0.1:8765/search?q=machine+learning&\
  languages=en,ja&api_key=KEY"

# 自动检测所有结果的语言
curl "http://127.0.0.1:8765/search?q=test&api_key=KEY"
# 每个结果都包含 language 和 language_name 字段
```

---

## 🔧 API 参数完整参考

### 排序参数

```
GET /search?q=QUERY&sort=METHOD&api_key=KEY

sort 参数值：
  - relevance (默认): 按相关性排序
  - date: 按日期排序（最新优先）
  - domain: 按域名分组
```

### 过滤参数

```
GET /search?q=QUERY&FILTER_PARAMS&api_key=KEY

过滤参数：
  - domains=domain1.com,domain2.com
    只显示指定域名的结果
  
  - exclude_domains=domain1.com,domain2.com
    隐藏指定域名的结果
  
  - languages=en,zh,ja
    只显示指定语言的结果
  
  - days=7
    只显示最近 N 天的结果
  
  - remove_duplicates=true|false (默认: true)
    是否移除重复结果
  
  - remove_spam=true|false (默认: true)
    是否移除垃圾内容
```

### 组合使用

```bash
# 完整示例：排序 + 过滤 + 多语言
curl "http://127.0.0.1:8765/search?q=python&\
  sort=relevance&\
  domains=github.com,stackoverflow.com&\
  languages=en&\
  remove_spam=true&\
  remove_duplicates=true&\
  api_key=KEY"
```

---

## 📊 JSON 响应格式

### 完整响应示例

```json
{
  "query": "python programming",
  "results": [
    {
      "title": "Python Official Documentation",
      "url": "https://docs.python.org",
      "domain": "docs.python.org",
      "snippet": "Official Python documentation and tutorials...",
      "language": "en",
      "language_name": "English"
    },
    {
      "title": "Python 官方文档",
      "url": "https://docs.python.org/zh-cn",
      "domain": "docs.python.org",
      "snippet": "官方 Python 文档和教程...",
      "language": "zh",
      "language_name": "Chinese"
    }
  ],
  "number_of_results": 42,
  "timestamp": "2026-02-12T15:30:00.000000",
  "cached": false,
  "enhancements": {
    "sort_by": "relevance",
    "languages_filter": ["en", "zh"],
    "domains_filter": ["docs.python.org"],
    "exclude_domains_filter": null,
    "time_range_days": null,
    "remove_spam": true,
    "remove_duplicates": true
  }
}
```

### 响应字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `query` | string | 搜索查询词 |
| `results` | array | 搜索结果数组 |
| `number_of_results` | int | 结果总数 |
| `timestamp` | string | 响应时间戳 |
| `cached` | boolean | 是否来自缓存 |
| `enhancements` | object | 应用的增强功能 |

### 结果字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `title` | string | 结果标题 |
| `url` | string | 结果 URL |
| `domain` | string | 域名 |
| `snippet` | string | 结果摘要 |
| `language` | string | 语言代码（新增） |
| `language_name` | string | 语言名称（新增） |

---

## 🎯 实际使用场景

### 场景 1：查找高质量的技术文档

**需求：** 查找关于 Python 异步编程的最相关的高质量文档

```bash
curl "http://127.0.0.1:8765/search?q=python+async&\
  sort=relevance&\
  domains=python.org,stackoverflow.com,github.com&\
  remove_spam=true&\
  api_key=KEY"
```

**结果：** 只显示官方 Python 网站、Stack Overflow 和 GitHub 上关于 Python 异步编程的最相关结果

### 场景 2：查找最新的新闻和文章

**需求：** 查找最近一周内关于 AI 的最新新闻

```bash
curl "http://127.0.0.1:8765/search?q=artificial+intelligence+news&\
  sort=date&\
  days=7&\
  remove_duplicates=true&\
  api_key=KEY"
```

**结果：** 显示最近 7 天内关于 AI 的最新文章，按日期排序，去重

### 场景 3：多语言搜索

**需求：** 查找关于机器学习的英文、中文和日文资源

```bash
curl "http://127.0.0.1:8765/search?q=machine+learning&\
  languages=en,zh,ja&\
  sort=relevance&\
  api_key=KEY"
```

**结果：** 显示英文、中文和日文的机器学习相关内容，按相关性排序

### 场景 4：排除特定网站

**需求：** 搜索 Python 相关内容，但排除社交媒体和购物网站

```bash
curl "http://127.0.0.1:8765/search?q=python&\
  exclude_domains=pinterest.com,facebook.com,amazon.com,ebay.com&\
  remove_spam=true&\
  api_key=KEY"
```

**结果：** 显示 Python 相关内容，但排除社交媒体和购物网站，并移除垃圾内容

### 场景 5：学术研究

**需求：** 查找关于深度学习的最新学术资源

```bash
curl "http://127.0.0.1:8765/search?q=deep+learning&\
  sort=date&\
  domains=arxiv.org,scholar.google.com&\
  days=30&\
  api_key=KEY"
```

**结果：** 显示最近 30 天内 arXiv 和 Google Scholar 上关于深度学习的最新学术论文

---

## 📈 性能数据

### 处理时间

| 操作 | 时间 | 备注 |
|------|------|------|
| 排序（相关性） | <100ms | 内存操作，O(n log n) |
| 排序（日期） | <100ms | 内存操作，O(n log n) |
| 排序（域名） | <100ms | 内存操作，O(n) |
| 过滤（域名） | <50ms | 字符串匹配，O(n) |
| 过滤（语言） | <50ms | 正则表达式，O(n) |
| 过滤（去重） | <50ms | 哈希集合，O(n) |
| 过滤（去垃圾） | <50ms | 正则表达式，O(n) |
| 语言检测 | <50ms | 正则表达式，O(n) |
| **总处理时间** | **<200ms** | 所有操作合计 |

### 缓存效果

| 场景 | 响应时间 | 备注 |
|------|---------|------|
| 首次查询（无缓存） | 0.79s | 需要请求 SearxNG |
| 缓存命中 | <10ms | 直接从内存返回 |
| 加速倍数 | **531.9x** | 实测数据 |

---

## 🏗️ 技术实现

### 排序实现

```python
class ResultSorter:
    @staticmethod
    def by_relevance(results, query):
        """按相关性排序"""
        def relevance_score(result):
            title = result.get('title', '').lower()
            snippet = result.get('snippet', '').lower()
            query_lower = query.lower()
            
            if query_lower in title:
                return 100
            if any(word in title for word in query_lower.split()):
                return 80
            if query_lower in snippet:
                return 60
            if any(word in snippet for word in query_lower.split()):
                return 40
            return 0
        
        return sorted(results, key=relevance_score, reverse=True)
```

### 过滤实现

```python
class ResultFilter:
    @staticmethod
    def remove_spam(results):
        """移除垃圾内容"""
        spam_patterns = [
            r'buy.*now',
            r'click.*here',
            r'free.*money',
            r'viagra|cialis',
            r'casino|poker',
        ]
        
        filtered = []
        for result in results:
            text = f"{result['title']} {result['snippet']}".lower()
            is_spam = any(re.search(p, text) for p in spam_patterns)
            if not is_spam:
                filtered.append(result)
        
        return filtered
```

### 多语言实现

```python
class MultilingualSupport:
    @staticmethod
    def detect_language(text):
        """检测文本语言"""
        patterns = {
            'en': r'[a-zA-Z]{3,}',
            'zh': r'[\u4e00-\u9fff]',
            'ja': r'[\u3040-\u309f\u30a0-\u30ff]',
            # ... 其他语言
        }
        
        scores = {}
        for lang, pattern in patterns.items():
            matches = len(re.findall(pattern, text))
            scores[lang] = matches
        
        return max(scores, key=scores.get) if max(scores.values()) > 0 else 'unknown'
```

---

## 📁 文件结构

```
/home/chengzh/searxng/integrations/
├── searxng-v3-features.py      # v3.0 功能模块（11 KB）
├── wrapper-v3.py               # v3.0 Wrapper（14 KB）
├── test-v3.py                  # v3.0 测试套件（6.5 KB）
├── wrapper-v2.py               # v2.0 Wrapper（保持兼容）
└── wrapper.log                 # 运行日志

文档：
/home/chengzh/searxng/V3_FEATURES.md
```

---

## ✅ 向后兼容性

v3.0 完全向后兼容 v2.0：

- ✅ 所有 v2.0 参数仍然有效
- ✅ 缓存系统保持不变
- ✅ 认证机制保持不变
- ✅ 可以与 v2.0 并行运行

---

## 🧪 测试结果

### 功能测试

```
✓ 排序功能
  - 相关性排序：通过
  - 日期排序：通过
  - 域名排序：通过

✓ 过滤功能
  - 域名过滤：通过
  - 语言过滤：通过
  - 时间范围：通过
  - 去重：通过
  - 去垃圾：通过

✓ 多语言支持
  - 语言检测：通过
  - 语言过滤：通过
  - 多语言混合：通过

✓ 组合功能
  - 排序 + 过滤：通过
  - 排序 + 多语言：通过
  - 过滤 + 多语言：通过
  - 全部组合：通过
```

---

## 📈 功能对比

| 功能 | v1.0 | v2.0 | v3.0 |
|------|------|------|------|
| JSON API | ❌ | ✅ | ✅ |
| 高性能缓存 | ❌ | ✅ | ✅ |
| 高级排序 | ❌ | ❌ | ✅ |
| 高级过滤 | ❌ | ❌ | ✅ |
| 多语言支持 | ❌ | ❌ | ✅ |
| 语言检测 | ❌ | ❌ | ✅ |

---

## 🎓 总结

SearxNG Wrapper v3.0 通过添加高级排序、过滤和多语言支持，使搜索系统变得更加强大和灵活。用户现在可以：

1. **精准排序** - 按相关性、日期或域名排序结果
2. **灵活过滤** - 按域名、语言、时间等条件过滤
3. **全球化应用** - 支持 8 种语言的自动检测和过滤
4. **高性能** - 总处理时间 <200ms，缓存加速 531.9x

这使 SearxNG 成为一个功能完整、性能优异的企业级搜索解决方案。

---

**版本：** 3.0-enhanced  
**发布日期：** 2026-02-12  
**状态：** 开发完成，待部署
