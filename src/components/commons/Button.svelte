<script>
  export let onClick;
</script>

<div class="d-flex button">
  <button class="button__more" on:click={onClick}>ادامه مطلب</button>
  <img class="button__more--icon" alt="insect" src="assets/icons/3.png" />
</div>

<style>
  .button__more--icon {
    width: 100%;
    height: 100%;
    max-width: 3rem;
    margin-right: 0.5rem;
  }
</style>
