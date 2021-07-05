<script>
	import html2canvas from "html2canvas";
	import { getData, suffixer, changeClass, changeStr, sleep } from "./utils";
	import { urls, types, codes } from "./config";
	import SpineChart from "./charts/SpineChart.svelte";
	import ColChart from "./charts/ColChart.svelte";
	import StackedBarChart from "./charts/StackedBarChart.svelte";
	import Select from "./ui/Select.svelte";
	import Warning from "./ui/Warning.svelte";
	
	let options, selected, place, ew, quartiles, w, cols;
	let overtime = false;
	let select, change, components;
	
	function loadArea(code) {
		fetch(urls.places + code + '.json')
		.then(res => res.json())
		.then(json => {
			json.children = options.filter(d => d.parent == code);
			
			if (json.count > 20) {
				fetch(urls.quantiles + json.type + '.json')
				.then(res => res.json())
				.then(quart => {
					quartiles = quart;
					place = json;
					sendHeight();
				});
			} else {
				quartiles = null;
				place = json;
				sendHeight();
			}
		});
	}

	function loadEW() {
		const code = 'K04000001';
		fetch(urls.places + code + '.json')
		.then(res => res.json())
		.then(json => {
			json.children = options.filter(d => d.parent == code);
			ew = json;
		});
	}
	
	function makeData(props) {
		let code = props[0];
		let val = props[1];
		
		let source = place.data[code][val]['2011'];
		let sourcePrev = place.data[code][val]['2001'];
		let sourceEW = ew.data[code][val]['2011'];

		let keys = codes[code].map(d => d.code);
		let labels = codes[code].map(d => d.label ? d.label : d.code);
		let data = keys.map((key, i) => {
			return {x: labels[i], y: source[key], ew: sourceEW[key], prev: sourcePrev[key]};
		});
		return data;
	}

	function onResize() {
		cols = w < 575 ? 1 : window.getComputedStyle(grid).getPropertyValue("grid-template-columns").split(" ").length;
		sendHeight();
	}
	
	getData(urls.options)
	.then(res => {
		let lookup = {};
		res.forEach(d => lookup[d.code] = d.name);
		res.forEach(d => {
			d.typepl = types[d.type].pl;
			d.typenm = types[d.type].name;
			d.typestr = lookup[d.parent] ? `${types[d.type].name} in ${lookup[d.parent]}` : '';
		});
		options = res.sort((a, b) => a.name.localeCompare(b.name));
		loadEW();
		onHash();
	});

	window.onhashchange = onHash;

	function onHash() {
		let hash = window.location.hash;
		if (hash) {
			let parts = hash.split('/');
			if (parts.length == 5) {
				selected = options.find(d => d.code == parts[1]);
				select = parts[2] == 'select';
				change = parts[3] == 'change';
				components = parts[4].split(',');
				loadArea(selected.code);
			}
		}
	}

	async function sendHeight() {
		await sleep(100);
		pymChild.sendHeight();
	}

	function makePNG() {
		html2canvas(document.getElementsByTagName('main')[0]).then(canvas => {
			let a = document.createElement('a');
    	a.href = canvas.toDataURL();
    	a.download = place.name + '.png';
    	a.click();
		});
	}

	pymChild.onMessage('makePNG', makePNG);

	$: w && onResize();
</script>

<main>

