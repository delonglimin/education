<template>
  <div class="container">
    <div class="top">
      <div class="left">
        <span class="title">ss</span>
        <div class="identity">
          <div>
            <span>ID</span>
            <i>aa</i>
          </div>
        </div>
      </div>
      <div class="right">
        <span
          class="time"
          v-show="videoFlag && curRole=='teacher'"
        >{{classDuration | secoendToTime}}</span>
        <el-button
          size="mini"
          type="success"
          round
          :loading="startLoadingStatus"
          @click="startClass"
          v-show="curRole=='teacher'"
        >{{videoFlag ? '下课' : '开始上课'}}</el-button>
        <el-button
          size="mini"
          type="warning"
          round
          @click="pushHand"
          v-show="videoFlag && curRole=='teacher'"
        >{{handFlag ? '禁止举手' : '允许举手'}}</el-button>
        <el-button
          size="mini"
          type="warning"
          round
          v-show="curRole!='teacher' && handFlag && classState == '2'"
        >{{applyRtcIng?'等待回应':isRtc?'上麦中(关闭)':'举手上麦'}}</el-button>
        <div class="user-box">
          <el-popover trigger="hover">
            <i class="el-icon-setting set" slot="reference"></i>
            <div class="down-box">
              <div class="user-top">
                <span>
                  <em>ss</em>
                 aa
                </span>
              </div>
              <div class="user-down">
                <div class="section" @click="dialogMediaVisible = true">
                  <div class="bg">
                    <i class="el-icon-picture-outline"></i>
                  </div>
                  <p>媒体设置</p>
                </div>
                <div class="section" @click="logout" v-if="authToken==''">
                  <div class="bg">
                    <i class="el-icon-news"></i>
                  </div>
                  <p>角色退出</p>
                </div>
              </div>
            </div>
          </el-popover>
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
                <el-option
                  v-for="item in cameraList"
                  :key="item.deviceId"
                  :label="item.label"
                  :value="item.deviceId"
                ></el-option>
              </el-select>
            </div>
            <div class="media_item">
              <label>麦克风:</label>
              <el-select v-model="curMic" v-on:change="onMicChange">
                <el-option
                  v-for="item in micList"
                  :key="item.deviceId"
                  :label="item.label"
                  :value="item.deviceId"
                ></el-option>
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
      <div class="left" v-if="curRole=='teacher'">
        <ul class="edu-interact-slider">
          <li :class="{active:curMain == 'doc'}" @click="startDoc">
            <i class="el-icon-document"></i>
            <span>{{curDoc&&curMain == 'doc'?'切换':'文档'}}</span>
          </li>
          <li :class="{active:curMain == 'whiteBoard'}" @click="startBoard">
            <i class="el-icon-edit-outline"></i>
            <span>黑板</span>
          </li>
          <li :class="{active:curMain == 'desk'}" @click="startDesk">
            <i class="el-icon-picture-outline"></i>
            <span>桌面</span>
          </li>
        </ul>
      </div>
      <div class="mid">
        <div class="file_choose" v-show="curMain == 'doc' && !curDoc" v-if="curRole == 'teacher'">
          <img src="@/assets/entry.png">
          <el-button size="mini" type="success" round @click="dialogFormVisible = true">选择文档</el-button>
        </div>

        <div class="doc_share" v-show="curMain == 'doc' && curDoc">
          <el-carousel
            :autoplay="false"
            :arrow="curRole == 'teacher'?'always':'never'"
            height="100%"
            indicator-position="none"
            :loop="false"
            v-on:change="onPptChange"
            ref="pptlist"
          >
            <el-carousel-item v-for="(item,index) in pptList" :key="index">
              <div class="picItem">
                <img :src="item">
              </div>
            </el-carousel-item>
          </el-carousel>
          <div class="white_board" v-show="curMain == 'doc' && curDoc">
            <WhiteBoard
              class="board1"
              id="board2"
              ref="pptCanvas"
              :edit="curRole == 'teacher'"
              v-on:onPathEnd="onCanvasPathEnd"
            ></WhiteBoard>
          </div>
          <div class="doc_right" v-if="curRole == 'teacher'">
            <el-scrollbar style="height:100%" id="ppt_scroll">
              <transition name="el-zoom-in-center">
                <div class="ppt_list" v-show="pptListFlag">
                  <div
                    class="ppt_item"
                    v-for="(item,index) in pptList"
                    :key="index"
                    @click="choosePpt(index)"
                  >
                    <img :src="item">
                  </div>
                </div>
              </transition>
            </el-scrollbar>

            <span class="changeFlag" @click="pptListFlag = !pptListFlag">
              <i class="el-icon-d-arrow-right main_clolor"></i>
            </span>
          </div>
        </div>
        <div class="white_board" v-show="curMain == 'whiteBoard'">
          <WhiteBoard
            class="board1"
            ref="whiteBoardCanvas"
            id="board1"
            :edit="curRole == 'teacher'"
            v-on:onPathEnd="onCanvasPathEnd"
          ></WhiteBoard>
        </div>
        <div class="desk_share" v-show="curMain == 'desk'">
          <div class="file_choose">
            <img src="@/assets/entry.png">
            <span class="info">老师正在使用桌面共享…</span>
          </div>
        </div>
        <div
          class="info_tips"
          v-show="(classState == '1' || classState == '3') && curRole != 'teacher'"
        >
          <div class="file_choose">
            <img src="@/assets/entry.png">
            <span class="info">{{classState =='1'?'还没开始上课':'下课了'}}</span>
          </div>
        </div>
        <el-dialog
          title="文档"
          :visible.sync="dialogFormVisible"
          custom-class="file_dialog"
          v-if="curRole=='teacher'"
          v-on:opened="onFileDialogOpen"
          v-on:close="onFileDialogClose"
        >
          <div class="file_top clearfix">
            <div class="fl">
              <el-input
                placeholder="请输入文档名称"
                v-model="docName"
                class="input-with-select"
                @keyup.native.enter="searchDoc"
              >
                <el-button slot="append" icon="el-icon-search" @click="searchDoc"></el-button>
              </el-input>
            </div>
            <div class="fr">
              <el-upload
                class="upload_btn"
                accept=".doc, .docx, .ppt, .pptx, .pdf, .txt"
                :show-file-list="false"
                :on-progress="uploadProgress"
                :on-success="uploadSuccess"
                :before-upload="beforeUpload"
                :data="{'user_token':$store.state.token,'classroom_id':roomId}"
                action="https://gateway.class.deerlive.com/V2/Upfile/class_file_did"
              >
                <el-button
                  type="warning"
                  icon="el-icon-upload"
                  size="small"
                  :disabled="uploadText != '上传'"
                >{{uploadText}}</el-button>
              </el-upload>

              <el-button
                type="warning"
                icon="el-icon-delete"
                size="small"
                :disabled="fileSelected.length==0"
                @click="delSelectFile"
              >删除</el-button>
            </div>
          </div>
          <div class="file_table">
            <el-table
              :data="fileList"
              height="350"
              border
              style="width: 100%"
              highlight-current-row
              @selection-change="handleSelectionChange"
            >
              <el-table-column type="selection" width="50"></el-table-column>
              <el-table-column prop="old_name" label="名称"></el-table-column>
              <el-table-column label="上传时间" width="150">
                <template slot-scope="scope">{{scope.row.create_at | secoendToDate}}</template>
              </el-table-column>
              <el-table-column prop="word_page" label="页数" width="50"></el-table-column>
              <el-table-column label="转码" width="100">
                <template slot-scope="scope">{{scope.row.convert_status == 2 ? '转码成功':'转码中……'}}</template>
              </el-table-column>
              <el-table-column label="操作" width="200">
                <template slot-scope="scope">
                  <el-button
                    size="mini"
                    @click="handleEdit(scope.$index)"
                    v-show="scope.row.convert_status == 2"
                  >演示</el-button>
                  <el-button size="mini" @click="handleCopy($event,scope.$index)">下载地址(复制)</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-dialog>
        <div class="rtcList" id="rtcList" v-show="isRtc">
          <div id="rtcItemControl" v-show="rtcContorl">
            <i class="fas fa-phone-slash tool-item" title="下麦"></i>
            <!-- <i class="fas fa-microphone-alt-slash tool-item" @click="toolMute" title="静音"></i> -->
          </div>
        </div>
      </div>
      <div class="right">
        <div class="right_top">
          <div class="teacher-placeholder" ref="r_t_video">
            <img src="@/assets/user.png" v-show="!videoFlag">
            <div v-show="curRole!='teacher' && classState == 2" class="flvContainer">
              <video id="videoElement" ></video>
              <i class="fas fa-play" v-show="!isPlaying" style="height:20px;width:20px;position:absolute;top:0;left:0;bottom:0;right:0;margin:auto;color:#fff;font-size:20px;cursor:pointer" @click="doPlayAction"></i>
              <div class="tools" v-show="isPlaying">
                <el-tooltip class="item" effect="dark" content="全屏" placement="right">
                  <i class="fas fa-arrows-alt tool-item" ></i>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" content="上讲台" placement="right">
                  <i class="far fa-window-restore tool-item" v-if="false"></i>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" content="新窗口" placement="right">
                  <i class="fas fa-object-group tool-item" ></i>
                </el-tooltip>
              </div>
            </div>
          </div>
        </div>
        <div class="right_chat">
          <p class="notice" v-show="showNotice" v-html="tempNotice"></p>
          <el-tabs v-model="curTab" stretch id="mytabs" @tab-click="onTabClick">
            <el-tab-pane label="讨论" name="first">
              <div class="chat_list">
                <el-scrollbar style="height:100%" id="chat_scroll">
                  <ul>
                    <li v-for="(item, index) in chatList" :key="index" class="clearfix">
                      <div class="user fr teacher">
                        <i
                          class="fas fa-user-graduate ico"
                          v-if="curRole!='student' && item.name == $store.state.userInfo.user_name"
                        ></i>
                        <i class="fas fa-user ico" v-else></i>
                      </div>
                      <div class="msg fr">
                        <div class="title">{{item.name}}</div>
                        <div class="content" v-html="item.mes"></div>
                      </div>
                    </li>
                  </ul>
                </el-scrollbar>
              </div>
            </el-tab-pane>
            <el-tab-pane :label="'成员('+userList.length+')'" name="second">
              <div class="chat_list user_list">
                <el-scrollbar style="height:100%">
                  <ul>
                    <li v-for="(item, index) in userList" :key="index" class="clearfix user-item">
                      <div
                        :class="(item.name == $store.state.initInfo.teacher_info.name)?'user fl teacher':'user fl'"
                      >
                        <i
                          class="fas fa-user-graduate ico"
                          v-if="(item.name == $store.state.initInfo.teacher_info.name)"
                        ></i>
                        <i class="fas fa-user ico" v-else></i>
                      </div>
                      <span class="name">{{item.name}}</span>
                      <div class="fr more">
                        <el-popover v-show="curRole!='student' && item.haveRTC" trigger="hover">
                          <el-button size="mini" round @click="RTCAgree(item.name)">同意</el-button>
                          <el-button size="mini" round @click="RTCRefuse(item.name)">拒绝</el-button>
                          <i class="far fa-hand-paper" slot="reference"></i>
                        </el-popover>

                        <el-popover
                          v-show="curRole!='student' && item.name != $store.state.userInfo.user_name"
                          trigger="hover"
                        >
                          <el-button size="mini" round @click="jinyanUser(item.name)">禁言</el-button>
                          <el-button size="mini" round @click="kickOutUser(item.name)">踢出</el-button>
                          <i class="el-icon-more" slot="reference"></i>
                        </el-popover>
                      </div>
                    </li>
                  </ul>
                </el-scrollbar>
              </div>
            </el-tab-pane>
            <el-tab-pane label="公告" name="third">
              <div class="chat_list notice_list">
                <el-scrollbar style="height:100%" id="notice_scroll">
                  <ul>
                    <li v-for="(item, index) in noticeList" :key="index" class="clearfix">
                      <div class="user fr teacher">
                        <i class="fas fa-user-graduate"></i>
                      </div>
                      <div class="msg fr">
                        <div class="title">{{item.name}}</div>
                        <div class="content" v-html="item.mes"></div>
                      </div>
                    </li>
                  </ul>
                </el-scrollbar>
              </div>
            </el-tab-pane>

            <el-tab-pane label="禁言" name="forth" v-if="curRole!='student'">
              <div class="chat_list user_list">
                <el-scrollbar style="height:100%">
                  <ul>
                    <li
                      v-for="(item, index) in jinyanUserList"
                      :key="index"
                      class="clearfix user-item"
                    >
                      <div class="user fl">
                        <i class="fas fa-user ico"></i>
                      </div>
                      <span class="name">{{item.name}}</span>
                      <div class="fr">
                        <el-button size="mini" round @click="cancelJinyanUser(item.name)">取消禁言</el-button>
                      </div>
                    </li>
                  </ul>
                </el-scrollbar>
              </div>
            </el-tab-pane>

            <el-tab-pane label="踢出" name="fifth" v-if="curRole!='student'">
              <div class="chat_list user_list">
                <el-scrollbar style="height:100%">
                  <ul>
                    <li
                      v-for="(item, index) in kickOutUserList"
                      :key="index"
                      class="clearfix user-item"
                    >
                      <div class="user fl">
                        <i class="fas fa-user ico"></i>
                      </div>
                      <span class="name">{{item.name}}</span>
                      <div class="fr">
                        <el-button size="mini" round @click="cancelKickOutUser(item.name)">取消踢出</el-button>
                      </div>
                    </li>
                  </ul>
                </el-scrollbar>
              </div>
            </el-tab-pane>
          </el-tabs>
          <div class="right_bottom" v-show="curTab == 'first' || curRole!='student'">
            <div>
              <div class="clearfix" style="position:relative">
                <i class="far fa-smile icon-biaoqing_icon fl" @click="emoji = !emoji"></i>
                <div class="fr close-chat clearfix" v-if="curRole!='student'">
                  <span>全体禁言</span>
                  <el-switch active-color="#4bc388" v-model="chat_off" v-on:change="chatSwitch"></el-switch>
                </div>
                <VueEmoji @emotion="onInput" v-show="emoji" ref="emoji"/>
              </div>
              <div class="write-box clearfix">
                <input
                  :placeholder="(curRole == 'student' && chat_off ||disable_chat)?'老师开启了禁言':'按Enter发送消息'"
                  class="fl text"
                  v-model="chat_input"
                  @keyup.enter="send"
                  :disabled="curRole == 'student' && chat_off ||disable_chat"
                >
                <button
                  :class="chat_input.length > 0 ? 'fl send active' : 'fl send'"
                  @click="send"
                >发送</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import VueEmoji from "@/components/emoji";
