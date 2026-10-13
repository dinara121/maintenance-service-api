# Maintenance Service API — Лабораторная работа №4

REST API для управления техническим обслуживанием промышленного оборудования.

---

## 1. Возможности проекта

Цель работы —  настроить Nginx как reverse proxy к Node.js и базовый деплой; реализовать аутентификацию и разграничение прав, а также мониторинг (Grafana и источник данных, дашборд).

В рамках лабораторной работы выполнены:
* Регистрация пользователей и авторизация;
* Разграничение доступа по ролям viewer, technician и admin;
* Создание и изменение заявок на техническое обслуживание;
* Управление оборудованием и площадками.
* Назначение специалистов на заявки;
* Получение отчётов по заявкам и оборудованию.
* Хранение данных в PostgreSQL;
* Логирование запросов и обработка ошибок;
* Сбор метрик приложения с помощью Prometheus;
* Мониторинг и визуализация показателей в Grafana;
* Автоматизированные тесты с использованием Node.js Test Runner.

---

## 2. Используемые технологии

- **Node.js**: 20+
- **Express**
- **PostgreSQL**: 16
- **Sequelize**: 6
- **Sequelize CLI**
- **Docker** & **Docker Compose**
- **Postman**
- **Git**
- **Nginx**
- **Prometheus**
- **Grafana**
- **Node.js Test Runner**

---

## 3. Структура проекта

```text
maintenance-service-api/
├── docs/
│   └── postman/
│       ├── Maintenance Service API postman_collection.json
│       └── maintenance-service.postman_collection.json
├── grafana/
│   ├── alerting/
│   │   └── alert-rules.yaml
│   ├── dashboards/
│   │   ├── Maintenance Service Monitoring-1791729432833.json
│   │   └── Мониторинг технического обслуживания-1791909940998.json
│   └── provisioning/
│       ├── dashboards/
│       │   └── dashboard.yml
│       └── datasources/
│           ├── postgres.yml
│           └── prometheus.yml
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── sequelize.config.cjs
│   │
│   ├── controllers/
│   │   ├── equipment.controller.js
│   │   └── request.controller.js
│   │
│   ├── db/
│   │   ├── migrations/
│   │   │   └── 001-create-maintenance-tables.cjs
│   │   └── seeders/
│   │       └── 001-maintenance-data.cjs
│   │
│   ├── models/
│   │   ├── equipment.js
│   │   ├── equipmentPassport.js
│   │   ├── maintenanceRequest.js
│   │   ├── requestAssignee.js
│   │   ├── requestStatusHistory.js
│   │   ├── site.js
│   │   ├── technician.js
│   │   └── index.js
│   │
│   ├── repositories/
│   │   ├── equipment.repository.js
│   │   ├── report.repository.js
│   │   └── request.repository.js
│   │
│   ├── routes/
│   │   ├── equipment.routes.js
│   │   ├── request.routes.js
│   │   ├── report.routes.js
│   │   └── site.routes.js
│   │
│   ├── services/
│   │   ├── equipment.service.js
│   │   └── request.service.js
│   │
│   └── middlewares/
│   │   ├── cors.middleware.js
│   │   ├── errorHandler.js
│   │   ├── logger.middleware.js
│   │   ├── notFound.js
│   │   ├── rateLimit.middleware.js
│   │   ├── requestId.middleware.js
│   │   ├── security.middleware.js
│   │   └── validate.js
    ├── errors/
│   ├── monitoring/
│   ├── utils/
│   └── validators/
│
├── tests/
│   ├── access-middleware.test.js
│   ├── jwt.test.js
│   └── request-service.test.js
|
├── app.js
├── .dockerignore
├── server.js
├── docker-compose.yml
├── Dockerfile
├── .env
├── .env.example
├── .sequelizerc
├── package.json
└── README.md
---
```
## 4. Установка и настройка

Клонирование репозитория:

git clone <git@github.com:dinara323/weather-digest.git>
cd maintenance-service-api

Создание файла переменных окружения:
cp .env.example .env

Заполните .env необходимыми параметрами. 
Для локального запуска без Docker установите зависимости:

npm install

## 5. Переменные окружения
**Пример**
**PORT=3000**
**NODE_ENV=development**

**CORS_ORIGINS=http://localhost:3000**

**RATE_LIMIT_WINDOW=15**
**RATE_LIMIT_MAX=100**

**WEATHER_API_URL=https://api.open-meteo.com**
**REQUEST_TIMEOUT_MS=5000**

