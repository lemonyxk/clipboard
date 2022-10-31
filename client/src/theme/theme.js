import { subscription } from "@/lib/subscription";

var loadTheme = () => {
	var setting = subscription.setting();

	const root = document.querySelector(":root");
	if (process.platform == "win32") {
		// set css variable
		root.style.setProperty("--item-width", "150px");
		// getComputedStyle(root).getPropertyValue("--my-color");
	} else {
		root.style.setProperty("--item-width", "120px");
	}

	root.style.setProperty("--item-length", setting.pageSize);
};

export { loadTheme };
