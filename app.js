import Vue from 'vue';
import VueRouter from 'vue-router';
import YmapPlugin from 'vue-yandex-maps';
import Vuex from 'vuex';
import axios from 'axios';//+
axios.defaults.headers.common['Authorization'] = "first";
Vue.use(YmapPlugin);
Vue.use(VueRouter);
Vue.use(Vuex);
//
//
import listPlaceMarks from './pages/listPlaceMarks.vue';
import mainPage from './pages/mainPage.vue';
import registrationPlaceMarks from './pages/registrationPlaceMarks.vue';
import newSearchMap from './pages/newSearchMap.vue';
import API from './API'
import TOKENS from './TOKENS'
// ROUTER
const routes = [
    { path: '/p1', component: listPlaceMarks },
    { path: '/p2', component: mainPage },
    { path: '/p3', component: registrationPlaceMarks },
    { path: '/p4', component: newSearchMap}
]
const router = new VueRouter({
    routes
});
// VUEX
const store = new Vuex.Store({
    
    state: {
        token: localStorage.getItem(TOKENS.AUTHORIZE) || '',
        status: 'error',
        /*
        statusUI_Autorize: 0, 
        
            1 - не авторизован, вход в 2, 3
            2 - открытый интерфейс регистрации, вход в 1, 4
            3 - открытый интерфейс авторизации, вход в 1, 2 , 4
            4 - авторизован, вход в 1
        */
       role: 'Guests'
    },
    getters: {
        isAuthenticated: state => !!state.token,
        authStatus: state => state.status,
        isAuthorise: state => {
          return state.status == 'success'
        }
    },
    actions: {
        [API.AUTH_REQUEST]: ({commit, dispatch}, user) => {
          let context = this;
          return new Promise((resolve, reject) => { // The Promise used for router redirect in login
            commit(API.AUTH_REQUEST123abc)
            axios({url: 'sessionAPI', data: user, method: 'POST' })
              .then(resp => {
                try{
                  if(resp.data.status == "OK"){
                    const acessToken = resp.data.token;
                    const role = resp.data.role;
                    localStorage.setItem(TOKENS.AUTHORIZE, acessToken) // store the token in localstorage
                    axios.defaults.headers.common['Authorization'] = acessToken//применяем токен для каждого следующего запроса
                    const token = acessToken;
                    console.log(token)
                    const obj = {
                      token: acessToken,
                      role: role
                    }
                    commit(API.AUTH_REQUEST123abc, obj)
                  }
                  resolve(resp)
                } catch (e) {
                  alert("app.js actions [API.AUTH_REQUEST] : "+e.message)
                }
              })
            .catch(err => {
              commit(API.AUTH_ERROR123abc, err)
              localStorage.removeItem(TOKENS.AUTHORIZE) // if the request fails, remove any possible user token if possible
              reject(err)
            })
          })
        },
        [API.AUTH_LOGOUT]: ({commit, dispatch}) => {
            return new Promise((resolve, reject) => {
              commit(API.AUTH_LOGOUT123abc)
              localStorage.removeItem(TOKENS.AUTHORIZE)
              axios({url: 'sessionAPI/end', method: 'POST' })
              commit(API.AUTH_ERROR123abc, err)
              //!!!
              //delete axios.defaults.headers.common['Authorization'];//!!!
              //!!!
              resolve("ok");
            })
        },
        [API.REGISTRATION_REQUEST]: ({commit, dispatch}, user) => {
          return new Promise((resolve, reject) => {
            axios({url: 'registerAPI', data: user, method: 'POST' })
              .then(resp => {
                if(resp.data.status == "OK"){
                  const acessToken = resp.data.token;
                  const role = resp.data.role;
                  localStorage.setItem(TOKENS.AUTHORIZE, acessToken) // store the token in localstorage
                  axios.defaults.headers.common['Authorization'] = acessToken//применяем токен для каждого следующего запроса
                  const token = acessToken;
                  //commit(API.AUTH_SUCCESS, {token, role})
                  commit('successdfsdfsdf')
                  resolve(resp)
                }
              })
            .catch(err => {
              commit(API.AUTH_ERROR, err)
              localStorage.removeItem(TOKENS.AUTHORIZE) // if the request fails, remove any possible user token if possible
              reject(err)
            })
          });
        },
        authomaticAuthorise: ({commit, dispatch}) => {
        }
      },
      mutations: {
        [API.AUTH_REQUEST123abc]: (state, obj) => {
          state.status = 'error'
        },
        [API.AUTH_SUCCESS123abc]: (state, {token, role}) => {
          state.status = 'success'
          state.role = role;
          state.token = token;
        },
        [API.AUTH_ERROR123abc]: (state) => {
          state.status = 'error'
          state.role = 'Guests';
        },
      },
  })
// MAIN
new Vue({
    //el: "#app",
    router,
    store,
    data(){
      return {
        showRoutes: true
      }
    },
    async mounted(){
      let saveUser  = localStorage.getItem(TOKENS.SAVEUSER);
      const token = localStorage.getItem(TOKENS.AUTHORIZE)
   /*   alert(token)*/
    /*  alert(!!token && saveUser=="1");*/
      if(!!token && saveUser=="1"){
        axios.defaults.headers.common['Authorization'] = token;
     /*   alert(token)*/
       /* alert('start');*/
        let res = await axios({url: 'sessionAPI/getCurrentRole', method: 'POST' });
        console.log(res.data);
        if(res.data.status == "OK"){
          const role = res.data.role;
     /*    console.log(role)*/
          this.$store.commit(API.AUTH_SUCCESS123abc,{token,role});
        } else {
          this.$store.commit(API.AUTH_ERROR123abc);
          axios.defaults.headers.common['Authorization'] = "first";
        }
      } else {
        this.$store.commit(API.AUTH_ERROR123abc);
        axios.defaults.headers.common['Authorization'] = "first";
      }
    }
}).$mount('#app');
Vue.config.devtools = true;