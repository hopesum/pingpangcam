<template>
	<div>
		<video :autoplay="true" :src="video"></video>
	</div>
</template>

<script>
	export default {
		data() {
			return {
				video: ''
			}
		},
		onLoad(params) {
			this.video = params.video
		}
	}
</script>

<style lang="scss" scoped>
	video{
		width: 100%;
	}
</style>
