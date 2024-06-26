<template>
	<div class="middle" :class="className" ref="middle" @mouseleave="leave">
		<div
			class="item"
			v-for="(item, i) in items.data"
			ref="itemRef"
			:key="i"
			:class="hoverId == item.id ? 'hover' : ''"
			@mouseenter="mouseenter(item, i)"
			@mouseleave="mouseleave(item, i)"
		>
			<div v-if="setting.clickToCopy" class="value" @click="onSelect(item)">{{ item.text.length > 512 ? item.text.slice(0, 512) + "..." : item.text }}</div>
			<div v-else class="value" @dblclick="onSelect(item)">{{ item.text.length > 512 ? item.text.slice(0, 512) + "..." : item.text }}</div>

			<div class="title">
				<div class="favorite">
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
			<v-pagination v-model="page" :length="getLen()" :total-visible="6" density="compact" v-on:update:model-value="onPageChange"></v-pagination>
		</div>
	</div>
	<transition name="fade">
		<div class="preview" v-show="previewShow" :style="{ top: previewTop }" @mouseenter="previewMouseEnter" @mouseleave="previewMouseLeave">
			<Preview :data="previewItem"></Preview>
		</div>
	</transition>
</template>

<script setup>
import { onActivated, ref, onDeactivated } from "vue";
import { subscription } from "../../lib/subscription";
import { send } from "../../lib/ipc";
import { format } from "../../lib/utils";
import heart from "@/assets/heart.svg";
import hearted from "@/assets/hearted.svg";
import Preview from "../../components/Preview.vue";

var setting = ref(subscription.setting());
subscription.on("setting", (res) => {
	setting.value = res;
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
var previewHandler = null;

function preview(itemRef, duration) {
	if (hoverIndex < 0) return;
	clearTimeout(previewHandler);
	previewHandler = setTimeout(() => {
		previewItem.value = { item: items.value.data[hoverIndex], blob: "" };

		var react = itemRef.getBoundingClientRect();
		var top = react.bottom - 42;
		let to = 42 + middle.value.clientHeight - react.bottom;
		if (to < 200 + 24) {
			top = react.bottom - 200 - react.height - 42;
		}
		previewTop.value = top + "px";

		previewShow.value = true;
		subscription.config().preview = true;
	}, parseInt(duration) || 100);
}

function leave() {
	hoverIndex = -1;
	hoverId.value = null;
}

function mouseenter(item, i) {
	requestAnimationFrame(() => {
		hoverId.value = item.id;
		hoverIndex = i;
	});
}

function mouseleave(duration) {
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

	if (subscription.config().favorite) {
		page.value = 1;
	}

	update();
});

onDeactivated(() => {
	subscription.remove("onkeydown");
	subscription.remove("onkeyup");
});

function update() {
	send("get-clipboard-text", { page: page.value, favorite: subscription.config().favorite }).then((res) => {
		res.data = format(res.data);
		items.value = res;
		hoverIndex = -1;
		hoverId.value = items.value.data[hoverIndex]?.id;
	});
}

subscription.on("data", (v) => isShow && update());
subscription.on("favorite-text", () => {
	page.value = 1;
	update();
});

var onPageChange = () => update();

function onSelect(item) {
	send("clipboard-text", item.text);
	send("hide-window");
}

function onHeart(item) {
	send("clipboard-favorite", { type: "text", id: item.id });
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
