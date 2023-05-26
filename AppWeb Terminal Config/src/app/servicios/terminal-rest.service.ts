import { Injectable } from '@angular/core';
import { HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environments";

@Injectable({
  providedIn: 'root'
})
export class TerminalRestService {

  constructor(private http: HttpClient)
  {}

  getTerminal(): any {
    return this.http.get(environment.terminalApiRest);
  }
}
