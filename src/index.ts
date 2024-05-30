import { WebEngine } from "./services/webEngine/engine";
import { FetchEngine } from "./services/fetchEngine/fetch";
import path from 'path';
import * as fs from "node:fs";

const filePath = path.resolve(__dirname, '../examples/cdromance.yaml');
const content = fs.readFileSync(filePath, 'utf8');
const engine = new WebEngine(content);
// console.log(await engine.search({ search: '', page: 1 }));
console.log(await engine.getItem({ path: '/nds-roms/professor-layton-and-the-curious-village-usa/' }));

export { WebEngine, FetchEngine };
