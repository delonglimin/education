<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: "app"
};
</script>

<style lang="scss">
html,
body,
#app {
  height: 100%;
}
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  outline: none;
}
.blue {
  color: #409eff;
}
.success {
  color: #52cc90;
}
.warning {
  color: #e6a23c;
}
.danger {
  color: #f56c6c;
}
.info {
  color: #909399;
}
.bluebg {
  background-color: #409eff;
}
.successbg {
  background-color: #52cc90;
}
.warningbg {
  background-color: #e6a23c;
}
.dangerbg {
  background-color: #f56c6c;
}
.infobg {
  background-color: #909399;
}
#app .el-scrollbar__wrap {
  overflow-x: hidden;
}
#app .clearfix:after {
  content: "";
  display: table;
  clear: both;
}
#app .fl {
  float: left;
}
#app .fr {
  float: right;
}
#app textarea {
  resize: none;
}

</style>
