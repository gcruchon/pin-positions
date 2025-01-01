import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { AuthContext } from "./AuthContext";
import { auth, provider } from '../firebase';

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    const signIn = (nextUrl = "/") => {
        signInWithPopup(auth, provider)
            .then(() => {
                localStorage.setItem("loggedin", "true");
                navigate(nextUrl);
            }).catch((error) => {
                console.error(error);
            });
    }
    const signOutFromApp = () => {
        signOut(auth).then(() => {
            localStorage.setItem("loggedin", "false");
            navigate('/');
        }).catch((error) => {
            console.error(error);
        });
    }

    const value = {
        currentUser,
        signIn,
        signOutFromApp,
    };

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            if (user) {
                localStorage.setItem("loggedin", "true");
            } else {
                localStorage.setItem("loggedin", "false");
            }
        });

    }, [])

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};