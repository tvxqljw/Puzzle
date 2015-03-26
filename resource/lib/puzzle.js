/**
 * Created by lijingwen on 2015-03-02.
 */

/***
 * logo loading
 * @param url 图片路径
 */
function loadlogo(url){
    var link = document.createElement("link");
    link.type = "image/x-icon";
    link.rel  = "shortcut icon";
    link.href  = url;
    var head = document.getElementsByTagName("head")[0];
    head.appendChild(link);
    console.log('fimageHandleshed logo');
}


/***
 * Puzzle main function
 * @param url
 * @returns {Puzzle}
 * @constructor
 */
function Puzzle(path,imgsize){
    //img obj
	var puzzleObj = this;

	puzzleObj.url = path;//img path
	puzzleObj.size = imgsize;//img size


    //default
    puzzleObj.rc_num = 3;//row and col num
    puzzleObj.blank_num = 4;// default image index blank
    puzzleObj.move_speed = 50;// move speed
    puzzleObj.click_num = 0;


    /**
     * 图片加载
     */
	// image handle
	puzzleObj.imageHandle = function(){

		// create imgae
//		var img = new Image();
//		img.src = puzzleObj.url;
        puzzleObj.CreatePuzzle()
	};


    /***
     * CreatePuzzle
     * 创建拼图坐标和位置
     */
	// Create puzzle
	puzzleObj.CreatePuzzle = function(){
        //box size
		puzzleObj.box_wh = puzzleObj.size/puzzleObj.rc_num;

		// every blocks attribute : x y
		puzzleObj.attr = new Array();
        var total_box = puzzleObj.rc_num*puzzleObj.rc_num;
		for(var i=0,k=0;i<total_box;i++){

			if(i>0 && i%puzzleObj.rc_num==0) k++;

			puzzleObj.attr.push({
				'x':i%puzzleObj.rc_num * puzzleObj.box_wh,
				'y':k*puzzleObj.box_wh
			});

			console.log('x:'+puzzleObj.attr[i].x+',y:'+puzzleObj.attr[i].y);
		}

		// random
		puzzleObj.ranArr = puzzleObj.rd(puzzleObj.attr);
        console.log('ran:'+puzzleObj.ranArr);


        //puzzle-area
        var html = '';
			var wh = puzzleObj.size+8;
			html += '<div class="puzzle-area" style="width:'+wh+'px;height:'+wh+'px;">';

        //puzzle-every-blocks
			for(var i=0,k=0;i<puzzleObj.rc_num*puzzleObj.rc_num;i++){
				if(i == puzzleObj.blank_num){
					var background = '';
					var pos = {'x':puzzleObj.box_wh,'y':puzzleObj.box_wh};
					var is_class = 'blank';
					var is_cursor = '';
					var z_index = 0;
				}else{
					var background = 'background:url('+puzzleObj.url+') -'+puzzleObj.attr[i].x+'px -'+puzzleObj.attr[i].y+'px;';
					var index = puzzleObj.random(0,puzzleObj.ranArr.length-1);
					var pos = puzzleObj.ranArr[index];
					puzzleObj.ranArr.splice(index,1);
					var is_class = 'box san';
					var is_cursor = 'cursor:pointer;';
					var z_index = 999;
				}

				html += '<div x='+puzzleObj.attr[i].x+' y='+puzzleObj.attr[i].y+' class="'+is_class+'" style="position:absolute;border:1px solid #eee; width:'+puzzleObj.box_wh+'px;height:'+puzzleObj.box_wh+'px;margin-top:-1px;margin-left:-1px;'+background+'left:'+puzzleObj.box_wh+'px;top:'+puzzleObj.box_wh+'px;'+is_cursor+'z-index:'+z_index+';" ranx='+pos.x+' rany='+pos.y+'></div>';
			}

			html += '</div>';

        html += '<div>';

		$('#puzzle').html(html);

        var origin ='';
        var orginwh=puzzleObj.size+8;
        origin += '<div class="origin" style="width:'+orginwh+'px;height:'+orginwh+'px;background:url('+puzzleObj.url+') 0 0 no-repeat;">';
        origin += '</div>';

        $('#puzzle-origin').html(origin);

		puzzleObj.san();
        puzzleObj.create_click();
	};

	puzzleObj.san = function(){
		var obj = $('#puzzle'+'>div.puzzle-area:eq(0)>div.san:eq(0)');

		obj.animate(
			{ 'left':Number(obj.attr('ranx')),'top':Number(obj.attr('rany')) },
            //animation
			puzzleObj.move_speed*1,
			false,
			function(){
				$(this).removeClass('san').removeAttr('ranx').removeAttr('rany');
				if($('#puzzle'+'>div.puzzle-area:eq(0)>div.san').length>=1){
					puzzleObj.san();
				}else{
					// clicks event!
					puzzleObj.create_click();
				}
			}
		);
	};

    // clicks event!
	puzzleObj.create_click = function(){
		$('#puzzle'+'>div.puzzle-area:eq(0)>div.box').each(function(){

			$(this).get(0).onclick = function(obj){
				return function(){
					if(obj.click_lock) return;

					obj.click_lock = true;

					var divpuzzleObj = $(this);
					var blank_obj = $('#puzzle'+'>div.puzzle-area:eq(0)>div.blank');
					var div_pos = obj.GetCoord(divpuzzleObj);
					var blank_pos = obj.GetCoord(blank_obj);

					//move available
					if(div_pos.x==blank_pos.x && Math.abs(div_pos.y-blank_pos.y)==obj.box_wh){
						blank_obj.css('top',div_pos.y);
						divpuzzleObj.animate({'top':blank_pos.y},obj.move_speed,false,function(){
							// check
							obj.check_ok();
						});
					}else if(div_pos.y==blank_pos.y && Math.abs(div_pos.x-blank_pos.x)==obj.box_wh){

						blank_obj.css('left',div_pos.x);
						divpuzzleObj.animate({'left':blank_pos.x},obj.move_speed,false,function(){
							obj.check_ok();
						});
					}else{
						puzzleObj.click_lock = false;
						return false;
					}
				};
			}(puzzleObj);
		});

		puzzleObj.click_lock = false;
	};

	//Check
	puzzleObj.check_ok = function(){
		var is_pinhao = true;
        //match every coord
		$('#puzzle'+'>div.puzzle-area:eq(0)>div').each(function(){
			var dq_pos = puzzleObj.GetCoord($(this));//left(x) and top(y)
			if( $(this).attr('x')!=dq_pos.x || $(this).attr('y')!=dq_pos.y ){
				is_pinhao = false;
			}
		});

		if(is_pinhao){
            var count =$('.click_num').text();
			alert('Congratulations！ You have used '+count+' steps to fimageHandlesh this puzzle!');
		}else{
            puzzleObj.click_num ++;
            $('.click_num').html(puzzleObj.click_num);
            puzzleObj.click_lock = false;
		}
	};

	// get x y attribute
	puzzleObj.GetCoord = function(obj){
		return {'x':parseInt(obj.css('left')),'y':parseInt(obj.css('top'))};
	};

	// random 1~8
	puzzleObj.random = function(n,m){
		var c = m-n+1;
        //random from 8 to 1
		return Math.floor(Math.random() * c + n);
	};

    //
	puzzleObj.rd = function(arr){
		var tmp = [];

		for(var i=0;i<arr.length;i++){
			if(i!==Math.floor(puzzleObj.rc_num*puzzleObj.rc_num/2)){
			//the one in the middle is empty
				tmp.push(arr[i]);
			}
		}
		return tmp;
	};

    //start
	puzzleObj.imageHandle();
	return puzzleObj;
}

