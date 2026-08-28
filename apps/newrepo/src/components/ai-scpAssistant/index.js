var dropDelete=false;
layui.use(['fsTab','fsMenu','layer','chcitApp'], function(){
	var fsTab = layui.fsTab,
	fsMenu = layui.fsMenu,
	App = layui.chcitApp;
 	//top.chcitApp=layui.chcitApp;
	  //Context = {};
	  //var cssFlag = 'first';
	  var menuStyle = 'tile';  //tile为平铺,dropDown为下拉框
	  //var menuStyle = 'dropDown';  //tile为平铺,dropDown为下拉框
	  //head添加link
	  var head = document.getElementsByTagName("head")[0], link = document.createElement('link');
	  link.rel = 'shortcut icon';
	  link.href = './images/001.ico'
	  head.appendChild(link);
	  top.cssFlag = 'first'; //默认样式
	 // var topMenuLiIndex = ''
	  var Login = {
	      write: function(name,value) {
	         $.cookie(name, value, {
	            expires: 30,
	            path: "/"
	         });
	      },
	      //读取cookied历史记录
	      read: function(name) {
	         var n = $.cookie(name);
	        
	         if(n=='first'||n=='second'){
	            var cssFlag=n;
	            top.cssFlag = cssFlag;
	            var css=document.getElementById("css")
	            /*
	            if(cssFlag=='first'){
	              css.setAttribute('href','./plugins/layui/css/layui.css'); 
	            }else if(cssFlag=='second'){
	              css.setAttribute('href','./plugins/layui/css/layui-second.css'); 
	            }*/
	            if (cssFlag == 'first') {
	            	let isContains = false
	            	//console.log($(css).find('link'))
	                $($(document).find('link')).each(function(j, k) {
	                  if ($(k).attr('href').indexOf('layui.css') != -1) {
	                	  isContains = true	 
	                  }
	                })
	                if(!isContains){
	                	 css.setAttribute('href','./plugins/layui/css/layui.css');	
	                }
	            } else if (cssFlag == 'second') {
	            	let isContains2 = false
	                $($(document).find('link')).each(function(j, k) {	
	                  if ($(k).attr('href').indexOf('layui-second.css') != -1) {  
	                	  isContains2 = true
	                  }
	              })
	              if(!isContains2){
	            	  css.setAttribute('href','./plugins/layui/css/layui-second.css'); 
	             }
	            }
	            return false;
	         }
	         if (n && n.length > 0) {
	            let index = n;
	            $('#fsTopMenu li').eq(index).click();
	            $('#fsTopMenu2 dl dd').eq(index).click();
	            $('#selectoption option').removeClass('layui-this');
	            $('#selectoption option').eq(index).addClass('layui-this');
	         }
	         /*if(name.indexOf('TopMenu')!=-1){ // 切换一级菜单样式  2019/01/02 wn
	            if(n){
	              TopMenu = n
	            }
	            $('.changeTopMenu').attr('data-value',n);
	            if(TopMenu==1){
	              $('#fsTopMenu').show();
	            }else{
	              $('#fsTopMenu2').show();
	            }
	         }*/
	      },
	      clear: function() {
	         $.cookie("config", null, {
	            path: "/"
	         });
	      }
	  }

	  var logout = function(){
	     $.ajax({
	        url:App.getContextPath()+'initAction/logout.do',
	        success:function(){
	        	$(window).unbind('beforeunload');
	        	window.onbeforeunload=null;
	     		window.location.href=App.getContextPath()
	        }
	     });
	  }

	  //修改密码，显示对应div,执行完操作，添加关闭事件
	  var editpassword = function(){
	    /*$('.layui-personal').show();*/
	    var passwordIndex = layer.open({
	      type: 1, 
	      title:'修改密码',
	      area: ['300px', '250px'],
	      content:$('.layui-personal'), //这里content是一个普通的String
	      end:function(){
	        $('#cancelPersonal').unbind();//为了防止每次打开都绑定关闭事件，所以销毁的时候解除绑定事件
	      }
	    });

	    //绑定关闭事件
	    $('#cancelPersonal').on('click',function(){
	    	$("#oldPassword").val("");
			$("#password").val("");
			$("#passwordConfirm").val("");
	        layer.close(passwordIndex);
	    });
	    //绑定关闭事件
	    $('#savePersonal').on('click',function(){
			var oldPassword= $("#oldPassword").val();
			var password= $("#password").val();
			var passwordConfirm= $("#passwordConfirm").val();
			if (password!=passwordConfirm ){
			  layer.msg('新密码不一致');
			  return;
			}
			$.ajax({
	        url:App.getContextPath()+'userBaseHandleAction/updatePassword.do',
	        data:{
	        	oldPassword:oldPassword,
	        	password:password,
	        },
	        dataType:"json",  
	        success:function(data){
	        	if(data.success){
	        		layer.msg(data.msg);
	        		$('#cancelPersonal').click();
	       	    }else{
	       		     layer.msg(data.msg);
	        	}
	        }
	     });
			
	    });
	  }
	  
	  
	  //修改密码，显示对应div,执行完操作，添加关闭事件
	  var editpasswordForce = function(){
	    /*$('.layui-personal').show();*/
	    var passwordIndex = layer.open({
	      type: 1, 
	      closeBtn:0,
	      title:(top.chcAppConfig.resetPasswordReason?top.chcAppConfig.resetPasswordReason:"修改密码"),
	      area: ['400px', '250px'],
	      content:$('.layui-personal'), //这里content是一个普通的String
	      end:function(){
	        $('#cancelPersonal').unbind();//为了防止每次打开都绑定关闭事件，所以销毁的时候解除绑定事件
	      }
	    });

	    //绑定关闭事件
	    $('#cancelPersonal').on('click',function(){
	    	$("#oldPassword").val("");
			$("#password").val("");
			$("#passwordConfirm").val("");
	        layer.close(passwordIndex);
	    });
	    //绑定关闭事件
	    $('#savePersonal').on('click',function(){
			var oldPassword= $("#oldPassword").val();
			var password= $("#password").val();
			var passwordConfirm= $("#passwordConfirm").val();
			if (password!=passwordConfirm ){
			  layer.msg('新密码不一致');
			  return;
			}
			$.ajax({
	        url:App.getContextPath()+'userBaseHandleAction/updatePassword.do',
	        data:{
	        	oldPassword:oldPassword,
	        	password:password,
	        },
	        dataType:"json",  
	        success:function(data){
	        	if(data.success){
	        		layer.msg(data.msg);
	        		$('#cancelPersonal').click();
	       	    }else{
	       		     layer.msg(data.msg);
	        	}
	        }
	     });
			
	    });
	  }

	var messageIndex
	function loadMessage(){
		App.submit({
			url : App.getContextPath()+'userTipsAction/pcTips.do',
			async: false,
			data:{isRead:'N'},
			headers: {chcToken:top.chcToken}, //可以因为时序问题，这个请求全局的ajaxSetup不起作用，需手工设置token
			succeed:function(result){
				if(result.success==true){
					/*result.rows=[
						{AD_USER_TIPS_ID: 1, Title: '标题1', Created: "2018-04-20 09:59", Content: 11},
						{AD_USER_TIPS_ID: 2, Title: "标题2", Created: "2018-04-21 09:59", Content: 22},
						{AD_USER_TIPS_ID: 3, Title: "标题3", Created: "2018-04-22 09:59", Content: 33},
						{AD_USER_TIPS_ID: 4, Title: "标题4", Created: "2018-04-23 09:59", Content: 44},
					]*/
					if(result.rows.length>0){//判断当前页面有没有消息提示，如果有提示，则不关闭之前的
						if($('#messageDetail').length>0){
							//页面存在消息，不推
						}else{
							layer.close(messageIndex)
							var num=0;
							var arr = result.rows;
							var params = {};
							messageIndex = layer.open({
							 	title: arr[num].Title
							  	,offset: 'rb'
							 	,content: '<span id="messageDetail">'+arr[num].Content.toString()+'</span>'
							 	,area: ['330px', '180px']
							 	,btn: ['下一条','查看全部'] //可以无限个按钮
								,shade: 0
								,yes: function(index, layero){									
									num++;
									if(arr.length<(num+1)){
										return false;
									}else{
										if(arr.length==(num+1)){//没有数据了
											layero.find('.layui-layer-btn0').text('没有了')
										}
										//}else{
										layero.find('#messageDetail').attr('data-id',num).text(arr[num].Content.toString())
										layero.find('.layui-layer-title').text(arr[num].Title)
										//console.log('读取')
								    	read(params,arr,num)
									}
								}
								,btn2: function(index, layero){
									fsTab.customTab('消息提醒', 'pages/sys/message/messageList.html','spd.web.sys.message.list');
									return false;
								},
								success: function(layero, index){
								    layero.find('#messageDetail').attr('data-id',num).unbind('click').on('click',function(){
								    	var record = arr[$(this).attr('data-id')]
								    	record.title = record.Title;
								    	record.date = record.Created;
								    	record.content = record.Content.toString();
								        App.show({
								            title:'消息编号:'+record.AD_USER_TIPS_ID,
								            url:'pages/home/notice-details.html',
								            height:'300px',
								            width:'400px',
								            maxmin: true,
								            cfg:record
								        });
									})
									read(params,arr,num)
								}
							});
						}
					}else{
						//没有数据，不渲染
					}
				}
			}
		});
		/**/
	}
	
	
	setInterval(function(){
        loadMessage();
    },60000)

	function read(params,arr,num){
		params.ids = arr[num].AD_USER_TIPS_ID;
		//console.log(params)
		App.submit({
			url : App.getContextPath()+'userTipsAction/readTips.do',
			async: false,
			data:params,
			success:function(res){
			}
        });
	}

	//监听关闭了哪个tab，获取对应的id
	$("#fsTabMenu").on("click",function(e){
	    if($(e.target).is(".layui-tab-close")){
	        var id = $(e.target).parent().attr("lay-id");
		    $('#fsLeftMenu .layui-nav-child>dd[lay-id="'+ id +'"],#fsLeftMenu>li[lay-id="'+id+'"]',top.document).removeClass('layui-this');
	    }
	})
	//调用主页的删除快捷菜单
    dropDelete = function(ev){
    	document.getElementById("appIFrame").contentWindow.window.document.getElementById("short.html").contentWindow.dropDelete(ev)//多层iframe嵌套
       //document.getElementById("appIFrame").contentWindow.dropDelete(ev);
    }
    //监听页面刷新之前
    window.onbeforeunload = function(){  
	    return '退出当前页面后，当前数据将不会保存，确认退出吗？';  
	  };  

	function changeTopMenu(){
		if( menuStyle === 'dropDown'){
			 	$('#fsTopMenu').hide();
			 	$('#fsTopMenu2').show();
			}else{
			 	$('#fsTopMenu2').hide();
				$('#fsTopMenu').show();
			}
	}
	//全屏并退出全屏

	//进行切换
	var fullScreenClickCount=0; 
	//调用各个浏览器提供的全屏方法
	var handleFullScreen = function () {
	    var de = document.documentElement;

	    if (de.requestFullscreen) {
	        de.requestFullscreen();
	    } else if (de.mozRequestFullScreen) {
	        de.mozRequestFullScreen();
	    } else if (de.webkitRequestFullScreen) {
	        de.webkitRequestFullScreen();
	    } else if (de.msRequestFullscreen) {
	        de.msRequestFullscreen();
	    }
	    else {
	        wtx.info("当前浏览器不支持全屏！");
	    }

	};
	//调用各个浏览器提供的退出全屏方法
	var exitFullscreen=function() {
	    if(document.exitFullscreen) {
	        document.exitFullscreen();
	    } else if(document.mozCancelFullScreen) {
	        document.mozCancelFullScreen();
	    } else if(document.webkitExitFullscreen) {
	        document.webkitExitFullscreen();
	    }
	}
	$('#changeScreen').on('click',function(){
		 if (fullScreenClickCount % 2 == 0) {
		        handleFullScreen();
		        $('#changeScreen .full-screen').hide()
		        $('#changeScreen .screen-restore').show()
		    } else {
		        exitFullscreen();
		        $('#changeScreen .full-screen').show()
		        $('#changeScreen .screen-restore').hide()
		    }
		    fullScreenClickCount++;
	})
	
	//切换皮肤
	$('#changeCss').on('click',function(){
		
		top.layer.confirm('', {
			title: '更换皮肤',
			//icon: 4,
			content: '此操作需要刷新当前页面，当前数据将不会保存，确认继续吗？',
			btn: ['确认','取消']
		},function(){
			var cssFlag = $.cookie(top.chcAppConfig.username+'css');
			top.cssFlag = cssFlag;
			if(cssFlag=='first'){
		      cssFlag='second';
		    }else if(cssFlag=='second'){
		      cssFlag='first';
		    }
		    else
		      cssFlag='first';
			$.cookie(top.chcAppConfig.username+'css', cssFlag, {
	            expires: 30,
	            path: "/"
	         });
			$(window).unbind('beforeunload');
			window.onbeforeunload = null;
			window.location.href=window.location.href;
		});
		
		//window.location.reload();
	    //window.location.reload();
	})
	//关闭消息提示框
	$('.newMessage-close').on('click',function(){
		$('.newMessage').hide(500);
	})
	//点击消息提示
	$('.newMessage-text').on('click',function(){

	})


	
	function hashChanged(){
		//获取路由信息
		var hash = window.location.hash;
		
		if(!$.isEmpty(hash) && hash.length>1){
			var menuId = hash.substring(1);
			//获取layId
			var dom = $('#fsLeftMenu a[menuId="'+ menuId +'"]').parent();
			if(dom.length>0){
				fsTab.add(dom);
				fsTab.menuSelectCss(dom.attr("lay-id"));
			}
		}
	}
	
	//选择一级菜单，平铺
	$("#fsTopMenu").on("click","li",function(e){
		var dataPid = $(this).attr("dataPid");
		showMenu(dataPid);
	});

	//选择一级菜单，下拉框
	$("#fsTopMenu2 #selectoption .layui-anim-upbit dd").bind("click",function(){
		if($('#fsTopMenu2').is(':visible')){
			var va= $(this).attr('lay-value');
			var dataPid ;
			$('#selectoption>select>option')
			for(var i=0;i<$('#selectoption>select>option').length;i++){
				if($('#selectoption>select>option').eq(i).html()==va){
					dataPid =$('#selectoption>select>option').eq(i).attr('datapid')
				}
			}
			showMenu(dataPid);
			$("#fsTopMenu2 #selectoption .layui-form-select dl").css('display','none')	 
		}
	});
	//显示菜单
//	$("#fsTopMenu2 #selectoption .layui-form-select").bind("click",function(){
//		if($('#fsTopMenu2').is(':visible')){
//			console.log($(this).hasClass('layui-form-selected'))
//			if($(this).hasClass('layui-form-selected')){
//				$(this).find('dl').css('display','none')
//				$(this).find('input').removeClass('focusInput')
//				$(this).removeClass('layui-form-selected')
//			}else{
//				$(this).find('dl').css('display','block')
//				$(this).addClass('layui-form-selected')
//				$(this).find('input').addClass('focusInput')
//			}	 
//		}
//	});
	//显示菜单
	$("#fsTopMenu2 #selectoption .layui-form-select").hover(function() {
		$(this).find('dl').css('display','block')
		$(this).addClass('layui-form-selected')
		$(this).addClass('i-selected')
		$(this).find('input').addClass('focusInput')
		},function(){
			$(this).find('dl').css('display','none')
			$(this).find('input').removeClass('focusInput')
			$(this).removeClass('layui-form-selected')
			$(this).removeClass('i-selected')
		}
	);
	
	//显示菜单
	function showMenu(dataPid){
		if(!$.isEmpty(dataPid)){
			$('#fsLeftMenu>li').hide();
			$('#fsLeftMenu>li[dataPid="'+ dataPid +'"]').show();
		}
		
		if($('#fsTopMenu').is(':visible')){
			  //$('#fsTopMenu li').removeClass('layui-this')
	         // $('#fsTopMenu li[dataPid ="'+ dataPid +'"]').addClass('layui-this')
            Login.write(top.chcAppConfig.username,$('#fsTopMenu .layui-this').index()-1);
        }else{     	
            Login.write(top.chcAppConfig.username,$('#fsTopMenu2 dl .layui-this').index());
        }
	}
	function textWidth(text){
	     var sensor = document.createElement('a');
	     sensor.innerHTML = text;
	     
	     //sensor.fontSize = 14px;
	     var body = document.getElementsByTagName('body')[0];
	     body.appendChild(sensor);
	     const fontSize = $('.layui-select-title>input').css('font-size') ? $('.layui-select-title').css('font-size') : '14px'
	   	 $(sensor).css('fontSize',fontSize)
	   	 $(sensor).css('textAlgin','center')
	     var width = sensor.offsetWidth;
	     body.removeChild(sensor);
	     return width;
	 };
	 
	function fsTopMenuDivWidth(){
		$('#fsTopMenuDiv').width($(window).outerWidth()-Number($('#fsTopMenuDiv').css('left').split('px')[0])-$('.layui-layout-right').outerWidth());
		if($('#fsTopMenu').is(':visible')){
			const n = $('#fsTopMenu .layui-this').index()-1
			var w = 0
			var len = $('#fsTopMenu li').length
			var leftWidth = 0
			for(i=0;i<len;i++){
				document.querySelectorAll('#fsTopMenu li')
				w+= $('#fsTopMenu li').eq(i).outerWidth()
				if(i<=n){
					leftWidth += $('#fsTopMenu li').eq(i).outerWidth()
				}
			}
			$('#fsTopMenu').width(w);
         	var scrollLeft = leftWidth - $('.scrollDiv').width() 
         	if(scrollLeft > 0){
         		$('.scrollDiv').animate({ scrollLeft:scrollLeft}, 100)
         	}
		}
		if($('#fsTopMenu2').is(':visible')){
			var textWidthArr = []
	     	for (var i=0;i<$('#selectoption option').length;i++){
	     		textWidthArr.push(textWidth($('#selectoption option').eq(i).text()))
	     	}
	     	var width = textWidthArr.sort(function(a,b){ return b-a })[0] + 10;
	     	$('#selectoption').width(width);
		}
		$('.scrollDiv').width($('#fsTopMenuDiv').width()- 40);
		if($('.scrollDiv').width()<$('#fsTopMenu').width()){
			$('#fsTopMenuDiv .leftIcon').show()
			$('#fsTopMenuDiv .rightIcon').show()
		 
		}else{
			$('#fsTopMenuDiv .leftIcon').hide()
			$('#fsTopMenuDiv .rightIcon').hide()
		}
//		$('#fsTopMenu li').eq(n).click();
//    	$('#fsTopMenu2 dl dd').eq(n).click();
//     	$('#selectoption option').removeClass('layui-this');
//     	$('#selectoption option').eq(n).addClass('layui-this');
//		if($('.scrollDiv').width()<$('#fsTopMenu').width()){
//			$('#fsTopMenu2').show();
//	 		$('#fsTopMenu').hide();
//			 
//		}else{
//			
//			$('#fsTopMenu2').hide();
//	 		$('#fsTopMenu').show();
//		}
	}

	$('.leftIcon,.rightIcon').on('click',function(i,v){
		if($(this).hasClass('leftIcon')){
			$('.scrollDiv').animate({ scrollLeft:$('.scrollDiv').scrollLeft()-150}, 100)
		}else{
			$('.scrollDiv').animate({ scrollLeft:$('.scrollDiv').scrollLeft()+150}, 100)
		}
	})

	
	//新增tab
	function addTab(title,dataUrl,layId){
		fsTab.add(title,dataUrl,layId);
	}
	
	//手机设备的简单适配
	var treeMobile = $('.site-tree-mobile'),
		shadeMobile = $('.site-mobile-shade')

	treeMobile.on('click', function(){
		$('body').addClass('site-mobile');
	});

	shadeMobile.on('click', function(){
		$('body').removeClass('site-mobile');
	});
	
	//右上角图标动画
	$('.layui-layout-right>li').on('mouseover',function(){
		$(this).find('.fa-caret-down').removeClass('fa-caret-down').addClass('fa-caret-up');
	})

	$('.layui-layout-right>li').on('mouseout',function(){
		$(this).find('.fa-caret-up').removeClass('fa-caret-up').addClass('fa-caret-down');
	})

	$(".fsSwitchMenu").on("click",function(){
		if($(this).hasClass('closeic')){
			$(this).removeClass('closeic').addClass('openic');
			$(this).find('img').attr('src','images/open.png');
		}else{
			$(this).removeClass('openic').addClass('closeic');
			$(this).find('img').attr('src','images/close.png');
		}
		$(".layui-layout-admin").toggleClass("showMenu");
	});
	
	/**
	 * 右边菜单
	 */
	$.contextMenu({
    selector: '.layui-tab-title li', 
    callback: function(key, options) {
    	var layId = $(this).attr("lay-id");
    	switch (key) {
				case "close":
					fsTab.del(layId);
					break;
				case "closeOther":
					$(this).parent().children("li").each(function(i,e){
						if($(this).find(".layui-tab-close").is(":visible")){
							var newLayId = $(this).attr("lay-id");
							if(layId != newLayId ){
								fsTab.del(newLayId);
							}
						}
					});
					break;
				case "closeAll":
					$(this).parent().children("li").each(function(i,e){
						if($(this).find(".layui-tab-close").is(":visible")){
							var newLayId = $(this).attr("lay-id");
							fsTab.del(newLayId);
						}
					});
					break;
				default:
					break;
    	}
    },
    items: {
      "close": {name: "关闭",icon: function(){
        return 'context-menu-icon context-menu-icon-quit';
      },disabled: function(){
      	if($(this).find(".layui-tab-close").is(":visible")){
      		return false;
      	}
      	return true; 
      }},
      "closeOther": {name: "关闭其他",icon: function(){
        return 'context-menu-icon context-menu-icon-quit';
      }},
      "closeAll": {name: "关闭全部",icon: function(){
        return 'context-menu-icon context-menu-icon-quit';
      }}
    }
	});
	//待办按钮
    $('.message-title').on('click', function() {
        $('#fsTabMenu li').eq(0).click();
    })
	window.addEventListener("message", receiveMessage, false);
	function receiveMessage(event){
	  if (!event.data )
	    return;
	  if ( !event.data.token || event.data.token!=window.chcToken){
		//alert('登录令牌不匹配：' + event.data.token);
		return;
	  }
	  if ('openPage'===event.data.action){
		window.chcitApp.openPage(event.data.title,event.data.url,event.data.params);  
	  }
	  
	} 
	if (window.attachEvent) {
		  window.attachEvent("hashchange", hashChanged);
	} else if (window.addEventListener) {
		window.addEventListener("hashchange", hashChanged, false);
	}
	
	$(window).on('resize',function(){
		fsTopMenuDivWidth();//页面变化时自适应上面的导航宽度
		$('.layui-body').css('height',$(window).innerHeight()-60+'px');
	})
	
    $('#editpassword').on('click', function() {
    	editpassword();
    })
    $('#logout').on('click', function() {
    	logout();
    })
	
	var initData = function(){
		document.title=top.chcAppConfig.title;
		//var indexLogo = top.chcAppConfig.indexLogo;
		//if (indexLogo && indexLogo.indexOf('system/')==0) //兼容老版本配置
			//indexLogo = indexLogo.substr('system/'.length);
		//$('#logo').attr('src',indexLogo);
		$('#logo').html(top.chcAppConfig.title);
	 	$('#userRealName').html(top.chcAppConfig.userRealName?top.chcAppConfig.userRealName:top.chcAppConfig.username);		
	 	$('#copyright').html(top.chcAppConfig.copyright);		
		fsMenu.render();
		loadMessage()
		changeTopMenu();
		Login.read(top.chcAppConfig.username);
	 	Login.read(top.chcAppConfig.username+"css");
		//初始化动作
		showMenu($("#fsTopMenu .layui-this").attr("dataPid"));
		showMenu($("#fsTopMenu2 .layui-this").attr("dataPid"));
		$('.layui-body').css('height',$(window).innerHeight()-60+'px');
		fsTopMenuDivWidth();

		hashChanged();
		//渲染tab
		fsTab.render();
	    
		//加载首页
		$('#appIFrame').attr('src','pages/home/index.html');

	 	//检查密码强度和是否超期
		if("Y"==top.chcAppConfig.isResetPassword){
	 		editpasswordForce();
	 	}
		
	}
	//获取用户当前配置
	App.submit({
		 url : App.getContextPath()+'userBaseHandleAction/getCurrentUser.do',
		 succeed:function(result){
		       if(result && result.data){
		         top.chcAppConfig = result.data;
		         top.chcToken = result.data.chcToken;
		         $('.orgname').html(result.data.orgName);
		 		//加载可切换机构列表
			 	$(result.data.orgs).each(function(i,v){
			 		$('.org .layui-nav-child').append('<dd><a href="javascript:;"  data-id='+v.id+'><span class="fa fa-cube"></span>'+v.name+'</a></dd>');
			 	})
			 	
			 	$('.org .layui-nav-child dd>a').on('click',function(){
			 		var id=$(this).attr('data-id'),params;
			 		var name=$(this).text();
			 		App.submit({
						url : App.getContextPath()+'userBaseHandleAction/putCurrentOrg.do',
						data:{
							"orgId":id
						},
						async: false,
						succeed:function(result){
							if(result.success==true){
								window.location.reload();
							}
						}
					});
			 	})			         
		       }
		       //执行界面初始化
		       initData();
		       
		       //初始化AI智能助手
		       if(typeof initAIChat === 'function') {
		           initAIChat();
		       }
		 }
	});
});
