<script>
  import InsectItem from "./Insect-item.svelte";
</script>

<div class="insectsInfo">
  <div class="container">
    <div class="insectsInfo__titre">
      <img class="insectsInfo__titre--icon" src="assets/insects/info-2.png" alt="insect"/>
      <span class="insectsInfo__titre--text"
        >بیشتر با دوستانمون آشنا بشیم
      </span>
    </div>
    <div class="insectsInfo__items">
      <InsectItem
        title={"کفشدوزک"}
        body={"لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ ..."}
        img={"assets/insects/3.jpeg"}
        index={0}
      />
      <InsectItem
        title={"زنبور عسل"}
        body={"لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ ..."}
        img={"assets/insects/1.jpeg"}
        index={1}
      />
      <InsectItem
        title={"ملخ"}
        body={"لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ ..."}
        img={"assets/insects/2.jpeg"}
        index={2}
      />
      <InsectItem
        title={"مگس"}
        body={"لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ ..."}
        img={"assets/insects/4.jpeg"}
        index={3}
      />
      <InsectItem
        title={"سنجاقک"}
        body={"لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ ..."}
        img={"assets/insects/6.jpeg"}
        index={4}
      />
      <InsectItem
        title={"پروانه"}
        body={"لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ ..."}
        img={"assets/insects/7.jpeg"}
        index={5}
      />
    </div>
  </div>
</div>

<style scoped>

  .insectsInfo {
    padding: 2.5rem 0;
    /*height: 100vh;*/
    position: relative;
  }

  .insectsInfo__titre {
    font-size: 1.7rem;
    position: relative;
  }

  .insectsInfo__titre {
    display: flex;
    align-items: center;
    margin-bottom: 2rem;
    font-family: "dana-bold";
  }

  .insectsInfo__items {
    display: grid;
    align-items: center;
    grid-template-columns: repeat(3, 1fr);
    gap: 2.5rem;
  }

  @media screen and (max-width: 768px) {
    .insectsInfo__items {
      grid-template-columns: repeat(1, 1fr);
    }
  }
</style>
