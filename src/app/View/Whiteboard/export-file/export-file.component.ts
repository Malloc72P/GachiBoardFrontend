import {Component, OnInit, ViewChild} from '@angular/core';
import {ExportFileService} from "../../../Model/Whiteboard/ExportFile/export-file.service";
import {MatInput} from "@angular/material/input";

@Component({
  selector: 'app-export-file',
  templateUrl: './export-file.component.html',
  styleUrls: ['./export-file.component.css']
})
export class ExportFileComponent implements OnInit {
  private _isBackupFile: boolean = false;

  constructor(
    private exportFile: ExportFileService,
  ) {
  }

  ngOnInit(): void {
  }

  public onClickExportButton() {
    if (this.isBackupFile) {
      this.exportFile.exportToBackupFile();
    } else {
      this.exportFile.exportToImage(
        "png",
        this.isTransparency,
        this.checkSelection ? false : this.isSelectOnly,
        this.isInsertPadding ? this.padding : null,
        this.isRename ? this.filename : null
      );
    }
  }

  get isBackupChecked(): boolean {
    return  this._isBackupFile;
  }

  get checkSelection(): boolean {
    return !this.exportFile.isSelected;
  }

  get isTransparency(): boolean {
    return this.exportFile.isTransparency;
  }

  get isSelectOnly(): boolean {
    return this.exportFile.isSelectOnly;
  }

  get isInsertPadding(): boolean {
    return this.exportFile.isInsertPadding;
  }

  set isTransparency(value: boolean) {
    this.exportFile.isTransparency = value;
  }

  set isSelectOnly(value: boolean) {
    this.exportFile.isSelectOnly = value;
  }

  set isInsertPadding(value: boolean) {
    this.exportFile.isInsertPadding = value;
  }

  get isRename(): boolean {
    return this.exportFile.isRename;
  }

  set isRename(value: boolean) {
    this.exportFile.isRename = value;
  }

  get padding(): string {
    return this.exportFile.padding;
  }

  set padding(value: string) {
    this.exportFile.padding = value;
  }

  get filename(): string {
    return this.exportFile.filename;
  }

  set filename(value: string) {
    this.exportFile.filename = value;
  }

  get isBackupFile(): boolean {
    return this._isBackupFile;
  }

  set isBackupFile(value: boolean) {
    this._isBackupFile = value;
  }
}
