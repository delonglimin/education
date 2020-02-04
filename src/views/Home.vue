<template>
  <div class="container">
    <div class="top">
      <div class="left">
        <span class="title">课程标题：{{this.$store.state.roomInfo.name}}</span>
        <div class="identity">
          <div>
            <span>ID</span>
            <i>{{this.$store.state.roomInfo.room}}</i>
          </div>
        </div>
      </div>
      <div class="mid">
        <el-button size="mini" type="primary"  @click="dialogFormVisible = true">选择文档</el-button>
      </div>
      <div class="right">
        <el-button
          size="mini"
          type="primary"
          :loading="startLoadingStatus"
          @click="startClass"
        >{{videoFlag ? '离开教室' : '开始上课'}}</el-button>
        <div class="user-box">
          <el-dropdown @command="handleTopCommand">
            <span class="el-dropdown-link">
              设置
              <i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item icon="el-icon-picture-outline" command="set">媒体设置</el-dropdown-item>
              <el-dropdown-item icon="el-icon-news" command="logout">退出</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <el-dialog
          title="媒体设置"
          :visible.sync="dialogMediaVisible"
          width="30%"
          v-on:opened="onMediaDialogOpen"
          v-on:close="onMediaDialogClose"
        >
          <div class="media_dialog">
            <div class="media_video" id="c_m_video">
              <i class="fas fa-video"></i>
            </div>
            <div class="media_item">
              <label>摄像头:</label>
              <el-select v-model="curCamera" v-on:change="onCameraChange">
                <el-option v-for="item in cameraList" :key="item.deviceId" :label="item.label" :value="item.deviceId"></el-option>
              </el-select>
            </div>
            <div class="media_item">
              <label>麦克风:</label>
              <el-select v-model="curMic" v-on:change="onMicChange">
                <el-option v-for="item in micList" :key="item.deviceId" :label="item.label" :value="item.deviceId"></el-option>
              </el-select>
            </div>
            <div class="media_item" style="text-align:center">
              <el-button type="success" @click="saveMediaSettings">保存</el-button>
            </div>
          </div>
        </el-dialog>
      </div>
    </div>
    <div class="main">
      <div class="mid">
        <div class="white_board">
          <WhiteBoard class="board1" ref="whiteBoardCanvas" id="board1" :edit="true" v-on:onPathEnd="onCanvasPathEnd"></WhiteBoard>
        </div>
        <el-dialog
          title="文档"
          width="30%"
          :visible.sync="dialogFormVisible"
          v-on:opened="onFileDialogOpen"
          v-on:close="onFileDialogClose"
        >
          <div class="file_top clearfix">
              <el-input placeholder="请输入在线文档地址" v-model="docName" class="input-with-select"></el-input>
          </div>
          <div slot="footer" class="dialog-footer">
            <el-button @click="dialogFormVisible = false">取 消</el-button>
            <el-button type="primary" @click="dialogFormVisible = false">确 定</el-button>
          </div>
        </el-dialog>
      </div>
      <div class="right">
        <div class="right_top">
          <div class="teacher-placeholder" ref="r_t_video">
            <i class="el-icon-user-solid peo"></i>
          </div>
        </div>
        <div class="right_chat">
          <div class="chat_list">
            <el-scrollbar style="height:100%" id="chat_scroll">
              <ul>
                <li v-for="(item, index) in chatList" :key="index" class="clearfix">
                  <div class="msg fr">
                    <div class="content">{{item.name}}：{{item.mes}}</div>
                  </div>
                </li>
              </ul>
            </el-scrollbar>
          </div>
          <div class="right_bottom">
            <div class="write-box clearfix">
              <input placeholder="按Enter发送消息" class="fl text" v-model="chat_input" @keyup.enter="send" />
              <button :class="chat_input.length > 0 ? 'fl send active' : 'fl send'" @click="send">发送</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import WhiteBoard from "@/components/whiteBoard";
import { validateEmpty, isEmptyObject } from "@/utils/validate";
import { MessageBox } from "element-ui";
export default {
  name: "Home",
  data() {
    return {
      chat_input: "", //聊天输入框
      docName: "", //文档搜索名称
      dialogFormVisible: false, //文档窗口是否显示
      dialogMediaVisible: false, //媒体设置窗口是否显示
      curDoc: false, //当前是否有演示文档
      startLoadingStatus: false, //开始上课加载状态
      videoFlag: false, //是否开始上课
      chatList: [], //聊天信息列表
      cameraList: [], //摄像头列表
      micList: [], //麦克风列表
      curCamera: "", //当前摄像头
      curMic: "", //当前麦克风
      pptList: [], //ppt 数据
      pptListCanvas: [], //存储每个ppt对应的canvas
      curPpt: 0, //当前选中ppt
    };
  },

  watch: {},
  mounted() {
    this.initWs();
  },
  methods: {
    handleTopCommand(command) {
      switch (command) {
        case "set":
          this.dialogMediaVisible = true;
          break;
        case "logout":
          this.logout();
          break;
      }
    },

    //文档窗口打开 请求文档列表
    onFileDialogOpen() {},
    //文档窗口关闭  取消检查转码定时器
    onFileDialogClose() {},
    //初始化websocket
    initWs() {},
    //公聊
    sendPub(mes) {
      let temp = {};
      temp.mes = mes;
      temp.avator = "";
      temp.name = this.$store.state.roomInfo.name;
      this.chatList.push(temp);
      this.scroll("chat_scroll");
    },
    //收到房间消息
    onPublicMessage(data) {},
    onJoinSuccess(data) {},
    onUserJoin(data) {},
    onUserExit(data) {},
    //画布更新
    onCanvasUpdate(canvasUrl) {},

    //聊天发送按钮
    send() {
      if (validateEmpty(this.chat_input)) return;
      this.sendPub(this.chat_input);
      this.chat_input = "";
    },

    logout() {
      this.$router.replace("/")
    },
    //聊天自动滚到最底层
    scroll(id) {
      setTimeout(function() {
        var ele = document
          .getElementById(id)
          .getElementsByClassName("el-scrollbar__wrap")[0];
        ele.scrollTop = ele.scrollHeight;
      }, 200);
    },
    async startClass() {},
    async startPublish() {},
    
    //媒体设置切换camera
    onCameraChange(id) {},
    //媒体设置切换mic
    onMicChange(id) {},
    //媒体设置窗口打开时先预览默认值
    async onMediaDialogOpen() {},
    //当关闭媒体选择窗口的时候 释放预览资源
    onMediaDialogClose() {},
    //保存媒体设置信息
    saveMediaSettings() {},
    //获取设备列表
    async getDeviceList() {},
    //当老师画完一笔  就把当前路径传出去
    onCanvasPathEnd(canvasDataUrl) {},
  },
  computed: {},
  components: { WhiteBoard },
  destroyed() {}
};
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
@import "~@/assets/home.scss";
</style>
