var loadTheme = () => {
	const root = document.querySelector(":root");
	if (process.platform == "win32") {
		// set css variable
		root.style.setProperty("--item-len", "150px");
		// getComputedStyle(root).getPropertyValue("--my-color");
	} else {
		root.style.setProperty("--item-len", "120px");
	}
};

export { loadTheme };
