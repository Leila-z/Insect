<script>
    import gsap from "gsap";
    import {TextPlugin} from "gsap/TextPlugin";

    import {onMount} from "svelte";

    import Button from "../../commons/Button.svelte";

    export let title, body, img;
    let parent,
            replace,
            itemHeader,
            moreButton,
            tl = gsap.timeline(),
            show = false;
    const desc =
            "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است، چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است،\n" +
            "\n" +
            "&nbsp\n" +
            "\n" +
            "و برای شرایط فعلی تکنولوژی مورد نیاز، و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد، کتابهای زیادی در شصت و سه درصد گذشته حال و آینده،\n" +
            "\n" +
            "&nbsp\n" +
            "\n" +
            "شناخت فراوان جامعه و متخصصان را می طلبد، تا با نرم افزارها شناخت بیشتری را برای طراحان رایانه ای علی الخصوص طراحان خلاقی، و فرهنگ پیشرو در زبان فارسی ایجاد کرد،\n" +
            "\n" +
            "&nbsp\n" +
            "\n" +
            "در این صورت می توان امید داشت که تمام و دشواری موجود در ارائه راهکارها، و شرایط سخت تایپ به پایان رسد و زمان مورد نیاز شامل حروفچینی دستاوردهای اصلی،\n" +
            "\n" +
            "&nbsp\n" +
            "\n" +
            "و جوابگوی سوالات پیوسته اهل دنیای موجود طراحی اساسا مورد استفاده قرار گیرد. لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است، چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است،\n" +
            "\n" +
            "&nbsp\n" +
            "\n" +
            "و برای شرایط فعلی تکنولوژی مورد نیاز، و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد، کتابهای زیادی در شصت و سه درصد گذشته حال و آینده،\n" +
            "\n" +
            "&nbsp\n" +
            "\n" +
            "شناخت فراوان جامعه و متخصصان را می طلبد، تا با نرم افزارها شناخت بیشتری را برای طراحان رایانه ای علی الخصوص طراحان خلاقی، و فرهنگ پیشرو در زبان فارسی ایجاد کرد،\n" +
            "\n" +
            "&nbsp\n" +
            "\n" +
            "در این صورت می توان امید داشت که تمام و دشواری موجود در ارائه راهکارها، و شرایط سخت تایپ به پایان رسد و زمان مورد نیاز شامل حروفچینی دستاوردهای اصلی،\n" +
            "\n" +
            "&nbsp\n" +
            "\n" +
            "و جوابگوی سوالات پیوسته اهل دنیای موجود طراحی اساسا مورد استفاده قرار گیرد." +
            "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است، چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است،\n" +
            "\n" +
            "&nbsp\n" +
            "\n" +
            "و برای شرایط فعلی تکنولوژی مورد نیاز، و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد، کتابهای زیادی در شصت و سه درصد گذشته حال و آینده،\n" +
            "\n" +
            "&nbsp\n" +
            "\n" +
            "شناخت فراوان جامعه و متخصصان را می طلبد، تا با نرم افزارها شناخت بیشتری را برای طراحان رایانه ای علی الخصوص طراحان خلاقی، و فرهنگ پیشرو در زبان فارسی ایجاد کرد،\n" +
            "\n" +
            "&nbsp\n" +
            "\n" +
            "در این صورت می توان امید داشت که تمام و دشواری موجود در ارائه راهکارها، و شرایط سخت تایپ به پایان رسد و زمان مورد نیاز شامل حروفچینی دستاوردهای اصلی،\n" +
            "\n" +
            "&nbsp\n" +
            "\n" +
            "و جوابگوی سوالات پیوسته اهل دنیای موجود طراحی اساسا مورد استفاده قرار گیرد. لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است، چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است،\n" +
            "\n" +
            "&nbsp\n" +
            "\n" +
            "و برای شرایط فعلی تکنولوژی مورد نیاز، و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد، کتابهای زیادی در شصت و سه درصد گذشته حال و آینده،\n" +
            "\n" +
            "&nbsp\n" +
            "\n" +
            "شناخت فراوان جامعه و متخصصان را می طلبد، تا با نرم افزارها شناخت بیشتری را برای طراحان رایانه ای علی الخصوص طراحان خلاقی، و فرهنگ پیشرو در زبان فارسی ایجاد کرد،\n" +
            "\n" +
            "&nbsp\n" +
            "\n" +
            "در این صورت می توان امید داشت که تمام و دشواری موجود در ارائه راهکارها، و شرایط سخت تایپ به پایان رسد و زمان مورد نیاز شامل حروفچینی دستاوردهای اصلی،\n" +
            "\n" +
            "&nbsp\n" +
            "\n";
    ;


    gsap.registerPlugin(TextPlugin);


    function handleShow() {
        show = !show;
        const {width, height, top, left, x, y} = parent.getBoundingClientRect();

        tl.set(replace, {
            position: "relative",
            width,
            height,
        });

        tl.set(document.querySelector('html'), {
            overflow: 'hidden'
        });

        tl.set(parent.querySelector('.button'), {
            display: 'none'
        });

        if (window.innerWidth > 1100) {
            tl.set(parent, {
                position: "fixed",
                zIndex: 900,
                width,
                height,
                top: 0,
                left: 0,
                x: left,
                y: top,
            });

            tl.to(parent, 1.2, {
                ease: "power2.inOut",
                width: "100%",
                height: "100%",
                x: 0,
                y: 0,
                top: 0,
                left: 0,
            });

            tl.to(parent.querySelector('article'), {
                ease: "power2.inOut",
                transform: "translateY(0)",
                top: '0'
            }, 0);

            tl.to(parent.querySelector(".insectsInfo__item--body"),
                    1,
                    {
                        text: {
                            value: desc,
                            delimiter: "",
                        },
                        ease: "power2.inOut",
                    },
                    "-=0.3"
            ).then(() => {
                handelHeader();
                if (parent.querySelector('.insectsInfo__item--body').clientHeight > height)
                    tl.to(parent.querySelector('article'), 1, {
                        ease: "power2.inOut",
                        overflowY: 'scroll'
                    });
            })
        } else {

            tl.set(parent, {
                position: "fixed",
                zIndex: 900,
                width,
                height,
                top: 0,
                left: 0,
                x: left,
                y: top,
            });

            tl.to(parent, 1.2, {
                ease: "power2.inOut",
                width: "100%",
                height: "100%",
                display: "block",
                x: 0,
                y: 0,
                top: 0,
                left: 0,
            }).then(() => {
                handelHeader();
                if (window.innerHeight < window.innerWidth) {
                    tl.set(parent, {
                                overflowY: 'scroll'
                            }
                    );
                }
            });

            tl.to(parent.querySelector('article'), {
                ease: "power2.inOut",
                transform: "translateY(0)",
                top: '0',
                height: '50%',
                width: "100%",
                position: "relative",
            }, 0);

            tl.to(parent.querySelector(".insectsInfo__item--body"),
                    1,
                    {
                        text: {
                            value: desc,
                            delimiter: "",
                        },
                        ease: "power2.inOut",
                        overflowY: 'scroll'
                    },
                    "-=0.3"
            );

            if (window.innerHeight < window.innerWidth) {
                tl.to(parent.querySelector(".insectsInfo__item--image"),
                        1,
                        {
                            ease: "power2.inOut",
                            height: '80%',
                            width: "100%"
                        },
                        0
                );

            } else {
                tl.to(parent.querySelector(".insectsInfo__item--image"),
                        1,
                        {
                            ease: "power2.inOut",
                            height: '50%',
                            width: "100%"
                        },
                        0
                );
            }
        }

        if (show) {
            tl.play();
        } else {
            tl.reverse();
        }
    };

    function handelHeader() {
        tl.set(itemHeader, {
            opacity: 1,
            width: 'calc(100% - 4rem)',
        });

        tl.to(itemHeader, 0.5, {
            ease: "power2.inOut",
            height: "5rem",
        })
    }
