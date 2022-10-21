import { createRouter, createWebHashHistory } from "vue-router";
import Index from "../views/Index.vue";
import Setting from "../views/Setting.vue";
import About from "../views/About.vue";
import Text from "../views/type/Text.vue";
import TextSearch from "../views/type/TextSearch.vue";
import File from "../views/type/File.vue";
import FileSearch from "../views/type/FileSearch.vue";

const routes = [
	{
		path: "/",
		name: "index",
		component: Index,
		redirect: "/text",
		children: [
			{ path: "/text", name: "Text", component: Text },
			{ path: "/text-search", name: "TextSearch", component: TextSearch },
			{ path: "/file", name: "file", component: File },
			{ path: "/file-search", name: "FileSearch", component: FileSearch },
		],
	},
	{
		path: "/setting",
		name: "Setting",
		component: Setting,
	},
	{
		path: "/about",
		name: "About",
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
