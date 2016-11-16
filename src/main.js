require('./assets/css/normalize.css');

import Vue from 'vue';
import App from './App';
import VueSocketio from 'vue-socket.io';
import VueRouter from 'vue-router'

import Login from './components/Login';
import Conversation from './components/Conversation';

Vue.use(VueRouter)

Vue.use(VueSocketio, '//:3000'); // Automatically socket connect from url string

const routes = [
  {
    path: '/',
    redirect: '/conversation'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/conversation',
    component: Conversation,
    meta: { requiresAuth: true }
  }
]

const router = new VueRouter({
  routes // short for routes: routes
})

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // this route requires auth, check if logged in
    // if not, redirect to login page.
    if (!localStorage.getItem('qowala-token')) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else {
    next() // make sure to always call next()!
  }
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  template: '<App/>',
  components: { App },
  router: router
});
