// @ts-check
import fs from 'fs';
import { parse } from 'jsonc-parser';
/**
 * Parses JSONC configuration file.
 * @param {string} path
 * @returns {object}
 */
export default function parseConfig(path) {
  const configRaw = fs.readFileSync(path, 'utf-8');
  const config = parse(configRaw);
  return config;
}
