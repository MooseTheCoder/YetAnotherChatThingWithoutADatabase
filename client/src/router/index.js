import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/Login';
import Main from '../views/Main';
import Chat from '../views/Chat';

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'login',
    component: Login
  },
  {
    path: '/main',
    name: 'main',
    component: Main
  },
  {
    path: '/chat/:user',
    name: 'chat',
    component: Chat
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
