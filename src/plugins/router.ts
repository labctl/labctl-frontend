import { App } from "vue";
import { createRouter, createWebHistory } from "vue-router";

export function setupRouter(app: App) {
  const router = createRouter({
    history: createWebHistory(), // process.env.BASE_URL
    routes: [
      {
        path: "/",
        name: "graph",
        component: () => import("../views/graphView.vue"),
        //alias: ["/comply:text(.{0})"],
      },
      {
        path: "/info",
        name: "info",
        component: () => import("../views/infoView.vue"),
      },
      // {
      //   path: "/search/:text(.*)",
      //   name: "search",
      //   component: () => import("../views/pageView.vue"),
      //   alias: ["/:text(.*)", "/search:text(.{0})"], // fallback alias
      // },
    ],
  });

  app.use(router);
}
