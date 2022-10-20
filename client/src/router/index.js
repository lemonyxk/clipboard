import { createRouter, createWebHashHistory } from "vue-router";
import Index from "../views/Index.vue";
import Setting from "../views/Setting.vue";
import About from "../views/About.vue";
import Search from "../views/type/Search.vue";
import Normal from "../views/type/Normal.vue";
import Files from "../views/type/Files.vue";
import FilesSearch from "../views/type/FilesSearch.vue";

const routes = [
	{
		path: "/",
		name: "index",
		component: Index,
		redirect: "/normal",
		children: [
			{ path: "/normal", name: "normal", component: Normal },
			{ path: "/search", name: "search", component: Search },
			{ path: "/files", name: "files", component: Files },
			{ path: "/filesSearch", name: "filesSearch", component: FilesSearch },
		],
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
		// component: () => import(/* webpackChunkName: "about" */ "../views/About.vue"),
		component: About,
	},
];

const router = createRouter({
	history: createWebHashHistory(),
	routes,
});

export default router;
