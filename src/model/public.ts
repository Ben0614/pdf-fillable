export interface IEditableField {
  // Tx
  annotationFlags: number;
  borderStyle: {
    width: number;
    rawWidth: number;
    style: number;
    dashArray: number[];
    horizontalCornerRadius: number;
    verticalCornerRadius: number;
  };
  color: {
    "0": number;
    "1": number;
    "2": number;
  };
  backgroundColor: null;
  borderColor: null;
  rotation: number;
  contentsObj: {
    str: string;
    dir: string;
  };
  hasAppearance: false;
  id: string;
  modificationDate: null;
  rect: number[];
  subtype: string;
  hasOwnCanvas: false;
  noRotate: false;
  noHTML: false;
  isEditable: false;
  structParent: number;
  annotationType: number;
  fieldName: string;
  actions: null;
  fieldValue: string | string[];
  defaultFieldValue: null;
  alternativeText: string;
  defaultAppearanceData: {
    fontSize: number;
    fontName: string;
    fontColor: {
      "0": number;
      "1": number;
      "2": number;
    };
  };
  fieldType: string;
  fieldFlags: number;
  readOnly: boolean;
  required: boolean;
  hidden: boolean;
  textAlignment: null;
  maxLen: number;
  multiLine: boolean;
  comb: boolean;
  doNotScroll: boolean;
  // Ch
  options: [
    {
      exportValue: string;
      displayValue: string;
    }
  ];
  combo: boolean;
  multiSelect: boolean;
  // Btn
  checkBox: boolean;
  radioButton: boolean;
  pushButton: boolean;
  isTooltipOnly: boolean;
  exportValue: string;
}

export interface IOnAnnotationField {
  type: string;
  data: {
    fieldName: string;
    value: string | [{ label: string; value: string }];
    options: string[];
    checked: boolean;
  };
}

export interface IImgData {
  name: string;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  pdfPage: number;
  createTime: number;
}
