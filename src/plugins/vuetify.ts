import { createVuetify } from "vuetify";
// 指令
import * as directives from "vuetify/directives";
// 引入vuetify的components
import * as components from "vuetify/components";
// 引入vuetify的labsComponents (還在實驗開發中的)
import * as labsComponents from "vuetify/labs/components";
// import { aliases, mdi } from 'vuetify/iconsets/mdi';
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/dist/vuetify.css";
import { zhHant } from "vuetify/locale";

/**
 * Vuetify Plugin
 * Main components library
 *
 * https://vuetifyjs.com/
 *
 */

export default createVuetify({
  components: {
    ...components,
    ...labsComponents,
  },
  directives,
  locale: {
    locale: "zhHant",
    fallback: "zhHant",
    messages: { zhHant },
  },
  theme: {},
  // 全局的vuetify component設定
  defaults: {
    VCard: {
      rounded: "md",
    },
    VTextField: {
      variant: "outlined",
      density: "compact",
      color: "primary",
    },
    VTextarea: {
      variant: "outlined",
      density: "compact",
      color: "primary",
    },
    VSelect: {
      variant: "outlined",
      density: "compact",
      color: "primary",
    },
    VListItem: {
      minHeight: "45px",
    },
    VTooltip: {
      location: "top",
    },
    VCol: {
      style: "padding: 6px",
    },
    VBtn: {
      variant: "outlined",
      color: "black",
    },
  },
});
