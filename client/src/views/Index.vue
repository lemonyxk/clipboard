<script setup>
import { onMounted, ref } from "vue";
import dayjs from "dayjs";
const { ipcRenderer, clipboard } = window.require("electron");

onMounted(() => {});

var maxLength = 1000;
var data = ref([]);
var items = ref([]);
var searchData = ref([]);

ipcRenderer.send("init-clipboard");
ipcRenderer.on("init-clipboard", (e, v) => {
	for (let i = 0; i < v.length; i++) {
		data.value.push(v[i]);
	}
	if (data.value.length > maxLength) data.value.splice(maxLength);
	items.value = data.value.slice(0, 15);
	formatItems();
});

function updateItems(res) {
	items.value = res.value.slice(0, 15);
	formatItems();
}

var page = ref(1);
function changeItemsPage(res) {
	items.value = res.value.slice((page.value - 1) * 15, (page.value - 1) * 15 + 15);
	formatItems();
}

function formatItems() {
	var res = [];
	for (let i = 0; i < items.value.length; i++) {
		const element = items.value[i];
		res.push({ text: element.text, time: dayjs(element.time).format("MM-DD HH:mm:ss") });
	}
	items.value = res;
}

function getResLen(res) {
	return parseInt(res.value.length / 15) + 1;
}

ipcRenderer.on("update-clipboard", (e, v) => {
	data.value.unshift(v);
	if (data.value.length > maxLength) data.value.splice(maxLength);
	if (mode == "normal") updateItems(data);
});

function onPageChange(e) {
	if (mode == "normal") {
		changeItemsPage(data);
	} else {
		changeItemsPage(searchData);
	}
}

function getLength() {
	if (mode == "normal") {
		return getResLen(data);
	} else {
		return getResLen(searchData);
	}
}

function onSelect(item) {
	clipboard.writeText(item.text, "clipboard");
	ipcRenderer.send("hide-window");
}

var searchText = ref("");
var mode = "normal";
function resetSearch() {
	mode = "normal";
	page.value = 1;
	updateItems(data);
}

function onSearch(e) {
	if (searchText.value == "") {
		resetSearch();
		return e.target.blur();
	}

	mode = "search";
	searchData.value = [];
	for (let i = 0; i < data.value.length; i++) {
		const element = data.value[i];
		if (element.text?.includes(searchText.value)) {
			searchData.value.push(element);
		}
	}
	page.value = 1;
	updateItems(searchData);
}

function onKeyEnter(e) {
	if (e.code == "Enter") onSearch(e);
}

//
</script>

<template>
	<div class="top">
		<v-text-field
			v-model="searchText"
			density="compact"
			variant="solo"
			label="search"
			append-inner-icon="mdi-magnify"
			clearable
			single-line
			hide-details
			spellcheck="false"
			@click:clear="resetSearch"
			@click:append-inner="onSearch"
			@keydown="onKeyEnter"
		></v-text-field>
	</div>

	<div class="middle">
		<div class="item" v-for="(item, i) in items" :key="i">
			<div class="title">{{ item.time }}</div>
			<div class="value" @dblclick="onSelect(item)">{{ item.text }}</div>
		</div>
	</div>
	<div class="bottom">
		<v-pagination v-model="page" :length="getLength()" :total-visible="6" density="compact" v-on:update:model-value="onPageChange"></v-pagination>
	</div>

	<!-- <v-snackbar :timeout="1500" v-model="open" location="top"> copy success </v-snackbar> -->
</template>

<style scoped lang="scss">
.top {
	width: 100%;
	height: 48px;
	display: flex;
	justify-content: center;
	align-items: flex-start;
	.v-input {
		::v-deep .v-input__control .v-field {
			background-color: rgb(60, 105, 202);
			color: white;
		}
	}
}

.v-overlay {
	width: 500px;
	height: 600px;
}

.middle {
	width: 100%;
	height: calc(600px - 48px - 48px);

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
			width: 110px;
			height: 100%;
		}

		.value {
			width: calc(100% - 110px);
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
