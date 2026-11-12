const apiUrl = process.env['API_URL']?.replace(/\/+$/, '')
const authToken = process.env['AUTH_TOKEN']

if (!apiUrl) {
  console.error('Usage: API_URL=<endpoint> [AUTH_TOKEN=<jwt>] node smokeTest.mjs')
  process.exit(1)
}

async function request(path, options = {}) {
  const headers = { 'content-type': 'application/json', ...(options.headers ?? {}) }
  if (authToken) headers['authorization'] = `Bearer ${authToken}`
  const response = await fetch(`${apiUrl}${path}`, { ...options, headers })
  const text = await response.text()
  let body
  try {
    body = JSON.parse(text)
  } catch {
    body = text
  }
  return { status: response.status, body }
}

async function run() {
  console.log(`Checking health on ${apiUrl}...`)
  const health = await request('/health')
  if (health.status !== 200) throw new Error(`Health check failed: ${health.status}`)
  console.log('Health check passed.')

  if (!authToken) {
    console.log('No AUTH_TOKEN provided. Skipping authenticated tests.')
    return
  }

  console.log('Testing rule creation...')
  const target = `smoke-test-${Date.now()}.example.com`
  const createRule = await request('/rules', {
    method: 'POST',
    body: JSON.stringify({ targetType: 'site', target, mode: 'always' }),
  })
  if (createRule.status !== 201) throw new Error(`Rule creation failed: ${createRule.status}`)
  const ruleId = createRule.body.id
  console.log(`Created rule ${ruleId}.`)

  console.log('Testing rule listing...')
  const listRules = await request('/rules')
  if (listRules.status !== 200) throw new Error(`Rule listing failed: ${listRules.status}`)
  console.log(`Found ${listRules.body.length} rules.`)

  console.log('Testing rule removal request...')
  const removal = await request(`/rules/${ruleId}/removal-requests`, { method: 'POST' })
  if (removal.status !== 202) throw new Error(`Removal request failed: ${removal.status}`)
  console.log('Removal request accepted.')

  console.log('Testing admin users endpoint...')
  const adminUsers = await request('/admin/users')
  if (adminUsers.status === 200) {
    console.log(`Admin users listing passed (${adminUsers.body.length} users).`)
  } else {
    console.log(`Admin users returned ${adminUsers.status} (token may lack admin role).`)
  }

  console.log('Smoke tests completed successfully.')
}

run().catch((error) => {
  console.error('Smoke test failed:', error.message)
  process.exit(1)
})
