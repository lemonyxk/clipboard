<template>
	<div class="middle" :class="className" ref="middle">
		<div
			class="item"
			v-for="(item, i) in items.data"
			ref="itemRef"
			:key="i"
			:class="hoverClass(item)"
			@mouseenter="mouseenter(item, i)"
			@mouseleave="mouseleave(item, i)"
		>
			<div v-if="setting.clickToCopy" class="value" @click="onSelect(item)">{{ item.text }}</div>
			<div v-else class="value" @dblclick="onSelect(item)">{{ item.text }}</div>

			<div class="title">
				<div class="favorite" v-if="item.deleted">
					<img :src="deleted" @click="onDelete(item)" />
				</div>
				<div class="favorite" v-else>
					<img :src="hearted" :hidden="!item.favorite" v-if="item.favorite" @click="onHeart(item)" />
					<img :src="heart" :hidden="hoverId != item.id" v-else @click="onHeart(item)" />
				</div>
				<div class="time">{{ item.time }}</div>
			</div>
		</div>
	</div>
	<div class="bottom">
		<div class="left">
			<v-pagination
				v-model="page"
				:length="getLen()"
				:total-visible="6"
				density="compact"
				v-on:update:model-value="onPageChange"
			></v-pagination>
		</div>
	</div>

	<div class="preview" v-show="previewShow" :style="{ top: previewTop }" @mouseenter="previewMouseEnter" @mouseleave="previewMouseLeave">
		<Preview :data="previewItem"> </Preview>
	</div>
</template>

<script setup>
import { onActivated, ref, onDeactivated } from "vue";
import { subscription } from "../../lib/subscription";
import { send } from "../../lib/ipc";
import { format } from "../../lib/utils";
import heart from "@/assets/heart.svg";
import hearted from "@/assets/hearted.svg";
import deleted from "@/assets/deleted.svg";
import Preview from "../../components/Preview.vue";

var setting = ref(subscription.setting());
subscription.on("setting", (setting) => {
	setting.value = setting;
});

var isShow = true;
subscription.on("mainWindow-focus", () => {
	isShow = true;
	update();
});

subscription.on("mainWindow-hide", () => (isShow = false));

var middle = ref();
var itemRef = ref();
var page = ref(1);
var items = ref({});
var hoverId = ref();
var hoverIndex = -1;

var previewShow = ref(false);
var previewItem = ref({});
var previewTop = ref(0);
var mouseenterHandler = null;

function preview(itemRef) {
	if (hoverIndex < 0) return;

	subscription.stopKeyDown();

	send("load-image", { ...items.value.data[hoverIndex] }).then((data) => {
		if (!data) items.value.data[hoverIndex].deleted = true;
		previewItem.value = { item: items.value.data[hoverIndex], blob: data };
	});

	var react = itemRef.getBoundingClientRect();
	var top = react.bottom - 42;
	let to = 42 + middle.value.clientHeight - react.bottom;
	if (to < 200 + 12) {
		top = react.bottom - 200 - react.height - 42;
	}
	previewTop.value = top + "px";

	previewShow.value = true;
}

function mouseenter(item, i) {
	hoverId.value = item.id;
	hoverIndex = i;
}

function mouseleave(item) {
	mouseenterHandler = setTimeout(() => {
		previewShow.value = false;
		subscription.startKeyDown();
	}, 200);
}

function previewMouseEnter() {
	clearTimeout(mouseenterHandler);
}

function previewMouseLeave() {
	previewShow.value = false;
	subscription.startKeyDown();
}

onActivated(() => {
	subscription.on("onkeydown", (e) => {
		if (e.code == "KeyA" || e.code == "ArrowLeft") {
			if (page.value == 1) return;
			page.value--;
			update();
		}
		if (e.code == "KeyD" || e.code == "ArrowRight") {
			if (page.value == getLen()) return;
			page.value++;
			update();
		}
		if (e.code == "ArrowUp") {
			if (hoverIndex < 1) hoverIndex = 1;
			hoverIndex--;
			hoverId.value = items.value.data[hoverIndex]?.id;

			let react = itemRef.value[hoverIndex].getBoundingClientRect();
			let to = react.top - 42;
			if (to < 0) {
				middle.value.scrollBy({ top: -react.height * 5, behavior: "smooth" });
			}
		}
		if (e.code == "ArrowDown") {
			if (hoverIndex > items.value.data.length - 2) hoverIndex = items.value.data.length - 2;
			hoverIndex++;
			hoverId.value = items.value.data[hoverIndex]?.id;

			let react = itemRef.value[hoverIndex].getBoundingClientRect();
			let to = react.bottom - 42 - middle.value.clientHeight;
			if (to > 0) {
				middle.value.scrollBy({ top: react.height * 5, behavior: "smooth" });
			}
		}

		if (e.code == "Space") {
			preview(itemRef.value[hoverIndex]);
		}
	});

	if (subscription.config().favorite) {
		page.value = 1;
	}

	update();
});

onDeactivated(() => {
	subscription.remove("onkeydown");
});

function onDelete(item) {
	send("delete-file", { ...item }).then(() => update());
}

function hoverClass(item) {
	var className = [];
	if (hoverId.value == item.id) {
		className.push("hover");
	}
	if (item.deleted) {
		className.push("deleted");
	}
	return className.join(" ");
}

function update() {
	send("get-clipboard-file", { page: page.value, favorite: subscription.config().favorite }).then((res) => {
		res.data = format(res.data);
		items.value = res;
		hoverIndex = -1;
		hoverId.value = items.value.data[hoverIndex]?.id;
	});
}

subscription.on("file", (v) => isShow && update());
subscription.on("favorite-file", (v) => {
	page.value = 1;
	update();
});

var onPageChange = () => update();

function onSelect(item) {
	send("clipboard-file", item.text);
	send("hide-window");
}

function onHeart(item) {
	send("clipboard-favorite", { type: "file", id: item.id });
	item.favorite = !item.favorite;
}

function getLen() {
	return parseInt((items.value.total + items.value.size - 1) / items.value.size) || 1;
}

var className = ref("opacityAnimation");

//
</script>

<style scoped lang="scss">
@import "./common.scss";
</style>