<template>
	<div class="content">
		<v-card class="text" :style="{ width: props.data.blob != '' ? '69%' : '100%' }">
			{{ props.data.item?.text }}
		</v-card>

		<div class="file" v-if="props.data.blob != ''">
			<v-card>
				<img :src="props.data.blob" @load="onLoadImg" />
			</v-card>
		</div>
	</div>
</template>

<script setup>
var props = defineProps({ data: Object });

function onLoadImg() {}

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
	background-color: rgba(0, 0, 0, 0);

	.text {
		width: 69%;
		height: 100%;
		user-select: text;
		overflow: auto;
		background-color: rgba($color: rgb(205, 205, 227), $alpha: 0.3);
		backdrop-filter: blur(6px);
		padding: 4px;
		color: #000;
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
