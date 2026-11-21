import { DOMParser } from '@xmldom/xmldom'

export type PlistStringEntry = { readonly key: string; readonly text: string }

function failOnMalformedXml(level: string, message: string): void {
  throw new Error(`malformed plist (${level}): ${message}`)
}

export function parsePlistStringEntries(xml: string): PlistStringEntry[] {
  const document = new DOMParser({ onError: failOnMalformedXml }).parseFromString(xml, 'text/xml')
  const entries: PlistStringEntry[] = []
  const keyElements = document.getElementsByTagName('key')
  for (let index = 0; index < keyElements.length; index += 1) {
    const keyElement = keyElements.item(index)
    let sibling = keyElement?.nextSibling ?? null
    while (sibling && sibling.nodeType !== 1) sibling = sibling.nextSibling
    if (keyElement && sibling?.nodeName === 'string') {
      entries.push({ key: keyElement.textContent ?? '', text: sibling.textContent ?? '' })
    }
  }
  return entries
}

export function findPlistStringValues(xml: string, key: string): string[] {
  return parsePlistStringEntries(xml)
    .filter((entry) => entry.key === key)
    .map((entry) => entry.text)
}
