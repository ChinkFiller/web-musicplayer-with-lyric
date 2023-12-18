import sys
import logging
logging.basicConfig(stream=sys.stderr)
# 添加项目运行虚拟环境，把第三步执行的虚拟环境地址放入以下
sys.path.append("/usr/bin/python3")
# 添加项目
sys.path.insert(0,"/var/www/foundation/")
# 添加app，这里main是我flask的入口文件，app是flask的程序名称：app = Flask(__name__)
from main import app as application