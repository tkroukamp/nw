/*
Ver 1.0.0 
Created 11/3/2024 by Tony Kroukamp
Updated 2025/04/08 by Tony Kroukamp - Corrected phone formatting & readonly styling
*/

const jsonResponse = `{
    "first_name": "Jane",
    "last_name": "Doe",
    "cell_phone": "13129700696",
    "email": ""
  }`
  
  /* *********************************************** */
  /*              Add styling for readonly           */
  /* *********************************************** */
  const style = document.createElement("style")
  style.innerHTML = `
    input.readonly-field {
      background-color: #f4f4f4 !important;
      color: #666 !important;
      border-color: #ccc !important;
      cursor: not-allowed !important;
      pointer-events: none !important;
      user-select: none !important;
    }
  `
  document.head.appendChild(style)
  
  /* *********************************************** */
  /*        Format phone number on load              */
  /* *********************************************** */
  function formatPhoneNumber(raw) {
    let digits = raw.replace(/\D/g, "")
    if (digits.length === 11 && digits.startsWith("1")) {
      digits = digits.substring(1)
    }
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
    }
    return raw
  }
  
  /* *********************************************** */
  /*         This section generates form fields      */
  /* *********************************************** */
  
  function generateFormElements(jsonString) {
    const data = JSON.parse(jsonString)
    const formContainer = document.getElementById("userInfoForm")
  
    const fields = [
      {
        name: "fname",
        label: "First name",
        type: "text",
        value: data.first_name || "",
        lockIfPresent: true,
      },
      {
        name: "lname",
        label: "Last name",
        type: "text",
        value: data.last_name || "",
        lockIfPresent: true,
      },
      {
        name: "phone",
        label: "Phone number",
        type: "tel",
        value: data.cell_phone ? formatPhoneNumber(data.cell_phone) : "",
        lockIfPresent: true,
      },
      {
        name: "email",
        label: "Email address",
        type: "email",
        value: data.email || "",
        lockIfPresent: true,
      },
    ]
  
    fields.forEach((field) => {
      const label = document.createElement("label")
      label.className = "bolt-label mt-4"
      label.setAttribute("for", field.name)
      label.innerHTML = field.label
  
      const inputContainer = document.createElement("div")
      inputContainer.className = "input-container mb-1"
  
      const input = document.createElement("input")
      input.className = "form-control bolt-textfield-input"
      input.type = field.type
      input.id = field.name
      input.name = field.name
      input.value = field.value
      input.setAttribute("autocomplete", "off")
      input.setAttribute("data-id", `${field.name}-input`)
      input.setAttribute("aria-describedby", `help${field.name}`)
      input.setAttribute("data-type", field.type)
  
      if (field.lockIfPresent && field.value.trim() !== "") {
        input.readOnly = true
        input.classList.add("readonly-field")
        input.setAttribute("tabindex", "-1") // Prevent keyboard focus
      }
  
      inputContainer.appendChild(input)
  
      const helpTextContainer = document.createElement("div")
      helpTextContainer.id = `help${field.name}`
      helpTextContainer.className = "form-element__help text-left text-bold"
      helpTextContainer.setAttribute("data-help-message", "")
      helpTextContainer.setAttribute("role", "alert")
      helpTextContainer.setAttribute("part", "help-text")
      helpTextContainer.style.display = "none"
  
      const helpIcon = document.createElement("i")
      helpIcon.className = "mdi"
      const helpTextSpan = document.createElement("span")
      helpTextContainer.appendChild(helpIcon)
      helpTextContainer.appendChild(helpTextSpan)
  
      formContainer.appendChild(label)
      formContainer.appendChild(inputContainer)
      formContainer.appendChild(helpTextContainer)
    })
  }
  
  generateFormElements(jsonResponse)
  
  /* *********************************************** */
  /*               Form Validation Config            */
  /* *********************************************** */
  
  const formConfig = {
    fields: {},
    submitButtonId: "btnSubmit",
  }
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  
  const fieldsConfig = [
    { name: "fname", label: "First name", required: true, type: "text" },
    { name: "lname", label: "Last name", required: true, type: "text" },
    { name: "phone", label: "Phone number", required: true, type: "tel" },
    { name: "email", label: "Email address", required: true, type: "email" },
  ]
  
  fieldsConfig.forEach((field) => {
    formConfig.fields[field.name] = {
      elementId: field.name,
      helpMessageId: `help${field.name}`,
      validationMessage:
        field.type === "email"
          ? `${field.label} must be a valid email address`
          : `${field.label} field cannot be empty`,
      emptyMessage: `${field.label} field cannot be empty`,
      touched: false,
      required: field.required,
      validate: (inputElement) => {
        if (inputElement.readOnly) return true
        if (inputElement.value.trim() === "") return false
        if (field.type === "email") return emailRegex.test(inputElement.value)
        return true
      },
    }
  })
  
  /* *********************************************** */
  /*             Error Handling Functions            */
  /* *********************************************** */
  
  const showError = (inputElement, errorMessage) => {
    const helpElement = document.getElementById(inputElement.dataset.helpId)
    const messageSpan = helpElement.querySelector("span")
    const iconElement = helpElement.querySelector("i.mdi")
    helpElement.style.display = "block"
  
    messageSpan.textContent = errorMessage
    iconElement.classList.add("mdi-alert-circle")
  
    inputElement.parentNode.classList.add("invalid")
    inputElement.classList.remove("valid")
  }
  
  const hideError = (inputElement) => {
    const helpElement = document.getElementById(inputElement.dataset.helpId)
    const messageSpan = helpElement.querySelector("span")
    const iconElement = helpElement.querySelector("i.mdi")
    helpElement.style.display = "none"
  
    messageSpan.textContent = ""
    iconElement.classList.remove("mdi-alert-circle")
  
    inputElement.parentNode.classList.remove("invalid")
    inputElement.classList.add("valid")
  }
  
  /* *********************************************** */
  /*           Validation Timing & Display           */
  /* *********************************************** */
  
  function delayedDisplayErrors(inputElement, fieldConfig) {
    setTimeout(() => {
      if (inputElement.readOnly) return
      if (inputElement.value.trim() === "" && fieldConfig.required) {
        showError(inputElement, fieldConfig.emptyMessage)
      } else if (fieldConfig.required && !fieldConfig.validate(inputElement)) {
        showError(inputElement, fieldConfig.validationMessage)
      } else {
        hideError(inputElement)
      }
    }, 2000)
  }
  
  /* *********************************************** */
  /*             Submit Button Management            */
  /* *********************************************** */
  
  function updateSubmitButtonState() {
    const allValid = Object.values(formConfig.fields).every((field) => {
      const inputElement = document.getElementById(field.elementId)
      if (!field.required) return true
      return (
        inputElement.readOnly ||
        (field.touched && inputElement.classList.contains("valid"))
      )
    })
    const submitButton = document.getElementById(formConfig.submitButtonId)
    submitButton.disabled = !allValid
  }
  
  function immediateCheckAndToggleSubmit(inputElement, fieldConfig) {
    if (fieldConfig.validate(inputElement)) {
      inputElement.classList.add("valid")
    } else {
      inputElement.classList.remove("valid")
    }
    if (fieldConfig.required) updateSubmitButtonState()
  }
  
  /* *********************************************** */
  /*               Initialize Validation             */
  /* *********************************************** */
  
  function initializeForm(config) {
    const fields = config.fields
  
    Object.values(fields).forEach((field) => {
      const inputElement = document.getElementById(field.elementId)
      inputElement.dataset.helpId = field.helpMessageId
  
      if (inputElement.readOnly || inputElement.value.trim() !== "") {
        field.touched = true
        if (field.validate(inputElement)) inputElement.classList.add("valid")
      }
  
      if (!inputElement.readOnly) {
        inputElement.addEventListener("input", () => {
          field.touched = true
          immediateCheckAndToggleSubmit(inputElement, field)
          delayedDisplayErrors(inputElement, field)
        })
      }
    })
  
    updateSubmitButtonState()
  }
  
  initializeForm(formConfig)
  
  /* *********************************************** */
  /*        Phone Number Formatting & Rules          */
  /* *********************************************** */
  
  function formatPhoneNumberInput() {
    const phoneInputs = document.querySelectorAll(
      'input[type="tel"]:not([readonly])',
    )
  
    phoneInputs.forEach((phoneInput) => {
      phoneInput.setAttribute("pattern", "[0-9]*")
      phoneInput.setAttribute("inputmode", "numeric")
  
      phoneInput.addEventListener("input", () => {
        let input = phoneInput.value.replace(/\D/g, "")
  
        if (input.length === 11 && input.startsWith("1")) {
          input = input.substring(1)
        }
  
        if (input.length > 6) {
          input = `(${input.slice(0, 3)}) ${input.slice(3, 6)}-${input.slice(6, 10)}`
        } else if (input.length > 3) {
          input = `(${input.slice(0, 3)}) ${input.slice(3)}`
        } else if (input.length > 0) {
          input = `(${input}`
        }
  
        phoneInput.value = input
      })
  
      phoneInput.addEventListener("blur", () => {
        if (phoneInput.value.length > 0 && phoneInput.value.length < 14) {
          showError(phoneInput, "Phone number is incomplete.")
        }
      })
    })
  }
  
  formatPhoneNumberInput()
  
  /* *********************************************** */
  /*      Submit on Enter if Valid                  */
  /* *********************************************** */
  
  document.addEventListener("keydown", function (event) {
    const activeElement = document.activeElement
    if (event.key === "Enter" && activeElement.tagName === "INPUT") {
      event.preventDefault()
      const submitButton = document.getElementById(formConfig.submitButtonId)
      if (!submitButton.disabled) submitButton.click()
    }
  })
  