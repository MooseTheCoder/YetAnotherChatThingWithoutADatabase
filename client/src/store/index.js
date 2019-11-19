import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
	  api:'http://192.168.1.91:8081/',
	  jwt:false,
	  username: '',
	  contacts: [],
	  userImages:{
		  'default.jpg':require('@/assets/profile_images/default.jpg'),
		  '1.jpg':require('@/assets/profile_images/1.jpg'),
		  'god.png':require('@/assets/profile_images/god.png')
	  }
  },
  mutations: {
	setJwt(state, payload){
		state.jwt = payload;
	},
	setInChat(state, payload){
		state.inChat = payload;
	},
	setUsername(state, payload){
		state.username = payload;
	},
	setContacts(state, payload){
		state.contacts = payload;
	}
  },
  actions: {
  },
  modules: {
  }
})
