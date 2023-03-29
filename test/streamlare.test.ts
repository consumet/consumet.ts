import { StreamLare } from "../src/extractors";

const streamlare = new StreamLare();

let testicles = async () => {
    const data = await streamlare.extract(new URL("https://slmaxed.com/v/RWwM7lM8ZPPzZKbo"));
    console.log(data)
};

testicles();