import { Tangram } from "./Tangram/Tangram.js";

// create the main function
function main() {
  // Get a reference to the container element
  const container = document.querySelector("#scene-container");

  // 1. Create an instance of the World app
  const tangram = new Tangram(container);

  // 2. Render the scene
  tangram.render();
}

// call main to start the app
main();
