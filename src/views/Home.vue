<template>
    <v-card width="900" class="mx-auto mt-10">
        <v-progress-linear
                :active="loading"
                :indeterminate="loading"
                absolute
                bottom
                color="#003AAB"
        ></v-progress-linear>
        <v-card-title class="headline">Ваши занятия</v-card-title>
        <div v-if="!loading">
            <v-card-text v-if="user !== null" class="text-left text--primary">
                <div v-if="lessons.length === 0" class="text-center">
                    <h3>Расписание не найдено</h3>
                </div>
                <div v-for="(items, date) in lessons">
                    <h3>{{getWeekDayAndDate(date)}}</h3>
                    <v-container class="grey lighten-4 my-3">
                        <v-row v-for="(item, index) in items" :key="index">
                            <v-col cols="3" class="d-flex flex-column align-self-center text-center my-3" style="border-right: 1px solid #000;" sm="2">
                                <h3>{{item.beginLesson}}</h3>
                                <p>{{item.endLesson}}</p>
                            </v-col>
                            <v-col cols="7" sm="9">
                                <h4 style="color: #003AAB;">{{item.kindOfWork}}</h4>
                                <h3>{{item.discipline}}</h3>
                                <p style="color: #686868;">{{item.lecturer}}</p>
                            </v-col>
                            <v-col cols="2" sm="1" class="d-flex align-center text-center"
                                   v-if="timeToEstimate(item.beginLesson, item.endLesson, parseDate(item.date), item.date)">
                                <v-btn icon color="#000"
                                       :to="{name: 'Оценка занятия', params: {lesson: item, user: user}}">
                                    <v-icon>
                                        mdi-chevron-right
                                    </v-icon>
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-container>
                </div>
            </v-card-text>
            <v-card-text v-else>
                <p>Для оценивания занятий необходимо авторизоваться</p>
                <v-btn dark color="#003AAB" to="/login">Войти</v-btn>
            </v-card-text>
        </div>
    </v-card>
</template>

<script>
    import axios from "axios"

    const api = require("@/config.json");

    export default {
        name: 'home',
        data() {
            return {
                user: null,
                loading: false,
                lessons: []
            }
        },
        async created() {
            let user = JSON.parse(this.$cookie.get('user'));

            let startDate = new Date();
            let endDate = new Date();
            endDate.setDate(endDate.getDate() + 6);

            let startDateString = this.formatDate(startDate);
            let endDateString = this.formatDate(endDate);

            if (user !== null) {
                this.user = user;
                this.loading = true;
                await axios.get(`${api.back}/lessons?request_type=${user.type}&id=${user.id}&start_date=${startDateString}&end_date=${endDateString}`).then(
                    response => {
                        if (response.status === 200)
                            this.lessons = this.filteredLessons(response.data);
                    }
                ).catch(err => {
                    console.error(err);
                }).finally(() => {
                    this.loading = false;
                });
            }
        },
        methods: {
            filteredLessons(data) {
                let lessonsMap = {};
                for (let i = 0; i < data.length; i++) {
                    if (lessonsMap.hasOwnProperty(data[i].date)) {
                        lessonsMap[data[i].date].push(data[i]);
                    } else {
                        lessonsMap[data[i].date] = [data[i]];
                    }
                }
                return lessonsMap;
            },
            formatDate(date) {
                let dd = date.getDate();
                if (dd < 10) dd = '0' + dd;

                let mm = date.getMonth() + 1;
                if (mm < 10) mm = '0' + mm;

                let yy = date.getFullYear();

                return yy + '.' + mm + '.' + dd;
            },
            parseDate(dateString) {
                let year = +dateString.substr(0, 4);
                let month = +dateString.substr(5, 2) - 1;
                let day = +dateString.substr(8, 2);
                return new Date(year, month, day);
            },
            getWeekDayAndDate(dateString) {
                let date = this.parseDate(dateString);
                date = date.toLocaleDateString("ru", {weekday: 'long', day: 'numeric', month: 'long'});
                date = date[0].toUpperCase() + date.substring(1, date.length);
                return date;
            },
            timeToEstimate(start, end, date, dateString) {
                if (this.$cookie.get(start + '_' + dateString)) return false;

                let now = new Date();

                let startHours = +start.substr(0, 2);
                let startMinutes = +start.substr(3, 2);
                let startDate = new Date(date.setHours(startHours, startMinutes));

                let endHours = +end.substr(0, 2);
                let endMinutes = +end.substr(3, 2);
                let endDate = new Date(date.setHours(endHours, endMinutes));

                if (now >= endDate) return true;

                if (startDate <= now && now < endDate) {
                    let time = this.$cookie.get('time');
                    if (time === null ) return true;

                    let timeNow = now.getTime();
                    return time <= timeNow;
                }

                return false;
            }
        }
    }
</script>