**DB_HOST=localhost**
**DB_PORT=5433**
**DB_NAME=maintenance_service**
**DB_USER=maintenance_user**
**DB_PASSWORD=maintenance_password**
**DB_POOL_MAX=10**
**DB_POOL_MIN=0**
**Конфигурация подключения Sequelize находится в:**

**src/config/database.js**

**Конфигурация Sequelize CLI:**

**src/config/sequelize.config.cjs**

**Настройка путей Sequelize CLI:**

**.sequelizerc**

## 6.Запуск проекта

Запуск через Docker Compose

Соберите образы и запустите сервисы:

docker compose up -d --build

Проверка состояния контейнеров:

docker compose ps

Просмотр логов приложения:

docker compose logs -f api

Просмотр логов остальных сервисов:

docker compose logs -f

Остановка сервисов:
docker compose down

Команда docker compose down останавливает и удаляет контейнеры, но не удаляет именованные тома без дополнительного параметра -v.

Запуск приложения локально
После установки зависимостей и настройки окружения запустите команду, предусмотренную в package.json:

npm start

## 7.Адреса сервисов
**При использовании текущей конфигурации Docker Compose сервисы доступны по следующим адресам:**
**API через Nginx - http://localhost:8081**
**PostgreSQL - Доступен внутри Docker-сети**
**Prometheus - http://localhost:9090**
**Grafana - http://localhost:3001**


## 8. Основные методы API

**1 Проверка состояния и метрики**


GET  /api/health   Проверка состояния API
GET  /api/metrics  Получение метрик для Prometheus

**2 Аутентификация**

POST  /api/auth/register  Регистрация пользователя
POST  /api/auth/login     Вход в систему
POST  /api/auth/refresh   Обновление access-токена
GET   /api/auth/me        Получение данных текущего пользователя

Для защищённых маршрутов используется access-токен, передаваемый в заголовке:
Authorization: Bearer <ACCESS_TOKEN>

**3 Оборудование**
Префикс маршрутов: /api/equipment.
GET Получение списка оборудования
POSTСоздание записи
PATCH или PUT Изменение записи
DELETE Удаление записи, если операция предусмотрена маршрутом

**4 Пользователи и специалисты**

Префикс маршрутов пользователей: /api/users.

Ресурс предназначен для работы с пользователями системы. Операции управления пользователями и специалистами ограничиваются правами доступа.

## 8 Аутентификация и роли
viewer - Просмотр доступных справочников, заявок, истории и отчётов

technician - Права просмотра, а также изменение назначенных заявок и доступные операции по их выполнению

admin - Администрирование системы, управление оборудованием, площадками, пользователями и назначениями

Типичные ответы при проверке доступа:
401 Unauthorized — пользователь не прошёл аутентификацию или токен недействителен.
403 Forbidden — пользователь аутентифицирован, но не имеет необходимых прав.

## 9 Обработка ошибок
**200 OK - Запрос успешно выполнен**
**201 Created - Ресурс создан**
**204 No Content - Операция выполнена без тела ответа**
**401 Unauthorized - Необходима аутентификация**
**403 Forbidden - Недостаточно прав**
**404 Not Found - Ресурс или маршрут не найден**
**409 Conflict - Конфликт, например повторная регистрация**
**500 Internal Server Error - Внутренняя ошибка сервера**

## 10 стирование 
Запуск всех тестов:
npm test

Тесты охватывают проверку доступа, работу JWT и бизнес-логику заявок.

## 11 Мониторинг
Prometheus
Конфигурация находится в:

prometheus/prometheus.yml
Prometheus собирает метрики с приложения. Интерфейс доступен по адресу:

http://localhost:9090
Grafana
Конфигурации и экспортированные дашборды расположены в:
grafana/
├── alerting/
│   └── alert-rules.yaml
├── dashboards/
└── provisioning/
    ├── dashboards/
    └── datasources

Интерфейс:
http://localhost:3001
В проект включены дашборды мониторинга сервиса и технического обслуживания, а также правило оповещения Maintenance API Down.

## 12 Остановка и обслуживание
Остановка контейнеров:
docker compose down

Повторная сборка и запуск:
docker compose up -d --build

Просмотр состояния:
docker compose ps

Просмотр логов API:
docker compose logs --tail=100 api

Перед обновлением проекта рекомендуется сохранить необходимые данные базы и проверить изменения конфигурации.

## 13 Итог

Maintenance Service API — серверное приложение для управления техническим обслуживанием оборудования. Проект объединяет REST API, реляционную базу данных, аутентификацию и ролевой доступ, автоматизированные тесты, контейнеризацию и инструменты мониторинга.

Исходный код, конфигурации инфраструктуры, Postman-коллекции и файлы Grafana хранятся в репозитории проекта.