<script setup>
const { shell } = window.require("electron");
function openURL() {
	shell.openExternal(`https://github.com/lemonyxk/clipboard`);
}
</script>
<template>
	<h3>Clipboard Manager</h3>
	<br />
	<div>GIve Me A Star! Thanks!!!</div>
	<br />
	<div class="url" @click="openURL">https://github.com/lemonyxk/clipboard</div>
</template>

<style scoped lang="scss">
.url {
	cursor: pointer;
	color: blue;
	text-decoration-line: underline;
}
</style>
