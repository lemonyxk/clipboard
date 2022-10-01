import { createRouter, createWebHashHistory } from "vue-router";
import Index from "../views/Index.vue";
import Setting from "../views/Setting.vue";

const routes = [
	{
		path: "/",
		name: "index",
		component: Index,
	},
	{
		path: "/setting",
		name: "setting",
		component: Setting,
	},
	{
		path: "/about",
		name: "about",
		// route level code-splitting
		// this generates a separate chunk (about.[hash].js) for this route
		// which is lazy-loaded when the route is visited.
		component: () => import(/* webpackChunkName: "about" */ "../views/About.vue"),
	},
];

const router = createRouter({
	history: createWebHashHistory(),
	routes,
});

export default router;
