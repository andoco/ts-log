import { newLog, logWith } from "./index";

describe("log", () => {
  const consoleSpy = jest.spyOn(console, "log");

  afterEach(() => {
    consoleSpy.mockClear();
  });

  it("should log message", () => {
    newLog().debug("test");

    expect(consoleSpy).toHaveBeenCalledWith(
      '{"message":"test","extra":{},"level":"debug"}'
    );
  });

  it("should log with extra field", () => {
    logWith(newLog(), { application: "test-app" }).debug("log with fields");

    expect(consoleSpy).toHaveBeenCalledWith(
      '{"message":"log with fields","extra":{"application":"test-app"},"level":"debug"}'
    );
  });
});
