import requests
import json
import urllib
import time
from hashlib import md5

headers = {
        'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36 Edg/117.0.2045.47'
    }
headers2 = {
        'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36 Edg/117.0.2045.47',
        'Cookie':'kg_mid=ccc842dce7da774774ce9278c0591119; kg_dfid=0R7g5f2OX6eY2EBfN92rrRN0; kg_dfid_collect=d41d8cd98f00b204e9800998ecf8427e; Hm_lvt_aedee6983d4cfc62f509129360d6bb3d=1696760245; Hm_lpvt_aedee6983d4cfc62f509129360d6bb3d=1696762195'
        }
class find_music_url:
    def is_Chinese(self,word):#检测是否为中文，是的话，转码成url格式中文
            for ch in word:
                if '\u4e00' <= ch <= '\u9fff':
                     return True
            return False

    def get_signature(self,text):
        new_md5 = md5()
        new_md5.update(text.encode(encoding='utf-8'))
        signature = new_md5.hexdigest()
        return signature

    def get_music_info(self,id):
        '''
        :param id:
        :return:music_url,img_url,song_name,singer
        '''
        music_url = "https://wwwapi.kugou.com/yy/index.php?r=play/getdata&encode_album_audio_id=" + id
        res = requests.get(music_url,headers=headers2)
        info=res.json()
        try:
            music_url = info['data']['play_url']
        except:
            return info,False,False,False,False
        img_url = info['data']['img']
        song_name=info['data']['song_name']
        singer=info['data']['author_name']
        lrc=info['data']['lyrics']
        return music_url,img_url,song_name,singer,lrc
    def find_music_list(self,key):
        mid = 'ccc842dce7da774774ce9278c0591119'
        key_code = 'NVPh5oo715z5DIWAeQlhMDsWXXQV4hwtappid=1014bitrate=0callback=callback123clienttime={time}clientver=1000dfid=0R7g5f2OX6eY2EBfN92rrRN0filter=10inputtype=0iscorrection=1isfuzzy=0keyword={keyword}mid={mid}page=1pagesize=30platform=WebFilterprivilege_filter=0srcappid=2919token=userid=0uuid={mid}NVPh5oo715z5DIWAeQlhMDsWXXQV4hwt'
        url = 'https://complexsearch.kugou.com/v2/search/song?callback=callback123&srcappid=2919&clientver=1000&clienttime={time}&mid={mid}&uuid={mid}&dfid=0R7g5f2OX6eY2EBfN92rrRN0&keyword={keyword}&page=1&pagesize=30&bitrate=0&isfuzzy=0&inputtype=0&platform=WebFilter&userid=0&iscorrection=1&privilege_filter=0&filter=10&token=&appid=1014&signature={signature}'
        millis = str(round(time.time() * 1000))
        p = key_code.format(time=millis, mid=mid, keyword=key)
        signature = self.get_signature(p)
        if self.is_Chinese(key):
            key = urllib.parse.quote(key)
        search_url = url.format(keyword=key, time=millis, signature=signature, mid=mid)
        back_list=requests.get(search_url,headers=headers)
        song_list = json.loads(back_list.text[12:-2])['data']['lists']
        music_list=[]
        for i, song in enumerate(song_list):
            music_list.append([str(i+1),song.get("SongName"),song.get("EMixSongID"),song.get("SingerName")])
        return music_list





