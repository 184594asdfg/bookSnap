// 豆包API调用服务
const DOUBAO_API_BASE = 'https://ark.cn-beijing.volces.com/api/v3';

// HMAC-SHA256签名函数（小程序环境兼容）
function hmacSha256(secret, message) {
  // 小程序环境使用wx.base64ToArrayBuffer和wx.arrayBufferToBase64
  try {
    // 将secret和message转换为ArrayBuffer
    const secretBuffer = new TextEncoder().encode(secret);
    const messageBuffer = new TextEncoder().encode(message);
    
    // 使用Web Crypto API（如果可用）
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      return crypto.subtle.importKey(
        'raw', secretBuffer, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
      ).then(key => {
        return crypto.subtle.sign('HMAC', key, messageBuffer);
      }).then(signature => {
        return Array.from(new Uint8Array(signature))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
      });
    }
    
    // 小程序环境使用简单实现
    throw new Error('Web Crypto API not available');
  } catch (error) {
    // 降级到简单实现（仅用于测试）
    console.warn('使用降级签名算法');
    return 'volc_' + Date.now().toString(16);
  }
}

class DoubaoAPI {
  constructor() {
    // 火山引擎API需要Access Key ID和Secret Access Key
    // 注意：请从火山引擎控制台获取正确的API密钥
    this.accessKeyId = '5785b6ff-933c-4fce-98ba-957683f11eb6'; // Access Key ID（请替换为您的实际密钥）
    this.secretAccessKey = '5785b6ff-933c-4fce-98ba-957683f11eb6'; // Secret Access Key（请替换为您的实际密钥）
    this.model = 'doubao-1-5-pro-32k-250115'; // 使用默认模型
  }

  // 默认模型
  static DEFAULT_MODEL = 'doubao-seed-1-6-vision-250815';

  /**
   * 调用豆包API进行文案提取
   * @param {string} videoInfo - 视频信息（标题、描述等）
   * @param {string} platform - 视频平台
   * @returns {Promise<string>} - 提取的文案内容
   */
  async extractCopyFromVideo(videoInfo, platform = 'unknown') {
    try {
      const prompt = this.buildExtractionPrompt(videoInfo, platform);
      
      const response = await this.callDoubaoAPI(prompt);
      
      if (response && response.choices && response.choices[0]) {
        return this.parseExtractionResult(response.choices[0].message.content);
      }
      
      throw new Error('服务响应格式异常');
    } catch (error) {
      console.error('豆包API调用失败:', error);
      
      // 将技术性错误转换为用户友好的错误信息
      let userFriendlyError = '服务暂不可用，请稍后重试';
      
      if (error.message.includes('网络') || error.message.includes('连接') || error.message.includes('timeout')) {
        userFriendlyError = '网络连接异常，请检查网络设置';
      } else if (error.message.includes('401') || error.message.includes('认证') || error.message.includes('权限')) {
        userFriendlyError = '认证失败，请检查API配置';
      } else if (error.message.includes('404') || error.message.includes('找不到')) {
        userFriendlyError = '服务暂不可用，请稍后重试';
      } else if (error.message.includes('所有认证方式都失败了')) {
        userFriendlyError = '服务认证失败，请检查API密钥';
      }
      
      throw new Error(userFriendlyError);
    }
  }

  /**
   * 构建文案提取的提示词
   */
  buildExtractionPrompt(videoInfo, platform) {
    return `你是一个专业的视频文案分析师。请根据以下视频信息，解析链接视频中的文案：

视频平台：${platform}
视频信息：${videoInfo}

请按照以下要求解析文案：
1. 解析链接视频中的文案，提取核心主题和关键信息
2. 保持原文案的语气和风格
3. 优化语言表达，使其更流畅易读
4. 如果信息不完整，可以进行合理的补充
5. 输出格式为纯文本，不要添加任何标记

请直接输出解析后的文案内容：`;
  }

