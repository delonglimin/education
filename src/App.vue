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
</style>
