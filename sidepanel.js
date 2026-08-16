document.addEventListener("DOMContentLoaded", () => {
  let lastSelectedText = "";

  function underlineImportantWords(text) {
    return text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
  }
  function convertHeadings(text) {
    return text.replace(/^#{1,6}\s*(.*)$/gm, "<h3>$1</h3>");
  }
  function convertBulletsToList(text) {
    return text.replace(/^\*\s*(.*)$/gm, "<ul><li>$1</li></ul>");
  }

  const output = document.getElementById("output");

  chrome.storage.local.get(
    ["largeFont", "highContrast", "dyslexiaFont", "extraSpacing"],
    (prefs) => {
      if (prefs.largeFont) {
        document.getElementById("largeFont").checked = true;
        output.classList.add("large-font");
      }
      if (prefs.highContrast) {
        document.getElementById("highContrast").checked = true;
        output.classList.add("high-contrast");
      }
      if (prefs.dyslexiaFont) {
        document.getElementById("dyslexiaFont").checked = true;
        output.classList.add("dyslexia-font");
      }
      if (prefs.extraSpacing) {
        document.getElementById("extraSpacing").checked = true;
        output.classList.add("extra-spacing");
      }
    }
  );

  document.getElementById("largeFont").addEventListener("change", (e) => {
    output.classList.toggle("large-font", e.target.checked);
    chrome.storage.local.set({ largeFont: e.target.checked });
  });
  document.getElementById("highContrast").addEventListener("change", (e) => {
    output.classList.toggle("high-contrast", e.target.checked);
    chrome.storage.local.set({ highContrast: e.target.checked });
  });
  document.getElementById("dyslexiaFont").addEventListener("change", (e) => {
    output.classList.toggle("dyslexia-font", e.target.checked);
    chrome.storage.local.set({ dyslexiaFont: e.target.checked });
  });
  document.getElementById("extraSpacing").addEventListener("change", (e) => {
    output.classList.toggle("extra-spacing", e.target.checked);
    chrome.storage.local.set({ extraSpacing: e.target.checked });
  });

  const readAloudBtn = document.getElementById("readAloudBtn");
  const stopBtn = document.getElementById("stopReadBtn");
  let isReading = false;
  let isPaused = false;
  let currentUtterance = null;

  if (readAloudBtn) {
    readAloudBtn.addEventListener("click", () => {
      if (!isReading) {
        const text = output.innerText;
        if (text.trim().length > 0) {
          currentUtterance = new SpeechSynthesisUtterance(text);
          currentUtterance.rate = 1;
          currentUtterance.pitch = 1;

          currentUtterance.onend = () => {
            isReading = false;
            isPaused = false;
            readAloudBtn.textContent = "Read Aloud";
            stopBtn.style.display = "none";
          };

          speechSynthesis.speak(currentUtterance);
          isReading = true;
          isPaused = false;
          readAloudBtn.textContent = "Pause Reading";
          stopBtn.style.display = "inline-block";
        }
      } else if (isReading && !isPaused) {
        speechSynthesis.pause();
        isPaused = true;
        readAloudBtn.textContent = "Resume Reading";
      } else if (isReading && isPaused) {
        speechSynthesis.resume();
        isPaused = false;
        readAloudBtn.textContent = "Pause Reading";
      }
    });
  }

  if (stopBtn) {
    stopBtn.addEventListener("click", () => {
      if (speechSynthesis.speaking || isReading) {
        speechSynthesis.cancel();
        isReading = false;
        isPaused = false;
        readAloudBtn.textContent = "Read Aloud";
        stopBtn.style.display = "none";
      }
    });
  }

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "TEXT_SELECTED") {
      lastSelectedText = msg.payload;
      output.textContent = `Selected text:\n\n${lastSelectedText}`;
    }
  });

  const runBtn = document.getElementById("runBtn");
  if (runBtn) {
    runBtn.onclick = () => {
      const action = document.getElementById("actionDropdown").value;

      if (!lastSelectedText) {
        output.textContent = "No text selected. Please select text on the page first.";
        return;
      }

      output.textContent = `Running "${action}" on selected text...`;

      chrome.runtime.sendMessage(
        { type: "REQUEST_ACTION", action, payload: lastSelectedText },
        (response) => {
          if (response && response.result) {
            let formatted = underlineImportantWords(response.result);
            formatted = convertHeadings(formatted);
            formatted = convertBulletsToList(formatted);

            switch (action) {
              case "define":
                formatted = `<h3>Definition:</h3><br><br>${formatted}`;
                break;
              case "summarize":
                formatted = `<h3>Summary:</h3><br><br>${formatted}`;
                break;
              case "expand":
                formatted = `<h3>Expanded Text:</h3><br><br>${formatted}`;
                break;
              case "synonyms":
                formatted = `<h3>Synonyms:</h3><br><br>${formatted}`;
                break;
              case "simplify":
                formatted = `<h3>Simplified Version:</h3><br><br>${formatted}`;
                break;
              case "analogy":
                formatted = `<h3>Analogy Helper:</h3><br><br>${formatted}`;
                break;
              case "steps": {
                const lines = formatted.split(/\n+/).filter(line => line.trim() !== "");
                formatted = "<h3>Step-by-Step Breakdown:</h3><br><br><ol>";

                lines.forEach(line => {
                  const trimmed = line.trim();
                  if (/^\d+\./.test(trimmed)) {
                    // Proper numbered steps
                    formatted += `<li>${trimmed.replace(/^\d+\.\s*/, "")}</li>`;
                  } else if (/^\*/.test(trimmed)) {
                    // Bullets
                    formatted += `<ul><li>${trimmed.replace(/^\*\s*/, "")}</li></ul>`;
                  } else {
                    // Explanatory text
                    formatted += `<p>${trimmed}</p>`;
                  }
                });

                formatted += "</ol>";
                break;
              }
            }

            output.innerHTML = formatted;

            if (typeof renderMathInElement === "function") {
              renderMathInElement(output, {
                delimiters: [
                  { left: "$$", right: "$$", display: true },
                  { left: "\\[", right: "\\]", display: true },
                  { left: "\\(", right: "\\)", display: false }
                ]
              });
            }
          } else {
            output.textContent = "Error: No response from background.";
          }
        }
      );
    };
  }
});
