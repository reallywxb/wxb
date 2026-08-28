/**
 * AI 智能助手 - 前端交互逻辑
 */
var aiChatHistory = [];
var aiChatSending = false;

function toggleAIChat() {
    var win = document.getElementById('aiChatWindow');
    if (win.classList.contains('ai-chat-hidden')) {
        win.classList.remove('ai-chat-hidden');
        if (aiChatHistory.length === 0) {
            initAIChat();
        }
    } else {
        win.classList.add('ai-chat-hidden');
    }
}

function initAIChat() {
    aiChatHistory = [{
        role: "assistant",
        content: "您好！我是智能数据助手，可以帮您查询数据或回答问题。"
    }];
}

/**
 * 清空对话历史并重置聊天窗口
 */
function clearAIChat() {
    if (!confirm('确定要清空当前对话记录吗？')) return;
    
    // 重置历史
    aiChatHistory = [];
    
    // 清空聊天框内容
    var body = document.getElementById('aiChatBody');
    body.innerHTML = '';
    
    // 重新初始化欢迎语
    initAIChat();
    appendAIMsg(aiChatHistory[0].content, 'bot');
}

function sendAIMsg() {
    var input = document.getElementById('aiChatInput');
    var msg = input.value.trim();
    if (!msg) return;
    if (aiChatSending) return;

    // 显示用户消息
    appendAIMsg(msg, 'user');
    input.value = '';
    aiChatHistory.push({ role: "user", content: msg });

    aiChatSending = true;
    document.getElementById('aiChatSendBtn').disabled = true;

    // 显示加载状态
    showAITyping();

    // 调用后端接口
    $.ajax({
        url: '../aIChatAction/chat.do',
        type: 'POST',
        data: { msg: msg, history: JSON.stringify(aiChatHistory) },
        success: function(result) {
            removeAITyping();
            console.log('AI response:', result);
            
            var botReplyText = ''; // 用于回填历史
            
            if (result.success) {
                var type = result.type || 'chat';
                
                if (type === 'sql_query') {
                    // SQL查询结果
                    var rows = result.data || [];
                    if (rows.length > 0) {
                        appendAITable(rows);
                        botReplyText = '查询完成，共找到 ' + rows.length + ' 条数据。';
                    } else {
                        appendAIMsg('查询完成，没有找到数据。', 'bot');
                        botReplyText = '查询完成，没有找到数据。';
                    }
                } else if (type === 'chat_html') {
                    // 富文本回复（包含图片）
                    var html = result.content || '';
                    appendAIHtml(html);
                    botReplyText = '[图文回复]';
                } else if (result.from_knowledge_base) {
                    // 知识库回复（大模型润色文本 + 可选截图/富文本）
                    // 优先使用富文本 content_html（仅当润色失败降级返回原始内容时出现）
                    if (result.content_html) {
                        var richHtml = normalizeHtmlImages(result.content_html);
                        var html = '<div class="ai-kb-rich">' + richHtml + '</div>';
                        
                        // 如果还有截图列表，追加截图区域
                        if (result.screenshots && result.screenshots.length > 0) {
                            html += buildScreenshotsHtml(result.screenshots);
                        }
                        
                        appendAIHtml(html);
                        botReplyText = result.content || '[图文回复]';
                        return;
                    }
                    
                    // 内容部分：使用 escapeHtml 转义 + 换行处理（和 appendAIMsg 保持一致）
                    var contentText = result.content || '收到';
                    var html = '<div>' + escapeHtml(contentText).replace(/\n/g, '<br>') + '</div>';
                    
                    // 添加截图（大模型回答末尾引导查看，此处渲染真实图片）
                    html += buildScreenshotsHtml(result.screenshots);
                    
                    appendAIHtml(html);
                    botReplyText = result.content || '[图文回复]';
                } else {
                    // 普通回复
                    var text = result.content || '收到';
                    appendAIMsg(text, 'bot');
                    botReplyText = text;
                }
            } else {
                // 失败情况
                var errorMsg = result.message || '抱歉，处理您的请求时出错了';
                appendAIMsg(errorMsg, 'bot');
                botReplyText = errorMsg;
            }
            
            // 回填 bot 回复到历史，保持上下文完整
            if (botReplyText) {
                aiChatHistory.push({ role: "assistant", content: botReplyText });
            }
        },
        error: function(xhr, status, error) {
            removeAITyping();
            console.error('AI请求失败:', status, error, xhr.responseText);
            
            var errorMsg = '抱歉，处理您的请求时遇到了一点小问题，请稍后再试。';
            
            if (xhr.status === 0) {
                errorMsg = '网络连接失败，请检查网络后重试。';
            } else if (xhr.status === 401) {
                errorMsg = '登录已过期，即将跳转到登录页面...';
                appendAIMsg(errorMsg, 'bot');
                setTimeout(function() {
                    window.top.location.href = '../login.html';
                }, 1500);
                return;
            } else if (xhr.status === 404) {
                errorMsg = '服务暂时不可用，请稍后再试。';
            } else if (xhr.status === 500) {
                errorMsg = '服务器开小差了，请稍后再试。';
            } else if (status === 'timeout') {
                errorMsg = '请求超时，请稍后重试。';
            }
            
            appendAIMsg(errorMsg, 'bot');
        },
        timeout: 60000,
        complete: function() {
            aiChatSending = false;
            document.getElementById('aiChatSendBtn').disabled = false;
            document.getElementById('aiChatInput').focus();
        }
    });
}

