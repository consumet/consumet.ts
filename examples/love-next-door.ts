import { MOVIES } from "../dist";

const main = async () => {
  // Create a new instance of the Dramacool provider
  const dramacool = new MOVIES.DramaCool();
  // Search for a drama. In this case, "Love next door"
  const results = await dramacool.fetchMediaInfo("drama-detail/tomorrow-with-you");
  // print the results
  console.log(results);
};

main();