import WhiteBoard from "@/components/whiteBoard";
import { validateEmpty, isEmptyObject } from "@/utils/validate";
import {
    MessageBox
} from 'element-ui'
export default {
  name: "Home",
  data() {
    return {
      roomId: this.$route.query.roomid || "",
      authToken: this.$route.query.auth_token || "",
      chat_input: "", //聊天输入框
      chat_off: false,
      disable_chat: false,
      handFlag:false, //允许举手
      emoji: false, //是否显示表情
      curRole: "teacher", //teacher  student
      classState: 2, //1：预告 2:上课中 3:已下课 4:回放
      curTab: "first", //右侧聊天当前选项卡
      docName: "", //文档搜索名称
      uploadText: "上传", //文档上传提示
      dialogFormVisible: false, //文档窗口是否显示
      dialogMediaVisible: false, //媒体设置窗口是否显示
      curMain: "doc", //当前主窗口显示内容
      curDoc: false, //当前是否有演示文档
      pptListFlag: false, //ppt是否显示
      startLoadingStatus: false, //开始上课加载状态
      videoFlag: false, //是否开始上课
      chatList: [], //聊天信息列表
      userList: [], //用户列表
      jinyanUserList: [], //禁言用户列表
      kickOutUserList: [], //踢出用户列表
      noticeList: [], //公告列表
      cameraList: [], //摄像头列表
      micList: [], //麦克风列表
      curCamera:"", //当前摄像头
      curMic: "", //当前麦克风
      classDuration:  0, //上课持续时间
      fileList: [], //文档列表
      pptList: [], //ppt 数据
      pptListCanvas: [], //存储每个ppt对应的canvas
      curPpt: 0, //当前选中ppt
      roomToken:"", //rtc房间加入token
      applyRtcIng: false, //是否正在申请连麦
      fileSelected: [], //当前选中的文档列表  删除操作 用
      isRtc: false, //是否正在连麦
      rtcContorl: false, //rtc 当前连麦控制按钮显示与否
      showNotice:false,//是否显示notice
      tempNotice:'',//当前最后显示的notice
      isPlaying:false,//当前视频是否在播放
    };
  },

  watch: {
   
  },
  mounted() {
    this.initWs();
  },
  methods: {
   
    //文档窗口打开 请求文档列表
    onFileDialogOpen() {
     
    },
    //文档窗口关闭  取消检查转码定时器
    onFileDialogClose() {
     
    },
    //获取文档
    getClassFileList() {
     
    },
    //文档选择回调
    handleSelectionChange(val) {
      
    },
    //删除所选的文档
    delSelectFile() {
    },
    //初始化websocket
    initWs() {
      
    },
    
    //私聊
    sendPri() {
      
    },
    //公聊
    sendPub(mes) {
      
    },
    showNoticeM(mes){
     
    },
    //收到房间消息
    onPublicMessage(data) {
     
    },
    onJoinSuccess(data) {
    },
    onUserJoin(data) {
     
    },
    onUserExit(data) {
      
    },
    //学生接受都老师切换ppt等动作
    onStateChange(data) {
    
    },
    //画布更新
    onCanvasUpdate(canvasUrl) {
      
    },
    //接收命令回调
    onCommand(extras, name) {
     
    },
    
    //选中表情后回调
    onInput(item, i) {
      
    },
    //聊天发送按钮
    send() {
      
    },
    //发送讲师当前的课堂状态
    sendCurrentState() {
     
    },
    
    uploadProgress(event, file, fileList) {
     
    },
    uploadSuccess(response, file, fileList) {
     
    },
    beforeUpload(file) {
    },
    //选择文档开始演示
    async handleEdit(index) {
      
    },
    handleCopy(event, index) {
      
    },
    //文档搜索
    searchDoc() {
      
    },
    //ppt切换回调 设置每个ppt对应的canvas
    onPptChange(nowIndex, oldIndex) {
      
    },
    //选择ppt回调
    choosePpt(index) {
    },
    //退出
    logout() {
    },
    //聊天自动滚到最底层
    scroll(id) {
      
    },
    //刷新rtctoken 当老师在页面 多次上课下课的操作
    refreshRtcToken() {
      
    },
    //开始上课按钮
    async startClass() {
      
    },
    //rtc 推流发布
    async startPublish() {
     
    },
    rtcCallback(type, track) {
      
    },
    //申请连麦同意后  加入rtc
    async startRTCByOther() {
    },
    //播放rtc视频 flag  表示是否是追加元素//trackInfoList是包含自己以外的track  包含老师  老师要显示在右上角 其他要显示在中上面
    playOtherRtc(trackInfoList, flag) {
    },
    onTrackAdd(trackInfoList) {
    },
    onTrackRemove(tracks) {
      
    },
    //播放rtmp
    startPlayRtmp(url) {
    
    },
    doPlayAction(){
      
    },
    //rtc释放
    async releaseTracks() {
      
    },
    //开启顶部的上课时间显示
    startClassTimer() {
    },
    //播放本地多媒体数据轨道
    play(localTracks) {
    },
    //点击左侧桌面
    async startDesk() {
    },
    //点击左侧画板
    startBoard() {
     
    },
    //点击左侧文档
    startDoc() {
     
    },
    //取消发布桌面共享数据流 发布摄像头  必须得先发布  在取消  不然中间流会断 
    async unpublishTrack() {
     
    },
    //媒体设置切换camera
    onCameraChange(id) {
     
    },
    //媒体设置切换mic
    onMicChange(id) {
    },
    //媒体设置窗口打开时先预览默认值
    async onMediaDialogOpen() {
     
    },
    //当关闭媒体选择窗口的时候 释放预览资源
    onMediaDialogClose() {
     
    },
    //保存媒体设置信息
    saveMediaSettings() {
     
    },
    //获取设备列表
    async getDeviceList() {
    },
    //举手操作
    pushHand() {
      
    },
    //禁言开关
    chatSwitch(value) {
     
    },
    
    //当老师画完一笔  就把当前路径传出去
    onCanvasPathEnd(canvasDataUrl) {
     
    },
    //右下角tabs点击事件
    onTabClick() {
      switch (this.curTab) {
      }
    },
  },
  computed: {},
  components: { VueEmoji, WhiteBoard },
  destroyed() {
  }
};
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
@import "~@/assets/home.scss";
</style>
