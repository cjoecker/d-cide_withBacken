import {AppDispatch} from "./store";
import {AxiosRequest, ErrorActionType, SuccessExtraActionType} from "./AxiosRequest";
import axios, {AxiosResponse} from "axios";
import SessionSlice from "./SessionSlice";
import {showHTTPAlert} from "./AppActions";

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    token: string;
}

export const login = (dispatch: AppDispatch, loginRequest: LoginRequest) => {
    dispatch(
        AxiosRequest(
            axios.post<LoginResponse>("/api/sessions/", loginRequest),
            SessionSlice.actions.setSession.bind(null),
            loginSuccessful.bind(null),
            resetWrongPasswordAnimation.bind(null),
        )
    );
};

const loginSuccessful:SuccessExtraActionType = (dispatch, answer:AxiosResponse<LoginResponse>) => {
    localStorage.setItem("token", answer.data.token);
    axios.defaults.headers.common["Authorization"] = answer.data.token;
};

const resetWrongPasswordAnimation: ErrorActionType = (dispatch, error) => {
    if (error.response?.data.password !== undefined) {
        dispatch(SessionSlice.actions.setWrongPassword(false));
        dispatch(SessionSlice.actions.setWrongPassword(true));
    } else {
        showHTTPAlert(dispatch, error);
    }
};

export const logout = (dispatch: AppDispatch) => {
    dispatch(SessionSlice.actions.deleteSession);
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
};

export const createUnregisteredUser = (dispatch: AppDispatch) => {
    dispatch(
        AxiosRequest(
            axios.post<LoginResponse>("/api/sessions/unregistered"),
            SessionSlice.actions.setSession.bind(null),
            loginSuccessful.bind(null),
            null,

        )
    );
};

export interface SignUpRequest {
    username: string;
    fullName: string;
    registeredUser: boolean;
    password: string;
    confirmPassword: string;
}

export interface SignUpResponse {
    id: number;
    username: string;
    fullName: string;
}

//TODO: needs to be tested
export const signUp = (dispatch: AppDispatch, newUser: SignUpRequest) => {
    dispatch(
        AxiosRequest(
            axios.post<SignUpResponse>("/api/users/", newUser),
            SessionSlice.actions.setSignUpSuccessful.bind(null)
        )
    );
};