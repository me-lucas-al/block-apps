export class SerialTaskQueue {
  private tail: Promise<unknown> = Promise.resolve()

  run<TaskResult>(task: () => Promise<TaskResult>): Promise<TaskResult> {
    const taskResult = this.tail.then(task)
    this.tail = taskResult.catch(() => undefined)
    return taskResult
  }
}
