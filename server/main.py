import json
import random
from hashlib import md5
import pymysql as SQL
import datetime
from flask import Flask, request, jsonify,make_response,url_for,redirect
import os
import urllib.parse
import finder
from io import BytesIO
class functions:
    def MD5(self,a):#md5生成函数
        new_md5 = md5()
        new_md5.update(a.encode(encoding='utf-8'))
        signature = new_md5.hexdigest()
        return signature
    def use_sql(self):
        '''
        打开数据库的函数
        :return: s：数据库连接信息 c:数据库的游标
        '''
        s = SQL.connect(host='localhost',  # 数据库主机名
                        port=3306,  # 数据库端口号，默认为3306
                        user='cilent',  # 数据库用户名
                        passwd='test1234',  # 数据库密码
                        db='users',  # 数据库名称
                        charset='utf8'  # 字符编码
                        )
        c = s.cursor()
        return s,c
    def close_sql(self,s,c):
        '''
        关闭数据库
        :param s:数据库的连接信息
        :param c: 数据库的游标
        '''
        c.close()
        s.close()
    def check_password(self,user,pswd):#数据检查函数
        '''
        检查密码的函数
        :param user:用户名
        :param pswd:密码
        :return:判断结果，False为错误，True为正确
        '''
        s,c=self.use_sql()
        if '.' in user or '--' in user:
            return False
        c.execute("select * from userlib where name='%s'" % user)
        inf=c.fetchall()#数据库结构0--id 1--username 2-password 3-tem_code
        # print(inf)
        if len(inf)==0:
            c.close()
            s.close()
            return False
        elif inf[0][2] == pswd:
            self.close_sql(s,c)
            return True
        else:
            self.close_sql(s,c)
            return False
    def decode_msg(self,msg:str) -> str:
        '''
        解码加密字符串
        :param msg:加密信息
        :return: 解密后的信息
        '''
        key=str(datetime.date.today())
        count=0
        res=''
        for i in msg:
            if count==len(key)-1:
                count=0
            b=ord(i)
            b=b-3+(ord(key[count])%10)
            count=count+1
            res=res+chr(b)
        return res
    def encode_msg(self,msg:str)->str:
        '''
        加密字符串信息
        :param msg:明文信息
        :return: 加密后的字符串
        '''
        key = str(datetime.date.today())
        count = 0
        res = ''
        for i in msg:
            if count == len(key) - 1:
                count = 0
            b = ord(i)
            b = b -(ord(key[count]) % 10)+3
            count = count + 1
            res = res + chr(b)
        return res
    def remrember_cookie(self,username,code):
        '''
        记住token密钥
        :param username:用户名
        :param code: token密钥
        :return: None
        '''
        s,c=self.use_sql()
        c.execute(f'update userlib set tem_code="{code}" where name="{username}"')
        s.commit()
        self.close_sql(s,c)
    def check_cookie(self,cookie):
        '''
        检查token是否有效
        :param cookie: token密钥
        :return: 成功返回id，错误返回False
        '''
        s,c=self.use_sql()
        c.execute(f'select id from userlib where tem_code="{cookie}"')
        code=c.fetchone()
        # print(code)
        if code == None:
            self.close_sql(s,c)
            return False
        elif code != None:
            self.close_sql(s,c)
            return code[0]
    def collect_song(self,song_id,user_id):
        '''
        记录收藏歌曲的id
        :param song_id:歌曲id
        :param user_id: 用户id
        :return: 结果状态
        '''
        s,c=self.use_sql()
        try:
            c.execute(f'select collect from userlib where id={str(user_id)}')
            msg=c.fetchone()[0]
            if song_id in msg:
                return True
            c.execute(f"update userlib set collect='{str(song_id)+'/##?##/'}' where id={str(user_id)}")
            s.commit()
            self.close_sql(s,c)
            return True
        except:
            return False
app = Flask(__name__)
tool = functions()

@app.route('/login', methods=['POST'])
def login():
        data = request.get_data()
        try:
            data=json.loads(data.decode())
        except:
            return 'Bad Request' ,400
        if data and 'username' in data and 'password' in data:
            username = data['username']
            password = data['password']
            username=tool.decode_msg(username)
            password=tool.decode_msg(password)
            if tool.check_password(username,password):
                cookie=tool.MD5(str(random.random()))
                tool.remrember_cookie(username,cookie)
                return jsonify({'status':'success','key':tool.encode_msg(cookie)}), 200 ,{"Access-Control-Allow-Origin":"*",'Set-Cookie':'isVisit=true;domain=.yourdomain.com;path=/;max-age=1000'}
            else:
                return '' ,401
        else:
            return 'Bad Request',400
