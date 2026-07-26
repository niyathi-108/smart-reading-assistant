document.addEventListener("DOMContentLoaded", () => {
  let lastSelectedText = "";

  function underlineImportantWords(text) {
    return text.replace(/\*\*(.*?)\*\*/g, "<u>$1</u>");
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

            switch (action) {
              case "define":
                formatted = `<strong>Definition:</strong><br><br>${formatted}`;
                break;
              case "summarize":
                formatted = `<strong>Summary:</strong><br><br>${formatted}`;
                break;
              case "expand":
                formatted = `<strong>Expanded Text:</strong><br><br>${formatted}`;
                break;
              case "synonyms":
                formatted = `<strong>Synonyms:</strong><br><br>${formatted}`;
                break;
              case "simplify":
                formatted = `<strong>Simplified Version:</strong><br><br>${formatted}`;
                break;
              case "analogy":
                formatted = `<strong>Analogy Helper:</strong><br><br>${formatted}`;
                break;
              case "steps":
                const steps = formatted.split(/\n+/).filter(line => line.trim() !== "");
                formatted = "<strong>Step-by-Step Breakdown:</strong><br><br><ol>";
                steps.forEach(step => {
                  formatted += `<li>${step}</li>`;
                });
                formatted += "</ol>";
                break;
            }

            output.innerHTML = formatted;
          } else {
            output.textContent = "Error: No response from background.";
          }
        }
      );
    };
  }
});
