<!-- https://tato30.github.io/vue-pdf/examples/basic/one_page.html -->
<script lang="ts" setup>
import { ref } from "vue";
import { VuePDF, usePDF } from "@tato30/vue-pdf";
import "@tato30/vue-pdf/style.css";
// StandardFonts
import { PDFDocument, degrees } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { IEditableField, IOnAnnotationField, IImgData } from "@/model/public";

// const pdfPath = ref("/example.pdf");
// const { pdf, pages } = usePDF(pdfPath.value);
const page = ref(1);
const alreadyPageList = ref<number[]>([]);
const pdfPath = ref("");
const pdfData = ref();
const scale = ref(1);

// 可編輯欄位
const editableFieldList = ref<IEditableField[]>([
  // {
  //   // Tx
  //   annotationFlags: 4,
  //   borderStyle: {
  //     width: 0,
  //     rawWidth: 1,
  //     style: 1,
  //     dashArray: [3],
  //     horizontalCornerRadius: 0,
  //     verticalCornerRadius: 0,
  //   },
  //   color: {
  //     "0": 0,
  //     "1": 0,
  //     "2": 0,
  //   },
  //   backgroundColor: null,
  //   borderColor: null,
  //   rotation: 0,
  //   contentsObj: {
  //     str: "",
  //     dir: "ltr",
  //   },
  //   hasAppearance: false,
  //   id: "51R",
  //   modificationDate: null,
  //   rect: [202.468, 587.91, 412.289, 609.91],
  //   subtype: "Widget",
  //   hasOwnCanvas: false,
  //   noRotate: false,
  //   noHTML: false,
  //   isEditable: false,
  //   structParent: -1,
  //   annotationType: 20,
  //   fieldName: "Name",
  //   actions: null,
  //   fieldValue: "",
  //   defaultFieldValue: null,
  //   alternativeText: "",
  //   defaultAppearanceData: {
  //     fontSize: 12,
  //     fontName: "Helv",
  //     fontColor: {
  //       "0": 0,
  //       "1": 0,
  //       "2": 0,
  //     },
  //   },
  //   fieldType: "Tx",
  //   fieldFlags: 0,
  //   readOnly: false,
  //   required: false,
  //   hidden: false,
  //   textAlignment: null,
  //   maxLen: 0,
  //   multiLine: false,
  //   comb: false,
  //   doNotScroll: false,
  //   // Ch
  //   options: [
  //     {
  //       exportValue: "",
  //       displayValue: "",
  //     },
  //   ],
  //   combo: true,
  //   multiSelect: false,
  //   // Btn
  //   checkBox: true,
  //   radioButton: false,
  //   pushButton: false,
  //   isTooltipOnly: false,
  //   exportValue: "",
  // },
]);
// 獲取此PDF所有可編輯欄位
function onLoaded(fields: IEditableField[]) {
  // 已經有到過的頁面就不用再重複賦值了
  if (alreadyPageList.value.includes(page.value)) {
    return;
  }

  editableFieldList.value = [...editableFieldList.value, ...fields];
  alreadyPageList.value.push(page.value);

  console.log(editableFieldList.value);
}

// 如果有對可編輯欄位做輸入 就會觸發
function onAnnotation(fieldObject: IOnAnnotationField) {
  // 將改變的欄位的value更新
  editableFieldList.value.forEach((field, index) => {
    // 找出fieldName相同
    if (field.fieldName === fieldObject.data.fieldName) {
      // text
      if (fieldObject.type === "form-text") {
        if (typeof fieldObject.data.value === "string") {
          editableFieldList.value[index].fieldValue = fieldObject.data.value;
        }
      }
      // select
      if (fieldObject.type === "form-select") {
        const selectList: string[] = [];
        if (typeof fieldObject.data.value !== "string") {
          fieldObject.data.value.forEach((option) => {
            selectList.push(option.value);
            editableFieldList.value[index].fieldValue = selectList;
          });
        }
      }
      // checkbox
      if (fieldObject.type === "form-checkbox") {
        editableFieldList.value[index].fieldValue = fieldObject.data.checked
          ? "On"
          : "Off";
      }
      // radio
      if (fieldObject.type === "form-radio") {
        if (typeof fieldObject.data.value === "string") {
          editableFieldList.value[index].fieldValue = fieldObject.data.value;
        }
      }
    }
  });
}

