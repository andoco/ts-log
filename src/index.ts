enum Level {
  debug = "debug",
  info = "info",
  warning = "warning",
  error = "error",
}

type Extra = {
  errors?: Error[];
} & Record<string, unknown>;

type Entry = { level: Level; message: string; extra?: Extra };

type LogFunc = (message: string, extra?: Extra) => void;

type Log = {
  currentExtra?: Extra;
  formatter: Formatter;
  debug: LogFunc;
  info: LogFunc;
  warning: LogFunc;
  error: LogFunc;
};

type Formatter = (entry: Entry) => void;

const replaceErrors = (_key: string, value: unknown) => {
  if (value instanceof Error) {
    var error: Record<string, unknown> = {};

    Object.getOwnPropertyNames(value).forEach(function (key) {
      error[key] = ((value as unknown) as Record<string, unknown>)[key];
    });

    return error;
  }

  return value;
};

const jsonFormatter: Formatter = (entry: Entry) =>
  console.log(JSON.stringify(entry, replaceErrors));

const write = (
  formatter: Formatter,
  level: Level,
  message: string,
  extra?: Extra
) => formatter({ message, extra, level });

const newLevelLoggers = (formatter: Formatter, currentExtra?: Extra) => {
  const mergeExtra = (a?: Extra, b?: Extra) => {
    return !(a || b) ? undefined : { ...a, ...b };
  };

  const forLevel = (level: Level) => (message: string, extra?: Extra) =>
    write(formatter, level, message, mergeExtra(currentExtra, extra));

  return Object.freeze({
    debug: forLevel(Level.debug),
    info: forLevel(Level.info),
    warning: forLevel(Level.warning),
    error: forLevel(Level.error),
  });
};

export const newLog = (formatter = jsonFormatter): Log =>
  Object.freeze({
    formatter,
    ...newLevelLoggers(formatter),
  });

export const logWith = (log: Log, extra: Extra): Log => {
  const newExtra = { ...log.currentExtra, ...extra };
  return Object.freeze({
    currentExtra: newExtra,
    formatter: log.formatter,
    ...newLevelLoggers(log.formatter, newExtra),
  });
};

export const { debug, info, warning, error } = newLevelLoggers(jsonFormatter);
