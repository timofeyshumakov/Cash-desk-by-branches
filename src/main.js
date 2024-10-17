import { createApp } from 'vue'
import { aliases, fa } from 'vuetify/iconsets/fa-svg'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
// pinia
//import { useArrayStore } from './store'
//import { createPinia } from 'pinia'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Components
import App from './App.vue'

library.add(fas) // Include needed solid icons
library.add(far) // Include needed regular icons
//const pinia = createPinia()

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
  },
  icons: {
    defaultSet: 'fa',
    aliases,
    sets: {
      fa,
    },
  },
})

createApp(App).use(vuetify).component('font-awesome-icon', FontAwesomeIcon).mount('#app') //.use(pinia)
