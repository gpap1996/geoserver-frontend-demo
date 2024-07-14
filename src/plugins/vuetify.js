// Styles
import "@fortawesome/fontawesome-free/css/all.css"; // Ensure your project is capable of handling css files
import "vuetify/styles";

// Composables
import { createVuetify } from "vuetify";
import { aliases, fa } from "vuetify/iconsets/fa";

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  icons: {
    defaultSet: "fa",
    aliases,
    sets: {
      fa,
    },
  },
  theme: {
    defaultTheme: "light",
    themes: {
      light: {
        dark: false,
        colors: {
          primary: "#0367A5",
          darkBlue: "#022741",
          lightGrey: "#979191",
        },
      },
    },
  },
});
