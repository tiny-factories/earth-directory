import fs from "fs";
import { cachedPostData } from "@/lib/utils";

// First step
// const blogContent = await cachedPostData("blog");

// Second step
function createBlogCache(filename) {
  fs.writeFile(`./cache/${filename}.js`, blogContent, function (err) {
    if (err) {
    }
  });
}

createBlogCache("blog");
