<TopAppBar variant="static">
	<Row>
		<Section>
			<Title>PurchRecord</Title>
		</Section>
		<Section align="end" toolbar>
			<IconButton aria-label="New" on:click={() => activePage = 'new'} pressed={activePage=='new'}>
				<Icon class="material-icons" on>add_circle</Icon>
    			<Icon class="material-icons">add_circle_outline</Icon>
			</IconButton>
			<IconButton aria-label="History" on:click={() => activePage = 'report'} pressed={activePage=='report'}>
				<Icon class="material-icons" on>calendar_month</Icon>
    			<Icon class="material-icons-outlined">calendar_month</Icon>
			</IconButton>
		</Section>
	</Row>
</TopAppBar>

<main style="padding: 1em;">
	{#if activePage=='new'}
		<Form />
	{/if}
	{#if activePage=='report'}
		<Records />
	{/if}
</main>

<script lang="ts">
	import TopAppBar, { Row, Section, Title } from '@smui/top-app-bar';
	import IconButton, { Icon } from '@smui/icon-button';

	import Form from './Components/Form.svelte';
	import Records from './Components/Report.svelte';
	import GoogleSync from './Components/GoogleSync.svelte';

	let valueCategory: string | undefined = undefined;
	let currencies = ['JPY', 'SEK'];
	let value = 'JPY';
	let date: string = new Date().toISOString().substring(0, 10);
	let amount = 0.00
	let activePage = 'new';
</script>

<svelte:head>
	<!-- Fonts -->
	<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Outlined">
	<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,600,700">
		
	<!-- Material Typography -->
	<link rel="stylesheet" href="https://unpkg.com/@material/typography@14.0.0/dist/mdc.typography.css" />
	
	<!-- SMUI -->
	<link rel="stylesheet" href="https://unpkg.com/svelte-material-ui/bare.css" />
</svelte:head>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}
</style>