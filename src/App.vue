<template>
    <v-app>
        <v-app-bar app color="#003AAB" dark fixed>
            <v-btn v-if="$route.name !== 'Оценка занятий'" icon to="/">
                <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <v-toolbar-title>{{$route.name}}</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn v-if="$route.name === 'Оценка занятий'" outlined to="/login">Войти</v-btn>
        </v-app-bar>

        <v-content>
            <v-container fluid>
                <router-view></router-view>
            </v-container>
        </v-content>

    </v-app>
</template>
