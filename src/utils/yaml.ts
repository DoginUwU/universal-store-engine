import { parse } from 'yaml'

export function loadYamlFile<T>(file: string): T {
    return parse(file)
}
