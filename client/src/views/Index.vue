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

var router = useRouter();

var show = ref(false);
subscription.wait().then(() => (show.value = true));

var input = ref();
var searchText = ref("");
function resetSearch(e) {
	router.push({ path: "/" + path });
	return input.value.blur();
}

function onSearch(e) {
	if (searchText.value == "") {
		resetSearch();
		return input.value.blur();
	}

	var p = path == "normal" ? "search" : "filesSearch";
	router.push({ path: "/" + p, query: { text: searchText.value } }).then(() => {
		subscription.emit(p, searchText.value);
	});
}

function onKeyEnter(e) {
	if (e.code == "Escape") return e.target.blur();
	if (e.code == "Enter") return onSearch(e);
	if (e.code == "NumpadEnter") return onSearch(e);
}

function onBlur(e) {
	if (searchText.value == "") {
		resetSearch();
	}
}

var isPin = ref(false);
function onPin() {
	isPin.value = !isPin.value;
	subscription.config().pin = isPin.value;
}

var path = "normal";

var isDocument = ref(false);
function onDocument() {
	isDocument.value = true;
	isText.value = false;

	path = "files";
	router.push({ path: "/files" });
}

var isText = ref(true);
function onText() {
	isText.value = true;
	isDocument.value = false;

	path = "normal";
	router.push({ path: "/normal" });
}

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
				@click:clear="resetSearch"
				@click:append-inner="onSearch"
				@keydown="onKeyEnter"
				@blur="onBlur"
			></v-text-field>
		</div>

		<div class="middle">
			<div class="left">
				<div class="text" v-if="isText"><img :src="texted" @click="onText" title="Text Mode" /></div>
				<div class="text" v-else><img :src="text" @click="onText" title="Document Mode" /></div>

				<div class="document" v-if="isDocument"><img :src="documented" @click="onDocument" title="Document Mode" /></div>
				<div class="document" v-else><img :src="document" @click="onDocument" title="Text Mode" /></div>

				<div class="pin" v-if="isPin"><img :src="pined" @click="onPin" title="UnPin" /></div>
				<div class="pin" v-else><img :src="pin" @click="onPin" title="Pined" /></div>
			</div>

			<div class="right">
				<router-view v-slot="{ Component }" v-if="show">
					<keep-alive>
						<component :is="Component" />
					</keep-alive>
				</router-view>
			</div>
		</div>
	</div>

	<!-- <v-snackbar :timeout="1500" v-model="open" location="top"> copy success </v-snackbar> -->
</template>

<style scoped lang="scss">
.index {
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: flex-start;
	flex-direction: column;

	.top {
		width: 100%;
		height: 42px;
		display: flex;
		justify-content: center;
		align-items: flex-start;

		.v-input {
			::v-deep .v-input__control .v-field {
				background-color: rgb(60, 105, 202);
				color: white;
				border-radius: 0;
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

		.right {
			// width: calc(100% - 24px);
			width: 100%;
			height: 100%;
		}

		.left {
			// width: 24px;
			// height: 100%;
			// display: flex;
			// justify-content: flex-start;
			// align-items: center;
			// flex-direction: column;

			width: 200px;
			height: 38px;
			display: flex;
			justify-content: flex-end;
			align-items: center;
			// flex-direction: column;

			position: absolute;
			bottom: 0;
			right: 0;

			div {
				width: 18px;
				height: 18px;
				display: flex;
				justify-content: center;
				align-items: center;
				margin: 0 10px;

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
