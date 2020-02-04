import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    roomInfo: {}
  },
  mutations: {
    SET_ROOM_INFO: (state, data) => {
      state.roomInfo = data
    }
  },
  actions: {
    setRoomInfo({
      commit
    }, data) {
      commit('SET_ROOM_INFO', data)
    },
  },
  modules: {
  }
})
