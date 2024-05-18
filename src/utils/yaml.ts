import { parse } from 'yaml'
import { readFileSync } from 'fs'

export function loadYamlFile<T>(path: string): T {
    const file = readFileSync(path, 'utf8')

    return parse(file)
}
