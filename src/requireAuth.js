import { redirect } from "react-router"

export const requireAuth = async (request) => {
    let nextUrl = "";

    if( request &&  request.url){
        const url = new URL(request.url);
        nextUrl = url.pathname;
    }
    const isLoggedIn = localStorage.getItem("loggedin");

    if (isLoggedIn !== "true") {
        throw redirect("/login?message=You must log in first&nextUrl=" + nextUrl);
    }
    return null;
}