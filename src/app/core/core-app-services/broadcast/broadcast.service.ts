import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { FeatureToggleService } from '@app/core/core-app-services/feature-toggle/feature-toggle.service';

@Injectable({
  providedIn: 'root'
})
export class BroadcastService {
  private headers = new HttpHeaders({
    Authorization: 'Bearer ' + localStorage.getItem('token'),
    'Content-Type': 'application/json',
    Accept: 'application/json'
  });

  constructor(
    private http: HttpClient,
    private featureToggleService: FeatureToggleService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    if (this.route.snapshot.queryParams && this.route.snapshot.queryParams.token) {
    } else if (!this.featureToggleService.broadcast) {
      this.router.navigate(['/dashboard/upgrade']);
    }
  }

  save(broadcast: object) {
    return this.http.post(environment.serverUrl + '/broadcast/create', broadcast, { headers: this.headers });
  }

  getList() {
    return this.http.get(environment.serverUrl + '/broadcast/get/list', { headers: this.headers });
  }

  getDetail(_id: string) {
    return this.http.get(environment.serverUrl + '/broadcast/get/detail/' + _id, { headers: this.headers });
  }

  uploadFile(file: any) {
    let headers = new HttpHeaders({
      Authorization: 'Bearer ' + localStorage.getItem('token')
    });
    return this.http.post(environment.serverUrl + '/broadcast/file/upload', file, { headers: headers });
  }

  update(broadcast: object) {
    return this.http.post(environment.serverUrl + '/broadcast/update', broadcast, { headers: this.headers });
  }

  delete(_id: string) {
    return this.http.delete(environment.serverUrl + '/broadcast/delete/' + _id, { headers: this.headers });
  }

  deleteFileByFileKey(file_key: string) {
    return this.http.delete(environment.serverUrl + '/broadcast/file/delete/?file_key=' + file_key, {
      headers: this.headers
    });
  }

  getBroadcastHistoryData(broadcast_id: string) {
    return this.http.post(environment.serverUrl + '/broadcast/get/data/manager/' + broadcast_id, {
      headers: this.headers
    });
  }

  getRecipients(filterData: object) {
    return this.http.post(environment.serverUrl + '/broadcast/client/list/', filterData, { headers: this.headers });
  }

  sendMailToRecipients(data: object) {
    return this.http.post(environment.notification_backend + '/broadcast/send/mail', data, { headers: this.headers });
  }

  getFilter() {
    return this.http.get(environment.serverUrl + '/broadcast/get/filter/list', { headers: this.headers });
  }

  saveFilter(data: object) {
    return this.http.post(environment.serverUrl + '/broadcast/filter/save', data, { headers: this.headers });
  }

  getAnswer(token: string) {
    return this.http.post(environment.serverUrl + '/broadcast/get/broadcast/answer/detail', { token: token }, {});
  }

  saveReply(object: object) {
    return this.http.post(environment.serverUrl + '/broadcast/answer/detail/save', object, {});
  }
}
