<script setup>
import { useRouter } from "vue-router";
import { ref } from "vue";
import { subscription } from "../lib/subscription";
import pin from "@/assets/pin.svg";
import pined from "@/assets/pined.svg";
import document from "@/assets/document.svg";
import documented from "@/assets/documented.svg";
import text from "@/assets/text.svg";
import texted from "@/assets/texted.svg";
import heart from "@/assets/heart.svg";
import hearted from "@/assets/hearted.svg";
import { send } from "@/lib/ipc";
import { loadTheme } from "@/theme/theme";

subscription.on("setting", () => {
	loadTheme();
});

var router = useRouter();
router.beforeEach((to, from) => {});

var show = ref(true);
var input = ref();
var searchText = ref("");

subscription.on("mainWindow-focus", () => {
	show.value = true;
});

subscription.on("mainWindow-hide", () => {
	show.value = false;
});

function resetSearch() {
	searchText.value = "";
	input.value.blur();

	router.push({ path: "/" + path });
}

function onSearch() {
	if (searchText.value == "") return resetSearch();

	input.value.blur();
	router.push({ path: `/${path}-search` }).then(() => {
		subscription.emit(`${path}-search`, { text: searchText.value, favorite: isFavorite.value });
	});
}

function onKeyEnter(e) {
	// e.stopPropagation();
	// e.preventDefault();
	if (e.code == "Escape") return resetSearch();
	if (e.code == "Enter") return onSearch();
	if (e.code == "NumpadEnter") return onSearch();
}

function onBlur() {
	subscription.startKey();
	if (searchText.value == "") return resetSearch();
}

function onFocus() {
	subscription.stopKey();
}

var isPin = ref(false);
function onPin() {
	isPin.value = !isPin.value;
	subscription.config().pin = isPin.value;
}

var path = "text";

var isDocument = ref(false);
function onDocument() {
	isDocument.value = true;
	isText.value = false;

	searchText.value = "";
	path = "file";
	router.push({ path: "/file" });
}

var isText = ref(true);
function onText() {
	isText.value = true;
	isDocument.value = false;

	searchText.value = "";
	path = "text";
	router.push({ path: "/text" });
}

var isFavorite = ref(false);
function onFavorite() {
	isFavorite.value = !isFavorite.value;
	subscription.config().favorite = isFavorite.value;
	subscription.emit(`favorite-${path}`);
}

subscription.on("onkeydown", (e) => {
	if (e.code == "Escape") {
		if (searchText.value == "" && !input.value.active) {
			// DISABLE MAC NOISE
			requestAnimationFrame(() => !subscription.config().preview && send("hide-window"));
		} else {
			searchText.value = "";
			onBlur();
		}
		return;
	}
	if (e.code == "Tab") return requestAnimationFrame(() => input.value.focus());
	if (e.code == "Enter") return onSearch();
	if (e.code == "NumpadEnter") return onSearch();
	if ((e.code == "KeyQ" && e.alt) || e.code == "Digit1") return onText();
	if ((e.code == "KeyW" && e.alt) || e.code == "Digit2") return onDocument();
	if ((e.code == "KeyE" && e.alt) || e.code == "Digit3") return onFavorite();
	if ((e.code == "KeyR" && e.alt) || e.code == "Digit4") return onPin();
});

//
</script>

<template>
	<div class="index">
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
				ref="input"
				:autofocus="false"
				@click:clear="resetSearch"
				@click:append-inner="onSearch"
				@keydown="onKeyEnter"
				@blur="onBlur"
				@focus="onFocus"
			></v-text-field>
		</div>

		<div class="middle">
			<div class="left">
				<div class="text" v-if="isText"><img :src="texted" @click="onText" title="Text Mode" /></div>
				<div class="text" v-else><img :src="text" @click="onText" title="Document Mode" /></div>

				<div class="document" v-if="isDocument"><img :src="documented" @click="onDocument" title="Document Mode" /></div>
				<div class="document" v-else><img :src="document" @click="onDocument" title="Text Mode" /></div>

				<div class="favorite" v-if="isFavorite"><img :src="hearted" @click="onFavorite" title="Favorite Mode" /></div>
				<div class="favorite" v-else><img :src="heart" @click="onFavorite" title="Favorite Mode" /></div>

				<div class="pin" v-if="isPin"><img :src="pined" @click="onPin" title="UnPin" /></div>
				<div class="pin" v-else><img :src="pin" @click="onPin" title="Pined" /></div>
			</div>
			<div class="right" v-show="show">
				<router-view v-slot="{ Component }">
					<keep-alive>
						<component :is="Component" :key="$route.fullPath" />
					</keep-alive>
				</router-view>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
.index {
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: flex-start;
	flex-direction: column;
	border-radius: 10px;

	.top {
		width: 100%;
		height: 42px;
		display: flex;
		justify-content: center;
		align-items: flex-start;
		border-radius: 10px;

		.v-input {
			height: 42px;

			:deep(.v-input__control .v-field) {
				background-color: rgb(60, 105, 202);
				color: white;
				border-radius: 8px 8px 0 0;
			}
		}
	}

	.middle {
		width: 100%;
		height: calc(100% - 42px);
		display: flex;
		justify-content: center;
		align-items: flex-start;
		position: relative;
		border-radius: 10px;

		.right {
			// width: calc(100% - 24px);
			width: 100%;
			height: 100%;
			border-radius: 10px;
		}

		.left {
			width: 50%;
			height: 42px;
			display: flex;
			justify-content: flex-end;
			align-items: center;

			position: absolute;
			bottom: 0;
			right: 0;
			-webkit-app-region: drag;
			border-radius: 10px;
			cursor: move;

			div {
				width: 40px;
				height: 42px;
				display: flex;
				justify-content: center;
				align-items: center;
				padding: 0 10px;
				-webkit-app-region: no-drag;
				cursor: default;
				img {
					width: 18px;
					height: 18px;
					-webkit-user-drag: none;
					cursor: pointer;
				}
			}
		}
	}
}
</style>
