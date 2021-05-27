<script>
    import gsap from "gsap";
    import {ScrollTrigger} from "gsap/ScrollTrigger";
    // import Scrollbar from "smooth-scrollbar";

    gsap.registerPlugin(ScrollTrigger);

    import {onMount} from "svelte";

    onMount(() => {
        // const scroller = document.querySelector('body');
        // //
        // const bodyScrollBar = Scrollbar.init(scroller, {damping: 0.1, delegateTo: document, alwaysShowTracks: true});
        //
        // ScrollTrigger.scrollerProxy("body", {
        //     scrollTop(value) {
        //         if (arguments.length) {
        //             bodyScrollBar.scrollTop = value; // setter
        //         }
        //         return bodyScrollBar.scrollTop;    // getter
        //     },
        //     getBoundingClientRect() {
        //         return {top: 0, left: 0, width: window.innerWidth, height: window.innerHeight};
        //     }
        // });
        //
        // bodyScrollBar.addListener(ScrollTrigger.update);
        //
        // ScrollTrigger.defaults({scroller: scroller});

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: "#hero",
                start: "top top",
                end: window.innerHeight,
                scrub: 1,
            },
        });
        // tl.addLabel('start').to(".parallax",{y:100}).addLabel('end')
        gsap.utils.toArray(".parallax").forEach((layer) => {
            const depth = layer.dataset.depth;
            const movement = 500 * depth;
            tl.to(layer, {y: movement, ease: "slow (0.7 , 0.7 ,false )"}, 0);
        });
    });
</script>

<div class="slide" id="hero">
    <h1 class="header__text parallax" data-depth="0.4">
        ما حشرات رو دوست داریم ولی انسان ها رو بیشتر
    </h1>
    <img
            class="slide__man parallax"
            data-depth="0.3"
            alt="man slide"
            src="assets/slide/man.png"
    />
    <img class="slide__grass" alt="man slide" src="assets/slide/grass.png"/>
    <div class="slide__insects">
        <img
                class="slide__insects--Bee parallax"
                data-depth="0.05"
                alt="man slide"
                src="assets/slide/Bee.png"
        />
        <img
                class="slide__insects--Bee--2 parallax"
                data-depth="0.3"
                alt="man slide"
                src="assets/slide/Bee-black.png"
        />
        <img
                class="slide__insects--Dragonfly parallax"
                data-depth="0.2"
                alt="man slide"
                src="assets/slide/Dragonfly.png"
        />
        <img
                class="slide__insects--Dragonfly--2 parallax"
                data-depth="0.2"
                alt="man slide"
                src="assets/slide/Dragonfly.png"
        />
        <img
                class="slide__insects--butterfly parallax"
                data-depth="0.10"
                alt="man slide"
                src="assets/slide/butterfly.png"
        />
        <img
                class="slide__insects--butterfly--2 parallax"
                data-depth="0.15"
                alt="man slide"
                src="assets/slide/butterfly-blue.png"
        />
        <img
                class="slide__insects--bug parallax"
                data-depth="0.50"
                alt="man slide"
                src="assets/slide/bug.png"
        />
        <img
                class="slide__insects--bug--2 parallax"
                data-depth="0.50"
                alt="man slide"
                src="assets/slide/red-bug.png"
        />
    </div>
</div>

<style scoped>
    .slide {
        position: relative;
        background: url("/assets/slide/home.jpg") no-repeat center bottom fixed;
        background-size: cover;
        height: 100vh;
        width: 100%;
        overflow: hidden;
    }

    .slide:before {
        content: "";
        background: rgba(0, 0, 0, 0.1);
        width: 100%;
        height: 100vh;
        position: absolute;
        z-index: 0;
    }

    .slide__man {
        position: absolute;
        bottom: 3rem;
        left: 14%;
        width: 8.6rem;
    }

    .slide__grass {
        position: relative;
        width: 100%;
        bottom: 1.5rem;
        transform: translateY(100%);
        filter: drop-shadow(1px 0px 6px rgba(0, 0, 0, 0.5)نشد);
        z-index: 9;
    }

    .slide__insects--Bee.parallax {
        position: absolute;
        right: 16.4%;
        bottom: 31.2rem;
        width: 3rem;
    }

    .slide__insects--Bee--2.parallax {
        position: absolute;
        width: 3rem;
        right: 45.2%;
        bottom: 21.3rem;
    }

    .slide__insects--Dragonfly.parallax {
        position: absolute;
        left: 22%;
        bottom: 31rem;
        width: 3rem;
        filter: blur(0.6px);
    }

    .slide__insects--Dragonfly--2.parallax {
        position: absolute;
        right: 25.3%;
        bottom: 24.6rem;
        width: 3.5rem;
    }

    .slide__insects--butterfly.parallax {
        position: absolute;
        left: 42%;
        width: 5rem;
        bottom: 31rem;
    }

    .slide__insects--butterfly--2.parallax {
        position: absolute;
        right: 62%;
        width: 3.5rem;
        bottom: 23rem;
        filter: blur(0.6px);
    }

    .slide__insects--bug.parallax {
        position: absolute;
        width: 2.5rem;
        right: 72%;
        bottom: 21rem;
    }

    .slide__insects--bug--2.parallax {
        position: absolute;
        width: 2rem;
        filter: blur(0.5px);
        bottom: 29rem;
        right: 36%;
    }

    .slide__insects img {
        z-index: 2;
        filter: drop-shadow(0px 5px 10px rgba(0, 0, 0, 0.5));
    }

    /*header*/

    .header__text {
        color: #ffffff;
        font-size: 6rem;
        text-shadow: 0px 20px 40px rgba(0, 0, 0, 0.4);
        width: 70%;
        line-height: 1.4;
        font-family: "dana-black";
        position: absolute;
        bottom: 18rem;
        left: 0;
        right: 0;
        margin: 0 auto;
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2;
    }
</style>
