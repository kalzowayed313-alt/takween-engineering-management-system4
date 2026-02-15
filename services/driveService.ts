
import * as jose from 'jose';

// بيانات الحساب من ملف JSON
const SERVICE_ACCOUNT = {
  client_email: "takween-engneering@takween-engnnering.iam.gserviceaccount.com",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDFrfYy3V7m2/Fk\n/pvrmnAPV82figq3pMAa8Y4OSK1ynhVP8eAcIwv9aEEibey045pnnQNr+jQ+IQKH\nd1YfizSG7JQokB5PcLlFr80ul6G8FBdKpHBHK0JsT8Wmoerq3K/IscKL2p6tMoNw\neX8AA/0Y5hQ1YXlekU/Gi7MaDaiAFNcOsr3th+QnHBoRR+OEF8Pota7FWjPv5mGr\n+dRDvhr2Jl/NfZ/SML2k9Cb+zllton3c/rHWOJ6UL/ZQCfufAi4DWizi12ai4KIp\nVCkSPJE3EZFUlfbKAgZaNH3fSFb9oupKxPhRojBLwaaJ8FNTDI+24DTF9mhJcOHh\nmGwjwqGpAgMBAAECggEACrgMdzpHu27xCk/qtn4mVhP7GLaMhDlmbU+XK1vHg+/h\n1KGXTGSeHCc7Y5mK/KKxga14PQemg46Yq4MjZAx7/wD0ZmACNL6LsqVTaT5cTRgt\nzHoELefA70yYDsQNj/StgiLEG39G8WShefIsmnHyQcJgFXuWmt54Rpor+QgFO1n4\nNBk2W4B4XJXaLzHgMlixJ2E/kZpQCZV2q12ZR+N3blj0tlPTy3XeWKLomL6Gc5za\nmtokUO7j/2QzOhVJgwGYdapiE8nZwhTpH4jLyRwZcoOHGYUJhD8aty3YHbWVVGbN\nEun4NzRkiX8lQkIbqBt38w6KbuSGQBU7mh0sLotPDQKBgQDmWC/Ym5dnTHTZn7GC\nTwD1JJJZ/ZVwyVofN3gRpd10Hs91GGUr8j2UVn+p124P3uh3jAeYTL0egdwgury9\nQJtXl6wstmvHXLDNRq/wMxO6u1AgJYAN8pbGzxay4yjdDMHtEhiEXVfFi8HM4hsW\nuY740ajXNakpI6UNr7UlklzWfwKBgQDbsmYxE6/Oozdqug24C6auGofsn60D/hMG\nYzLIogB+Xnq9U69XCeyk0NNxSuHYl3H+p0LlWhchxvYRZxBsqxEUFzCsMESDl6NR\ndJjLBSfu6ILeY/nP3y2ogbwvDd2z3FzQDMZzDaDbhZlnyDMh+llZoAANhZ5+25YD\n1dCrITkD1wKBgQCjReM0UKVzLTiugYmbalCtcyzh6OOivLbK5dCQAdgFVUmMIKym\nB+EqYl2/j9qOGV0CUBmaFNsA4t+bu4HJTCBQaEw8rVmcSNFx0Ccpxaq4c8mJ38rz\nF/9UELpwNqBif4Z+epMyT8/FURkgFy1IYGM9b6+UTI8JgCCgoOlwJlz0FQKBgGh2\niXTogX3lyeHrmb5be+PpJZxzyFbPpsgwvuL7dPShhAcmFYdzZpxv1zpVetH8IO4P\nJhXcIoejDTn1IbAqHzLIXBJj2RAhODzxDf3q87P7xs5sB0q6OgGXvp05IKP3MgKT\nMIFgh44aFnlsjjOn0Hh3Rc8oK9byHoCwWEomv+99AoGALVA8pz9ZVkWl3v/Up4hf\nGZLsRj1Yp7GLFJybFYvUWd8WjXdJgZW1T0MmcSZy1ymkRX3XYAN6MztXSAtpF5UE\nZjcvS0P9N7mf2i8Ql0Xi3oFGp+xREpDFz8ejXCaT8S4HCAERRVLwS2ftkuyb4lM9\nzY3FJmCVhuTd53ANVOKZY9Y=\n-----END PRIVATE KEY-----\n",
};

const SHARED_FOLDER_ID = ""; 

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;
  const now = Math.floor(Date.now() / 1000);
  const jwt = await new jose.SignJWT({
    iss: SERVICE_ACCOUNT.client_email,
    sub: SERVICE_ACCOUNT.client_email,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
    scope: "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.metadata.readonly",
  })
    .setProtectedHeader({ alg: "RS256" })
    .sign(await jose.importPKCS8(SERVICE_ACCOUNT.private_key, "RS256"));

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error_description);
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + 3500 * 1000;
  return cachedToken;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const driveService = {
  async uploadFile(file: File) {
    try {
      const token = await getAccessToken();
      const metadata: any = {
        name: file.name,
        mimeType: file.type,
      };
      
      if (SHARED_FOLDER_ID) {
        metadata.parents = [SHARED_FOLDER_ID];
      }

      const form = new FormData();
      form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
      form.append("file", file);

      const response = await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        }
      );

      const result = await response.json();
      
      // إذا حدث خطأ Quota أو أي خطأ آخر، ننتقل مباشرة للوضع المحلي دون إخراج تحذير مزعج في الكونسول
      if (result.error) {
        const localUrl = await fileToBase64(file);
        return {
          id: `local-${Date.now()}`,
          name: file.name,
          url: localUrl,
          provider: 'local' as const
        };
      }
      
      await fetch(`https://www.googleapis.com/drive/v3/files/${result.id}/permissions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ role: "reader", type: "anyone" }),
      });

      return {
        id: result.id,
        name: result.name,
        url: result.webViewLink || `https://drive.google.com/uc?id=${result.id}&export=view`,
        provider: 'cloud' as const
      };
    } catch (error: any) {
      // التعامل الصامت مع أخطاء الرفع لضمان استمرارية العمل
      const localUrl = await fileToBase64(file);
      return {
        id: `local-${Date.now()}`,
        name: file.name,
        url: localUrl,
        provider: 'local' as const
      };
    }
  }
};
