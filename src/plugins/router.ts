import { App } from "vue"
import { createRouter, createWebHistory } from "vue-router"

export function setupRouter(app: App) {
  const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes: [
      {
        path: "/info",
        name: "info",
        component: () => import("../views/infoView.vue"),
      },
      {
        path: "/",
        name: "graph",
        component: () => import("../views/graphView.vue"),
        alias: ["/:all(.*)*"],
      },
    ],
  })

  app.use(router)
}