function appendAIMsg(text, type) {
    var body = document.getElementById('aiChatBody');
    var div = document.createElement('div');
    div.className = 'ai-msg ai-msg-' + (type === 'user' ? 'user' : 'bot');
    div.innerHTML = '<div class="ai-msg-content">' + escapeHtml(text).replace(/\n/g, '<br>') + '</div>';
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
}

function appendAIHtml(html) {
    var body = document.getElementById('aiChatBody');
    var div = document.createElement('div');
    div.className = 'ai-msg ai-msg-bot';
    div.innerHTML = '<div class="ai-msg-content ai-rich-content">' + html + '</div>';
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
}

function aiImagePreview(src) {
    var overlay = document.createElement('div');
    overlay.className = 'ai-image-overlay';
    overlay.innerHTML = '<div class="ai-image-overlay-content">' +
        '<img src="' + src + '" alt="预览" />' +
        '<span class="ai-image-overlay-close" onclick="aiImagePreviewClose(this)">&times;</span>' +
        '</div>';
    document.body.appendChild(overlay);
}

function aiImagePreviewClose(el) {
    var overlay = el.closest('.ai-image-overlay');
    if (overlay) overlay.remove();
}

function appendAITable(rows) {
    var body = document.getElementById('aiChatBody');
    var div = document.createElement('div');
    div.className = 'ai-msg ai-msg-bot';
    
    // 获取列名
    var columns = [];
    for (var key in rows[0]) {
        if (rows[0].hasOwnProperty(key)) {
            columns.push(key);
        }
    }
    
    var html = '<div class="ai-msg-content">';
    html += '<div class="ai-table-wrapper">';
    html += '<div class="ai-table-toolbar">';
    html += '<span class="ai-table-info">共 ' + rows.length + ' 条数据</span>';
    html += '<button class="ai-export-btn" onclick="exportToExcel(this)" data-table-data="' + encodeURIComponent(JSON.stringify(rows)) + '" data-columns="' + encodeURIComponent(JSON.stringify(columns)) + '">📥 导出Excel</button>';
    html += '</div>';
    html += '<table class="ai-table">';
    
    // 表头
    html += '<thead><tr>';
    for (var i = 0; i < columns.length; i++) {
        html += '<th>' + escapeHtml(columns[i]) + '</th>';
    }
    html += '</tr></thead>';
    
    // 表体
    html += '<tbody>';
    for (var r = 0; r < rows.length; r++) {
        html += '<tr>';
        for (var c = 0; c < columns.length; c++) {
            var val = rows[r][columns[c]];
            html += '<td>' + escapeHtml(val || '') + '</td>';
        }
        html += '</tr>';
    }
    html += '</tbody>';
    html += '</table>';
    html += '</div>';
    html += '</div>';
    
    div.innerHTML = html;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
}

/**
 * 导出表格数据到Excel
 */
