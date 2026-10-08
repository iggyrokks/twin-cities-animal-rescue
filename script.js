"use strict";

const form = document.querySelector("form");
const interestSelect = document.getElementById("interest");
const storageKey = "animalRescueInterest";

// Information changes to match the visitor's selected interest.
const interests = {
  adoption: {
    title: "Interested in adoption?",
    text: "Tell us about your home, schedule, and experience with animals. This helps the rescue discuss a suitable match."
  },
  foster: {
    title: "Interested in fostering?",
    text: "Foster families provide temporary homes. Include your availability and experience so the rescue can discuss care and support."
  },
  volunteer: {
    title: "Interested in volunteering?",
    text: "Volunteers can help with animal care, events, supplies, and outreach. Share your availability and the activities that interest you."
  }
};

// Rules for the existing form fields.
const rules = [
  { id: "name", label: "your name", min: 2, max: 80 },
  { id: "email", label: "your email address", email: true },
  { id: "interest", label: "an interest", selection: true },
  { id: "availability", label: "your availability", min: 2, max: 120 },
  { id: "experience", label: "your experience", min: 10, max: 500 },
  { id: "message", label: "your message", optional: true, max: 750 }
];

if (form && interestSelect) {
  setupForm();
}

function setupForm() {
  // JavaScript provides messages beside each field.
  form.noValidate = true;

  const interestPanel = document.createElement("div");
  interestPanel.id = "interest-panel";
  interestPanel.className = "interest-panel";
  interestPanel.setAttribute("aria-live", "polite");
  interestSelect.insertAdjacentElement("afterend", interestPanel);

  const storageNotice = document.createElement("p");
  storageNotice.id = "storage-notice";
  interestPanel.insertAdjacentElement("afterend", storageNotice);

  const result = document.createElement("p");
  result.id = "form-result";
  result.setAttribute("role", "status");
  form.appendChild(result);

  rules.forEach((rule) => {
    const field = document.getElementById(rule.id);
    const error = document.createElement("p");

    error.id = `${rule.id}-error`;
    error.className = "field-error";
    error.hidden = true;
    field.insertAdjacentElement("afterend", error);

    const descriptions = field.getAttribute("aria-describedby") || "";
    field.setAttribute(
      "aria-describedby",
      `${descriptions} ${error.id}`.trim()
    );

    field.addEventListener("input", () => {
      result.textContent = "";

      if (field.getAttribute("aria-invalid") === "true") {
        validateField(rule);
      }
    });

    field.addEventListener("change", () => {
      result.textContent = "";

      if (field.getAttribute("aria-invalid") === "true") {
        validateField(rule);
      }
    });
  });

  interestSelect.addEventListener("change", () => {
    showInterest(interestSelect.value);
    saveInterest(interestSelect.value);
  });

  form.addEventListener("submit", handleSubmit);
  loadInterest();
}

function showInterest(value) {
  const panel = document.getElementById("interest-panel");
  const information = interests[value];

  // Replace the previous content when the selection changes.
  panel.replaceChildren();

  if (!information) {
    panel.textContent = "Choose an interest to see helpful next steps.";
    return;
  }

  const heading = document.createElement("h3");
  const description = document.createElement("p");

  heading.textContent = information.title;
  description.textContent = information.text;
  panel.append(heading, description);
}

function saveInterest(value) {
  const notice = document.getElementById("storage-notice");

  try {
    if (interests[value]) {
      localStorage.setItem(storageKey, value);
      notice.textContent =
        "Your interest is saved in this browser for your next visit.";
    } else {
      localStorage.removeItem(storageKey);
      notice.textContent = "Your saved interest has been cleared.";
    }
  } catch {
    notice.textContent =
      "Browser storage is unavailable. You can still use this form.";
  }
}

function loadInterest() {
  const notice = document.getElementById("storage-notice");

  try {
    const savedInterest = localStorage.getItem(storageKey);

    if (savedInterest && interests[savedInterest]) {
      interestSelect.value = savedInterest;
      notice.textContent = "Your previously selected interest was restored.";
    } else {
      notice.textContent =
        "Only your selected interest is saved. Contact details are not saved.";
    }
  } catch {
    notice.textContent =
      "Browser storage is unavailable. You can still use this form.";
  }

  showInterest(interestSelect.value);
}

function getError(rule, field) {
  const value = field.value.trim();

  if (!value) {
    if (rule.optional) {
      return "";
    }

    return rule.selection
      ? `Please select ${rule.label}.`
      : `Please enter ${rule.label}.`;
  }

  if (rule.selection && !interests[value]) {
    return "Please choose adoption, fostering, or volunteering.";
  }

  if (rule.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return "Enter an email address such as name@example.com.";
  }

  if (rule.min && value.length < rule.min) {
    return `Please use at least ${rule.min} characters for ${rule.label}.`;
  }

  if (rule.max && value.length > rule.max) {
    return `Please use no more than ${rule.max} characters for ${rule.label}.`;
  }

  return "";
}

function validateField(rule) {
  const field = document.getElementById(rule.id);
  const error = document.getElementById(`${rule.id}-error`);
  const message = getError(rule, field);

  error.textContent = message;
  error.hidden = message === "";
  field.setAttribute("aria-invalid", message ? "true" : "false");

  return message === "";
}

function handleSubmit(event) {
  // This classroom website has no service to receive inquiries.
  event.preventDefault();

  const invalidRules = rules.filter((rule) => !validateField(rule));
  const result = document.getElementById("form-result");

  if (invalidRules.length > 0) {
    result.textContent = "Please correct the marked fields and try again.";
    document.getElementById(invalidRules[0].id).focus();
    return;
  }

  saveInterest(interestSelect.value);
  result.textContent =
    "Your sample inquiry passed validation. Nothing was sent to the rescue. Your selected interest is saved if browser storage is available.";
}