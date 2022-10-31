<template>
	<v-card class="setting" flat>
		<div class="box">
			<div class="left">Start At Login</div>
			<v-switch class="right" v-model="setting.startAtLogin" @change="change" color="primary" hide-details></v-switch>
		</div>
		<div class="box">
			<div class="left">Click To Copy</div>
			<v-switch class="right" v-model="setting.clickToCopy" @change="change" color="primary" hide-details></v-switch>
		</div>
		<div class="box">
			<div class="left">Clear All History</div>
			<div class="right"><v-btn density="compact" @click="clear">Clear</v-btn></div>
		</div>

		<div class="box">
			<div class="left">Page Size</div>
			<div class="right">
				<div style="width: 50%">
					<v-text-field v-model="setting.pageSize" variant="underlined" @blur="pageBlur" density="compact" color="primary"></v-text-field>
				</div>
			</div>
		</div>

		<div class="box">
			<div class="left">Max Length</div>
			<div class="right">
				<div style="width: 50%">
					<v-text-field v-model="setting.maxLength" variant="underlined" @blur="pageBlur" density="compact" color="primary"></v-text-field>
				</div>
			</div>
		</div>
	</v-card>
</template>

<script setup>
import { ref } from "vue";
import { subscription } from "../lib/subscription";
import { on, send } from "../lib/ipc";

var raw = subscription.setting();

var setting = ref(raw);

subscription.on("setting", (setting) => {
	setting.value = setting;
});

function change() {
	send("setting", { ...setting.value }).then((res) => {});
}

function clear() {
	send("clear");
}

function pageBlur() {
	setting.value.pageSize = parseInt(setting.value.pageSize);
	if (setting.value.pageSize < 0) setting.value.pageSize = raw.pageSize;

	setting.value.maxLength = parseInt(setting.value.maxLength);
	if (setting.value.maxLength < 0) setting.value.maxLength = raw.maxLength;

	change();
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
