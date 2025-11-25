import { defineRule, configure } from 'vee-validate'
// defineRule - создает кастомные правила валидации
// configure - настраивает глобальные параметры библиотеки

import { required, email, min, confirmed } from '@vee-validate/rules'
// required - поле обязательно для заполнения
// email - проверяет формат email
// min - минимальная длина (для паролей)
// confirmed - проверяет совпадение (пароль-подтверждение)

import { localize } from '@vee-validate/i18n'
// localize - функция для перевода ошибок

import ru from '@vee-validate/i18n/dist/locale/ru.json'
// ru - русские переводы стандартных сообщений об ошибках


defineRule('required', required)
defineRule('email', email) 
defineRule('min', min)
defineRule('confirmed', confirmed)


configure({
  generateMessage: localize('ru', ru)
})
// generateMessage - функция для создания сообщений об ошибках
// localize('ru', ru) - использует русские переводы из ru.json