@app.route('/',methods=['GET'])
def index():
    if request.cookies.get('token') == None:
        with open('/var/www/foundation/html_files/login_index.html','rb') as f:
            index_file=f.read()
        return index_file, 200
    else:
        back = tool.check_cookie(request.cookies.get('token'))
        if back:
            return redirect('/login/music',code=302)
        else:
            with open('/var/www/foundation/html_files/login_index.html', 'rb') as f:
                index_file = f.read()
            return index_file,200,{"Set-Cookie": "token=; Expires=Thu, 01 Jan 1970 00:00:00 GMT"}
@app.route('/search_music',methods=['GET'])
def serch():
    music_finder=finder.find_music_url()
    key_word = request.args.get('wd')
    if key_word==None:
        return redirect('/login/music')
    res='''
<!DOCTYPE html>
<html lang="en" dir="ltr">
 
<head>
    <meta charset="utf-8">
    <title>搜索结果</title>
    <link rel="stylesheet" type="text/css" href="/source/search_ui/style.css">
    <link rel="stylesheet" href="http://at.alicdn.com/t/font_1309180_m0vigzfu7y.css">
    <link rel="stylesheet" type="text/css" href="/source/search_ui/res.css">
</head>
    <body class="bod1">
     <div class="search-box">
        <input class="search-text" id="search" placeholder="输入你想下载的歌曲" onkeydown="keyevent()">
        <a class="search-btn" onclick="btnevent()">
            <i class="iconfont iconchazhao"></i>
        </a>
    </div>
    <div class="search-res">
       <br></br>
    '''
    for i in music_finder.find_music_list(key_word):  # 循环插入搜索结果
        signer=i[3]
        song_name=i[1]
        id=i[2]
        text=f'<div class="search-res-list">\n  <i class="search-res-text">{signer}       {song_name}</i>\n  <a class="search-res-but" href="play_music?id={id}">在线播放</a>\n  <a class="search-res-but" href="music_download?id={id}">下载</a>\n</div>\n<br></br>'
        res+='\n'+text
    res+='''
    </div>
    </body>
    <script src="/source/search_ui/commands.js"></script>
    <script>
    function getQueryVariable(variable) {
         var query = window.location.search.substring(1);
         var vars = query.split("&");
         for (var i=0;i<vars.length;i++) {
              var pair = vars[i].split("=");
              if(pair[0] == variable){return pair[1];}
         }
         return(false);
    }
    document.title="'"+decodeURI(getQueryVariable("wd"))+"'"+"的搜索结果";
    </script>
</html>
    '''
    return res,200
@app.route('/music_download',methods=['GET'])
def back():
    music_id=request.args.get('id')
    music_finder=finder.find_music_url()
    a,b,c,d=music_finder.get_music_info(music_id)
    if not b:
        return redirect('/login/404',code=302)
    return redirect(a,code=302)
@app.route("/play_music",methods=['GET'])
def main_player():
    if request.args.get('id')==None:
        return redirect('/login/music',code=302)
    with open('/var/www/foundation/html_files/player_index.html', 'rb') as f:
        file = f.read()
    return file, 200
@app.route("/music",methods=["GET"])
def search():
    with open('/var/www/foundation/html_files/search_index.html',"rb") as f:
        file=f.read()
    return file,200
@app.route('/play_list',methods=['GET'])
def back_json():
    id=request.args.get("id")
    music_finder=finder.find_music_url()
    music_url,img_url,song_name,singer,lrc=music_finder.get_music_info(id)
    if not img_url:
        tem = {}
        tem['status'] = '1'
        tem = json.dumps(tem)
        tem = str(tem)
        return '[' + tem + ']', 200
    tem={}
    tem['name']=song_name
    tem['singer']=singer
    tem['url']=music_url
    tem['img_url']=img_url
    tem['status']='0'
    tem['lrc']=lrc
    tem=json.dumps(tem)
    tem=str(tem)
    return '['+tem+']',200
@app.route("/collect_song",methods=["POST"])
def collect():
    token=request.cookies.get('token')
    if token==None:
        return 'location',401
    elif tool.check_cookie(token):
        try:
           song_id=request.args.get("id")
        except:
            return jsonify({"status":0}),200
        if tool.collect_song(song_id,tool.check_cookie(token)):
            return jsonify({"status":1}),200
        else:
            return jsonify({"status":0}), 200
    else:
        return '',401
@app.route('/404',methods=["GET"])
def error_s():
    with open('/var/www/foundation/html_files/404.html', 'rb') as f:
        file = f.read()
    return file, 404