// 把修改的欄位資料塞進pdf
const setContentToPdf = (form: any) => {
  editableFieldList.value.forEach((field) => {
    // text
    if (field.fieldType === "Tx") {
      form.getTextField(field.fieldName).setText(field.fieldValue);
      form.getTextField(field.fieldName).enableReadOnly();
    }
    if (field.fieldType === "Ch") {
      // select
      if (!field.fieldName.includes("ListBox")) {
        form.getDropdown(field.fieldName).select(field.fieldValue);
        form.getDropdown(field.fieldName).enableReadOnly();
      }
      // listbox (目前會有問題)
      if (field.fieldName.includes("ListBox")) {
        form.getOptionList(field.fieldName).select(field.fieldValue);
        form.getOptionList(field.fieldName).enableReadOnly();
      }
    }
    if (field.fieldType === "Btn") {
      // checkbox
      if (field.checkBox) {
        field.fieldValue === "On"
          ? form.getCheckBox(field.fieldName).check()
          : form.getCheckBox(field.fieldName).uncheck();
        form.getCheckBox(field.fieldName).enableReadOnly();
      }
      // radio
      if (field.radioButton) {
        form.getRadioGroup(field.fieldName).select(field.fieldValue);
        form.getRadioGroup(field.fieldName).enableReadOnly();
      }
    }
  });
};

// 把圖片塞進pdf
const setImgToPdf = async (pdfDoc: any) => {
  const pages = pdfDoc.getPages();

  // 繪製圖片
  for (let i = 0; i < imgDataList.value.length; i++) {
    const currentPage = pages[imgDataList.value[i].pdfPage - 1];
    const { height } = currentPage.getSize();
    const imageBytes = await fetch(imgDataList.value[i].url).then((res) =>
      res.arrayBuffer()
    );

    // PDF的座標是從左下角開始
    // 嵌入圖片
    let image = null;
    try {
      image = await pdfDoc.embedJpg(imageBytes);
    } catch (err) {
      try {
        image = await pdfDoc.embedPng(imageBytes);
      } catch (err) {
        console.log(err);
      }
    }

    currentPage.drawImage(image, {
      x: imgDataList.value[i].x, // X 座標
      y: height - imgDataList.value[i].y - imgDataList.value[i].height, // Y 座標
      width: imgDataList.value[i].width, // 圖片寬度
      height: imgDataList.value[i].height, // 圖片高度
      rotate: degrees(0),
      xSkew: degrees(0),
      ySkew: degrees(0),
    });
  }
};

// 下載修改後的 PDF
async function downloadModifiedPdf() {
  try {
    // 1. 載入原始 PDF
    const existingPdfBytes = await fetch(pdfPath.value).then((res) =>
      res.arrayBuffer()
    );

    // 2. 使用 pdf-lib 載入 PDF 文件
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const form = pdfDoc.getForm();
    // ----------------------------------------------------------------
    // const fields = form.getFields();
    // fields.forEach((field) => {
    //   const fieldName = field.getName();
    //   const fieldType = field.constructor.name;
    //   const acroField = field.acroField;

    //   // console.log(`Field Name: ${fieldName}`);
    //   // console.log(`Field Type: ${fieldType}`);
    //   if (acroField) {
    //     console.log(`Low-Level Type: ${acroField.constructor.name}`);
    //   }
    // });
    // console.log("fields", fields);
    // ----------------------------------------------------------------

    // 3. 處理字體
    pdfDoc.registerFontkit(fontkit);
    // 加載支持中文的字體文件
    const fontBytes = await fetch(
      "/fonts/Noto_Sans_TC/NotoSansTC-Regular.ttf"
    ).then((res) => res.arrayBuffer());
    // 替換為支持中文的字體路徑
    const font = await pdfDoc.embedFont(fontBytes);
    // const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    // https://github.com/Hopding/pdf-lib/issues/1152
    const rawUpdateFieldAppearances = form.updateFieldAppearances.bind(form);
    form.updateFieldAppearances = function () {
      return rawUpdateFieldAppearances(font);
    };

    // 4. 把修改的欄位資料塞進pdf
    await setContentToPdf(form);
    // 5. 把圖片塞進pdf
    await setImgToPdf(pdfDoc);

    // 在 PDF 上繪製修改的文字
    // editableFieldList.value.forEach((field) => {

    //   firstPage.drawText(field.fieldValue, {
    //     x: field.rect[0],
    //     y: field.rect[1],
    //     size: 12,
    //     font: font,
    //     color: rgb(0, 0, 0),
    //   });
    // });

    // 6. 儲存修改後的 PDF
    const pdfBytes = await pdfDoc.save();

    // 7. 下載 PDF
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "修改後的PDF.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("PDF 下載失敗:", error);
  }
}

