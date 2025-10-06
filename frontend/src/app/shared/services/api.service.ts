import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // DEPRECATED: Backend integration disabled - using LocalStorage instead
  // All data is now managed locally through services like:
  // - ProductService (LocalStorage)
  // - CategoryService (LocalStorage)
  // - AuthService (LocalUserService)
  // - CartService (LocalCartService)
  // - AddressService (LocalUserService)

  constructor(private readonly http: HttpClient) {}

  // All backend API methods disabled - use LocalStorage services instead
  public get<T>(endpoint: string): Observable<T> {
    throw new Error('Backend API disabled - use LocalStorage services instead');
  }

  public getById<T>(endpoint: string, id: number): Observable<T> {
    throw new Error('Backend API disabled - use LocalStorage services instead');
  }

  public post<T>(endpoint: string, data: any): Observable<T> {
    throw new Error('Backend API disabled - use LocalStorage services instead');
  }

  public put<T>(endpoint: string, id: number, data: any): Observable<T> {
    throw new Error('Backend API disabled - use LocalStorage services instead');
  }

  public patch<T>(endpoint: string, id: number, data: any): Observable<T> {
    throw new Error('Backend API disabled - use LocalStorage services instead');
  }

  public patchWithoutId<T>(endpoint: string, data: any): Observable<T> {
    throw new Error('Backend API disabled - use LocalStorage services instead');
  }

  public putWithoutId<T>(endpoint: string, data: any): Observable<T> {
    throw new Error('Backend API disabled - use LocalStorage services instead');
  }

  public delete<T>(endpoint: string, id?: number): Observable<T> {
    throw new Error('Backend API disabled - use LocalStorage services instead');
  }
}
