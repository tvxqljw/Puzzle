/**
 * Created by lijingwen on 2015-03-02.
 */

/***
 * 图标加载
 * @param url 图片路径
 */
function loadlogo(url){
    var link = document.createElement("link");
    link.type = "image/x-icon";
    link.rel  = "shortcut icon";
    link.href  = url;
    var head = document.getElementsByTagName("head")[0];
    head.appendChild(link);
    console.log('finished logo');
}

function Puzzle(url){

    //图片对象
	var _this = this;
	_this.url = url;
	_this.error = false;
	_this.error_msg = '';
	_this.qukuai_wh = 320;
	_this.row_col = 3;
	_this.box_border_width = 1;
	_this.qu_margin = 10;
	_this.qu_info_height = 50;
	_this.box_blank_num = 2;
	_this.click_lock = true;
	_this.click_num = 0;
	_this.move_speed = 100;

	// 初始化
	_this.ini = function(){

		// 创建图片对象
		var img = new Image();
		img.src = _this.url;

		// 错误处理机制
        //文件不存在 or 大小过小
		img.onerror = function(){
			_this.error = true;
			_this.error_msg = _this.url+'文件加载错误';
			_this.check_error();
			return false;
		};

		// 加载图片结束后执行
		img.onload = function(obj){
			return function(){
				// 判断图片大小	
				if(img.width<obj.qukuai_wh || img.height<obj.qukuai_wh){
					_this.error = true;	
					_this.error_msg = '图片太小';
					_this.check_error();
					return false;
				}else{
                    //图片ok就开始构建
					obj.CreatePuzzle();	
				}
			};
		}(_this);
	
	};

	// 绑定参数
	_this.bind = function(){
		return false;		
	};

	// 构建处理
	_this.CreatePuzzle = function(){

		// 初始化变量	
		_this.box_wh = _this.qukuai_wh/_this.row_col;


		// 算出分图坐标写入数组
		_this.zqArr = new Array();
		for(var i=0,k=0;i<_this.row_col*_this.row_col;i++){

			if(i>0 && i%_this.row_col==0) k++;

			_this.zqArr.push({
				'x':i%_this.row_col * _this.box_wh,
				'y':k*_this.box_wh
			});

			console.log('x:'+_this.zqArr[i].x+',y:'+_this.zqArr[i].y);
		}
	
		// 打乱
		_this.ranArr = _this.rd(_this.zqArr);
        console.log('ran:'+_this.ranArr);

		// 构建
//		var title = '';
//        title += '<div>';
//        title += '计数<span class="click_num">'+_this.click_num+'</span>';
//        title += '<button style="margin:0 50px;" onclick="window.location.reload();">重新开始</button>';
//
//				//html += '<span class="info"></span>';
//        title +='</div>';
//
//        $('#puzzle-title').html(title);

        var html = '';
			var wh = _this.qukuai_wh+8;
			html += '<div class="puzzle-area" style="width:'+wh+'px;height:'+wh+'px;">';

        //拆分图片
			for(var i=0,k=0;i<_this.row_col*_this.row_col;i++){
				if(i == _this.box_blank_num){
					var background = '';
					var pos = {'x':_this.box_wh,'y':_this.box_wh};
					var is_class = 'blank';
					var is_cursor = '';
					var z_index = 0;
				}else{
					var background = 'background:url('+_this.url+') -'+_this.zqArr[i].x+'px -'+_this.zqArr[i].y+'px;';
					var index = _this.random(0,_this.ranArr.length-1);
					var pos = _this.ranArr[index];
					_this.ranArr.splice(index,1);
					var is_class = 'box san';
					var is_cursor = 'cursor:pointer;';
					var z_index = 999;
				}

				html += '<div x='+_this.zqArr[i].x+' y='+_this.zqArr[i].y+' class="'+is_class+'" style="position:absolute;border:1px solid #eee; width:'+_this.box_wh+'px;height:'+_this.box_wh+'px;margin-top:-1px;margin-left:-1px;'+background+'left:'+_this.box_wh+'px;top:'+_this.box_wh+'px;'+is_cursor+'z-index:'+z_index+';" ranx='+pos.x+' rany='+pos.y+'></div>';
			}

			html += '</div>';

        html += '<div>';

		$('#puzzle').html(html);

        var origin ='';
        var orginwh=_this.qukuai_wh+8;
        origin += '<div class="origin" style="width:'+orginwh+'px;height:'+orginwh+'px;background:url('+_this.url+') 0 0 no-repeat;">';
        origin += '</div>';

        $('#puzzle-origin').html(origin);

		_this.san();
        _this.create_click();
	};

	_this.san = function(){
		//alert($('#'+_this.quyu_id+'>div.puzzle-area:eq(0)>div.san').length);
		var obj = $('#puzzle'+'>div.puzzle-area:eq(0)>div.san:eq(0)');

		obj.animate(
			{ 'left':Number(obj.attr('ranx')),'top':Number(obj.attr('rany')) },
            //开场动画
			_this.move_speed*0,
			false,
			function(){
				$(this).removeClass('san').removeAttr('ranx').removeAttr('rany');
				if($('#puzzle'+'>div.puzzle-area:eq(0)>div.san').length>=1){
					_this.san();
				}else{
					// 创建点击动作
					_this.create_click();
				}
			}
		);
	};

	// 点击动作
	_this.create_click = function(){
		$('#puzzle'+'>div.puzzle-area:eq(0)>div.box').each(function(){
	
			$(this).get(0).onclick = function(obj){
				return function(){
					if(obj.click_lock) return;

					obj.click_lock = true;
					
					var div_this = $(this);
					var blank_obj = $('#puzzle'+'>div.puzzle-area:eq(0)>div.blank');
					var div_pos = obj.GetCoord(div_this);
					var blank_pos = obj.GetCoord(blank_obj);

					

					// 判断可以移动到空白区域
					if(div_pos.x==blank_pos.x && Math.abs(div_pos.y-blank_pos.y)==obj.box_wh){
						blank_obj.css('top',div_pos.y);
						div_this.animate({'top':blank_pos.y},obj.move_speed,false,function(){
							// 判断是否拼好
							obj.check_ok();
						});								
					}else if(div_pos.y==blank_pos.y && Math.abs(div_pos.x-blank_pos.x)==obj.box_wh){
														
						blank_obj.css('left',div_pos.x);
						div_this.animate({'left':blank_pos.x},obj.move_speed,false,function(){
							// 判断是否拼好
							obj.check_ok();
						});						
					}else{
						_this.click_lock = false;
						return false;
					}
				};
			}(_this);
		});	

		_this.click_lock = false;
	};

	// 检测是否拼好
	_this.check_ok = function(){
		var is_pinhao = true;
        //每个坐标对应测试
		$('#puzzle'+'>div.puzzle-area:eq(0)>div').each(function(){
			var dq_pos = _this.GetCoord($(this));
			if( $(this).attr('x')!=dq_pos.x || $(this).attr('y')!=dq_pos.y ){
				is_pinhao = false;	
			}
		});			

		if(is_pinhao){
            var count =$('.click_num').text();
			alert('Congratulations！ You have used '+count+' steps to finish this puzzle!');
		}else{
			_this.click_num++;
			$('.click_num').html(_this.click_num);
			_this.click_lock = false;
		}
	};	

	// 获得节点的x与y
	_this.GetCoord = function(obj){
		return {'x':parseInt(obj.css('left')),'y':parseInt(obj.css('top'))};	
	};

	// 随机取数
	_this.random = function(n,m){
		var c = m-n+1;  
		return Math.floor(Math.random() * c + n);
	};

	// 打乱数组
	_this.rd = function(arr){
		var tmp = [];

		for(var i=0;i<arr.length;i++){
			if(i!==Math.floor(_this.row_col*_this.row_col/2)){
				tmp.push(arr[i]);
			}
		}

//		var randomsort = function(a, b) {
//			return Math.random() > .5 ? -1 : 1;
//		};
//
//		tmp.sort(randomsort);
		return tmp;
	};

	// 错误处理
	_this.check_error = function(){
		if(_this.error){
			alert(_this.error_msg);	
			return false;
		}	

		return true;
	};
	

	// 初始化
	_this.ini();

	return _this;
}