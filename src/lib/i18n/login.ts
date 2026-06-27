/** Login screen strings (uz default, ru alternate). */
export type Lang = 'uz' | 'ru';

export const LOGIN_TEXT: Record<Lang, Record<string, string>> = {
  uz: {
    welcome: 'Xush kelibsiz',
    subtitle: 'Hisobingizga kiring',
    phone: 'TELEFON RAQAM',
    password: 'PAROL',
    forgot: 'Parolni unutdingizmi?',
    submit: 'Kirish',
    noAccount: "Hisobingiz yo'qmi? Administrator bilan bog'laning",
    error: "Telefon yoki parol noto'g'ri",
    showPassword: "Parolni ko'rsatish",
    hidePassword: 'Parolni yashirish',
  },
  ru: {
    welcome: 'Добро пожаловать',
    subtitle: 'Войдите в свой аккаунт',
    phone: 'НОМЕР ТЕЛЕФОНА',
    password: 'ПАРОЛЬ',
    forgot: 'Забыли пароль?',
    submit: 'Войти',
    noAccount: 'Нет аккаунта? Свяжитесь с администратором',
    error: 'Неверный телефон или пароль',
    showPassword: 'Показать пароль',
    hidePassword: 'Скрыть пароль',
  },
};
