<template>
	<div class="middle">
		<div class="item" v-for="(item, i) in items" :key="i">
			<div class="title">{{ item.time }}</div>
			<div v-if="clickToCopy" class="value" @click="onSelect(item)">{{ item.text }}</div>
			<div v-else class="value" @dblclick="onSelect(item)">{{ item.text }}</div>
		</div>
	</div>
	<div class="bottom">
		<v-pagination v-model="page" :length="getLength()" :total-visible="6" density="compact" v-on:update:model-value="onPageChange"></v-pagination>
	</div>
</template>

<script setup>
import { ref } from "vue";
import dayjs from "dayjs";
import { subscription } from "../../lib/subscription";
import { send } from "../../lib/ipc";

var clickToCopy = ref(subscription.setting().clickToCopy);
subscription.on("setting", (setting) => {
	clickToCopy.value = setting.clickToCopy;
});

var maxLength = 1000;
var files = ref(subscription.files());
var items = ref(files.value.slice(0, 15));
formatItems();

subscription.on("files", (v) => {
	for (let i = 0; i < v.file.length; i++) {
		files.value.unshift({ file: v.file[i], time: v.time });
	}
	if (files.value.length > maxLength) files.value.splice(maxLength);
	items.value = files.value.slice(0, 15);
	formatItems();
});

var page = ref(1);
function changeItemsPage(res) {
	items.value = res.value.slice((page.value - 1) * 15, (page.value - 1) * 15 + 15);
	formatItems();
}

function formatItems() {
	var res = [];
	for (let i = 0; i < items.value.length; i++) {
		const element = items.value[i];
		res.push({ text: element.file, time: dayjs(element.time).format("MM-DD HH:mm:ss") });
	}
	items.value = res;
}

function getResLen(res) {
	return parseInt(res.value.length / 15) + 1;
}

function onPageChange(e) {
	changeItemsPage(files);
}

function getLength() {
	return getResLen(files);
}

function onSelect(item) {
	console.log(item);
	send("clipboard-file", item.text);
	send("hide-window");
}
</script>

<style scoped lang="scss">
.middle {
	width: 100%;
	height: calc(100% - 48px);

	.item {
		width: 100%;
		height: calc(100% / 15);
		justify-content: flex-start;
		display: flex;
		align-items: center;
		padding: 5px;
		cursor: pointer;
		&:hover {
			background-color: burlywood;
		}

		.title {
			width: 130px;
			height: 100%;
		}

		.value {
			width: calc(100% - 130px);
			height: 100%;
			text-overflow: ellipsis;
			white-space: nowrap;
			overflow: hidden;
			font-weight: 600;
		}
	}
}

.bottom {
	width: 100%;
	height: 48px;
	display: flex;
	justify-content: center;
	align-items: flex-end;
}
</style>
