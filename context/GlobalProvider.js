import React, { createContext, useContext, useEffect, useState } from "react";

import {
  getCurrentUser,
  clearUserData,
  getUserLogs,
} from "../lib/userFunctions";

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabBarShown, setTabBarShown] = useState(false);
  const [userLogs, setUserLogs] = useState([]);

  useEffect(() => {
    getCurrentUser()
      .then((res) => {
        if (res) {
          // clearUserData();
          setIsLogged(true);
          setUser(res);
          if (res) {
            getUserLogs(res._id).then((reslog) => {
              console.log(reslog);
              setUserLogs(reslog);
            });
          }
        } else {
          setIsLogged(false);
          setUser(null);
        }
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  function refreshUserData() {
    getUserLogs(user._id).then((reslog) => {
      console.log(reslog);
      setUserLogs(reslog);
    });
  }

  return (
    <GlobalContext.Provider
      value={{
        isLogged,
        setIsLogged,
        user,
        setUser,
        loading,
        tabBarShown,
        setTabBarShown,
        userLogs,
        setUserLogs,
        refreshUserData,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
