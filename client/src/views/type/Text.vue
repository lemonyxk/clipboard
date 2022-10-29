<template>
	<div class="middle" :class="className">
		<div class="item" v-for="(item, i) in items.data" :key="i" @mouseenter="hoverId = item.id" @mouseleave="hoverId = 0">
			<div v-if="clickToCopy" class="value" @click="onSelect(item)">{{ item.text }}</div>
			<div v-else class="value" @dblclick="onSelect(item)">{{ item.text }}</div>

			<div class="title">
				<div class="favorite">
					<img :src="hearted" :hidden="!item.favorite" v-if="item.favorite" @click="onHeart(item)" />
					<img :src="heart" :hidden="hoverId != item.id" v-else @click="onHeart(item)" />
				</div>
				<div class="time">{{ item.time }}</div>
			</div>
		</div>
	</div>
	<div class="bottom">
		<v-pagination v-model="page" :length="getLen()" :total-visible="6" density="compact" v-on:update:model-value="onPageChange"></v-pagination>
	</div>
</template>

<script setup>
import { onActivated, ref, onDeactivated } from "vue";
import { subscription } from "../../lib/subscription";
import { send } from "../../lib/ipc";
import { format } from "../../lib/utils";
import heart from "@/assets/heart.svg";
import hearted from "@/assets/hearted.svg";

var isShow = true;

var clickToCopy = ref(subscription.setting().clickToCopy);
subscription.on("mainWindow-focus", () => {
	clickToCopy.value = subscription.setting().clickToCopy;
	isShow = true;
	update();
});

subscription.on("mainWindow-hide", () => (isShow = false));

var page = ref(1);
var items = ref({});
var hoverId = ref();

function update() {
	send("get-clipboard-text", { page: page.value, favorite: subscription.config().favorite }).then((res) => {
		res.data = format(res.data);
		items.value = res;
	});
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
	});

	if (subscription.config().favorite) {
		page.value = 1;
	}

	update();
});
onDeactivated(() => {
	subscription.remove("onkeydown");
});

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