const uploadPdfRef = ref<null | HTMLInputElement>(null);
// 點擊上傳pdf按鈕
const uploadPdf = () => {
  if (uploadPdfRef.value) {
    uploadPdfRef.value.click();
  }
};

// 選擇pdf
const changePdf = (e: Event) => {
  const files = (e.target as HTMLInputElement).files;

  if (files) {
    setPdfData(files[0]);
  }
};

// 處理pdf
const setPdfData = async (file: File) => {
  page.value = 1;
  imgDataList.value = [];
  editableFieldList.value = [];
  alreadyPageList.value = [];
  editorImgCanCel();
  pdfPath.value = URL.createObjectURL(file);
  pdfData.value = await usePDF(pdfPath.value);
};

// 復原
const resetUploadPdfRef = () => {
  if (uploadPdfRef.value) {
    uploadPdfRef.value.value = "";
  }
};

// 圖片
const uploadImgRef = ref<null | HTMLInputElement>(null);

const imgDataList = ref<IImgData[]>([]);
// 點擊上傳圖片按鈕
const uploadImg = () => {
  if (uploadImgRef.value) {
    uploadImgRef.value.click();
  }
};

// 選擇圖片
const changeImg = (e: Event) => {
  const files = (e.target as HTMLInputElement).files;

  if (files) {
    setImgData(files[0]);
  }
};

// 處理圖片
const setImgData = async (file: File) => {
  // setImgCoordinate();
  editorImgCanCel();
  const imgData: IImgData = {
    name: file.name,
    url: URL.createObjectURL(file),
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    pdfPage: page.value,
    createTime: new Date().getTime(), // 時間戳,
  };

  imgDataList.value.push(imgData);
};

// 復原
const resetUploadImgRef = () => {
  if (uploadImgRef.value) {
    uploadImgRef.value.value = "";
  }
};

// 編輯圖片
const editorImgData = ref({
  name: "",
  url: "",
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  pdfPage: 0,
  createTime: 0,
});

const editorImgDataIndex = ref(0);

const editorImg = (img: IImgData, index: number) => {
  editorImgData.value = img;
  editorImgDataIndex.value = index;
};

const editorImgCanCel = () => {
  editorImgData.value = {
    name: "",
    url: "",
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    pdfPage: 0,
    createTime: 0,
  };
};
// -----------------------------------------------------------
// 拖曳狀態
const isDragging = ref(false);

// 開啟拖曳
const startDragging = () => {
  isDragging.value = true;
};

// 停止拖曳
const stopDragging = () => {
  isDragging.value = false;
};

// 滑鼠移動
const onMouseMove = (event: MouseEvent) => {
  const canvas = document.getElementById("pdf-wrap");
  if (isDragging.value) {
    const rect = canvas!.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    editorImgData.value.x = Math.ceil(x);
    editorImgData.value.y = Math.ceil(y);
  }
};

const handleSize = (size: string, type: string) => {
  if (type === "width") {
    imgDataList.value[editorImgDataIndex.value].width = parseInt(size);
  }
  if (type === "height") {
    imgDataList.value[editorImgDataIndex.value].height = parseInt(size);
  }
};

const deleteImg = (currentImg: IImgData) => {
  editorImgCanCel();
  imgDataList.value = imgDataList.value.filter((img) => {
    return img.createTime !== currentImg.createTime;
  });
};

const chnagePage = (type: string) => {
  editorImgCanCel();
  if (type === "prev") {
    page.value = page.value > 1 ? page.value - 1 : page.value;
  } else {
    page.value = page.value < pdfData.value.pages ? page.value + 1 : page.value;
  }
};
</script>

