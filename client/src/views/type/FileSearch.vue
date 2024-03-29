<template>
	<div class="middle" :class="className" ref="middle" @mouseleave="leave">
		<div
			class="item"
			v-for="(item, i) in items.data"
			ref="itemRef"
			:key="i"
			:class="hoverClass(item)"
			@mouseenter="mouseenter(item, i)"
			@mouseleave="mouseleave(item, i)"
			@contextmenu="contextmenu($event, item, i)"
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
				<div class="time" :style="{ color: [`#333`, `green`, `#999`, `cornflowerblue`][item.time % 4] }">
					{{ item.date }}
				</div>
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

	<transition name="fade">
		<div
			class="preview"
			v-show="previewShow"
			:style="{ top: previewTop }"
			@mouseenter="previewMouseEnter"
			@mouseleave="previewMouseLeave"
		>
			<Preview :data="previewItem"></Preview></div
	></transition>

	<div
		class="rightMenu"
		ref="rightMenu"
		@blur="rightMenuBlur"
		v-show="rightMenuShow"
		:style="{ ...rightMenuPos }"
		:tabindex="0"
	>
		<v-card class="content">
			<div>
				<v-btn variant="flat" @click="openFile">OPEN FILE</v-btn>
			</div>
			<div>
				<v-btn variant="flat" @click="openDir">OPEN DIR</v-btn>
			</div>
			<div>
				<v-btn variant="flat" @click="copyBatch">COPY BATCH</v-btn>
			</div>
		</v-card>
	</div>
</template>

<script setup>
import { ref, onActivated, onDeactivated } from "vue";
import { subscription } from "../../lib/subscription";
import { send } from "../../lib/ipc";
import { format } from "../../lib/utils";
import heart from "@/assets/heart.svg";
import hearted from "@/assets/hearted.svg";
import deleted from "@/assets/deleted.svg";
import Preview from "../../components/Preview.vue";
const path = window.require("path");

function copyBatch(e) {
	send("clipboard-batch", { ...rightMenuItem.value.item });
}

function openFile(e) {
	send("open-file", {
		url: `file://${rightMenuItem.value.item.text}`,
		id: rightMenuItem.value.item.id,
	}).then((res) => {
		if (!res) items.value.data[rightMenuItem.value.i].deleted = true;
	});
}

function openDir(e) {
	send("open-file", {
		url: `file://${path.dirname(rightMenuItem.value.item.text)}`,
		id: rightMenuItem.value.item.id,
	}).then((res) => {
		if (!res) items.value.data[rightMenuItem.value.i].deleted = true;
	});
}

function contextmenu(e, item, i) {
	shouldHover = false;

	clearTimeout(rightMenuBlurHandler);

	var x = e.layerX + 21;
	var y = e.layerY - 5;
	var height = middle.value.clientHeight;
	var width = middle.value.clientWidth;

	var w = 100;
	var h = 36 * 3;

	if (e.layerX + w > width) {
		x = x - w - 42;
	}
	if (e.layerY + h > height) {
		y = y - h;
	}

	rightMenuPos.value = { left: x + "px", top: y + "px" };
	rightMenuShow.value = true;
	// MUST DO THIS OR WILL NOT WORK
	requestAnimationFrame(() => rightMenu.value.focus());

	rightMenuItem.value = { item, i };
}

function rightMenuBlur(e) {
	shouldHover = true;

	rightMenuBlurHandler = setTimeout(
		() => {
			rightMenuShow.value = false;
		},
		process.platform == "win32" ? 300 : 150
	);
}

var setting = ref(subscription.setting());
subscription.on("setting", (res) => {
	setting.value = res;
});

var middle = ref();
var itemRef = ref();
var page = ref(1);
var items = ref({});
var hoverId = ref();
var hoverIndex = -1;
var shouldHover = true;

var previewShow = ref(false);
var previewItem = ref({});
var previewTop = ref(0);
var mouseenterHandler = null;

var rightMenuPos = ref({ top: 0, left: 0 });
var rightMenuShow = ref(false);
var rightMenu = ref();
var rightMenuItem = ref();
var rightMenuBlurHandler = null;
var previewHandler = null;

