/**
 * Created by lijingwen on 2015-03-02.
 */

//alldata
var userdata = {
    'username': '',
    'device': '',
    'ctime':'' ,
    'level': {
        '01': {
            'step': 0,
            'pass': true
        },
        '02': {
            'step': 0,
            'pass': false
        },
        '03': {
            'step': 0,
            'pass': false
        },
        '04': {
            'step': 0,
            'pass': false
        }
    }
};

var username, g_imgId;

/***
 * OnLoad
 *
 */
$(function () {
    //ico
    loadlogo("resource/img/logo.ico");

    //process
    $({property: 0}).animate(
        {property: 100}, {
            duration: 3000,
            step: function () {
                var percentage = Math.round(this.property);
                $('#process').css('width', percentage + "%");
                $('.process_num').html(percentage + '%');
                if (percentage == 100) {
                    $("#process").addClass("done");//done，hide the process bar
                    $(".process_num").addClass("done");
                    $('#Open').css('display', 'block');

                }
            }
        });

    //button event
    $('#startgameButton').bind('click', function () {
        //verify
        username = $('#username').val().trim();
        var username_input = $('.open_input_box'), alarm_text = $('#alarm span');
        if (username == '' || username == null || username == 'undefined') {
            //username is empty
            alarm_text.text('Username is necessary!');
            username_input.addClass('alarm');
            username_input.focus();
        } else {
            $('.username').html('hi, ' + username);
            userdata.username = username;
            $('#Open').css('display', 'none');
            $('#Level').css('display', 'block');
            loadLevel(userdata);
        }

    });

    //level image click
    $('.level_img').live('click', function () {
        $('#Level').css('display', 'none');
        $('#Game').css('display', 'block');

        var imgId = $(this).attr('id'),
            deviceType = '',
            size = 300,
            imgSrc = '';
        //resolution
        if (document.body.clientWidth <= 768) {
            deviceType = 'phone';
            size = 300;
        }
        else if (document.body.clientWidth >= 992 && document.body.clientWidth < 1200) {
            deviceType = 'pad';
            size = 360;
        }
        else {
            deviceType = 'PC';
            size = 420;
        }
        userdata.device = deviceType;
        console.log(userdata.device);
        imgSrc = 'resource/img/' + imgId + '-' + deviceType + '.jpg';
        console.log(imgSrc);

        g_imgId = imgId;

        Puzzle(imgSrc, size, deviceType);
    });

    $('.backLevel').bind('click', function () {
        backLevel();
    });

    $('.username').bind('click', function () {
        submit();
    });
});

/***
 * logo loading
 * @param url 图片路径
 */
function loadlogo(url) {
    var link = document.createElement("link");
    link.type = "image/x-icon";
    link.rel = "shortcut icon";
    link.href = url;
    var head = document.getElementsByTagName("head")[0];
    head.appendChild(link);
    console.log('fimageHandleshed logo');
}


/***
 * loadLevel
 * @param username 图片路径
 */
function loadLevel(userdata) {

    loadLevel_success(userdata);
    //load_data('/LoadLevel',{'username':username},loadLevel_success,loadLevel_fail);

    function loadLevel_success(data) {
        var userdata = data;
        var html = '', imgId = '', pass = false, imgSrc;
        for (var i in userdata.level) {
            imgId = i;
            pass = userdata.level[i].pass;
            imgSrc = 'resource/img/' + imgId + '-phone.jpg';
            html += '<div class="col-lg-3 col-md-4 col-sm-12 level_img_box">' +
                '<div class="level_img" id="' + imgId + '">' +
                '<img src="' + imgSrc + '"/>';
            if (pass) {
                html += '<div class="mask"></div>';
            } else {
                html += '<div class="mask" style="display: none"></div>';
            }
            html += '</div>' +
                '</div>';
        }

        $('#level_row').html(html);
    }

    function loadLevel_fail() {
        alert('fail');
    }
}


