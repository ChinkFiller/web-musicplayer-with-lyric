# web-musicplayer-with-lyric
魔改的其他老哥的一个项目。
源码地址：https://github.com/IFmiss/music
源码都是5年前的老货了，正好老师要求作业就给整了一下.
# 新增 滚动歌词特效
 他之前的界面太单调了，只有一个点击可以缩小的播放器，所以我魔改了一下，加了一个滚动的歌词特效
 ![Image text](images/111.png)
# 新增 可变歌曲地址
字面意思，可以根据链接播放不同的歌曲
# 具体实现
GET请求/login/player_list?id=“酷狗的歌曲id”便会从这个接口获得一个json数组，包含歌名，歌手和歌曲、封面地址以及歌词
访问/login/search_music可以搜索歌曲（这个界面写的不是很好，更改在main.py文件里，是个字符串html代码）
# 新增 歌词颜色跟随专辑封面
字面意思，但是受限于js的计算主色调的速度，我写了个await函数来等待主演色加载完，所以有的界面会黑屏一会才打开，
这个正常，主色调不计算完就显示会有歌词卡死的情况
# 新增  收藏歌曲
暂停键旁边有一个收藏按键，点击会把id记录到数据库里，需要mysql支持。
没有登录的会跳转登录界面，登录完了再收藏会把信息记录到数据库里
具体结构在main的第50行里
# 问题
改完了后源代码的进度条没了，所以自己写了一个，感觉违和感好强（=——=）
那个进度条仅仅只是个进度条不能调整进度，因为还得搞歌词同步啥的，不想搞了，交作业可以了（+-+）
# 其他
优化了一下代码，把没必要的都删了，加了点其他的小功能。
