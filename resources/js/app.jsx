import "bootstrap/dist/css/bootstrap.min.css";
import "../css/app.css";

import $ from "jquery";
import moment from "moment";

window.$ = window.jQuery = $;
window.moment = moment;

import { createInertiaApp } from "@inertiajs/react";
import { createRoot } from "react-dom/client";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createTranslator, getLocale } from "./i18n/translator";

createInertiaApp({
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob("./Pages/**/*.jsx"),
        ).then((module) => {
            const Page = module.default;
            const WrappedPage = (pageProps) => {
                const locale = getLocale();
                const translator = createTranslator(
                    pageProps?.translator ?? {},
                    locale,
                );

                return (
                    <Page {...pageProps} translator={translator} locale={locale} />
                );
            };
            WrappedPage.layout = Page.layout;
            return WrappedPage;
        }),
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
});



