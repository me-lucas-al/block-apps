import { ApplyAllDueChangesUseCase } from '../cooldown/use-cases/ApplyAllDueChangesUseCase'
import { ApplyDueChangesForUserUseCase } from '../cooldown/use-cases/ApplyDueChangesForUserUseCase'
import { createDynamoStores } from './createDynamoStores'
import { createTableContext } from './createTableContext'

export function createApplyAllDueChangesUseCase(): ApplyAllDueChangesUseCase {
  const stores = createDynamoStores(createTableContext())
  const clock = () => new Date()
  const applyDueChangesForUser = new ApplyDueChangesForUserUseCase(
    stores.pendingChangeStore,
    stores.dueChangeApplier,
    clock,
  )
  return new ApplyAllDueChangesUseCase(stores.pendingChangeStore, applyDueChangesForUser, clock)
}
