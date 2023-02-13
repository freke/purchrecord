<header class="primary-container">
	<nav>
		<button class="circle transparent">
			<i>menu</i>
		</button>
		<h5 class="max center-align">PurchRecord</h5>
		<button class="circle transparent" on:click={() => activePage = 'new'}>
			<i>add_circle</i>
		</button>
		<button class="circle transparent" on:click={() => activePage = 'report'}>
			<i>calendar_month</i>
		</button>
	</nav>
</header>

<main class="responsive">
	<div class="page left" class:active={activePage=='new'}>
		<Form />
	</div>
	<div class="page right" class:active={activePage=='report'}>
		<Records />
	</div>
</main>

<script lang="ts">
	import "beercss";
	import "material-dynamic-colors";

	import Form from './lib/Form.svelte';
	import Records from './lib/Report.svelte';

	let activePage = 'new';
</script>

<svelte:head>
	<!-- Fonts -->
	<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Outlined">
	<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,600,700">
</svelte:head>

<style>
</style>