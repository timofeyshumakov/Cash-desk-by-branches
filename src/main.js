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
import { ru } from 'vuetify/locale'

// Components
import App from './App.vue'

library.add(fas) // Include needed solid icons
library.add(far) // Include needed regular icons
//const pinia = createPinia()

const vuetify = createVuetify({
  theme: {
    themes: {
      light: {
        primary: '#1976D2', // Светлая тема
        secondary: '#424242',
        accent: '#82B1FF',
        error: '#FF5252',
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FFC107'
      },
      dark: {
        primary: '#BB86FC', // Темная тема
        secondary: '#03DAC6',
        accent: '#FFCA28',
        error: '#CF6679',
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FFC107'
      }
    }
  },
  locale: {
    locale: 'ru', // Установите локализацию по умолчанию на русский
    messages: {
      ru,
    },
  },
  components,
  directives,
  theme: {
    themes: {
      light: {
        fonts: {
          family: "'MyCustomFont', sans-serif"
        }
      }
    }
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
