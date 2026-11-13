import { createApplyAllDueChangesUseCase } from '../composition/createApplyAllDueChangesUseCase'
import { createLazyHandler } from './createLazyHandler'

export type SchedulerResult = {
  readonly applied: number
}

export const schedulerHandler = createLazyHandler(() => {
  const applyAllDueChanges = createApplyAllDueChangesUseCase()
  return async (): Promise<SchedulerResult> => ({
    applied: await applyAllDueChanges.applyAllDueChanges(),
  })
})
