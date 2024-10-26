<template lang="pug">
  main.main
    div(v-if="isLoading") Загрузка...
    div(v-else class="main-container")
      v-form
        v-select(v-model="selectedBranches" :items="branchInfo" label="Выберите стадии сделок" item-title="VALUE" item-value="ID" multiple chips clearable)
        v-select(v-model="selectedDateName" :items="dateNames" label="Выберите дату закрытия счета" @update="handleOptionChange")
        v-text-field(v-if="showInput[0]" id = "daysInput" label="Введите количество дней" type="number" v-model="days" maxlength="4" @input="onInput" :rules="[v => v >= 0 || 'Минимальное значение 1', v => v <= maxDays || 'Максимальное значение 9999', v => /^[0-9]+$/.test(v) || 'Допускаются только цифры']")
          template(#prepend)
            v-btn(@click="decrement" icon)
              v-icon(icon="minus-circle" color="primary" class="button-icon")
          template(#append)
            v-btn(@click="increment" icon)
              v-icon(icon="plus-circle" color="primary" class="button-icon")
        v-select(v-if="showInput[1]" :items="monthNames" v-model="selectedMonth")
        v-select(v-if="showInput[2]" :items="quarterNames" v-model="selectedQuarter")
        v-select(v-if="showInput[3] || showInput[2] || showInput[1]" :items="yearNames" v-model="selectedYear")
        v-date-picker(v-if="showInput[4]" color="primary" :max="maxDate" :min="minDate" v-model="selectedRange[0]")
        v-date-picker(v-if="showInput[4]" color="primary" :max="maxDate" :min="minDate" v-model="selectedRange[1]")
        v-date-picker(v-if="showInput[5]" color="primary" :max="maxDate" :min="minDate" v-model="selectedDay")
        .form-buttons
          v-btn(color="primary" @click="submit") Получить сделки

</template>

<script lang="ts">
import { callApi } from './callApi.ts';

  export default {
      data() {
        const today = new Date();
        const currentYear = today.getFullYear();
        return {
          selectedDateqr: null,
          isLoading: true as boolean,
          branchInfo: [] as string[],
          selectedBranches: [] as string[],
          monthNames: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"] as string[],
          quarterNames: ["I", "II", "III", "IV"],
          yearNames: [] as string[],
          dateNames: ["Любая дата", "Сегодня", "Вчера", "Текущая неделя", "Текущий месяц", "Текущий квартал", "Последние 7 дней", "Последние 30 дней", "Последние 60 дней", "Последние 90 дней", "Последние N дней", "Месяц", "Квартал", "Год", "Прошлая неделя", "Прошлый месяц", "Прошлый год", "Точная дата", "Диапазон"] as string[],
          selectedDateName: "Любая дата" as string,
          selectedDate: [] as number[],
          selectedMonth: "Январь",
          selectedQuarter: "I",
          selectedYear: 2024,
          selectedDay: null,
          selectedRange: [null, null],
          showInput: [false, false, false, false] as boolean[],
          days: 0 as number,
          maxDays: 4383 as number, //12 лет
          maxDate: today.toISOString().split('T')[0], // Максимальная дата - конец текущего года
          minDate: `${currentYear - 12}-01-01`, // Минимальная дата - начало года, 12 лет назад
        };
      },
      computed: {
        handleOptionChange(){
          this.showInput[0] = this.selectedDateName === "Последние N дней";
          this.showInput[1] = this.selectedDateName === "Месяц";
          this.showInput[2] = this.selectedDateName === "Квартал";
          this.showInput[3] = this.selectedDateName === "Год";
          this.showInput[4] = this.selectedDateName === "Диапазон";
          this.showInput[5] = this.selectedDateName === "Точная дата";
        },

      },
      methods: {
        onInput() {
          if(this.days === ""){
            this.days = 0;
          }else if(this.days > this.maxDays){
            this.days = this.maxDays;
          }
          
          if (this.days.length > 1 && this.days.charAt(0) === "0") { this.days = this.days.replace("0", ""); }
          if (this.days.length > 4) {
            this.days = this.days.slice(0, 4);
          }
        },
        increment() {
          if (this.days < this.maxDays) {
            this.days++;
          }
        },
        decrement() {
          if (this.days > 0) {
            this.days--;
          }
        },
        async submit(){
          console.log(this.days);
          console.log(this.days >= 0 && this.days !== "");
          const today : Date = new Date();
          const dayUnix : number = 86400000;
          const dayOfWeek : number = today.getDay(); // 0 - воскресенье, 6 - суббота
          const year : number = today.getFullYear();
          const month : number = today.getMonth();
          let startDate : Date;
          const daysToMonday : number = (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
          const weekStart : Date = new Date();
          const startOfMonth : Date = new Date(year, month, 1, 0, 0, 0, 0);

          switch (this.selectedDateName) {
            case "Любая дата":
              this.selectedDate = [];
              break;
            case "Сегодня":
              today.setHours(0, 0, 0, 0); 
              this.selectedDate[0] = Math.floor(today.getTime() / 1000);
              this.selectedDate[1] = null;
              break;
            case "Вчера":
              today.setHours(0, 0, 0, 0); 
              this.selectedDate[0] = Math.floor((today.getTime() - dayUnix) / 1000);
              this.selectedDate[1] = Math.floor(today.getTime() / 1000);
              break;
            case "Текущая неделя":
              weekStart.setDate(today.getDate() - daysToMonday);
              weekStart.setHours(0, 0, 0, 0);
              this.selectedDate[0] = weekStart.getTime() / 1000;
              this.selectedDate[1] = null;
              break;
            case "Текущий месяц":
              this.selectedDate[0] = Math.floor(startOfMonth.getTime() / 1000);
              this.selectedDate[1] = null;
              break;
            case "Текущий квартал":
              const quarter = Math.floor(month / 3) + 1;
              let quarterStartMonth = (quarter - 1) * 3;
              let quarterStartDate = new Date(year, quarterStartMonth, 1);
              this.selectedDate[0] = Math.floor(quarterStartDate.getTime() / 1000);
              this.selectedDate[1] = null;
              break;
            case "Последние 7 дней":
              startDate =  new Date(today.getTime() - dayUnix * 7);
              this.selectedDate[0] = Math.floor(startDate.getTime() / 1000);
              this.selectedDate[1] = null;
              break;
            case "Последние 30 дней":
              startDate =  new Date(today.getTime() - dayUnix * 30);
              this.selectedDate[0] = Math.floor(startDate.getTime() / 1000);
              this.selectedDate[1] = null;
              break;
            case "Последние 60 дней":
              startDate =  new Date(today.getTime() - dayUnix * 60);
              this.selectedDate[0] = Math.floor(startDate.getTime() / 1000);
              this.selectedDate[1] = null;
              break;
            case "Последние 90 дней":
              startDate = new Date(today.getTime() - dayUnix * 90);
              this.selectedDate[0] = Math.floor(startDate.getTime() / 1000);
              this.selectedDate[1] = null;
              break;
            case "Последние N дней":
              startDate = new Date(today.getTime() - dayUnix * this.days);
              this.selectedDate[0] = Math.floor(startDate.getTime() / 1000);
              this.selectedDate[1] = null;
            case "Месяц":
              const monthIndex = this.monthNames.findIndex((item : string) => item === this.selectedMonth);
              const startOfSelectedMonth : Date = new Date(year, monthIndex, 1, 0, 0, 0, 0);
              const endOfSelectedMonth : Date = new Date(year, monthIndex + 1, 1, 0, 0, 0, 0);
              this.selectedDate[0] = Math.floor(startOfSelectedMonth.getTime() / 1000);
              this.selectedDate[1] = Math.floor(endOfSelectedMonth.getTime() / 1000);
              break;
            case "Квартал":
              const quarterIndex = this.quarterNames.findIndex((item : string) => item === this.selectedQuarter);
              const startMonth = quarterIndex * 3 + 1;
              const endMonth = startMonth + 2;
              const startQuarterDate = new Date(year, startMonth - 1, 1);
              const endQuarterDate = new Date(year, endMonth, 1, 0, 0, 0, 0);
              this.selectedDate[0] = Math.floor(startQuarterDate.getTime() / 1000);
              this.selectedDate[1] = Math.floor(endQuarterDate.getTime() / 1000);
              break;
            case "Год":
              this.selectedDate[0] = new Date(this.selectedYear, 0, 1, 0, 0, 0, 0).getTime() / 1000;
              this.selectedDate[1] = new Date(this.selectedYear + 1, 0, 1, 0, 0, 0, 0).getTime() / 1000;
              break;
            case "Прошлая неделя":
              weekStart.setDate(today.getDate() - daysToMonday);
              weekStart.setHours(0, 0, 0, 0);
              this.selectedDate[0] = (weekStart.getTime() - (dayUnix * 7)) / 1000;
              this.selectedDate[1] = weekStart.getTime() / 1000;
              break;
            case "Прошлый месяц":
              const firstDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
              const lastDayOfPreviousMonth = new Date(firstDayOfCurrentMonth.getTime() - 1);
              this.selectedDate[0] = (startOfMonth.getTime() - (dayUnix * lastDayOfPreviousMonth.getDate())) / 1000;
              this.selectedDate[1] = Math.floor(startOfMonth.getTime() / 1000);
              break;
            case "Прошлый год":
              const lastYear = new Date(today.getFullYear() - 1, 0, 1);
              const thisYear = new Date(today.getFullYear(), 0, 1);
              this.selectedDate[0] = Math.round(lastYear.getTime() / 1000);
              this.selectedDate[1] = Math.round(thisYear.getTime() / 1000);
              break;
            case "Точная дата":
              this.selectedDate[0] = Math.floor(new Date(this.selectedDay).getTime() / 1000);
              this.selectedDate[1] = Math.floor((new Date(this.selectedDay).getTime() + dayUnix) / 1000);
              break;
            case "Диапазон":
              const rangeUnix = [];
              rangeUnix[0] = Math.floor(new Date(this.selectedRange[0]).getTime() / 1000);
              rangeUnix[1] = Math.floor((new Date(this.selectedRange[1]).getTime() + dayUnix) / 1000);
              this.selectedDate[0] = Math.min(rangeUnix[0], rangeUnix[1]);
              this.selectedDate[1] = Math.max(rangeUnix[0], rangeUnix[1]);
              break;
            default:
              break;
          }
          console.log(this.selectedDate);

          let invoices : any = await callApi("crm.item.list", {"ufCrm_SMART_INVOICE_1729670614381": this.selectedBranches }, ["closedate", "ufCrm_SMART_INVOICE_1729670614381"] , 31);
          invoices = invoices.items;

        },
        
      },
      async mounted(): Promise<void> {
          const currentYear = new Date().getFullYear();
          this.yearNames = Array.from({ length: 12 }, (_, index) => currentYear - index);
          this.selectedMonth = this.monthNames[0];
          this.selectedQuarter = this.quarterNames[0];
          this.selectedYear = this.yearNames[0];
        this.isLoading = false;
        //let branchInfo: any = await this.callApi("crm.item.fields", {}, null, 31);
        //this.branchInfo = branchInfo.fields.ufCrm_SMART_INVOICE_1729670614381.items;

        
      }
    }
</script>

<style lang="sass">
  
  ::-webkit-scrollbar
    background: white
  
  ::-webkit-scrollbar-thumb
    background: #e6e6e6
    border-radius: 1rem
  
  ::-webkit-scrollbar-thumb:active
    background: #e1e1e1
  
  html, body
    min-height: 100%

  h1
    width: 100%
    text-align: center

  .main-container
    display: flex
    flex-direction: column
    gap: 0.75rem
    padding: 0.5rem
    max-width: 120rem
    width: 100%

  .main
    display: flex
    flex-direction: column
    align-items: center

  .v-card .v-card-text
    padding-top: 1rem

  .v-date-picker
    width: 100%

  .v-date-picker-month__day.v-date-picker-month__day--selected
    z-index: 1

  .v-btn--icon .v-btn__content
    transform: scale(1.25)

  .button-icon
    transform: scale(2) !important

  .inputs
    display: grid
    grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr))
    column-gap: 1rem
    padding: 0
  
  .buttons
    margin-bottom: 1rem
    display: grid
    grid-template-columns: repeat(4, 1fr)
    gap: 1rem
    width: 100%
  
  .buttons button
    width: 100%
  
  .period
    min-width: 12rem
    max-width: 12rem

  .table-checkbox
    margin-right: 1.25rem

  .charts
    grid-template-columns: repeat(2, 1fr)
    gap: 0.75rem
  
  .chart
    border: 1px solid black
    border-radius: 1rem
  
  .header
    margin: 1.5rem 0
    display: flex
    gap: 1rem
    width: 100%
    justify-content: space-between
    align-items: center
  
  .tfoot__td:not(:first-child)
    text-align: center
  
  [type=number]::-webkit-inner-spin-button
    display: none
  
  .v-input__prepend .v-icon:not(.v-btn__content .v-icon)
    display: none
  
  .v-input__append .v-icon:not(.v-btn__content .v-icon)
    display: none

  .v-data-table-footer
    display: none
  
  .v-input__details
    display: none
  
  .v-btn.v-btn--density-default
    height: 3rem
  
  .v-form
    width: 100%
    display: grid
    grid-template-columns: 1fr 1fr
    gap: 0.75rem
  
  
  .v-form > *:not(.v-checkbox)
    min-width: 25rem
    flex-grow: 1
  
  .v-checkbox .v-input__control
    min-width: unset
  
  .v-btn--size-default.v-btn
    min-width: unset
    max-width: 20rem

  .v-container--fluid
    max-width: 100%
    display: flex
    flex-direction: column
    gap: 1.5rem

</style>
  
  
  