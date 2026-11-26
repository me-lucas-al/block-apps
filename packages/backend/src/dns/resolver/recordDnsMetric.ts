export const DNS_METRIC_NAMESPACE = 'BlockApps/Dns'

export type DnsMetricName = 'DnsFailOpen' | 'DnsTokenLookupFailure' | 'DnsUpstreamFailure'

export function recordDnsMetric(metricName: DnsMetricName, reason: string): void {
  console.log(
    JSON.stringify({
      _aws: {
        Timestamp: Date.now(),
        CloudWatchMetrics: [
          {
            Namespace: DNS_METRIC_NAMESPACE,
            Dimensions: [[]],
            Metrics: [{ Name: metricName, Unit: 'Count' }],
          },
        ],
      },
      [metricName]: 1,
      message: reason,
    }),
  )
}
