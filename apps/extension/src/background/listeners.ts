import {
  ENFORCE_ALARM,
  REFRESH_ALARM,
  RULES_CHANGED_MESSAGE,
} from '../shared/messages'
import type { BackgroundServices } from './composition'
import { logFailure } from './logFailure'

const ENFORCE_PERIOD_MINUTES = 1
const REFRESH_PERIOD_MINUTES = 5

async function refreshAndReport({ refresher, reporter }: BackgroundServices) {
  await refresher.refresh().catch(logFailure('refresh'))
  await reporter.report().catch(logFailure('device report'))
}

async function scheduleAlarmIfMissing(name: string, periodInMinutes: number): Promise<void> {
  const scheduledAlarm = await chrome.alarms.get(name)
  if (!scheduledAlarm) await chrome.alarms.create(name, { periodInMinutes })
}

async function scheduleMissingAlarms(): Promise<void> {
  await scheduleAlarmIfMissing(ENFORCE_ALARM, ENFORCE_PERIOD_MINUTES)
  await scheduleAlarmIfMissing(REFRESH_ALARM, REFRESH_PERIOD_MINUTES)
}

export function registerListeners(services: BackgroundServices): void {
  const start = () => {
    void services.synchronizer.sync().catch(logFailure('enforce'))
    void refreshAndReport(services)
  }

  void scheduleMissingAlarms().catch(logFailure('alarms'))

  chrome.runtime.onInstalled.addListener(start)
  chrome.runtime.onStartup.addListener(start)

  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === ENFORCE_ALARM) {
      void services.synchronizer.sync().catch(logFailure('enforce'))
    }
    if (alarm.name === REFRESH_ALARM) void refreshAndReport(services)
  })

  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === RULES_CHANGED_MESSAGE) void refreshAndReport(services)
  })
}
