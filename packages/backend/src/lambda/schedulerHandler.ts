import { createDynamoStores } from '../composition/createDynamoStores'
import { createTableContext } from '../composition/createTableContext'
import { ApplyAllDueChangesUseCase } from '../cooldown/use-cases/ApplyAllDueChangesUseCase'
import { ApplyDueChangesForUserUseCase } from '../cooldown/use-cases/ApplyDueChangesForUserUseCase'

export type SchedulerResult = {
  readonly applied: number
}

let cachedUseCase: ApplyAllDueChangesUseCase | undefined

function getUseCase(): ApplyAllDueChangesUseCase {
  if (!cachedUseCase) {
    const stores = createDynamoStores(createTableContext())
    const clock = () => new Date()
    const applyDue = new ApplyDueChangesForUserUseCase(
      stores.pendingChangeStore,
      stores.dueChangeApplier,
      clock,
    )
    cachedUseCase = new ApplyAllDueChangesUseCase(stores.pendingChangeStore, applyDue, clock)
  }
  return cachedUseCase
}

export async function schedulerHandler(): Promise<SchedulerResult> {
  const applied = await getUseCase().applyAllDueChanges()
  return { applied }
}
