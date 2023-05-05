import fs from 'fs'
import cp from 'child_process'
import { satisfies, coerce } from 'semver'
import { enumerateValues, HKEY } from 'registry-js'

const winReg = path => {
  const records = []
  for (const val of enumerateValues(HKEY.HKEY_LOCAL_MACHINE, path)) {
    records.push(val)
  }
  return records
}

const javaInfo = javaExec => {
  const params = cp.spawnSync(javaExec, ['-XshowSettings:properties', '-version']).stderr.toString()
    .trim()
    .split('\n')
    .filter(prop => prop.startsWith(' '))
    .join('\n')
    .replace(/\s{8}(.*?)\n/g, '$1 ')
    .replace(/java\.library\.path = (.*?)\n/, 'java.library.path = $1 ')
    .replace(/java.library.path = (.*?)\.\s{4}(.*?)\s{4}(.*?)\n/, 'java.library.path = $1  \n   $2\n   $3\n')
    .split('\n')
    .reverse()
    .filter(line => line.trim().includes(' = '))
    .map(line => line.split(' = ').map(kv => kv.trim()))

  const props = {}
  for (const [keys, vals] of params) {
    let ptr = props
    let lastKey = ''
    for (const key of keys.split('.')) {
      lastKey && !ptr[lastKey] && (ptr[lastKey] = {})
      lastKey && (ptr = ptr[lastKey])
      lastKey = key
    }
    const val = vals.split(/\s+/)
    ptr[lastKey] = val.length === 1 ? val[0] : val
  }
  const { java, sun, os, file } = props
  return {
    version: java.version,
    vendor: Array.isArray(java.vendor) ? java.vendor.join(' ') : java.vendor,
    home: java.home,
    is64Bit: sun.arch.data.model === '64',
    isArm: os.arch === 'aarch64',
    isX86: os.arch === 'x86_64',
    isJDK: fs.existsSync(java.home + file.separator + 'bin' + file.separator + 'javac')
  }
}

const win32 = () => {
  const paths = [
    'SOFTWARE\\JavaSoft\\JDK',
    'SOFTWARE\\JavaSoft\\Java Development Kit',
    'SOFTWARE\\JavaSoft\\Java Runtime Environment',
    'SOFTWARE\\Wow6432Node\\JavaSoft\\JDK',
    'SOFTWARE\\Wow6432Node\\JavaSoft\\Java Development Kit',
    'SOFTWARE\\Wow6432Node\\JavaSoft\\Java Runtime Environment'
  ]
  const homes = []
  for (const path of paths) {
    const ver = winReg(path).find(({ name }) => name === 'CurrentVersion')?.data
    ver && homes.push(
      ...winReg(path + '\\' + ver)
        .filter(({ name }) => name === 'JavaHome')
        .map(({ data }) => data)
    )
  }
  return [...new Set(homes)].map(home => ({ home }))
}

const darwin = () => {
  const EXTRACT_JAVA = /^\s+(.*?)\s\((.*?)\)\s"(.*?)"\s-\s"(.*?)"\s(.*?)$/
  const lines = cp.spawnSync('/usr/libexec/java_home', ['-V']).stderr.toString().trim().split('\n')
  // console.log('these should equal: ', parseInt(/\d+/.exec(lines[0])[0]) === lines.length - 1)
  return lines.slice(1).map(line => {
    const [_, version, arch, vendor, edition, home] = EXTRACT_JAVA.exec(line)
    return {
      version,
      vendor,
      home,
      edition, // really unnecessary
      is64Bit: arch.includes('64'),
      isArm: arch === 'aarch64',
      isX86: arch === 'x86_64',
      isJDK: fs.existsSync(home + '/bin/javac')
    }
  })
}

const linux = () => cp.spawnSync('update-java-alternatives', ['-l']).stdout.toString()
    .trim()
    .split('\n')
    .map(line => line.split(' '))
    .map(([version, vendor, home]) => ({ home }))

export default ({version = '*', mustBeJDK = false, mustBeJRE = false, mustBe64Bit, mustBeArm }) => {
  const defaultJava = javaInfo('java')
  const javaVersions = ({ darwin, macos: darwin, linux, win32 })[process.platform]()
  const separator = process.platform === 'win32' ? '\\' : '/'
  const exe = separator + 'bin' + separator + 'java' + (separator === '\\' ? '.exe' : '')
  for (const java of javaVersions) {
    java.home === defaultJava.home && (java.default = true)
    Object.assign(java, javaInfo(java.home + exe), { home: java.home })
  }
  return javaVersions.filter(java =>
    (!mustBeJDK && !mustBeJRE ? true : (java.isJDK ? mustBeJDK : mustBeJRE)) &&
    (mustBe64Bit ? java.is64Bit : true) &&
    (mustBeArm ? java.isArm : true) &&
    satisfies(coerce(java.version), version)
  )
  .sort((a, b) => b.version.localeCompare(a.version))
}
