# Where is Java
> finds all java versions on any platform syncronously.
## API
```javascript
import fs from 'fs'
import cp from 'child_process'
import WhereIsJava from 'where-is-java'
const listOfJavaVersions = WhereIsJava({ // all arguments are optional
  version: '>1.8',
  mustBeJDK: true,
  mustBeJRE: false,
  mustBe64Bit: true,
  mustBeArm: false
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
