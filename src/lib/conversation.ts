const encoder = new TextEncoder();

const bytesToHex = (bytes: Uint8Array) =>
  Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

export const getConversationId = async (userId1: string, userId2: string) => {
  const sorted = [userId1, userId2].sort();
  const combined = sorted.join(":");
  const payload = encoder.encode(combined);
  const hashBuffer = await crypto.subtle.digest("SHA-256", payload);
  return bytesToHex(new Uint8Array(hashBuffer));
};

