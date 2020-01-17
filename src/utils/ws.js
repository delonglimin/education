import {
    Message
} from 'element-ui'
import {ifMobile} from '@/utils/index'
function WS(url, callback) {
    // 初始化一个 WebSocket 对象
    var ws = new WebSocket(url);

    // 建立 web socket 连接成功触发事件
    ws.onopen = function () {
        // 使用 send() 方法发送数据
        callback('onopen', "")
    };

    // 接收服务端数据时触发事件
    ws.onmessage = function (evt) {
        let obj = JSON.parse(evt.data)
        //console.log(obj)
        switch (obj.type) {
            case 'join':
                if (obj.client_list != undefined) {
                    callback('onJoinSuccess', obj)
                } else {
                    callback('onUserJoin', obj)
                }
                break;
            case 'TxtMsg':
                if ('state' == obj.message.type) {
                    callback('onStateChange', obj.message)
                    return
                }
                if ('canvas' == obj.message.type) {
                    callback('onCanvasUpdate', obj)
                    return
                }
                if (obj.code == undefined) {
                    if (obj.to == 'all') {
                        callback('onPublicMes', obj)
                    } else {
                        callback('onPrivateMes', obj)
                    }
                }
                break;
            case 'command':
                if(obj.code && parseInt(obj.code)>=500){
                    Message({
                        message: obj.message,
                        duration: 2000
                    })
                }
                callback('onCommand', obj)
                break;
            case 'exit':
            case 'close':
                if (obj.code == undefined) {
                    callback('onUserExit', obj)
                }
                break;
            case 'error':
                Message({
                    message: obj.message,
                    duration: 2000
                })
                break;
        }

    };

    // 断开 web socket 连接成功触发事件
    ws.onclose = function () {
        callback('onclose', "")
    };
    ws.onerror = function () {
        reconnnect()
        callback('onerror', "")
    };

    function reconnnect() {
        ws.close()
        setTimeout(()=>{ws = new WebSocket(url)},2000)
    }
    var jsonStr = {
        'platform': 'web',
        "message": "",
        "extras": ""
    }
    if(ifMobile()){
        jsonStr.platform = 'ios'
    }
    this.ws = ws
    this.close = function(){
        ws.close()
    }
    this.joinRoom = function (id) {
        jsonStr.type = 'join',
            jsonStr.groupId = id
        jsonStr.extras = {
            'type': 'class',
            'classroom_id': id
        }
        ws.send(JSON.stringify(jsonStr))
    }
    this.sendPublic = function (message) {
        jsonStr.type = 'TxtMsg'
        jsonStr.to = 'all'
        jsonStr.message = message
        ws.send(JSON.stringify(jsonStr))
    }
    this.sendPrivate = function (uid, message) {
        jsonStr.type = 'TxtMsg'
        jsonStr.to = uid
        jsonStr.message = message
        ws.send(JSON.stringify(jsonStr))
    }
    this.sendCommand = function (command, id) {
        jsonStr.type = 'command'
        jsonStr.extras = {
            'command': command,
            'user_id': id
        }
        ws.send(JSON.stringify(jsonStr))
    }
    this.sendCurrentState = function (message) {
        jsonStr.type = 'TxtMsg'
        jsonStr.to = 'all'
        message.type = 'state'
        jsonStr.message = message
        ws.send(JSON.stringify(jsonStr))
    }
    this.sendCanvasData = function (canvasUrl) {
        jsonStr.type = 'TxtMsg'
        jsonStr.to = 'all'
        let message = {}
        message.type = 'canvas'
        message.canvasUrl = canvasUrl
        jsonStr.message = message
        ws.send(JSON.stringify(jsonStr))
    }
}
export default WS