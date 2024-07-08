import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { AuthContext } from "./AuthContext";
import { auth, provider } from '../firebase';

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    const signIn = () => {
        signInWithPopup(auth, provider)
            .then(() => {
            }).catch((error) => {
                console.error(error);
            });
    }
    const signOutFromApp = () => {
        signOut(auth).then(() => {
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
                console.log("user", user)
            } else {
                console.log("user is logged out")
            }
        });

    }, [])

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};