const routes = [
  { path: "/", component: () => import("../pages/Home.vue") },
  { path: "/h2", component: () => import("../pages/H2.vue") },
];
export default routes;