function preview(itemRef, duration) {
	if (hoverIndex < 0) return;
	clearTimeout(previewHandler);

	previewHandler = setTimeout(() => {
		// NEED A DEFAULT VALUE
		// OR IT WILL FLICKER AND TRIGGER MOUSEENTER AND MOUSELEAVE
		previewItem.value = { item: items.value.data[hoverIndex], blob: "" };

		var react = itemRef.getBoundingClientRect();
		var top = react.bottom - 42;
		let to = 42 + middle.value.clientHeight - react.bottom;
		if (to < 200 + 12) {
			top = react.bottom - 200 - react.height - 42;
		}
		previewTop.value = top + "px";

		send("load-image", { ...items.value.data[hoverIndex] }).then((data) => {
			if (data == null) items.value.data[hoverIndex].deleted = true;
			previewItem.value = { item: items.value.data[hoverIndex], blob: data };
		});

		previewShow.value = true;
		subscription.config().preview = true;
	}, parseInt(duration) || 100);
}

function leave() {
	hoverIndex = -1;
	hoverId.value = null;
}

function mouseenter(item, i) {
	if (!shouldHover) return;
	requestAnimationFrame(() => {
		hoverId.value = item.id;
		hoverIndex = i;
	});
}

function mouseleave(duration) {
	if (!shouldHover) return;
	if (!previewShow.value) return;
	mouseenterHandler = setTimeout(() => {
		previewMouseLeave();
	}, parseInt(duration) || 200);
}

function previewMouseEnter() {
	clearTimeout(mouseenterHandler);
}

function previewMouseLeave() {
	if (!previewShow.value) return;
	requestAnimationFrame(() => {
		previewShow.value = false;
		subscription.config().preview = false;
		window.getSelection().empty();
	});
}

var data = {};

onActivated(() => {
	subscription.on("onkeydown", (e) => {
		if (e.control || e.meta || e.alt || e.shift) return;

		if (e.code == "KeyA" || e.code == "ArrowLeft") {
			if (page.value == 1) return;
			page.value--;
			update();
			mouseleave();
			return;
		}

		if (e.code == "KeyD" || e.code == "ArrowRight") {
			if (page.value == getLen()) return;
			page.value++;
			update();
			mouseleave();
			return;
		}

		if (e.code == "KeyW" || e.code == "ArrowUp") {
			if (hoverIndex < 1) hoverIndex = 1;
			hoverIndex--;
			hoverId.value = items.value.data[hoverIndex]?.id;

			let react = itemRef.value[hoverIndex].getBoundingClientRect();
			let to = react.top - 42;
			if (to < 0) {
				middle.value.scrollBy({ top: -react.height * 5, behavior: "smooth" });
			}

			if (previewShow.value) {
				preview(itemRef.value[hoverIndex]);
			} else {
				mouseleave();
			}

			return;
		}

		if (e.code == "KeyS" || e.code == "ArrowDown") {
			if (hoverIndex > items.value.data.length - 2) hoverIndex = items.value.data.length - 2;
			hoverIndex++;
			hoverId.value = items.value.data[hoverIndex]?.id;

			let react = itemRef.value[hoverIndex].getBoundingClientRect();
			let to = react.bottom - 42 - middle.value.clientHeight;
			if (to > 0) {
				middle.value.scrollBy({ top: react.height * 5, behavior: "smooth" });
			}

			if (previewShow.value) {
				preview(itemRef.value[hoverIndex]);
			} else {
				mouseleave();
			}

			return;
		}
	});

	subscription.on("onkeyup", (e) => {
		if (e.code == "Space") {
			if (!previewShow.value) {
				preview(itemRef.value[hoverIndex], 10);
			} else {
				mouseleave(100);
			}
			return;
		}

		if (e.code == "Escape") {
			mouseleave(100);
			return;
		}

		if (e.code == "Enter") {
			if (hoverIndex < 0) return;
			onSelect(items.value.data[hoverIndex]);
			return;
		}

		if (e.code == "NumpadEnter") {
			if (hoverIndex < 0) return;
			onSelect(items.value.data[hoverIndex]);
			return;
		}
	});
});

onDeactivated(() => {
	subscription.remove("onkeydown");
	subscription.remove("onkeyup");
});

function onDelete(item) {
	items.value.total--;
	var index = data.data.findIndex((e) => e.id == item.id);
	if (index != -1) data.data.splice(index, 1);
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

subscription.on("file-search", (info) => {
	send("get-clipboard-file-search", { filter: info.text, favorite: info.favorite }).then((v) => {
		page.value = 1;
		data = v;
		items.value = { total: v.total, size: v.size };
		update();
	});
});

function update() {
	var res = items.value;
	res.data = data.data.slice((page.value - 1) * res.size, (page.value - 1) * res.size + res.size);
	res.data = format(res.data);
	items.value = res;
	hoverIndex = -1;
	hoverId.value = items.value.data[hoverIndex]?.id;
}

var onPageChange = () => update();

function onSelect(item) {
	if (rightMenuShow.value) return;
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
