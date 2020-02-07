import { Injectable } from '@angular/core';
import {AuthRequestService} from '../auth-request/auth-request.service';
import {HttpEvent, HttpHandler, HttpRequest, HttpInterceptor} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor {
  constructor(
    public apiRequester: AuthRequestService
  ) { }
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let token = `Bearer ${this.apiRequester.getAccessToken()}`;
    request = request.clone({
      setHeaders: {
        Authorization: token
      }
    });
    return next.handle(request);
  }
}
