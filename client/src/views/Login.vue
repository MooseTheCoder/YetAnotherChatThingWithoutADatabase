<template>
  <div class="login">
	  <h1>Talkr</h1>
	  <input type="text" placeholder="Username" v-model="user.username">
	  <input type="password" placeholder="Password" v-model="user.password">
	  <button @click="login()">Login</button>
  </div>
</template>

<script>
import axios from 'axios';
export default {
	data(){
		return {
			user:{
				username:'',
				password: ''
			}
		}
	},
	methods:{
		login : function(){
			axios.post(this.$store.state.api+'user/login',{
				username:this.user.username,
				password:this.user.password
			}).then((response)=>{
				if(response.data.error){
					alert(response.data.error);
				}else{
					this.$store.commit('setJwt', response.data.jwt);
					this.$store.commit('setUsername',this.user.username);
					this.$router.push('main')
				}
			})
		}
	}
}
</script>

<style>
.login{
	width: 100%;
	flex-direction: column;
	justify-content: center;
	align-content: center;
	align-items: center;
	display:flex;
}

</style>