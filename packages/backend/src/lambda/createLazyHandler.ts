export function createLazyHandler<Arguments extends readonly unknown[], Reply>(
  buildHandler: () => (...handlerArguments: Arguments) => Reply,
): (...handlerArguments: Arguments) => Reply {
  let builtHandler: ((...handlerArguments: Arguments) => Reply) | undefined
  return (...handlerArguments) => {
    builtHandler ??= buildHandler()
    return builtHandler(...handlerArguments)
  }
}
