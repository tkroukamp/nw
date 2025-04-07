/*
Updated 12/18/2023 by Tony Kroukamp
Added mandatory 1 prefix for US numbers to be enrolled in MFA
Fixed error when no home attributes are found.
*/
module.exports = a = async ({ params }) => {
  console.log("params: ", params);
  const getUser = JSON.parse(params.getUser);
  const getMFADevices = JSON.parse(params.getMFADevices);
  let homeEmailAddresses =
    getUser.rawResponse.matchedUsers._embedded.users[0].homeEmailAddress;
  let homePhones =
    getUser.rawResponse.matchedUsers._embedded.users[0].homePhone;

  // Check if homeEmailAddresses is defined and is an array before using map
  if (Array.isArray(homeEmailAddresses)) {
    homeEmailAddresses = homeEmailAddresses.map((email) => email.toLowerCase());
  } else {
    homeEmailAddresses = [];
  }

  // Check if homePhones is defined and is an array before using map
  if (Array.isArray(homePhones)) {
    homePhones = homePhones.map((phone) => {
      const cleanedPhone = cleanPhoneNumber(phone);
      // Check if the phone number starts with a plus sign
      if (cleanedPhone.startsWith("+")) {
        return cleanedPhone; // No further cleanup needed
      }
      // Check if the phone number starts with 1 and is 11 digits
      if (cleanedPhone.startsWith("1") && cleanedPhone.length === 11) {
        return cleanedPhone; // No further cleanup needed
      }
      // Check if the phone number is 10 digits and doesn't start with 1
      if (cleanedPhone.length === 10 && !cleanedPhone.startsWith("1")) {
        // Add a 1 to the front of the number
        return "1" + cleanedPhone;
      }
      // For any other cases, return the cleaned phone number
      return cleanedPhone;
    });
  } else {
    homePhones = [];
  }

  const emailDevices = getMFADevices.rawResponse._embedded.devices
    .filter((device) => device.type === "EMAIL")
    .map((device) => device.email.toLowerCase()); // Convert email devices to lowercase
  const smsDevices = getMFADevices.rawResponse._embedded.devices
    .filter((device) => device.type === "SMS")
    .map((device) => cleanPhoneNumber(device.phone)); // Clean up phone numbers

  const invalidEmails = emailDevices.filter(
    (email) => !homeEmailAddresses.includes(email)
  );
  const invalidSMSs = smsDevices.filter((phone) => !homePhones.includes(phone));
  const addEmails = homeEmailAddresses.filter(
    (email) => !emailDevices.includes(email) && !invalidEmails.includes(email)
  );
  const addSMSs = homePhones.filter(
    (phone) => !smsDevices.includes(phone) && !invalidSMSs.includes(phone)
  );
  const numberOfHomeEmailAddresses = homeEmailAddresses.length;
  const numberOfHomePhones = homePhones.length;
  const numberOfEmailDevices = emailDevices.length;
  const numberOfSMSDevices = smsDevices.length;
  const numberOfInvalidEmails = invalidEmails.length;
  const numberOfInvalidSMSs = invalidSMSs.length;
  const numberOfAddEmails = addEmails.length;
  const numberOfAddSMSs = addSMSs.length;
  const invalidDeviceIds = [
    ...emailDevices
      .filter((email) => !homeEmailAddresses.includes(email))
      .map((email) => {
        const device = getMFADevices.rawResponse._embedded.devices.find(
          (d) => d.email === email
        );
        return device ? device.id : null;
      }),
    ...smsDevices
      .filter((phone) => !homePhones.includes(phone))
      .map((phone) => {
        const device = getMFADevices.rawResponse._embedded.devices.find(
          (d) => d.phone === phone
        );
        return device ? device.id : null;
      }),
  ].filter((id) => id !== null);
  const numberOfInvalidDeviceIds = invalidDeviceIds.length;
  let error = null;
  if (numberOfHomeEmailAddresses === 0 && numberOfHomePhones === 0) {
    error = "No home values";
  } else {
    error =
      numberOfHomeEmailAddresses === 0
        ? "No homeEmailAddress"
        : numberOfHomePhones === 0
        ? "No homePhone"
        : null;
  }
  const addSMSDevices = numberOfAddSMSs > 0 ? "Yes" : "No";
  const addEmailDevices = numberOfAddEmails > 0 ? "Yes" : "No";
  const removeDevices =
    numberOfInvalidEmails > 0 || numberOfInvalidSMSs > 0 ? "Yes" : "No";
  return {
    homeEmailAddresses,
    homePhones,
    numberOfHomeEmailAddresses,
    numberOfHomePhones,
    emailDevices,
    smsDevices,
    numberOfEmailDevices,
    numberOfSMSDevices,
    invalidEmails,
    invalidSMSs,
    numberOfInvalidEmails,
    numberOfInvalidSMSs,
    addEmails,
    addSMSs,
    numberOfAddEmails,
    numberOfAddSMSs,
    invalidDeviceIds,
    numberOfInvalidDeviceIds,
    addSMSDevices,
    addEmailDevices,
    removeDevices,
    error,
  };

  // Function to clean up phone numbers
  function cleanPhoneNumber(inputData) {
    // Remove non-numeric characters, except for plus sign at the start
    return inputData.replace(/[^0-9+]/g, "");
  }
};
