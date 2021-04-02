import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs/internal/Observable';
import { Subject } from 'rxjs/internal/Subject';



const TWO_MIN = 2 * 60;
@Injectable({
  providedIn: 'root'
})
export class CacheService implements OnDestroy {
  translatedItemsSubject = new Subject<any>();
  translatedItems: Map<string, any> = new Map<string, any>();
  optimizer: any;
  constructor() {
    this.loadFromCache();
    this.optimizeCache();
    this.optimizer = setInterval(() => {
      this.optimizeCache();
    }, 30000);
  }

  ngOnDestroy() {
    clearInterval(this.optimizer);
  }
  private LOCAL_STORAGE_KEY = "T2S";

  private getCache() {
    return localStorage.getItem(this.LOCAL_STORAGE_KEY);
  }

  public persistToCache() {
    let cacheObj = new Object();
    this.translatedItems.forEach((v, k) => {
      cacheObj[k] = v;
    });
    localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(cacheObj));
  }

  public clear() {
    this.translatedItems = new Map<string, any>();
    localStorage.removeItem(this.LOCAL_STORAGE_KEY);
    this.translatedItemsSubject.next(this.translatedItems);
  }
  public loadFromCache() {
    let cacheStr = localStorage.getItem(this.LOCAL_STORAGE_KEY);
    let cacheMap = new Map<string, any>();
    let mapObj = new Map<string, any>();
    if (null !== cacheStr && "null" !== cacheStr)
      cacheMap = JSON.parse(cacheStr);

    let cacheKeys = Object.keys(cacheMap);
    for (let key in cacheKeys) {
      mapObj.set(cacheKeys[key], cacheMap[cacheKeys[key]]);
    }

    this.translatedItems = mapObj;
  }
  public getTranslatedItems(): Map<string, any> {
    return this.translatedItems;
  }
  public getTranslatedItemsSubject(): Observable<any> {
    return this.translatedItemsSubject.asObservable();
  }

  public setKeyObj(textToSearch, speech) {
    this.translatedItems.set(textToSearch.toLowerCase(), speech);
    this.translatedItemsSubject.next(this.translatedItems);
  }
  public getKeyObj(textToSearch): any {
    return this.translatedItems.get(textToSearch.toLowerCase());
  }

  optimizeCache() {
    if (this.translatedItems.size > 10) {
      let curTime = new Date().getTime() / 1000;
      this.translatedItems.forEach((value, key) => {
        if ((curTime - value.timeStamp) > TWO_MIN) {
          console.log('Delayed by more than 5 mins');
          if (this.translatedItems.size > 10)
            this.translatedItems.delete(key);
        }
      });
      this.translatedItemsSubject.next(this.translatedItems);
    }
  }

}
