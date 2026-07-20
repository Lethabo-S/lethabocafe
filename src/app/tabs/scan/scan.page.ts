import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, OnDestroy, NgZone } from '@angular/core';
import { IonHeader, IonToolbar, IonContent, IonIcon, IonSpinner, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmarkCircle,
  qrCodeOutline,
  cameraOutline,
  closeOutline,
  alertCircleOutline,
  checkmarkDoneOutline,
  cafeOutline,
} from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Html5Qrcode } from 'html5-qrcode';
import { Subscription } from 'rxjs';
import { TableService } from 'src/app/services/table';
import { BrandDustComponent } from 'src/app/components/brand-dust/brand-dust.component';
import { BloomDirective } from 'src/app/components/bloom/bloom.directive';

const SCANNER_CONTAINER_ID = 'scanner-container';

@Component({
  selector: 'app-scan-tab',
  templateUrl: 'scan.page.html',
  styleUrls: ['scan.page.scss'],
  imports: [IonHeader, IonToolbar, IonContent, IonIcon, IonSpinner, CommonModule, FormsModule, BrandDustComponent, BloomDirective],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ScanTabPage implements OnInit, OnDestroy {
  isLoading = true;

  // Shared table state — synced app-wide via TableService
  tableNumber: string | null = null;

  scanning = false;
  isScanningComplete = false;
  error: string | null = null;
  manualCode = '';

  private html5QrCode?: Html5Qrcode;
  private successTimer?: ReturnType<typeof setTimeout>;
  private sub = new Subscription();

  constructor(
    private toastController: ToastController,
    private zone: NgZone,
    private tableService: TableService,
  ) {
    addIcons({
      checkmarkCircle,
      qrCodeOutline,
      cameraOutline,
      closeOutline,
      alertCircleOutline,
      checkmarkDoneOutline,
      cafeOutline,
    });
  }

  ngOnInit() {
    // Reflect the shared table so returning to Scan shows the seated state.
    this.sub.add(
      this.tableService.table$.subscribe((t) => {
        this.tableNumber = t !== null ? String(t) : null;
      }),
    );
    setTimeout(() => (this.isLoading = false), 700);
  }

  ngOnDestroy() {
    this.clearTimers();
    this.stopCamera();
    this.sub.unsubscribe();
  }

  // ---- Camera scanner ----------------------------------------------------
  async startScanner() {
    if (this.scanning) return;
    this.error = null;
    this.isScanningComplete = false;
    this.scanning = true;

    // Defer a tick so the container element is in the DOM before binding.
    await new Promise((r) => setTimeout(r, 0));

    try {
      this.html5QrCode = new Html5Qrcode(SCANNER_CONTAINER_ID);
      await this.html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: (vw: number, vh: number) => {
            const size = Math.floor(Math.min(vw, vh) * 0.7);
            return { width: size, height: size };
          },
        },
        (decodedText: string) => this.onScanSuccess(decodedText),
        undefined,
      );
    } catch {
      this.zone.run(() => {
        this.scanning = false;
        this.error = 'Camera access was denied or no camera is available. Enter your code below.';
      });
    }
  }

  stopScanner() {
    this.stopCamera();
    this.scanning = false;
    this.isScanningComplete = false;
  }

  private onScanSuccess(decodedText: string) {
    const code = this.parseTable(decodedText);
    this.stopCamera();
    this.zone.run(() => {
      this.scanning = false;
      this.seat(code);
    });
  }

  private stopCamera() {
    const qr = this.html5QrCode;
    this.html5QrCode = undefined;
    if (!qr) return;
    qr.stop()
      .then(() => qr.clear())
      .catch(() => {});
  }

  // Pull a table number out of whatever the QR encodes
  // (plain "1234", "table 1234", "https://x/table/1234", "?table=1234"…)
  private parseTable(text: string): string {
    const t = text.trim();
    const path = t.match(/table\/(\d+)/i);
    if (path) return path[1];
    const param = t.match(/[?&]table=(\d+)/i);
    if (param) return param[1];
    const digits = t.match(/\d+/g);
    if (digits && digits.length) return digits[digits.length - 1];
    return t;
  }

  // ---- Manual entry + seating -------------------------------------------
  submitManual(e: Event) {
    e.preventDefault();
    const code = this.manualCode.trim();
    if (!code) {
      this.error = 'Enter your table code to continue.';
      return;
    }
    this.error = null;
    this.seat(code);
    this.manualCode = '';
  }

  clearTable() {
    this.stopCamera();
    this.scanning = false;
    this.isScanningComplete = false;
    this.manualCode = '';
    this.error = null;
    this.tableService.clear();
  }

  private seat(code: string) {
    const num = parseInt(code, 10);
    if (Number.isNaN(num)) {
      this.zone.run(() => (this.error = 'That table code is not valid. Enter your table number.'));
      return;
    }

    // Single source of truth — every tab reads this.
    this.tableService.setTable(num);
    this.isScanningComplete = true;
    this.successTimer = setTimeout(() => (this.isScanningComplete = false), 1500);
    this.presentToast(`Seated at Table ${num}`);
  }

  private clearTimers() {
    if (this.successTimer) {
      clearTimeout(this.successTimer);
      this.successTimer = undefined;
    }
  }

  private async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 1700,
      position: 'bottom',
      icon: 'checkmark-done-outline',
      cssClass: 'scan-toast',
      buttons: [{ icon: 'close-outline', role: 'cancel' }],
    });
    await toast.present();
  }
}
