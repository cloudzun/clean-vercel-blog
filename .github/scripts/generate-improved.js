#!/usr/bin/env node

const https = require("https");
const fs = require("fs");
const path = require("path");

const ROCCO_API_KEY = process.env.ROCCO_API_KEY;

// ========== 日志系统 ==========
const LOG_FILE = path.join(__dirname, "..", "hn-digest.log");

function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...(data && { data })
  };
  
  // 控制台输出
  const prefix = {
    INFO: "ℹ️ ",
    WARN: "⚠️ ",
    ERROR: "❌",
    SUCCESS: "✅"
  }[level] || "";
  
  console.log(`${prefix} ${message}`);
  
  // 写入日志文件
  fs.appendFileSync(LOG_FILE, JSON.stringify(logEntry) + "\n");
}

// ========== 带重试的 HN API 调用 ==========
function fetchHNStories(retries = 3) {
  return new Promise(async (resolve) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        log("INFO", `获取 HN 热门故事 (尝试 ${attempt}/${retries})`);
        
        const result = await new Promise((innerResolve, innerReject) => {
          const req = https.get(
            "https://hacker-news.firebaseio.com/v0/topstories.json",
            { timeout: 10000 },
            (res) => {
              let data = "";
              res.on("data", (chunk) => { data += chunk; });
              res.on("end", () => {
                try {
                  const ids = JSON.parse(data).slice(0, 30);
                  innerResolve(ids);
                } catch (e) {
                  innerReject(new Error(`JSON 解析失败: ${e.message}`));
                }
              });
            }
          );
          
          req.on("error", (err) => innerReject(err));
          req.on("timeout", () => {
            req.destroy();
            innerReject(new Error("请求超时"));
          });
        });
        
        if (result && result.length > 0) {
          log("SUCCESS", `成功获取 ${result.length} 个故事 ID`);
          return resolve(result);
        }
        
        throw new Error("返回空数组");
        
      } catch (error) {
        log("ERROR", `第 ${attempt} 次尝试失败: ${error.message}`);
        
        if (attempt < retries) {
          const waitTime = attempt * 5000; // 5秒, 10秒, 15秒
          log("WARN", `等待 ${waitTime/1000} 秒后重试...`);
          await new Promise(r => setTimeout(r, waitTime));
        } else {
          log("ERROR", "所有重试均失败,无法连接到 Hacker News", { error: error.message });
          return resolve([]);
        }
      }
    }
  });
}

