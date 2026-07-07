// Entry point. Boots the Game and wires up the on-screen touch controls.
import { Game } from "./game.js";
import { TouchControls } from "./touch.js";

const canvas = document.getElementById("game");
const game = new Game(canvas);
new TouchControls(game.input);
game.start();
