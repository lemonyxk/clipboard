<template>
	<v-card class="setting" flat>
		<div class="box">
			<div class="left">Start At Login</div>
			<v-switch class="right" v-model="startAtLogin" @change="change" color="primary" hide-details></v-switch>
		</div>
		<div class="box">
			<div class="left">Click To Copy</div>
			<v-switch class="right" v-model="clickToCopy" @change="change" color="primary" hide-details></v-switch>
		</div>
		<div class="box">
			<div class="left">Clear All History</div>
			<div class="right"><v-btn density="compact" @click="clear">Clear</v-btn></div>
		</div>
	</v-card>
</template>

<script setup>
import { ref } from "vue";
import { subscription } from "../lib/subscription";
import { on, send } from "../lib/ipc";

var setting = subscription.setting();
var startAtLogin = ref(setting.startAtLogin);
var clickToCopy = ref(setting.clickToCopy);

subscription.on("setting", (setting) => {
	startAtLogin.value = setting.startAtLogin;
	clickToCopy.value = setting.clickToCopy;
});

function change() {
	send("setting", { startAtLogin: startAtLogin.value, clickToCopy: clickToCopy.value });
}

function clear() {
	send("clear");
}

//
</script>

<style scoped lang="scss">
.setting {
	width: 100%;
	height: 100%;

	display: flex;
	justify-content: flex-start;
	align-items: center;
	flex-direction: column;
	background: none;

	.box {
		width: 100%;
		height: 48px;
		display: flex;
		justify-content: space-around;
		align-items: center;

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
			align-items: center;
			padding-right: 15px;
		}
	}
}
</style>
