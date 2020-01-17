<template>
  <div class="board_c">
    <div class="toobar" v-if="this.edit">
      <div class="toollist">
        <el-popover placement="bottom">
          <el-slider v-model="pencilSize" :show-tooltip="false"></el-slider>
          <i @click="curTool=1" :class="[{ success: curTool==1 }, 'fas','fa-pen']" slot="reference"></i>
        </el-popover>
        <el-popover placement="bottom">
          <div>
            <i @click="curColor='blue'" class="color_item bluebg"></i>
            <i @click="curColor='success'" class="color_item successbg"></i>
            <i @click="curColor='warning'" class="color_item warningbg"></i>
            <i @click="curColor='danger'" class="color_item dangerbg"></i>
            <i @click="curColor='info'" class="color_item infobg"></i>
          </div>
          <i :class="[curColor,'fas','fa-palette']" slot="reference"></i>
        </el-popover>
        <i
          @click="curTool=2"
          :class="[{ success: curTool==2 },'fas', 'fa-external-link-square-alt']"
        ></i>
        <i @click="curTool=3" :class="[{ success: curTool==3 },'far', 'fa-square']"></i>
        <el-popover placement="bottom">
          <el-slider v-model="eraserSize" :show-tooltip="false"></el-slider>
          <i
            @click="curTool=4"
            :class="[{ success: curTool==4 },'fas', 'fa-eraser']"
            slot="reference"
          ></i>
        </el-popover>

        <i @click="doDel()" :class="[{ success: curTool==5 },'far', 'fa-trash-alt']"></i>
        <i @click="doSave()" :class="[{ success: curTool==6 },'fas', 'fa-save']"></i>
      </div>
    </div>
    <canvas :id="id+'_canvas'" class="main_canvas"></canvas>
  </div>
</template>

<script>
export default {
  name: "WhiteBoard",
  props: {
    id: {
      type: String,
      required: true
    },
    edit: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      pencilSize: 30,
      eraserSize: 50,
      curColor: "success", //blue  success warning danger info
      colorList: {
        blue: "#409EFF",
        success: "#52cc90",
        warning: "#E6A23C",
        danger: "#F56C6C",
        info: "#909399"
      },
      curTool: 1, //1 铅笔2 直线 3 square 4 eraser
      canvas: null,
      ctx: null,
      lastX: 0,
      lastY: 0,
      scaleW: 1,
      scaleH: 1,
      curPathData: []
    };
  },
  methods: {
    doDel() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    doSave() {
      var url = this.canvas.toDataURL("image/png");
      var a = document.createElement("a");
      var event = new MouseEvent("click");
      a.download = Date.now();
      a.href = url;
      a.dispatchEvent(event);
    },
    getCurCanvasData() {
      return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    },
    getCurCanvasUrl() {
      return this.canvas.toDataURL();
    },
    drawCanvasData(imageDataUrl) {
      var _this = this;
      var img = new Image();
      img.onload = function() {
        _this.doDel()
        _this.ctx.drawImage(
          img,
          0,
          0,
          img.width,
          img.height,
          0,
          0,
          _this.canvas.width,
          _this.canvas.height
        );
      };
      img.src = imageDataUrl;
    },
    setCurCanvasData(ImgData) {
      this.doDel();
      if (ImgData == undefined) return;
      this.ctx.putImageData(ImgData, 0, 0);
    },
    setContext(ctx) {
      this.ctx.lineWidth = this.pencilSize / 10;
      this.ctx.strokeStyle = this.colorList[this.curColor];
      this.ctx.lineCap = "round";
      this.ctx.lineJoin = "round";
      if (this.curTool == 4) {
        this.ctx.globalCompositeOperation = "destination-out";
        this.ctx.lineWidth = this.eraserSize;
      } else {
        this.ctx.globalCompositeOperation = "source-over";
      }
    },
    resizeCanvas() {
      this.canvas.width = window.innerWidth - 320 - 64; //设置全屏占用宽高
      this.canvas.height = window.innerHeight - 50;
    },
    initCanvas() {
      var _this = this;
      let beginDraw = false;
      let ctx = this.ctx;
      let canvas = this.canvas;
      if (!this.edit) {
        return;
      }
      canvas.onmousedown = function(e) {
        this.lastX = e.offsetX;
        this.lastY = e.offsetY;
        beginDraw = true;
        _this.setContext(ctx);
        _this.curImgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      };
      canvas.onmousemove = function(e) {
        if (beginDraw) {
          switch (_this.curTool) {
            case 1:
              ctx.beginPath();
              ctx.moveTo(this.lastX, this.lastY);
              ctx.lineTo(e.offsetX, e.offsetY);
              ctx.stroke();
              this.lastX = e.offsetX;
              this.lastY = e.offsetY;
              break;
            case 2:
              _this.doDel();
              ctx.putImageData(_this.curImgData, 0, 0);
              ctx.beginPath();
              ctx.moveTo(this.lastX, this.lastY);
              ctx.lineTo(e.offsetX, e.offsetY);
              ctx.stroke();
              break;
            case 3:
              _this.doDel();
              ctx.putImageData(_this.curImgData, 0, 0);
              ctx.beginPath();
              ctx.rect(
                this.lastX,
                this.lastY,
                e.offsetX - this.lastX,
                e.offsetY - this.lastY
              );
              ctx.stroke();
              break;
            case 4:
              ctx.beginPath();
              ctx.moveTo(this.lastX, this.lastY);
              ctx.lineTo(e.offsetX, e.offsetY);
              ctx.stroke();
              this.lastX = e.offsetX;
              this.lastY = e.offsetY;
              break;
          }
        }
      };
      canvas.onmouseup = function() {
        beginDraw = false;
        _this.$emit("onPathEnd", _this.getCurCanvasUrl());
      };
    }
  },
  mounted: function() {
    this.canvas = document.getElementById(this.id + "_canvas");
    this.ctx = this.canvas.getContext("2d");
    this.resizeCanvas();
    this.initCanvas();
  }
};
</script>
<style scoped lang="scss">
$bg: #404248;
.board_c {
  height: 100%;
  position: relative;
  .main_canvas {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0px;
  }
  .toobar {
    text-align: center;
    position: relative;
    .toollist {
      display: inline-block;
      padding: 5px;
      background-color: $bg;
      margin: auto;
      font-size: 25px;
      color: #fff;
      margin-top: 10px;
      position: relative;
      z-index: 5;
      i {
        margin: 5px;
        cursor: pointer;
      }
    }
  }
}
.color_item {
  width: 20px;
  height: 20px;
  display: inline-block;
  margin: 5px;
  cursor: pointer;
}
</style>
