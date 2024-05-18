import { load } from "cheerio";

export async function getPage(url: string, headers: Record<string, string>) {
    const response = await fetch(url, { headers });
    const html = await response.text();
    
    return load(html);
}
