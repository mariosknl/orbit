import React, { useState, createContext } from "react";
import { useHistory } from "react-router-dom";
import { publicFetch } from "./../util/fetch";

const AuthContext = createContext();
const { Provider } = AuthContext;

const AuthProvider = ({ children }) => {
  const history = useHistory();

  const userInfo = localStorage.getItem("userInfo");
  const expiresAt = localStorage.getItem("expiresAt");

  const [authState, setAuthState] = useState({
    token: null,
    expiresAt,
    userInfo: userInfo ? JSON.parse(userInfo) : {},
  });

  const setAuthInfo = ({ token, userInfo, expiresAt }) => {
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
    localStorage.setItem("expiresAt", expiresAt);
    setAuthState({
      token,
      userInfo,
      expiresAt,
    });
  };

  const isAdmin = () => {
    return authState.userInfo.role === "admin";
  };

  const logout = () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("expiresAt");
    setAuthState({});
    history.push("/login");
  };

  const isAuthenticated = () => {
    // if (!authState.token || !authState.expiresAt) {
    //   return false;
    // }
    // return new Date().getTime() / 1000 < authState.expiresAt;
    return true;
  };

  const getNewToken = async () => {
    try {
      const { data } = await publicFetch.get("token/refresh");
      setAuthState(Object.assign({}, authState, { token: data.token }));
    } catch (error) {
      return error;
    }
  };

  return (
    <Provider
      value={{
        authState,
        setAuthState: (authInfo) => setAuthInfo(authInfo),
        isAuthenticated,
        logout,
        isAdmin,
        getNewToken,
      }}
    >
      {children}
    </Provider>
  );
};

export { AuthContext, AuthProvider };
