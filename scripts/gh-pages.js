const ghpages = require("gh-pages");

ghpages.publish(
  "__sapper__/export/insect",
  {
    branch: "gh-pages",
    repo: "https://github.com/HosseinShabani/insect.git",
    user: {
      name: "HosseinShabani",
      email: "hosseinshabani.work@gmail.com",
    },
  },
  () => {
    console.log("Deploy Complete!");
  }
);
