import { getPage } from "../../utils/page";
import { capitalize } from "../../utils/string";
import { loadYamlFile } from "../../utils/yaml";
import { DownloadContext } from "./generators/download/DownloadContext";
import type { ConfigData, ConfigDataItemPage, ConfigDataSearch, GetItemParams, Item, ItemSearch, Search, SearchParams } from "./types";

export class WebEngine {
    readonly name: string;
    readonly url: string;
    readonly searchData: ConfigDataSearch[];
    readonly itemPageData: ConfigDataItemPage[];
    readonly headers: Record<string, string>;

    constructor(fileData: string) {
        const data = loadYamlFile<ConfigData>(fileData);

        this.name = data.name;
        this.url = data.url;
        this.searchData = data.search;
        this.itemPageData = data.item_page;
        this.headers = {
            origin: this.url,
            referer: this.url,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
    }

    async search(params: SearchParams): Promise<Search> {
        const searchData = this.searchData[0];

        const page = await getPage(this.buildUrl(searchData.path, params), this.headers);

        const itemsSelector = searchData.selectors.find((selector) => selector.type === 'items');
        const items = page(itemsSelector?.selector).toArray();

        const itemsSearch: ItemSearch[] = items.map((item) => {
            const titleField = itemsSelector?.fields.find((field) => field.name === 'title');
            const imageField = itemsSelector?.fields.find((field) => field.name === 'image');
            const fieldWithItemLink = itemsSelector?.fields.find((field) => field.has_item_link);

            const title = this.formatText(page(titleField?.selector, item).text());
            const image = this.buildUrl(page(imageField?.selector, item).attr('src')!);
            const path = this.buildPath(page(fieldWithItemLink?.selector, item).attr('href')!);

            return { title, image, path };
        });

        const paginationTotal = page(searchData.pagination.total_selector).text();
        const total = Number(paginationTotal.replace(/\D/g, ''));

        return { items: itemsSearch, page: params.page, total, perPage: itemsSearch.length };
    }

    async getItem(params: GetItemParams): Promise<Item> {
        const itemPage = this.itemPageData.find((itemPage) => this.validateMergedPaths(itemPage.path, params.path));

        if(!itemPage) {
            throw new Error('Item page not found');
        }

        const fields = itemPage.fields;
        const page = await getPage(this.buildUrl(params.path), this.headers);

        const titleField = fields.find((field) => field.name === 'title');
        const imageField = fields.find((field) => field.name === 'image');

        const title = this.formatText(page(titleField!.selector).text());
        const image = this.buildUrl(page(imageField!.selector).attr('src')!);

        const filesPromise = itemPage.files.map(async (file) => {
            const fileNameField = file.fields.find((field) => field.name === 'file_name');
            const fileSizeField = file.fields.find((field) => field.name === 'file_size');
            const downloadField = file.fields.find((field) => field.name === 'download');

            const fileName = fileNameField ? page(`${file.selector} ${fileNameField.selector}`).text() : undefined;
            const fileSize = fileSizeField ? page(`${file.selector} ${fileSizeField.selector}`).text() : undefined;
            let download: string | undefined
            
            if(downloadField) {
                const context = new DownloadContext(page, downloadField.generator)
                const { url } = await context.executeStrategy();

                download = url;
            }

            return { fileName: fileName, fileSize: fileSize, download };
        })

        const files = await Promise.all(filesPromise);

        return { title, image, files };
    }

    // async downloadFile(params: DownloadParams) {
    //     const browser = await puppeteer.launch();
    //     const url = this.buildUrl(params.path);
    //     const page = await browser.newPage();

    //     await page.goto(url);

    //     page.evaluate(() => {
    //         const t= window.getKey();
    //         window.$.ajax({
    //             type:"POST",
    //             url:window.ajaxLinkUrl+"?k="+t+"&t="+window.getToken(t),
    //             success:function(t){
    //                 $("#submitForm").attr("action",t.link);
    //                 $("#submitForm").submit();
    //             }
    //         });
    //     })

    //     const promise = new Promise((resolve) => {
    //         page.on('response', async (response) => {
    //             const request = response.request();
    
    //             console.log(request.url());

    //             // resolve(null)
    //         });
    //     })

    //     await promise;

    //     await browser.close();
    // }

    private buildUrl(path: string, params?: Record<string, any>): string {
        const url = new URL(`${this.url}${this.buildPath(path)}`);

        if(!params) {
            return url.href;
        }

        url.searchParams.forEach((value, key) => {
            const foundedKey = Object.keys(params).find((paramKey) => `{${paramKey}}` === value);

            if(foundedKey) {
                const normalizedValue = String(params[foundedKey])
                url.searchParams.set(key, normalizedValue);

                if(!normalizedValue.length) {
                    url.searchParams.delete(key);
                }
            }
        })

        const pathParts = path.split('/');
        const pathPartsLength = pathParts.length;

        for(let i = 0; i < pathPartsLength; i++) {
            const pathPart = pathParts[i];

            const regex = /{(\w+)}/;
            const match = pathPart.match(regex);

            if(match) {
                const param = match[1];
                const paramValue = params[param];

                if(paramValue) {
                    pathParts[i] = paramValue;
                }
            }
        }

        url.pathname = pathParts.join('/');

        return url.href;
    }

    private buildPath(url: string): string {
        return url.replace(this.url, '');
    }

    private validateMergedPaths(pathValidator: string, path: string): boolean {
        const pathValidatorParts = pathValidator.split('/');
        const pathParts = path.split('/');
        const pathValidatorPartsLength = pathValidatorParts.length;
        const pathPartsLength = pathParts.length;

        if(pathValidatorPartsLength !== pathPartsLength) {
            return false;
        }

        for(let i = 0; i < pathValidatorPartsLength; i++) {
            const pathValidatorPart = pathValidatorParts[i];
            const pathPart = pathParts[i];

            const regex = /{(\w+)}/;
            const match = pathValidatorPart.match(regex);

            if(match) {
                const param = match[1];
                const paramValue = pathPart;

                if(param === 'number' && isNaN(Number(paramValue))) {
                    return false;
                }
            } else if(pathValidatorPart !== pathPart) {
                return false;
            }
        }

        return true;
    }

    private formatText(text: string): string {
        const trimmedText = text.trim().replace(/\s+/g, ' ');

        return capitalize(trimmedText);
    }
}
