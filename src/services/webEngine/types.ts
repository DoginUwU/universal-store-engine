export interface ConfigData {
    name: string;
    url: string;
    search: ConfigDataSearch[]
    item_page: ConfigDataItemPage[]
}

export interface ConfigDataSearch {
    path: string;
    tags: string;
    pagination: {
        total_selector: string;
    }
    selectors: {
        type: 'items'
        selector: string;
        fields: {
            name: 'title' | 'image';
            selector: string;
            has_item_link?: boolean;
        }[]
    }[]
}

type FileField = {
    name: 'title' | 'image' | 'file_name' | 'file_size' | 'download';
    selector: string;
    [key: string]: any;
}

export interface ConfigDataItemPage {
    path: string;
    tags: string;
    fields: {
        name: 'title' | 'image' | 'element';
        selector: string;
    }[]
    files: {
        selector: string;
        fields: FileField[]
    }[]
}

export interface ItemSearch {
    title: string;
    image: string;
    path: string;
}

export interface SearchParams {
    search: string;
    page: number;
}

export interface Search {
    items: ItemSearch[];
    perPage: number;
    total: number;
    page: number;
}

export interface GetItemParams {
    path: string;
}

export interface Item {
    title: string;
    image: string;
    files: {
        title?: string;
        image?: string;
        fileName?: string;
        fileSize?: string;
        download?: string;
    }[]
}

export interface DownloadParams {
    path: string;
}
