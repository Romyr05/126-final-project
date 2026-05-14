import { request } from "./api";


export type AuthUser = {
    id: string
    email: string | null
    username: string | null;
};


export function signup(payload:{
    email: string
    password: string
    username: string
}){
    return request<AuthUser>("/auth/signup",{
        method: "POST",
        body: JSON.stringify(payload),
    });
}


export function login(payload:{
    password: string
    email: string
}){
    return request<AuthUser>("/auth/login",{
        method: "POST",
        body: JSON.stringify(payload),
    })
}
