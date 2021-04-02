import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { apiCalls } from '../helpers/apiCalls';

@Injectable({
  providedIn: 'root'
})
export class WatsonService {

  constructor(public http: HttpClient) { }

  textToSpeech(text): any {
    let httpOptions = {
      responseType: 'blob' as 'json',
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': "audio/wav",
        'Authorization': 'Basic ' + btoa(`apikey:${environment.watsonApiKey}`)
      })
    };
    return this.http.post(`${environment.watsonUrl + apiCalls.ibmSynthesize}` + text, { 'text': text }, httpOptions);
  }
}
