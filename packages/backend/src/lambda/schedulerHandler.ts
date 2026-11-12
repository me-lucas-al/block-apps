import { createDynamoStores } from '../composition/createDynamoStores'
import { createTableContext } from '../composition/createTableContext'
import { ApplyAllDueChangesUseCase } from '../cooldown/use-cases/ApplyAllDueChangesUseCase'
import { ApplyDueChangesForUserUseCase } from '../cooldown/use-cases/ApplyDueChangesForUserUseCase'

export type SchedulerResult = {
  readonly applied: number
}

export async function schedulerHandler(): Promise<SchedulerResult> {
  const stores = createDynamoStores(createTableContext())
  const clock = () => new Date()
  const applyDue = new ApplyDueChangesForUserUseCase(
    stores.pendingChangeStore,
    stores.dueChangeApplier,
    clock,
  )
  const applyAll = new ApplyAllDueChangesUseCase(stores.pendingChangeStore, applyDue, clock)
  const applied = await applyAll.applyAllDueChanges()
  return { applied }
}
