import { encode as toonEncode } from '@toon-format/toon';

export const convertToTOON = (jsonData) => {
  try {
    if (jsonData === null || jsonData === undefined) {
      return {
        success: false,
        error: 'No data to convert',
      };
    }

    const toonOutput = toonEncode(jsonData);

    return {
      success: true,
      data: toonOutput,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'TOON conversion failed',
    };
  }
};

export const formatJSON = (data, indent = 2) => {
  try {
    return JSON.stringify(data, null, indent);
  } catch (error) {
    return String(data);
  }
};

export const isValidJSON = (str) => {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

export const parseJSON = (str) => {
  try {
    return { success: true, data: JSON.parse(str) };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
