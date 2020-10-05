import { newLog, logWith } from "./index";

describe("log", () => {
  const consoleSpy = jest.spyOn(console, "log");

  afterEach(() => {
    consoleSpy.mockClear();
  });

  it("should log message", () => {
    newLog().debug("test");

    expect(consoleSpy).toHaveBeenCalledWith(
      '{"message":"test","level":"debug"}'
    );
  });

  it("should log meta fields", () => {
    newLog({ meta1: "test meta value" }).debug("test");

    expect(consoleSpy).toHaveBeenCalledWith(
      '{"message":"test","level":"debug","meta1":"test meta value"}'
    );
  });

  it.each([
    [newLog().debug, "debug"],
    [newLog().info, "info"],
    [newLog().warning, "warning"],
    [newLog().error, "error"],
    [newLog().critical, "critical"],
  ])("should log with correct level", (fn, level) => {
    fn(`test for ${level}`);

    expect(consoleSpy).toHaveBeenCalledWith(
      `{"message":"test for ${level}","level":"${level}"}`
    );
  });

  it("should log message and extra field", () => {
    newLog().debug("test", { fieldA: "a" });

    expect(consoleSpy).toHaveBeenCalledWith(
      '{"message":"test","extra":{"fieldA":"a"},"level":"debug"}'
    );
  });

  it("should log message and extra errors field", () => {
    newLog().error("test", { errors: [new Error("test-error")] });

    expect(consoleSpy).toHaveBeenCalled();

    const loggedJson = consoleSpy.mock.calls[0][0];
    const loggedObj = JSON.parse(loggedJson);

    expect(loggedObj).toMatchObject({
      level: "error",
      message: "test",
      extra: {
        errors: [{ message: "test-error" }],
      },
    });
  });

  describe("logWith", () => {
    it("should log with extra field", () => {
      logWith(newLog(), { application: "test-app" }).debug("log with fields");

      expect(consoleSpy).toHaveBeenCalledWith(
        '{"message":"log with fields","extra":{"application":"test-app"},"level":"debug"}'
      );
    });

    it("child should log with extra field and root meta field", () => {
      const root = newLog({ application: "test-app" });
      const child = logWith(root, { test1: "test extra value 1" });

      child.debug("test message");

      expect(consoleSpy).toHaveBeenCalledWith(
        '{"message":"test message","extra":{"test1":"test extra value 1"},"level":"debug","application":"test-app"}'
      );
    });

    it("grandchild should log with extra field and root meta field", () => {
      const root = newLog({ application: "test-app" });
      const child = logWith(root, { test1: "test extra value 1" });
      const grandchild = logWith(child, { test2: "test extra value 2" });

      grandchild.debug("test message");

      expect(consoleSpy).toHaveBeenCalledWith(
        '{"message":"test message","extra":{"test1":"test extra value 1","test2":"test extra value 2"},"level":"debug","application":"test-app"}'
      );
    });
  });
});
