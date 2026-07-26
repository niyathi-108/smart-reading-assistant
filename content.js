document.addEventListener("mouseup", () => {
  const selectedText = window.getSelection().toString().trim();

  if (selectedText.length > 0) {
    console.log("Selected text:", selectedText);

    chrome.runtime.sendMessage(
      { type: "TEXT_SELECTED", payload: selectedText },
      (response) => {
        console.log("Background acknowledged selection:", response);
      }
    );
  }
});
