<script setup>
import { shell } from "@/lib/shell";

function openURL() {
	shell.openExternal(`https://github.com/lemonyxk/clipboard`);
}

//
</script>
<template>
	<div class="about">
		<h3>Clipboard Manager</h3>
		<br />
		<div>GIve Me A Star! Thanks!!!</div>
		<br />
		<div class="url" @click="openURL">https://github.com/lemonyxk/clipboard</div>
	</div>
</template>

<style scoped lang="scss">
.about {
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	background-color: #efefef;

	.url {
		cursor: pointer;
		color: rgb(93, 93, 215);
		text-decoration-line: underline;
		cursor: pointer;
	}
}
</style>