</script>

<div style="position: relative">
    <div class="insectsInfo__replace" bind:this={replace}/>
    <div class="insectsInfo__item" bind:this={parent}>
        <figure class="insectsInfo__item--image">
            <div class="insectsInfo__item--header" bind:this={itemHeader}>
                <div class="d-flex d-flex__aline-center">
                    <img
                            class="insectsInfo__item--header--logo"
                            src="assets/logo.svg"
                            alt="insect"
                    />
                    <span class="insectsInfo__item--header--titre"
                    >ما حشرات رو دوست داریم ولی انسان ها رو بیشتر</span
                    >
                </div>
                <button on:click={handleShow}>
                    <img
                            class="insectsInfo__item--header--back"
                            src="assets/icons/back.png"
                            alt="insect"
                    />
                </button>
            </div>
            <img src={img} alt="insect"/>
        </figure>
        <article class="d-flex d-flex__column">
            <span class="insectsInfo__item--title">{title}</span>
            <p class="insectsInfo__item--body">
                {@html body}
            </p>
            <Button onClick={handleShow}/>
        </article>
    </div>
</div>

<style scoped>
    .insectsInfo__item {
        display: flex;
        justify-content: space-between;
        background: #fff;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
        height: 38vh;
        z-index: 2;
        overflow: hidden;
    }

    .insectsInfo__replace {
        position: absolute;
        z-index: 1;
    }

    /*.insectsInfo__item:hover {*/
    /*    transform: scale(1.1);*/
    /*}*/

    .insectsInfo__item > figure {
        height: 100%;
        position: relative;
        width: 50%;
    }

    .insectsInfo__item > figure > img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .insectsInfo__item > article {
        padding: 1rem 4%;
        width: 50%;
        top: 50%;
        position: absolute;
        box-sizing: border-box;
        transform: translateY(-50%);
        left: 0;
    }

    .insectsInfo__item--title {
        font-size: 2rem;
        position: relative;
        font-family: "dana-bold";
        display: flex;
    }

    .insectsInfo__item--title:after {
        content: "";
        position: absolute;
        width: 4rem;
        height: 2px;
        background: #000;
        bottom: -6px;
        right: 0;
    }

    .insectsInfo__item--body {
        margin: 2rem 0;
        text-align: justify;
        line-height: 1.6;
    }

    .insectsInfo__item--header {
        opacity: 0;
        width: 0;
        height: 0;
        position: absolute;
        display: flex;
        align-items: center;
        background: rgba(0, 0, 0, 0.25);
        padding: 0 2rem;
        justify-content: space-between;
        z-index: 999;
    }

    .insectsInfo__item--header--back {
        width: 2.5rem;
    }

    .insectsInfo__item--header--titre {
        color: #ffffff;
        font-family: "dana-bold";
    }

    .insectsInfo__item--header--logo {
        width: 4rem;
    }

    @media screen and (max-width: 900px) {
        .insectsInfo__item {
            height: 34vh
        }

        .insectsInfo__item--header--titre {
            width: 75%;
            margin: 0 1rem;
        }
    }

    @media screen and (orientation: landscape) and (max-width: 768px) {
        .insectsInfo__item {
            height: 70vh
        }

        .insectsInfo__item--body {
            margin: 1rem 0;
        }
    }
</style>
