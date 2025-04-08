/*
Ver 1.0.0 
Created 11/3/2024 by Tony Kroukamp
*/

/* *********************************************** */
/* This section generates the dynamic input fields */
/* *********************************************** */

//const jsonResponse = {{local.8sultq3lq1.payload.output.rawResponse.body}};

const jsonResponse = {
    elements: [
      {
        name: "first_name",
        label: "First Name",
        type: "text",
        required: true,
        hint: "Enter your given name"
      },
      {
        name: "last_name",
        label: "Last Name",
        type: "text",
        required: true,
        hint: "Enter your family name"
      },
      {
        name: "cell_phone",
        label: "Cell Phone",
        type: "tel",
        required: true,
        hint: "Format: (123) 456-7890"
      },
      {
        name: "email",
        label: "Email",
        type: "email",
        required: true,
        hint: "Enter a valid email address"
      }
    ]
  };
  
  
  function generateFormElements(jsonResponse) {
    const formContainer = document.getElementById('userInfoForm'); // Updated to point to the form element
  
    jsonResponse.elements.forEach(element => {
      // Create label
      const label = document.createElement('label');
      label.className = 'bolt-label mt-4';
      label.setAttribute('for', element.name);
      label.innerHTML = element.label;
      
      // Add "(optional)" if 'required' is not true
      if (!element.required) {
        label.innerHTML += ' <span class="optional-text">(optional)</span>';
      }
      
      // Create input container
      const inputContainer = document.createElement('div');
      inputContainer.className = 'input-container mb-1';
  
      // Create input element
      const input = document.createElement('input');
      input.className = 'form-control bolt-textfield-input';
      input.type = element.type || 'text'; // Default to 'text' if type is not provided
      input.id = `${element.name}`;
      input.name = element.name;
      input.setAttribute('autocomplete', 'off');
      input.setAttribute('data-id', `${element.name}-input`);
      input.setAttribute('aria-describedby', `help${element.name}`);
      input.setAttribute('data-type', element.type || 'text'); // Add data-type attribute
  
      // Append input to container
      inputContainer.appendChild(input);
  
      // Create help text container
      const helpTextContainer = document.createElement('div');
      helpTextContainer.id = `help${element.name}`;
      helpTextContainer.className = 'form-element__help text-left text-bold';
      helpTextContainer.setAttribute('data-help-message', '');
      helpTextContainer.setAttribute('role', 'alert');
      helpTextContainer.setAttribute('part', 'help-text');
      helpTextContainer.style.display = 'none';
  
      const helpIcon = document.createElement('i');
      helpIcon.className = 'mdi';
      const helpTextSpan = document.createElement('span');
      helpTextContainer.appendChild(helpIcon);
      helpTextContainer.appendChild(helpTextSpan);
  
      // Create hint text or link under the input
      const hint = document.createElement('span');
      hint.className = 'text-left';
      if (element.link) {
        const hintLink = document.createElement('a');
        hintLink.href = element.link;
        hintLink.target = '_blank';
        hintLink.textContent = element.hint;
        hint.appendChild(hintLink);
      } else {
        hint.textContent = element.hint;
      }
  
      // Append elements to form container
      formContainer.appendChild(label);
      formContainer.appendChild(inputContainer);
      formContainer.appendChild(hint);
      formContainer.appendChild(helpTextContainer);
    });
  }
  
  // Call the function with the sample JSON data for testing
  generateFormElements(jsonResponse);
  
  /* *********************************************** */
  /*         This section validates fields           */
  /* *********************************************** */
  
  /* *********************************************** */
  /*        Define and Initialize formConfig         */
  /* *********************************************** */
  
  const formConfig = {
      fields: {},
      submitButtonId: 'btnSubmit'
  };
  
  // Regular expression for validating email formats with modern TLDs
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  // Populate formConfig fields based on jsonResponse with email-specific validation
  jsonResponse.elements.forEach(element => {
      if (element.required || element.type === 'email' || element.type === 'tel') { // Include optional 'tel' fields
          formConfig.fields[element.name] = {
              elementId: `${element.name}`,
              helpMessageId: `help${element.name}`,
              validationMessage: element.type === 'email'
                  ? `${element.label} must be a valid email address` // Message for invalid email format
                  : `${element.label} field cannot be empty`, // General message for blank required fields
              emptyMessage: `${element.label} field cannot be empty`, // Message for empty fields
              touched: false,
              required: element.required, // Track if field is required
              validate: inputElement => {
                  if (inputElement.value.trim() === '') return false; // Empty field validation
                  if (element.type === 'email') {
                      return emailRegex.test(inputElement.value); // Email format validation
                  }
                  return true; // General validation for non-email fields
              }
          };
      }
  });
  
  /* *********************************************** */
  /*         Show and Hide Error Functions           */
  /* *********************************************** */
  
  const showError = (inputElement, errorMessage) => {
      const helpElement = document.getElementById(inputElement.dataset.helpId);
      const messageSpan = helpElement.querySelector('span');
      const iconElement = helpElement.querySelector('i.mdi');   
      helpElement.style.display = 'block';
  
      messageSpan.textContent = errorMessage;
      iconElement.classList.add('mdi-alert-circle');
  
      inputElement.parentNode.classList.add('invalid');  //add class to parent div when error  
      inputElement.classList.remove('valid');  
  };
  
  const hideError = (inputElement) => {
      const helpElement = document.getElementById(inputElement.dataset.helpId);
      const messageSpan = helpElement.querySelector('span');
      const iconElement = helpElement.querySelector('i.mdi');       
      helpElement.style.display = 'none';
  
      messageSpan.textContent = '';
      iconElement.classList.remove('mdi-alert-circle');
  
      inputElement.parentNode.classList.remove('invalid'); //remove class to parent div when error   
      inputElement.classList.add('valid');   
  };
  
  /* *********************************************** */
  /*     Delayed Function to Display Validation      */
  /* *********************************************** */
  
  function delayedDisplayErrors(inputElement, fieldConfig) {
      setTimeout(() => {
          if (inputElement.value.trim() === '' && fieldConfig.required) {
              showError(inputElement, fieldConfig.emptyMessage); // Show empty field error
          } else if (fieldConfig.required && !fieldConfig.validate(inputElement)) {
              showError(inputElement, fieldConfig.validationMessage); // Show invalid email format error
          } else {
              hideError(inputElement);
          }
      }, 2000);
  }
  
  /* *********************************************** */
  /*       Submit Button State Update Function       */
  /* *********************************************** */
  
  // Function to update the state of the submit button immediately
  function updateSubmitButtonState() {
      const allValid = Object.values(formConfig.fields).every(field => {
          const inputElement = document.getElementById(field.elementId);
          // Ignore optional fields for submit button state
          if (!field.required) return true;
          return field.touched && inputElement.classList.contains('valid');
      });
      const submitButton = document.getElementById(formConfig.submitButtonId);
      submitButton.disabled = !allValid;
  }
  
  /* *********************************************** */
  /*           Immediate Check and Toggle            */
  /* *********************************************** */
  
  // Immediate check for enabling/disabling submit button
  function immediateCheckAndToggleSubmit(inputElement, fieldConfig) {
      if (fieldConfig.validate(inputElement)) {
          inputElement.classList.add('valid');
      } else {
          inputElement.classList.remove('valid');
      }
  
      // Only update submit button state for required fields
      if (fieldConfig.required) {
          updateSubmitButtonState();
      }
  }
  
  /* *********************************************** */
  /*           Initialize Form Validation            */
  /* *********************************************** */
  
  function initializeForm(config) {
      const fields = config.fields;
      const submitButton = document.getElementById(config.submitButtonId);
  
      Object.values(fields).forEach(field => {
          const inputElement = document.getElementById(field.elementId);
          inputElement.dataset.helpId = field.helpMessageId;
  
          // Check if the field has a value on page load and validate it
          if (inputElement.value.trim() !== '') {
              field.touched = true;  // Mark the field as touched
              if (field.validate(inputElement)) {
                  inputElement.classList.add('valid');
              }
          }
  
          // Add event listener for input changes
          inputElement.addEventListener('input', () => {
              field.touched = true;
              immediateCheckAndToggleSubmit(inputElement, field);
              delayedDisplayErrors(inputElement, field);
          });
      });
  
      // Update the submit button state based on the initial value of the fields
      updateSubmitButtonState();
  }
  
  // Call the function to initialize the form validation
  initializeForm(formConfig);
  
  /* *********************************************** */
  /*      Phone Number Formatting and Restriction    */
  /* *********************************************** */
  
  function formatPhoneNumberInput() {
      // Select all input fields of type 'tel' to ensure both required and optional fields are processed
      const phoneInputs = document.querySelectorAll('input[type="tel"]');
  
      phoneInputs.forEach(phoneInput => {
          // Disable built-in validation for consistent handling across all phone inputs
          phoneInput.setAttribute('pattern', '[0-9]*'); // Allows only digits
          phoneInput.setAttribute('inputmode', 'numeric'); // Sets mobile-friendly numeric keyboard
  
          // Add input event listener to format the number as the user types
          phoneInput.addEventListener('input', () => {
              let input = phoneInput.value.replace(/\D/g, ''); // Remove all non-digit characters
  
              // Prevent '1' as the first character
              if (input.startsWith('1')) {
                  showError(phoneInput, "Phone number cannot start with '1'.");
                  phoneInput.value = ''; // Clear the input if '1' is entered first
                  return;
              } else {
                  hideError(phoneInput); // Hide error if the input is valid
              }
  
              // Format the number as (XXX) XXX-XXXX
              if (input.length > 6) {
                  input = `(${input.slice(0, 3)}) ${input.slice(3, 6)}-${input.slice(6, 10)}`;
              } else if (input.length > 3) {
                  input = `(${input.slice(0, 3)}) ${input.slice(3)}`;
              } else if (input.length > 0) {
                  input = `(${input}`;
              }
  
              phoneInput.value = input;
          });
  
          // Clear the field and show an error if the input is incomplete on focus out
          phoneInput.addEventListener('blur', () => {
              if (phoneInput.value.length > 0 && phoneInput.value.length < 14) {
                  showError(phoneInput, "Phone number is incomplete.");
              }
          });
      });
  }
  
  // Call the function to apply phone number formatting and restriction
  formatPhoneNumberInput();
  
  
  //  Simulate form submission on 'Enter' key press
  document.addEventListener('keydown', function (event) {
      const activeElement = document.activeElement;
     
      // Check if 'Enter' is pressed and the focus is on an input field
      if (event.key === 'Enter' && activeElement.tagName === 'INPUT') {
          event.preventDefault(); // Prevent default form submission
  
          // Simulate click on the 'Continue' button if the form is valid
          const submitButton = document.getElementById(formConfig.submitButtonId);
          if (!submitButton.disabled) {
              submitButton.click();
          }
      }
  });
  