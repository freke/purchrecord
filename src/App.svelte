<header>
	<Navbar class="border-b">
		<NavBrand>
			<img src="icon.svg" class="mr-3 h-6 sm:h-9" alt="Logo">
			<span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">PurchRecord</span>
		</NavBrand>
		<div class="flex md:order-2">
			<GoogleSync />
		</div>
	</Navbar>
	{#if $progress}
		<BarLoader />
	{/if}
</header>
<main class="container mx-auto mt-1"> 
	<Tabs>
		<TabItem open>
			<div slot="title" class="flex items-center gap-2">
				<CirclePlusOutline size="sm" />
				New
			</div>
			<Form/>
		</TabItem>
		<TabItem>
			<div slot="title" class="flex items-center gap-2">
				<CalendarMonthOutline size="sm" />
				Report
			</div>
			<Report/>
		</TabItem>
		<TabItem>
			<div slot="title" class="flex items-center gap-2">
				<ChartMixedDollarSolid size="sm" />
				Budget
			</div>
			<Budget/>
		</TabItem>
		<TabItem>
			<div slot="title" class="flex items-center gap-2">
				<ArrowsRepeatOutline size="sm" />
				Monlthly
			</div>
			<MonlyCalculation/>
		</TabItem>
	</Tabs>
</main>


<script lang="ts">
	import { progress } from "./stores/progress";
	import GoogleSync from "./lib/GoogleSync.svelte";
	import Form from "./lib/Form.svelte";
	import Report from "./lib/Report.svelte";
	import Budget from "./lib/Budget.svelte";
	import MonlyCalculation from "./lib/MonlyCalculation.svelte";
	import BarLoader from "./lib/Components/BarLoader.svelte";

	import { Navbar, NavBrand, Tabs, TabItem } from 'flowbite-svelte';
	import {CirclePlusOutline, CalendarMonthOutline, ChartMixedDollarSolid, ArrowsRepeatOutline} from 'flowbite-svelte-icons';

	const urlParams = new URLSearchParams(window.location.search);
    const isBeta = urlParams.has('beta');
	const currentUrl = new URL(window.location.href);
	
	const pages = [
		{ name: 'new', icon: 'add_circle', component: Form   },
		{ name: 'report', icon: 'calendar_month', component: Report },
		{ name: 'budget', icon: 'analytics', component: Budget },
		{ name: 'monlthly', icon: 'functions', component: MonlyCalculation},
	];
	if(isBeta) {
		//pages.push()
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
	<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,600,700">
</svelte:head>

<style>
</style>