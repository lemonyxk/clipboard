<template>
	<v-card class="setting" flat>
		<div class="box">
			<div class="left">Start At Login</div>
			<v-switch class="right" v-model="startAtLogin" @change="change" color="primary" hide-details></v-switch>
		</div>
	</v-card>
</template>

<script setup>
import { ref } from "vue";
const { ipcRenderer } = window.require("electron");
const Store = window.require("electron-store");
const store = new Store();

var startAtLogin = ref(store.get("setting").startAtLogin);

function change() {
	ipcRenderer.send("setting", { startAtLogin: startAtLogin.value });
}
</script>

<style scoped lang="scss">
.setting {
	width: 100%;
	height: 100%;

	display: flex;
	justify-content: flex-start;
	justify-items: center;
	flex-direction: column;
	background: none;

	.box {
		width: 100%;
		height: 48px;
		display: flex;
		justify-content: flex-start;
		justify-items: center;

		.left {
			width: 50%;
			height: 100%;
			line-height: 48px;
			padding-left: 15px;
		}

		.right {
			width: 50%;
			height: 100%;
			display: flex;
			justify-content: flex-end;
			justify-items: center;
			padding-right: 15px;
		}
	}
}
</style>
