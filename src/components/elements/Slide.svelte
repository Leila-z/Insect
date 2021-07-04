<script>
    import gsap from "gsap";
    import {ScrollTrigger} from "gsap/ScrollTrigger";
    // import Scrollbar from "smooth-scrollbar";

    gsap.registerPlugin(ScrollTrigger);

    import {onMount} from "svelte";


    onMount(() => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: "#hero",
                start: "top top",
                end: window.innerHeight,
                scrub: 1,
            },
        });

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
        <span>ما</span>
        <span>حشرات
              <img
                      class="slide__insects--bug--2 parallax"
                      data-depth="0.50"
                      alt="man slide"
                      src="assets/slide/red-bug.png"
              />
                 <img
                         class="slide__insects--Dragonfly--2 parallax"
                         data-depth="0.2"
                         alt="man slide"
                         src="assets/slide/Dragonfly.png"
                 />
        </span>
        <span>رو</span>
        <span>دوست
            <img
                    class="slide__insects--butterfly parallax"
                    data-depth="0.10"
                    alt="man slide"
                    src="assets/slide/butterfly.png"
            /></span>
        <span>داریم
                  <img
                          class="slide__insects--Dragonfly parallax"
                          data-depth="0.2"
                          alt="man slide"
                          src="assets/slide/Dragonfly.png"
                  />
        </span>
        <span>ولی
               <img
                       class="slide__insects--Bee parallax"
                       data-depth="0.05"
                       alt="man slide"
                       src="assets/slide/Bee.png"
               />
        </span>
        <span>انسان
              <img
                      class="slide__insects--Bee--2 parallax"
                      data-depth="0.3"
                      alt="man slide"
                      src="assets/slide/Bee-black.png"
              /></span>
        <span>ها
                <img
                        class="slide__insects--bug parallax"
                        data-depth="0.50"
                        alt="man slide"
                        src="assets/slide/bug.png"
                />
        </span>
        <span>رو</span>
        <span>بیشتر
              <img
                      class="slide__insects--butterfly--2 parallax"
                      data-depth="0.15"
                      alt="man slide"
                      src="assets/slide/butterfly-blue.png"
              /></span>
    </h1>
    <img
            class="slide__man parallax"
            data-depth="0.3"
            alt="man slide"
            src="assets/slide/man.png"
    />
    <img class="slide__grass" alt="man slide" src="assets/slide/grass.png"/>
</div>

<style scoped>
    .slide {
        position: relative;
        background: url("/assets/slide/home-1.jpg") no-repeat center fixed;
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
        position: absolute;
        width: 100%;
        bottom: 0;
        transform: translateY(40%);
        filter: drop-shadow(1px 0px 6px rgba(0, 0, 0, 0.5));
        z-index: 9;
    }

    .slide__insects--Bee.parallax {
        position: absolute;
        right: -0.4rem;
        bottom: 4.2rem;
        width: 3rem;
    }

    .slide__insects--Bee--2.parallax {
        position: absolute;
        width: 3rem;
        right: 39%;
        bottom: 3rem;
    }

    .slide__insects--Dragonfly.parallax {
        position: absolute;
        right: 6%;
        bottom: 5rem;
        width: 3rem;
        filter: blur(0.6px);
    }

    .slide__insects--Dragonfly--2.parallax {
        position: absolute;
        right: -3%;
        bottom: 4rem;
        width: 3.5rem;
    }

    .slide__insects--butterfly.parallax {
        position: absolute;
        right: 0;
        width: 5rem;
        bottom: 5rem;
    }

    .slide__insects--butterfly--2.parallax {
        position: absolute;
        right: -8%;
        width: 3.5rem;
        bottom: 4rem;
        filter: blur(0.6px);
    }

    .slide__insects--bug.parallax {
        position: absolute;
        width: 2.5rem;
        right: 41%;
        bottom: 3rem;
    }

    .slide__insects--bug--2.parallax {
        position: absolute;
        width: 2rem;
        filter: blur(0.5px);
        bottom: 3rem;
        right: 10.5rem;
    }

    /*.slide__insects img {*/
    /*    z-index: 2;*/
    /*    filter: drop-shadow(0px 5px 10px rgba(0, 0, 0, 0.5));*/
    /*}*/

    /*header*/

    .header__text {
        color: #ffffff;
        font-size: 5rem;
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
        z-index: 2;
        top: 30%
    }

    .header__text span {
        position: relative;
    }

    /*.slide__insects {*/
    /*    position: relative;*/
    /*    width: 100%;*/
    /*    height: 100%;*/
    /*}*/

    @media screen and (max-width: 768px) {
        .slide__grass {
            transform: translateY(5%);
        }

        .header__text {
            width: 65%;
        }
    }
</style>
