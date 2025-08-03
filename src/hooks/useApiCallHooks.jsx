import { useState, useCallback } from "react";
import axios from "axios";
import { getDecryptedAuthData } from "../container/auth/utils/authUtils";
import { API_URL } from "../url/config";


const useApiCallHooks = () => {
  const [response, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusCode, setStatusCode] = useState(null);
  const [error, setError] = useState(null);

  const callAPI = useCallback(async (type, apiName, params = null) => {
    return new Promise(async (resolve, reject) => {
      setLoading(true);
      setError(null);
      setStatusCode(null);
      setData(null);

      let request;
      const fullUrl = API_URL + apiName;
      console.log("🌐 Final API URL:", fullUrl);

      // Get the decrypted auth token
      const { token } = await getDecryptedAuthData();
      console.log(token);


      const config = {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }), // Add token to headers if it exists
        },
      };

      try {
        if (type === "get") {
          request = axios.get(fullUrl, { params, ...config });
        } else if (type === "post") {
          request = axios.post(fullUrl, params, config);
        } else if (type === "put") {
          request = axios.put(fullUrl, params, config);
        } else if (type === "delete") {
          request = axios.delete(fullUrl, { data: params, ...config });
        } else {
          setLoading(false);
          setError("Unsupported request type");
          reject(new Error("Unsupported request type"));
          return;
        }

        const res = await request;
        setData(res);
        setLoading(false);
        setStatusCode(res.status);
        resolve(res.data);
      } catch (err) {
        if (axios.isCancel(err)) return;
        const errorData = err.response?.data || err.message;
        setError(errorData);
        setStatusCode(err.response?.status || null);
        setLoading(false);
        reject(err);
      }
    });
  }, []);

  return [response, loading, error, callAPI, statusCode];
};

export default useApiCallHooks;