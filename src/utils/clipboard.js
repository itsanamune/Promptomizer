export const copyToClipboard = async (text) => {
  try {
    // Modern clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return { success: true };
    }

    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);

    if (successful) {
      return { success: true };
    }

    return { success: false, error: 'Copy command failed' };
  } catch (error) {
    return { success: false, error: error.message || 'Failed to copy to clipboard' };
  }
};

export const readFromClipboard = async () => {
  try {
    if (navigator.clipboard && navigator.clipboard.readText) {
      const text = await navigator.clipboard.readText();
      return { success: true, text };
    }
    return { success: false, error: 'Clipboard read not supported' };
  } catch (error) {
    return { success: false, error: error.message || 'Failed to read from clipboard' };
  }
};
