import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Observable, of, Subscription } from 'rxjs';
import { User } from 'src/app/models/user';
import { CacheService } from 'src/app/services/cache.service';
import { UserService } from 'src/app/services/user.service';
import { WatsonService } from 'src/app/services/watson.service';
import { first } from 'rxjs/operators';
import { KeyValue } from '@angular/common';

@Component({
  selector: 'app-tts',
  templateUrl: './tts.component.html',
  styleUrls: ['./tts.component.scss']
})


export class TtsComponent implements OnInit {
  subscription: Subscription;
  speech: any;
  page = 1;
  pageSize = 10;
  loading = false;
  users: User[];

  ttsForm = new FormGroup({
    ttsText: new FormControl('',
      [Validators.required, Validators.pattern('[a-zA-z0-9 ]+')])
  });
  translatedItemsC: Map<string, any> = null;

  constructor(public watsonService: WatsonService, private cacheService: CacheService, private userService: UserService) {
    this.translatedItemsC = this.cacheService.getTranslatedItems();
  }


  ngOnInit(): void {
    this.loading = true;
    this.userService.getAll().pipe(first()).subscribe(users => {
      this.loading = false;
      this.users = users;
    });
    this.subscription = this.cacheService.getTranslatedItemsSubject()
      .subscribe(translatedItems => {
        this.translatedItemsC = translatedItems;
      });
  }

  convertToSpeech() {
    this.loading = true;
    let textToSearch = this.ttsForm.value.ttsText;
    this.speech = this.cacheService.getKeyObj(textToSearch.toLowerCase().trim());

    if (this.speech === null || this.speech === undefined) {
      let base64String;
      let this_ = this;
      this.watsonService.textToSpeech(this.ttsForm.value.ttsText).subscribe((data) => {
        var reader = new FileReader();
        reader.readAsDataURL(data);
        reader.onloadend = function () {
          base64String = reader.result;
          console.log('Base64 String - ', base64String);

          this_.cacheService.setKeyObj(textToSearch.toLowerCase().trim(), { timeStamp: new Date().getTime() / 1000, file: base64String });
          this_.speech = base64String;

          this_.loading = false;
        }
      });
    }
    else {

      this.speech = this.speech.file;
      this.loading = false;
    }
  }

  clearCache() {
    this.cacheService.clear();
  }
  orderAscByTimeStamp = (a: KeyValue<string, any>, b: KeyValue<string, any>): number => {
    return a.value.timeStamp > b.value.timeStamp ? -1 : (a.value.timeStamp > b.value.timeStamp) ? 0 : 1
  }

  @HostListener('window:unload', ["$event"])
  ngOnDestroy() {
    this.cacheService.persistToCache();
    this.subscription.unsubscribe();
  }
}
