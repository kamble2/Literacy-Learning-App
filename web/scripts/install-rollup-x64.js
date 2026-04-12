/**
 * Ensures @rollup/rollup-darwin-x64 is installed alongside the arm64 binding.
 * npm's optional-dep CPU filter only installs one arch, but on macOS with a
 * universal Node binary the process may start as either arm64 or x64 depending
 * on the terminal. This script fetches the missing x64 binding after install.
 */
const { existsSync, mkdirSync } = require('fs')
const { execSync } = require('child_process')
const path = require('path')

const pkg = path.join(__dirname, '..', 'node_modules', '@rollup', 'rollup-darwin-x64')

if (process.platform !== 'darwin') process.exit(0)
if (existsSync(pkg)) process.exit(0)

console.log('[postinstall] Installing @rollup/rollup-darwin-x64 for x64 Node compatibility...')

try {
  const version = require(path.join(__dirname, '..', 'node_modules', 'rollup', 'package.json')).version
  const url = `https://registry.npmjs.org/@rollup/rollup-darwin-x64/-/rollup-darwin-x64-${version}.tgz`
  mkdirSync(pkg, { recursive: true })
  execSync(`curl -sL "${url}" | tar -xz --strip-components=1 -C "${pkg}"`, { stdio: 'inherit' })
  console.log('[postinstall] Done.')
} catch (e) {
  console.warn('[postinstall] Warning: could not install rollup-darwin-x64:', e.message)
}
