import { newLog, logWith, info } from "./index";

info("default log");

const log = logWith(newLog(), { application: "test-app" });
log.debug("root");

const childLog = logWith(log, { a: "test a" });
childLog.debug("child 1");

const grandchildLog = logWith(childLog, { b: "test b" });
grandchildLog.debug("grandchild 1");

grandchildLog.error("Something bad", { errors: [new Error("test error")] });
