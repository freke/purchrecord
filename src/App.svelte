<nav class="top">
	<h5 class="max center-align">PurchRecord</h5>
</nav>
<nav class="bottom">
	<GoogleSync />
</nav>
<main class="responsive">	
	<div>
		<Summary />

		<div class="medium-divider"></div>

		<div class="tabs">
		  <a class:active={activePage=='new'} on:click={() => activePage = 'new'}>
			<i>add_circle</i>
			<span>New</span>
		  </a>
		  <a class:active={activePage=='report'} on:click={() => activePage = 'report'}>
			<i>calendar_month</i>
			<span>Report</span>
		  </a>
		</div>
		<div class="page padding left" class:active={activePage=='new'}>
			<Form />
		</div>
		<div class="page padding right" class:active={activePage=='report'}>
			<Records />
		</div>
	</div>
</main>

<script lang="ts">
	import "beercss";
	import "material-dynamic-colors";

	import Summary from './lib/Summary.svelte';
	import Form from './lib/Form.svelte';
	import Records from './lib/Report.svelte';
	import GoogleSync from './lib/GoogleSync.svelte';

	let activePage = 'new';
</script>

<svelte:head>
	<!-- Fonts -->
	<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Outlined">
	<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,600,700">
</svelte:head>

<style>
</style>