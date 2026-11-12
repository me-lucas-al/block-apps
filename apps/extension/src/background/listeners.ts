import {
  ENFORCE_ALARM,
  REFRESH_ALARM,
  RULES_CHANGED_MESSAGE,
} from '../shared/messages'
import type { BackgroundServices } from './composition'

const ENFORCE_PERIOD_MINUTES = 1
const REFRESH_PERIOD_MINUTES = 5

function logFailure(task: string) {
  return (error: unknown) => console.error(`[block-apps] ${task} failed`, error)
}

async function refreshAndReport({ refresher, reporter }: BackgroundServices) {
  await refresher.refresh().catch(logFailure('refresh'))
  await reporter.report().catch(logFailure('device report'))
}

function scheduleAlarms(): void {
  chrome.alarms.create(ENFORCE_ALARM, { periodInMinutes: ENFORCE_PERIOD_MINUTES })
  chrome.alarms.create(REFRESH_ALARM, { periodInMinutes: REFRESH_PERIOD_MINUTES })
}

export function registerListeners(services: BackgroundServices): void {
  const start = () => {
    scheduleAlarms()
    void refreshAndReport(services)
  }

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