  /**
   * 调用豆包API
   */
  async callDoubaoAPI(prompt) {
    // 简化请求体，基于您提供的curl命令格式
    const requestBody = {
      model: this.model,
      messages: [
        {
          role: 'system',
          content: `# 角色 
你是一个专业的视频文案提取工具。你的唯一任务就是忠实、完整地提取视频中的全部文字内容。 

# 技能 
1.  **精准识别**：能够准确识别并转录视频中的语音内容。 
2.  **完整还原**：确保提取的文案是原始内容的完整复现，包括口语化的表达、停顿词（如"呃"、"那个"）、重复语句等。 
3.  **严格忠实**：不添加任何总结、概括、修饰或个人理解，不改变原意，不删除任何内容。 

# 要求与限制 
- **绝对禁止**对提取到的内容进行任何形式的： 
  - 总结、概括 
  - 修改、润色、优化 
  - 补充、解释 
  - 分段或添加标题（除非原始视频本身有明确的章节标题） 
  - 添加任何总结性语句（如"以上就是视频的主要内容"） 
- 如果视频内容不清晰或无法听清，请直接注明 \`[听不清]\` 或 \`[此处语音模糊]\`，而不要猜测内容。 
- 输出语言必须与视频原始语言保持一致。 

# 输出格式 
请将提取出的纯文本文案直接输出，不要添加任何前言、后缀或评论。 

# 工作流程 
1.  接收用户提供的视频链接。 
2.  解析视频中的音频流。 
3.  将音频转换为原始文本。 
4.  将原始文本直接输出。 

现在，请处理用户提供的视频。`
        },
        {
          role: 'user',
          content: prompt
        }
      ]
      // 移除可选参数，先确保基本功能正常
    };

    console.log('豆包API请求开始:', {
      url: `${DOUBAO_API_BASE}/chat/completions`,
      model: this.model,
      promptLength: prompt.length,
      systemPrompt: '你是一个专业的视频文案提取助手。请根据用户提供的视频链接或内容，提取出视频的核心文案、关键信息和主要内容。如果用户提供的是视频链接，请分析链接中的视频内容；如果用户提供的是视频描述，请基于描述生成完整的文案。',
      messagesCount: requestBody.messages.length
    });
    
    console.log('📋 完整的请求体结构:');
    console.log(JSON.stringify(requestBody, null, 2));

    // 火山引擎豆包API的正确认证方式：Bearer Token格式
    // 根据您提供的curl命令示例，使用Bearer <API_KEY>格式
    const authHeaders = [
      // 方式1: 直接使用API Key作为Bearer Token（推荐方式）
      { 'Authorization': `Bearer ${this.accessKeyId}` },
      // 方式2: 简化请求体，移除可选参数
      { 'Authorization': `Bearer ${this.accessKeyId}` }
    ];

    let lastError = null;
    
    // 尝试不同的认证方式
    for (let i = 0; i < authHeaders.length; i++) {
      try {
        // 添加清晰的分隔线
        console.log('═══════════════════════════════════════════════════');
        console.log(`🔍 尝试认证方式 ${i + 1}:`, authHeaders[i]);
        console.log('───────────────────────────────────────────────────');
        
        const response = await new Promise((resolve, reject) => {
          wx.request({
            url: `${DOUBAO_API_BASE}/chat/completions`,
            method: 'POST',
            header: {
              'Content-Type': 'application/json',
              ...authHeaders[i]
            },
            data: requestBody,
            success: (res) => {
              console.log('📊 响应状态码:', res.statusCode);
              console.log('📋 响应头:', res.header);
              console.log('📄 响应数据:', res.data);
              
              if (res.statusCode === 200) {
                resolve(res.data);
              } else {
                reject(new Error(`API请求失败: ${res.statusCode} - ${res.data?.message || res.errMsg || '未知错误'}`));
              }
            },
            fail: (err) => {
              reject(err);
            }
          });
        });

        console.log('✅ 认证成功！');
        console.log('═══════════════════════════════════════════════════');
        return response;
        
      } catch (error) {
        console.error(`❌ 认证失败:`, error.message);
        lastError = error;
        
        // 如果不是最后一个方式，继续尝试
        if (i < authHeaders.length - 1) {
          console.log('⏳ 等待500ms后尝试下一个认证方式...');
          console.log('═══════════════════════════════════════════════════');
          await new Promise(resolve => setTimeout(resolve, 500)); // 短暂延迟
        } else {
          console.log('═══════════════════════════════════════════════════');
        }
      }
    }

    // 所有认证方式都失败
    throw lastError || new Error('所有认证方式都失败了');
  }

