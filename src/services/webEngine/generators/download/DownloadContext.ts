import type {CheerioAPI} from "cheerio";
import type {DownloadStrategy, DownloadStrategyParams, DownloadStrategyReturn} from "./DownloadStrategy";
import {FetchLinkStrategy} from "./FetchLinkStrategy";
import {ComplexLinkStrategy} from "./ComplexLinkStrategy";
import type {FetchEngine} from "../../../fetchEngine/fetch";

const STRATEGIES = [new FetchLinkStrategy(), new ComplexLinkStrategy()] as const;

export class DownloadContext {
  private strategy: DownloadStrategy;
  private readonly page: CheerioAPI;
  private readonly params: DownloadStrategyParams;

  constructor(page: CheerioAPI, params: DownloadStrategyParams) {
    this.params = params;
    this.page = page;

    const strategy = STRATEGIES.find((strategy) => strategy.type === params.type);

    if (!strategy) {
      throw new Error('Strategy not found');
    }

    this.strategy = strategy;
  }

  setFetcher(fetcher: FetchEngine) {
    this.strategy.fetcher = fetcher;
  }

  async executeStrategy(): Promise<DownloadStrategyReturn> {
    return this.strategy.execute(this.page, this.params);
  }
}