/***
 * Puzzle main function
 * @param url
 * @returns {Puzzle}
 * @constructor
 */
function Puzzle(path, imgsize, device) {

    var puzzleObj = function (el) {
        this.url = path;//img path
        this.size = imgsize;//img size

        //default
        this.rc_num = 3;//row and col num
        this.blank_num = 4;// default image index blank
        this.move_speed = 50;// move speed
        this.click_num = 0;//step count
    };

    puzzleObj.prototype = {
        init: function () {
            var me = this;

            me.CreatePuzzle();
            return me;
        },

        /***
         * CreatePuzzle
         * 创建拼图坐标和位置
         */
        CreatePuzzle: function () {
            var me = this;

            //box size
            me.box_wh = me.size / me.rc_num;

            // every blocks attribute : x y
            me.attr = new Array();
            var total_box = me.rc_num * me.rc_num;
            for (var i = 0, k = 0; i < total_box; i++) {

                if (i > 0 && i % me.rc_num == 0) k++;

                me.attr.push({
                    'x': i % me.rc_num * me.box_wh,
                    'y': k * me.box_wh
                });

                console.log('x:' + me.attr[i].x + ',y:' + me.attr[i].y);
            }

            // random
            me.ranArr = me.rd(me.attr);
            console.log('ran:' + me.ranArr);


            //puzzle-area
            var html = '';
            var wh = me.size + 8;
            html += '<div class="puzzle-area" style="width:' + wh + 'px;height:' + wh + 'px;">';

            //puzzle-every-blocks
            var background, pos, _class, _cursor, z_index, index;
            for (var i = 0, k = 0; i < me.rc_num * me.rc_num; i++) {//the blank box
                if (i == me.blank_num) {
                    background = '';
                    pos = {'x': me.box_wh, 'y': me.box_wh};
                    _class = 'blank';
                    _cursor = '';
                    z_index = 0;
                } else {
                    //other boxes
                    background = 'background:url(' + me.url + ') -' + me.attr[i].x + 'px -' + me.attr[i].y + 'px;';
                    index = me.random(0, me.ranArr.length - 1);//catch one coord
                    pos = me.ranArr[index];//coord
                    me.ranArr.splice(index, 1);//delete one
                    _class = 'box';
                    _cursor = 'cursor:pointer;';
                    z_index = 999;
                }

                html += '<div x=' + me.attr[i].x + ' y=' + me.attr[i].y + ' class="' + _class + '" style="position:absolute;border:1px solid #eee; width:' + me.box_wh + 'px;height:' + me.box_wh + 'px;margin-top:-1px;margin-left:-1px;' + background + 'left:' + pos.x + 'px;top:' + pos.y + 'px;' + _cursor + 'z-index:' + z_index + ';" ranx=' + pos.x + ' rany=' + pos.y + '></div>';
            }

            html += '</div>';

            html += '<div>';

            $('#puzzle').html(html);

            //origin image
            var origin = '';
            var orginwh = me.size + 8;
            origin += '<div class="origin" ' +
                'style="width:' + orginwh + 'px;' +
                'height:' + orginwh + 'px;' +
                'background:url(' + me.url + ') 0 0 no-repeat;' +
                'background-size:cover;">';
            origin += '</div>';

            $('#puzzle-origin').html(origin);


            //devide
            //me.san();
            me.create_click();
        },

        san: function () {
            var me = this;

            var obj = $('#puzzle' + '>div.puzzle-area:eq(0)>div.san:eq(0)');
            obj.animate(
                { 'left': Number(obj.attr('ranx')), 'top': Number(obj.attr('rany')) },
                //animation
                    me.move_speed * 0,
                false,
                function () {
                    $(this).removeClass('san').removeAttr('ranx').removeAttr('rany');
                    if ($('#puzzle' + '>div.puzzle-area:eq(0)>div.san').length >= 1) {
                        me.san();
                    } else {
                        // clicks event!
                        me.create_click();
                    }
                }
            );
        },

        create_click: function () {
            var me = this;

            $('#puzzle' + '>div.puzzle-area:eq(0)>div.box').each(function () {

                $(this).get(0).onclick = function (obj) {
                    return function () {
                        if (obj.click_lock) return;

                        obj.click_lock = true;

                        var divpuzzleObj = $(this);
                        var blank_obj = $('#puzzle' + '>div.puzzle-area:eq(0)>div.blank');
                        var div_pos = obj.GetCoord(divpuzzleObj);
                        var blank_pos = obj.GetCoord(blank_obj);

                        //move available
                        if (div_pos.x == blank_pos.x && Math.abs(div_pos.y - blank_pos.y) == obj.box_wh) {
                            blank_obj.css('top', div_pos.y);
                            divpuzzleObj.animate({'top': blank_pos.y}, obj.move_speed, false, function () {
                                // check
                                obj.check_ok();
                            });
                        } else if (div_pos.y == blank_pos.y && Math.abs(div_pos.x - blank_pos.x) == obj.box_wh) {

                            blank_obj.css('left', div_pos.x);
                            divpuzzleObj.animate({'left': blank_pos.x}, obj.move_speed, false, function () {
                                obj.check_ok();
                            });
                        } else {
                            me.click_lock = false;
                            return false;
                        }
                    };
                }(me);
            });

            me.click_lock = false;
        },

        check_ok: function () {
            var me = this;
            var ok = true;
            //match every coord
            $('#puzzle' + '>div.puzzle-area:eq(0)>div').each(function () {
                var dq_pos = me.GetCoord($(this));//left(x) and top(y)
                if ($(this).attr('x') != dq_pos.x || $(this).attr('y') != dq_pos.y) {
                    ok = false;
                }
            });

            if (ok) {
                var count = $('.click_num').text();
                alert('Congratulations！ You have used ' + count + ' steps to fimageHandlesh this puzzle!');
                submit();
                userdata.level[g_imgId].pass = true;
                userdata.level[g_imgId].step = count;
                backLevel();

            } else {
                me.click_num++;
                $('.click_num').html(me.click_num);
                me.click_lock = false;
            }
        },

        GetCoord: function (obj) {
            return {'x': parseInt(obj.css('left')), 'y': parseInt(obj.css('top'))};
        },

        random: function (n, m) {
            var c = m - n + 1;
            //random from 8 to 1
            return Math.floor(Math.random() * c + n);
        },

        rd: function (arr) {
            var me = this;

            var tmp = [];

            for (var i = 0; i < arr.length; i++) {
                if (i !== Math.floor(4)) {
                    //the one in the middle is empty
                    tmp.push(arr[i]);
                }
            }
            for (var i in tmp) {
                console.log(tmp[i])
            }
            return tmp;
        }
    };


    var puzzle = new puzzleObj(this);
    puzzle.init();
}


function backLevel() {
    $('#Game').css('display', 'none');
    $('#Level').css('display', 'block');
    loadLevel(userdata);
}

/***
 * Puzzle main function
 * @param url
 * @returns {Puzzle}
 * @constructor
 */
function load_data(path, query, success_callback, fail_callback) {

//            $("#loading").fadeIn();
    $.ajax({
        url: 'http://42.96.157.54:12222' + path,
        data: query,
        type: 'GET',
        dataType: "jsonp",
        traditional: true,
        jsonp: "callback",
        jsonpCallback: "jsonpcallback",
        success: function (data) {
            success_callback(data);
//                    $("#loading").fadeOut();
        },
        error: function (e) {
            fail_callback(e);
        }
    });
}

function submit() {
    // insert
    var timestamp = Date.parse(new Date());
    userdata.ctime = Number(String(timestamp).substring(0, 10));
    var strData = JSON.stringify(userdata);
    console.log(strData);
    load_data('/InsertAll', {'strData': strData}, su, fa);
    function su(data) {
        console.log(data);
    }

    function fa() {
        console.log('fail');
    }

    // end insert
}