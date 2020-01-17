import * as QNRTC from "pili-rtc-web";
import {
    Message,
    MessageBox
} from 'element-ui'
QNRTC.log.setLevel("disable");
export async function joinRoom(ROOMTOKEN_1, callback) {
    // 初始化一个房间 Session 对象, 这里使用 Track 模式
    const myRoom = new QNRTC.TrackModeSession();
    // 这里替换成刚刚生成的 RoomToken
    await myRoom.joinRoomWithToken(ROOMTOKEN_1).catch((err) => {
        Message({
            message: '加入连麦房间失败',
            duration: 2000
        })
    });
    myRoom.on("track-add", tracks => {
        console.log("new tracks", tracks);
        callback('newTrack', tracks)
    })
    myRoom.on("track-remove", tracks => {
        console.log("track removed", tracks);
        callback('trackRemove', tracks)
    })
    myRoom.on("disconnect", (data) => {
        if (data.code === 10006) {
            callback('onKickOut', data)
        }
    })
    return myRoom
}

export async function publish(myRoom, cameraId, micId) {
    // 我们打开了 3 个参数，即采集音频，采集视频，采集屏幕共享。
    // 这个函数会返回一个列表，列表中每一项就是一个音视频轨对象
    var c = {
        audio: {
            enabled: true,
            tag: "audio"
        },
        video: {
            enabled: true,
            tag: "video"
        }
    }
    if(cameraId != ''){
        c.video.deviceId = cameraId
    }
    if(micId != ''){
        c.audio.deviceId = micId
    }
    const localTracks = await QNRTC.deviceManager.getLocalTracks(c).catch(() => {
        Message({
            message: '获取设备异常',
            duration: 2000
        })
        myRoom.leaveRoom()
    });
    if (localTracks != undefined) {
        await myRoom.publish(localTracks);
    }
    return localTracks

}
export async function startScreen() {
    return QNRTC.isChromeExtensionAvailable().then(async isAvailable => {
        if (!isAvailable) {
            MessageBox({
                title: '提示:',
                message: '没有检测到屏幕抓取插件 是否下载?',
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                showCancelButton: true,
                type: 'error'
            }).then(() => {
                window.open('http://sdk-release.qnsdk.com/QNRTCWebExtension-1.1.0.crx')
            })
        } else {
            const localTracks = await QNRTC.deviceManager.getLocalTracks({
                screen: {
                    enabled: true,
                    tag: "screen"
                },
            }).catch(() => {
                Message({
                    message: '您拒绝了抓取屏幕',
                    duration: 2000
                })
            })
            return localTracks
        }
    });
}

export function getDeviceList() {
    return QNRTC.deviceManager.deviceInfo
}
export async function previewVideo(element, deviceId) {
    const localTrack = await QNRTC.deviceManager.getLocalTracks({
        video: {
            enabled: true,
            deviceId: deviceId,
            tag: "videoPreview"
        }
    }).catch(() => {
        Message({
            message: '获取设备异常',
            duration: 2000
        })
    });
    if (localTrack != undefined) {
        localTrack[0].play(element);
        return localTrack[0]
    }

}