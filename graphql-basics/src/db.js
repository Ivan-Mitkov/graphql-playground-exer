//Demo User data
const users = [
  { id: "12fgh", name: "Sylvia", email: "s@s.com", age: 23 },
  { id: "12h", name: "Saint", email: "s@si.com", age: 27 },
  { id: "12dfh", name: "Merulin", email: "ds@si.com" }
];
const posts = [
  {
    id: "12fgh",
    title: "Sylvia",
    body: "is good looking woman",
    published: true,
    author: "12fgh"
  },
  {
    id: "12h",
    title: "Rog",
    body: "WTF is this",
    published: false,
    author: "12h"
  },
  {
    id: "fgh",
    title: "Mondo",
    body: "L'ombeliko del mondo ",
    published: true,
    author: "12dfh"
  },
  {
    id: "ds",
    title: "Strah",
    body: "Mechka strah men ne strah ",
    published: true,
    author: "12h"
  }
];
const comments = [
  { id: "jkk", text: "Boko", author: "12fgh", post: "12fgh" },
  { id: "jhjhkh", text: "Return to the basics", author: "12h", post: "ds" },
  {
    id: "fgfghf",
    text: "Kilimandjaro e v Tanzania",
    author: "12h",
    post: "12fgh"
  },
  { id: "tgjs", text: "Golemi gluposti", author: "12h", post: "fgh" }
];

const db = {
  users,
  posts,
  comments
};

export {db as default}