  /**
   * 生成火山引擎认证头
   */
  generateVolcEngineAuthHeader(timestamp, version = 'v1') {
    // 简化版的火山引擎签名认证
    const credential = `${this.accessKeyId}/cn-beijing/ark/request`;
    const signedHeaders = 'content-type;host;x-content-sha256;x-date';
    
    // 生成简化签名（实际应该使用HMAC-SHA256）
    const signature = this.generateSimplifiedSignature(timestamp, version);
    
    return {
      'Authorization': `${version} Credential=${credential}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
      'X-Date': timestamp,
      'X-Content-Sha256': 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      'Host': 'ark.cn-beijing.volces.com'
    };
  }

  /**
   * 生成简化签名（实际应该使用HMAC-SHA256）
   */
  generateSimplifiedSignature(timestamp, version) {
    // 简化签名生成，实际应该使用HMAC-SHA256算法
    const signString = `${version}\n${timestamp}\n${this.accessKeyId}\n${this.secretAccessKey}`;
    
    try {
      // 尝试使用HMAC-SHA256
      return hmacSha256(this.secretAccessKey, signString).then(hash => {
        return hash.substring(0, 32); // 截取前32位作为简化签名
      }).catch(() => {
        // 降级处理
        return `simplified_${version}_${Date.now().toString(16)}`;
      });
    } catch (error) {
      // 降级处理
      return `simplified_${version}_${Date.now().toString(16)}`;
    }
  }

  /**
   * 解析API返回的文案结果
   */
  parseExtractionResult(content) {
    // 清理API返回的内容，移除可能的标记和格式
    let result = content.trim();
    
    // 移除开头的引导语
    if (result.startsWith('好的，') || result.startsWith('根据')) {
      result = result.replace(/^(好的，|根据[^，]+，)/, '');
    }
    
    // 移除结尾的总结语
    if (result.endsWith('。') && result.includes('希望')) {
      result = result.replace(/希望[^。]+。$/, '');
    }
    
    return result.trim();
  }

  /**
   * Base64解码（小程序兼容）
   */
  base64Decode(str) {
    try {
      // 小程序环境使用wx.base64ToArrayBuffer
      if (typeof wx !== 'undefined' && wx.base64ToArrayBuffer) {
        const arrayBuffer = wx.base64ToArrayBuffer(str);
        const uint8Array = new Uint8Array(arrayBuffer);
        return Array.from(uint8Array).map(byte => String.fromCharCode(byte)).join('');
      }
      
      // 浏览器环境使用atob
      if (typeof atob !== 'undefined') {
        return atob(str);
      }
      
      // 降级处理
      console.warn('Base64解码不可用，返回原始字符串');
      return str;
    } catch (error) {
      console.error('Base64解码失败:', error);
      return str;
    }
  }

  /**
   * 模拟调用（用于开发和测试）
   */
  async simulateExtraction(videoInfo, platform) {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 根据平台生成不同的模拟结果
    const mockResults = {
      '抖音': [
        "生活就像一杯茶，不会苦一辈子，但总会苦一阵子。坚持住，美好的日子终将到来！",
        "每一个平凡的日子都值得被记录，每一次努力都值得被看见。加油，陌生人！",
        "不要因为一时的困难就放弃梦想，坚持走下去，你会发现世界比你想象的更美好。"
      ],
      'B站': [
        "知识改变命运，学习成就未来。在这个信息爆炸的时代，持续学习是我们保持竞争力的关键。",
        "技术的进步让生活更美好，但真正的价值在于我们如何使用技术来服务人类。",
        "每一次创新都源于对现状的不满和对未来的憧憬。让我们一起创造更美好的明天！"
      ],
      '快手': [
        "简单的生活，真实的快乐。珍惜眼前人，过好每一天。",
        "人生没有白走的路，每一步都算数。坚持做自己，你就是最棒的！",
        "幸福其实很简单，一个微笑，一句问候，一份关心，都是生活的美好。"
      ],
      'default': [
        "《百年孤独》是加西亚·马尔克斯的代表作，讲述了布恩迪亚家族七代人的传奇故事。",
        "活着本身就是一种勇气。在生活的重压下，我们依然要坚强地走下去。",
        "成功的路上并不拥挤，因为坚持的人不多。只要方向正确，终会到达理想的彼岸。"
      ]
    };

    const platformResults = mockResults[platform] || mockResults.default;
    const randomResult = platformResults[Math.floor(Math.random() * platformResults.length)];
    
    return randomResult;
  }

  /**
   * 设置API密钥
   * 火山引擎豆包API使用Bearer Token认证方式
   * 需要从火山引擎控制台获取正确的API Key
   * 注意：IAM AK/SK格式可能不适用于豆包API
   */
  setApiKey(apiKey) {
    this.apiKey = apiKey;
    
    if (apiKey) {
      // 检查是否是IAM AK/SK组合格式
      if (apiKey.includes(':')) {
        const parts = apiKey.split(':');
        if (parts.length === 2) {
          // IAM AK/SK格式：尝试使用Access Key ID作为API Key
          this.accessKeyId = parts[0].trim();
          this.secretAccessKey = parts[1].trim();
          console.log('已配置IAM AK/SK格式密钥，将尝试使用Access Key ID进行Bearer Token认证');
          console.log('⚠️ 注意：IAM AK/SK格式可能不适用于豆包API，建议使用单一API Key格式');
        }
      } else {
        // 单一API Key格式（推荐）
        this.accessKeyId = apiKey.trim();
        console.log('已配置单一API Key格式，将使用Bearer Token认证');
      }
    }
  }

  /**
   * 获取API使用统计
   */
  getUsageStats() {
    return {
      model: this.model,
      maxTokens: 2000,
      costPerCall: 0.01 // 估算每次调用成本
    };
  }
}

// 创建单例实例
const doubaoAPI = new DoubaoAPI();

module.exports = doubaoAPI;