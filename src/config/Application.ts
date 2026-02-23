
const getEnv = (key: string) => {
    return import.meta.env[key] || '';
}

export const Application = {
    BASE_URL: getEnv('VITE_APP_BASE_URL'),
    CHAT_URL: getEnv('VITE_APP_CHAT_URL'),

}

export const getConfig = () => {
    return Application;
}