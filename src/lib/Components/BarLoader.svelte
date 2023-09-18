<script lang="ts">
	export let unit: SpinnerTypes['unit'] = '%';
	export let duration: SpinnerTypes['duration'] = '2.1s';
	export let size: SpinnerTypes['size'] = '100';
	export let pause: SpinnerTypes['pause'] = false;

    export const durationUnitRegex = /[a-zA-Z]/;

    export const range = (size: number, startAt = 0) => [...Array(size).keys()].map((i) => i + startAt);

    type SpinnerTypes = {
        size: string | number;
        color: string;
        unit: string;
        duration: string;
        pause: boolean;
    };
</script>

<div class="wrapper" style="--size: {size}{unit}">
	{#each range(2, 1) as version}
		<div
			class="lines small-lines {version}"
			class:pause-animation={pause}
			style="--duration: {duration};"
		/>
	{/each}
</div>

<style>
	.wrapper {
		height: 5px;
		width: calc(var(--size) * 2);
		background-color: var(--tertiary-container);
		position: absolute;
        left: 0;
		overflow: hidden;
		background-clip: padding-box;
	}
	.lines {
		height: 5px;
		background-color: var(--tertiary);
	}

	.small-lines {
		position: absolute;
		overflow: hidden;
		background-clip: padding-box;
		display: block;
		border-radius: 2px;
		will-change: left, right;
		animation-fill-mode: forwards;
	}
	.small-lines.\31 {
		animation: var(--duration) cubic-bezier(0.65, 0.815, 0.735, 0.395) 0s infinite normal none
			running long;
	}
	.small-lines.\32 {
		animation: var(--duration) cubic-bezier(0.165, 0.84, 0.44, 1) calc((var(--duration) + 0.1) / 2)
			infinite normal none running short;
	}
	.pause-animation {
		animation-play-state: paused;
	}

	@keyframes long {
		0% {
			left: -35%;
			right: 100%;
		}
		60% {
			left: 100%;
			right: -90%;
		}
		100% {
			left: 100%;
			right: -90%;
		}
	}
	@keyframes short {
		0% {
			left: -200%;
			right: 100%;
		}
		60% {
			left: 107%;
			right: -8%;
		}
		100% {
			left: 107%;
			right: -8%;
		}
	}
</style>