import "../css/app.css";

import $ from "jquery";
import moment from "moment";

window.$ = window.jQuery = $;
window.moment = moment;

import { createInertiaApp } from "@inertiajs/react";
import { createRoot } from "react-dom/client";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import "bootstrap/dist/css/bootstrap.min.css";

createInertiaApp({
    resolve: (name) =>
        resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob("./Pages/**/*.jsx")),
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
});



