import { Injectable } from '@angular/core';
import {HttpHelper} from '../../../Model/Helper/http-helper/http-helper';
import {Observable} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiRequesterService {

  private baseUrl: string = HttpHelper.apiUrl;

  constructor(
    private http: HttpClient
  ) { }

  //###### Pure Method
  public get(url, params = null): Observable<any> {
    return this.http.get(this.baseUrl + url, {
      params: params,
      headers: new HttpHeaders({
        'Content-Type': HttpHelper.getContentType()
      }),
      responseType: 'json'
    });
  }
  public getFile(url, params = null): Observable<any> {
    return this.http.get(this.baseUrl + url, {
      params: params,
      headers: new HttpHeaders({
        'Content-Type': HttpHelper.getContentType()
      }),
      responseType: 'blob'
    });
  }

  public post(url, params = null): Observable<any> {
    return this.http.post(this.baseUrl + url, params, {
      headers: new HttpHeaders({
        'Content-Type': HttpHelper.getContentType()
      }),
      responseType: 'json'
    });
  }
  public multipartPost(url, params = null): Observable<any> {
    return this.http.post(this.baseUrl + url, params, {
      headers: new HttpHeaders({ 'enctype': 'multipart/form-data' }),
      responseType: 'json'
    });
  }
  public delete(url, params = null): Observable<any> {
    return this.http.request("delete",this.baseUrl + url, {
      headers: new HttpHeaders({
        'Content-Type': HttpHelper.getContentType()
      }),
      body : params,
      responseType: 'json',
    });
  }
  public patch(url, params = null): Observable<any> {
    return this.http.request("patch",this.baseUrl + url, {
      headers: new HttpHeaders({
        'Content-Type': HttpHelper.getContentType()
      }),
      body : params,
      responseType: 'json',
    });
  }

}
