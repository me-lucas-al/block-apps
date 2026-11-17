import { useState } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { HomeHeader } from '../../components/home/HomeHeader'
import { ProtectionStatus } from '../../components/protection/ProtectionStatus'
import { StrictModeCard } from '../../components/protection/StrictModeCard'
import { GroupRuleItem } from '../../components/rules/groups/GroupRuleItem'
import { Button } from '../../components/ui/Button'
import { useBlockRules } from '../../hooks/rules/useBlockRules'
import { useGroupAppChoices } from '../../hooks/rules/useGroupAppChoices'
import type { GroupSelectionPort } from '../../ports/groupselection/GroupSelectionPort'
import { colors } from '../../theme'
import { AddGroupRuleScreen } from '../AddGroupRuleScreen'

type GroupHomeScreenProps = {
  email: string
  groupSelection: GroupSelectionPort
}

export function GroupHomeScreen({ email, groupSelection }: GroupHomeScreenProps) {
  const rulesState = useBlockRules()
  const choices = useGroupAppChoices({
    groupSelection,
    ruleIds: rulesState.rules.map((rule) => rule.id),
    appliedVersion: rulesState.appliedVersion,
    holdSelectionRemovalUntilCooldownEnds: rulesState.holdSelectionRemovalUntilCooldownEnds,
  })
  const [adding, setAdding] = useState(false)

  if (adding) {
    return (
      <AddGroupRuleScreen
        groupSelection={groupSelection}
        onSubmit={rulesState.create}
        onCancel={() => setAdding(false)}
      />
    )
  }

  return (
    <View style={styles.container}>
      <HomeHeader email={email} />
      <ProtectionStatus />
      <StrictModeCard />
      {rulesState.error && <Text style={styles.error}>{rulesState.error}</Text>}
      {choices.notice && <Text style={styles.notice}>{choices.notice}</Text>}
      <FlatList
        data={rulesState.rules}
        keyExtractor={(rule) => rule.id}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum grupo de apps ainda.</Text>}
        renderItem={({ item }) => (
          <GroupRuleItem
            rule={item}
            appsChosen={choices.hasChosenApps(item.id)}
            selectionUnreadable={choices.isSelectionUnreadable(item.id)}
            overAppLimit={choices.isOverAppLimit(item.id)}
            alwaysBlockedForLackOfSlots={choices.isBlockedForLackOfSlots(item.id)}
            pendingChange={rulesState.pendingChanges.find((change) => change.ruleId === item.id)}
            onChooseApps={(rule) => void choices.chooseAppsOfRule(rule)}
            onRemove={(id) => void rulesState.requestRemoval(id)}
            onCancel={(id) => void rulesState.cancelChange(id)}
          />
        )}
      />
      <Button label="Bloquear um grupo de apps" onPress={() => setAdding(true)} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 12, padding: 20 },
  error: { color: colors.danger },
  notice: { color: colors.muted },
  empty: { color: colors.muted },
})