// ========== 带重试的单个故事获取 ==========
function fetchStory(id, retries = 2) {
  return new Promise(async (resolve) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const result = await new Promise((innerResolve, innerReject) => {
          const req = https.get(
            `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
            { timeout: 8000 },
            (res) => {
              let data = "";
              res.on("data", (chunk) => { data += chunk; });
              res.on("end", () => {
                try {
                  const story = JSON.parse(data);
                  innerResolve(story);
                } catch (e) {
                  innerReject(new Error(`JSON 解析失败: ${e.message}`));
                }
              });
            }
          );
          
          req.on("error", (err) => innerReject(err));
          req.on("timeout", () => {
            req.destroy();
            innerReject(new Error("请求超时"));
          });
        });
        
        return resolve(result);
        
      } catch (error) {
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 1000));
        } else {
          return resolve(null);
        }
      }
    }
  });
}

// ========== 抓取文章内容 ==========
// ========== Twitter 内容获取 ==========
function fetchTwitterContent(url) {
  return new Promise((resolve) => {
    const { exec } = require("child_process");
    const scriptPath = require("path").join(__dirname, "twitter_fetcher.py");
    
    exec(
      `python3 "${scriptPath}" "${url}"`,
      { timeout: 30000 },
      (error, stdout, stderr) => {
        if (error) {
          log("WARN", `Twitter 抓取失败: ${error.message}`);
          return resolve(null);
        }
        
        try {
          const result = JSON.parse(stdout);
          if (result.success && result.text) {
            log("SUCCESS", `Twitter 内容获取成功 (@${result.author}, ${result.text.length} 字符)`);
            return resolve(result.text);
          }
        } catch (e) {
          log("WARN", `Twitter 响应解析失败: ${e.message}`);
        }
        
        resolve(null);
      }
    );
  });
}

// ========== 检测是否为 Twitter URL ==========
function isTwitterUrl(url) {
  return /https?:\/\/(www\.)?(twitter\.com|x\.com)\/[^\/]+\/status\/\d+/.test(url);
}

// ========== 获取文章内容（支持 Twitter）==========
function fetchArticleContent(url) {
  return new Promise(async (resolve) => {
    try {
      // 优先检测 Twitter
      if (isTwitterUrl(url)) {
        const twitterContent = await fetchTwitterContent(url);
        if (twitterContent) {
          return resolve(twitterContent);
        }
      }
      
      // 原有逻辑
      const urlObj = new URL(url);
      if (url.endsWith(".pdf") || url.includes("youtube.com") || url.includes("youtu.be")) {
        return resolve(null);
      }
      const lib = urlObj.protocol === "https:" ? require("https") : require("http");
      const req = lib.get(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; HNDigest/1.0)" }, timeout: 8000 }, (res) => {
        if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location) {
          return fetchArticleContent(res.headers.location).then(resolve).catch(() => resolve(null));
        }
        if (res.statusCode !== 200) return resolve(null);
        let data = "";
        res.on("data", (chunk) => { data += chunk; });
        res.on("end", () => {
          const text = data
            .replace(/<script[\s\S]*?<\/script>/gi, "")
            .replace(/<style[\s\S]*?<\/style>/gi, "")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .substring(0, 3000);
          resolve(text.length > 100 ? text : null);
        });
      });
      req.on("error", () => resolve(null));
      req.on("timeout", () => { req.destroy(); resolve(null); });
    } catch (e) {
      resolve(null);
    }
  });
}

// ========== Rocco API 调用（带重试和详细日志）==========
function callRoccoAPI(prompt, retries = 2) {
  return new Promise(async (resolve) => {
    for (let attempt = 1; attempt <= retries + 1; attempt++) {
      try {
        const data = JSON.stringify({
          model: "claude-haiku-4.5",
          max_tokens: 1200,
          messages: [{ role: "user", content: prompt }],
        });

        const result = await new Promise((innerResolve, innerReject) => {
          const options = {
            hostname: "pox1.hereis.app",
            port: 443,
            path: "/v1/messages",
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": ROCCO_API_KEY,
              "Content-Length": Buffer.byteLength(data),
            },
            timeout: 30000,
          };

          const req = https.request(options, (res) => {
            let responseData = "";
            res.on("data", (chunk) => { responseData += chunk; });
            res.on("end", () => {
              try {
                const parsed = JSON.parse(responseData);
                if (parsed.error) {
                  const errorType = parsed.error.type || "unknown";
                  const errorMsg = parsed.error.message || "Unknown error";
                  if (res.statusCode === 429) {
                    innerReject({ code: 429, message: errorMsg });
                  } else {
                    log("ERROR", `API 错误: ${res.statusCode} ${errorType}`, { message: errorMsg });
                    innerReject({ code: res.statusCode, message: errorMsg });
                  }
                } else {
                  const text = parsed.content?.[0]?.text || "";
                  innerResolve(text);
                }
              } catch (e) {
                log("ERROR", `解析响应失败: ${e.message}`);
                innerReject({ code: 500, message: e.message });
              }
            });
          });

          req.on("error", (err) => innerReject({ code: 0, message: err.message }));
          req.on("timeout", () => {
            req.destroy();
            innerReject({ code: 0, message: "请求超时" });
          });

          req.write(data);
          req.end();
        });

        return resolve(result);

      } catch (error) {
        if (error.code === 429 && attempt <= retries) {
          const waitTime = attempt * 10000 + 5000;
          log("WARN", `API 限流 (429)，等待 ${waitTime/1000} 秒后重试 (${attempt}/${retries})`);
          await new Promise(r => setTimeout(r, waitTime));
        } else if (attempt <= retries) {
          log("WARN", `API 错误，等待 2 秒后重试 (${attempt}/${retries})`, { error: error.message });
          await new Promise(r => setTimeout(r, 2000));
        } else {
          log("ERROR", "API 调用最终失败", { error: error.message });
          return resolve("");
        }
      }
    }
  });
}


async function main() {
  const startTime = Date.now();
  log("INFO", "========== 启动 HN Daily Digest (改进版) ==========");
  
  try {
    // 第一步：获取 HN 热门故事（带重试）
    log("INFO", "第一步: 从 Hacker News 获取热门故事...");
    const storyIds = await fetchHNStories(3); // 3次重试
    
    if (storyIds.length === 0) {
      log("ERROR", "无法连接到 Hacker News，任务终止");
      process.exit(1);
    }

    // 第二步：获取故事详情
    log("INFO", `第二步: 获取故事详情 (${Math.min(storyIds.length, 20)} 篇)...`);
    const stories = [];
    for (let i = 0; i < Math.min(storyIds.length, 20); i++) {
      const story = await fetchStory(storyIds[i]);
      if (story && story.title && story.url) {
        stories.push({
          id: story.id,
          title: story.title,
          url: story.url,
          score: story.score || 0,
          time: story.time,
          comments: story.descendants || 0,
        });
      }
      process.stdout.write(`\r  进度: ${i + 1}/20`);
    }
    console.log("");
    log("SUCCESS", `获取到 ${stories.length} 篇有效文章`);

    if (stories.length === 0) {
      log("ERROR", "没有获取到有效文章，任务终止");
      process.exit(1);
    }

    // 第三步：生成宏观趋势摘要
    log("INFO", "第三步: 生成宏观趋势摘要...");
    const topStoriesText = stories
      .slice(0, 5)
      .map((s, i) => `${i + 1}. 《${s.title}》 (${s.score}⭐ · ${s.comments}💬)`)
      .join("\n");

    const trendPrompt = `你是一个资深的技术新闻分析师。请基于以下 Hacker News 当前热门文章，用中文生成一份简短精悍的日报摘要（3-5 句话），总结当今技术圈的关键趋势和热点：

【今日热门文章】
${topStoriesText}

请直接给出摘要，简洁有力，避免冗余。`;

    const summary = await callRoccoAPI(trendPrompt);
    if (summary) {
      log("SUCCESS", "宏观趋势摘要生成完成");
    } else {
      log("WARN", "宏观趋势摘要生成失败，将使用默认文本");
    }

    // 第四步：为 Top 10 文章生成详细摘要（4 并发）
    log("INFO", "第四步: 为 Top 10 文章生成详细摘要 (4 并发)...");
    stories.sort((a, b) => b.score - a.score);
    const topStories = stories.slice(0, 10);
    const summaries = {};
    let successCount = 0;

    const CONCURRENCY = 4;
    async function processWithConcurrency(items, fn) {
      let idx = 0;
      async function worker() {
        while (idx < items.length) {
          const i = idx++;
          await fn(items[i], i);
        }
      }
      await Promise.all(Array.from({ length: CONCURRENCY }, worker));
    }

    await processWithConcurrency(topStories, async (story, i) => {
      const articleContent = await fetchArticleContent(story.url);
      const contentSection = articleContent
        ? `\n原文内容（节选）:\n${articleContent}\n`
        : `\n（原文无法抓取，请根据标题和你的知识进行分析）\n`;

      const summaryPrompt = `请用中文为以下技术文章生成一份详细的内容摘要（150-200字）。

文章标题: ${story.title}
文章链接: ${story.url}
${contentSection}
请用流畅的段落形式写作，包含以下内容：
- 第一段：这篇文章的核心内容是什么
- 第二段：最重要的3-4个关键要点（用**粗体**标注重点词）
- 第三段：为什么值得关注，对技术社区的意义

不要使用标题格式（如 ### 或 ####），不要使用"核心内容："、"关键要点："这样的小标题，直接用自然段落书写。`;

      const summaryText = await callRoccoAPI(summaryPrompt);
      if (summaryText) {
        summaries[story.id] = summaryText;
        successCount++;
        log("INFO", `  ✓ Top ${i + 1}: ${story.title.substring(0, 40)}`);
      } else {
        summaries[story.id] = `**${story.title}** 的详细分析正在生成中，请稍后查看更新版本。`;
        log("WARN", `  ✗ Top ${i + 1}: ${story.title.substring(0, 40)} 摘要失败`);
      }
    });
    log("SUCCESS", `详细摘要生成完成 (成功: ${successCount}/${topStories.length})`);

    // 第五步：为 11-20 文章生成简短介绍（4 并发）
    log("INFO", "第五步: 为 11-20 文章生成简短介绍 (4 并发)...");
    const moreStories = stories.slice(10, 20);
    const briefSummaries = {};
    let briefSuccessCount = 0;

    await processWithConcurrency(moreStories, async (story, i) => {
      const briefContent = await fetchArticleContent(story.url);
      const briefSection = briefContent ? `\n原文内容（节选）:\n${briefContent.substring(0, 1000)}\n` : "";

      const briefPrompt = `请用中文为以下技术文章生成一句话简介（30-50字），简明扼要地说明这篇文章的核心内容或价值：

文章标题: ${story.title}
文章链接: ${story.url}
${briefSection}
只需要一句话，不要重复标题。`;

      const brief = await callRoccoAPI(briefPrompt);
      if (brief) {
        briefSummaries[story.id] = brief;
        briefSuccessCount++;
        log("INFO", `  ✓ #${i + 11}: ${story.title.substring(0, 40)}`);
      } else {
        briefSummaries[story.id] = "内容简介生成中...";
        log("WARN", `  ✗ #${i + 11}: ${story.title.substring(0, 40)} 简介失败`);
      }
    });
    log("SUCCESS", `简短介绍生成完成 (成功: ${briefSuccessCount}/${moreStories.length})`);

    // 第六步：生成 Markdown 报告
    log("INFO", "第六步: 生成 Markdown 报告...");

    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const timestamp = now.toLocaleString("zh-CN", { timeZone: "UTC" });
    const filename = `${dateStr}-hn-daily-digest.md`;

    let report = `---\ntitle: "HN Daily Digest: ${dateStr}"\ndate: ${now.toISOString().substring(0, 19)}+08:00\ndraft: false\ntags: ["hacker-news", "AI", "tech-news", "daily-digest"]\ncategories: ["Technology", "News Analysis"]\n---\n\n`;
    report += `# 📰 HN 每日精选日报\n\n`;
    report += `**生成时间**: ${timestamp} (UTC)\n`;
    report += `**数据来源**: Hacker News (https://news.ycombinator.com)\n`;
    report += `**AI 分析**: Rocco Claude Sonnet 4.5\n\n`;

    report += `## 📝 今日看点\n\n`;
    report += summary ? `${summary}\n\n` : `*分析中...*\n\n`;

    report += `## 🏆 今日必读 (Top 10)\n\n`;
    topStories.forEach((story, idx) => {
      const stars = "⭐".repeat(Math.min(5, Math.ceil(story.score / 100)));
      const hnUrl = `https://news.ycombinator.com/item?id=${story.id}`;

      report += `### ${idx + 1}. ${story.title}\n\n`;
      report += `**原帖链接**: [HN 讨论](${hnUrl})\n`;
      report += `**原文链接**: [${new URL(story.url).hostname}](${story.url})\n`;
      report += `**热度**: ${stars} ${story.score} 分 | **讨论**: 💬 ${story.comments} 条\n\n`;
      report += summaries[story.id] ? `${summaries[story.id]}\n\n` : `*摘要生成中...*\n\n`;
      report += `---\n\n`;
    });

    report += `## 📑 更多热门文章 (11-20)\n\n`;
    stories.slice(10, 20).forEach((story, idx) => {
      const stars = "⭐".repeat(Math.min(3, Math.ceil(story.score / 150)));
      const hnUrl = `https://news.ycombinator.com/item?id=${story.id}`;
      report += `**${idx + 11}. ${story.title}**\n`;
      report += `   ${stars} ${story.score} 分 · 💬 ${story.comments} 条\n`;
      report += `   [HN 讨论](${hnUrl}) · [原文](${story.url})\n`;
      if (briefSummaries[story.id]) {
        report += `   > ${briefSummaries[story.id]}\n`;
      }
      report += `\n`;
    });

    report += `---\n\n`;
    report += `## 📊 统计信息\n\n`;
    const avgScore = Math.round(stories.reduce((a, b) => a + b.score, 0) / stories.length);
    const totalComments = stories.reduce((a, b) => a + b.comments, 0);
    const topStory = stories[0];
    const mostCommented = stories.sort((a, b) => b.comments - a.comments)[0];

    report += `| 指标 | 数值 |\n`;
    report += `|------|------|\n`;
    report += `| 平均热度 | ${avgScore} 分 |\n`;
    report += `| 总讨论数 | ${totalComments} 条 |\n`;
    report += `| 最热文章 | "${topStory.title}" (${topStory.score}⭐) |\n`;
    report += `| 讨论最多 | "${mostCommented.title}" (${mostCommented.comments}💬) |\n\n`;

    report += `*本报告由 HN Daily Digest 自动生成 (百炼 Qwen3.5-Plus)*\n`;

    const outputFile = path.join(process.cwd(), filename);
    fs.writeFileSync(outputFile, report);
    log("SUCCESS", `报告已保存: ${outputFile}`);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    log("SUCCESS", `========== 任务完成! (用时: ${duration}秒) ==========`);
    log("INFO", `文件名: ${filename}`);
    log("INFO", `文章数: ${stories.length} 篇`);
    log("INFO", `平均热度: ${avgScore} 分`);
    log("INFO", `总讨论数: ${totalComments} 条`);
    log("INFO", `详细摘要成功率: ${successCount}/${topStories.length}`);
    log("INFO", `简短介绍成功率: ${briefSuccessCount}/${moreStories.length}`);

    // GitHub Actions 自动发布
    if (process.env.GITHUB_ACTIONS) {
      const { execSync } = require("child_process");
      const postsDir = process.env.POSTS_DIR || "content/posts";
      const dest = path.join(postsDir, filename);
      fs.copyFileSync(outputFile, dest);
      log("SUCCESS", `报告已复制到: ${dest}`);
      execSync(`git config user.email "actions@github.com"`);
      execSync(`git config user.name "GitHub Actions"`);
      execSync(`git add ${dest}`);
      execSync(`git commit -m "digest: HN Daily Digest ${dateStr}"`);
      execSync(`git push origin master`);
      log("SUCCESS", "已推送到 GitHub，Vercel 将自动部署");
    }

  } catch (error) {
    log("ERROR", "任务执行失败", { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

main().catch((error) => {
  log("ERROR", "未捕获的异常", { error: error.message, stack: error.stack });
  process.exit(1);
});
