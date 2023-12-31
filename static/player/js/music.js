// 音乐播放插件 
// 只包括播放暂停，下一曲  以及显示歌曲名称 歌手以及 实时进度
// github： https://github.com/IFmiss/music


(function($,window){
            function getQueryVariable(variable) {
             var query = window.location.search.substring(1);
             var vars = query.split("&");
             for (var i=0;i<vars.length;i++) {
                  var pair = vars[i].split("=");
                  if(pair[0] == variable){return pair[1];}
             }
             return(false);
        }
        $.ajax({
                    type: "GET",
                    url: "/login/play_list?id="+getQueryVariable("id"),
                    dataType: "json",
                    success: function (data) {
                            if (data[0].status=='1'){location.href='/login/404'}
                        // 以换行符将字符串拆分成数组，没有\n则可跳过下面这步
                            var lrc_show = document.getElementById("lr")
                            const lrcs = data[0].lrc.split('\r\n');
                            function get_lrc_time(lrc){
                                a=lrc.split("]")[0];
                                b=a.split("[")[1];
                                min=b.split(':')[0]
                                sencend=b.split(':')[1]
                                return Number(min)*60+Number(sencend);
                            }
                            for (let i = 0; i < lrcs.length; i++){
                                  real_lrc=lrcs[i].split(']')[1]
                                  if (real_lrc==''){
                                      lrcs.splice(i,1)
                                      i--;
                                  }
                            }
                        function rgbtohsl(r,g,b){
                                r=r/255;
                                g=g/255;
                                b=b/255;

                                var min=Math.min(r,g,b);
                                var max=Math.max(r,g,b);
                                var l=(min+max)/2;
                                var difference = max-min;
                                var h,s,l;
                                if(max==min){
                                    h=0;
                                    s=0;
                                }else{
                                    s=l>0.5?difference/(2.0-max-min):difference/(max+min);
                                    switch(max){
                                        case r: h=(g-b)/difference+(g < b ? 6 : 0);break;
                                        case g: h=2.0+(b-r)/difference;break;
                                        case b: h=4.0+(r-g)/difference;break;
                                    }
                                    h=Math.round(h*60);
                                }
                                s=Math.round(s*100);//转换成百分比的形式
                                l=Math.round(l*100);
                                return [h,s,l];
                            }
                        function discolor(color){
                            r=color.split(",")[0];
                            g=color.split(",")[1];
                            b=color.split(",")[2];
                            hslcolor=rgbtohsl(Number(r),Number(g),Number(b))
                            or_maincolor_light=hslcolor[2]
                            if (hslcolor[2] >= 80 && 100 >= hslcolor[2]){
                                var light=hslcolor[2]*0.6
                            }else{
                                var light=65
                            }
                            console.log('主色亮度:'+hslcolor[2])
                            return hslcolor[0]+','+hslcolor[1]+'%,'+light+'%';
                        }
                        function resolveAfter2Seconds(imgUrl) {
                        return new Promise((resolve) => {
                            //imgurl 图片路径
                            var img = new Image();
                            // img.src = imgUrl;
                            img.src = imgUrl + '?' + new Date().getTime();
                            img.setAttribute('crossOrigin', '');

                            img.onload = function() {
                              var canvas = document.createElement("canvas");
                              canvas.width = img.width;
                              canvas.height = img.height;

                              var ctx = canvas.getContext("2d");
                              ctx.drawImage(img, 0, 0);

                              var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                              var pixels = imageData.data;

                              var colorCounts = {};
                              var maxCount = 0;
                              var mainColor;

                              for (var i = 0; i < pixels.length; i += 4) {
                                var r = pixels[i];
                                var g = pixels[i + 1];
                                var b = pixels[i + 2];
                                var rgb = r + "," + g + "," + b;

                                if (colorCounts[rgb]) {
                                  colorCounts[rgb]++;
                                } else {
                                  colorCounts[rgb] = 1;
                                }

                                if (colorCounts[rgb] > maxCount) {
                                  maxCount = colorCounts[rgb];
                                  mainColor = rgb;
                                }
                              }
                              mainColor=discolor(mainColor)
                              resolve(mainColor);
                            };
                          });
                        }

                        async function f1(img_url) {
                        let x = await resolveAfter2Seconds(img_url);
                        maincolor=x;
                        if (or_maincolor_light>=50){
                          lrc_show.innerHTML = '<div style="height: 16px;">'
                          for (var i=0 ;i<lrcs.length-1;i++){
                              lrc_show.innerHTML =  lrc_show.innerHTML+`<div class="lrc_div" style="color: hsl(${maincolor});margin:30px 0;margin-left: auto;filter: blur(1.2px);transition: 1s;text-shadow: 0 0 5px hsl(${maincolor});">` + lrcs[i].split(']')[1] + '</div>';
                        }
                        }else{
                              lrc_show.innerHTML = '<div style="height: 16px;">'
                              for (var i=0 ;i<lrcs.length-1;i++){
                                  lrc_show.innerHTML =  lrc_show.innerHTML+`<div class="lrc_div" style="color: hsl(${maincolor});margin:30px 0;margin-left: auto;filter: blur(1.2px);transition: 1s;text-shadow: 0 0 5px hsl(${maincolor});">` + lrcs[i].split(']')[1] + '</div>';
                              }
                        }
                        mainplayer(data,lrcs)
                        }
                        f1(data[0].img_url)//开启异步函数，等待主演色计算完成后显示，防止出bug
                    },
                }
            );

        function mainplayer(mylist,lrcs) {
            move=0
            var light_lrc=document.getElementsByClassName('lrc_div')
            var count=0;
            var lrc_show = document.getElementById("lr")
            var jump_bar = document.getElementById('range')
            jump_bar.style.visibility='visible';
            jump_bar.style.color=`hsl(${maincolor})`
            function get_lrc_time(lrc){
                                a=lrc.split("]")[0];
                                b=a.split("[")[1];
                                min=b.split(':')[0]
                                sencend=b.split(':')[1]
                                return Number(min)*60+Number(sencend);
                            }
            var DW = {};
            //音乐播放
            DW.music = function (options) {
                var musicValue = {
                    width:  document.body.clientWidth*0.6,                        //宽度260
                    height: document.body.clientHeight*0.13,                         //高度56
                    hasBlur: true,                       //是否显示模糊效果
                    blur: 4,                          //模糊的数值
                    left: '50px',                     //音乐的位置 :left
                    right: 'auto',                     //音乐的位置 :right
                    bottom: 'auto',                     //音乐的位置 :bottom
                    top: 'auto',                     //音乐的位置 :top
                    isCenter: true,                       //是否居中显示  translate
                    btnBackground: 'rgba(0,0,0,0.2)',          //按钮背景色
                    iconColor: 'rgba(250,250,250.0.2)',    //图标背景色
                    hasSelect: true,                       //是否可选择音乐类型
                    hasAjax: false,                       //是否是ajax请求数据
                    selectClassName: 'select-type',              //选择类型按钮的className名称
                    musicType: ['纯音乐', '华语', '欧美', '霉霉', '电音', '韩国', '爱乐之城', '网络歌曲'],         //音乐的类型  （需要随机显示）这是结合我自己后台数据库使用的 如果不是用ajax请求是不会显示这个类型的;
                    source: mylist,

                    //进度信息
                    durationBg: 'rgba(255,255,255,0)',

                    // 线性渐变的颜色
                    progressBg: [{
                        position: 0,         //0 是起点, 1为终点   范围为  0 - 1 之间
                        color: '#FB3232',    //起点的颜色
                    }, {
                        position: 1,
                        color: '#FC8F3F',
                    }],
                    //滚动列表正在播放的背景色  //配合长按事件使用
                    // scrollActiveBg:         'rgba(224, 189, 134, 0.298039)',

                    beforeMusicPlay: function () {
                    },                               //音乐加载之前   可以播放之前
                    afterMusicLoading: function () {
                    },                             //音乐加载成功  可播之后
                    musicChanged: function () {
                    },                                  //音乐切换之后，类似切歌
                    getMusicInfo: function () {
                    },                                  //获取所有音乐信息
                }

                var _this = this;
                var opt = $.extend(musicValue, options || {});

                var music_duration = 0;
                var musicLenth = 0;
                var musicData = '';

                //音乐dom初始化
                musicValue._init = function () {
                    if (opt.isCenter) {
                        _this.cpt_music = $('<div class="cpt-dw-music music-div active"></div>').css({
                            width: opt.width,
                            height: opt.height,
                            bottom: opt.bottom,
                            left: '50%',
                            right: opt.right,
                            top: '90%',
                            '-webkit-transform': 'translate3d(50%,-50%,0)',
                            '-moz-transform': 'translate3d(-50%,-50%,0)',
                            'transform': 'translate3d(-50%,-50%,0)',
                            '-webkit-transform': 'translate(-50%,-50%)',
                            '-moz-transform': 'translate(-50%,-50%)',
                            'transform': 'translate(-50%,-50%)',
                        }).appendTo($('body'));
                    } else {
                        _this.cpt_music = $('<div class="cpt-dw-music music-div active"></div>').css({
                            width: '60%',
                            height: '13%',
                            bottom: opt.bottom,
                            left: '50%',
                            right: opt.right,
                            top: '90%',
                            '-webkit-transform': 'translate3d(-50%,-50%,0)',
                            '-moz-transform': 'translate3d(-50%,-50%,0)',
                            'transform': 'translate3d(-50%,-50%,0)',
                            '-webkit-transform': 'translate(-50%,-50%)',
                            '-moz-transform': 'translate(-50%,-50%)',
                            'transform': 'translate(-50%,-50%)',
                        }).appendTo($('body'));

                    }
                    _this.music_play = $('<div class="music-play-div"></div>').appendTo(_this.cpt_music);

                    if (opt.hasSelect && opt.hasAjax) {
                        //选择音乐类型
                        _this.music_typeSelect = $('<div class="music-typeSelect"></div>').appendTo(_this.cpt_music);
                        _this.music_all = $('<div class="music-all music-typeSelect" data-type="">全部</div>').appendTo(_this.music_typeSelect);
                        _this.music_typeList = $('<div class="music-random-typeSelect music-typeSelect" data-type="纯音乐">纯音乐</div><div class="music-random-typeSelect music-typeSelect" data-type="华语">华语</div>').appendTo(_this.music_typeSelect);
                        _this.music_refresh = $('<div class="music-refresh">刷新</div>').appendTo(_this.music_typeSelect);
                    }

                    if (opt.hasBlur) {
                        _this.music_blur = $('<div class="filterBg"></div>').css({
                            '-webkit-filter': 'blur(' + opt.blur + 'px)',
                            '-moz-filter': 'blur(' + opt.blur + 'px)',
                            '-ms-filter': 'blur(' + opt.blur + 'px)',
                            'filter': 'progid:DXImageTransform.Microsoft.Blur(PixelRadius=' + opt.blur + ', MakeShadow=false)', /* IE6~IE9 */
                        }).appendTo(_this.cpt_music);
                    }

                    _this.music_status = $('<div class="pauseplay"><i class="dw-icon-play"></i></div>').appendTo(_this.music_play);
                    _this.music_next = $('<div class="next"><i class="dw-icon-like"></i></div>').appendTo(_this.music_play);
                    _this.music_info = $('<div class="music-info"></div>').appendTo(_this.music_play);
                    _this.music_name = $('<p class="music-name">未曾遗忘的青春</p>').appendTo(_this.music_info);
                    _this.music_singer = $('<p class="music-singer">music plugin</p>').appendTo(_this.music_info);

                    _this.music_logo = $('<div class="music-div-logo"></div>').appendTo(_this.cpt_music);
                    // _this.music_shadow = $('<div class="music-logo-shadow"></div>').appendTo(_this.music_logo);
                    _this.music_img = $('<img class="music-logo" src="http://www.daiwei.org/index/images/img/indeximg.jpg">').appendTo(_this.music_logo);
                    _this.music_progress = $('<canvas id="music_canvas" style="position:absolute;top:0;left:0;zoom:0.25"></canvas>').appendTo(_this.music_logo);

                    _this.audio = $('<audio id="cpt_dw_music" src=""></audio>').appendTo($('body'));

                    opt.beforeMusicPlay();


                    //监听选择类型事件
                    musicValue._selectEvent();

                    musicValue._selectByClass();
                }

                //给类型选择列表加监听事件
                musicValue._selectEvent = function () {
                    if (opt.hasSelect && opt.hasAjax) {
                        musicValue._randomSelect(2);

                        _this.music_typeSelect.find('.music-typeSelect').on('click', function (event) {
                            var text = $(this).attr('data-type');
                            event.stopPropagation();
                            _this.music_typeSelect.remove();
                            //获取数据
                            musicValue._dataType(text);
                        });

                        _this.music_refresh.on('click', function (event) {
                            event.stopPropagation();
                            musicValue._randomSelect(2);
                        });
                    } else {
                        musicValue._dataType();
                    }
                };

                //随机设置类型
                musicValue._randomSelect = function (index) {
                    var arr = opt.musicType;
                    var new_arr = musicValue.getRandomElementFromArr(arr, index);
                    for (var i = 0; i < index; i++) {
                        _this.music_typeSelect.find('.music-typeSelect').eq(i + 1).text(new_arr[i]).attr('data-type', new_arr[i]);
                    }
                    ;
                };

                //音乐播放的点击事件
                musicValue._clickEvent = function () {
                    _this.music_status.off().on('click', function (event) {
                        event.stopPropagation();
                        musicValue._playPause();
                    });

                    _this.music_next.off().on('click', function (event) {
                        $.ajax({
                                 type: "POST",
                                 headers: {
                                      'token':$.cookie('token')
                                   },
                                 url: "/login/collect_song?id="+getQueryVariable("id"),
                                 dataType: "json",
                                 success: function (data) {
                                     if (data.status=='1') {
                                         alert("收藏成功")
                                     }
                                     if (data.status=='0') {
                                         alert("收藏失败")
                                     }
                                   },
                                 error:function (err){
                                     window.open("/login")
                                   }
                                 });
                        event.stopPropagation();
                        //切换下一首歌曲使用
                        // musicValue._playNext();
                    });

                    _this.cpt_music.off().on('click', function () {
                        $(this).toggleClass('circle');
                    });

                    $(".li-music-list").off().on('click', function () {
                        var _this = $(this);
                        var index = _this.attr('data-index');
                        musicValue._playIndex(index);
                    })

                    //长按事件
                    //  _this.cpt_music.longPress({
                    //   duration:300,
                    //   longPress:function(){
                    //       var music_list = new Array();
                    //       for(var i = 0 ; i < musicData.length ; i++ ){
                    //           music_list.push({'title':musicData[i].name +' - '+ musicData[i].singer,
                    //                           'hasHref':false,
                    //                           'font_imgClass':'dw-icon-music',
                    //                           'rightFont_imgClass':''});
                    //       }

                    //       var index = _this.audio.attr('data-index') * 1;
                    //       // alert(JSON.stringify(music_list));
                    //       DW.scrollMenu({
                    //           source:music_list,
                    //           hasLineBorder:false,
                    //           click:function(ret){
                    //               musicValue._playIndex(ret.index);
                    //           }
                    //       });

                    //       $('.cpt-selectScrollMenu').find('li').eq(index).css({
                    //  background:opt.scrollActiveBg,
                    // });
                    //   }
                    //  });
                };

                //显示加载的loading   需引用loading插件
                musicValue._showMusicLoading = function (name) {
                    if ($('.music-div').find('.cpt_loading_mask').length > 0) {
                        return;
                    }
                    var name = name || 'music';
                    //添加加载浮层
                    $('.music-div').loading({
                        name: name,
                        title: '',
                        discription: '',
                        originDivWidth: 30,
                        originDivHeight: 30,
                        flexCenter: true,
                        originWidth: 5,
                        originHeight: 5,
                        loadingWidth: opt.width + 20,
                        loadingHeight: opt.height,
                        originBg: 'rgba(34,222,44,0.5)'
                    });
                };

                //暂停
                musicValue._pause = function () {
                    _this.audio[0].pause();
                    _this.music_img.removeClass('active');
                    _this.music_status.find('i').removeClass('dw-icon-pause').addClass('dw-icon-play');
                };

                //播放
                musicValue._play = function () {
                    _this.audio[0].play();
                    //_this.music_img.addClass('active');
                    //_this.music_status.find('i').removeClass('dw-icon-play').addClass('dw-icon-pause');
                };

                //播放暂停效果
                musicValue._playPause = function () {
                    try {
                        if (_this.audio[0].paused) {
                            _this.audio[0].play();
                        } else {
                            _this.audio[0].pause();
                        }
                    } catch (e) {
                        DW.showMessage(e.name + ": " + e.message);
                    }
                };

                //音频播放结束事件
                musicValue._onended = function () {
                    _this.audio.on('ended', function () {
                        move=0;
                        count=0;
                        first_round=false;
                        lrc_show.style.transform=`translateY(-${move}px)`
                        if (_this.audio[0].loop) {
                            _this.audio[0].load();
                            _this.audio[0].play();
                        } else {
                            musicValue._playNext();
                        }
                    });
                };
                //音频处于播放状态的事件
                musicValue._onplaying = function () {
                    _this.audio.on('playing', function () {
                        DW.removeLoading('music_waiting');
                    });

                    //实时显示canvas进度
                    var dw_audio = document.getElementById('cpt_dw_music');
                    dw_audio.addEventListener('canplay', function () {
                        musicValue._showLoading(dw_audio);
                    });
                };

                //音频需要加载之后才播放事件
                musicValue._onwaiting = function () {
                    _this.audio.on('waiting', function () {
                        musicValue._showMusicLoading('music_waiting');
                    });
                };

                //监听音乐是否暂停
                musicValue._onpause = function () {
                    _this.audio.on('pause', function () {
                        _this.music_img.removeClass('active');
                        document.title='播放器V1.2';
                        _this.music_status.find('i').removeClass('dw-icon-pause').addClass('dw-icon-play');
                    })
                };

                //监听音乐是否暂停
                musicValue._onplay = function () {
                    _this.audio.on('play', function () {
                        _this.music_img.addClass('active');
                        document.title='▶正在播放:'+mylist[0].name
                        _this.music_status.find('i').removeClass('dw-icon-play').addClass('dw-icon-pause');
                    })
                };

                //跳动进度的时候执行
                // musicValue._seeked = function(){

                // };

                musicValue._keyPress = function () {
                    document.onkeydown = function (e) {
                        var keycode = e.which || window.event.keyCode;
                        if (keycode == 32 && !$('input').is(':focus')) {
                            musicValue._playPause();
                        }

                        if (keycode == 39 || keycode == 40 && !$('input').is(':focus')) {
                            musicValue._playNext();
                        }

                        if (keycode == 37 || keycode == 38 && !$('input').is(':focus')) {
                            musicValue._playPrev();
                        }
                    }
                };

                //自定义选择音乐类型事件
                musicValue._selectByClass = function () {
                    var typeClass = opt.selectClassName;
                    $('.' + typeClass).on('click', function () {
                        var type = $(this).attr('data-type');
                        musicValue._pause();
                        musicValue._dataType(type);
                    })
                };

                //播放上一首音乐
                musicValue._playPrev = function () {
                    //通过data-index+1来播放下一集
                    var index = _this.audio.attr('data-index') * 1 - 1;
                    if (index < 0) {
                        index = musicLenth - 1;
                    }

                    musicValue._insertData(musicData, index);
                    musicValue._playPause();

                    if ($('.cpt-selectScrollMenu').length) {
                        $('.cpt-selectScrollMenu').find('li').eq(index).css({
                            background: opt.scrollActiveBg,
                            // color:'#fff',
                        }).siblings().css({
                            background: '#fff',
                            // color:'#fff',
                        });
                    }
                };

                //点击下一首音乐事件
                musicValue._playNext = function () {
                    //通过data-index+1来播放下一集
                    var index = _this.audio.attr('data-index') * 1 + 1;
                    if (index >= musicLenth) {
                        index = 0;
                    }

                    musicValue._insertData(musicData, index);
                    musicValue._playPause();

                    if ($('.cpt-selectScrollMenu').length) {
                        $('.cpt-selectScrollMenu').find('li').eq(index).css({
                            background: opt.scrollActiveBg,
                            // color:'#fff',
                        }).siblings().css({
                            background: '#fff',
                            // color:'#fff',
                        });
                    }
                };

                musicValue._playIndex = function (index) {
                    //通过data-index+1来播放下一集
                    var index = index;
                    if (index >= musicLenth) {
                        index = 0;
                    }

                    musicValue._insertData(musicData, index);
                    musicValue._playPause();
                };

                //写入音乐的事件监听
                musicValue._musicListener = function () {
                    if (_this.audio[0].readyState === 3) {
                        opt.afterMusicLoading();
                        //删除加载浮层
                        DW.removeLoading('music_waiting');
                    }

                    //注册点击事件
                    musicValue._clickEvent();

                    //音乐播放结束事件
                    musicValue._onended();

                    // 音乐处于播放或中途中暂停的状态
                    musicValue._onplaying();

                    //当媒介已停止播放但打算继续播放时运行脚本
                    musicValue._onwaiting();

                    //音乐暂停会触发事件   主要是图标的改动
                    musicValue._onpause();

                    //音乐暂停会触发事件   主要是图标的改动
                    musicValue._onplay();

                    //按键事件  控制音乐播放
                    musicValue._keyPress();
                    //时间更新函数
                };

                //给dom装填数据
                musicValue._insertData = function (data, index) {
                    var music_imgUrl = data[index].img_url || 'http://www.daiwei.org/index/images/img/indeximg.jpg';
                    var music_name = data[index].name || '爱乐之城 纯音乐';
                    var music_url = data[index].url || 'http://oiq8j9er1.bkt.clouddn.com/Justin%20Hurwitz%20-%20Planetarium%20-%20From%20La%20La%20Land%20Soundtrack.mp3';
                    var music_singer = data[index].singer || '默认音乐';
                    var music_sortIndex = data[index].sort_index || 0;
                    _this.music_name.text(music_name).attr('title', music_name);
                    _this.music_singer.text(music_singer).attr('title', music_singer);
                    _this.music_img.attr('src', music_imgUrl);
                    if (opt.hasBlur) {
                        var blur_bg = ('url(' + music_imgUrl + ')center right no-repeat').toString();
                        _this.music_blur.css({
                            background: blur_bg,
                            'background-size': 'cover',
                        });
                    }
                    ;

                    var ret = {
                        index: index,
                        data: data,
                        url: music_url,
                    };

                    // opt.musicPlayByWebAudio(ret);
                    opt.musicChanged(ret);

                    _this.audio.attr('src', music_url);
                    _this.audio.attr('data-index', music_sortIndex);
                };

                //获取数据之后的操作  添加sort_index属性
                musicValue._getMusicInfo = function () {
                    //给获取的音乐添加sortindex 索引   添加属性
                    musicLenth = musicData.length;

                    for (var i = 0; i < musicLenth; i++) {
                        musicData[i].sort_index = i;
                    }

                    if (musicLenth) {
                        opt.getMusicInfo(musicData);

                        musicValue._insertData(musicData, 0);

                        //监听状态
                        musicValue._musicListener();
                    } else {
                        return;
                    }
                };

                musicValue.getRandomElementFromArr = function (arr, num) {
                    var test_arr = new Array();
                    for (var index in arr) {
                        test_arr.push(arr[index]);    //创建新的arr  为了不改变原来的arr值
                    }
                    ;

                    var result_arr = new Array();
                    for (var i = 0; i < num; i++) {
                        if (test_arr.length > 0) {
                            var index = Math.floor(Math.random() * test_arr.length);
                            result_arr.push(test_arr[index]);
                            test_arr.splice(index, 1);
                        } else {
                            return;
                        }
                    }
                    return result_arr;
                }

                //选择获取数据类型  本地 or ajax
                musicValue._dataType = function (text) {
                    var value = text || '';
                    if (opt.hasAjax) {
                        musicValue._ajax(value);
                        // parseData = JSON.parse(data);
                    } else {
                        // parseData = opt.source;
                        musicValue._localData();
                    }
                };

                //执行本地数据
                musicValue._localData = function () {
                    musicData = opt.source;
                    musicValue._getMusicInfo();
                };

                // musicValue._showMusicList = function() {

                // };

                //执行ajax请求的数据
                musicValue._ajax = function (value) {
                    var value = value || '';
                    var host = window.location.host;
                    var music_data = '';
                    $.ajax({
                        url: "../../music/server.php?inAjax=1&do=getMusic",
                        type: 'post',
                        datatype: 'json',
                        data: {type: value},
                        success: function (data) {
                            musicData = data;
                            // alert(data);
                            musicValue._getMusicInfo();
                        },

                        error: function (XMLHttpRequest, textStatus, errorThrown) {
                            console.error('XMLHttpRequest.status: ' + XMLHttpRequest.status);
                            console.error('XMLHttpRequest.readyState: ' + XMLHttpRequest.readyState);
                            console.error('textStatus: ' + textStatus);
                            return;
                        },
                    });
                }

                //显示canvas进度
                musicValue._showLoading = function (audio) {
                    var music_ele = audio || '';
                    // var myAudio = document.getElementById('music_canvas');
                    //music_duration = music_ele.duration;
                    jump_bar.max=music_ele.duration;
                    // init canvas
                    var canvas = document.getElementById('music_canvas');
                    canvas.width = (opt.height + 2) * 4;
                    canvas.height = (opt.height + 2) * 4;
                    var context = canvas.getContext('2d');

                    var centerX = opt.height / 2 + 1;
                    var centerY = opt.height / 2 + 1;

                    var currnt = 0;
                    var rate = (Math.PI * 2 / music_duration).toFixed(5);

                    //音频播放事件
                    music_ele.ontimeupdate = function (currnt) {
                        currnt = music_ele.currentTime;
                        jump_bar.value=currnt;
                        while (Number(get_lrc_time(lrcs[count]))-0.8<currnt &&  Number(get_lrc_time(lrcs[count]))+0.8>currnt) {
                            var color=maincolor.split(',')[0]+','+maincolor.split(',')[1]+','+'20%'
                            if (count+3 >= lrcs.length-2){
                                lrc_show.innerHTML =  lrc_show.innerHTML + `<div class="lrc_div"></div>`;//添加空行，让歌词上浮
                            }
                            light_lrc[count].style.color=`hsl(${color})`;
                            light_lrc[count].style.transform='scale(1.5, 1.5)';
                            if (light_lrc[count].clientHeight==32){//目前只做了最多三行歌词的情况，实际上可能有更多的，其他的自己算吧（-+-）
                                move+=46+24
                            }
                            if (light_lrc[count].clientHeight==48){
                                move+=46+36
                            }
                            if (light_lrc[count].clientHeight==16){
                                move+=46
                            }
                            lrc_show.style.transform=`translateY(-${move}px)`
                            light_lrc[count].style.filter='blur(0px)'
                            light_lrc[count+1].style.filter='blur(0.8px)'
                            light_lrc[count+2].style.filter='blur(1.2px)'
                            light_lrc[count+3].style.filter='blur(1.6px)'
                            if (count>=1){
                                light_lrc[count-1].style.color=`hsl(${maincolor})`;
                                light_lrc[count-1].style.transform='scale(1, 1)';
                                light_lrc[count-1].style.filter='blur(0.8px)'
                                if (count>=2){
                                    light_lrc[count-2].style.filter='blur(1.2px)'

                                    if (count>=3){
                                        light_lrc[count-3].style.filter='blur(1.6px)'
                                    }
                                }
                            }
                            count += 1;
                            if (Number(get_lrc_time(lrcs[count+1]))-Number(get_lrc_time(lrcs[count]))<0.3){
                               continue;
                            }else{
                                break;
                            }
                        }
                        while (Number(get_lrc_time(lrcs[count+1]))+2<currnt){//歌词纠错机制，原理是当前的时间大于下一首歌词2秒的时间即可判断为卡死，开始循环追踪直到找到正确的时间为止
                                count+=1
                        }
                        // context.clearRect(0, 0, opt.height, opt.height);
                        // durationCircle();
                        // // text(Math.floor(currnt/duration*100));
                        // progressCircle(currnt);
                        // if (currnt >= music_duration) currnt = 0;
                    };

                    function progressCircle(currnt) {
                        context.save();
                        // console.log(currnt);
                        var grd = context.createLinearGradient(0, 0, opt.height, opt.height);
                        for (var i = 0; i < opt.progressBg.length; i++) {
                            grd.addColorStop(opt.progressBg[i].position, opt.progressBg[i].color);
                        }

                        context.translate(0.5, 0.5);
                        context.lineCap = "round";
                        context.strokeStyle = grd;  //设置描边样式
                        context.lineWidth = 3.5;     //设置线宽
                        context.scale(4, 4);
                        context.beginPath();   //路径开始
                        context.arc(centerX, centerY, opt.height / 2, -Math.PI / 2, -Math.PI / 2 + currnt * rate, false);   //用于绘制圆弧context.arc(x坐标，y坐标，半径，起始角度，终止角度，顺时针/逆时针)
                        context.stroke(); //绘制
                        context.closePath(); //路径结束
                        context.restore();
                    }

                    //绘制白色外圈
                    function durationCircle() {
                        context.save();
                        context.scale(4, 4);
                        context.beginPath();
                        context.strokeStyle = opt.durationBg;
                        context.lineWidth = 3.5;
                        context.arc(centerX, centerY, opt.height / 2, 0, Math.PI * 2, false);
                        context.stroke();
                        context.closePath();
                        context.restore();
                    }
                }

                musicValue._init();
                return _this;
            }
            window.MC = DW;
            $.fn.loading = function (options) {
                var $this = $(this);
                var _this = this;
                return this.each(function () {
                    var loadingPosition = '';
                    var defaultProp = {
                        direction: 'column',                                               //方向，column纵向   row 横向
                        animateStyle: 'fadeInNoTransform',                                    //进入类型
                        title: '请稍等...',                                           //显示什么内容
                        name: 'loadingName',                                          //loading的data-name的属性值  用于删除loading需要的参数
                        type: 'origin',                                               //pic   origin
                        discription: '这是一个描述',                                       //loading的描述
                        titleColor: 'rgba(255,255,255,0.7)',                                //title文本颜色
                        discColor: 'rgba(255,255,255,0.7)',                                //disc文本颜色
                        loadingWidth: 260,                                                    //中间的背景宽度width
                        loadingBg: 'rgba(0, 0, 0, 0.6);',                                  //中间的背景色
                        borderRadius: 12,                                                     //中间的背景色的borderRadius
                        loadingMaskBg: 'transparent',                                          //背景遮罩层颜色
                        zIndex: 1000001,                                                //层级

                        // 这是圆形旋转的loading样式    （originLoading）
                        originDivWidth: 60,                                                     //loadingDiv的width
                        originDivHeight: 60,                                                     //loadingDiv的Height

                        originWidth: 8,                                                      //小圆点width
                        originHeight: 8,                                                      //小圆点Height
                        originBg: '#fefefe',                                              //小圆点背景色
                        smallLoading: false,                                                  //显示小的loading

                        // 这是图片的样式   (pic)
                        imgSrc: 'http://www.daiwei.org/index/images/logo/dw.png',       //默认的图片地址
                        imgDivWidth: 80,                                                     //imgDiv的width
                        imgDivHeight: 80,                                                     //imgDiv的Height

                        flexCenter: false,                                                  //是否用flex布局让loading-div垂直水平居中
                        flexDirection: 'row',                                                  //row column  flex的方向   横向 和 纵向
                        mustRelative: false,                                                  //$this是否规定relative
                    };


                    var opt = $.extend(defaultProp, options || {});

                    if ($this.selector == 'body') {
                        $('body,html').css({
                            overflow: 'hidden',
                        });
                        loadingPosition = 'fixed';
                    } else if (opt.mustRelative) {
                        $this.css({
                            position: 'relative',
                        });
                        loadingPosition = 'absolute';
                    } else {
                        loadingPosition = 'absolute';
                    }

                    var _showOriginLoading = function () {
                        var smallLoadingMargin = opt.smallLoading ? 0 : '-10px';
                        if (opt.direction == 'row') {
                            smallLoadingMargin = '-6px'
                        }

                        //悬浮层
                        _this.cpt_loading_mask = $('<div class="cpt-loading-mask animated ' + opt.animateStyle + ' ' + opt.direction + '" data-name="' + opt.name + '"></div>').css({
                            'background': opt.loadingMaskBg,
                            'z-index': opt.zIndex,
                            'position': loadingPosition,
                        }).appendTo($this);

                        //中间的显示层
                        _this.div_loading = $('<div class="div-loading"></div>').css({
                            'background': opt.loadingBg,
                            'width': opt.loadingWidth,
                            'height': opt.loadingHeight,
                            '-webkit-border-radius': opt.borderRadius,
                            '-moz-border-radius': opt.borderRadius,
                            'border-radius': opt.borderRadius,
                        }).appendTo(_this.cpt_loading_mask);

                        if (opt.flexCenter) {
                            _this.div_loading.css({
                                "display": "-webkit-flex",
                                "display": "flex",
                                "-webkit-flex-direction": opt.flexDirection,
                                "flex-direction": opt.flexDirection,
                                "-webkit-align-items": "center",
                                "align-items": "center",
                                "-webkit-justify-content": "center",
                                "justify-content": "center",
                            });
                        }

                        //loading标题
                        _this.loading_title = $('<p class="loading-title txt-textOneRow"></p>').css({
                            color: opt.titleColor,
                        }).html(opt.title).appendTo(_this.div_loading);

                        //loading中间的内容  可以是图片或者转动的小圆球
                        _this.loading = $('<div class="loading ' + opt.type + '"></div>').css({
                            'width': opt.originDivWidth,
                            'height': opt.originDivHeight,
                        }).appendTo(_this.div_loading);

                        //描述
                        _this.loading_discription = $('<p class="loading-discription txt-textOneRow"></p>').css({
                            color: opt.discColor,
                        }).html(opt.discription).appendTo(_this.div_loading);

                        if (opt.type == 'origin') {
                            _this.loadingOrigin = $('<div class="div-loadingOrigin"><span></span></div><div class="div-loadingOrigin"><span></span></div><div class="div_loadingOrigin"><span></span></div><div class="div_loadingOrigin"><span></span></div><div class="div_loadingOrigin"><span></span></div>').appendTo(_this.loading);
                            _this.loadingOrigin.children().css({
                                "margin-top": smallLoadingMargin,
                                "margin-left": smallLoadingMargin,
                                "width": opt.originWidth,
                                "height": opt.originHeight,
                                "background": opt.originBg,
                            });
                        }

                        if (opt.type == 'pic') {
                            _this.loadingPic = $('<img src="' + opt.imgSrc + '" alt="loading" />').appendTo(_this.loading);
                        }


                        //关闭事件冒泡  和默认的事件
                        _this.cpt_loading_mask.on('touchstart touchend touchmove click', function (e) {
                            e.stopPropagation();
                            e.preventDefault();
                        });
                    };

                    function createLoading() {
                        //不能生成两个loading data-name 一样的loading
                        if ($(".cpt-loading-mask[data-name=" + opt.name + "]").length > 0) {
                            // console.error('loading mask cant has same date-name('+opt.name+'), you cant set "date-name" prop when you create it');
                            return
                        }

                        _showOriginLoading();
                    };

                    createLoading();
                });
            }

            //关闭Loading
            DW.removeLoading = function (loadingName) {
                var loadingName = loadingName || '';
                $('body,html').css({
                    overflow: 'auto',
                });

                if (loadingName == '') {
                    $(".cpt-loading-mask").remove();
                } else {
                    var name = loadingName || 'loadingName';
                    $(".cpt-loading-mask[data-name=" + name + "]").remove();
                }
            }
            DW.music({
			hasAjax: false,
			left: '50%',
			bottom: '50%',
			musicChanged: function (ret) {
				// getMusic_buffer(ret.url);
				// return;
				var data = ret.data;
				var index = ret.index;
				var imageUrl = data[index].img_url;

				var music_bg = document.getElementById('music-bg');
				music_bg.style.background = 'url(' + imageUrl + ')no-repeat';
				music_bg.style.backgroundSize = 'cover';
				music_bg.style.backgroundPosition = 'center 30%';
			},

			getMusicInfo: function (data) {

			},

			musicPlayByWebAudio: function (ret) {

			},
		});
        }
})(jQuery,window)
