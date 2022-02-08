# Where is Java
> finds all java versions on any platform.

[![Test Status](https://github.com/adminy/wij/workflows/test/badge.svg?branch=master)](https://github.com/adminy/wij/actions?query=workflow%3Apublish+branch%3Amaster)

## Usage

    npm install @adminy/wij

## API
```javascript
const fs = require('fs')
const cp = require('child_process')
const WhereIsJava = require('@adminy/wij')
const listOfJavaVersions = WhereIsJava({
  version: '>1.8', mustBeJDK: true, mustBeJRE: false, mustBe64Bit: true, mustBeArm: true,
  platform: process.platform, fileExists: fs.existsSync, runExec: cp.spawnSync
})

const myJava = listOfJavaVersions.find(java => java.default)
cp.spawnSync(myJava.home + '/bin/javac', ['MyJavaClass.java'])
```

## Example Response
```javascript
[
  {
    version: '17.0.2',
    vendor: 'Oracle Corporation',
    home: '/Library/Java/JavaVirtualMachines/jdk-17.0.2.jdk/Contents/Home',
    is64Bit: true,
    isArm: false,
    isX86: true,
    isJDK: true,
    default: true
  },
  {
    version: '17.0.1',
    vendor: 'Eclipse Adoptium',
    home: '/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home',
    is64Bit: true,
    isArm: true,
    isX86: false,
    isJDK: true
  },
  {
    version: '16.0.1',
    vendor: 'AdoptOpenJDK',
    home: '/Library/Java/JavaVirtualMachines/adoptopenjdk-16.jdk/Contents/Home',
    is64Bit: true,
    isArm: false,
    isX86: true,
    isJDK: true
  },
  {
    version: '1.8.0_312',
    vendor: 'Temurin',
    home: '/Library/Java/JavaVirtualMachines/temurin-8.jdk/Contents/Home',
    is64Bit: true,
    isArm: false,
    isX86: true,
    isJDK: false
  }
]
```


## TODO:
- [ ] Test no java installed (all 3 oses)
- [ ] Test no default java selected
- [ ] check JAVA_HOME variable, for better install coverage

## Motivation
- There is nothing good out there, especially if you try it in an environment other than node.js
- Completely syncronous solution, keep the code clean, call and use right away, no waiting or weird fails
