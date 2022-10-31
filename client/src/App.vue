<template>
	<router-view></router-view>
</template>

<style lang="scss">
html {
	width: 100%;
	height: 100%;
	overflow: hidden;
	background-color: #efefef;
	// font-family: caption;
	font-family: "Gill Sans", sans-serif;
}

* {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
	user-select: none;
}

body {
	width: 100%;
	height: 100%;
}

#app {
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
}

::-webkit-scrollbar {
	width: 5px;
	height: 5px;
}

::-webkit-scrollbar-track {
	/* border-radius: 3px; */
	/* background: rgba(115, 18, 226, 0.16); */
	// box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.08);
	// box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.08);
}

::-webkit-scrollbar-thumb {
	/* border-radius: 3px; */
	background: rgba(20, 5, 107, 0.06);
	// background: black;
	box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.08);
}

.none-scrollbar::-webkit-scrollbar {
	width: 0px;
	height: 0px;
}
</style>
