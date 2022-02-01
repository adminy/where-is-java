import { resolve as resolvePath } from 'path'
import { realpathSync } from 'fs'
import { spawnSync } from 'child_process'
import test from 'tape'
import LocateJavaHome from '..'

test('API Tests', t => {
  const allJavaHomes = LocateJavaHome({})
  t.ok(allJavaHomes.length, 'Finds Java installations with no filter')
  t.ok(LocateJavaHome({ mustBeJDK: true }).length, 'Finds JDK')
  for (const javaHome of LocateJavaHome({})) {
    const java = javaHome.executables.java
    const envData = JSON.parse(spawnSync(java, ['-classpath', 'test/fixtures', 'EnvironmentTest']).stdout.toString().trim())
    const majorJavaVersion = parseInt(javaHome.version)
    // Java 8 and earlier JDKs report a /jre path for java.home.
    // Java 9 changes that. Java 9 also reports its version as 9.0 rather than 1.9.
    // Remove /jre from end of path.
    const javaPath = javaHome.isJDK && majorJavaVersion < 9 ? resolvePath(envData.path, '..') : envData.path
    t.same(realpathSync(javaHome.path), realpathSync(envData.path), 'same java path')
    t.same(javaHome.security, envData.security, 'same security')
    t.same(javaHome.is64Bit, envData.is64Bit, 'same bits')
    // restrict version comparison to first 3 decimal places (macOS once reported 11.0.9.1 as envData.version)
    const envDataVersionComponents = envData.version.split('.')
    const shortEnvDataVersion = envDataVersionComponents.splice(0, 3).join('.')
    t.same(javaHome.version, shortEnvDataVersion, 'same short version')
  }
  const javaHomeZero = allJavaHomes[0]
  const expectedCount = allJavaHomes.filter(javaHome => javaHome.version === javaHomeZero.version).length

  t.same(LocateJavaHome({ version: `=${javaHomeZero.version}` }).length, expectedCount, 'Applies a filter correctly')

  // Path to the CLI
  const LJH_BIN = resolvePath(__dirname, '..', 'bin', 'locate-java-home')
  const output = spawnSync('node', [LJH_BIN])
  // Note: Need to call Node explicitly on Windows.
  const lines = output.stdout.toString().trim().split('\n').filter(line => line)
  t.same(new Set(lines).size, allJavaHomes.length, 'Should print all found JAVA_HOMES')
})
