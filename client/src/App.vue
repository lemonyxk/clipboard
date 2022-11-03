<template>
	<router-view></router-view>
</template>

<script setup>
//
</script>

<style lang="scss">
@font-face {
	font-family: "JetBrains Mono";
	src: url("./fonts/JetBrainsMono-Bold-Italic.woff2") format("woff2"), url("./fonts/JetBrainsMono-Bold-Italic.woff") format("woff");
	font-weight: 700;
	font-style: italic;
	font-display: swap;
}

@font-face {
	font-family: "JetBrains Mono";
	src: url("./fonts/JetBrainsMono-Bold.woff2") format("woff2"), url("./fonts/JetBrainsMono-Bold.woff") format("woff");
	font-weight: 700;
	font-style: normal;
	font-display: swap;
}

@font-face {
	font-family: "JetBrains Mono";
	src: url("./fonts/JetBrainsMono-ExtraBold-Italic.woff2") format("woff2"), url("./fonts/JetBrainsMono-ExtraBold-Italic.woff") format("woff");
	font-weight: 800;
	font-style: italic;
	font-display: swap;
}

@font-face {
	font-family: "JetBrains Mono";
	src: url("./fonts/JetBrainsMono-ExtraBold.woff2") format("woff2"), url("./fonts/JetBrainsMono-ExtraBold.woff") format("woff");
	font-weight: 800;
	font-style: normal;
	font-display: swap;
}

@font-face {
	font-family: "JetBrains Mono";
	src: url("./fonts/JetBrainsMono-Italic.woff2") format("woff2"), url("./fonts/JetBrainsMono-Italic.woff") format("woff");
	font-weight: 400;
	font-style: italic;
	font-display: swap;
}

@font-face {
	font-family: "JetBrains Mono";
	src: url("./fonts/JetBrainsMono-Medium-Italic.woff2") format("woff2"), url("./fonts/JetBrainsMono-Medium-Italic.woff") format("woff");
	font-weight: 500;
	font-style: italic;
	font-display: swap;
}

@font-face {
	font-family: "JetBrains Mono";
	src: url("./fonts/JetBrainsMono-Medium.woff2") format("woff2"), url("./fonts/JetBrainsMono-Medium.woff") format("woff");
	font-weight: 500;
	font-style: normal;
	font-display: swap;
}

@font-face {
	font-family: "JetBrains Mono";
	src: url("./fonts/JetBrainsMono-Regular.woff2") format("woff2"), url("./fonts/JetBrainsMono-Regular.woff") format("woff");
	font-weight: 400;
	font-style: normal;
	font-display: swap;
}

html {
	width: 100%;
	height: 100%;
	overflow: hidden;
	background-color: rgba(0, 0, 0, 0);
	font-family: "JetBrains Mono";
	// font-family: "Gill Sans", sans-serif;
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
	background-color: rgba(0, 0, 0, 0);
	border-radius: 10px;
}

#app {
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	background-color: #efefef;
	border-radius: 10px;
}

::selection {
	// color: #ccc;
	background: rgb(196, 196, 218);
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

@keyframes opacityAnimation {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}

.opacityAnimation {
	animation: opacityAnimation 0.5s;
}

@keyframes widthAnimation {
	0% {
		scale: 0;
	}

	80% {
		scale: 1.1;
	}

	100% {
		scale: 1;
	}
}

.widthAnimation {
	animation: widthAnimation 0.2s;
}
</style>
