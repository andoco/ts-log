enum Level {
  debug = "debug",
  info = "info",
  warning = "warning",
  error = "error",
}

type Meta = Record<string, unknown>;

type Extra = {
  errors?: Error[];
} & Record<string, unknown>;

type Entry = { level: Level; message: string; meta?: Meta; extra?: Extra };

type LogFunc = (message: string, extra?: Extra) => void;

type Log = {
  meta?: Meta;
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
  console.log(
    JSON.stringify(
      {
        message: entry.message,
        extra: entry.extra,
        level: entry.level,
        ...entry.meta,
      },
      replaceErrors
    )
  );

const write = (
  formatter: Formatter,
  level: Level,
  message: string,
  meta?: Meta,
  extra?: Extra
) => formatter({ message, level, meta, extra });

const newLevelLoggers = (
  formatter: Formatter,
  meta?: Meta,
  currentExtra?: Extra
) => {
  const mergeExtra = (a?: Extra, b?: Extra) => {
    return !(a || b) ? undefined : { ...a, ...b };
  };

  const forLevel = (level: Level) => (message: string, extra?: Extra) =>
    write(formatter, level, message, meta, mergeExtra(currentExtra, extra));

  return Object.freeze({
    debug: forLevel(Level.debug),
    info: forLevel(Level.info),
    warning: forLevel(Level.warning),
    error: forLevel(Level.error),
  });
};

export const newLog = (meta?: Meta, formatter = jsonFormatter): Log =>
  Object.freeze({
    meta,
    formatter,
    ...newLevelLoggers(formatter, meta),
  });

export const logWith = (log: Log, extra: Extra): Log => {
  const newExtra = { ...log.currentExtra, ...extra };
  return Object.freeze({
    currentExtra: newExtra,
    formatter: log.formatter,
    ...newLevelLoggers(log.formatter, log.meta, newExtra),
  });
};

export const { debug, info, warning, error } = newLevelLoggers(jsonFormatter);
