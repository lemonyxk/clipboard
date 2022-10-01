<template>
	<router-view></router-view>
</template>

<style lang="scss">
html {
	width: 100%;
	height: 100%;
	overflow: hidden;
	background-color: #efefef;
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
</style>
