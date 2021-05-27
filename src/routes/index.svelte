<script>
	import gsap from "gsap";
	import {ScrollTrigger} from "gsap/ScrollTrigger";

	gsap.registerPlugin(ScrollTrigger);


	import Slide from "../components/elements/Slide.svelte";
	import InsectsInfo from "../components/elements/insects/InsectsInfo.svelte";
	import Contact from "../components/elements/Contact.svelte";

</script>


<svelte:head>
	<title>Insect</title>
</svelte:head>

<main>
	<Slide />
	<InsectsInfo />
	<Contact/>

	<div class="Signature">
		<p>" Made by Leila Zomorrdi under the supervision of Mr. Ehtesham "</p>
	</div>
</main>

<style>
	.Signature {
		height: 3rem;
		background: #e4e4e4;
		display: flex;
		align-items: center;
		justify-content: center;
	}

</style>

