<template>
	<div class="main-page">
		<div class="user-list">
			<User v-for="(user,id) in $store.state.contacts" @initUserChat="openUserChat(user)" :user="user" :key="'user'+id" />
		</div>
		<div class="user-tools">
		</div>
	</div>
</template>

<script>
import axios from 'axios';
import User from '@/components/User';
export default {
	components:{
		User
	},
	mounted(){
		if(this.$store.state.jwt === false){
			this.$router.push('/');
		}
		axios.post(this.$store.state.api+'user/contacts/get',{
			token: this.$store.state.jwt
		}).then(response => {
			this.$store.commit('setContacts', response.data);
		});
	},
	methods :{
		openUserChat : function(user){
			this.$router.push('/chat/'+user);
		}
	}
}
</script>

<style>
.user-tools{
	height:50px;
	border-top: 2px solid gainsboro;
	width: 100%;
}
.main-page{
	display: flex;
	flex-direction: column;
	width: 100%;
	height: var(--app-height);
}
.user-list{
	width: 100%;
	height: calc(var(--app-height) - 50px);
}
</style>