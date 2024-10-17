<template>
  <main class="main">
    <div v-if="isLoading">Загрузка...</div>
    <div v-else class="main-container">
      <h1>Сортировка сделок</h1>
    </div>
  </main>
</template>

<script>
  import { ref }
  from 'vue';
  export default {
    setup() {
        const isLoading = ref(true);

        const toggleLoading = () => {
          isLoading.value = false;
        }

        return {
          isLoading,
          toggleLoading,
        };
      },
      data() {
        return {
          value: 1,
        };
      },
      computed: {

      },
      methods: {
        async callApi(method, filter, select) {
          if (!filter) {
            filter = {};
          }
          let total = 0;
          const maxTotal = 50;
          let data = {};
          const exceptions = ['crm.status.list'];
          await new Promise((resolve, reject) => {
            BX24.callMethod(method, {
              filter: filter,
              select: select,
            }, (res) => {
              if (res.data()) {
                total = res.total();
                data = res.data();
                resolve(data);
              }
            });
          });
          if (total > maxTotal && !exceptions.includes(method)) {
            let cmd = {};
            const iterations = Math.ceil(total / maxTotal);
            for (let i = 0; i < iterations; i++) {
              const key = `cmd${i}`;
              const value = {
                method: method,
                params: {
                  start: i * maxTotal,
                  filter,
                  select: select
                }
              };
              cmd[key] = value;
            }
            await new Promise((resolve, reject) => {
              BX24.callBatch(cmd, (res) => {
                let resultData = [];
                for (let i = 0; i < iterations; i++) {
                  let key = `cmd${i}`;
                  data = res[key].data();
                  resultData.push(data);
                }
                resultData = resultData.flat();
                data = resultData;
                resolve(resultData);
              });
            })
          }
          return data;
        },
      },
      async mounted() {
        BX24.callMethod(
          "crm.deal.list",
          {
          },
          function(result) 
          {
            if(result.error())
              console.error(result.error());
            else
              console.dir(result.data());
          }
        );
        this.toggleLoading();

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
  
  .v-btn--icon .v-btn__content
    transform: scale(2)
  
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
  
  .form-buttons
    width: 100%
    display: flex
    gap: 1.25rem

  .generating
    width: 100%
    height: 100%
    display: flex
    flex-direction: column
    align-items: center
    justify-content: center
    gap: 1rem

  .generating-img
    max-width: 30rem

</style>
  
  
  