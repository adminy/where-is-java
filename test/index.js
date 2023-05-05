import { realpathSync } from 'fs'
import path from 'path'
import { spawnSync } from 'child_process'
import test from 'tape'
import LocateJavaHome from '../index.js'

test('API Tests', t => {
  const allJavaHomes = LocateJavaHome()
  t.ok(allJavaHomes.length, 'Finds Java installations with no filter')
  process.platform !== 'win32' && t.ok(LocateJavaHome({ mustBeJDK: true }).length, 'Finds JDK')
  for (const javaHome of LocateJavaHome()) {
    if (process.platform !== 'linux') {
      const envData = JSON.parse(spawnSync(path.join(javaHome.home, 'bin', 'java'), ['-classpath', 'test/fixtures', 'EnvironmentTest']).stdout.toString().trim())
      t.same(realpathSync(path.join(javaHome.home, !javaHome.isJDK && process.platform === 'darwin' ? 'jre' : '')), realpathSync(envData.path), 'same java path')
      t.same(javaHome.is64Bit, envData.is64Bit, 'same bits')
      t.ok(javaHome.version.startsWith(envData.version), 'same version')
    }
  }
  const javaHomeZero = allJavaHomes[0]
  const expectedCount = allJavaHomes.filter(javaHome => javaHome.version === javaHomeZero.version).length

  t.same(LocateJavaHome({ version: `=${javaHomeZero.version}` }).length, expectedCount, 'Applies a filter correctly')

  const output = spawnSync('node', [path.join('bin', 'whereisjava.js')])
  const lines = output.stdout.toString().trim().split('\n').filter(line => line)
  t.ok(lines.length, `Found ${lines.length} JAVA_HOMES`)
  t.end()
})
