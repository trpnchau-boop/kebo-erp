// modules/document-list/services/release/release.js

import {
  loadReleaseDocuments
}
from "./release-load.js"

import {
  saveReleaseDocuments
}
from "./release-save.js"

import {
  exportReleaseExcel
}
from "./release-export.js"

/* ========================================
ROWS
======================================== */

let releaseRows = []

/* ========================================
INIT
======================================== */

async function initRelease(){

  /* ======================================
  LOAD DATA
  ====================================== */

  releaseRows =

    await loadReleaseDocuments()

    || []

  /* ======================================
  SAVE
  ====================================== */

  document

    .querySelector(
      ".release-btn-save"
    )

    ?.addEventListener(

      "click",

      async ()=>{

        await saveReleaseDocuments(
          releaseRows
        )

      }

    )


  /* ======================================
  EXPORT XLSX
  ====================================== */

  document

    .querySelector(
      ".release-btn-submit"
    )

    ?.addEventListener(

      "click",

      async ()=>{
        
        await saveReleaseDocuments(
          releaseRows
        )  

        await exportReleaseExcel(
          releaseRows
        )

      }

    ) 
    
    
}


/* ========================================
START
======================================== */

initRelease()