<template>
  <div>
    <input
      ref="uploadPdfRef"
      type="file"
      hidden
      accept=".pdf,application/pdf"
      @click="resetUploadPdfRef"
      @change="changePdf"
    />
    <v-btn class="mb-5" @click="uploadPdf">選擇PDF</v-btn>

    <template v-if="pdfData">
      <div class="left-area">
        <!-- 左側圖片新增 -->
        <div class="left-add-area">
          <input
            ref="uploadImgRef"
            type="file"
            hidden
            accept=".jpg,.jpeg,.png"
            @click="resetUploadImgRef"
            @change="changeImg"
          />
          <v-btn class="mb-5" @click="uploadImg">新增圖片</v-btn>
        </div>
        <!-- 左側圖片編輯 -->
        <div class="left-editor-area">
          <p>編輯圖片</p>
          <p>{{ editorImgData.name }}</p>
          <div v-if="editorImgData.name">
            <p class="text-left">寬</p>
            <v-text-field
              v-model="editorImgData.width"
              type="number"
              @update:modelValue="handleSize($event, 'width')"
            />

            <p class="text-left">高</p>
            <v-text-field
              v-model="editorImgData.height"
              type="number"
              @update:modelValue="handleSize($event, 'height')"
            />

            <v-btn class="mb-5" @click="editorImgCanCel">取消選取</v-btn>
            <v-btn class="mb-5 ml-2" @click="startDragging">移動</v-btn>
          </div>
          <!-- 圖片列表 -->
          <template v-for="(img, index) in imgDataList">
            <div
              v-if="img.pdfPage === page"
              :key="index"
              class="d-flex align-center mb-1"
            >
              <img
                :src="img.url"
                alt=""
                :style="{
                  border:
                    img.createTime === editorImgData.createTime
                      ? '2px solid skyblue'
                      : '',
                }"
                class="left-img"
                @click="editorImg(img, index)"
              />
              <span
                class="ml-2"
                :style="{
                  color:
                    img.createTime === editorImgData.createTime
                      ? 'skyblue'
                      : '',
                }"
                >{{ img.name }}</span
              >
              <v-btn @click="deleteImg(img)" class="ml-2">刪除</v-btn>
            </div>
          </template>
        </div>
      </div>
      <!-- 上下頁按鈕 -->
      <div class="mb-5">
        <v-btn @click="chnagePage('prev')">上一頁</v-btn>
        <span class="mx-2">{{ page }} / {{ pdfData.pages }}</span>
        <v-btn @click="chnagePage('next')">下一頁</v-btn>
      </div>
      <!-- pdf縮放按鈕 -->
      <!-- 先不使用 會造成圖片位置和大小跑掉 -->
      <!-- <div class="mb-5">
        <v-btn @click="scale = scale > 0.25 ? scale - 0.25 : scale"> - </v-btn>
        <span class="mx-2">{{ scale * 100 }}%</span>
        <v-btn @click="scale = scale < 2 ? scale + 0.25 : scale"> + </v-btn>
      </div> -->
      <div class="mb-5">
        <v-btn @click="downloadModifiedPdf"> 下載填寫後的 PDF </v-btn>
      </div>

      <div
        v-if="pdfData.pdf"
        id="pdf-wrap"
        @mousedown="stopDragging"
        @mousemove="onMouseMove"
      >
        <!-- <div v-for="page in pdfData.pages" :key="page"> -->
        <VuePDF
          v-if="pdfData.pdf"
          :pdf="pdfData.pdf"
          annotation-layer
          @annotation="onAnnotation"
          @annotation-loaded="onLoaded"
          :scale="scale"
          :page="page"
        />
        <template v-for="(img, index) in imgDataList">
          <img
            v-if="img.pdfPage === page"
            :key="index"
            :style="{
              top: `${img.y}px`,
              left: `${img.x}px`,
              width: `${img.width}px`,
              height: `${img.height}px`,
              border:
                img.createTime === editorImgData.createTime
                  ? '2px solid skyblue'
                  : '',
            }"
            :src="img.url"
            class="pdf-img"
            alt=""
            @click="editorImg(img, index)"
          />
        </template>
        <!-- </div> -->
      </div>
    </template>
  </div>
</template>
<style scoped>
/* vuetify會影響到VuePDF的css */
:deep(input),
:deep(select) {
  /* background有設定(隨意設定) VuePDF的預設背景色才會正常顯示 */
  background: #fff;
}

/* 顯示箭頭icon (vuetify會讓原生select箭頭icon消失) */
:deep(select) {
  -webkit-appearance: auto !important;
  -moz-appearance: auto !important;
  appearance: auto !important;
}

/* 箭頭icon會擋到select的文字 調整section的寬 */
:deep(.choiceWidgetAnnotation) {
  width: auto !important;
}

#pdf-wrap {
  position: relative;
  border: 1px solid #000;
}

.left-area {
  position: fixed;
  top: 0;
  left: 0;
}

.left-add-area,
.left-editor-area {
  border: 1px solid #000;
  padding: 10px;
}

.left-img {
  width: 50px;
  height: 50px;
}

.pdf-img {
  position: absolute;
  z-index: 10;
}
</style>
