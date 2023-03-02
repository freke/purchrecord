<header class="primary-container">
	<nav>
		<h5 class="max center-align">PurchRecord</h5>
		<GoogleSync />
	</nav>
</header>
<main class="responsive">	
	<div>
		<div class="tabs">
		{#each pages as page }
			<a href="#/" on:click={() => select_page(page)} on:keydown={(e) => handleKeyDown(e, page)} class:active={selected==page}>
				<i>{page.icon}</i>
				<span class="capitalize">{page.name}</span>
		  	</a>
		{/each}
		</div>
	</div>
	<div class="page padding active">
		<svelte:component this={selected.component}/>
    </div>
</main>


<script lang="ts">
	import "beercss";
	import "material-dynamic-colors";

	import GoogleSync from "./lib/GoogleSync.svelte";
	import Form from "./lib/Form.svelte";
	import Report from "./lib/Report.svelte";
	import Budget from "./lib/Budget.svelte";

	const urlParams = new URLSearchParams(window.location.search);
    const isBeta = urlParams.has('beta');
	const currentUrl = new URL(window.location.href);
	
	const pages = [
		{ name: 'new', icon: 'add_circle', component: Form   },
		{ name: 'report', icon: 'calendar_month', component: Report },
	];
	if(isBeta) {
		pages.push({ name: 'budget', icon: 'analytics', component: Budget })
	}

	const pageName = urlParams.get('page');

	let selected = pages.find(page => page.name === pageName) || pages[0];

	function select_page(page) {
		selected = page;

		const url = new URL(window.location.href);
		const params = new URLSearchParams(url.search);
		params.set('page', selected.name);
		// Update the URL without reloading the page
		window.history.pushState({}, '', `${url.pathname}?${params}`);
	}

	function handleKeyDown(e, page) {
		if (e.keyCode === 13) {
			select_page(page);
		}
	}
</script>

<svelte:head>
	<!-- Fonts -->
	<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Outlined">
	<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,600,700">
</svelte:head>

<style>
	.capitalize{
		text-transform: capitalize;
	}
</style>