import { upgradePackageJson } from './util'

describe('todo', () => {
  test('todo', async () => {
    await upgradePackageJson('test/sample.package.json')
  })
})
