<template>
    <v-card width="600" class="mx-auto mt-10">
        <v-tabs
                background-color="#003AAB"
                dark
                grow
                v-model="tab"
        >
            <v-tab>
                Студент
            </v-tab>
            <!--            <v-tab disabled>-->
            <!--                Группа-->
            <!--            </v-tab>-->
            <v-tab-item>
                <v-card flat tile>
                    <v-card-text v-if="user !== null">
                        <p>Вы уже вошли как:</p>
                        <div class="d-flex">
                            <v-list-item-avatar
                                    color="#003AAB"
                                    class="white--text"
                            >
                                {{ user.label.charAt(0) + user.label.charAt(user.label.indexOf(' ')+1) }}
                            </v-list-item-avatar>
                            <v-list-item-content>
                                <v-list-item-title>{{user.label}}</v-list-item-title>
                                <v-list-item-subtitle>{{user.description}}</v-list-item-subtitle>
                            </v-list-item-content>
                        </div>
                        <div class="d-flex">
                            <v-spacer></v-spacer>
                            <v-btn style="color: #fff;" color="#003AAB" @click="deleteUser"
                                   class="text-right">Выйти
                            </v-btn>
                        </div>
                    </v-card-text>
                    <v-card-text v-else>
                        <p>Введите ФИО:</p>
                        <v-autocomplete
                                v-model="model"
                                :items="items"
                                :loading="isLoading"
                                :search-input.sync="search"
                                hide-no-data
                                hide-selected
                                item-text="label"
                                item-value="id"
                                placeholder="Фамилия Имя Отчество"
                                return-object
                        >
                            <template v-slot:item="{ item }">
                                <v-list-item-avatar
                                        color="#003AAB"
                                        class="white--text"
                                >
                                    {{ item.label.charAt(0) + item.label.charAt(item.label.indexOf(' ')+1) }}
                                </v-list-item-avatar>
                                <v-list-item-content>
                                    <v-list-item-title>{{item.label}}</v-list-item-title>
                                    <v-list-item-subtitle>{{item.description}}</v-list-item-subtitle>
                                </v-list-item-content>
                            </template>
                        </v-autocomplete>
                        <div class="d-flex">
                            <v-spacer></v-spacer>
                            <v-btn :disabled="model === null" style="color: #fff;" color="#003AAB" @click="saveUser"
                                   class="text-right">Запомнить
                            </v-btn>
                        </div>
                    </v-card-text>
                </v-card>
            </v-tab-item>
            <!--            <v-tab-item>-->
            <!--                <v-card flat tile>-->
            <!--                    <v-card-text>-->
            <!--                        <p>Введите номер группы:</p>-->
            <!--                    </v-card-text>-->
            <!--                </v-card>-->
            <!--            </v-tab-item>-->
        </v-tabs>
    </v-card>
</template>

<script>
    import axios from "axios";

    const api = require("@/config.json");

    export default {
        name: "Login",
        data() {
            return {
                tab: 0,
                isLoading: false,
                model: null,
                search: null,
                items: [],
                user: null
            }
        },
        created() {
            this.user = JSON.parse(this.$cookie.get('user'));
        },
        watch: {
            search(val) {
                if (this.model !== null && val === this.model.label) return;

                if (val === "" || val === null || val === undefined) {
                    this.items = [];
                    this.model = null;
                    return;
                }

                this.isLoading = true;
                axios.get(`${api.back}/students?search=${val}`).then(response => {
                    if (response.status === 200)
                        this.items = response.data;
                }).catch(err => {
                    console.error(err)
                }).finally(() => (
                    this.isLoading = false
                ));
            },
        },
        methods: {
            saveUser() {
                this.$cookie.set('user', JSON.stringify(this.model), 30);
                this.$router.push("/")
            },
            deleteUser() {
                this.$cookie.delete('user');
                this.user = null;
            }
        }
    }
</script>

<style scoped>

</style>