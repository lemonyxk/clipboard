<template>
	<div class="content">
		<v-card class="text" :style="{ width: props.data.blob != '' ? '69%' : '100%' }">
			{{ props.data.item?.text }}
		</v-card>

		<div class="file" v-if="props.data.blob != ''">
			<v-card>
				<img :src="props.data.blob" />
			</v-card>
		</div>
	</div>
</template>

<script setup>
import { send } from "@/lib/ipc";
import { onUpdated, ref } from "vue";

var props = defineProps({ data: Object });

//
</script>

<style lang="scss" scoped>
.content {
	width: 100%;
	height: 100%;
	padding: 12px;
	display: flex;
	justify-content: flex-start;
	align-items: center;
	// background-color: rgba($color: #333, $alpha: 0.8);

	.text {
		width: 69%;
		height: 100%;
		user-select: text;
		overflow: auto;
		// background-color: #e4dfd1;
		background-color: rgba($color: #f3f3f3, $alpha: 0.7);
		backdrop-filter: blur(6px);
		padding: 4px;
		color: #222;
	}

	.file {
		width: 29%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: rgba($color: #333, $alpha: 0);
		margin-left: 2%;

		.v-card {
			width: 100%;
			height: 100%;
			display: flex;
			justify-content: center;
			align-items: center;
			background-color: rgba($color: #333, $alpha: 0);
			backdrop-filter: blur(6px);

			img {
				width: auto;
				height: 100%;
			}
		}
	}
}
</style>
