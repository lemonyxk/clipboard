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
import { ref, onActivated, onDeactivated } from "vue";
import { subscription } from "../../lib/subscription";
import { send } from "../../lib/ipc";
import { format } from "../../lib/utils";
import heart from "@/assets/heart.svg";
import hearted from "@/assets/hearted.svg";

var clickToCopy = ref(subscription.setting().clickToCopy);
subscription.on("mainWindow-focus", () => {
	clickToCopy.value = subscription.setting().clickToCopy;
});

var page = ref(1);
var items = ref({});
var hoverId = ref();

var data = {};

onActivated(() => {
	subscription.on("onkeydown", (e) => {
		if (e.code == "KeyA" || e.code == "ArrowLeft") {
			if (page.value == 1) return;
			page.value--;
			onPageChange();
		}
		if (e.code == "KeyD" || e.code == "ArrowRight") {
			if (page.value == getLen()) return;
			page.value++;
			onPageChange();
		}
	});
});
onDeactivated(() => {
	subscription.remove("onkeydown");
});

subscription.on("text-search", (info) => {
	send("get-clipboard-text-search", { filter: info.text, favorite: info.favorite }).then((v) => {
		page.value = 1;
		data = v;
		var res = {
			data: v.data.slice((page.value - 1) * v.size, (page.value - 1) * v.size + v.size),
			total: v.total,
			size: v.size,
		};
		res.data = format(res.data);
		items.value = res;
	});
});

function onPageChange(e) {
	var res = items.value;
	res.data = data.data.slice((page.value - 1) * res.size, (page.value - 1) * res.size + res.size);
	res.data = format(res.data);
	items.value = res;
}

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
