import registerAddServer from "./add-server.js";
import registerEditServer from "./edit-server.js";
import registerListServers from "./list-servers.js";
import registerRemoveServer from "./remove-server.js";

/** Every CLI command, in the order they appear in --help */
export default [
  registerAddServer,
  registerEditServer,
  registerListServers,
  registerRemoveServer,
];