{#if place && ew && selected}
<Warning/>

<div class="grid">
	<div>
		<span class="text-big">{place.name}</span><br/>
		{#if place.parents[0]}
		{types[place.type].name} in {place.parents[0].name}<br/>
		{/if}
	</div>
	{#if select}
	<div>
		<div style="width: 260px;" class:float-right={cols > 1}>
		<Select {options} bind:selected group="typestr" search={true} on:select="{() => { if (selected) { loadArea(selected.code) }}}"/>
		</div>
	</div>
	{/if}
</div>

{#if change}
<div class="grid mts">
	<div class="text-small">
		Comparison:
		<button class="btn" class:btn-active={!overtime} on:click={() => {overtime = false; sendHeight();}}>England & Wales figures</button>
		<button class="btn" class:btn-active={overtime} on:click={() => {overtime = true; sendHeight();}}>Change from 2001</button>
	</div>
</div>
{/if}

<div id="grid" class="grid mts" bind:clientWidth={w}>
	{#each components as comp}
	{#if comp == "population"}
	<div>
		<span class="text-label">Population</span>
		<br/>
		<span class="text-big">{place.data.population.value['2011'].all.toLocaleString()}</span>
		<span class="{changeClass(place.data.population.value.change.all)}">{changeStr(place.data.population.value.change.all, '%', 1)}</span>
		{#if quartiles}
		<div class="chart">
			<SpineChart data="{[{x: place.data.population.value['2011'].all}]}" ticks="{quartiles.population.value['2011'].all}" formatTick="{d => (d / 1000).toFixed(0)}" suffix="k" scale="sqrt"/>
		</div>
		{/if}
		{#if place.data.population.value_rank}
		<div class="text-small muted">{place.data.population.value_rank['2011'].all.toLocaleString()}{suffixer(place.data.population.value_rank['2011'].all)} most populous of {place.count.toLocaleString()} {types[place.type].pl.toLowerCase()}</div>
		{/if}
	</div>
	{/if}
	{#if comp == "density"}
	<div>
		<span class="text-label">Density</span>
		<br/>
		<span class="text-big inline">{place.data.density.value['2011'].all.toFixed(1)}</span>
		<span class="inline condensed text-small">people<br/>per hectare</span>
		<span class="inline {changeClass(place.data.population.value.change.all)}">{changeStr(place.data.population.value.change.all, '%', 1)}</span>
		{#if quartiles}
		<div class="chart">
			<SpineChart data="{[{x: place.data.density.value['2011'].all}]}" ticks="{quartiles.density.value['2011'].all}" formatTick="{d => d.toFixed(0)}" scale="sqrt"/>
		</div>
		{/if}
		{#if place.data.density.value_rank}
		<div class="text-small muted">{place.data.density.value_rank['2011'].all.toLocaleString()}{suffixer(place.data.density.value_rank['2011'].all)} most densely populated of {place.count.toLocaleString()} {types[place.type].pl.toLowerCase()}</div>
		{/if}
	</div>
	{/if}
	{#if comp == "agemed"}
	<div>
		<span class="text-label">Median age</span>
		<br/>
		<span class="text-big">{place.data.agemed.value['2011'].all}</span>
		<span class="{changeClass(place.data.agemed.value['2011'].all - place.data.agemed.value['2001'].all)}">{changeStr(place.data.agemed.value['2011'].all - place.data.agemed.value['2001'].all, 'yrs')}</span>
		{#if quartiles}
		<div class="chart">
			<SpineChart data="{[{x: place.data.agemed.value['2011'].all}]}" ticks="{quartiles.agemed.value['2011'].all}" formatTick="{d => d.toFixed(0)}" scale="log"/>
		</div>
		{/if}
		{#if place.data.agemed.value_rank}
		<div class="text-small muted">{place.data.agemed.value_rank['2011'].all.toLocaleString()}{suffixer(place.data.agemed.value_rank['2011'].all)} oldest of {place.count.toLocaleString()} {types[place.type].pl.toLowerCase()}</div>
		{/if}
	</div>
	{/if}
	{#if comp == "age10yr"}
	<div>
		<span class="text-label">Age profile</span><br/>
		<div class="chart" style="height: 85px;">
			<ColChart data="{place && makeData(['age10yr', 'perc', '2011'])}" zKey="{overtime ? 'prev' : place.type != 'ew' ? 'ew' : null}"/>
		</div>
		{#if !overtime && place.type != 'ew'}
		<div class="text-small muted"><li class="line"></li> Shows England & Wales profile</div>
		{:else if overtime}
		<div class="text-small muted"><li class="line"></li> Shows 2001 profile</div>
		{/if}
	</div>
	{/if}
	{#if comp == "sex"}
	<div>
		<span class="text-label">Sex</span><br/>
		<StackedBarChart data="{place && makeData(['population', 'perc', '2011'])}" zKey="{overtime ? 'prev' : place.type != 'ew' ? 'ew' : null}"/>
	</div>
	{/if}
	{#if comp == "health"}
	<div>
		<span class="text-label">General Health</span><br/>
		<StackedBarChart data="{place && makeData(['health', 'perc', '2011'])}" zKey="{overtime ? null : place.type != 'ew' ? 'ew' : null}"/>
		{#if overtime}
		<div class="text-small muted">2001 figures not comparable</div>
		{/if}
	</div>
	{/if}
	{#if comp == "ethnicity"}
	<div>
		<span class="text-label">Ethnicity</span><br/>
		<StackedBarChart data="{place && makeData(['ethnicity', 'perc', '2011'])}" zKey="{overtime ? 'prev' : place.type != 'ew' ? 'ew' : null}"/>
	</div>
	{/if}
	{#if comp == "economic"}
	<div>
		<span class="text-label">Economic activity</span><br/>
		<StackedBarChart data="{place && makeData(['economic', 'perc', '2011'])}" zKey="{overtime ? 'prev' : place.type != 'ew' ? 'ew' : null}"/>
	</div>
	{/if}
	{#if comp == "travel"}
	<div>
		<span class="text-label">Travel to work</span><br/>
		<StackedBarChart data="{place && makeData(['travel', 'perc', '2011'])}" zKey="{overtime ? 'prev' : place.type != 'ew' ? 'ew' : null}"/>
	</div>
	{/if}
	{#if comp == "tenure"}
	<div>
		<span class="text-label">Housing tenure</span><br/>
		<StackedBarChart data="{place && makeData(['tenure', 'perc', '2011'])}" zKey="{overtime ? 'prev' : place.type != 'ew' ? 'ew' : null}"/>
	</div>
	{/if}
	{/each}
</div>

<div class="grid mt">
	<div>
		<img src="./img/ons-logo-pos-en.svg" alt="Office for National Statistics"/>
	</div>
	<div class:text-right={cols > 1}>
		<span class="text-small">Source: 2001 and 2011 Census</span>
	</div>
</div>
{/if}

</main>

<style>
	img {
		width: 200px;
	}
	.btn {
		padding: 2px 4px;
		margin: 0;
		border: 2px solid #206095;
		cursor: pointer;
		color: #206095;
		background-color: lightgrey;
	}
	.btn-active {
		color: white;
		background-color: #206095;
	}
	.text-big {
		font-size: 2em;
		font-weight: bold;
		display: inline-block;
		margin-top: -8px;
		margin-bottom: -3px;
	}
	.text-small {
		font-size: 0.85em;
	}
	.text-label {
		font-weight: bold;
	}
	.muted {
		color: grey;
	}
	.increase {
		color: green;
	}
	.increase::before {
		content: '▲';
		color: green;
	}
	.decrease {
		color: red;
	}
	.decrease::before {
		content: '▼';
		color: red;
	}
	.nochange {
		font-size: 0.85em;
		color: grey;
	}
	.line {
		background-color: #27A0CC;
		width: 25px;
  	height: 2px;
  	display: inline-block;
		margin-bottom: 3px;
	}
	.text-right {
		text-align: right;
	}
	.float-right {
		float: right;
	}
	.inline {
		display: inline-block;
	}
	.condensed {
		line-height: 1.1em;
	}
	.mt {
		margin-top: 20px;
	}
	.mts {
		margin-top: 15px;
	}
	.grid {
		display: grid;
		width: 100%;
		grid-gap: 10px;
		grid-template-columns: repeat(auto-fit, minmax(min(250px, 100%), 1fr));
		justify-content: stretch;
	}
	#grid {
		grid-gap: 20px !important;
	}
	.chart {
		position: relative;
		width: 100%;
		height: 50px;
	}
</style>