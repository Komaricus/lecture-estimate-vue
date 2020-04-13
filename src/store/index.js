import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

/* eslint-disable no-new */
const store = new Vuex.Store({
    state: {
        user: {}
    },
    getters: {
        getUser: state => {
            return state.user
        }
    },
    mutations: {
        setUser(state, user) {
            state.user = user;
        }
    }
});

export default store
