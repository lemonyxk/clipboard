<template>
	<div class="middle">
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
	send("get-clipboard-file", { page: page.value, favorite: subscription.config().favorite }).then((res) => {
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
	update();
});
onDeactivated(() => {
	subscription.remove("onkeydown");
});

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
//
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
		padding: 5px 10px 5px 10px;
		cursor: pointer;
		&:hover {
			background-color: burlywood;
		}

		.title {
			width: 150px;
			height: 100%;
			color: #666;
			justify-content: flex-end;
			display: flex;
			align-items: center;

			.time {
				width: 120px;
				height: 100%;
				justify-content: flex-end;
				display: flex;
				align-items: center;
			}

			.favorite {
				width: 30px;
				height: 100%;
				justify-content: flex-end;
				display: flex;
				align-items: center;
				img {
					width: 16px;
					height: 16px;
				}
			}
		}

		.value {
			width: calc(100% - 150px);
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
	justify-content: flex-start;
	align-items: flex-end;
}
</style>
