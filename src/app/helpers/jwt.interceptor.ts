import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';
import { environment } from 'src/environments/environment';


@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthenticationService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        let currentUser = this.authenticationService.currentUserValue;
        if (currentUser && currentUser.token) {
            if (request.url.includes('https://api.eu-gb.text-to-speech.watson.cloud.ibm.com')) {

                request = request.clone({
                    setHeaders: {
                        Authorization: 'Basic ' + btoa(`apikey:${environment.watsonApiKey}`)
                    }
                });
            }
            else {
                // add authorization header with jwt token if available
                request = request.clone({
                    setHeaders: {
                        Authorization: `Bearer ${currentUser.token}`
                    }
                });
            }
        }

        return next.handle(request);
    }
}