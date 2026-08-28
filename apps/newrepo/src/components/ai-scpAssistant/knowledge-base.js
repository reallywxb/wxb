layui.use(['chcitTable','chcitApp','form','layer','laytpl'], function(){
  var table = layui.chcitTable, App = layui.chcitApp, form = layui.form, layer = layui.layer, laytpl = layui.laytpl,upload = layui.upload;
  var $ = layui.jquery;

  var currentPage = 1;
  var pageSize = 10;

  // ========== 上传区域点击 ==========
  $('#uploadArea').on('click', function(){
    $('#fileInput').click();
  });

  $('#fileInput').on('change', function(){
    var file = this.files[0];
    if(!file) return;
    if(!file.name.toLowerCase().match(/\.(docx|pdf)$/)){
      layer.msg('仅支持 .docx / .pdf 格式', {icon:2});
      this.value = '';
      return;
    }
    if(file.size > 200*1024*1024){
      layer.msg('文件不能超过 200MB', {icon:2});
      this.value = '';
      return;
    }
    $('#fileName').text(file.name);
    $('#fileSize').text(formatSize(file.size));
    $('#fileInfo').addClass('show');
  });

  // ========== 上传表单提交 ==========
  form.on('submit(uploadForm)', function(data){
    var file = $('#fileInput')[0].files[0];
    if(!file){
      layer.msg('请选择 Word / PDF 文档', {icon:2});
      return false;
    }

    var formData = new FormData();
    formData.append('file', file);
    formData.append('doc_name', data.field.doc_title);
    formData.append('doc_type', data.field.doc_type);
    formData.append('version', data.field.version || '');
    formData.append('tags', data.field.tags || '');

    $('#progressBar').show();
    $('#progressFill').css('width','30%').text('上传中...');
    $('#submitBtn').prop('disabled',true).text('处理中...');

    $.ajax({
      url: App.getContextPath() + 'aIChatAction/uploadKnowledge.do',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      dataType: 'json',
      success: function(res){
        $('#progressBar').hide();
        $('#progressFill').css('width','0%').text('0%');
        $('#submitBtn').prop('disabled',false).html('<i class="layui-icon layui-icon-upload"></i> 上传并解析');

        if(res.success){
          layer.msg(res.message || '上传成功！', {icon:1});

          // 渲染预览
          var sections = res.sections || [];
          var previewHtml = '<h4>' + (res.docName || '') + ' — 共 ' + res.sectionCount + ' 个片段</h4><ul>';
          for(var i=0; i<sections.length; i++){
            previewHtml += '<li><b>' + (sections[i].title || '未命名') + '</b> (' + sections[i].imageCount + '张图片)</li>';
          }
          previewHtml += '</ul>';
          $('#previewContent').html(previewHtml);
          $('#previewSection').addClass('show');

          // 刷新列表
          loadList();
        } else {
          layer.msg(res.message || '上传失败', {icon:2});
        }
      },
      error: function(xhr, status, error){
        $('#progressBar').hide();
        $('#submitBtn').prop('disabled',false).html('<i class="layui-icon layui-icon-upload"></i> 上传并解析');
        layer.msg('请求失败：' + error, {icon:2});
      }
    });

    return false;
  });

  // ========== 加载文档列表 ==========
  function loadList(){
    App.submit({
      url: App.getContextPath() + 'aIChatAction/listDocuments.do',
      data: { pageNum: currentPage, pageSize: pageSize },
      succeed: function(res){
        if(res.success){
          renderList(res.data || []);
          renderPagination(res.total || 0);
        } else {
          layer.msg(res.message || '查询失败', {icon:2});
        }
      }
    });
  }

  function renderList(docs){
    if(!docs || docs.length === 0){
      $('#kbTable').html('<p style="text-align:center;color:#999;padding:20px;">暂无数据</p>');
      $('#pagination').html('');
      return;
    }

    var html = '<table><thead><tr>' +
      '<th>文档标题</th><th>类型</th><th>版本</th><th>片段数</th><th>状态</th><th>创建时间</th><th>操作</th>' +
      '</tr></thead><tbody>';

    for(var i=0; i<docs.length; i++){
      var doc = docs[i];
      var isActive = doc.IS_ACTIVE === 'Y';
      // 状态三态：Y=活跃（审核通过可用），N=待审核（自动沉淀默认，不可用），其他/空=已禁用
      var statusText = isActive ? '活跃' : (doc.IS_ACTIVE === 'N' ? '待审核' : '已禁用');
      var statusColor = isActive ? '#16b777' : (doc.IS_ACTIVE === 'N' ? '#FFB800' : '#999');

      // 操作：待审核 → 审核按钮；已活跃 → 删除按钮；其余也显示删除
      var actionHtml = '';
      if(doc.IS_ACTIVE === 'N'){
        actionHtml += '<a class="layui-btn layui-btn-xs" style="background:#16b777;" href="javascript:;" onclick="auditDoc(\'' + doc.DOC_ID + '\')">审核</a> ';
      }
      actionHtml += '<a class="layui-btn layui-btn-xs" href="javascript:;" onclick="viewChunks(\'' + doc.DOC_ID + '\')">查看片段</a> ' +
          '<a class="layui-btn layui-btn-xs layui-btn-danger" href="javascript:;" onclick="deleteDoc(\'' + doc.DOC_ID + '\')">删除</a>';

      html += '<tr>' +
        '<td>' + (doc.DOC_NAME || '') + '</td>' +
        '<td>' + (doc.DOC_TYPE || '-') + '</td>' +
        '<td>' + (doc.VERSION || '-') + '</td>' +
        '<td>' + (doc.TOTAL_CHUNK_COUNT || 0) + '</td>' +
        '<td style="color:' + statusColor + ';">' + statusText + '</td>' +
        '<td>' + (doc.CREATED_TIME || '-') + '</td>' +
        '<td>' + actionHtml + '</td>' +
        '</tr>';
    }

    html += '</tbody></table>';
    $('#kbTable').html(html);
  }

  function renderPagination(total){
    var totalPages = Math.ceil(total / pageSize);
    if(totalPages <= 1){
      $('#pagination').html('');
      return;
    }
    var html = '<span class="page-info">共 ' + total + ' 条，第 ' + currentPage + '/' + totalPages + ' 页</span>';
    if(currentPage > 1){
      html += '<a class="layui-btn layui-btn-xs" href="javascript:;" onclick="changePage(' + (currentPage-1) + ')">上一页</a>';
    }
    if(currentPage < totalPages){
      html += '<a class="layui-btn layui-btn-xs" href="javascript:;" onclick="changePage(' + (currentPage+1) + ')">下一页</a>';
    }
    $('#pagination').html(html);
  }

  // ========== 工具函数 ==========
  function formatSize(bytes){
    if(bytes < 1024) return bytes + ' B';
    if(bytes < 1024*1024) return (bytes/1024).toFixed(1) + ' KB';
    return (bytes/1024/1024).toFixed(1) + ' MB';
  }

  // ========== 全局函数 ==========
  window.viewChunks = function(docId){
    // 注意：App.show 的 iframe src 用相对路径会按顶层页面地址栏 URL 解析，
    // 知识库页面若经菜单/重定向打开则目录不是 ai-chat/，会 404。
    // 必须用 getContextPath() 全路径（与 showProductWin 等项目惯例一致）
    App.show({
      title: '文档片段详情',
      url: App.getContextPath() + 'system/pages/ai-chat/knowledge-base-detail.html?docId=' + docId,
      width: '900px',
      height: '600px'
    });
  };

  window.auditDoc = function(docId){
    layer.confirm('确认审核通过该文档？通过后即进入知识库，可被 AI 检索命中。', {icon:3, title:'审核确认'}, function(index){
      App.submit({
        url: App.getContextPath() + 'aIChatAction/auditDocument.do',
        data: { docId: docId },
        succeed: function(res){
          if(res.success){
            layer.msg(res.message || '审核通过', {icon:1});
            loadList();
          } else {
            layer.msg(res.message || '审核失败', {icon:2});
          }
        }
      });
      layer.close(index);
    });
  };

  window.deleteDoc = function(docId){
    layer.confirm('确定删除该文档及其所有片段吗？', {icon:3, title:'确认删除'}, function(index){
      App.submit({
        url: App.getContextPath() + 'aIChatAction/deleteDocument.do',
        data: { docId: docId },
        succeed: function(res){
          if(res.success){
            layer.msg('删除成功', {icon:1});
            loadList();
          } else {
            layer.msg(res.message || '删除失败', {icon:2});
          }
        }
      });
      layer.close(index);
    });
  };

  window.changePage = function(page){
    currentPage = page;
    loadList();
  };

  // 初始加载列表
  loadList();
});
