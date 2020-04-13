import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Login from "../views/Login";
import Estimation from "../views/Estimation";

Vue.use(VueRouter);

const routes = [
    {
        path: '/',
        name: 'Оценка занятий',
        component: Home
    },
    {
        path: '/login',
        name: 'Авторизация',
        component: Login
    },
    {
        path: '/estimate',
        name: 'Оценка занятия',
        component: Estimation,
        props: true
    }
];

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
});

export default router
