#!/usr/bin/env node
import WhereIsJava from '../index.js'

for (const java of WhereIsJava()) {
  console.log([
    java.isJDK ? '[JDK]' : '[JRE]',
    java.isArm ? '[ARM]' : '[x86]',
    java.is64Bit ? '[64-bit]' : '[32-bit]',
    java.version,
    java.home
  ].join(' '))
}
