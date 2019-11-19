<template>
  <div class="chat">
	  <div class="chat-bar">
		  <div class="chat-bar__back" @click="RouteHome()"><img src="@/assets/interface/arrow-left.svg"></div>
		  <div class="chat-bar__user">{{userName}}</div>
		  <div class="chat-bar__info"><img src="@/assets/interface/info.svg"></div>
	  </div>
	  <div class="image-input-container" v-if="imageInput">
		  <div class="image-input">
			  <div class="image-input-types">
				  <input type="file" ref="imageFile">
				  <!-- <input type="text" placeholder="URL" v-model="activeImageString"> -->
			  </div>
			  <div class="image-input-tools">
				  <button @click="sendImage()">Send Image</button>
				  <img src="@/assets/interface/x.svg" @click="imageInput = false">
			  </div>
		  </div>
	  </div>
	  <div class="messages" ref="messageContainer">
		  <div class="message" :class="message.from == $store.state.username ? 'self': 'from'" v-for="(message, index) in activeMessages" :key="index">
			  <img :src="userImage" class="message__avatar">
			  <div class="message__body">
				  <img class="message__image" :src="message.message" v-if="message.type === 'image'">
				  <div v-html="message.message" v-if="!message.type"></div>
				  <template v-if="message.type === 'text'">{{message.message}}</template>
				  <div class="message__time">
					  <span :class="'message-'+message.time">{{message.time}}</span>
				  </div>
			  </div>
		  </div>
	  </div>
	  <div class="message-tools">
		  <div class="message-tools__image">
			  <img src="@/assets/interface/image.svg" @click="imageInput = true"/>
		  </div>
		  <input type="text" placeholder="Enter your message here" class="message-tools__message" v-model="currentMessage"/>
		  <div class="message-tools__send" @click="sendMessage()">
			  <img src="@/assets/interface/send.svg">
		  </div>
	  </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
	mounted(){
		if(!this.$store.state.jwt){
			this.$router.push('/');
		}
		axios.post(this.$store.state.api+'chat/messages/get/recent',{
			token:this.$store.state.jwt,
			from: this.userName
		}).then(res => {
			if(!res.error){
				this.activeMessages = res.data;
				setTimeout(()=>{
					this.$refs.messageContainer.scrollTop = this.$refs.messageContainer.scrollHeight;
				},500);
			}
		});
		axios.get(this.$store.state.api+'user/profile/'+this.userName).then(res => {
			this.userImage = this.$store.state.userImages[res.data.profile_image];
		});
		this.getLatestMessages();
	},
	beforeDestroy(){
		clearInterval(this.fetchNewInterval);
	},
	data(){
		return{
			userName : this.$route.params.user,
			currentMessage: "",
			activeMessages: [],
			userImage: "",
			fetchNewInterval : null,
			imageInput: false,
			activeImageString:''
		}
	},
	methods:{
		RouteHome : function(){
			this.$router.push('/main');
		},
		getLatestMessages : function(){
			this.fetchNewInterval = setInterval(()=>{
				var postTime = Math.max.apply(Math, this.activeMessages.map(function(message) { return message.time; }));
				axios.post(this.$store.state.api+'chat/messages/get/after',{
					token: this.$store.state.jwt,
					from: this.userName,
					time: postTime
				}).then(res=>{
					var view = document.getElementsByClassName('message-'+postTime)[0];
					var bounding = view.getBoundingClientRect();
					if (bounding.top >= 0 &&bounding.left >= 0 &&bounding.right <= (window.innerWidth || document.documentElement.clientWidth) &&bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight)){
						this.$refs.messageContainer.scrollTop = this.$refs.messageContainer.scrollHeight;
					}
					if(res.data.length !== 0){
						this.activeMessages.push(...res.data);
					}
				})
			},1000);
		},
		sendMessage : function(){
			axios.post(this.$store.state.api+'chat/message/send',{
				token:this.$store.state.jwt,
				to:this.userName,
				content:this.currentMessage,
				type:'text'
			}).then(res => {
				this.currentMessage = "";
				this.activeMessages.push(res.data);
				this.$refs.messageContainer.scrollTop = this.$refs.messageContainer.scrollHeight;
			})
		},
		sendImage : function(){
			var fileReader = new FileReader();
			if(this.$refs.imageFile.files[0]){
				fileReader.onloadend = ()=>{
					var fileBody = fileReader.result;
					axios.post(this.$store.state.api+'images/upload',{
						token:this.$store.state.jwt,
						content:fileBody
					}).then((res) => {
						var filename = res.data.filename;
						axios.post(this.$store.state.api+'chat/message/send',{
							token:this.$store.state.jwt,
							to:this.userName,
							content:this.$store.state.api+'images/serve/'+filename,
							type:'image'
						}).then(res => {
							this.imageInput = false;
							this.activeImageString = "";
							this.activeMessages.push(res.data);
							setTimeout(() => {
								this.$refs.messageContainer.scrollTop = this.$refs.messageContainer.scrollHeight;
							}, 100);
						});
					});
				}
				fileReader.readAsDataURL(this.$refs.imageFile.files[0]);
			}else{
				axios.post(this.$store.state.api+'chat/message/send',{
					token:this.$store.state.jwt,
					to:this.userName,
					content:this.activeImageString,
					type:'image'
				}).then(res => {
					this.imageInput = false;
					this.activeImageString = "";
					this.activeMessages.push(res.data);
				});
			}
		}
	},
}
</script>

