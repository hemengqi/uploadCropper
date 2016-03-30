/* 依赖jquery, jquery.Jcrop.js ,ajaxfileupload.js*/
(function($){
	var crop = function(obj,args){
		var $upload = $(obj),//所有上传容器
			$_upload,
			$uploadBtn = '.'+args.uploadBtn,//上传触发按钮
			$cropped = '.'+args.imgCrop,//裁剪成功图片显示容器
			$error = '.'+args.errorBox,//错误信息显示容器
			$uploadUrl = args.uploadUrl,//异步上传控制器
			$emptyTip = args.emptyTip,//未选择图片时显示信息
			$cropBox = $("#"+args.cropBox),//裁剪图片操作容器
			$cropImg = $("#"+args.cropImg),//待裁剪图片容器
			$previewBox = $('#'+args.cropPreviewBox),//裁剪图片容器
			$preview = $('#'+args.cropPreview),//裁剪图片容器
			$previewImg = $('#'+args.cropPreviewImg),//裁剪预览图片
			$cropBtn = $("#"+args.cropBtn),//裁剪事件触发按钮
			$tipBox = $('#'+args.tipBox),//裁剪错误显示容器
			$cropUrl = args.cropUrl,//裁剪图片控制器
			$image = new Object(),//创建图片对象存储图片信息
			$ratio = args.ratio,//裁剪长宽比例
			$maxSize = args.maxSize,//限定最大长寸
			$boxWidth = args.boxWidth,//裁剪容器宽度
			$debug = args.debug,//调试模式，默认为关

			jcrop_api;//裁剪api全局变量
		
		var cropper = {
			//初始化
			init:function(){
				if($debug) console.log('init');			
				this.initJcrop();
				this.bindEvent();
				this.btnStatus(false);
				$cropBox.modal({
					backdrop: 'static',
					show: false,
				})
			},
			//裁剪图片初始化
			initJcrop: function(){
				//具体API查看Jcrop官网
				$cropImg.Jcrop({
			      	aspectRatio: $ratio,
			      	maxSize: $maxSize,
			      	boxWidth: $boxWidth,
			      	onChange: this.updateCoords,//选择回调函数
			      	onSelect: this.updateCoords,//选择回调函数
			      	onRelease: this.clearCoords,//释放回调函数
			    },function(){
			    	jcrop_api = this;

			    });	
			},
			//填充裁剪图片数据
			updateCoords: function(c){
				cropper.btnStatus(true);
				$image['x'] = c.x;//裁剪左上角左边距
			    $image['y'] = c.y;//裁剪左上角上边距
			    $image['w'] = c.w;//裁剪宽度
			    $image['h'] = c.h;//裁剪高度
			    //返回计算
			    var s = cropper.currentSize(c.w,c.h),
			    	xsize = s[0],
			    	ysize = s[1];
			    $image['tarW'] = xsize;
				$image['tarH'] = ysize;
				//更新裁剪图片信息
			    if($('#cropInfo')){
				    $('#cropX').val(parseInt(c.x));
				    $('#cropY').val(parseInt(c.y));
				    $('#cropW').val(parseInt(c.w));
				    $('#cropH').val(parseInt(c.h));
				    $('#cutW').val(parseInt(xsize));
				    $('#cutH').val(parseInt(ysize));
				}
				//更新预览图片
				if(parseInt(c.w)>0){
					var pw = $previewBox.width(),
						ph = pw*ysize/xsize,
						rx = pw/c.w,
						ry = ph/c.h;
					if(ph<=pw){
						$preview.css({
							width: pw,
							height: Math.round(ph) + 'px',
						});
					}else{
						$preview.css({
							width: Math.round(pw*xsize/ysize) + 'px',
							height: pw,
						});
					}
					
					$previewImg.css({
						width: Math.round(rx * $image['o_width']) + 'px',
			          	height: Math.round(ry * $image['o_height']) + 'px',
			          	marginLeft: '-' + Math.round(rx * c.x) + 'px',
			          	marginTop: '-' + Math.round(ry * c.y) + 'px'
					})
				}
				
			},
			//清空裁剪数据
			clearCoords:function(){
				cropper.btnStatus(false);
				$image['x'] = $image['y'] = $image['w'] = $image['h'] = '';
				$('#cropInfo input').val('');
				$preview.removeAttr("style");
				$previewImg.removeAttr("style"); 
				if($image['o_width']>$boxWidth){
					$previewImg.css({'width':$boxWidth});
				};
			},
			//计算不超过最大尺寸的实际裁剪尺寸
			currentSize: function(cut_w,cut_h){
				var r = cut_w / cut_h,
					w = args.tarSize[0],
					h = args.tarSize[1];
				return w/r<=h ? [w,w/r] : [h*r,h];
			},
			//显示裁剪容器
			showCrop: function(src){
				this.clearCoords();
				var nSrc = '/uploadCroper/'+src;
				jcrop_api.setImage(nSrc);
				$previewImg.prop('src',nSrc)
				$cropBox.modal('show');
			},
			//隐藏裁剪容器
			hideCrop: function(src){
				$cropBox.modal('hide');
				//显示裁剪图片
				$_upload.find($cropped).prop('src','/uploadCroper/'+src);
			},
			btnStatus: function(state){
				if(state){
					$cropBtn.prop('disabled',false).html('确定裁剪');
				}else{
					$cropBtn.prop('disabled',true).html('请裁剪');
				}
			},
			//验证是否裁剪成功
			checkCoords: function(){
				if ($image['src']&&$image['w']) return true;
			    $tipBox.html($emptyTip).addClass('in'); 
			    return false;
			},
			//显示错误
			showError: function(text){
				console.log('error');
				$errorBox = $_upload.find($error);
				if($errorBox){
					$errorBox.html(text);
				}else{
					console.log(text);
				}
			},
			//清除错误
			clearError: function(){
				$errorBox = $_upload.find($error);
				if($errorBox){
					$errorBox.html('');
				}
			},
			//异步上传文件到服务器
			ajaxFileUpload: function(id){
				$.ajaxFileUpload({
		            url: $uploadUrl, //用于文件上传的服务器端请求地址
		            secureuri: false, //是否启用安全提交，一般设置为false
		            fileElementId: id, //文件上传input的id属性
		            dataType: 'json', 
		            success: function (data, status)  //服务器成功响应处理函数
		            {
		            	if($debug){
					    	console.log('异步上传返回data');
					    	console.log(data);
					    }
		            	if(data.success){
							data = data['files'][0];
						   	var picPath = data['path'];//获取服务器图片路径
						   	$image['o_width'] = data['width'];//图片原宽度
						   	$image['o_height'] = data['height'];//图片原高度
						   	if(picPath){
							   	$image['src'] = picPath;
							   	//裁剪上传图片
							   	cropper.showCrop(picPath);
						   	}
						}else{
							cropper.showError('<div class="alert alert-warning">请上传格式为jpg的图片</div>');
						}
		            },
		            error: function (data, status, e)//服务器响应失败处理函数
		            {
		                cropper.showError(data.responseText);
		            },
				});
				return false;
			},
			//绑定事件
			bindEvent:function(){
				return(function(){
					//监听文件上传
					$upload.each(function(){
						$(this).on('change',$uploadBtn,function(){
							$_upload = $(this).parents('.uploadBox');
							if($debug) {
								console.log('点击父元素对象')
								console.log($_upload);
								console.log('点击按钮id，必须'+$(this).attr('id'));
							}
							//异步上传文件到服务器
							cropper.clearError();
							cropper.ajaxFileUpload($(this).attr('id'));
						}).on('click',$cropped,function(){//点击已裁剪图片
					    	$_upload = $(this).parents('.uploadBox');
					    	var src = $(this).attr('src');
					    	$image['o_width'] = $(this).width();
					    	$image['o_height'] = $(this).height();
					    	if(src){
						    	//处理获取的url
						    	srcA  = src.split('/');
						    	if($debug) {
						    		console.log('处理获取的图片url');
						    		console.log(srcA);
						    	}
						    	$image['src'] = srcA[2]+'/'+srcA[3];
						    	cropper.showCrop($image['src']);
					    	}
					    });
					});
				    //提交裁剪数据到服务器
					$cropBox.on('click',"#"+args.cropBtn,function(){
				    	if($debug) {
				    		console.log('裁剪数据');
				    		console.log($image);
				    	}
				    	if(!$cropBtn.attr('disabled')){
				    		$.ajax({
				    			url: $cropUrl,
				    			data: $image,
				    			type:'post',
				       			dataType:'json',
				    			success: function(data){
				    				if($debug) {
				    					console.log('裁剪返回data');
				    					console.log(data);
				    				}
				    				cropper.hideCrop(data.src);
				    			},
				    			error: function(data){
				    				cropper.showError(data.responseText)
				    			}
				    		})
				    	}
				    });
				    //裁剪操作
				    if($('#cropAction')){
					    $('#cropAction').on('click','.boxRatio',function(){
					    	//修改选框比例
					    	if($('.boxRatio')){
						    	var ratio = $(this).data('ratio');
						    	$('#customR').val('');
						    	if(ratio == '0'){
						    		ratio = 0
						    	}else{
						    		ratio = ratio.split('/');
						    		ratio = parseInt(ratio[0])/parseInt(ratio[1]);
						    	}
						    	console.log(ratio);
						    	jcrop_api.setOptions({
						    		aspectRatio: ratio,
						    		maxSize: args.maxSize,
						    	});
						    	jcrop_api.focus();
					    	}
					    }).on('click','#customR-btn',function(){
					    	//自定义宽高比
					    	var c_r = $('#customR').val();
					    	if(c_r){
						    	jcrop_api.setOptions({
						    		aspectRatio: c_r,
						    		maxSize: args.maxSize,
						    	});
					    	}
					    }).on('click','#customW-btn',function(){
					    	//固定图片宽度
					    	var c_w = $('#customW').val();
					    	if(c_w){
						    	jcrop_api.setOptions({
						    		aspectRatio: c_r,
						    		maxSize: args.maxSize,
						    	});
					    	}
					    });
				    }
				})();
			}
		};
		cropper.init();
	};
	$.fn.uploadCroper = function(origin_o){
		var options = $.extend({
			'uploadBtn': 'uploadedfile',//上传触发按钮class
			'uploadUrl': 'Image.php',//上传图片控制器
			'imgCrop': 'imgCrop',//裁剪成功图片显示容器class
			'errorBox': 'errorBox',//错误信息显示容器class
			'emptyTip': '请裁剪图片',//未选择图片时显示错误信息
			'cropImg': 'cropImg',//裁剪图片显示容器id
			'cropBox': 'cropBox',//裁剪图片操作容器id
			'cropPreviewBox': 'previewBox',//裁剪预览图片容器id
			'cropPreview': 'preview',//裁剪预览图片容器id
			'cropPreviewImg': 'previewImg',//裁剪预览图片id
			'cropBtn': 'cropBtn',//裁剪事件触发按钮id
			'tipBox': 'tipBox',//裁剪信息错误显示容器id
			'cropUrl': 'Crop.php',//裁剪图片控制器
			'ratio': 0,//裁剪长宽比例
			'tarSize': [150,150],//目标图片宽度，高度最大尺寸
			'maxSize': [0,0],//裁剪框最大尺寸
			'boxWidth': 650,//裁剪容器宽度
			'debug': false,//调试模式
		},origin_o);
		crop(this,options);
	}
})(jQuery)