module.exports = a = async ({ params }) => {
  console.log("params: ", params);

  try {
    // Parse input JSON strings
    const inputData = JSON.parse(params.input);
    const getUserData = JSON.parse(params.input2);

    let email = null;
    let phone = null;

    // Helper function to normalize phone numbers
    function normalizePhoneNumber(phone) {
      if (!phone) return null;
      let cleaned = phone.replace(/[^\d+]/g, ""); // Remove all non-digit characters except '+'

      if (cleaned.length === 10) {
        cleaned = `1${cleaned}`; // Ensure all 10-digit US numbers are prefixed with '1'
      }

      return cleaned;
    }

    // Extract email and phone from inputData
    inputData.forEach((item) => {
      if (item.type === "email") {
        email = item.value.trim();
      } else if (item.type === "phone") {
        phone = normalizePhoneNumber(item.value);
      }
    });

    // Extract user details from input2
    const user =
      getUserData?.rawResponse?.matchedUsers?._embedded?.users?.[0] || {};
    const existingEmails = Array.isArray(user.homeEmailAddress)
      ? user.homeEmailAddress
      : null;
    const existingPhones = Array.isArray(user.homePhone)
      ? user.homePhone
      : null;

    // Normalize existing phone numbers
    const normalizedExistingPhones = existingPhones
      ? existingPhones.map(normalizePhoneNumber)
      : [];

    let operations = [];
    let requiresDeletion = false;
    let emailChange = false;
    let phoneChange = false;

    // Phone number update logic
    if (phone) {
      if (!normalizedExistingPhones.includes(phone)) {
        phoneChange = true;
      }
    } else if (existingPhones && existingPhones.length > 0) {
      operations.push({
        op: "remove",
        path: "homePhone",
      });
      requiresDeletion = true;
    }

    // Email update logic
    if (email) {
      if (
        !existingEmails ||
        existingEmails.length !== 1 ||
        existingEmails[0] !== email
      ) {
        emailChange = true;
      }
    } else if (existingEmails && existingEmails.length > 0) {
      operations.push({
        op: "remove",
        path: "homeEmailAddress",
      });
      requiresDeletion = true;
    }

    // **Determine response structure**
    if (operations.length === 0 && !emailChange && !phoneChange) {
      return { updateType: "none", hasDeletions: false };
    }

    if (requiresDeletion) {
      let response = {
        hasDeletions: true,
        APIBody: { Operations: operations },
      };

      // If there's an addition or update, updateType should reflect that instead of "deletions"
      if (emailChange || phoneChange) {
        response.updateType =
          emailChange && phoneChange ? "both" : emailChange ? "email" : "phone";
        if (emailChange) response.email = email;
        if (phoneChange) response.phone = phone;
      } else {
        response.updateType = "deletions"; // Only deletions, no additions
      }

      return response;
    }

    // If no deletions, but changes exist, return the updates normally
    return {
      updateType:
        emailChange && phoneChange ? "both" : emailChange ? "email" : "phone",
      hasDeletions: false,
      ...(emailChange && { email }),
      ...(phoneChange && { phone }),
    };
  } catch (error) {
    throw new Error(`Error processing input: ${error.message}`);
  }
};