<style>

.message__image{
	width: 100%;
}

.image-input-types{
	display: flex;
	flex-direction: column;
}
.image-input-tools{
	display: flex;
}
.image-input-container{
	position: absolute;
	width: 100%;
	height: 90vh;
	background-color: rgba(0,0,0,0);
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	align-content: center;
}
.image-input{
	border: 1px solid black;
	display: flex;
	background-color: white;
	padding: 10px;
	border-radius: 10px;
}
.message-tools__message{
	padding: 5px;
	outline: none;
	border-radius: 5px;
	border: 2px solid gainsboro;
	margin-left: 5px;
	margin-right: 5px;
	flex-grow: 5;
}

.message-tools__image{
	flex-grow: 1;
	display: flex;
	justify-content: center;
	align-content: center;
	align-items: center;
}

.message-tools__send{
	flex-grow: 1;
	display: flex;
	justify-content: center;
	align-content: center;
	align-items: center;
}

.message-tools{
	height: 50px;
	width: 100%;
	border-top: 1px solid gainsboro;
	display: flex;
	justify-content: center;
	align-items: center;
	align-content: center;
}

.message__time{
	margin-top: 5px;
	font-size: 12px;
	color:white;
}
.message{
	display: flex;
	margin-top: 5px;
	align-items: center;
	margin-bottom: 5px;
}

.message.self{
	flex-direction: row-reverse !important;
	margin-right:10px;
}

.message.from{
	flex-direction: row;
}

.message.from .message__body{
	background-color: whitesmoke;
	margin-right: 5px;
	max-width: calc(90vw - 20px);
	color:black;
}

.message.from .message__time{
	color:grey;
}

.message.self .message__avatar{
	display: none !important;
}

.message__avatar{
	width: 40px;
	border-radius:40px;
}
.message__body{
	background-color: #4080fe;
	color:white;
	border-radius: 10px;
	padding: 5px;
	display: flex;
	flex-direction: column;
	margin-left: 5px;
	max-width: 90vw;
	overflow-wrap: break-word;
}

.messages{
	overflow-y: scroll;
	background-color: white;
	width: 100%;
	height: calc(100vh - 106px);
}
.chat{
	display: flex;
	flex-direction: column;
	height: var(--app-height);
}
.chat-bar{
	display: flex;
	height: 50px;
	border-bottom: 1px solid gainsboro;
}

.chat-bar__back{
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 20%;
	cursor: pointer;
}

.chat-bar__user{
	display: flex;
	flex-grow: 4;
	justify-content: center;
	align-content: center;
	align-items: center;
}

.chat-bar__info{
	width: 20%;
	display: flex;
	justify-content:center;
	align-items: center;
	align-content: center;
}
</style>