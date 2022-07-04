// ==UserScript==
// @name                    Transcript tool
// @description             Various tools for working with transcripts
// @match                   https://www.youtube.com/watch?v=*
// @match                   http://www.youtube.com/watch?v=*
// @version                 0.1.0
// @author                  Oliwang, GSRHackZ, enzoarguello512
// @grant                   none
// @license                 MIT
// ==/UserScript==

// https://stackoverflow.com/a/707580
// Your CSS as text
const styles = `
  .amazon-style {
    background-image: linear-gradient(#f7f8fa ,#e7e9ec);
    border-color: #adb1b8 #a2a6ac #8d9096;
    border-width: 1px;
    box-shadow: rgba(255,255,255,.6) 0 1px 0 inset;
    box-sizing: border-box;
    color: #0f1111;
    font-family: "Amazon Ember",Arial,sans-serif;
    font-size: 13px;
    padding: 0 11px;
    text-decoration: none;
    text-overflow: ellipsis;
  }
  .button-14 {
    border-style: solid;
    text-align: center;
    outline: 0;
    border-radius: 3px;
    width: 170px;
    display: inline-block;
    cursor: pointer;
    height: 29px;
    overflow: hidden;
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation;
    white-space: nowrap;
  }

  .button-14:active {
    border-bottom-color: #a2a6ac;
  }

  .button-14:active:hover {
    border-bottom-color: #a2a6ac;
  }

  .button-14:hover {
    border-color: #a2a6ac #979aa1 #82858a;
  }

  .button-14:focus {
    border-color: #e77600;
    box-shadow: rgba(228, 121, 17, .5) 0 0 3px 2px;
    outline: 0;
  }
  
  .panel {
    line-height:25px;
    overflow: auto;
    scroll-behaviour:smooth;
  }
`;
document.head.appendChild(document.createElement("style")).innerHTML = styles;

let displayed = false,
  body = document.body,
  copied = false,
  copiedText;

let backup,
  isBackup = false;

const extractText = () => {
  const array = [];
  const text = document.getElementsByClassName(
    "segment-text style-scope ytd-transcript-segment-renderer"
  );
  for (let i = 0; i < text.length; i++) {
    array.push(text[i].innerText);
  }
  const transcript = array.join(" ").split(".").join(".\n");
  const panel = document.getElementsByClassName(
    "style-scope ytd-transcript-renderer"
  )[1];
  if (isBackup == false) {
    backup = panel.innerHTML;
    isBackup = true;
  }
  return { transcript, panel };
};

function copy() {
  const { transcript, panel } = extractText();
  navigator.clipboard.writeText(copiedText || transcript).then(
    function () {
      console.log("Async: Copying to clipboard was successful!");
    },
    function (err) {
      console.error("Async: Could not copy text: ", err);
    }
  );
  if (!copiedText) copiedText = transcript;
  if (copied == false) {
    panel.innerHTML = transcript;
    panel.classList.remove("ytd-transcript-renderer");
    panel.classList.add("panel", "amazon-style");
    copied = true;
  }
}

setInterval(function () {
  if (
    document.getElementsByClassName(
      "style-scope ytd-transcript-renderer"
    )[3] !== undefined &&
    displayed == false
  ) {
    let transcriptTitle = document.querySelectorAll("#title-container");
    transcriptTitle.forEach((elem) => {
      if (elem.innerText === "Transcript") transcriptTitle = elem;
    });

    // Download transcript button
    const downloadBtn = document.createElement("button");
    downloadBtn.innerHTML = "Download transcript";
    downloadBtn.classList.add("button-14", "amazon-style");
    downloadBtn.setAttribute("role", "button");
    downloadBtn.addEventListener("click", function () {
      const titleText = document.querySelector(
        'h1[class="title style-scope ytd-video-primary-info-renderer"]'
      ).innerText;
      const { transcript } = extractText();
      download(transcript, `Transcript - ${titleText}.txt`, "text/plain");
    });

    // Revert changes button
    const revertBtn = document.createElement("button");
    revertBtn.innerHTML = "Revert changes";
    revertBtn.classList.add("button-14", "amazon-style");
    revertBtn.setAttribute("role", "button");
    revertBtn.onclick = function () {
      const { panel } = extractText();
      panel.innerHTML = backup;
      panel.classList.remove("panel", "amazon-style");
      panel.classList.add("ytd-transcript-renderer");
      downloadBtn.style.display = "block";
      copied = false;
    };
    revertBtn.style.display = "none";

    // Show and copy transcript button
    const showBtn = document.createElement("button");
    showBtn.innerHTML = "Show and copy transcript";
    showBtn.classList.add("button-14", "amazon-style");
    showBtn.setAttribute("role", "button");
    showBtn.onclick = function () {
      copy();
      downloadBtn.style.display = "none";
      revertBtn.style.display = "block";
      this.innerHTML = "Copied!";
      setTimeout(function () {
        showBtn.innerHTML = "Copy transcript";
      }, 1000);
    };

    // Remove timestamps button
    const removeBtn = document.createElement("button");
    removeBtn.innerHTML = "Remove timestamps";
    removeBtn.classList.add("button-14", "amazon-style");
    removeBtn.setAttribute("role", "button");
    const timestamps = document.querySelectorAll(
      'div[class="segment-start-offset style-scope ytd-transcript-segment-renderer"]'
    );
    removeBtn.onclick = function () {
      for (let i = 0; i < timestamps.length; i++) {
        timestamps[i].style.display = "none";
      }

      restoreBtn.style.display = "block";
    };

    // Restore timestamps button
    const restoreBtn = document.createElement("button");
    restoreBtn.innerHTML = "Restore timestamps";
    restoreBtn.classList.add("button-14", "amazon-style");
    restoreBtn.setAttribute("role", "button");
    restoreBtn.addEventListener("click", function () {
      for (let i = 0; i < timestamps.length; i++) {
        timestamps[i].style.display = "block";
      }
      this.style.display = "none";
    });
    restoreBtn.style.display = "none";

    transcriptTitle.appendChild(showBtn);
    transcriptTitle.appendChild(downloadBtn);
    transcriptTitle.appendChild(revertBtn);
    transcriptTitle.appendChild(removeBtn);
    transcriptTitle.appendChild(restoreBtn);

    displayed = true;
  }
}, 1000);

// https://stackoverflow.com/a/30832210
// Function to download data to a file
function download(data, filename, type) {
  var file = new Blob([data], { type: type });
  if (window.navigator.msSaveOrOpenBlob)
    // IE10+
    window.navigator.msSaveOrOpenBlob(file, filename);
  else {
    // Others
    var a = document.createElement("a"),
      url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }
}
