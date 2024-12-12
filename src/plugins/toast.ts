import Toast from "vue-toastification";
import type { PluginOptions } from "vue-toastification";
// Import the CSS or use your own!
import "vue-toastification/dist/index.css";

const options = {
  // You can set your default options here
  timeout: 3000,
  draggable: false,
  position: "bottom-right",
};

export { Toast, options };
