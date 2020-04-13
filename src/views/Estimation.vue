<template>
  <v-card v-if="lesson !== undefined && lesson !== null" width="900" class="mx-auto mt-10">
    <v-progress-linear
        :active="loading"
        :indeterminate="loading"
        absolute
        top
        color="#003AAB"
    />
    <v-card-title style="word-break: normal;">{{lesson.discipline}}</v-card-title>
    <v-card-text>
      <h3>{{lesson.lecturer}}</h3>
      <h3 class="text--primary my-4">{{getWeekDayAndDate(lesson.date)}}</h3>
      <div v-if="!willComeDialog">
        <h2 class="text--primary text-center">{{getTitle()}}</h2>
        <div v-for="item in questions">
          <v-container class="grey lighten-4 my-3 text-center">
            <h3 class="text--primary">{{item.title}}</h3>
            <v-rating
                v-model="item.rating"
                color="#003AAB"
                background-color="grey darken-1"
                hover
                length="10"
                dense
            ></v-rating>
          </v-container>
        </div>
        <div class="d-flex justify-end mt-5">
          <v-btn dark color="#003AAB" @click="trySendAnswers">Отправить</v-btn>
        </div>
      </div>
      <div v-else>
        <v-container class="grey lighten-4 my-3 text-center">
          <h3 class="text--primary">Вы будете присутствовать на занятии?</h3>
          <div class="d-flex">
            <v-spacer/>
            <v-btn dark color="#003AAB" @click="willYesCome" class="mr-10 mt-5">Да</v-btn>
            <v-btn dark color="#003AAB" @click="willNotCome" class="ml-10 mt-5">Нет</v-btn>
            <v-spacer/>
          </div>
        </v-container>
      </div>
    </v-card-text>
    <v-dialog
        v-if="nextTime"
        v-model="dialog"
        max-width="350"
        persistent
    >
      <v-card>
        <v-card-title class="headline">Следующая оценка</v-card-title>

        <v-card-text>
          Следующая возможность оценить занятие будет в {{nextTime}}.
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
              color="#003AAB"
              to="/"
              dark
          >
            Ок
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
  import axios from "axios"
  import sha1 from "js-sha1"

  const api = require("@/config.json");

  export default {
    name: "Estimation",
    props: ['lesson', 'user'],
    data() {
      return {
        questions: [
          {title: 'Интересное', rating: 5},
          {title: 'Полезное', rating: 5},
          {title: 'Понятное', rating: 5},
          {title: 'Сложное', rating: 5},
          {title: 'Общая интегральная оценка', rating: 5}
        ],
        rating: 5,
        loading: false,
        nextTime: "",
        dialog: false,
        titles: ['Предположите, каким будет сегодняшнее занятие?', 'Оцените, каким было занятие в последние 15 минут?', 'Как бы вы оценили занятие в целом?'],
        willCome: false,
        willComeDialog: false
      }
    },
    created() {
      if (this.lesson === undefined || this.user === undefined) {
        this.$router.push('/');
      }
    },
    methods: {
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
      async trySendAnswers() {
        if (this.willCome) this.willComeDialog = true;
        else await this.sendAnswer()
      },
      async sendAnswer() {
        this.loading = true;
        let answers = [];
        for (let i = 0; i < this.questions.length; i++) {
          answers.push({
            answer: this.questions[i].rating,
            beginLesson: this.lesson.beginLesson,
            date: this.lesson.date,
            discipline: this.lesson.discipline,
            endLesson: this.lesson.endLesson,
            from: sha1(this.user.id + this.user.label).toUpperCase(),
            kindOfWork: this.lesson.kindOfWork,
            lecturer: this.lesson.lecturer,
            question: this.questions[i].title,
            willCome: !this.willCome
          });
        }

        await axios.post(`${api.back}/answers`, answers).then(() => {
          let newTime = this.countNextTime();
          if (newTime !== null) this.$cookie.set('time', newTime, 7);
          else this.$router.push('/');
        }).catch(err => {
          console.error(err);
        }).finally(() => {
          this.loading = false;
          if (!this.willCome) this.dialog = true;
        });
      },
      countNextTime() {
        let now = new Date();
        let date = this.parseDate(this.lesson.date);

        let endHours = +this.lesson.endLesson.substr(0, 2);
        let endMinutes = +this.lesson.endLesson.substr(3, 2);
        let endDate = new Date(date.setHours(endHours, endMinutes));

        if (now >= endDate) return null;

        let startHours = +this.lesson.beginLesson.substr(0, 2);
        let startMinutes = +this.lesson.beginLesson.substr(3, 2);
        let startDate = new Date(date.setHours(startHours, startMinutes));

        let nextTime = new Date();

        nextTime.setHours(startDate.getHours(), startDate.getMinutes() + (Math.ceil((now - startDate) / 600000) * 15), 0, 0);
        this.nextTime = nextTime.toLocaleTimeString("ru", {
          hour: "numeric",
          minute: "numeric"
        }) + ", " + nextTime.toLocaleDateString();
        return nextTime.getTime();
      },
      getTitle() {
        let now = new Date();
        let date = this.parseDate(this.lesson.date);

        let startHours = +this.lesson.beginLesson.substr(0, 2);
        let startMinutes = +this.lesson.beginLesson.substr(3, 2);
        let startDate = new Date(date.setHours(startHours, startMinutes));

        let diff = Math.round((now - startDate) / 60 / 1000);
        if (diff > 80) {
          return this.titles[2];
        } else if (diff > 15) {
          return this.titles[1];
        }

        this.willCome = true;
        return this.titles[0];
      },
      async willYesCome() {
        this.willCome = false;
        await this.sendAnswer();
      },
      async willNotCome() {
        await this.sendAnswer();
        this.$cookie.set(this.lesson.beginLesson + '_' + this.lesson.date, true, 10);
      }
    }
  }
</script>

<style scoped>

</style>