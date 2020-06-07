import {Component, OnInit, ViewChild} from '@angular/core';
import {ExportFileService} from "../../../Model/Whiteboard/ExportFile/export-file.service";
import {MatInput} from "@angular/material/input";

@Component({
  selector: 'app-export-file',
  templateUrl: './export-file.component.html',
  styleUrls: ['./export-file.component.css']
})
export class ExportFileComponent implements OnInit {
  private isTransparency = false;
  private isSelectOnly = false;
  private isInsertPadding = false;

  @ViewChild('padding') private padding: MatInput;

  constructor(
    private exportFile: ExportFileService,
  ) { }

  ngOnInit(): void {
  }

  public onClickExportToImageButton() {
    this.exportFile.exportToImage(
      "png",
      this.isTransparency,
      this.isSelectOnly,
      this.isInsertPadding ? this.padding.value : null);
  }
}
