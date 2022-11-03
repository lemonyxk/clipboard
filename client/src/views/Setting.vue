<template>
	<v-card class="setting" flat>
		<div class="box">
			<div class="left">Start At Login</div>
			<div class="right">
				<div>
					<v-switch class="switch" v-model="setting.startAtLogin" @change="change" color="primary" hide-details></v-switch>
				</div>
			</div>
		</div>

		<div class="box">
			<div class="left">Click To Copy</div>
			<div class="right">
				<div>
					<v-switch class="switch" v-model="setting.clickToCopy" @change="change" color="primary" hide-details></v-switch>
				</div>
			</div>
		</div>

		<div class="box">
			<div class="left">Page Size</div>
			<div class="right">
				<div>
					<v-text-field
						class="input"
						v-model="setting.pageSize"
						variant="underlined"
						@blur="pageBlur"
						density="compact"
						color="primary"
					></v-text-field>
				</div>
			</div>
		</div>

		<div class="box">
			<div class="left">Show Size</div>
			<div class="right">
				<div>
					<v-text-field
						class="input"
						v-model="setting.showSize"
						variant="underlined"
						@blur="pageBlur"
						density="compact"
						color="primary"
					></v-text-field>
				</div>
			</div>
		</div>

		<div class="box">
			<div class="left">Max Length</div>
			<div class="right">
				<div>
					<v-text-field
						class="input"
						v-model="setting.maxLength"
						variant="underlined"
						@blur="pageBlur"
						density="compact"
						color="primary"
					></v-text-field>
				</div>
			</div>
		</div>

		<div class="box">
			<div class="left">Export</div>
			<div class="right">
				<div>
					<v-btn class="button" density="compact" @click="exportData">Export</v-btn>
				</div>
			</div>
		</div>

		<div class="box">
			<div class="left">Import</div>
			<div class="right">
				<div>
					<v-btn class="button" density="compact" @click="importData">Import</v-btn>
				</div>
			</div>
		</div>

		<div class="box">
			<div class="left">Clear All History</div>
			<div class="right">
				<div>
					<v-btn class="button" density="compact" @click="clear">Clear</v-btn>
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

subscription.on("setting", (res) => {
	setting.value = { ...res };
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

	setting.value.showSize = parseInt(setting.value.showSize);
	if (setting.value.showSize < 0) setting.value.showSize = raw.showSize;

	setting.value.maxLength = parseInt(setting.value.maxLength);
	if (setting.value.maxLength < 0) setting.value.maxLength = raw.maxLength;

	change();
}

function exportData() {
	send("export");
}

function importData() {
	send("import");
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
	background-color: #efefef;

	.box {
		width: 100%;
		height: 42px;
		display: flex;
		justify-content: space-around;
		align-items: center;

		.left {
			width: 50%;
			height: 100%;
			line-height: 42px;
			padding-left: 15px;
		}

		.right {
			width: 50%;
			height: 100%;
			display: flex;
			justify-content: flex-end;
			align-items: center;
			padding-right: 15px;

			> div {
				display: flex;
				justify-content: flex-end;
				align-items: center;
				height: 100%;
				width: 80px;
			}
		}
	}
}
</style>