function exportToExcel(btn) {
    var dataStr = decodeURIComponent(btn.getAttribute('data-table-data'));
    var columnsStr = decodeURIComponent(btn.getAttribute('data-columns'));
    
    // 生成文件名
    var now = new Date();
    var timestamp = now.getFullYear() + '' + 
        ('0' + (now.getMonth() + 1)).slice(-2) + 
        ('0' + now.getDate()).slice(-2) + '_' + 
        ('0' + now.getHours()).slice(-2) + 
        ('0' + now.getMinutes()).slice(-2) + 
        ('0' + now.getSeconds()).slice(-2);
    var title = '查询结果_' + timestamp;
    
    // 创建表单提交（POST方式下载文件）
    var form = document.createElement('form');
    form.method = 'POST';
    form.action = '../aIChatAction/exportExcel.do';
    form.style.display = 'none';
    
    var dataInput = document.createElement('input');
    dataInput.type = 'hidden';
    dataInput.name = 'data';
    dataInput.value = dataStr;
    form.appendChild(dataInput);
    
    var columnsInput = document.createElement('input');
    columnsInput.type = 'hidden';
    columnsInput.name = 'columns';
    columnsInput.value = columnsStr;
    form.appendChild(columnsInput);
    
    var titleInput = document.createElement('input');
    titleInput.type = 'hidden';
    titleInput.name = 'title';
    titleInput.value = title;
    form.appendChild(titleInput);
    
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    
    // 按钮反馈
    var originalText = btn.innerHTML;
    btn.innerHTML = '✅ 导出成功';
    btn.disabled = true;
    setTimeout(function() {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }, 2000);
}

function showAITyping() {
    var body = document.getElementById('aiChatBody');
    var div = document.createElement('div');
    div.className = 'ai-msg ai-msg-bot';
    div.id = 'aiTypingIndicator';
    div.innerHTML = '<div class="ai-msg-content ai-typing"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div>';
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
}

function removeAITyping() {
    var indicator = document.getElementById('aiTypingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

function escapeHtml(text) {
    if (typeof text !== 'string') return text;
    var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

/**
 * 规范化知识库截图 URL
 * 兼容三种格式：
 * 1. 旧格式 "loadImage.do?path=..." → 补全为 "../aIChatAction/loadImage.do?path=..."
 * 2. 新格式 "../aIChatAction/loadImage.do?path=..." → 直接用
 * 3. 完整 URL "http://..." 或 "/xxx/loadImage.do?..." → 直接用
 */
function normalizeImageUrl(url) {
    if (!url) return url;
    // 已经是完整 URL 或以 / 开头的绝对路径，直接用
    if (/^https?:\/\//i.test(url) || url.charAt(0) === '/') {
        return url;
    }
    // 旧格式：loadImage.do?path=...（没有 aIChatAction 前缀）
    if (url.indexOf('aIChatAction/') === -1 && url.indexOf('loadImage.do') !== -1) {
        // 页面在 /system/ 下，../ 回到应用根目录
        return '../aIChatAction/' + url;
    }
    return url;
}

/**
 * 渲染知识库截图区域 HTML（复用，避免代码重复）
 */
function buildScreenshotsHtml(screenshots) {
    if (!screenshots || screenshots.length === 0) return '';
    var html = '<div style="margin-top: 16px; padding: 12px; background: #fef3c7; border-radius: 6px;">';
    html += '<div style="font-size: 13px; color: #92400e; margin-bottom: 8px; font-weight: 500;">📷 相关作业流程截图</div>';
    
    for (var i = 0; i < screenshots.length; i++) {
        var screenshot = screenshots[i];
        var imgUrl = normalizeImageUrl(screenshot.url);
        html += '<div style="margin-bottom: 12px; text-align: center;">';
        html += '<img src="' + escapeHtml(imgUrl) + '" alt="' + escapeHtml(screenshot.name || '截图') + '" style="max-width: 100%; border: 1px solid #e5e7eb; border-radius: 4px; cursor: pointer;" onclick="window.open(\'' + escapeHtml(imgUrl) + '\', \'_blank\')">';
        if (screenshot.name) {
            html += '<div style="font-size: 12px; color: #6b7280; margin-top: 4px;">' + escapeHtml(screenshot.name) + '</div>';
        }
        html += '</div>';
    }
    html += '</div>';
    return html;
}

/**
 * 规范化富文本 HTML 中的图片地址
 * 把 content_html 里所有 <img src="..."> 的 src 传给 normalizeImageUrl 处理，
 * 兼容旧格式（loadImage.do?path=）、新格式（../aIChatAction/...）和完整 URL
 */
function normalizeHtmlImages(html) {
    if (!html) return html;
    return html.replace(/src="([^"]*)"/g, function(match, url) {
        return 'src="' + escapeHtml(normalizeImageUrl(url)) + '"';
    });
}

// 回车发送
$(document).ready(function() {
    $('#aiChatInput').on('keypress', function(e) {
        if (e.which === 13 && !e.shiftKey) {
            e.preventDefault();
            sendAIMsg();
        }
    });
});
