<template>
  <div class="user" @click="$emit('initUserChat')">
	  <div class="user__image__holder">
		  <img :src="userImage" class="user__image" />
	  </div>
	  <div class="user__details">
		  <div class="user__name">{{userName}}</div>
		  <div class="user__recent" style="opacity:0.3;">{{recent}}</div>
	  </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
	mounted(){
		this.getUserData();
		this.userName = this.user;
		this.getLastMessage();
	},
	data(){
		return {
			userImage : this.$store.state.userImages['default.jpg'],
			userName:'',
			recent: 'loading...'
		}
	},
	methods:{
		getUserData : async function(){
			var userData = await fetch(this.$store.state.api+'user/profile/'+this.user);
			var userData = await userData.json();
			if(!userData.error){
				this.userImage = this.$store.state.userImages[userData.profile_image];
			}
		},
		getLastMessage : function(){
			axios.post(this.$store.state.api+'chat/messages/get/last',{
				token: this.$store.state.jwt,
				from: this.userName
			}).then(res=>{
				var data = res.data;
				if(data.type === "text"){
					this.recent = data.message;
				}
				if(data.type === "image"){
					this.recent = "Image";
				}
			});
		}
	},
	props:{
		user:String
	}
}
</script>

<style>
.user__image{
	background-color: red;
	width: 60px;
	height: 60px;
	border-radius: 100px;
	margin-left: 10px;
	margin-right: 10px;
}

.user{
	display: flex;
	padding-bottom:20px;
	align-items: center;
	padding-top:20px;
	width: 100%;
	border-bottom: 1px solid gainsboro;
	cursor: pointer;
}

.user:hover{
	background-color: ghostwhite;
}
</style>