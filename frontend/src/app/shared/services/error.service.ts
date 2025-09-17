import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  constructor(private readonly toastr: ToastrService) {}

  handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);

      // Get the error message
      let errorMessage = this.getErrorMessage(error);

      // Show error notification
      this.showErrorNotification(errorMessage);

      // Let the app keep running by returning an empty result
      return of(result as T);
    };
  }

  private getErrorMessage(error: any): string {
    if (error instanceof HttpErrorResponse) {
      // Server or connection error
      if (error.status === 0) {
        return 'Cannot connect to server. Please check your internet connection.';
      }

      // Backend returned an unsuccessful response code
      if (error.status === 401) {
        return 'You are not authorized to perform this action. Please log in again.';
      }

      if (error.status === 403) {
        return 'You do not have permission to perform this action.';
      }

      if (error.status === 404) {
        return 'The requested resource was not found.';
      }

      // Return server error message if available
      const serverError = error.error?.message || error.message;
      if (serverError) {
        return serverError;
      }
    }

    // Unknown error
    return 'An unexpected error occurred. Please try again later.';
  }

  private showErrorNotification(message: string): void {
    this.toastr.error(message, 'Error');
  }
}
