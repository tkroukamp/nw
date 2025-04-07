module.exports = a = async ({ params }) => {
  console.log("params: ", params);

  try {
    if (!params.input || typeof params.input !== "string") {
      throw new Error("Input must be a valid string.");
    }

    const rawInput = params.input.trim();

    // International number handling
    if (rawInput.startsWith("+")) {
      const cleanedIntl = rawInput.replace(/[^\d+]/g, "");
      if (!/^\+\d{6,15}$/.test(cleanedIntl)) {
        throw new Error("Invalid international number format.");
      }

      const digitsOnly = cleanedIntl.slice(1);
      const countryCodeMatch = digitsOnly.match(/^(\d{1,4})/);
      if (!countryCodeMatch) {
        throw new Error("Unable to determine international country code.");
      }

      const countryCode = countryCodeMatch[1];
      const remaining = digitsOnly.slice(countryCode.length);
      if (remaining.length < 4) {
        throw new Error("International number too short to mask.");
      }

      const lastFour = remaining.slice(-4);
      const maskedSection = "•".repeat(remaining.length - 4);
      const masked = `+${countryCode}${maskedSection}${lastFour}`;

      return {
        sanitizedPhone: cleanedIntl,
        maskedPhone: masked,
      };
    }

    // US number handling
    const digits = rawInput.replace(/\D/g, "");

    let baseDigits = "";
    if (digits.length === 11 && digits.startsWith("1")) {
      baseDigits = digits.slice(1);
    } else if (digits.length === 10) {
      baseDigits = digits;
    } else {
      throw new Error(
        "US phone number must contain 10 digits, or 11 digits starting with 1."
      );
    }

    const sanitizedPhone = "1" + baseDigits;
    const areaCode = baseDigits.substring(0, 3);
    const prefix = baseDigits.substring(3, 6);
    const lineNumber = baseDigits.substring(6);

    const formattedPhone = `1 (${areaCode}) ${prefix}-${lineNumber}`;
    const maskedPhone = `1 (•••) •••-${lineNumber}`;

    return {
      sanitizedPhone,
      formattedPhone,
      maskedPhone,
    };
  } catch (err) {
    throw new Error(`Phone number processing error: ${err.message}`);
  }
};
