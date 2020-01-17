<template>
  <div class="loginContainer">
    <div class="left">
      <i class="el-icon-s-help pic"></i>
    </div>
    <div class="right">
      <el-row class="form">
        <el-col :span="12" :offset="6">
          <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
            <el-form-item label="姓名:" prop="name">
              <el-input v-model="ruleForm.name"></el-input>
            </el-form-item>
            <el-form-item label="房间:" prop="room">
              <el-input v-model="ruleForm.room"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitForm('ruleForm')">进入</el-button>
              <el-button @click="resetForm('ruleForm')">重置</el-button>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      ruleForm: {
        name: "",
        room:""
      },
      rules: {
        name: [{ required: true, message: "请输入姓名", trigger: "blur" }],
        room: [
          { required: true, message: "请输入房间号", trigger: "blur" },
          { type: "number", message: "房间号必须为数字值" }
        ]
      }
    };
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          alert("submit!");
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    }
  }
};
</script>

<style scoped lang="scss">
.loginContainer {
  display: flex;
  justify-content: center;
  flex-direction: row;
  height: 100%;
  .left {
    background: $primary;
    flex-grow: 1;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
    flex-basis:0;
    .pic {
      font-size: 150px;
      color: white;
      position: absolute;
    }
  }
  .right {
    flex-grow: 1;
    height: 100%;
    flex-basis:0;
    display: flex;
    align-items: center;
    .form {
      width: 100%;
    }
  }
}
</style>
